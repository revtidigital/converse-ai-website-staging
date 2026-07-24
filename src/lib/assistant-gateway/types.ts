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
  | { type: "audio.start"; requestId: string; format: { encoding: "pcm_s16le"; sampleRate: 16000; channels: 1 }; routeContext?: GatewayRouteContext }
  | { type: "audio.end"; requestId: string }
  | { type: "audio.cancel"; requestId: string }
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
  | { type: "audio.accepted"; requestId: string }
  | { type: "transcription.started"; requestId: string }
  | { type: "transcript.partial"; requestId: string; text: string; stable: boolean }
  | { type: "transcript.final"; requestId: string; text: string; language?: string }
  | { type: "transcription.completed"; requestId: string }
  | { type: "transcription.cancelled"; requestId: string }
  | { type: "response.error"; requestId?: string; code: string; message: string }
  | { type: "pong"; timestamp: number };

export type AssistantGatewayEventHandler = (event: AssistantGatewayEvent) => void;

export interface AssistantTransport {
  connect(): Promise<void>;
  sendText(requestId: string, message: string, routeContext?: GatewayRouteContext): Promise<void>;
  sendAudioStart?(requestId: string, routeContext?: GatewayRouteContext): void;
  sendAudioFrame?(frame: ArrayBuffer): void;
  sendAudioEnd?(requestId: string): void;
  cancel(requestId: string): void;
  close(): void;
  subscribe(handler: AssistantGatewayEventHandler): () => void;
}
