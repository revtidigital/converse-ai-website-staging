import type { XaiToolDefinition } from "./tools/types";

export const XAI_REALTIME_AGENT_ID = "agent_ZpYaLI0fdpzwPPAr";
export const XAI_REALTIME_URL = `wss://api.x.ai/v1/realtime?agent_id=${XAI_REALTIME_AGENT_ID}`;
export const XAI_INPUT_SAMPLE_RATE = 24_000;
export const XAI_OUTPUT_SAMPLE_RATE = 24_000;

export type XaiConnectionState = "closed" | "connecting" | "open" | "reconnecting" | "error";
export type XaiVoiceState = "closed" | "connecting" | "permission" | "ready" | "listening" | "thinking" | "speaking" | "recovering" | "error";
export type XaiMicrophoneState = "idle" | "requesting" | "active" | "error";

export interface XaiRealtimeTokenResponse {
  token: string;
  expiresAt: number;
  expiresInSeconds?: number;
}

export interface XaiRealtimeAudioFormat {
  type: "audio/pcm";
  rate: number;
}

export interface XaiRealtimeSessionConfig {
  instructions: string;
  tools?: XaiToolDefinition[];
  tool_choice?: "auto";
  resumption: { enabled: true };
  audio: {
    input: {
      format: XaiRealtimeAudioFormat;
      transcription: {
        model: "grok-transcribe";
        language?: string;
        prompt?: string;
      };
      turn_detection: {
        type: "server_vad";
        prefix_padding_ms: number;
        silence_duration_ms: number;
        idle_timeout_ms?: number;
      };
    };
    output: {
      format: XaiRealtimeAudioFormat;
    };
  };
}

export interface XaiRealtimeClientOptions {
  url?: string;
  tokenEndpoint?: string;
  connectTimeoutMs?: number;
  maxReconnectAttempts?: number;
  reconnectBaseDelayMs?: number;
  language?: string;
  sessionConfig?: XaiRealtimeSessionConfig;
  tools?: XaiToolDefinition[];
  WebSocketCtor?: typeof WebSocket;
}

export type XaiRealtimeClientEvent =
  | { type: "status"; state: XaiConnectionState }
  | { type: "session_configured" }
  | { type: "conversation_created"; conversationId: string }
  | { type: "speech_started"; itemId?: string }
  | { type: "speech_stopped"; itemId?: string }
  | { type: "error"; error: string }
  | { type: "response_created"; responseId: string }
  | { type: "response_output_item_added"; itemId: string; responseId?: string }
  | { type: "response_transcript_delta"; delta: string; responseId?: string; itemId?: string }
  | { type: "input_transcript"; transcript: string; itemId?: string; final: boolean }
  | { type: "output_audio_delta"; audio: string; responseId?: string; itemId?: string }
  | { type: "response_done"; responseId?: string }
  | { type: "function_call_arguments_done"; responseId: string; callId: string; name: string; argumentsJson: string; itemId?: string };

export type XaiRealtimeClientListener = (event: XaiRealtimeClientEvent) => void;

export interface AudioCaptureController {
  stop: () => Promise<void> | void;
}

export interface AudioCaptureOptions {
  sampleRate?: number;
  chunkMs?: number;
  silenceThreshold?: number;
  onChunk: (base64Pcm16: string) => void;
  audioContextFactory?: () => AudioContext;
  mediaDevices?: MediaDevices;
}

export type AudioPlaybackEvent = "started" | "ended" | "interrupted";
export type AudioPlaybackListener = (event: AudioPlaybackEvent) => void;
