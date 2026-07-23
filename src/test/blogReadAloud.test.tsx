import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogReadAloud from "@/components/voice/BlogReadAloud";

vi.mock("@/lib/voice/tts", () => ({
  pickVoice: vi.fn(() => null),
  primeVoices: vi.fn(),
  cancelSpeech: vi.fn(),
  isTTSSupported: vi.fn(() => true),
}));

class MockUtterance {
  text: string;
  rate = 1;
  voice = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
}

describe("BlogReadAloud", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `<article><div class="blogpost-content"><p>First sentence. Second sentence. Third sentence.</p></div></article>`;
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: MockUtterance, configurable: true });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { value: MockUtterance, configurable: true });
    Object.defineProperty(window, "speechSynthesis", {
      value: { speak: vi.fn((u: MockUtterance) => u.onstart?.()), cancel: vi.fn(), resume: vi.fn() },
      configurable: true,
    });
  });

  it("renders only play/reset controls and a draggable progress bar after play", () => {
    render(<BlogReadAloud />);
    fireEvent.click(screen.getByRole("button", { name: /listen to this article/i }));
    act(() => { vi.advanceTimersByTime(100); });

    expect(screen.getByRole("slider", { name: /article playback progress/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause article read-aloud/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset article read-aloud/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^back$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /playback speed/i })).not.toBeInTheDocument();
  });


  it("announces read-aloud active state during playback and clears it on pause", () => {
    const stateSpy = vi.fn();
    window.addEventListener("voice-agent:read-aloud-state", stateSpy);
    render(<BlogReadAloud />);

    fireEvent.click(screen.getByRole("button", { name: /listen to this article/i }));
    expect(stateSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { active: true } }));
    act(() => { vi.advanceTimersByTime(100); });

    fireEvent.click(screen.getByRole("button", { name: /pause article read-aloud/i }));
    expect(stateSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: { active: false } }));
    window.removeEventListener("voice-agent:read-aloud-state", stateSpy);
  });

  it("supports forward and backward chunk seeking from the range input", () => {
    render(<BlogReadAloud />);
    fireEvent.click(screen.getByRole("button", { name: /listen to this article/i }));
    act(() => { vi.advanceTimersByTime(100); });
    const slider = screen.getByRole("slider", { name: /article playback progress/i }) as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "100" } });
    expect(slider.value).toBe("67");
    fireEvent.change(slider, { target: { value: "0" } });
    expect(slider.value).toBe("0");
  });
});
