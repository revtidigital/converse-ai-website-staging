import { createXaiRealtimeSessionConfig } from "./sessionConfig";
import { XAI_REALTIME_URL, type XaiConnectionState, type XaiRealtimeClientEvent, type XaiRealtimeClientListener, type XaiRealtimeClientOptions, type XaiRealtimeSessionConfig, type XaiRealtimeTokenResponse } from "./types";

interface RawRealtimeEvent {
  type?: string;
  delta?: string;
  audio?: string;
  transcript?: string;
  response_id?: string;
  item_id?: string;
  call_id?: string;
  conversation?: { id?: string };
  session?: { id?: string };
  item?: { id?: string; type?: string };
  name?: string;
  arguments?: string;
  error?: { message?: string };
}

export class XaiRealtimeClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<XaiRealtimeClientListener>();
  private reconnectAttempts = 0;
  private explicitClose = false;
  private token: XaiRealtimeTokenResponse | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private conversationId: string | null = null;

  private readonly url: string;
  private readonly tokenEndpoint: string;
  private readonly connectTimeoutMs: number;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectBaseDelayMs: number;
  private readonly WebSocketCtor: typeof WebSocket;
  private readonly sessionConfig: XaiRealtimeSessionConfig;

  constructor(options: XaiRealtimeClientOptions = {}) {
    this.url = options.url ?? XAI_REALTIME_URL;
    this.tokenEndpoint = options.tokenEndpoint ?? "/api/xai-realtime-token";
    this.connectTimeoutMs = options.connectTimeoutMs ?? 10_000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 3;
    this.reconnectBaseDelayMs = options.reconnectBaseDelayMs ?? 500;
    this.WebSocketCtor = options.WebSocketCtor ?? WebSocket;
    this.sessionConfig = options.sessionConfig ?? createXaiRealtimeSessionConfig(options.language, options.tools ?? []);
  }

  on(listener: XaiRealtimeClientListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getConversationId(): string | null {
    return this.conversationId;
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

  sendSessionUpdate() {
    this.send({ type: "session.update", session: this.sessionConfig });
  }

  sendAudio(base64Pcm16: string) {
    this.send({ type: "input_audio_buffer.append", audio: base64Pcm16 });
  }

  clearAudioBuffer() {
    this.send({ type: "input_audio_buffer.clear" });
  }

  commitAudio() {
    this.send({ type: "input_audio_buffer.commit" });
  }

  cancelResponse(responseId?: string) {
    this.send(responseId ? { type: "response.cancel", response_id: responseId } : { type: "response.cancel" });
  }

  sendToolOutput(callId: string, output: unknown) {
    this.send({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(output),
      },
    });
  }

  requestResponseContinuation() {
    this.send({ type: "response.create" });
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

  private realtimeUrl(): string {
    if (!this.conversationId) return this.url;
    const url = new URL(this.url);
    url.searchParams.set("conversation_id", this.conversationId);
    return url.toString();
  }

  private openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = this.token?.token;
      if (!token) {
        reject(new Error("Missing xAI client secret"));
        return;
      }
      const ws = new this.WebSocketCtor(this.realtimeUrl(), [`xai-client-secret.${token}`]);
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
        this.sendSessionUpdate();
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
    let event: RawRealtimeEvent;
    try {
      event = JSON.parse(String(raw));
    } catch {
      return;
    }
    const type = event.type ?? "";
    if (type === "error" || type.endsWith(".error")) this.emit({ type: "error", error: event.error?.message ?? "Voice service error" });
    if (type === "session.updated") this.emit({ type: "session_configured" });
    if (type === "conversation.created") {
      const conversationId = event.conversation?.id ?? event.session?.id;
      if (conversationId) {
        this.conversationId = conversationId;
        this.emit({ type: "conversation_created", conversationId });
      }
    }
    if (type === "input_audio_buffer.speech_started") this.emit({ type: "speech_started", itemId: event.item_id });
    if (type === "input_audio_buffer.speech_stopped") this.emit({ type: "speech_stopped", itemId: event.item_id });
    if (type === "response.created") this.emit({ type: "response_created", responseId: event.response_id ?? "" });
    if (type === "response.output_item.added") this.emit({ type: "response_output_item_added", itemId: event.item?.id ?? event.item_id ?? "", responseId: event.response_id });
    if (type === "response.output_audio.delta") this.emit({ type: "output_audio_delta", audio: event.delta ?? event.audio ?? "", responseId: event.response_id, itemId: event.item_id });
    if (type === "response.output_audio_transcript.delta" || type === "response.output_text.delta" || type === "response.text.delta") this.emit({ type: "response_transcript_delta", delta: event.delta ?? "", responseId: event.response_id, itemId: event.item_id });
    if (type === "conversation.item.input_audio_transcription.updated") this.emit({ type: "input_transcript", transcript: event.transcript ?? event.delta ?? "", itemId: event.item_id, final: false });
    if (type === "conversation.item.input_audio_transcription.completed") this.emit({ type: "input_transcript", transcript: event.transcript ?? event.delta ?? "", itemId: event.item_id, final: true });
    if (type === "response.function_call_arguments.done") this.emit({ type: "function_call_arguments_done", responseId: event.response_id ?? "", callId: event.call_id ?? "", name: event.name ?? "", argumentsJson: event.arguments ?? "{}", itemId: event.item_id });
    if (type === "response.done") this.emit({ type: "response_done", responseId: event.response_id });
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
