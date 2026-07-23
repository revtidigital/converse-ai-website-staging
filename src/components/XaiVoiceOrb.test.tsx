import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import XaiVoiceOrbGate from "./XaiVoiceOrbGate";

const start = vi.fn();
vi.mock("@/hooks/useXaiVoice", () => ({
  useXaiVoice: () => ({ state: "closed", error: null, isActive: false, start, stop: vi.fn(), interrupt: vi.fn(), retry: vi.fn() }),
}));

const renderGate = (enabled: string) => {
  vi.stubEnv("VITE_XAI_VOICE_ENABLED", enabled);
  render(<MemoryRouter><XaiVoiceOrbGate /></MemoryRouter>);
};

describe("xAI voice feature flag", () => {
  afterEach(() => { cleanup(); start.mockClear(); vi.unstubAllEnvs(); });

  it("feature flag true renders one orb", () => {
    renderGate("true");
    expect(screen.getAllByRole("button", { name: /xAI voice session/i })).toHaveLength(1);
  });

  it("feature flag false creates no voice controls or resources", () => {
    renderGate("false");
    expect(screen.queryByRole("button", { name: /xAI voice session/i })).toBeNull();
    expect(start).not.toHaveBeenCalled();
  });
});
