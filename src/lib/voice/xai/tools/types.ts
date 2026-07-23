export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export interface XaiToolJsonSchema {
  type: "object";
  properties?: Record<string, XaiToolPropertySchema>;
  required?: string[];
  additionalProperties?: false;
}

export type XaiToolPropertySchema =
  | { type: "string"; minLength?: number; maxLength?: number; enum?: string[] }
  | { type: "number"; minimum?: number; maximum?: number }
  | { type: "integer"; minimum?: number; maximum?: number }
  | { type: "boolean" }
  | { type: "array"; items: XaiToolPropertySchema; maxItems?: number }
  | XaiToolJsonSchema;

export interface XaiToolDefinition {
  type: "function";
  name: string;
  description: string;
  parameters: XaiToolJsonSchema;
}

export interface XaiToolExecutionContext {
  sessionId: string;
  turnId: number;
  routeGenerationId: number;
  toolCallId: string;
  currentRoute: string;
  signal: AbortSignal;
}

export interface XaiToolResult {
  ok: boolean;
  data?: JsonValue;
  error?: string;
  code?: string;
}

export type XaiToolHandler<TArgs extends JsonObject = JsonObject> = (args: TArgs, context: XaiToolExecutionContext) => Promise<XaiToolResult> | XaiToolResult;

export interface XaiRegisteredTool<TArgs extends JsonObject = JsonObject> {
  definition: XaiToolDefinition;
  handler: XaiToolHandler<TArgs>;
}

export interface XaiFunctionCallRequest {
  responseId: string;
  callId: string;
  name: string;
  argumentsJson: string;
  itemId?: string;
}

export interface XaiToolExecutorState {
  sessionId: string;
  turnId: number;
  routeGenerationId: number;
  currentRoute: string;
}

export interface XaiToolTransport {
  sendToolOutput: (callId: string, output: XaiToolResult) => void;
  requestResponseContinuation: (responseId?: string) => void;
}
