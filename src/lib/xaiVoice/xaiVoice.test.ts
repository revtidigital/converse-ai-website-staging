import { describe, expect, it, vi, beforeEach } from "vitest";
import { floatToPcm16LittleEndian, pcm16LittleEndianToFloat, resampleLinear, arrayBufferToBase64, base64ToArrayBuffer } from "./pcm";
import { XAI_REALTIME_URL, XAI_SESSION_UPDATE } from "./types";
import { XaiRealtimeClient } from "./XaiRealtimeClient";

describe("xAI PCM utilities", () => {
  it("clamps Float32 samples and writes little-endian PCM16", () => {
    const view = new DataView(floatToPcm16LittleEndian(new Float32Array([-2, -1, 0, 1, 2])));
    expect(view.getInt16(0, true)).toBe(-32768); expect(view.getInt16(2, true)).toBe(-32768); expect(view.getInt16(4, true)).toBe(0); expect(view.getInt16(6, true)).toBe(32767); expect(view.getInt16(8, true)).toBe(32767);
  });
  it("resamples to expected lengths and preserves mono ordering", () => {
    const out = resampleLinear(new Float32Array([0, 1, 2, 3]), 48000, 24000);
    expect(out).toHaveLength(2); expect(Array.from(out)).toEqual([0, 2]);
  });
  it("base64 round trips large chunks without spread calls", () => {
    const data = new Uint8Array(100_000); data.forEach((_, i) => { data[i] = i % 255; });
    expect(new Uint8Array(base64ToArrayBuffer(arrayBufferToBase64(data.buffer)))).toEqual(data);
  });
  it("decodes PCM16 back to Float32", () => expect(pcm16LittleEndianToFloat(floatToPcm16LittleEndian(new Float32Array([0.5])))[0]).toBeGreaterThan(0.49));
});

describe("xAI realtime client", () => {
  class MockWebSocket extends EventTarget { static instances: MockWebSocket[] = []; static OPEN = 1; static CONNECTING = 0; readyState = 0; bufferedAmount = 0; sent: string[] = []; constructor(public url: string, public protocols?: string[]) { super(); MockWebSocket.instances.push(this); } send(data: string) { this.sent.push(data); } close() { this.readyState = 3; } open() { this.readyState = 1; this.dispatchEvent(new Event("open")); } message(data: unknown) { this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) })); } }
  beforeEach(() => { MockWebSocket.instances = []; vi.stubGlobal("WebSocket", MockWebSocket); vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ token: "temp-token-1", expiresAt: 123 }) }))); });
  it("uses exact agent URL, native WebSocket, and subprotocol auth without URL token", async () => {
    const client = new XaiRealtimeClient(); await client.connect();
    expect(MockWebSocket.instances[0].url).toBe(XAI_REALTIME_URL); expect(MockWebSocket.instances[0].url).not.toContain("temp-token"); expect(MockWebSocket.instances[0].protocols).toEqual(["xai-client-secret.temp-token-1"]);
  });
  it("sends only expected technical session.update", async () => {
    const client = new XaiRealtimeClient(); await client.connect(); MockWebSocket.instances[0].open();
    const payload = JSON.parse(MockWebSocket.instances[0].sent[0]); expect(payload).toEqual(XAI_SESSION_UPDATE); expect(JSON.stringify(payload)).not.toMatch(/instructions|voice|tools/);
  });
  it("safely ignores unknown and malformed events", async () => {
    const onEvent = vi.fn(); const client = new XaiRealtimeClient({ onEvent }); await client.connect(); const ws = MockWebSocket.instances[0]; ws.open(); ws.message({ type: "unknown.event" }); ws.dispatchEvent(new MessageEvent("message", { data: "{" })); expect(onEvent).toHaveBeenCalledTimes(1);
  });
  it("blocks duplicate connections and explicit stop prevents reconnect", async () => {
    const client = new XaiRealtimeClient(); await client.connect(); await expect(client.connect()).rejects.toThrow(/already active/); await client.stop(); expect(MockWebSocket.instances).toHaveLength(1);
  });
});
