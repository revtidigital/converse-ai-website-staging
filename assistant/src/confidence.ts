// Confidence policy. Retrieval similarity is mapped to a strict category that
// governs whether the assistant may state website facts or must reject.
//
// CALIBRATION NOTE: the spec suggests HIGH>=0.78 / MEDIUM>=0.65. Those hold for
// symmetric/normalised embedding setups. Empirically, paraphrase-multilingual-
// MiniLM-L12-v2 raw cosine on short asymmetric query↔document pairs scores good
// matches around 0.40–0.55 and off-topic near/below 0. Thresholds are therefore
// env-configurable and MUST be tuned to the deployed model. Defaults below keep
// the spec numbers; set ASSISTANT_HIGH_THRESHOLD / ASSISTANT_MEDIUM_THRESHOLD
// (e.g. 0.52 / 0.40 for this model) after measuring on real indexed content.

import type { ConfidenceCategory } from "./types.js";

export const HIGH_THRESHOLD = Number(process.env.ASSISTANT_HIGH_THRESHOLD ?? 0.78);
export const MEDIUM_THRESHOLD = Number(process.env.ASSISTANT_MEDIUM_THRESHOLD ?? 0.65);

export function categorize(similarity: number): ConfidenceCategory {
  if (similarity >= HIGH_THRESHOLD) return "high";
  if (similarity >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

/** LOW confidence => must not invent facts, must not navigate. */
export function isGrounded(category: ConfidenceCategory): boolean {
  return category !== "low";
}
