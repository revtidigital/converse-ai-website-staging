import { parseToolArguments, validateToolArguments } from "./schemas";
import type { XaiFunctionCallRequest, XaiToolExecutionContext, XaiToolExecutorState, XaiToolResult, XaiToolTransport } from "./types";
import { XaiToolRegistry } from "./registry";

const DEFAULT_TOOL_TIMEOUT_MS = 8_000;

interface PendingToolCall {
  request: XaiFunctionCallRequest;
  controller: AbortController;
  done: boolean;
  stale: boolean;
}

export interface XaiToolExecutorOptions {
  registry: XaiToolRegistry;
  transport: XaiToolTransport;
  getState: () => XaiToolExecutorState;
  timeoutMs?: number;
  setToolRunning?: (running: boolean) => void;
}

export class XaiToolExecutor {
  private readonly pendingByResponse = new Map<string, PendingToolCall[]>();
  private readonly timeoutMs: number;

  constructor(private readonly options: XaiToolExecutorOptions) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TOOL_TIMEOUT_MS;
  }

  handleFunctionCall(request: XaiFunctionCallRequest) {
    const current = this.options.getState();
    const call: PendingToolCall = {
      request,
      controller: new AbortController(),
      done: false,
      stale: false,
    };
    const calls = this.pendingByResponse.get(request.responseId) ?? [];
    calls.push(call);
    this.pendingByResponse.set(request.responseId, calls);
    this.options.setToolRunning?.(true);
    void this.execute(call, current);
  }

  cancelAll(reason = "cancelled") {
    for (const calls of this.pendingByResponse.values()) {
      for (const call of calls) {
        call.stale = true;
        call.controller.abort(reason);
      }
    }
    this.pendingByResponse.clear();
    this.options.setToolRunning?.(false);
  }

  private async execute(call: PendingToolCall, initialState: XaiToolExecutorState) {
    const timeout = setTimeout(() => call.controller.abort("tool_timeout"), this.timeoutMs);
    try {
      const result = await this.executeSafely(call, initialState);
      if (this.isStale(call, initialState)) {
        call.stale = true;
        return;
      }
      this.options.transport.sendToolOutput(call.request.callId, result);
    } finally {
      clearTimeout(timeout);
      call.done = true;
      this.maybeContinue(call.request.responseId);
    }
  }

  private async executeSafely(call: PendingToolCall, initialState: XaiToolExecutorState): Promise<XaiToolResult> {
    const tool = this.options.registry.get(call.request.name);
    if (!tool) return { ok: false, code: "unknown_tool", error: `Unknown tool: ${call.request.name}` };

    const parsed = parseToolArguments(call.request.argumentsJson);
    if (!parsed.ok || !parsed.value) return { ok: false, code: parsed.code, error: parsed.error };

    const validated = validateToolArguments(tool.definition.parameters, parsed.value);
    if (!validated.ok || !validated.value) return { ok: false, code: validated.code, error: validated.error };

    const context: XaiToolExecutionContext = {
      ...initialState,
      toolCallId: call.request.callId,
      signal: call.controller.signal,
    };

    try {
      const result = await tool.handler(validated.value, context);
      return result ?? { ok: true };
    } catch (error) {
      if (call.controller.signal.aborted) return { ok: false, code: "cancelled", error: "Tool call was cancelled" };
      return { ok: false, code: "tool_failed", error: error instanceof Error ? error.message : "Tool call failed" };
    }
  }

  private isStale(call: PendingToolCall, initialState: XaiToolExecutorState) {
    const current = this.options.getState();
    return call.stale
      || call.controller.signal.aborted
      || current.sessionId !== initialState.sessionId
      || current.turnId !== initialState.turnId
      || current.routeGenerationId !== initialState.routeGenerationId;
  }

  private maybeContinue(responseId: string) {
    const calls = this.pendingByResponse.get(responseId) ?? [];
    if (!calls.length) return;
    if (calls.some((call) => !call.done)) return;
    this.pendingByResponse.delete(responseId);
    this.options.setToolRunning?.(this.pendingByResponse.size > 0);
    const hasFreshOutput = calls.some((call) => !call.stale && !call.controller.signal.aborted);
    if (hasFreshOutput) this.options.transport.requestResponseContinuation(responseId);
  }
}
