export interface AudioLimits {
  maxAudioFrameBytes: number;
  maxAudioRequestBytes: number;
  maxAudioDurationMs: number;
}

export function assertAudioFrame(frame: Buffer, limits: AudioLimits): void {
  if (frame.length === 0) throw new Error("empty_audio_frame");
  if (frame.length > limits.maxAudioFrameBytes) throw new Error("audio_frame_too_large");
}
