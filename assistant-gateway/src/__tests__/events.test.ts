import { describe, it, expect } from "vitest";
import { isValidClientEvent } from "../events.js";
describe("event contract", () => {
  it("accepts known events", () => {
    for (const t of ["text.query","ping","session.start","response.cancel","session.reset","audio.chunk"])
      expect(isValidClientEvent({ type: t })).toBe(true);
  });
  it("rejects unknown events", () => {
    expect(isValidClientEvent({ type: "eval.exec" })).toBe(false);
    expect(isValidClientEvent({ type: "__proto__" })).toBe(false);
    expect(isValidClientEvent("hi")).toBe(false);
    expect(isValidClientEvent(null)).toBe(false);
  });
});
