import { base64ToArrayBuffer, pcm16LittleEndianToFloat } from "./pcm";
import { XAI_AUDIO_RATE } from "./types";

export class AudioPlayback {
  private context: AudioContext | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private nextTime = 0;
  private generation = 0;
  private pending = 0;
  private drained?: () => void;

  get queueLength() { return this.pending; }

  async enqueue(base64: string, generation: number) {
    if (generation !== this.generation) return;
    if (!this.context) this.context = new AudioContext({ sampleRate: XAI_AUDIO_RATE });
    if (this.context.state === "suspended") await this.context.resume();
    const floats = pcm16LittleEndianToFloat(base64ToArrayBuffer(base64));
    const buffer = this.context.createBuffer(1, floats.length, XAI_AUDIO_RATE);
    buffer.copyToChannel(floats, 0);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    const startAt = Math.max(this.context.currentTime + 0.02, this.nextTime);
    this.nextTime = startAt + buffer.duration;
    this.pending += 1;
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      if (generation !== this.generation) return;
      this.pending = Math.max(0, this.pending - 1);
      if (this.pending === 0) this.drained?.();
    };
    source.start(startAt);
  }

  onDrained(callback: () => void) { this.drained = callback; }
  newGeneration() { this.generation += 1; this.pending = 0; this.nextTime = this.context?.currentTime ?? 0; return this.generation; }
  interrupt() { this.generation += 1; this.pending = 0; this.nextTime = this.context?.currentTime ?? 0; this.sources.forEach((s) => { try { s.stop(); } catch { /* noop */ } }); this.sources.clear(); }
  async close() { this.interrupt(); if (this.context && this.context.state !== "closed") await this.context.close().catch(() => undefined); this.context = null; }
}
