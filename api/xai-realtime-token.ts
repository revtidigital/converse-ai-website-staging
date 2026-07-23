import type { VercelRequest, VercelResponse } from "@vercel/node";

const XAI_CLIENT_SECRET_URL = "https://api.x.ai/v1/realtime/client_secrets";
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const isDevelopment = process.env.NODE_ENV !== "production";

function logTokenDiagnostic(event: Record<string, string | number | boolean>) {
  if (isDevelopment) console.info("[xai-token]", event);
}

type TokenSuccess = { token: string; expiresAt: number };
type SafeError = { error: string };

type RateEntry = { count: number; resetAt: number };
const rateStore = new Map<string, RateEntry>();

function send(res: VercelResponse, status: number, body: TokenSuccess | SafeError) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function getClientId(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (ip || req.socket.remoteAddress || "unknown").trim();
}

function isAllowedOrigin(req: VercelRequest): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = (process.env.XAI_TOKEN_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const host = req.headers.host;
  const sameOrigin = host ? origin === `https://${host}` || origin === `http://${host}` : false;
  return sameOrigin || allowed.includes(origin);
}

function isRateLimited(req: VercelRequest): boolean {
  const now = Date.now();
  const key = getClientId(req);
  const entry = rateStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function hasMalformedBody(req: VercelRequest): boolean {
  const length = req.headers["content-length"];
  if (length && Number(length) > MAX_BODY_BYTES) return true;
  if (req.body == null || (typeof req.body === "object" && Object.keys(req.body).length === 0)) return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed." });
  }
  if (!isAllowedOrigin(req)) return send(res, 403, { error: "Request origin is not allowed." });
  if (hasMalformedBody(req)) return send(res, 400, { error: "Malformed request." });
  if (isRateLimited(req)) return send(res, 429, { error: "Too many requests. Please try again shortly." });

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return send(res, 503, { error: "Voice service is not configured." });

  const requestStarted = Date.now();
  logTokenDiagnostic({ type: "token_request_started" });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(XAI_CLIENT_SECRET_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expires_after: { seconds: 300 } }),
      signal: controller.signal,
    });
    if (!upstream.ok) {
      logTokenDiagnostic({ type: "token_request_finished", durationMs: Date.now() - requestStarted, status: upstream.status, ok: false, category: "provider_non_2xx" });
      return send(res, 502, { error: "Voice token request failed." });
    }
    const data: unknown = await upstream.json().catch(() => null);
    if (!data || typeof data !== "object") return send(res, 502, { error: "Voice token response was invalid." });
    const value = (data as { value?: unknown }).value;
    const expiresAt = (data as { expires_at?: unknown }).expires_at;
    if (typeof value !== "string" || value.length < 10 || typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
      return send(res, 502, { error: "Voice token response was invalid." });
    }
    logTokenDiagnostic({ type: "token_request_finished", durationMs: Date.now() - requestStarted, status: upstream.status, ok: true });
    return send(res, 200, { token: value, expiresAt });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    const message = timedOut ? "Voice token request timed out." : "Voice token request failed.";
    logTokenDiagnostic({ type: "token_request_failed", durationMs: Date.now() - requestStarted, category: timedOut ? "timeout" : "request_failed" });
    return send(res, 504, { error: message });
  } finally {
    clearTimeout(timeout);
  }
}
