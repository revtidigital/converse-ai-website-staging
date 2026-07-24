export interface AudioFormat { encoding: "pcm_s16le"; sampleRate: 16000; channels: 1 }
export const ASSISTANT_AUDIO_FORMAT: AudioFormat = { encoding: "pcm_s16le", sampleRate: 16000, channels: 1 };
export const ASSISTANT_AUDIO_FRAME_MS = 40;
export type VoiceCaptureState = "idle" | "permission-needed" | "listening" | "processing" | "cancelled" | "error";
