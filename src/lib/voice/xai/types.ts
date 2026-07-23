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

export interface XaiRealtimeClientOptions {
  url?: string;
  tokenEndpoint?: string;
  connectTimeoutMs?: number;
  maxReconnectAttempts?: number;
  reconnectBaseDelayMs?: number;
  WebSocketCtor?: typeof WebSocket;
}

export type XaiRealtimeClientEvent =
  | { type: "status"; state: XaiConnectionState }
  | { type: "error"; error: string }
  | { type: "response_transcript_delta"; delta: string }
  | { type: "input_transcript"; transcript: string }
  | { type: "output_audio_delta"; audio: string }
  | { type: "response_done" };

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
