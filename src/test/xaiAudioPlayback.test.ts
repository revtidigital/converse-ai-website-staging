import { describe, expect, it, vi } from "vitest";
import { XaiAudioPlayback } from "@/lib/voice/xai/audioPlayback";
import { arrayBufferToBase64, floatToPcm16 } from "@/lib/voice/xai/pcm";

class MockSource {
  buffer: AudioBuffer | null = null;
  onended: (() => void) | null = null;
  stopped = false;
  connect = vi.fn();
  start = vi.fn(() => this.onended?.());
  stop = vi.fn(() => { this.stopped = true; });
}
class MockAudioContext {
  currentTime = 0;
  destination = {} as AudioDestinationNode;
  state: AudioContextState = "running";
  sources: MockSource[] = [];
  createBuffer(_channels: number, length: number, sampleRate: number) {
    const data = new Float32Array(length);
    return { duration: length / sampleRate, getChannelData: () => data } as AudioBuffer;
  }
  createBufferSource() { const source = new MockSource(); this.sources.push(source); return source as unknown as AudioBufferSourceNode; }
  resume = vi.fn(async () => undefined);
  close = vi.fn(async () => { this.state = "closed"; });
}

describe("XaiAudioPlayback", () => {
  it("queues audio in order and supports interruption", () => {
    const ctx = new MockAudioContext();
    const playback = new XaiAudioPlayback(() => ctx as unknown as AudioContext);
    const events: string[] = [];
    playback.on((event) => events.push(event));
    const audio = arrayBufferToBase64(floatToPcm16(new Float32Array([0.1, 0.2, 0.3])));

    playback.enqueueBase64Pcm16(audio);
    playback.enqueueBase64Pcm16(audio);
    expect(ctx.sources).toHaveLength(2);
    playback.interrupt();
    expect(ctx.sources.every((source) => source.stopped)).toBe(true);
    expect(events).toContain("started");
  });
});
