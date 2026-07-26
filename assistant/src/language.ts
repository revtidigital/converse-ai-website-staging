// Language detection: English / Hindi (Devanagari) / Romanised Hinglish / mixed.
// Deterministic scoring — not a tiny hardcoded keyword list. Combines script
// detection with a broad romanised-Hindi signal lexicon and function-word ratios.

import type { Language } from "./types.js";

const DEVANAGARI = /[ऀ-ॿ]/;

// Common romanised-Hindi function words / markers. Broad, not exhaustive —
// used as a *ratio* signal, never a single-word trigger.
const HINGLISH_SIGNALS = new Set([
  "kya", "hai", "hain", "ka", "ke", "ki", "ko", "kaise", "kaisa", "kaisi",
  "kyun", "kyu", "kyun", "kyon", "kaun", "kab", "kaha", "kahan", "kitna",
  "kitne", "kitni", "batao", "bata", "batana", "samjhao", "samajh", "karo",
  "kar", "karna", "karta", "karte", "hoga", "hogi", "hota", "hoti", "raha",
  "rahi", "rahe", "mein", "mai", "me", "se", "par", "pe", "wala", "wali",
  "wale", "aur", "lekin", "magar", "iske", "uske", "iska", "uska", "yeh",
  "ye", "woh", "wo", "vo", "iss", "uss", "baare", "bare", "matlab", "chahiye",
  "acha", "accha", "theek", "thik", "nahi", "nahin", "haan", "kholo", "dikhao",
  "chalega", "bhai", "yaar", "abhi", "phir", "fir", "thoda", "zyada", "jyada",
  "bahut", "sab", "kuch", "cheez", "wali", "krna", "kro", "smjhao", "smjha",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zऀ-ॿ\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Detect the dominant language of a short user utterance.
 * `history` gives conversation continuity — a terse follow-up ("aur batao")
 * inherits the previous turn's language when ambiguous.
 */
export function detectLanguage(text: string, previous?: Language): Language {
  const hasDevanagari = DEVANAGARI.test(text);
  const tokens = tokenize(text);
  const latin = tokens.filter((t) => /^[a-z]+$/.test(t));
  const deva = (text.match(/[ऀ-ॿ]+/g) || []).length;

  if (tokens.length === 0) return previous ?? "en";

  const hinglishHits = latin.filter((t) => HINGLISH_SIGNALS.has(t)).length;
  const hinglishRatio = latin.length ? hinglishHits / latin.length : 0;

  // Devanagari mixed with substantial latin content => mixed.
  if (hasDevanagari && latin.length >= 2) return "mixed";
  // Otherwise Devanagari dominates => Hindi.
  if (hasDevanagari) return "hi";

  // Latin-only: decide Hinglish vs English by signal ratio (>= 0.18 or >=2 hits
  // in a short utterance is a strong romanised-Hindi indicator).
  if (hinglishRatio >= 0.18 || hinglishHits >= 2) return "hinglish";

  // Very short ambiguous follow-ups inherit prior language.
  if (tokens.length <= 3 && hinglishHits >= 1) return previous ?? "hinglish";
  if (tokens.length <= 2 && previous && previous !== "en") return previous;

  return "en";
}

/** Human-readable instruction for the synthesis layer. */
export function replyLanguageInstruction(lang: Language): string {
  switch (lang) {
    case "hi":
      return "Reply in natural Hindi (Devanagari).";
    case "hinglish":
    case "mixed":
      return "Reply in natural Romanised Hinglish (Hindi written in Latin script, casual and friendly).";
    default:
      return "Reply in clear, natural English.";
  }
}
