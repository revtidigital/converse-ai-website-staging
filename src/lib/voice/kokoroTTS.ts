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
      // fp32 on GPU (fast + best), quantised q8 on CPU/WASM (smaller + acceptable).
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

function toBuffer(c: AudioContext, raw: { audio: Float32Array; sampling_rate: number }): AudioBuffer {
  const buf = c.createBuffer(1, raw.audio.length, raw.sampling_rate);
  buf.getChannelData(0).set(raw.audio);
  return buf;
}

function playBuffer(c: AudioContext, buffer: AudioBuffer): Promise<void> {
  return new Promise((resolve) => {
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    currentSource = src;
    src.onended = () => {
      if (currentSource === src) currentSource = null;
      resolve();
    };
    src.start();
  });
}

export function cancelKokoro() {
  cancelToken += 1;
  try {
    currentSource?.stop();
  } catch {
    /* already stopped */
  }
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

/**
 * Speak the given sentence chunks with the neural voice. Generates each chunk's
 * audio while the previous one plays (prefetch) so there are no long gaps.
 * Rejects if the model isn't available, so the caller can fall back.
 */
export async function speakKokoro(parts: string[], opts: KokoroSpeakOpts = {}): Promise<void> {
  const tts = await loadKokoro();
  if (!tts) throw new Error("kokoro-unavailable");
  if (!parts.length) {
    opts.onEnd?.();
    return;
  }

  const c = ctx();
  await c.resume().catch(() => {});
  const myToken = ++cancelToken; // claim this run; any cancel/new run invalidates it
  const speed = opts.rate ?? 1;
  let started = false;

  // Prefetch pipeline: generate next chunk while the current one plays.
  let pending: Promise<{ audio: Float32Array; sampling_rate: number }> | null = tts.generate(parts[0], {
    voice: VOICE,
    speed,
  });

  for (let i = 0; i < parts.length; i++) {
    if (myToken !== cancelToken) return; // cancelled / superseded
    let raw;
    try {
      raw = await pending!;
    } catch {
      // generation failed mid-way — bail to fallback if nothing has played yet.
      if (!started) throw new Error("kokoro-generate-failed");
      break;
    }
    if (myToken !== cancelToken) return;

    pending = i + 1 < parts.length ? tts.generate(parts[i + 1], { voice: VOICE, speed }) : null;

    if (!started) {
      started = true;
      opts.onStart?.();
    }
    await playBuffer(c, toBuffer(c, raw));
    if (myToken !== cancelToken) return;
  }

  opts.onEnd?.();
}
