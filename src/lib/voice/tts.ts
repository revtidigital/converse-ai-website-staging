// Text-to-speech. Prefers the human-sounding neural Kokoro voice (runs in the
// browser, see kokoroTTS.ts) and falls back to the built-in SpeechSynthesis
// while the model loads or where it's unsupported. Both are free, no keys.
// Speaks in short sentence chunks so barge-in (cancel) is responsive.

import {
  loadKokoro,
  isKokoroReady,
  kokoroPossible,
  speakKokoro,
  cancelKokoro,
  pauseKokoro,
  resumeKokoro,
} from "./kokoroTTS";

// Which engine is currently producing sound, so cancel/pause/resume route right.
let activeEngine: "kokoro" | "browser" | null = null;

let cachedVoice: SpeechSynthesisVoice | null = null;
// Retain utterances so Chrome can't garbage-collect them mid-speech (which
// silently drops onend and cuts off longer answers).
const retained: SpeechSynthesisUtterance[] = [];

/** Preference order — the most human-sounding voices browsers ship for free.
 *  Neural/"Natural" voices first (Edge), then Google's cloud voices, then the
 *  best on-device voices (macOS Samantha, etc). Order = descending humanness. */
const PREFERRED = [
  // Edge neural voices — closest to a real person, warm and expressive.
  "Microsoft Aria Online (Natural)",
  "Microsoft Jenny Online (Natural)",
  "Microsoft Emma Online (Natural)",
  "Microsoft Ava Online (Natural)",
  "Microsoft Guy Online (Natural)",
  "Microsoft Andrew Online (Natural)",
  // Chrome's cloud voices — natural prosody, widely available.
  "Google US English",
  "Google UK English Female",
  // Best on-device fallbacks (still fairly natural).
  "Samantha",
  "Karen",
  "Serena",
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

  const en = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;

  // Pick for HUMANNESS first. The neural/"Natural" and Google voices sound like a
  // real person; on-device voices are more robotic. We used to force a local voice
  // to dodge a mid-speech drop bug, but speak() now queues every chunk into the
  // browser FIFO up front (see below), so the neural voices are safe to use again.
  const byPreferred = (list: SpeechSynthesisVoice[]) => {
    for (const name of PREFERRED) {
      const v = list.find((x) => x.name === name);
      if (v) return v;
    }
    // Any voice that advertises itself as natural/neural/premium quality.
    const natural = list.find((v) => /natural|neural|enhanced|premium/i.test(v.name));
    if (natural) return natural;
    // Otherwise the best on-device voice, en-US preferred.
    const local = list.filter((v) => v.localService);
    const localPool = local.length ? local : list;
    return localPool.find((v) => v.lang === "en-US") || localPool[0];
  };

  return (cachedVoice = byPreferred(pool) ?? voices[0] ?? null);
}

/** Warm up the voice list (some browsers load it asynchronously) and start
 *  downloading the neural Kokoro model so it's ready for the human voice. */
export function primeVoices() {
  if (isTTSSupported()) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoice = null;
      pickVoice();
    };
  }
}

/** Start downloading the neural voice model. Call this when the user actually
 *  engages the agent — NOT on page mount — so visitors who never use it don't
 *  pay the model download. Safe to call repeatedly. */
export function warmNeuralVoice() {
  if (kokoroPossible()) void loadKokoro();
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

// Abbreviations / patterns whose "." must NOT end a sentence, so we don't chop
// "Dr. Smith" or "e.g." into robotic fragments.
const ABBREV_RE = /\b(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|a\.m|p\.m|u\.s|u\.k|inc|ltd|co|no|fig|dept)\./gi;
const DOT = String.fromCharCode(0xe000); // private-use sentinel for protected dots
const MAX_CHUNK = 180; // Chrome silently truncates utterances over ~200 chars.

/** Break an over-long sentence at clause boundaries so no utterance is truncated. */
function capLength(sentence: string): string[] {
  if (sentence.length <= MAX_CHUNK) return [sentence];
  const clauses = sentence.split(/(?<=[,;:—–-])\s+/);
  const out: string[] = [];
  let buf = "";
  for (const c of clauses) {
    if ((buf + " " + c).trim().length <= MAX_CHUNK) {
      buf = (buf + " " + c).trim();
    } else {
      if (buf) out.push(buf);
      if (c.length <= MAX_CHUNK) {
        buf = c;
      } else {
        // Single giant clause — wrap at word boundaries.
        let line = "";
        for (const w of c.split(/\s+/)) {
          if ((line + " " + w).trim().length <= MAX_CHUNK) line = (line + " " + w).trim();
          else { if (line) out.push(line); line = w; }
        }
        buf = line;
      }
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** Split into whole grammatical sentences for natural, human-sounding prosody. */
function chunk(text: string): string[] {
  const clean = normalizeForSpeech(text).replace(/\s+/g, " ").trim();
  if (!clean) return [text];
  // Protect dots that are NOT sentence ends (decimals, initials, abbreviations).
  const protectedText = clean
    .replace(/(\d)\.(\d)/g, `$1${DOT}$2`) // 4.99, 3.5
    .replace(/\b([A-Z])\.(?=\s?[A-Z]\.)/g, `$1${DOT}`) // A.I., U.S.
    .replace(new RegExp(ABBREV_RE.source, "gi"), (m) => m.replace(/\./g, DOT));
  const sentences = protectedText
    .split(/(?<=[.!?…])\s+(?=["'“‘([]?[A-Z0-9])/)
    .map((s) => s.replace(new RegExp(DOT, "g"), ".").trim())
    .filter(Boolean);
  const parts = (sentences.length ? sentences : [clean]).flatMap(capLength);
  return parts.length ? parts : [text];
}

export function cancelSpeech() {
  cancelKokoro();
  if (isTTSSupported()) window.speechSynthesis.cancel();
}

/** Pause the current speech in place (keeps the utterance queued) so it can be
 *  resumed from exactly where it stopped. */
export function pauseSpeech() {
  if (activeEngine === "kokoro") {
    pauseKokoro();
    return;
  }
  if (!isTTSSupported()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* ignore */
  }
}

/** Resume speech paused with pauseSpeech(), continuing the same answer. */
export function resumeSpeech() {
  if (activeEngine === "kokoro") {
    resumeKokoro();
    return;
  }
  if (!isTTSSupported()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}

/**
 * Speak text. Prefers the human neural voice (Kokoro) once it's loaded, and
 * uses the browser voice meanwhile / as a fallback. Returns a promise that
 * resolves when finished (or cancelled).
 */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  const clean = text?.trim();
  if (!clean) return Promise.resolve();
  cancelSpeech();
  const parts = chunk(clean);

  // Neural voice ready → use it. If generation fails mid-way, fall back.
  if (isKokoroReady()) {
    activeEngine = "kokoro";
    return speakKokoro(parts, {
      rate: opts.rate,
      onStart: opts.onStart,
      onEnd: opts.onEnd,
    }).catch(() => {
      activeEngine = "browser";
      return speakBrowser(parts, opts);
    });
  }

  // Not ready yet — start it downloading for next time and speak now with the
  // browser voice so there's no silent wait on the first replies.
  if (kokoroPossible()) void loadKokoro();
  activeEngine = "browser";
  return speakBrowser(parts, opts);
}

/** Speak already-chunked text with the built-in SpeechSynthesis voice. */
function speakBrowser(parts: string[], opts: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!isTTSSupported() || !parts.length) {
      opts.onEnd?.();
      resolve();
      return;
    }
    const voice = pickVoice();
    let started = false;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      opts.onEnd?.();
      resolve();
    };

    // Slightly-under-1 rate + neutral pitch reads as relaxed and natural rather
    // than clipped and robotic. Neural voices sound best a touch slower.
    const rate = opts.rate ?? 0.96;
    const pitch = opts.pitch ?? 1.02;

    // Queue EVERY sentence into the browser's own FIFO up front and let it drive
    // playback. Chaining the next sentence inside each onend used to drop the
    // whole answer when Chrome intermittently skipped an onend (GC / remote
    // voice quirks); queueing all utterances removes that failure mode.
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      retained.push(u);
      if (retained.length > 200) retained.shift();
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = pitch;
      u.onstart = () => {
        if (!started) {
          started = true;
          opts.onStart?.();
        }
      };
      u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
      if (i === parts.length - 1) u.onend = finish;
      u.onerror = finish; // "interrupted"/"canceled" just end the queue.
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
      window.speechSynthesis.speak(u);
    });
    if (!parts.length) finish();
  });
}
