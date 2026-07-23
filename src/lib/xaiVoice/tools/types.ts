export const TOOL_TIMEOUT_MS = 3500;
export const MAX_ARGUMENT_BYTES = 4096;
export const MAX_RESULT_BYTES = 12000;
export const MAX_TOOL_CALLS_PER_TURN = 4;
export const MAX_TOOL_CALLS_PER_SESSION = 24;

export type XaiVoiceToolName =
  | "get_current_page_context"
  | "search_site_knowledge"
  | "get_available_page_actions"
  | "navigate_to_page"
  | "get_contact_form_schema"
  | "get_contact_draft"
  | "set_contact_field"
  | "clear_contact_field"
  | "reset_contact_form"
  | "request_contact_submission"
  | "get_contact_submission_result"
  | "get_blog_reading_info"
  | "list_blog_sections"
  | "start_blog_reading"
  | "get_next_blog_chunk"
  | "pause_blog_reading"
  | "resume_blog_reading"
  | "stop_blog_reading"
  | "restart_blog_reading"
  | "go_to_next_blog_section"
  | "go_to_previous_blog_section"
  | "read_blog_section"
  | "get_blog_reading_state";

export type ToolExecutionContext = {
  route: string;
  routeGeneration: number;
  turnGeneration: number;
  signal: AbortSignal;
  navigate?: (route: string) => void;
  waitForRouteRender?: (route: string, anchor?: string, signal?: AbortSignal) => Promise<string>;
};

export type ToolResult = { ok: true; data: unknown } | { ok: false; error: { code: string; message: string } };
export type ToolHandler<TArgs = unknown> = (args: TArgs, context: ToolExecutionContext) => Promise<ToolResult> | ToolResult;

export type XaiFunctionDefinition = {
  type: "function";
  name: XaiVoiceToolName;
  description: string;
  parameters: Record<string, unknown>;
};

export type PendingToolCall = {
  callId: string;
  name: string;
  argumentsJson: string;
  responseId?: string;
  routeGeneration: number;
  turnGeneration: number;
};

export type ToolOutputItem = {
  type: "conversation.item.create";
  item: { type: "function_call_output"; call_id: string; output: string };
};
