import type { VercelRequest, VercelResponse } from "@vercel/node";

const XAI_CLIENT_SECRET_URL = "https://api.x.ai/v1/realtime/client_secrets";
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

type TokenSuccess = { token: string; expiresAt: number };
type SafeErrorCode =
  | "XAI_NOT_CONFIGURED"
  | "XAI_REQUEST_REJECTED"
  | "XAI_INVALID_API_KEY"
  | "XAI_PERMISSION_DENIED"
  | "XAI_RATE_LIMITED"
  | "XAI_UPSTREAM_UNAVAILABLE"
  | "XAI_INVALID_TOKEN_RESPONSE"
  | "XAI_TOKEN_TIMEOUT"
  | "XAI_TOKEN_NETWORK_ERROR"
  | "XAI_ORIGIN_REJECTED"
  | "XAI_REQUEST_MALFORMED"
  | "XAI_RATE_LIMITED_LOCAL";
type SafeError = { error: string; code: SafeErrorCode; retryable: boolean; diagnosticId: string; retryAfterSeconds?: number };
type RateEntry = { count: number; resetAt: number };

const rateStore = new Map<string, RateEntry>();

function diagnosticId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `xai_${Date.now().toString(36)}_${random}`;
}

function logTokenDiagnostic(event: Record<string, string | number | boolean | undefined>) {
  console.info("[xai-token]", event);
}

function send(res: VercelResponse, status: number, body: TokenSuccess | SafeError) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function safeError(code: SafeErrorCode, diagnosticIdValue: string, retryable: boolean, retryAfterSeconds?: number): SafeError {
  const messages: Record<SafeErrorCode, string> = {
    XAI_NOT_CONFIGURED: "Voice service is not configured.",
    XAI_REQUEST_REJECTED: "Voice service authentication failed.",
    XAI_INVALID_API_KEY: "Voice service authentication failed.",
    XAI_PERMISSION_DENIED: "Voice service authentication failed.",
    XAI_RATE_LIMITED: "Voice service is temporarily busy. Please try again shortly.",
    XAI_UPSTREAM_UNAVAILABLE: "Voice service is temporarily unavailable.",
    XAI_INVALID_TOKEN_RESPONSE: "Voice service authentication failed.",
    XAI_TOKEN_TIMEOUT: "Voice service took too long to respond.",
    XAI_TOKEN_NETWORK_ERROR: "Voice service is temporarily unavailable.",
    XAI_ORIGIN_REJECTED: "Request origin is not allowed.",
    XAI_REQUEST_MALFORMED: "Malformed request.",
    XAI_RATE_LIMITED_LOCAL: "Too many requests. Please try again shortly.",
  };
  return { error: messages[code], code, retryable, diagnosticId: diagnosticIdValue, ...(retryAfterSeconds ? { retryAfterSeconds } : {}) };
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

function classifyUpstreamStatus(status: number): { code: SafeErrorCode; retryable: boolean; httpStatus: number } {
  if (status === 400) return { code: "XAI_REQUEST_REJECTED", retryable: false, httpStatus: 502 };
  if (status === 401) return { code: "XAI_INVALID_API_KEY", retryable: false, httpStatus: 502 };
  if (status === 403) return { code: "XAI_PERMISSION_DENIED", retryable: false, httpStatus: 502 };
  if (status === 429) return { code: "XAI_RATE_LIMITED", retryable: true, httpStatus: 429 };
  if (status >= 500 && status <= 599) return { code: "XAI_UPSTREAM_UNAVAILABLE", retryable: true, httpStatus: 502 };
  return { code: "XAI_REQUEST_REJECTED", retryable: false, httpStatus: 502 };
}

function safeRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(Math.ceil(seconds), 60);
  const dateMs = Date.parse(value);
  if (Number.isFinite(dateMs)) return Math.min(Math.max(Math.ceil((dateMs - Date.now()) / 1000), 1), 60);
  return undefined;
}

function extractProviderMetadata(text: string): { providerErrorCode?: string; providerErrorType?: string } {
  try {
    const parsed = JSON.parse(text) as { error?: { code?: unknown; type?: unknown } | string; code?: unknown; type?: unknown };
    const errorObject = typeof parsed.error === "object" && parsed.error ? parsed.error : parsed;
    return {
      providerErrorCode: typeof errorObject.code === "string" ? errorObject.code.slice(0, 80) : undefined,
      providerErrorType: typeof errorObject.type === "string" ? errorObject.type.slice(0, 80) : undefined,
    };
  } catch {
    return {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = diagnosticId();
  const started = Date.now();
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed.", code: "XAI_REQUEST_MALFORMED", retryable: false, diagnosticId: id });
  }
  if (!isAllowedOrigin(req)) return send(res, 403, safeError("XAI_ORIGIN_REJECTED", id, false));
  if (hasMalformedBody(req)) return send(res, 400, safeError("XAI_REQUEST_MALFORMED", id, false));
  if (isRateLimited(req)) return send(res, 429, safeError("XAI_RATE_LIMITED_LOCAL", id, true));

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    logTokenDiagnostic({ type: "token_request_failed", diagnosticId: id, category: "missing_configuration", environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown", durationMs: Date.now() - started });
    return send(res, 503, safeError("XAI_NOT_CONFIGURED", id, false));
  }

  logTokenDiagnostic({ type: "token_request_started", diagnosticId: id });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(XAI_CLIENT_SECRET_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expires_after: { seconds: 300 } }),
      signal: controller.signal,
    });
    const providerRequestId = upstream.headers.get("x-request-id") || upstream.headers.get("x-xai-request-id") || upstream.headers.get("cf-ray") || undefined;
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      const metadata = extractProviderMetadata(text.slice(0, 4096));
      const classified = classifyUpstreamStatus(upstream.status);
      const retryAfterSeconds = upstream.status === 429 ? safeRetryAfter(upstream.headers.get("retry-after")) : undefined;
      logTokenDiagnostic({ type: "token_request_finished", diagnosticId: id, durationMs: Date.now() - started, upstreamStatus: upstream.status, providerRequestId, providerErrorCode: metadata.providerErrorCode, providerErrorType: metadata.providerErrorType, retryable: classified.retryable, category: classified.code });
      return send(res, classified.httpStatus, safeError(classified.code, id, classified.retryable, retryAfterSeconds));
    }
    const data: unknown = await upstream.json().catch(() => null);
    if (!data || typeof data !== "object") {
      logTokenDiagnostic({ type: "token_request_finished", diagnosticId: id, durationMs: Date.now() - started, upstreamStatus: upstream.status, providerRequestId, retryable: false, category: "XAI_INVALID_TOKEN_RESPONSE" });
      return send(res, 502, safeError("XAI_INVALID_TOKEN_RESPONSE", id, false));
    }
    const value = (data as { value?: unknown }).value;
    const expiresAt = (data as { expires_at?: unknown }).expires_at;
    if (typeof value !== "string" || value.length < 10 || typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
      logTokenDiagnostic({ type: "token_request_finished", diagnosticId: id, durationMs: Date.now() - started, upstreamStatus: upstream.status, providerRequestId, retryable: false, category: "XAI_INVALID_TOKEN_RESPONSE" });
      return send(res, 502, safeError("XAI_INVALID_TOKEN_RESPONSE", id, false));
    }
    logTokenDiagnostic({ type: "token_request_finished", diagnosticId: id, durationMs: Date.now() - started, upstreamStatus: upstream.status, ok: true, providerRequestId });
    return send(res, 200, { token: value, expiresAt });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError" || error instanceof DOMException && error.name === "AbortError";
    const code = timedOut ? "XAI_TOKEN_TIMEOUT" : "XAI_TOKEN_NETWORK_ERROR";
    logTokenDiagnostic({ type: "token_request_failed", diagnosticId: id, durationMs: Date.now() - started, category: code, retryable: true });
    return send(res, timedOut ? 504 : 502, safeError(code, id, true));
  } finally {
    clearTimeout(timeout);
  }
}
