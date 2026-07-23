import { beforeEach, describe, expect, it, vi } from "vitest";
import { XaiToolExecutor } from "@/lib/voice/xai/tools/executor";
import { createXaiToolRegistry } from "@/lib/voice/xai/tools/registry";
import type { XaiRegisteredTool, XaiToolResult } from "@/lib/voice/xai/tools/types";

const echoTool: XaiRegisteredTool<{ message: string }> = {
  definition: {
    type: "function",
    name: "echo_tool",
    description: "Echo a short message.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["message"],
      properties: { message: { type: "string", minLength: 1, maxLength: 40 } },
    },
  },
  handler: async (args) => ({ ok: true, data: { echoed: args.message } }),
};

function createExecutor(overrides: Partial<{ turnId: number; timeoutMs: number; tool: XaiRegisteredTool; handler: XaiRegisteredTool["handler"] }> = {}) {
  const outputs: Array<{ callId: string; output: XaiToolResult }> = [];
  const continuations: Array<string | undefined> = [];
  const registry = createXaiToolRegistry([{ ...echoTool, handler: overrides.handler ?? overrides.tool?.handler ?? echoTool.handler }]);
  const executor = new XaiToolExecutor({
    registry,
    timeoutMs: overrides.timeoutMs ?? 1000,
    transport: {
      sendToolOutput: (callId, output) => outputs.push({ callId, output }),
      requestResponseContinuation: (responseId) => continuations.push(responseId),
    },
    getState: () => ({ sessionId: "session", turnId: overrides.turnId ?? 1, routeGenerationId: 1, currentRoute: "/" }),
  });
  return { executor, outputs, continuations };
}

const call = (args: string, callId = "call_1", responseId = "resp_1", name = "echo_tool") => ({ responseId, callId, name, argumentsJson: args });

describe("XaiToolExecutor", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  it("executes a valid allowlisted tool and continues once", async () => {
    const { executor, outputs, continuations } = createExecutor();
    executor.handleFunctionCall(call(JSON.stringify({ message: "hello" })));
    await vi.waitFor(() => expect(outputs).toHaveLength(1));
    expect(outputs[0]).toMatchObject({ callId: "call_1", output: { ok: true, data: { echoed: "hello" } } });
    expect(continuations).toEqual(["resp_1"]);
  });

  it("rejects unknown tools, malformed JSON, schema failures, and oversized strings", async () => {
    const { executor, outputs, continuations } = createExecutor();
    executor.handleFunctionCall(call("{}", "unknown", "resp_1", "missing_tool"));
    executor.handleFunctionCall(call("{nope", "bad_json", "resp_2"));
    executor.handleFunctionCall(call(JSON.stringify({ message: "ok", extra: true }), "schema", "resp_3"));
    executor.handleFunctionCall(call(JSON.stringify({ message: "x".repeat(41) }), "oversized", "resp_4"));
    await vi.waitFor(() => expect(outputs).toHaveLength(4));
    expect(outputs.map((entry) => entry.output.code)).toEqual(["unknown_tool", "malformed_json", "schema_validation_failed", "schema_validation_failed"]);
    expect(continuations).toHaveLength(4);
  });

  it("supports parallel calls and sends one response.create after all outputs for a response", async () => {
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const { executor, outputs, continuations } = createExecutor({ handler: async (args) => { if (args.message === "slow") await blocked; return { ok: true, data: args }; } });
    executor.handleFunctionCall(call(JSON.stringify({ message: "slow" }), "slow", "resp_1"));
    executor.handleFunctionCall(call(JSON.stringify({ message: "fast" }), "fast", "resp_1"));
    await vi.waitFor(() => expect(outputs).toHaveLength(1));
    expect(continuations).toHaveLength(0);
    release();
    await vi.waitFor(() => expect(outputs).toHaveLength(2));
    expect(continuations).toEqual(["resp_1"]);
  });

  it("cancels stale or explicitly stopped calls without returning output", async () => {
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const { executor, outputs, continuations } = createExecutor({ handler: async () => { await blocked; return { ok: true }; } });
    executor.handleFunctionCall(call(JSON.stringify({ message: "wait" })));
    executor.cancelAll("explicit_stop");
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(outputs).toHaveLength(0);
    expect(continuations).toHaveLength(0);
  });

  it("times out tool calls and aborts their signal", async () => {
    vi.useFakeTimers();
    const { executor, outputs, continuations } = createExecutor({ timeoutMs: 10, handler: (_args, context) => new Promise((resolve) => {
      context.signal.addEventListener("abort", () => resolve({ ok: false, code: "cancelled", error: "aborted" }));
    }) });
    executor.handleFunctionCall(call(JSON.stringify({ message: "timeout" })));
    await vi.advanceTimersByTimeAsync(10);
    await vi.waitFor(() => expect(outputs).toHaveLength(0));
    expect(continuations).toHaveLength(0);
  });

  it("ignores stale route or turn results", async () => {
    let turnId = 1;
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const outputs: Array<{ callId: string; output: XaiToolResult }> = [];
    const continuations: Array<string | undefined> = [];
    const executor = new XaiToolExecutor({
      registry: createXaiToolRegistry([{ ...echoTool, handler: async () => { await blocked; return { ok: true }; } }]),
      transport: { sendToolOutput: (callId, output) => outputs.push({ callId, output }), requestResponseContinuation: (responseId) => continuations.push(responseId) },
      getState: () => ({ sessionId: "session", turnId, routeGenerationId: 1, currentRoute: "/" }),
    });
    executor.handleFunctionCall(call(JSON.stringify({ message: "wait" })));
    turnId = 2;
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(outputs).toHaveLength(0);
    expect(continuations).toHaveLength(0);
  });
});
