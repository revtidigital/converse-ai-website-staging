// Human-sounding neural TTS via Kokoro-82M, running 100% in the visitor's
// browser (WebGPU when available, else WASM) through kokoro-js / transformers.js.
// Free, no API keys, no backend — model weights download once from the
// Hugging Face Hub and are cached by the browser. This is the quality upgrade
// over the robotic built-in SpeechSynthesis; tts.ts uses it when ready and
// falls back to SpeechSynthesis while it loads or where it's unsupported.

// Loaded lazily so the ~80MB model is only fetched once the agent is actually used.
type KokoroInstance = {
  generate: (
    text: string,
    opts?: { voice?: string; speed?: number },
  ) => Promise<{ audio: Float32Array; sampling_rate: number }>;
};

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
// af_heart = highest-graded, warm and natural female voice. Swap here to change
// the persona (e.g. am_michael, bf_emma, af_bella).
const VOICE = "af_heart";

let instance: KokoroInstance | null = null;
let loadPromise: Promise<KokoroInstance | null> | null = null;
let loadFailed = false;
let loadProgress = 0; // 0..1 model download progress
const readyCallbacks: Array<() => void> = [];

/** Register a callback fired once the neural voice is ready (or immediately if
 *  it already is). Lets the UI show "natural voice ready" and switch over. */
export function onKokoroReady(cb: () => void) {
  if (instance) cb();
  else readyCallbacks.push(cb);
}

/** True while the model is downloading/initialising (started but not ready). */
export function isKokoroLoading(): boolean {
  return !!loadPromise && !instance && !loadFailed;
}

/** True where a real neural voice is even possible (needs WebAudio + dynamic import). */
export function kokoroPossible(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) !== "undefined" &&
    !loadFailed
  );
}

/** True once the model is loaded and can speak immediately. */
export function isKokoroReady(): boolean {
  return !!instance;
}

export function kokoroLoadProgress(): number {
  return loadProgress;
}

/** Kick off (or return) the model load. Safe to call repeatedly. */
export function loadKokoro(): Promise<KokoroInstance | null> {
  if (instance) return Promise.resolve(instance);
  if (loadFailed) return Promise.resolve(null);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const { KokoroTTS } = await import("kokoro-js");
      const hasGPU = typeof navigator !== "undefined" && "gpu" in navigator;
      const device: "webgpu" | "wasm" = hasGPU ? "webgpu" : "wasm";
      // IMPORTANT: use fp32 on WebGPU — fp16 Kokoro on WebGPU produces distorted
      // / "torn" audio (known transformers.js issue). q8 on CPU/WASM is the
      // proven-clean quantisation there. Do NOT switch WebGPU to fp16/q8 to save
      // download size — it wrecks the voice quality, which is the whole point.
      const dtype = device === "webgpu" ? "fp32" : "q8";
      const tts = (await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype,
        device,
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (typeof p?.progress === "number") loadProgress = p.progress / 100;
        },
      })) as unknown as KokoroInstance;
      instance = tts;
      loadProgress = 1;
      readyCallbacks.splice(0).forEach((cb) => cb());
      return tts;
    } catch (err) {
      // WebGPU can fail on some machines — retry once on WASM before giving up.
      try {
        const { KokoroTTS } = await import("kokoro-js");
        const tts = (await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "q8",
          device: "wasm",
        })) as unknown as KokoroInstance;
        instance = tts;
        loadProgress = 1;
        readyCallbacks.splice(0).forEach((cb) => cb());
        return tts;
      } catch (err2) {
        console.warn("[kokoro] load failed, using browser voice", err2 || err);
        loadFailed = true;
        return null;
      }
    }
  })();
  return loadPromise;
}

// ── Playback via Web Audio (queue of decoded buffers, sequential) ────────────

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let cancelToken = 0; // bump to abort an in-flight speakKokoro loop

function ctx(): AudioContext {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

/** Create + resume the AudioContext. MUST be called from a real user gesture
 *  (tap/click/keypress) — otherwise the browser starts it "suspended" and no
 *  audio ever plays, which looks like "it says speaking but makes no sound".
 *  Calling it on the tap that opens the agent unlocks audio for the session. */
export function unlockAudio() {
  try {
    ctx().resume();
  } catch {
    /* ignore */
  }
}

function toBuffer(c: AudioContext, raw: { audio: Float32Array; sampling_rate: number }): AudioBuffer {
  const buf = c.createBuffer(1, raw.audio.length, raw.sampling_rate);
  buf.getChannelData(0).set(raw.audio);
  return buf;
}

// All sources scheduled for the current answer, so cancel can stop every one.
let scheduled: AudioBufferSourceNode[] = [];

export function cancelKokoro() {
  cancelToken += 1;
  for (const s of scheduled) {
    try {
      s.onended = null;
      s.stop();
    } catch {
      /* already stopped */
    }
  }
  scheduled = [];
  currentSource = null;
}

export function pauseKokoro() {
  audioCtx?.suspend().catch(() => {});
}

export function resumeKokoro() {
  audioCtx?.resume().catch(() => {});
}

export interface KokoroSpeakOpts {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

// Kokoro has no ~200-char limit (that was a browser-SpeechSynthesis quirk), so
// merge the small sentence chunks into larger segments. Fewer generate() calls =
// far fewer places where playback can stall waiting on the next chunk. The FIRST
// segment stays a single sentence so speaking starts quickly; the rest are packed.
const FIRST_SEG = 1;
const MAX_SEG_CHARS = 320;

function mergeSegments(parts: string[]): string[] {
  if (parts.length <= 1) return parts;
  const segs: string[] = [parts[0]]; // fast first utterance
  let buf = "";
  for (let i = FIRST_SEG; i < parts.length; i++) {
    const next = buf ? buf + " " + parts[i] : parts[i];
    if (next.length > MAX_SEG_CHARS && buf) {
      segs.push(buf);
      buf = parts[i];
    } else {
      buf = next;
    }
  }
  if (buf) segs.push(buf);
  return segs;
}

/**
 * Speak the given sentence chunks with the neural voice. Generates ahead and
 * schedules playback GAPLESSLY on the audio-context timeline so there are no
 * pauses between segments. Rejects if the model isn't available (caller falls back).
 */
export async function speakKokoro(parts: string[], opts: KokoroSpeakOpts = {}): Promise<void> {
  const tts = await loadKokoro();
  if (!tts) throw new Error("kokoro-unavailable");
  const segments = mergeSegments(parts);
  if (!segments.length) {
    opts.onEnd?.();
    return;
  }

  const c = ctx();
  await c.resume().catch(() => {});
  const myToken = ++cancelToken; // claim this run; any cancel/new run invalidates it
  const speed = opts.rate ?? 1;
  let started = false;
  scheduled = [];

  // Absolute context time at which the next segment should begin. Kept a hair
  // ahead of currentTime so buffers butt up against each other with no gap; if
  // generation falls behind, it simply resumes from "now".
  let playhead = 0;
  let lastSource: AudioBufferSourceNode | null = null;

  // Prefetch: generate the next segment while the current one is playing.
  let pending: Promise<{ audio: Float32Array; sampling_rate: number }> | null = tts.generate(segments[0], {
    voice: VOICE,
    speed,
  });

  for (let i = 0; i < segments.length; i++) {
    if (myToken !== cancelToken) return; // cancelled / superseded
    let raw;
    try {
      raw = await pending!;
    } catch {
      if (!started) throw new Error("kokoro-generate-failed");
      break;
    }
    if (myToken !== cancelToken) return;

    pending = i + 1 < segments.length ? tts.generate(segments[i + 1], { voice: VOICE, speed }) : null;

    const buffer = toBuffer(c, raw);
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    const startAt = Math.max(c.currentTime + 0.02, playhead);
    src.start(startAt);
    playhead = startAt + buffer.duration;
    scheduled.push(src);
    currentSource = src;
    lastSource = src;

    if (!started) {
      started = true;
      opts.onStart?.();
    }
  }

  // Resolve when the last scheduled segment actually finishes playing.
  await new Promise<void>((resolve) => {
    if (!lastSource || myToken !== cancelToken) {
      resolve();
      return;
    }
    lastSource.onended = () => resolve();
    // Safety net in case onended is dropped: resolve shortly after the playhead.
    const ms = Math.max(0, (playhead - c.currentTime) * 1000) + 120;
    setTimeout(() => resolve(), ms);
  });

  if (myToken === cancelToken) opts.onEnd?.();
}
