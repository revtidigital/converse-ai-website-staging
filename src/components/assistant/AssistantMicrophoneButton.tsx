import { isVoiceEnabled } from "../../lib/audio/audioValidation";

interface Props { state: string; onStart: () => void; onStop: () => void; onCancel: () => void }
export function AssistantMicrophoneButton({ state, onStart, onStop, onCancel }: Props) {
  if (!isVoiceEnabled()) return null;
  const listening = state === "listening";
  return <div className="assistant-voice-controls" aria-live="polite">
    {!listening ? <button type="button" aria-label="Start voice input" onClick={onStart}>Speak</button> : <>
      <button type="button" aria-label="Stop recording" onClick={onStop}>Stop</button>
      <button type="button" aria-label="Cancel recording" onClick={onCancel}>Cancel</button>
    </>}
  </div>;
}
