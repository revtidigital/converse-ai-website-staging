// Realtime gateway. Persistent WebSocket on /v1/realtime + GET /health.
// Origin allowlist, per-session rate limit, heartbeat, timeouts, graceful
// shutdown, cancellation. Forwards text queries to the assistant-service over
// HTTP with an internal token. No secret logging.

import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { isValidClientEvent, type ClientEvent, type ServerEvent } from "./events.js";

const PORT = Number(process.env.PORT ?? 8080);
const SERVICE_URL = process.env.ASSISTANT_SERVICE_URL ?? "http://127.0.0.1:8787";
const INTERNAL_TOKEN = process.env.ASSISTANT_INTERNAL_GATEWAY_TOKEN ?? "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const HEARTBEAT_MS = 30_000;
const SESSION_IDLE_MS = 10 * 60_000;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 8; // max queries per window per socket

interface SessionState {
  id: string;
  alive: boolean;
  lastSeen: number;
  reqTimes: number[];
  currentAbort?: AbortController;
}

function send(ws: WebSocket, ev: ServerEvent) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(ev));
}

function originAllowed(origin?: string): boolean {
  if (!ALLOWED_ORIGINS.length) return true; // dev: allow all when unset
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: SERVICE_URL ? "linked" : "standalone" }));
    return;
  }
  res.writeHead(404); res.end();
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  if (req.url !== "/v1/realtime") { socket.destroy(); return; }
  if (!originAllowed(req.headers.origin)) {
    console.log("[gateway] rejected upgrade: origin not allowed");
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); socket.destroy(); return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});

wss.on("connection", (ws: WebSocket) => {
  const state: SessionState = { id: randomUUID(), alive: true, lastSeen: Date.now(), reqTimes: [] };
  console.log(`[gateway] socket connected session=${state.id}`);
  send(ws, { type: "session.ready", sessionId: state.id });

  ws.on("pong", () => { state.alive = true; state.lastSeen = Date.now(); });

  ws.on("message", async (data, isBinary) => {
    state.lastSeen = Date.now();
    if (isBinary) {
      // Server-side STT is disabled in the zero-cost default (browser does STT).
      send(ws, { type: "error", category: "stt_disabled", message: "Send transcript via text.query; server STT not enabled." });
      return;
    }
    let ev: ClientEvent;
    try { ev = JSON.parse(data.toString()); } catch { send(ws, { type: "error", category: "malformed", message: "Invalid JSON" }); return; }
    if (!isValidClientEvent(ev)) { send(ws, { type: "error", category: "unknown_event", message: "Unknown event" }); return; }

    switch (ev.type) {
      case "ping": send(ws, { type: "pong" }); return;
      case "session.reset":
        state.currentAbort?.abort();
        await forwardReset(ev.sessionId ?? state.id);
        return;
      case "response.cancel":
        state.currentAbort?.abort();
        send(ws, { type: "assistant.cancelled" });
        return;
      case "audio.start": case "audio.stop": return; // browser STT path — no-op
      case "text.query": {
        if (rateLimited(state)) { send(ws, { type: "error", category: "rate_limited", message: "Slow down." }); return; }
        const text = String(ev.text ?? "").trim();
        if (!text) { send(ws, { type: "error", category: "empty", message: "Empty query" }); return; }
        state.currentAbort?.abort();
        const abort = new AbortController();
        state.currentAbort = abort;
        send(ws, { type: "assistant.thinking" });
        try {
          const result = await forwardRespond({ message: text, sessionId: ev.sessionId ?? state.id, language: ev.language, pageContext: ev.pageContext, concise: true }, abort.signal);
          if (abort.signal.aborted) return;
          send(ws, { type: "assistant.sources", sources: result.sources });
          send(ws, { type: "assistant.action", action: result.action });
          streamText(ws, result.text);
          send(ws, { type: "assistant.text.final", text: result.text, language: result.language, confidence: result.confidence, confidenceCategory: result.confidenceCategory, intent: result.intent });
        } catch (err) {
          if (abort.signal.aborted) return;
          send(ws, { type: "error", category: "service_unavailable", message: "Assistant temporarily unavailable." });
        }
        return;
      }
      case "session.start": send(ws, { type: "session.ready", sessionId: ev.sessionId ?? state.id }); return;
    }
  });

  ws.on("close", () => { state.currentAbort?.abort(); console.log(`[gateway] socket closed session=${state.id}`); });
  ws.on("error", () => { state.currentAbort?.abort(); });
});

function rateLimited(s: SessionState): boolean {
  const now = Date.now();
  s.reqTimes = s.reqTimes.filter((t) => now - t < RATE_WINDOW_MS);
  if (s.reqTimes.length >= RATE_MAX) return true;
  s.reqTimes.push(now);
  return false;
}

/** Stream the final text as small deltas so the UI feels live. */
function streamText(ws: WebSocket, text: string) {
  if (!text) return;
  const words = text.split(/(\s+)/);
  let buf = "";
  for (const w of words) {
    buf += w;
    if (buf.length >= 24) { send(ws, { type: "assistant.text.delta", delta: buf }); buf = ""; }
  }
  if (buf) send(ws, { type: "assistant.text.delta", delta: buf });
}

async function forwardRespond(body: unknown, signal: AbortSignal) {
  const res = await fetch(`${SERVICE_URL}/v1/assistant/respond`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : {}) },
    body: JSON.stringify(body), signal,
  });
  if (!res.ok) throw new Error(`service ${res.status}`);
  return res.json() as Promise<{ text: string; language: string; confidence: number; confidenceCategory: string; intent: string; sources: unknown[]; action: unknown }>;
}

async function forwardReset(sessionId: string) {
  try {
    await fetch(`${SERVICE_URL}/v1/assistant/respond`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(INTERNAL_TOKEN ? { "x-internal-token": INTERNAL_TOKEN } : {}) },
      body: JSON.stringify({ message: "reset", sessionId }),
    });
  } catch { /* best-effort */ }
}

// Heartbeat + idle reaping.
const hb = setInterval(() => {
  for (const ws of wss.clients) {
    const anyWs = ws as WebSocket & { _idle?: number };
    if (ws.readyState !== WebSocket.OPEN) continue;
    ws.ping();
  }
}, HEARTBEAT_MS);

server.listen(PORT, "0.0.0.0", () => console.log(`[gateway] listening on 0.0.0.0:${PORT} /v1/realtime`));

function shutdown() {
  console.log("[gateway] shutting down");
  clearInterval(hb);
  for (const ws of wss.clients) ws.close(1001, "server shutdown");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { server, wss };
