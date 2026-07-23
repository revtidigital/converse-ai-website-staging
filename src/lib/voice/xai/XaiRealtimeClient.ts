import { XAI_REALTIME_URL, type XaiConnectionState, type XaiRealtimeClientEvent, type XaiRealtimeClientListener, type XaiRealtimeClientOptions, type XaiRealtimeTokenResponse } from "./types";

export class XaiRealtimeClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<XaiRealtimeClientListener>();
  private reconnectAttempts = 0;
  private explicitClose = false;
  private token: XaiRealtimeTokenResponse | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly url: string;
  private readonly tokenEndpoint: string;
  private readonly connectTimeoutMs: number;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectBaseDelayMs: number;
  private readonly WebSocketCtor: typeof WebSocket;

  constructor(options: XaiRealtimeClientOptions = {}) {
    this.url = options.url ?? XAI_REALTIME_URL;
    this.tokenEndpoint = options.tokenEndpoint ?? "/api/xai-realtime-token";
    this.connectTimeoutMs = options.connectTimeoutMs ?? 10_000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 3;
    this.reconnectBaseDelayMs = options.reconnectBaseDelayMs ?? 500;
    this.WebSocketCtor = options.WebSocketCtor ?? WebSocket;
  }

  on(listener: XaiRealtimeClientListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connect() {
    if (this.ws && [WebSocket.CONNECTING, WebSocket.OPEN].includes(this.ws.readyState)) return;
    this.explicitClose = false;
    this.emit({ type: "status", state: this.reconnectAttempts ? "reconnecting" : "connecting" });
    this.token = await this.fetchToken();
    await this.openSocket();
  }

  disconnect() {
    this.explicitClose = true;
    this.clearTimers();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.emit({ type: "status", state: "closed" });
  }

  sendAudio(base64Pcm16: string) {
    this.send({ type: "input_audio_buffer.append", audio: base64Pcm16 });
  }

  commitAudio() {
    this.send({ type: "input_audio_buffer.commit" });
  }

  cancelResponse() {
    this.send({ type: "response.cancel" });
  }

  cleanup() {
    this.disconnect();
    this.listeners.clear();
  }

  private async fetchToken(): Promise<XaiRealtimeTokenResponse> {
    const res = await fetch(this.tokenEndpoint, { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error("Voice service token unavailable");
    const data = await res.json() as XaiRealtimeTokenResponse;
    if (!data.token || !data.expiresAt) throw new Error("Voice service token invalid");
    return data;
  }

  private openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = this.token?.token;
      if (!token) {
        reject(new Error("Missing xAI client secret"));
        return;
      }
      const ws = new this.WebSocketCtor(this.url, [`xai-client-secret.${token}`]);
      this.ws = ws;
      this.connectTimer = setTimeout(() => {
        this.emit({ type: "error", error: "Voice service connection timed out" });
        try { ws.close(); } catch { /* noop */ }
        reject(new Error("xAI realtime connection timed out"));
      }, this.connectTimeoutMs);

      ws.onopen = () => {
        this.clearConnectTimer();
        this.reconnectAttempts = 0;
        this.emit({ type: "status", state: "open" });
        resolve();
      };
      ws.onmessage = (event) => this.handleMessage(event.data);
      ws.onerror = () => this.emit({ type: "error", error: "Voice service connection error" });
      ws.onclose = () => {
        this.clearConnectTimer();
        this.ws = null;
        if (this.explicitClose) return;
        void this.scheduleReconnect();
      };
    });
  }

  private async scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit({ type: "status", state: "error" });
      this.emit({ type: "error", error: "Voice service unavailable" });
      return;
    }
    this.reconnectAttempts += 1;
    this.emit({ type: "status", state: "reconnecting" });
    const delay = this.reconnectBaseDelayMs * 2 ** (this.reconnectAttempts - 1);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => this.emit({ type: "error", error: error instanceof Error ? error.message : "Reconnect failed" }));
    }, delay);
  }

  private send(payload: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }

  private handleMessage(raw: unknown) {
    let event: { type?: string; delta?: string; audio?: string; transcript?: string; error?: { message?: string } };
    try {
      event = JSON.parse(String(raw));
    } catch {
      return;
    }
    const type = event.type ?? "";
    if (type.includes("error")) this.emit({ type: "error", error: event.error?.message ?? "Voice service error" });
    if (type.includes("response.audio.delta") || type === "response.output_audio.delta") this.emit({ type: "output_audio_delta", audio: event.delta ?? event.audio ?? "" });
    if (type.includes("response.audio_transcript.delta") || type.includes("response.text.delta")) this.emit({ type: "response_transcript_delta", delta: event.delta ?? "" });
    if (type.includes("input_audio_transcription") || type.includes("conversation.item.input_audio_transcription.completed")) this.emit({ type: "input_transcript", transcript: event.transcript ?? event.delta ?? "" });
    if (type.includes("response.done") || type.includes("response.completed")) this.emit({ type: "response_done" });
  }

  private emit(event: XaiRealtimeClientEvent) {
    for (const listener of this.listeners) listener(event);
  }

  private clearConnectTimer() {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
  }

  private clearTimers() {
    this.clearConnectTimer();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
