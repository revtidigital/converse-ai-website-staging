// Realtime event contract (documented). Client→server and server→client.
// Unknown event types are rejected. Audio frames may be sent as binary; in the
// zero-cost default, STT and TTS run in the browser (Web Speech + Kokoro), so
// the primary path is text.query ⇄ assistant.text.*.

export type ClientEventType =
  | "session.start" | "audio.start" | "audio.chunk" | "audio.stop"
  | "text.query" | "response.cancel" | "session.reset" | "ping";

export type ServerEventType =
  | "session.ready" | "transcript.partial" | "transcript.final"
  | "assistant.thinking" | "assistant.text.delta" | "assistant.text.final"
  | "assistant.sources" | "assistant.action"
  | "assistant.audio.start" | "assistant.audio.chunk" | "assistant.audio.end"
  | "assistant.cancelled" | "error" | "pong";

export const CLIENT_EVENTS = new Set<ClientEventType>([
  "session.start", "audio.start", "audio.chunk", "audio.stop",
  "text.query", "response.cancel", "session.reset", "ping",
]);

export interface ClientEvent {
  type: ClientEventType;
  sessionId?: string;
  requestId?: string;
  text?: string;
  language?: string;
  pageContext?: unknown;
}

export interface ServerEvent {
  type: ServerEventType;
  [k: string]: unknown;
}

export function isValidClientEvent(v: unknown): v is ClientEvent {
  if (!v || typeof v !== "object") return false;
  const t = (v as ClientEvent).type;
  return typeof t === "string" && CLIENT_EVENTS.has(t as ClientEventType);
}
