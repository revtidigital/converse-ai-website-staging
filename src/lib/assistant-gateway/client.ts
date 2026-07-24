import type { AssistantGatewayClientEvent, AssistantGatewayEventHandler, AssistantTransport, GatewayRouteContext } from "./types";
import { normalizeGatewayUrl, parseGatewayEvent, sanitizeRouteContext } from "./validation";

export class WebSocketAssistantTransport implements AssistantTransport {
  private socket: WebSocket | null = null;
  private readonly handlers = new Set<AssistantGatewayEventHandler>();

  constructor(private readonly gatewayUrl: string, private readonly inputMode: "text" | "voice" = "text") {}

  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    const url = `${normalizeGatewayUrl(this.gatewayUrl)}/v1/realtime`;
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(url);
      this.socket = socket;
      socket.addEventListener("open", () => {
        this.send({ type: "session.start", protocolVersion: 1, inputMode: this.inputMode });
        resolve();
      }, { once: true });
      socket.addEventListener("error", () => reject(new Error("Assistant gateway connection failed.")), { once: true });
      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed = parseGatewayEvent(event.data);
          if (parsed) this.handlers.forEach((handler) => handler(parsed));
        } catch {
          this.handlers.forEach((handler) => handler({ type: "response.error", code: "MALFORMED_GATEWAY_EVENT", message: "The assistant gateway sent an invalid event." }));
        }
      });
    });
  }

  async sendText(requestId: string, message: string, routeContext?: GatewayRouteContext): Promise<void> {
    this.send({ type: "text.submit", requestId, message, routeContext: sanitizeRouteContext(routeContext) });
  }

  cancel(requestId: string): void {
    this.send({ type: "response.cancel", requestId });
  }

  close(): void {
    this.send({ type: "session.end" });
    this.socket?.close();
    this.socket = null;
  }

  subscribe(handler: AssistantGatewayEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private send(event: AssistantGatewayClientEvent): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) throw new Error("Assistant gateway is not connected.");
    this.socket.send(JSON.stringify(event));
  }
}

export function createGatewayTransportFromEnv(): WebSocketAssistantTransport | null {
  const value = import.meta.env.VITE_ASSISTANT_GATEWAY_URL as string | undefined;
  if (!value) return null;
  return new WebSocketAssistantTransport(value, "text");
}
