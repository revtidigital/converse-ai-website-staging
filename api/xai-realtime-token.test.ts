import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "./xai-realtime-token";

type MockRes = { headers: Map<string, string>; statusCode: number; body?: unknown; setHeader: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
const makeRes = (): MockRes => {
  const res: MockRes = { headers: new Map(), statusCode: 0, setHeader: vi.fn(), status: vi.fn(), json: vi.fn() };
  res.setHeader = vi.fn((k: string, v: string) => { res.headers.set(k, v); });
  res.status = vi.fn((code: number) => { res.statusCode = code; return res; });
  res.json = vi.fn((body: unknown) => { res.body = body; return res; });
  return res;
};
const req = (method = "POST", body: unknown = undefined) => ({ method, body, headers: { host: "example.com", origin: "https://example.com", "content-length": "0" }, socket: { remoteAddress: "127.0.0.1" } });

describe("xAI realtime token endpoint", () => {
  beforeEach(() => { process.env.XAI_API_KEY = "permanent-secret"; vi.restoreAllMocks(); vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ value: "temporary-token", expires_at: 1234567890 }) }))); });
  it("POST succeeds with mocked valid xAI response and no-store", async () => { const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(200); expect(res.body).toEqual({ token: "temporary-token", expiresAt: 1234567890 }); expect(res.headers.get("Cache-Control")).toBe("no-store"); expect(JSON.stringify(res.body)).not.toContain("permanent-secret"); });
  it("GET returns 405 with Allow POST", async () => { const res = makeRes(); await handler(req("GET"), res); expect(res.statusCode).toBe(405); expect(res.headers.get("Allow")).toBe("POST"); });
  it("missing XAI_API_KEY returns safe configuration error", async () => { delete process.env.XAI_API_KEY; const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(503); expect(res.body).toEqual({ error: "Voice service is not configured." }); });
  it("xAI non-2xx response is handled safely", async () => { vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({ secret: "raw" }) }))); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(502); expect(JSON.stringify(res.body)).not.toContain("raw"); });
  it("malformed provider response is rejected", async () => { vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ value: 1 }) }))); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(502); });
  it("timeout is handled safely", async () => { vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("Aborted", "AbortError"); })); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(504); });
  it("rejects malformed request bodies", async () => { const res = makeRes(); await handler(req("POST", { unexpected: true }), res); expect(res.statusCode).toBe(400); });
});
