import { once } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { buildServer } from "../src/server.js";
import { loadConfig } from "../src/config/env.js";

function config() {
  return loadConfig({ NODE_ENV: "test", ALLOWED_ORIGINS: "http://localhost:5173", PYTHON_ASSISTANT_BASE_URL: "http://python.test", REQUEST_TIMEOUT_MS: "1000" });
}

async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = buildServer(config());
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("missing address");
  try {
    return await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
  }
}

describe("gateway HTTP boundaries", () => {
  it("serves health and safe readiness responses", async () => {
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://127.0.0.1:")) return realFetch(input, init);
      return new Response('{"status":"ok"}', { status: 200 });
    }));
    await withServer(async (baseUrl) => {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.status).toBe(200);
      expect(await health.json()).toEqual({ status: "ok", service: "converse-assistant-gateway", version: "0.1.0" });
      const ready = await fetch(`${baseUrl}/health/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({ status: "ready", dependencies: { pythonAssistant: "ready", websocket: "ready" } });
    });
    vi.unstubAllGlobals();
  });

  it("maps unavailable Python readiness safely", async () => {
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://127.0.0.1:")) return realFetch(input, init);
      return new Response("nope", { status: 503 });
    }));
    await withServer(async (baseUrl) => {
      const ready = await fetch(`${baseUrl}/health/ready`);
      expect(ready.status).toBe(503);
      expect(await ready.json()).toEqual({ status: "not_ready", dependencies: { pythonAssistant: "unavailable", websocket: "ready" } });
    });
    vi.unstubAllGlobals();
  });
});
