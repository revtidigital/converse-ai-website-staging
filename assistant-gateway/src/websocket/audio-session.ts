import type { AudioFormat } from "../contracts/audio-events.js";
import type { AudioLimits } from "../security/audio-limits.js";

export class AudioSessionState {
  requestId: string | null = null;
  format: AudioFormat | null = null;
  startedAt = 0;
  bytesReceived = 0;
  ended = false;
  cancelled = false;

  start(requestId: string, format: AudioFormat): void {
    if (this.requestId && !this.ended && !this.cancelled) throw new Error("audio_request_active");
    this.requestId = requestId;
    this.format = format;
    this.startedAt = Date.now();
    this.bytesReceived = 0;
    this.ended = false;
    this.cancelled = false;
  }

  assertActive(limits: AudioLimits): string {
    if (!this.requestId || this.ended || this.cancelled) throw new Error("audio_not_active");
    if (Date.now() - this.startedAt > limits.maxAudioDurationMs) throw new Error("audio_duration_exceeded");
    return this.requestId;
  }

  addBytes(count: number, limits: AudioLimits): void {
    const requestId = this.assertActive(limits);
    this.bytesReceived += count;
    if (this.bytesReceived > limits.maxAudioRequestBytes) {
      this.cancel();
      throw new Error(`audio_request_too_large:${requestId}`);
    }
  }

  end(requestId: string): void {
    if (this.requestId !== requestId || this.cancelled) throw new Error("audio_not_active");
    this.ended = true;
  }

  cancel(): void {
    this.cancelled = true;
    this.ended = true;
  }

  clear(): void {
    this.requestId = null;
    this.format = null;
    this.startedAt = 0;
    this.bytesReceived = 0;
    this.ended = false;
    this.cancelled = false;
  }
}
