export interface SafeRouteContext { pathname: string; title?: string; metaDescription?: string; headings?: string[] }
export type ClientEvent =
  | { type: "session.start"; protocolVersion: 1; inputMode: "text" | "voice"; routeContext?: SafeRouteContext }
  | { type: "text.submit"; requestId: string; message: string; routeContext?: SafeRouteContext }
  | { type: "response.cancel"; requestId: string }
  | { type: "session.end" }
  | { type: "ping"; timestamp: number }
  | { type: "audio.start" | "audio.chunk" | "audio.end" | "audio.cancel"; requestId?: string };

function hasControlCharacters(value: string): boolean { return /\p{Cc}/u.test(value); }

export function isSafeRouteContext(context: unknown): context is SafeRouteContext {
  if (!context || typeof context !== "object") return false;
  const value = context as Partial<SafeRouteContext>;
  if (typeof value.pathname !== "string" || value.pathname.length > 512) return false;
  const path = value.pathname;
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (/^(javascript|data|file|blob):/i.test(path) || hasControlCharacters(path)) return false;
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.includes("..") || decoded.includes("\\")) return false;
  } catch {
    return false;
  }
  if (path === "/admin" || path.startsWith("/admin/") || path === "/api" || path.startsWith("/api/")) return false;
  if (value.title !== undefined && (typeof value.title !== "string" || value.title.length > 160)) return false;
  if (value.metaDescription !== undefined && (typeof value.metaDescription !== "string" || value.metaDescription.length > 300)) return false;
  if (value.headings !== undefined && (!Array.isArray(value.headings) || value.headings.length > 8 || value.headings.some((item) => typeof item !== "string" || item.length > 120))) return false;
  return true;
}

function validRequestId(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= 80; }

export function parseClientEvent(json: unknown, maxTextLength: number): ClientEvent {
  if (!json || typeof json !== "object") throw new Error("invalid_event");
  const event = json as Record<string, unknown>;
  if (typeof event.type !== "string") throw new Error("invalid_event");
  if (event.type === "session.start") {
    if (event.protocolVersion !== 1 || (event.inputMode !== "text" && event.inputMode !== "voice")) throw new Error("invalid_session_start");
    if (event.routeContext !== undefined && !isSafeRouteContext(event.routeContext)) throw new Error("unsafe_route");
    return event as ClientEvent;
  }
  if (event.type === "text.submit") {
    if (!validRequestId(event.requestId) || typeof event.message !== "string" || !event.message.trim()) throw new Error("invalid_text_submit");
    if (event.message.length > maxTextLength) throw new Error("message_too_large");
    if (event.routeContext !== undefined && !isSafeRouteContext(event.routeContext)) throw new Error("unsafe_route");
    return event as ClientEvent;
  }
  if (event.type === "response.cancel") {
    if (!validRequestId(event.requestId)) throw new Error("invalid_cancel");
    return event as ClientEvent;
  }
  if (event.type === "session.end") return { type: "session.end" };
  if (event.type === "ping") {
    if (typeof event.timestamp !== "number" || !Number.isFinite(event.timestamp)) throw new Error("invalid_ping");
    return event as ClientEvent;
  }
  if (["audio.start", "audio.chunk", "audio.end", "audio.cancel"].includes(event.type)) throw new Error("audio_not_enabled");
  throw new Error("unknown_event");
}
