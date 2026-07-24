import { describe, expect, it } from "vitest";
import { parseClientEvent } from "../src/contracts/client-events.js";
import { loadConfig } from "../src/config/env.js";

const routeContext = { pathname: "/services/ai-voice-agents", title: "AI Voice Agents" };

describe("client event contracts", () => {
  it("accepts valid session.start, text.submit and cancellation events", () => {
    expect(parseClientEvent({ type: "session.start", protocolVersion: 1, inputMode: "text", routeContext }, 4000).type).toBe("session.start");
    expect(parseClientEvent({ type: "text.submit", requestId: "r1", message: "Hello", routeContext }, 4000).type).toBe("text.submit");
    expect(parseClientEvent({ type: "response.cancel", requestId: "r1" }, 4000).type).toBe("response.cancel");
  });

  it("rejects malformed protocol, unknown events, oversized messages and unsafe routes", () => {
    expect(() => parseClientEvent({ type: "session.start", protocolVersion: 2, inputMode: "text" }, 4000)).toThrow();
    expect(() => parseClientEvent({ type: "unknown" }, 4000)).toThrow();
    expect(() => parseClientEvent({ type: "text.submit", requestId: "r1", message: "x".repeat(5), routeContext }, 4)).toThrow("message_too_large");
    expect(() => parseClientEvent({ type: "text.submit", requestId: "r1", message: "Hello", routeContext: { pathname: "/admin" } }, 4000)).toThrow();
    expect(() => parseClientEvent({ type: "text.submit", requestId: "r1", message: "Hello", routeContext: { pathname: "javascript:alert(1)" } }, 4000)).toThrow();
  });

  it("keeps fake providers impossible in production gateway origin config", () => {
    expect(() => loadConfig({ NODE_ENV: "production", ALLOWED_ORIGINS: "*", PYTHON_ASSISTANT_BASE_URL: "http://127.0.0.1:8787" })).toThrow("Wildcard origins");
  });
});
