// Frontend realtime client for the assistant-gateway. Owns the WebSocket
// lifecycle, connection status, bounded exponential reconnect, cancellation,
// and safe-action validation on the client side too. STT/TTS stay in the
// browser (Web Speech + Kokoro) in the zero-cost default; this client transports
// the transcript as text.query and receives streamed grounded answers.
//
// IMPORTANT: the gateway URL is ALWAYS explicit (VITE_ASSISTANT_GATEWAY_URL).
// We never fall back to the Vercel frontend origin.

export type ConnectionStatus = "idle" | "connecting" | "open" | "reconnecting" | "unavailable";

export interface GatewaySources { title: string; route: string; sourceType: string }
export interface GatewayAction { type: string; target: string | null }

export interface GatewayHandlers {
  onStatus?: (s: ConnectionStatus) => void;
  onThinking?: () => void;
  onTextDelta?: (delta: string) => void;
  onTextFinal?: (text: string, meta: { language: string; confidence: number; confidenceCategory: string; intent: string }) => void;
  onSources?: (sources: GatewaySources[]) => void;
  onAction?: (action: GatewayAction) => void;
  onCancelled?: () => void;
  onError?: (category: string, message: string) => void;
}

export interface PageContext {
  route?: string | null; title?: string | null; visibleSection?: string | null;
  selectedService?: string | null; selectedProduct?: string | null;
  blogSlug?: string | null; blogTitle?: string | null; currentHeading?: string | null;
  language?: string | null;
}

const MAX_RECONNECT = 5;

// Mirror of the backend allowlist — keeps unsafe actions from ever executing.
const KNOWN_ROUTES = new Set<string>([
  "/", "/about-us", "/contact-us", "/book-demo", "/blog", "/blog-2",
  "/case-studies", "/solutions", "/ai-for-smb", "/services", "/ai-strategy-audit",
  "/start", "/agentic-automation", "/ai-integration", "/ai-voice-agents",
  "/custom-ai-agents", "/knowledge-intelligence", "/sales-ai", "/chatbot",
  "/live-chat", "/pre-chat-forms", "/omni-channel", "/whatsapp-ai-chatbot",
  "/whatsapp-shop", "/whatsapp-marketing", "/teams", "/terms-and-conditions",
  "/privacy-policy", "/thank-you",
]);
const DYN = ["/blog/", "/blog-2/", "/case-studies/", "/services/"];

export function isSafeRoute(route: string): boolean {
  if (!route || !route.startsWith("/") || route.startsWith("//")) return false;
  if (/[a-z]+:/i.test(route.split("?")[0])) return false;
  if (route.includes("..")) return false;
  const path = route.split(/[?#]/)[0];
  if (KNOWN_ROUTES.has(path)) return true;
  return DYN.some((p) => path.startsWith(p) && /^[a-z0-9-]+$/.test(path.slice(p.length)));
}

export class AssistantGatewayClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "idle";
  private attempts = 0;
  private sessionId: string;
  private closedByUser = false;

  constructor(private url: string, private handlers: GatewayHandlers) {
    this.sessionId = `sess-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  getStatus() { return this.status; }
  getSessionId() { return this.sessionId; }

  private set(s: ConnectionStatus) { this.status = s; this.handlers.onStatus?.(s); }

  connect() {
    if (!this.url) { this.set("unavailable"); return; }
    this.closedByUser = false;
    this.set(this.attempts ? "reconnecting" : "connecting");
    try {
      this.ws = new WebSocket(this.url);
    } catch { this.scheduleReconnect(); return; }

    this.ws.onopen = () => { this.attempts = 0; this.set("open"); this.send({ type: "session.start", sessionId: this.sessionId }); };
    this.ws.onmessage = (e) => this.onEvent(e.data);
    this.ws.onerror = () => { /* onclose handles retry */ };
    this.ws.onclose = () => { if (!this.closedByUser) this.scheduleReconnect(); };
  }

  private scheduleReconnect() {
    if (this.closedByUser) return;
    if (this.attempts >= MAX_RECONNECT) { this.set("unavailable"); return; }
    const delay = Math.min(1000 * 2 ** this.attempts, 15000);
    this.attempts++;
    this.set("reconnecting");
    setTimeout(() => this.connect(), delay);
  }

  private onEvent(raw: string) {
    let ev: any;
    try { ev = JSON.parse(raw); } catch { return; }
    switch (ev.type) {
      case "session.ready": if (ev.sessionId) this.sessionId = ev.sessionId; break;
      case "assistant.thinking": this.handlers.onThinking?.(); break;
      case "assistant.text.delta": this.handlers.onTextDelta?.(ev.delta ?? ""); break;
      case "assistant.text.final": this.handlers.onTextFinal?.(ev.text ?? "", { language: ev.language, confidence: ev.confidence, confidenceCategory: ev.confidenceCategory, intent: ev.intent }); break;
      case "assistant.sources": this.handlers.onSources?.(ev.sources ?? []); break;
      case "assistant.action": {
        const a: GatewayAction = ev.action ?? { type: "none", target: null };
        // Client-side re-validation of navigation targets.
        if ((a.type !== "none") && a.target && !isSafeRoute(a.target) && a.type !== "scroll_to_section") {
          this.handlers.onAction?.({ type: "none", target: null });
        } else this.handlers.onAction?.(a);
        break;
      }
      case "assistant.cancelled": this.handlers.onCancelled?.(); break;
      case "error": this.handlers.onError?.(ev.category ?? "error", ev.message ?? ""); break;
      case "pong": break;
    }
  }

  private send(obj: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  /** Send a user query (from transcript or typed input). */
  query(text: string, pageContext?: PageContext, language = "auto") {
    this.send({ type: "text.query", sessionId: this.sessionId, text, pageContext, language });
  }
  cancel() { this.send({ type: "response.cancel", sessionId: this.sessionId }); }
  reset() { this.send({ type: "session.reset", sessionId: this.sessionId }); }
  ping() { this.send({ type: "ping" }); }

  close() { this.closedByUser = true; this.ws?.close(); this.set("idle"); }
}

/** Build the gateway client from env. Returns null when not configured (UI then
 *  shows the "voice temporarily unavailable, you can still type" state). */
export function createGatewayClient(handlers: GatewayHandlers): AssistantGatewayClient | null {
  const url = import.meta.env.VITE_ASSISTANT_GATEWAY_URL as string | undefined;
  if (!url) return null;
  return new AssistantGatewayClient(url, handlers);
}
