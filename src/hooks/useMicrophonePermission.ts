import { useCallback, useState } from "react";
import { assertSecureMicrophoneContext } from "../lib/audio/audioValidation";

export function useMicrophonePermission() {
  const [error, setError] = useState<string | null>(null);
  const requestMicrophone = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null);
      assertSecureMicrophoneContext();
      return await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }, video: false });
    } catch (err) {
      setError(err instanceof DOMException && err.name === "NotAllowedError" ? "Microphone permission was denied." : "Microphone is unavailable.");
      return null;
    }
  }, []);
  return { error, requestMicrophone };
}
