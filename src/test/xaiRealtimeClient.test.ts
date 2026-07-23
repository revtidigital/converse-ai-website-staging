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
}

describe("XaiRealtimeClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ token: "client-secret", expiresAt: 999999 }) } as Response);
  });

  it("connects with an ephemeral token protocol and disconnects", async () => {
    const client = new XaiRealtimeClient({ WebSocketCtor: MockWebSocket as unknown as typeof WebSocket, connectTimeoutMs: 1000 });
    const events: string[] = [];
    client.on((event) => { if (event.type === "status") events.push(event.state); });
    const connect = client.connect();
    await vi.waitFor(() => expect(MockWebSocket.instances.length).toBe(1));
    MockWebSocket.instances[0].open();
    await connect;

    expect(MockWebSocket.instances[0].url).toContain("agent_ZpYaLI0fdpzwPPAr");
    expect(MockWebSocket.instances[0].protocols).toEqual(["xai-client-secret.client-secret"]);
    client.disconnect();
    expect(events).toContain("closed");
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
