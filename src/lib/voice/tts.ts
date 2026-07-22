// Text-to-speech using the browser's built-in SpeechSynthesis (free, no keys).
// Picks the most natural English voice available and speaks in short chunks
// so barge-in (cancel) is responsive.

let cachedVoice: SpeechSynthesisVoice | null = null;

/** Preference order — favour cloud-quality neural voices browsers ship for free. */
const PREFERRED = [
  "Google UK English Female",
  "Google US English",
  "Microsoft Aria Online (Natural)",
  "Microsoft Jenny Online (Natural)",
  "Microsoft Guy Online (Natural)",
  "Samantha",
  "Karen",
  "Daniel",
];

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function pickVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return cachedVoice;
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;

  for (const name of PREFERRED) {
    const v = voices.find((x) => x.name === name);
    if (v) return (cachedVoice = v);
  }
  // Any natural-sounding or en-US/en-GB voice.
  const natural = voices.find((v) => /natural|neural/i.test(v.name) && v.lang.startsWith("en"));
  if (natural) return (cachedVoice = natural);
  const en = voices.find((v) => v.lang === "en-US") || voices.find((v) => v.lang.startsWith("en"));
  return (cachedVoice = en ?? voices[0] ?? null);
}

/** Warm up the voice list (some browsers load it asynchronously). */
export function primeVoices() {
  if (!isTTSSupported()) return;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

/** Improve clarity of common tech/company/model names before speaking. */
export function normalizeForSpeech(text: string): string {
  // IMPORTANT: do NOT insert dotted letter-spellings ("A.I.", "A.P.I.") — the
  // user wants acronyms read naturally. The brand should read as the two words
  // "Converse AI" (so "AI" is pronounced naturally as "ay-eye", the way people
  // say it), not spelled out letter by letter and not slurred into one word.
  const map: Record<string, string> = {
    ConverseAI: "Converse AI",
    "Converse-AI": "Converse AI",
    SaaS: "sass",
    ChatGPT: "Chat GPT",
    "24/7": "twenty four seven",
  };
  let out = text;
  for (const [k, v] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), v);
  }
  // Separate a brand glued to a trailing "AI" (e.g. "DecagonAI" → "Decagon AI")
  // so it reads as the name plus a natural "AI". Uppercase-AI only, so ordinary
  // words like "Dubai" / "email" are never touched.
  out = out.replace(/\b([A-Za-z]{2,}?)AI\b/g, "$1 AI");
  return out;
}

/** Split long text into speakable clauses for smoother prosody + fast cancel. */
function chunk(text: string): string[] {
  return normalizeForSpeech(text)
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text];
}

export function cancelSpeech() {
  if (isTTSSupported()) window.speechSynthesis.cancel();
}

/**
 * Speak text. Returns a promise that resolves when finished (or cancelled).
 */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!isTTSSupported() || !text.trim()) {
      resolve();
      return;
    }
    cancelSpeech();
    const voice = pickVoice();
    const parts = chunk(text);
    let started = false;
    let index = 0;

    const next = () => {
      if (index >= parts.length) {
        opts.onEnd?.();
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(parts[index]);
      if (voice) u.voice = voice;
      u.rate = opts.rate ?? 1.0;
      u.pitch = opts.pitch ?? 1.0;
      u.onstart = () => {
        if (!started) {
          started = true;
          opts.onStart?.();
        }
      };
      u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
      u.onend = () => {
        index += 1;
        next();
      };
      u.onerror = () => {
        // "interrupted"/"canceled" errors just end the queue.
        opts.onEnd?.();
        resolve();
      };
      window.speechSynthesis.speak(u);
    };
    next();
  });
}
