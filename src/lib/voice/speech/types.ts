// Shared speech input type definitions for the voice agent.

import type { NativeSpeechRecognitionErrorCode } from "./errors";

export type SpeechEngineKind = "native-speech-recognition" | "typed-input";

export type SpeechEngineStatus = "idle" | "ready" | "listening" | "stopped" | "aborted" | "destroyed";

export interface SpeechEngineCapabilities {
  kind: SpeechEngineKind;
  available: boolean;
  requiresMicrophone: boolean;
  requiresNetwork: boolean;
  reasons: string[];
}

export interface SpeechTranscript {
  id: string;
  text: string;
  isFinal: boolean;
  source: SpeechEngineKind;
  createdAt: number;
}

export type SpeechEngineEvent =
  | { type: "status"; status: SpeechEngineStatus }
  | { type: "transcript"; transcript: SpeechTranscript };

export type SpeechEngineListener<TEvent = SpeechEngineEvent> = (event: TEvent) => void;

export interface SpeechEngine<TEvent = SpeechEngineEvent> {
  readonly kind: SpeechEngineKind;
  readonly capabilities: SpeechEngineCapabilities;
  prepare: () => void | Promise<void>;
  start: () => void | Promise<void>;
  stop: () => void | Promise<void>;
  abort: () => void | Promise<void>;
  destroy: () => void | Promise<void>;
  onEvent: (listener: SpeechEngineListener<TEvent>) => () => void;
}

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionResultEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike {
  error?: NativeSpeechRecognitionErrorCode;
}

// Minimal typing for the Web Speech API (not in TS DOM lib by default).
export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
}
