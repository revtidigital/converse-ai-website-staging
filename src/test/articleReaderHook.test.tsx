import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ArticleReader from "@/components/ArticleReader/ArticleReader";

class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: unknown = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function installFakeSpeechSynthesis() {
  const spoken: string[] = [];
  let current: FakeUtterance | null = null;
  let speaking = false;

  const synth = {
    speaking: false,
    getVoices: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    speak: (utterance: FakeUtterance) => {
      current = utterance;
      speaking = true;
      synth.speaking = true;
      spoken.push(utterance.text);
    },
    cancel: () => {
      current = null;
      speaking = false;
      synth.speaking = false;
    },
    pause: () => {},
    resume: () => {},
    // Test helper: simulate the current utterance finishing naturally.
    __finishCurrent: () => {
      const u = current;
      current = null;
      speaking = false;
      synth.speaking = false;
      u?.onend?.();
    },
  };

  (window as any).speechSynthesis = synth;
  (window as any).SpeechSynthesisUtterance = FakeUtterance;
  return { synth, spoken };
}

describe("ArticleReader", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("plays chunks in order, one utterance at a time, and finishes at the end", async () => {
    const { synth, spoken } = installFakeSpeechSynthesis();
    render(<ArticleReader title="Post Title" contentHtml="<p>Para one.</p><p>Para two.</p>" />);

    const openBtn = screen.getByLabelText("Listen to this article");
    await act(async () => {
      openBtn.click();
    });

    expect(spoken).toEqual(["Para one."]);
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();

    await act(async () => {
      synth.__finishCurrent();
    });
    expect(spoken).toEqual(["Para one.", "Para two."]);

    // After the last chunk finishes naturally, it resets to idle/closed controls.
    await act(async () => {
      synth.__finishCurrent();
    });
    await waitFor(() => expect(screen.getByLabelText("Play")).toBeInTheDocument());
  });

  it("pause stops speech immediately and resume continues from the same chunk (no skip-ahead)", async () => {
    const { synth, spoken } = installFakeSpeechSynthesis();
    render(<ArticleReader title="T" contentHtml="<p>Alpha.</p><p>Beta.</p><p>Gamma.</p>" />);

    await act(async () => {
      screen.getByLabelText("Listen to this article").click();
    });
    expect(spoken.at(-1)).toBe("Alpha.");

    await act(async () => {
      screen.getByLabelText("Pause").click();
    });
    expect(screen.getByLabelText("Play")).toBeInTheDocument();

    const spokenCountAtPause = spoken.length;
    // Simulate time passing while paused: nothing new should ever be spoken.
    await new Promise((r) => setTimeout(r, 50));
    expect(spoken.length).toBe(spokenCountAtPause);

    await act(async () => {
      screen.getByLabelText("Play").click();
    });
    // Resume re-speaks the same chunk it paused on, not the next one.
    expect(spoken.at(-1)).toBe("Alpha.");
  });

  it("skip forward/back move between chunks without needing to finish the current one", async () => {
    const { spoken } = installFakeSpeechSynthesis();
    render(<ArticleReader title="T" contentHtml="<p>Alpha.</p><p>Beta.</p><p>Gamma.</p>" />);

    await act(async () => {
      screen.getByLabelText("Listen to this article").click();
    });
    expect(spoken.at(-1)).toBe("Alpha.");

    await act(async () => {
      screen.getByLabelText("Next section").click();
    });
    expect(spoken.at(-1)).toBe("Beta.");

    await act(async () => {
      screen.getByLabelText("Next section").click();
    });
    expect(spoken.at(-1)).toBe("Gamma.");

    await act(async () => {
      screen.getByLabelText("Previous section").click();
    });
    expect(spoken.at(-1)).toBe("Beta.");
  });

  it("reads table rows as distinct chunks reachable via skip", async () => {
    const { spoken } = installFakeSpeechSynthesis();
    const html = `<table><tr><th>Plan</th><th>Price</th></tr><tr><td>Starter</td><td>$10</td></tr></table>`;
    render(<ArticleReader title="T" contentHtml={html} />);

    await act(async () => {
      screen.getByLabelText("Listen to this article").click();
    });
    expect(spoken.at(-1)).toMatch(/following table has 1 rows/i);

    await act(async () => {
      screen.getByLabelText("Next section").click(); // first row
    });
    expect(spoken.at(-1)).toBe("For Starter, Price is $10.");
  });

  it("close resets progress and stops speech", async () => {
    const { synth, spoken } = installFakeSpeechSynthesis();
    render(<ArticleReader title="T" contentHtml="<p>Alpha.</p>" />);

    await act(async () => {
      screen.getByLabelText("Listen to this article").click();
    });
    await act(async () => {
      screen.getByLabelText("Close listen mode").click();
    });

    expect(screen.getByLabelText("Listen to this article")).toBeInTheDocument();
    const countAtClose = spoken.length;
    await act(async () => {
      synth.__finishCurrent();
    });
    expect(spoken.length).toBe(countAtClose);
  });

  it("never speaks headings, only body content", async () => {
    const { spoken } = installFakeSpeechSynthesis();
    render(
      <ArticleReader
        title="Post Title"
        contentHtml="<h1>Post Title</h1><h2>Section</h2><p>Body text.</p>"
      />
    );

    await act(async () => {
      screen.getByLabelText("Listen to this article").click();
    });

    expect(spoken).toEqual(["Body text."]);
  });
});
