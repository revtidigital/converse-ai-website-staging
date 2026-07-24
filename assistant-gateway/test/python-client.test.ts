import { describe, expect, it, vi } from "vitest";

async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of source) items.push(item);
  return items;
}
import { parseSseStream, PythonAssistantClient } from "../src/clients/python-assistant-client.js";

function streamFrom(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    }
  });
}

describe("PythonAssistantClient SSE handling", () => {
  it("parses fragmented, multiline and multiple SSE events", async () => {
    const stream = streamFrom(': comment\r\ndata: {"a":1}\r\n\r\ndata: line1\ndata: line2\n\n');
    await expect(collect(parseSseStream(stream))).resolves.toEqual(['{"a":1}', 'line1\nline2']);
  });

  it("streams started, delta and completed backend events", async () => {
    const body = streamFrom([
      'data: {"type":"response.started","requestId":"p","conversationId":"c"}\n\n',
      'data: {"type":"response.delta","requestId":"p","conversationId":"c","delta":"Hi"}\n\n',
      'data: {"type":"response.completed","requestId":"p","conversationId":"c","assistantMessage":"Hi","sources":[],"toolActions":[]}\n\n'
    ].join(""));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } })));
    const client = new PythonAssistantClient("http://python.test", 1000);
    const events = [];
    for await (const event of client.streamTurn({ conversationId: "c", requestId: "r", message: "hello", inputMode: "text" })) events.push(event.type);
    expect(events).toEqual(["response.started", "response.delta", "response.completed"]);
    vi.unstubAllGlobals();
  });

  it("propagates cancellation with AbortController", async () => {
    vi.stubGlobal("fetch", vi.fn((_url, init) => new Promise((_resolve, reject) => {
      const signal = (init as RequestInit).signal;
      signal?.addEventListener("abort", () => reject(new Error("aborted")));
    })));
    const controller = new AbortController();
    const client = new PythonAssistantClient("http://python.test", 10000);
    const promise = collect(client.streamTurn({ conversationId: "c", requestId: "r", message: "hello", inputMode: "text" }, controller.signal));
    controller.abort();
    await expect(promise).rejects.toThrow("cancelled");
    vi.unstubAllGlobals();
  });
});
