import { EventEmitter } from "node:events";
import type { AudioFormat, PythonVoiceEvent } from "../contracts/audio-events.js";

export class PythonVoiceClient extends EventEmitter {
  private socket: WebSocket | null = null;

  constructor(private readonly baseUrl: string, private readonly token: string | undefined, private readonly timeoutMs: number) {
    super();
  }

  async connect(requestId: string, format: AudioFormat, routeContext?: unknown): Promise<void> {
    const url = this.baseUrl.replace(/^http/i, "ws").replace(/\/+$/, "") + "/v1/assistant/voice";
    const socket = new WebSocket(url, this.token ? ["gateway-token", this.token] : undefined);
    this.socket = socket;
    const timer = setTimeout(() => socket.close(), this.timeoutMs);
    socket.addEventListener("open", () => {
      clearTimeout(timer);
      socket.send(JSON.stringify({ type: "audio.start", requestId, format, routeContext }));
    });
    socket.addEventListener("message", (message) => {
      if (typeof message.data !== "string") return;
      try { this.emit("event", JSON.parse(message.data) as PythonVoiceEvent); } catch { this.emit("event", { type: "response.error", requestId, code: "VOICE_INVALID_RESPONSE", message: "Invalid voice service response." }); }
    });
    socket.addEventListener("error", () => this.emit("event", { type: "response.error", requestId, code: "VOICE_UNAVAILABLE", message: "Voice service is unavailable." }));
  }

  sendAudio(frame: Buffer): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(frame); }
  end(requestId: string): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type: "audio.end", requestId })); }
  cancel(requestId: string): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type: "audio.cancel", requestId })); this.socket?.close(); }
  close(): void { this.socket?.close(); this.socket = null; }
}
