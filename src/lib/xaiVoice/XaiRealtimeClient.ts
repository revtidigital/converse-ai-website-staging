import { logXaiVoiceDiagnostic, categorizeClose } from "./diagnostics";
import { XAI_REALTIME_URL, XAI_SESSION_UPDATE, type TokenErrorResponse, type XaiClientCallbacks, type XaiRealtimeEvent, type XaiTokenErrorCode, type TokenResponse } from "./types";

const CONNECT_TIMEOUT_MS = 10_000;
const MAX_RECONNECTS = 2;
const BACKOFF_MS = 700;
const NON_RETRYABLE_TOKEN_CODES = new Set<XaiTokenErrorCode>(["XAI_NOT_CONFIGURED", "XAI_INVALID_API_KEY", "XAI_PERMISSION_DENIED", "XAI_REQUEST_REJECTED", "XAI_INVALID_TOKEN_RESPONSE", "XAI_ORIGIN_REJECTED", "XAI_REQUEST_MALFORMED"]);

class TokenRequestError extends Error {
  constructor(message: string, public code?: XaiTokenErrorCode, public retryable = true, public retryAfterSeconds?: number, public diagnosticId?: string) {
    super(message);
    this.name = "TokenRequestError";
  }
}
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
  private tokenController: AbortController | null = null;

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
    this.tokenController?.abort();
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
    logXaiVoiceDiagnostic({ type: "token_request_started" });
    let response: Response;
    try {
      response = await fetch(TOKEN_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal });
    } catch (error) {
      const code: XaiTokenErrorCode = error instanceof Error && error.name === "AbortError" ? "XAI_TOKEN_TIMEOUT" : "XAI_TOKEN_NETWORK_ERROR";
      logXaiVoiceDiagnostic({ type: "token_request_failed", durationMs: Math.round(performance.now() - started), category: "endpoint_request_failed", code, retryable: true });
      throw new TokenRequestError(this.messageForCode(code), code, true);
    }
    const data = await response.json().catch(() => null) as TokenResponse | TokenErrorResponse | null;
    const errorData = data as TokenErrorResponse | null;
    logXaiVoiceDiagnostic({ type: "token_request_finished", durationMs: Math.round(performance.now() - started), status: response.status, ok: response.ok, code: errorData?.code, retryable: errorData?.retryable, diagnosticId: errorData?.diagnosticId });
    if (!response.ok) {
      const code = errorData?.code ?? (response.status === 429 ? "XAI_RATE_LIMITED" : "XAI_TOKEN_NETWORK_ERROR");
      const retryable = typeof errorData?.retryable === "boolean" ? errorData.retryable : !NON_RETRYABLE_TOKEN_CODES.has(code);
      throw new TokenRequestError(this.messageForCode(code), code, retryable, errorData?.retryAfterSeconds, errorData?.diagnosticId);
    }
    const success = data as TokenResponse | null;
    if (!success || typeof success.token !== "string" || typeof success.expiresAt !== "number") {
      throw new TokenRequestError(this.messageForCode("XAI_INVALID_TOKEN_RESPONSE"), "XAI_INVALID_TOKEN_RESPONSE", false, undefined, errorData?.diagnosticId);
    }
    return success;
  }

  private async openNewSocket(generation: number) {
    this.callbacks.onState?.(this.reconnects ? "reconnecting" : "connecting");
    logXaiVoiceDiagnostic({ type: "websocket_connecting", url: XAI_REALTIME_URL });
    const controller = new AbortController();
    this.tokenController = controller;
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
    } catch (error) {
      const tokenError = error instanceof TokenRequestError ? error : new TokenRequestError("Voice token request failed.", "XAI_TOKEN_NETWORK_ERROR", true);
      logXaiVoiceDiagnostic({ type: "token_request_failed", category: "token_fetch_failed", code: tokenError.code, retryable: tokenError.retryable, diagnosticId: tokenError.diagnosticId });
      if (!tokenError.retryable || (tokenError.code && NON_RETRYABLE_TOKEN_CODES.has(tokenError.code))) {
        this.clearTimers();
        logXaiVoiceDiagnostic({ type: "final_failure", category: "non_retryable_token_error", code: tokenError.code, diagnosticId: tokenError.diagnosticId });
        this.callbacks.onError?.(tokenError.message);
        return;
      }
      this.scheduleReconnect(generation, tokenError.message, tokenError.retryAfterSeconds ? tokenError.retryAfterSeconds * 1000 : undefined, tokenError.code, tokenError.diagnosticId);
    } finally {
      clearTimeout(timeout);
      if (this.tokenController === controller) this.tokenController = null;
      this.connecting = false;
    }
  }

  private attach(ws: WebSocket, generation: number) {
    ws.addEventListener("open", () => {
      if (generation !== this.generation) return;
      logXaiVoiceDiagnostic({ type: "websocket_open" });
      this.clearConnectTimer();
      this.callbacks.onState?.("configuring");
      ws.send(JSON.stringify(XAI_SESSION_UPDATE));
    });
    ws.addEventListener("message", (message) => {
      if (generation !== this.generation || typeof message.data !== "string") return;
      let event: XaiRealtimeEvent;
      try { event = JSON.parse(message.data) as XaiRealtimeEvent; } catch { return; }
      if (!event || typeof event.type !== "string") return;
      if (event.type === "session.created") logXaiVoiceDiagnostic({ type: "session_created" });
      if (event.type === "conversation.created") logXaiVoiceDiagnostic({ type: "conversation_created" });
      if (event.type === "session.updated") {
        this.sessionReady = true;
        this.reconnects = 0;
        logXaiVoiceDiagnostic({ type: "session_updated" });
        this.callbacks.onState?.("open");
      }
      if (event.type === "error") this.callbacks.onError?.("The voice provider returned an error.");
      this.callbacks.onEvent?.(event);
    });
    ws.addEventListener("error", () => { if (generation === this.generation) this.callbacks.onError?.("Voice connection error."); });
    ws.addEventListener("close", (event) => {
      if (generation !== this.generation) return;
      logXaiVoiceDiagnostic({ type: "websocket_close", code: event.code, category: categorizeClose(event.code) });
      this.cleanupSocket();
      if (!this.explicitStop) this.scheduleReconnect(generation, "Voice connection closed.");
    });
  }

  private scheduleReconnect(generation: number, message: string, delayMs?: number, code?: string, diagnosticId?: string) {
    if (this.explicitStop || generation !== this.generation) return;
    this.clearTimers();
    if (this.reconnects >= MAX_RECONNECTS) { logXaiVoiceDiagnostic({ type: "final_failure", category: "reconnect_exhausted", code, diagnosticId }); this.callbacks.onError?.(message || "Voice reconnect attempts were exhausted."); return; }
    this.reconnects += 1;
    const nextDelay = delayMs ?? BACKOFF_MS * this.reconnects;
    this.callbacks.onReconnectAttempt?.(this.reconnects);
    logXaiVoiceDiagnostic({ type: "reconnect_decision", attempt: this.reconnects, retryable: true, code, diagnosticId, delayMs: nextDelay, category: "scheduled" });
    logXaiVoiceDiagnostic({ type: "reconnect_attempt", attempt: this.reconnects });
    this.callbacks.onState?.("reconnecting");
    this.reconnectTimer = window.setTimeout(() => void this.openNewSocket(generation), nextDelay);
  }

  private messageForCode(code?: XaiTokenErrorCode) {
    switch (code) {
      case "XAI_NOT_CONFIGURED": return "Voice service is not configured.";
      case "XAI_INVALID_API_KEY": return "Voice service authentication is not configured correctly.";
      case "XAI_PERMISSION_DENIED": return "Voice service does not have the required permissions.";
      case "XAI_RATE_LIMITED": return "Voice service is temporarily busy. Please try again shortly.";
      case "XAI_UPSTREAM_UNAVAILABLE": return "Voice service is temporarily unavailable.";
      case "XAI_TOKEN_TIMEOUT": return "Voice service took too long to respond.";
      case "XAI_REQUEST_REJECTED":
      case "XAI_INVALID_TOKEN_RESPONSE": return "Voice service authentication failed.";
      default: return "Voice service is temporarily unavailable.";
    }
  }

  private cleanupSocket() { this.sessionReady = false; this.socket?.close(); this.socket = null; }
  private clearConnectTimer() { if (this.connectTimer) window.clearTimeout(this.connectTimer); this.connectTimer = null; }
  private clearTimers() { this.clearConnectTimer(); if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
}
