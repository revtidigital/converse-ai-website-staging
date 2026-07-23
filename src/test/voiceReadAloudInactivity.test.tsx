import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const speakMock = vi.fn(async () => undefined);

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/blog/test" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@/lib/voice/brain", () => ({
  respond: vi.fn(async () => ({ speech: "Here is the answer." })),
}));

vi.mock("@/lib/voice/tts", () => ({
  speak: (...args: unknown[]) => speakMock(...args),
  cancelSpeech: vi.fn(),
  pauseSpeech: vi.fn(),
  resumeSpeech: vi.fn(),
  primeVoices: vi.fn(),
  warmNeuralVoice: vi.fn(),
  unlockAudio: vi.fn(),
  onKokoroReady: vi.fn(),
  isTTSSupported: vi.fn(() => true),
}));

vi.mock("@/lib/voice/speech/capability", () => ({
  detectSpeechCapabilities: vi.fn(() => ({ nativeSpeechRecognition: { available: true } })),
}));

vi.mock("@/lib/voice/speech/nativeSpeechRecognition", () => ({
  NativeSpeechRecognitionAdapter: class {
    isSupported() { return true; }
    start() {}
    abort() {}
    onEvent() { return () => undefined; }
  },
}));

import { useVoiceAgent } from "@/hooks/useVoiceAgent";

describe("useVoiceAgent read-aloud inactivity suppression", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    speakMock.mockClear();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  it("does not speak the normal inactivity prompt while blog read-aloud is active", async () => {
    const { result } = renderHook(() => useVoiceAgent({ proactive: false }));

    await act(async () => {
      result.current.submitText("summarize this blog");
      await Promise.resolve();
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("voice-agent:read-aloud-state", { detail: { active: true } }));
      vi.advanceTimersByTime(121000);
    });

    expect(speakMock).not.toHaveBeenCalledWith(
      expect.stringContaining("I’ll pause here for now"),
      expect.anything(),
    );
  });
});
