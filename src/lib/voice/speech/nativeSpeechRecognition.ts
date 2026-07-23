import { getNativeSpeechRecognitionConstructor } from "./capability";
import type { NativeSpeechRecognitionPermissionError } from "./errors";
import type {
  SpeechRecognitionErrorEventLike,
  SpeechRecognitionLike,
  SpeechRecognitionResultEventLike,
} from "./types";

export type NativeSpeechRecognitionEvent =
  | { type: "transcript"; transcript: string }
  | { type: "permission-denied" }
  | { type: "end" }
  | { type: "error"; error: SpeechRecognitionErrorEventLike };

type NativeSpeechRecognitionListener = (event: NativeSpeechRecognitionEvent) => void;

const PERMISSION_DENIED_ERRORS: readonly NativeSpeechRecognitionPermissionError[] = ["not-allowed", "service-not-allowed"];

export function isNativeSpeechRecognitionSupported(): boolean {
  return !!getNativeSpeechRecognitionConstructor().ctor;
}

export class NativeSpeechRecognitionAdapter {
  private recognition: SpeechRecognitionLike | null = null;
  private listeners = new Set<NativeSpeechRecognitionListener>();

  isSupported(): boolean {
    return isNativeSpeechRecognitionSupported();
  }

  onEvent(listener: NativeSpeechRecognitionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    const Ctor = getNativeSpeechRecognitionConstructor().ctor;
    if (!Ctor) return;

    this.abort();

    const rec = new Ctor();
    rec.lang = "en-US";
    // Turn-based recognition: one utterance per turn. This is far more reliable
    // in Chrome than continuous mode (which keeps the mic open through the
    // agent's own TTS and drops the next question). After each answer the hook
    // re-opens the mic, and onend can request a restart if the user stayed silent.
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionResultEventLike) => {
      if (this.recognition !== rec) return;
      // Only take results the engine marked final. Concatenate just the final
      // segments of this event so a half-heard partial can't trigger an action.
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) transcript += r[0].transcript + " ";
      }
      transcript = transcript.trim();
      // Ignore empty/noise blips; require a real word before acting.
      if (transcript.length < 2 || !/[a-z0-9]/i.test(transcript)) return;
      this.emit({ type: "transcript", transcript });
    };
    rec.onerror = (e: SpeechRecognitionErrorEventLike) => {
      if (this.recognition !== rec) return;
      if (e?.error && PERMISSION_DENIED_ERRORS.includes(e.error as NativeSpeechRecognitionPermissionError)) {
        this.emit({ type: "permission-denied" });
        return;
      }
      // Any other error ("no-speech", "network", "aborted") is non-fatal — the
      // hook silently keeps the mic alive via onend's auto-restart. No error is shown.
      this.emit({ type: "error", error: e });
    };
    rec.onend = () => {
      if (this.recognition !== rec) return;
      this.recognition = null;
      this.emit({ type: "end" });
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }

  abort(): void {
    const rec = this.recognition;
    if (!rec) return;
    this.recognition = null;
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
  }

  stop(): void {
    const rec = this.recognition;
    if (!rec) return;
    this.recognition = null;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  }

  destroy(): void {
    this.abort();
    this.listeners.clear();
  }

  private emit(event: NativeSpeechRecognitionEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
