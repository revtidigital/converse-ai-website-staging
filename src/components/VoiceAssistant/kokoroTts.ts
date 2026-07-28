let ttsPromise: Promise<import("kokoro-js").KokoroTTS> | null = null;

// Loaded lazily on first use only — importing/loading the model at page
// load previously caused a real perf regression (see 7f5d412).
function getTts() {
  if (!ttsPromise) {
    ttsPromise = import("kokoro-js").then(({ KokoroTTS }) =>
      KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8",
        device: "wasm",
      })
    );
  }
  return ttsPromise;
}

let currentAudio: HTMLAudioElement | null = null;

export async function speakHuman(text: string, onDone?: () => void) {
  stopSpeaking();
  const tts = await getTts();
  const audioData = await tts.generate(text, { voice: "af_bella" });
  const blob = audioData.toBlob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
    onDone?.();
  };
  await audio.play();
}

export function stopSpeaking() {
  currentAudio?.pause();
  currentAudio = null;
}
