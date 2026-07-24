import { describe, expect, it } from "vitest";
import { parseClientEvent } from "../src/contracts/client-events.js";
import { AudioSessionState } from "../src/websocket/audio-session.js";
import { assertAudioFrame } from "../src/security/audio-limits.js";

describe("audio contracts", () => {
  it("accepts canonical audio.start", () => {
    const event = parseClientEvent({ type: "audio.start", requestId: "r1", format: { encoding: "pcm_s16le", sampleRate: 16000, channels: 1 } }, 4000);
    expect(event.type).toBe("audio.start");
  });
  it("rejects unsupported audio format", () => {
    expect(() => parseClientEvent({ type: "audio.start", requestId: "r1", format: { encoding: "opus", sampleRate: 48000, channels: 2 } }, 4000)).toThrow();
  });
});

describe("audio session", () => {
  const limits = { maxAudioFrameBytes: 10, maxAudioRequestBytes: 20, maxAudioDurationMs: 1000 };
  it("rejects binary frames without active request", () => {
    expect(() => new AudioSessionState().addBytes(2, limits)).toThrow("audio_not_active");
  });
  it("enforces frame and request limits", () => {
    expect(() => assertAudioFrame(Buffer.alloc(11), limits)).toThrow("audio_frame_too_large");
    const session = new AudioSessionState();
    session.start("r1", { encoding: "pcm_s16le", sampleRate: 16000, channels: 1 });
    session.addBytes(10, limits);
    expect(() => session.addBytes(11, limits)).toThrow("audio_request_too_large:r1");
  });
});
