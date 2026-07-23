import { logXaiVoiceDiagnostic } from "../diagnostics";
import { toolSchemas } from "./schemas";
import { isKnownTool, toolHandlers } from "./registry";
import { MAX_ARGUMENT_BYTES, MAX_RESULT_BYTES, MAX_TOOL_CALLS_PER_SESSION, MAX_TOOL_CALLS_PER_TURN, TOOL_TIMEOUT_MS, type PendingToolCall, type ToolExecutionContext, type ToolOutputItem, type ToolResult } from "./types";

function byteLength(value: string) { return new TextEncoder().encode(value).length; }
function safeJson(value: unknown) { const json = JSON.stringify(value); return byteLength(json) > MAX_RESULT_BYTES ? JSON.stringify({ ok: false, error: { code: "result_too_large", message: "Tool result was too large." } }) : json; }
function output(callId: string, result: ToolResult): ToolOutputItem { return { type: "conversation.item.create", item: { type: "function_call_output", call_id: callId, output: safeJson(result) } }; }
function abortError(code: string, message: string): ToolResult { return { ok: false, error: { code, message } }; }

export class XaiToolExecutor {
  private turnController: AbortController | null = null;
  private sessionCalls = 0;

  beginTurn() { this.turnController?.abort("new-turn"); this.turnController = new AbortController(); }
  cancel(reason = "cancelled") { this.turnController?.abort(reason); }
  reset() { this.cancel("reset"); this.turnController = null; this.sessionCalls = 0; }

  async executeBatch(calls: PendingToolCall[], baseContext: Omit<ToolExecutionContext, "signal">) {
    if (!this.turnController) this.beginTurn();
    const turnSignal = this.turnController!.signal;
    const limited = calls.slice(0, MAX_TOOL_CALLS_PER_TURN);
    if (calls.length > MAX_TOOL_CALLS_PER_TURN) limited.push(...[]);
    const results = await Promise.all(limited.map((call) => this.executeOne(call, baseContext, turnSignal)));
    return { outputs: results, shouldContinue: !turnSignal.aborted && results.length > 0 };
  }

  private async executeOne(call: PendingToolCall, baseContext: Omit<ToolExecutionContext, "signal">, turnSignal: AbortSignal): Promise<ToolOutputItem> {
    const started = performance.now();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort("timeout"), TOOL_TIMEOUT_MS);
    const abort = () => controller.abort(turnSignal.reason || "cancelled");
    turnSignal.addEventListener("abort", abort, { once: true });
    try {
      if (turnSignal.aborted) return output(call.callId, abortError("cancelled", "Tool call was cancelled."));
      if (this.sessionCalls >= MAX_TOOL_CALLS_PER_SESSION) return output(call.callId, abortError("tool_limit", "Tool call limit reached."));
      this.sessionCalls += 1;
      if (!isKnownTool(call.name)) return output(call.callId, abortError("unknown_tool", "Tool is not available."));
      if (byteLength(call.argumentsJson) > MAX_ARGUMENT_BYTES) return output(call.callId, abortError("arguments_too_large", "Tool arguments were too large."));
      let parsed: unknown;
      try { parsed = call.argumentsJson ? JSON.parse(call.argumentsJson) : {}; } catch { return output(call.callId, abortError("malformed_json", "Tool arguments were malformed.")); }
      const schemaResult = toolSchemas[call.name].safeParse(parsed);
      if (!schemaResult.success) return output(call.callId, abortError("schema_error", "Tool arguments failed validation."));
      if (call.routeGeneration !== baseContext.routeGeneration || call.turnGeneration !== baseContext.turnGeneration) return output(call.callId, abortError("stale_call", "Tool call is stale."));
      const result = await toolHandlers[call.name](schemaResult.data, { ...baseContext, signal: controller.signal });
      if (controller.signal.aborted || turnSignal.aborted) return output(call.callId, abortError("cancelled", "Tool call was cancelled."));
      logXaiVoiceDiagnostic({ type: "tool_finished", toolName: call.name, durationMs: Math.round(performance.now() - started), success: result.ok, routeGeneration: call.routeGeneration, resultSize: byteLength(JSON.stringify(result)) });
      return output(call.callId, result);
    } catch (error) {
      const category = controller.signal.aborted ? "timeout_or_cancelled" : "handler_error";
      logXaiVoiceDiagnostic({ type: "tool_failed", toolName: call.name, durationMs: Math.round(performance.now() - started), category, routeGeneration: call.routeGeneration });
      return output(call.callId, abortError(category, "Tool could not be completed."));
    } finally {
      window.clearTimeout(timeout);
      turnSignal.removeEventListener("abort", abort);
    }
  }
}
