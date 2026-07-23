// Shared speech error type definitions for native speech recognition.

export type NativeSpeechRecognitionPermissionError = "not-allowed" | "service-not-allowed";

export type NativeSpeechRecognitionErrorCode =
  | NativeSpeechRecognitionPermissionError
  | "aborted"
  | "audio-capture"
  | "network"
  | "no-speech"
  | (string & {});
