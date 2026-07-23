import { XAI_REALTIME_URL, XAI_SESSION_UPDATE, type XaiClientCallbacks, type XaiRealtimeEvent, type TokenResponse } from "./types";

const CONNECT_TIMEOUT_MS = 10_000;
const MAX_RECONNECTS = 2;
const BACKOFF_MS = 700;
const TOKEN_ENDPOINT = "/api/xai-realtime-token";

export class XaiRealtimeClient {
  private socket: WebSocket | null = null;
  private generation = 0;
  private reconnectTimer: number | null = null;
  private connectTimer: number | null = null;
  private explicitStop = false;
  private reconnects = 0;
  private connecting = false;
  private sessionReady = false;

  constructor(private callbacks: XaiClientCallbacks = {}) {}

  get isReady() { return Boolean(this.socket && this.socket.readyState === WebSocket.OPEN && this.sessionReady); }
  get bufferedAmount() { return this.socket?.bufferedAmount ?? 0; }

  async connect() {
    if (this.socket || this.connecting) throw new Error("Voice connection is already active.");
    this.explicitStop = false;
    this.connecting = true;
    await this.openNewSocket(++this.generation);
  }

  async stop() {
    this.explicitStop = true;
    this.generation += 1;
    this.clearTimers();
    this.cleanupSocket();
    this.connecting = false;
    this.sessionReady = false;
    this.callbacks.onState?.("closed");
  }

  sendJson(payload: unknown) {
    if (!this.isReady || !this.socket) return false;
    this.socket.send(JSON.stringify(payload));
    return true;
  }

  cancelResponse(responseId?: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(responseId ? { type: "response.cancel", response_id: responseId } : { type: "response.cancel" }));
  }

  private async fetchToken(signal: AbortSignal): Promise<TokenResponse> {
    const started = performance.now();
    const response = await fetch(TOKEN_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal });
    if (import.meta.env.DEV) console.info("[xai-voice] token request duration", Math.round(performance.now() - started));
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || typeof data.token !== "string" || typeof data.expiresAt !== "number") throw new Error("Voice token request failed.");
    return data;
  }

  private async openNewSocket(generation: number) {
    this.callbacks.onState?.(this.reconnects ? "reconnecting" : "connecting");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
    try {
      const { token } = await this.fetchToken(controller.signal);
      if (generation !== this.generation || this.explicitStop) return;
      const ws = new WebSocket(XAI_REALTIME_URL, [`xai-client-secret.${token}`]);
      this.socket = ws;
      this.attach(ws, generation);
      this.connectTimer = window.setTimeout(() => {
        if (generation === this.generation && ws.readyState !== WebSocket.OPEN) {
          this.callbacks.onError?.("Voice connection timed out.");
          ws.close();
        }
      }, CONNECT_TIMEOUT_MS);
    } catch {
      this.scheduleReconnect(generation, "Voice token request failed.");
    } finally {
      clearTimeout(timeout);
      this.connecting = false;
    }
  }

  private attach(ws: WebSocket, generation: number) {
    ws.addEventListener("open", () => {
      if (generation !== this.generation) return;
      if (import.meta.env.DEV) console.info("[xai-voice] websocket open");
      this.clearConnectTimer();
      this.callbacks.onState?.("configuring");
      ws.send(JSON.stringify(XAI_SESSION_UPDATE));
    });
    ws.addEventListener("message", (message) => {
      if (generation !== this.generation || typeof message.data !== "string") return;
      let event: XaiRealtimeEvent;
      try { event = JSON.parse(message.data) as XaiRealtimeEvent; } catch { return; }
      if (!event || typeof event.type !== "string") return;
      if (event.type === "session.created" && import.meta.env.DEV) console.info("[xai-voice] session.created received");
      if (event.type === "session.updated") {
        this.sessionReady = true;
        if (import.meta.env.DEV) console.info("[xai-voice] session.updated received");
        this.callbacks.onState?.("open");
      }
      if (event.type === "error") this.callbacks.onError?.("The voice provider returned an error.");
      this.callbacks.onEvent?.(event);
    });
    ws.addEventListener("error", () => { if (generation === this.generation) this.callbacks.onError?.("Voice connection error."); });
    ws.addEventListener("close", (event) => {
      if (generation !== this.generation) return;
      if (import.meta.env.DEV) console.info("[xai-voice] websocket close", event.code);
      this.cleanupSocket();
      if (!this.explicitStop) this.scheduleReconnect(generation, "Voice connection closed.");
    });
  }

  private scheduleReconnect(generation: number, message: string) {
    if (this.explicitStop || generation !== this.generation) return;
    if (this.reconnects >= MAX_RECONNECTS) { this.callbacks.onError?.("Voice reconnect attempts were exhausted."); return; }
    this.reconnects += 1;
    this.callbacks.onReconnectAttempt?.(this.reconnects);
    this.callbacks.onState?.("reconnecting");
    this.reconnectTimer = window.setTimeout(() => void this.openNewSocket(generation), BACKOFF_MS * this.reconnects);
  }

  private cleanupSocket() { this.sessionReady = false; this.socket?.close(); this.socket = null; }
  private clearConnectTimer() { if (this.connectTimer) window.clearTimeout(this.connectTimer); this.connectTimer = null; }
  private clearTimers() { this.clearConnectTimer(); if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
}
