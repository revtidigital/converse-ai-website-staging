export function isVoiceEnabled(): boolean {
  return import.meta.env.VITE_ASSISTANT_V2_ENABLED === "true" && import.meta.env.VITE_ASSISTANT_VOICE_ENABLED === "true";
}

export function assertSecureMicrophoneContext(): void {
  if (typeof window === "undefined") throw new Error("browser_required");
  if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") throw new Error("secure_context_required");
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("microphone_unsupported");
}

export function assertFrameSize(frame: ArrayBuffer, maxBytes = 65536): void {
  if (frame.byteLength === 0) throw new Error("empty_audio_frame");
  if (frame.byteLength > maxBytes) throw new Error("audio_frame_too_large");
}
