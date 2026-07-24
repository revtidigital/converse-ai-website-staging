import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";

const forbiddenXaiPatterns = [
  "XAI_API_KEY",
  "VITE_XAI_VOICE_ENABLED",
  "api.x.ai",
  "xai-client-secret",
  "XaiVoice",
  "xaiVoice",
  "agent_ZpYaLI0fdpzwPPAr",
] as const;

describe("Phase 0 xAI removal guard", () => {
  it("keeps removed xAI voice identifiers out of repository source", () => {
    for (const pattern of forbiddenXaiPatterns) {
      const result = spawnSync(
        "git",
        [
          "grep",
          "-n",
          "-F",
          pattern,
          "--",
          ":!src/test/assistant-xai-removal.test.ts",
          ":!docs/assistant-phase-0.md",
        ],
        { encoding: "utf8" },
      );

      expect(result.stdout, `Unexpected xAI reference found for ${pattern}`).toBe("");
      expect([0, 1]).toContain(result.status);
    }
  });
});
