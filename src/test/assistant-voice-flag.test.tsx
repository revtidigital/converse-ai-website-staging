import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssistantMicrophoneButton } from "../components/assistant/AssistantMicrophoneButton";

describe("AssistantMicrophoneButton", () => {
  it("is hidden when voice feature flag is false", () => {
    render(<AssistantMicrophoneButton state="idle" onStart={() => undefined} onStop={() => undefined} onCancel={() => undefined} />);
    expect(screen.queryByRole("button", { name: /start voice input/i })).toBeNull();
  });
});
