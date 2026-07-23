import { describe, expect, it } from "vitest";
import {
  detectSpeechCapabilities,
  type SpeechCapabilityRuntime,
  type SpeechRecognitionConstructor,
} from "@/lib/voice/speech/capability";
import { selectSpeechEngine } from "@/lib/voice/speech/registry";

const FakeSpeechRecognition = class extends EventTarget {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult = null;
  onerror = null;
  onend = null;
  onspeechstart = null;
  start() {}
  stop() {}
  abort() {}
} as SpeechRecognitionConstructor;

function runtime(overrides: SpeechCapabilityRuntime = {}): SpeechCapabilityRuntime {
  return {
    window: {
      isSecureContext: true,
      indexedDB: {} as IDBFactory,
      AudioContext: class {} as never,
    },
    navigator: {
      mediaDevices: { getUserMedia: () => undefined },
      hardwareConcurrency: 8,
      deviceMemory: 4,
    },
    worker: class {} as never,
    webAssembly: {} as typeof WebAssembly,
    audioWorkletAvailable: true,
    ...overrides,
  };
}

describe("speech capability detection", () => {
  it("detects standard SpeechRecognition availability", () => {
    const report = detectSpeechCapabilities(
      runtime({ window: { SpeechRecognition: FakeSpeechRecognition, isSecureContext: true } }),
    );

    expect(report.nativeSpeechRecognition.available).toBe(true);
    expect(report.nativeSpeechRecognition.constructorName).toBe("SpeechRecognition");
  });

  it("detects webkitSpeechRecognition availability", () => {
    const report = detectSpeechCapabilities(
      runtime({ window: { webkitSpeechRecognition: FakeSpeechRecognition, isSecureContext: true } }),
    );

    expect(report.nativeSpeechRecognition.available).toBe(true);
    expect(report.nativeSpeechRecognition.constructorName).toBe("webkitSpeechRecognition");
  });

  it("reports native recognition unavailable when neither constructor exists", () => {
    const report = detectSpeechCapabilities(runtime());

    expect(report.nativeSpeechRecognition.available).toBe(false);
    expect(report.nativeSpeechRecognition.reasons).toContain("SpeechRecognition and webkitSpeechRecognition are unavailable.");
  });

  it("detects WebGPU availability and unavailability", () => {
    const withGpu = detectSpeechCapabilities(runtime({ navigator: { gpu: {}, mediaDevices: { getUserMedia: () => undefined } } }));
    const withoutGpu = detectSpeechCapabilities(runtime());

    expect(withGpu.webGpu.available).toBe(true);
    expect(withoutGpu.webGpu.available).toBe(false);
    expect(withoutGpu.webGpu.reasons).toContain("navigator.gpu is unavailable.");
  });

  it("reports missing getUserMedia", () => {
    const report = detectSpeechCapabilities(runtime({ navigator: { mediaDevices: {} } }));

    expect(report.microphone.available).toBe(false);
    expect(report.microphone.mediaDevices).toBe(true);
    expect(report.microphone.getUserMedia).toBe(false);
    expect(report.microphone.reasons).toContain("navigator.mediaDevices.getUserMedia is unavailable.");
  });

  it("is safe in an SSR environment", () => {
    const report = detectSpeechCapabilities({});

    expect(report.environment).toBe("ssr");
    expect(report.nativeSpeechRecognition.available).toBe(false);
    expect(report.microphone.available).toBe(false);
    expect(report.secureContext.available).toBe(false);
  });
});

describe("speech engine registry", () => {
  it("keeps typed input always available", () => {
    const selection = selectSpeechEngine(detectSpeechCapabilities({}));

    expect(selection.availableEngines).toContain("typed-input");
    expect(selection.recommendedEngine).toBe("typed-input");
  });

  it("returns native speech recognition before typed input when native is available", () => {
    const report = detectSpeechCapabilities(
      runtime({ window: { SpeechRecognition: FakeSpeechRecognition, isSecureContext: true } }),
    );
    const selection = selectSpeechEngine(report);

    expect(selection.recommendedEngine).toBe("native-speech-recognition");
    expect(selection.fallbackOrder).toEqual(["native-speech-recognition", "typed-input"]);
    expect(selection.availableEngines).toEqual(["native-speech-recognition", "typed-input"]);
  });

  it("returns typed input only in the fallback order when native is unavailable", () => {
    const selection = selectSpeechEngine(detectSpeechCapabilities(runtime()));

    expect(selection.recommendedEngine).toBe("typed-input");
    expect(selection.fallbackOrder).toEqual(["typed-input"]);
    expect(selection.unavailableEngines).toEqual([
      {
        kind: "native-speech-recognition",
        reasons: ["SpeechRecognition and webkitSpeechRecognition are unavailable."],
      },
    ]);
  });
});
