import { XAI_TOOL_INSTRUCTION, xaiToolDefinitions } from "./tools/schemas";

export const XAI_AGENT_ID = "agent_ZpYaLI0fdpzwPPAr";
export const XAI_REALTIME_URL = `wss://api.x.ai/v1/realtime?agent_id=${XAI_AGENT_ID}`;
export const XAI_AUDIO_RATE = 24000;

export type VoiceState =
  | "closed" | "requesting-permission" | "connecting" | "configuring" | "listening"
  | "user-speaking" | "thinking" | "speaking" | "tool-running" | "contact-workflow" | "blog-reading" | "blog-paused" | "interrupted" | "reconnecting"
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
    instructions: XAI_TOOL_INSTRUCTION,
    tools: xaiToolDefinitions,
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
  item?: { type?: string; name?: string; call_id?: string; arguments?: string; status?: string };
  error?: { code?: string; message?: string; type?: string } | string;
  [key: string]: unknown;
};

export type XaiClientCallbacks = {
  onEvent?: (event: XaiRealtimeEvent) => void;
  onState?: (state: "connecting" | "configuring" | "open" | "reconnecting" | "closed") => void;
  onError?: (message: string) => void;
  onReconnectAttempt?: (attempt: number) => void;
};

export type XaiTokenErrorCode = "XAI_NOT_CONFIGURED" | "XAI_REQUEST_REJECTED" | "XAI_INVALID_API_KEY" | "XAI_PERMISSION_DENIED" | "XAI_RATE_LIMITED" | "XAI_UPSTREAM_UNAVAILABLE" | "XAI_INVALID_TOKEN_RESPONSE" | "XAI_TOKEN_TIMEOUT" | "XAI_TOKEN_NETWORK_ERROR" | "XAI_ORIGIN_REJECTED" | "XAI_REQUEST_MALFORMED" | "XAI_RATE_LIMITED_LOCAL";
export type TokenResponse = { token: string; expiresAt: number };
export type TokenErrorResponse = { error?: string; code?: XaiTokenErrorCode; retryable?: boolean; retryAfterSeconds?: number; diagnosticId?: string };
