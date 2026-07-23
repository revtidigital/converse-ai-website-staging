export const XAI_AGENT_ID = "agent_ZpYaLI0fdpzwPPAr";
export const XAI_REALTIME_URL = `wss://api.x.ai/v1/realtime?agent_id=${XAI_AGENT_ID}`;
export const XAI_AUDIO_RATE = 24000;

export type VoiceState =
  | "closed" | "requesting-permission" | "connecting" | "configuring" | "listening"
  | "user-speaking" | "thinking" | "speaking" | "interrupted" | "reconnecting"
  | "permission-denied" | "unavailable" | "error";

export const XAI_SESSION_UPDATE = {
  type: "session.update",
  session: {
    turn_detection: { type: "server_vad", threshold: 0.85, silence_duration_ms: 800, prefix_padding_ms: 333 },
    audio: {
      input: { format: { type: "audio/pcm", rate: XAI_AUDIO_RATE }, transport: "json" },
      output: { format: { type: "audio/pcm", rate: XAI_AUDIO_RATE }, transport: "json" },
    },
    resumption: { enabled: true },
  },
} as const;

export type XaiRealtimeEvent = {
  type?: string;
  response_id?: string;
  item_id?: string;
  delta?: string;
  audio?: string;
  session?: unknown;
  conversation?: { id?: string };
  response?: { id?: string; status?: string };
  error?: { code?: string; message?: string; type?: string } | string;
  [key: string]: unknown;
};

export type XaiClientCallbacks = {
  onEvent?: (event: XaiRealtimeEvent) => void;
  onState?: (state: "connecting" | "configuring" | "open" | "reconnecting" | "closed") => void;
  onError?: (message: string) => void;
  onReconnectAttempt?: (attempt: number) => void;
};

export type TokenResponse = { token: string; expiresAt: number };
