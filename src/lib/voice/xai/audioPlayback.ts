import { base64ToArrayBuffer, pcm16ToFloat32 } from "./pcm";
import { XAI_OUTPUT_SAMPLE_RATE, type AudioPlaybackEvent, type AudioPlaybackListener } from "./types";

export class XaiAudioPlayback {
  private ctx: AudioContext | null = null;
  private playhead = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private listeners = new Set<AudioPlaybackListener>();
  private started = false;

  constructor(private readonly audioContextFactory?: () => AudioContext) {}

  on(listener: AudioPlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  enqueueBase64Pcm16(base64Pcm16: string, sampleRate = XAI_OUTPUT_SAMPLE_RATE) {
    if (!base64Pcm16) return;
    const ctx = this.context();
    const samples = pcm16ToFloat32(base64ToArrayBuffer(base64Pcm16));
    if (!samples.length) return;
    const buffer = ctx.createBuffer(1, samples.length, sampleRate);
    buffer.getChannelData(0).set(samples);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime + 0.02, this.playhead || 0);
    source.start(startAt);
    this.playhead = startAt + buffer.duration;
    this.sources.add(source);
    if (!this.started) {
      this.started = true;
      this.emit("started");
    }
    source.onended = () => {
      this.sources.delete(source);
      if (!this.sources.size) {
        this.started = false;
        this.emit("ended");
      }
    };
  }

  interrupt() {
    for (const source of this.sources) {
      try {
        source.onended = null;
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.playhead = 0;
    if (this.started) {
      this.started = false;
      this.emit("interrupted");
    }
  }

  async close() {
    this.interrupt();
    if (this.ctx && this.ctx.state !== "closed") await this.ctx.close().catch(() => undefined);
    this.ctx = null;
  }

  private context(): AudioContext {
    if (!this.ctx) {
      if (this.audioContextFactory) this.ctx = this.audioContextFactory();
      else {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) throw new Error("Web Audio is unavailable");
        this.ctx = new Ctor();
      }
    }
    void this.ctx.resume().catch(() => undefined);
    return this.ctx;
  }

  private emit(event: AudioPlaybackEvent) {
    for (const listener of this.listeners) listener(event);
  }
}
