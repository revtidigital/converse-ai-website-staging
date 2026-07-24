export function AssistantVoiceStatus({ state, error }: { state: string; error?: string | null }) {
  if (state === "idle" && !error) return null;
  return <p role="status" aria-live="polite">{error ?? (state === "listening" ? "Listening…" : state === "processing" ? "Processing speech…" : "Voice input ready.")}</p>;
}
