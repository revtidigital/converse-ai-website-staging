import { describe, expect, it } from "vitest";
import { encodePcmS16Le, mixToMono } from "../lib/audio/pcmEncoder";
import { resampleLinear } from "../lib/audio/resampler";
import { assertFrameSize } from "../lib/audio/audioValidation";

describe("audio utilities", () => {
  it("encodes clipped PCM signed 16-bit little endian", () => {
    const pcm = encodePcmS16Le(new Float32Array([-2, 0, 2]));
    const view = new DataView(pcm);
    expect(view.getInt16(0, true)).toBe(-32768);
    expect(view.getInt16(2, true)).toBe(0);
    expect(view.getInt16(4, true)).toBe(32767);
  });
  it("mixes to mono and resamples", () => {
    const mono = mixToMono([new Float32Array([1, 0]), new Float32Array([0, 1])]);
    expect([...mono]).toEqual([0.5, 0.5]);
    expect(resampleLinear(new Float32Array(480), 48000, 16000)).toHaveLength(160);
  });
  it("rejects empty and oversized frames", () => {
    expect(() => assertFrameSize(new ArrayBuffer(0))).toThrow();
    expect(() => assertFrameSize(new ArrayBuffer(2), 1)).toThrow();
  });
});
