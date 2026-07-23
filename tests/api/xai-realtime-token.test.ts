import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/xai-realtime-token.js";

type MockRes = { headers: Map<string, string>; statusCode: number; body?: unknown; setHeader: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
const makeRes = (): MockRes => {
  const res: MockRes = { headers: new Map(), statusCode: 0, setHeader: vi.fn(), status: vi.fn(), json: vi.fn() };
  res.setHeader = vi.fn((k: string, v: string) => { res.headers.set(k, v); });
  res.status = vi.fn((code: number) => { res.statusCode = code; return res; });
  res.json = vi.fn((body: unknown) => { res.body = body; return res; });
  return res;
};
const req = (method = "POST", body: unknown = undefined) => ({ method, body, headers: { host: "example.com", origin: "https://example.com", "content-length": "0" }, socket: { remoteAddress: `127.0.0.${Math.floor(Math.random() * 200) + 1}` } });
const upstream = (status: number, body: unknown, headers: Record<string, string> = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: (name: string) => headers[name.toLowerCase()] ?? null }, json: async () => body, text: async () => JSON.stringify(body) });
const bodyText = (value: unknown) => JSON.stringify(value);

describe("xAI realtime token endpoint", () => {
  beforeEach(() => { process.env.XAI_API_KEY = "permanent-secret"; process.env.NODE_ENV = "test"; vi.restoreAllMocks(); vi.stubGlobal("fetch", vi.fn(async () => upstream(200, { value: "temporary-token", expires_at: 1234567890 }))); vi.spyOn(console, "info").mockImplementation(() => undefined); });
  it("POST succeeds with mocked valid xAI response and no-store", async () => { const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(200); expect(res.body).toEqual({ token: "temporary-token", expiresAt: 1234567890 }); expect(res.headers.get("Cache-Control")).toBe("no-store"); expect(bodyText(res.body)).not.toContain("permanent-secret"); });
  it("GET returns 405 with Allow POST", async () => { const res = makeRes(); await handler(req("GET"), res); expect(res.statusCode).toBe(405); expect(res.headers.get("Allow")).toBe("POST"); });
  it("missing XAI_API_KEY returns XAI_NOT_CONFIGURED", async () => { delete process.env.XAI_API_KEY; const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(503); expect(res.body).toMatchObject({ error: "Voice service is not configured.", code: "XAI_NOT_CONFIGURED", retryable: false }); expect(res.body).toMatchObject({ diagnosticId: expect.stringMatching(/^xai_/) }); });
  it.each([[400, "XAI_REQUEST_REJECTED", false, 502], [401, "XAI_INVALID_API_KEY", false, 502], [403, "XAI_PERMISSION_DENIED", false, 502], [500, "XAI_UPSTREAM_UNAVAILABLE", true, 502]])("classifies upstream %s safely", async (status, code, retryable, expectedStatus) => { vi.stubGlobal("fetch", vi.fn(async () => upstream(status as number, { error: { code: "provider_code", type: "provider_type", message: "raw secret details" } }, { "x-request-id": "req_123" }))); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(expectedStatus); expect(res.body).toMatchObject({ code, retryable }); expect(bodyText(res.body)).not.toContain("raw secret details"); expect(bodyText(res.body)).not.toContain("provider_code"); });
  it("classifies upstream 429 and preserves safe Retry-After", async () => { vi.stubGlobal("fetch", vi.fn(async () => upstream(429, { error: { code: "rate_limit" } }, { "retry-after": "7" }))); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(429); expect(res.body).toMatchObject({ code: "XAI_RATE_LIMITED", retryable: true, retryAfterSeconds: 7 }); });
  it("malformed provider response is rejected without returning token-like values", async () => { vi.stubGlobal("fetch", vi.fn(async () => upstream(200, { value: 1, expires_at: "bad", token: "temporary-token" }))); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(502); expect(res.body).toMatchObject({ code: "XAI_INVALID_TOKEN_RESPONSE", retryable: false }); expect(bodyText(res.body)).not.toContain("temporary-token"); });
  it("timeout is handled safely", async () => { vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("Aborted", "AbortError"); })); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(504); expect(res.body).toMatchObject({ code: "XAI_TOKEN_TIMEOUT", retryable: true }); });
  it("network failure is handled safely", async () => { vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network secret"); })); const res = makeRes(); await handler(req(), res); expect(res.statusCode).toBe(502); expect(res.body).toMatchObject({ code: "XAI_TOKEN_NETWORK_ERROR", retryable: true }); expect(bodyText(res.body)).not.toContain("network secret"); });
  it("rejects malformed request bodies", async () => { const res = makeRes(); await handler(req("POST", { unexpected: true }), res); expect(res.statusCode).toBe(400); });
  it("does not log permanent keys or temporary tokens", async () => { const res = makeRes(); await handler(req(), res); const logs = bodyText(vi.mocked(console.info).mock.calls); expect(logs).not.toContain("permanent-secret"); expect(logs).not.toContain("temporary-token"); });
});
