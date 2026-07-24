export interface GatewayRouteContext {
  pathname: string;
  title?: string;
  metaDescription?: string;
  headings?: string[];
}

export type AssistantInputMode = "text" | "voice";

export type AssistantGatewayClientEvent =
  | { type: "session.start"; protocolVersion: 1; inputMode: AssistantInputMode; routeContext?: GatewayRouteContext }
  | { type: "text.submit"; requestId: string; message: string; routeContext?: GatewayRouteContext }
  | { type: "response.cancel"; requestId: string }
  | { type: "session.end" }
  | { type: "ping"; timestamp: number };

export interface GatewaySource {
  title: string;
  route: string;
  canonicalUrl?: string;
  heading?: string;
  snippet?: string;
  contentType?: string;
}

export type AssistantGatewayEvent =
  | { type: "session.ready"; sessionId: string }
  | { type: "response.started"; requestId: string }
  | { type: "response.delta"; requestId: string; text: string }
  | { type: "response.completed"; requestId: string; sources?: GatewaySource[] }
  | { type: "response.cancelled"; requestId: string }
  | { type: "response.error"; requestId?: string; code: string; message: string }
  | { type: "pong"; timestamp: number };

export type AssistantGatewayEventHandler = (event: AssistantGatewayEvent) => void;

export interface AssistantTransport {
  connect(): Promise<void>;
  sendText(requestId: string, message: string, routeContext?: GatewayRouteContext): Promise<void>;
  cancel(requestId: string): void;
  close(): void;
  subscribe(handler: AssistantGatewayEventHandler): () => void;
}
