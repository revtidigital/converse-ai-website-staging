import { beforeEach, describe, expect, it, vi } from "vitest";
import { XaiRealtimeClient } from "@/lib/voice/xai/XaiRealtimeClient";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  sent: string[] = [];
  static instances: MockWebSocket[] = [];
  constructor(public url: string, public protocols?: string[]) { MockWebSocket.instances.push(this); }
  open() { this.readyState = MockWebSocket.OPEN; this.onopen?.(); }
  close() { this.readyState = MockWebSocket.CLOSED; this.onclose?.(); }
  send(data: string) { this.sent.push(data); }
  server(event: unknown) { this.onmessage?.({ data: JSON.stringify(event) }); }
}

describe("XaiRealtimeClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ token: "client-secret", expiresAt: 999999 }) } as Response);
  });

  it("connects with an ephemeral token protocol and sends production session.update", async () => {
    const client = new XaiRealtimeClient({ WebSocketCtor: MockWebSocket as unknown as typeof WebSocket, connectTimeoutMs: 1000 });
    const events: string[] = [];
    client.on((event) => { if (event.type === "status") events.push(event.state); });
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;

    expect(MockWebSocket.instances[0].url).toContain("agent_ZpYaLI0fdpzwPPAr");
    expect(MockWebSocket.instances[0].protocols).toEqual(["xai-client-secret.client-secret"]);
    const sessionUpdate = JSON.parse(MockWebSocket.instances[0].sent[0]);
    expect(sessionUpdate).toMatchObject({
      type: "session.update",
      session: {
        resumption: { enabled: true },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            transcription: { model: "grok-transcribe", language: "en" },
            turn_detection: { type: "server_vad", prefix_padding_ms: 300, silence_duration_ms: 550 },
          },
          output: { format: { type: "audio/pcm", rate: 24000 } },
        },
      },
    });
    expect(sessionUpdate.session.instructions).toContain("Do not invent website facts");
    expect(sessionUpdate.session.instructions).toContain("ConverseAI");
    client.disconnect();
    expect(events).toContain("closed");
  });


  it("registers custom tool definitions and emits function-call argument completion", async () => {
    const client = new XaiRealtimeClient({
      WebSocketCtor: MockWebSocket as unknown as typeof WebSocket,
      tools: [{
        type: "function",
        name: "test_tool",
        description: "Test tool.",
        parameters: { type: "object", additionalProperties: false, properties: { value: { type: "string" } } },
      }],
    });
    const calls: string[] = [];
    client.on((event) => { if (event.type === "function_call_arguments_done") calls.push(`${event.name}:${event.callId}:${event.argumentsJson}`); });
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;
    const sessionUpdate = JSON.parse(MockWebSocket.instances[0].sent[0]);
    expect(sessionUpdate.session.tools).toEqual([expect.objectContaining({ name: "test_tool", type: "function" })]);
    expect(sessionUpdate.session.tool_choice).toBe("auto");

    MockWebSocket.instances[0].server({ type: "response.function_call_arguments.done", response_id: "resp", call_id: "call", name: "test_tool", arguments: "{\"value\":\"ok\"}" });
    expect(calls).toEqual(['test_tool:call:{"value":"ok"}']);

    client.sendToolOutput("call", { ok: true });
    client.requestResponseContinuation();
    expect(MockWebSocket.instances[0].sent.map((message) => JSON.parse(message).type)).toEqual(expect.arrayContaining(["conversation.item.create", "response.create"]));
  });

  it("captures conversation IDs and resumes with the saved conversation on reconnect", async () => {
    const client = new XaiRealtimeClient({ WebSocketCtor: MockWebSocket as unknown as typeof WebSocket, reconnectBaseDelayMs: 10, maxReconnectAttempts: 1 });
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;
    MockWebSocket.instances[0].server({ type: "conversation.created", conversation: { id: "conv_123" } });
    expect(client.getConversationId()).toBe("conv_123");

    MockWebSocket.instances[0].close();
    await vi.advanceTimersByTimeAsync(10);
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(MockWebSocket.instances[1].url).toContain("conversation_id=conv_123");
  });

  it("maps current xAI realtime event names", async () => {
    const client = new XaiRealtimeClient({ WebSocketCtor: MockWebSocket as unknown as typeof WebSocket });
    const events: string[] = [];
    client.on((event) => events.push(event.type));
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;

    MockWebSocket.instances[0].server({ type: "session.updated" });
    MockWebSocket.instances[0].server({ type: "input_audio_buffer.speech_started" });
    MockWebSocket.instances[0].server({ type: "input_audio_buffer.speech_stopped" });
    MockWebSocket.instances[0].server({ type: "conversation.item.input_audio_transcription.updated", transcript: "hel" });
    MockWebSocket.instances[0].server({ type: "conversation.item.input_audio_transcription.completed", transcript: "hello" });
    MockWebSocket.instances[0].server({ type: "response.created", response_id: "resp_1" });
    MockWebSocket.instances[0].server({ type: "response.output_item.added", response_id: "resp_1", item: { id: "item_1" } });
    MockWebSocket.instances[0].server({ type: "response.output_audio.delta", delta: "abc" });
    MockWebSocket.instances[0].server({ type: "response.output_audio_transcript.delta", delta: "Hi" });
    MockWebSocket.instances[0].server({ type: "response.done", response_id: "resp_1" });

    expect(events).toEqual(expect.arrayContaining([
      "session_configured",
      "speech_started",
      "speech_stopped",
      "input_transcript",
      "response_created",
      "response_output_item_added",
      "output_audio_delta",
      "response_transcript_delta",
      "response_done",
    ]));
  });

  it("reconnects with bounded exponential backoff and stops after explicit disconnect", async () => {
    const client = new XaiRealtimeClient({ WebSocketCtor: MockWebSocket as unknown as typeof WebSocket, reconnectBaseDelayMs: 10, maxReconnectAttempts: 1 });
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;
    MockWebSocket.instances[0].close();
    await vi.advanceTimersByTimeAsync(10);
    expect(MockWebSocket.instances).toHaveLength(2);
    client.disconnect();
    MockWebSocket.instances[1].close();
    await vi.advanceTimersByTimeAsync(100);
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});
