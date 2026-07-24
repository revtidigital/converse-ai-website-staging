export interface SafeSource { title: string; route: string; canonicalUrl?: string; heading?: string; snippet?: string; contentType?: string }
export type PythonAssistantEvent =
  | { type: "response.started"; requestId: string; conversationId: string }
  | { type: "response.delta"; requestId: string; conversationId: string; delta: string }
  | { type: "response.completed"; requestId: string; conversationId: string; assistantMessage?: string; sources: SafeSource[]; toolActions: unknown[] }
  | { type: "response.error"; requestId: string; conversationId: string; error: { code: string; message: string; retryable: boolean } };

export type SafeErrorCode = "BAD_REQUEST" | "BACKEND_UNAVAILABLE" | "BACKEND_TIMEOUT" | "CANCELLED" | "CONFLICT" | "PAYLOAD_TOO_LARGE" | "RATE_LIMITED" | "UNAUTHORIZED_ORIGIN" | "VALIDATION_ERROR" | "STREAM_ERROR" | "AUDIO_NOT_ENABLED" | "VOICE_UNAVAILABLE" | "VOICE_INVALID_RESPONSE" | "AUDIO_FORMAT_UNSUPPORTED" | "AUDIO_LIMIT_EXCEEDED" | "INTERNAL_ERROR";
export type GatewayEvent =
  | { type: "session.ready"; sessionId: string }
  | { type: "response.started"; requestId: string }
  | { type: "response.delta"; requestId: string; text: string }
  | { type: "response.completed"; requestId: string; sources?: SafeSource[] }
  | { type: "response.cancelled"; requestId: string }
  | { type: "audio.accepted"; requestId: string }
  | { type: "transcription.started"; requestId: string }
  | { type: "transcript.partial"; requestId: string; text: string; stable: boolean }
  | { type: "transcript.final"; requestId: string; text: string; language?: string }
  | { type: "transcription.completed"; requestId: string }
  | { type: "transcription.cancelled"; requestId: string }
  | { type: "response.error"; requestId?: string; code: SafeErrorCode; message: string }
  | { type: "pong"; timestamp: number };

function isSafeSource(value: unknown): value is SafeSource {
  if (!value || typeof value !== "object") return false;
  const source = value as Partial<SafeSource>;
  return typeof source.title === "string" && source.title.length <= 160 && typeof source.route === "string" && source.route.startsWith("/") && !source.route.startsWith("//");
}

export function parsePythonAssistantEvent(value: unknown): PythonAssistantEvent {
  if (!value || typeof value !== "object") throw new Error("invalid_python_event");
  const event = value as Record<string, unknown>;
  if (event.type === "response.started" && typeof event.requestId === "string" && typeof event.conversationId === "string") return event as PythonAssistantEvent;
  if (event.type === "response.delta" && typeof event.requestId === "string" && typeof event.conversationId === "string" && typeof event.delta === "string") return event as PythonAssistantEvent;
  if (event.type === "response.completed" && typeof event.requestId === "string" && typeof event.conversationId === "string") {
    return { requestId: event.requestId, conversationId: event.conversationId, assistantMessage: typeof event.assistantMessage === "string" ? event.assistantMessage : undefined, type: "response.completed", sources: Array.isArray(event.sources) ? event.sources.filter(isSafeSource) : [], toolActions: [] };
  }
  if (event.type === "response.error" && typeof event.requestId === "string" && typeof event.conversationId === "string" && typeof event.error === "object") return event as PythonAssistantEvent;
  throw new Error("invalid_python_event");
}
