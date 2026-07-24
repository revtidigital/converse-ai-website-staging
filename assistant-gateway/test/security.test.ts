import { describe, expect, it } from "vitest";
import { isOriginAllowed } from "../src/security/origin-policy.js";
import { assertPayloadLimit } from "../src/security/payload-limits.js";
import { ConnectionRateLimiter } from "../src/security/rate-limit.js";

describe("gateway security helpers", () => {
  it("validates origins, payload limits and connection counts", () => {
    expect(isOriginAllowed("http://localhost:5173", ["http://localhost:5173"])).toBe(true);
    expect(isOriginAllowed("https://evil.test", ["http://localhost:5173"])).toBe(false);
    expect(() => assertPayloadLimit("hello", 10)).not.toThrow();
    expect(() => assertPayloadLimit("hello", 2)).toThrow("payload_too_large");
    const limiter = new ConnectionRateLimiter(1);
    expect(limiter.tryAcquire("127.0.0.1")).toBe(true);
    expect(limiter.tryAcquire("127.0.0.1")).toBe(false);
    limiter.release("127.0.0.1");
    expect(limiter.current("127.0.0.1")).toBe(0);
  });
});
