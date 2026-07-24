import { describe, expect, it } from "vitest";
import { isSafeInternalRoute, normalizeGatewayUrl, parseGatewayEvent, sanitizeRouteContext } from "../lib/assistant-gateway/validation";

describe("assistant gateway browser boundary", () => {
  it("validates gateway websocket URLs", () => {
    expect(normalizeGatewayUrl("ws://127.0.0.1:8790/")).toBe("ws://127.0.0.1:8790");
    expect(() => normalizeGatewayUrl("http://127.0.0.1:8790")).toThrow();
    expect(() => normalizeGatewayUrl("javascript:alert(1)")).toThrow();
  });

  it("rejects unsafe route context and avoids page HTML", () => {
    expect(isSafeInternalRoute("/")).toBe(true);
    expect(isSafeInternalRoute("/blog/example")).toBe(true);
    expect(isSafeInternalRoute("/admin")).toBe(false);
    expect(isSafeInternalRoute("/api/secret")).toBe(false);
    expect(isSafeInternalRoute("//evil.test/path")).toBe(false);
    expect(isSafeInternalRoute("/%2e%2e/admin")).toBe(false);
    expect(sanitizeRouteContext({ pathname: "/services", title: "x".repeat(200), headings: Array(12).fill("h") })?.title).toHaveLength(160);
    expect(sanitizeRouteContext({ pathname: "/admin", title: "private" })).toBeUndefined();
  });

  it("filters unsafe source metadata", () => {
    const completed = parseGatewayEvent(JSON.stringify({
      type: "response.completed",
      requestId: "r",
      sources: [
        { title: "Safe", route: "/services", canonicalUrl: "https://example.com/services" },
        { title: "Unsafe", route: "javascript:alert(1)" }
      ]
    }));
    expect(completed?.type).toBe("response.completed");
    if (completed?.type === "response.completed") expect(completed.sources).toHaveLength(1);
  });
});
