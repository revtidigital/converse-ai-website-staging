import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/xai-realtime-token";

type JsonBody = Record<string, unknown>;
function mockReq(method = "POST") {
  return { method, headers: { host: "localhost:5173", origin: "http://localhost:5173" }, socket: { remoteAddress: "127.0.0.1" } } as never;
}
function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined as JsonBody | undefined,
    headers: {} as Record<string, string>,
    setHeader: vi.fn((key: string, value: string) => { res.headers[key] = value; }),
    status: vi.fn((code: number) => { res.statusCode = code; return res; }),
    json: vi.fn((body: JsonBody) => { res.body = body; return res; }),
    end: vi.fn(() => res),
  };
  return res as never as typeof res;
}

describe("xAI realtime token endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.XAI_API_KEY = "server-secret";
  });

  it("returns only an ephemeral token and expiry", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ value: "ephemeral", expires_at: 123456 }) } as Response);
    const res = mockRes();
    await handler(mockReq(), res);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/realtime/client_secrets"), expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer server-secret" }) }));
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ token: "ephemeral", expiresAt: 123456 });
    expect(JSON.stringify(res.body)).not.toContain("server-secret");
  });

  it("returns a safe error when XAI_API_KEY is missing", async () => {
    delete process.env.XAI_API_KEY;
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body?.error).toBe("Voice service is not configured");
  });

  it("returns a safe error on upstream failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.statusCode).toBe(502);
    expect(res.body?.error).toBe("Voice service token request failed");
  });
});
