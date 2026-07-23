import { describe, expect, it, vi } from "vitest";
import { startXaiAudioCapture } from "@/lib/voice/xai/audioCapture";

class MockTrack { stop = vi.fn(); }
class MockStream { track = new MockTrack(); getTracks() { return [this.track]; } }
class MockSource { connect = vi.fn(); disconnect = vi.fn(); }
class MockScriptNode {
  onaudioprocess: ((event: { inputBuffer: { getChannelData: () => Float32Array } }) => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
}
class MockAudioContext {
  sampleRate = 48000;
  state: AudioContextState = "running";
  destination = {} as AudioDestinationNode;
  source = new MockSource();
  script = new MockScriptNode();
  createMediaStreamSource = vi.fn(() => this.source);
  createScriptProcessor = vi.fn(() => this.script);
  resume = vi.fn(async () => undefined);
  close = vi.fn(async () => { this.state = "closed"; });
}

describe("xAI audio capture", () => {
  it("requests echo-cancelled microphone audio, emits PCM chunks, and cleans up tracks", async () => {
    const stream = new MockStream();
    const mediaDevices = { getUserMedia: vi.fn(async () => stream as unknown as MediaStream) } as unknown as MediaDevices;
    const ctx = new MockAudioContext();
    const chunks: string[] = [];
    const controller = await startXaiAudioCapture({
      mediaDevices,
      audioContextFactory: () => ctx as unknown as AudioContext,
      silenceThreshold: 0,
      chunkMs: 10,
      onChunk: (chunk) => chunks.push(chunk),
    });

    expect(mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    ctx.script.onaudioprocess?.({ inputBuffer: { getChannelData: () => new Float32Array(960).fill(0.2) } });
    expect(chunks.length).toBeGreaterThan(0);
    await controller.stop();
    expect(stream.track.stop).toHaveBeenCalled();
    expect(ctx.close).toHaveBeenCalled();
  });
});
