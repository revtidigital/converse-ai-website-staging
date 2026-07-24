import { parsePythonAssistantEvent, type PythonAssistantEvent } from "../contracts/python-events.js";
import type { SafeRouteContext } from "../contracts/client-events.js";

export interface AssistantTurnInput {
  conversationId: string;
  requestId: string;
  message: string;
  inputMode: "text" | "voice";
  routeContext?: SafeRouteContext;
}

export class PythonAssistantClient {
  constructor(private readonly baseUrl: string, private readonly timeoutMs: number) {}

  async *streamTurn(input: AssistantTurnInput, abortSignal?: AbortSignal): AsyncGenerator<PythonAssistantEvent> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const abortListener = () => controller.abort();
    abortSignal?.addEventListener("abort", abortListener, { once: true });
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/+$/, "")}/v1/assistant/stream`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "text/event-stream" },
        body: JSON.stringify({
          conversationId: input.conversationId,
          message: input.message,
          inputMode: input.inputMode,
          currentRoute: input.routeContext?.pathname ?? "/",
          currentPageContext: input.routeContext
            ? {
                title: input.routeContext.title,
                metaDescription: input.routeContext.metaDescription,
                headings: input.routeContext.headings
              }
            : null,
          conversationMemory: null
        }),
        signal: controller.signal
      });
      if (!response.ok || !response.body) throw new Error("backend_unavailable");
      for await (const data of parseSseStream(response.body)) {
        const parsedJson = JSON.parse(data) as unknown;
        yield parsePythonAssistantEvent(parsedJson);
      }
    } catch (error) {
      if (controller.signal.aborted || abortSignal?.aborted) throw new Error("cancelled");
      throw error;
    } finally {
      clearTimeout(timeout);
      abortSignal?.removeEventListener("abort", abortListener);
    }
  }
}

export async function* parseSseStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      yield* drainEvents(false);
    }
    buffer += decoder.decode();
    yield* drainEvents(true);
  } finally {
    reader.releaseLock();
  }

  function* drainEvents(final: boolean): Generator<string> {
    buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = eventData(raw);
      if (data !== undefined) yield data;
      boundary = buffer.indexOf("\n\n");
    }
    if (final && buffer.trim()) {
      const data = eventData(buffer);
      buffer = "";
      if (data !== undefined) yield data;
    }
  }
}

function eventData(raw: string): string | undefined {
  const lines = raw.split("\n");
  const data: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  }
  if (!data.length) return undefined;
  return data.join("\n");
}
