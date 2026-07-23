import { describe, expect, it } from "vitest";
import { schedulingService } from "@/lib/voice/schedulingService";

describe("schedulingService fallback", () => {
  it("does not expose fake availability or booking success without a backend", async () => {
    expect(schedulingService.hasRealAvailability()).toBe(false);
    expect(schedulingService.getSchedulingUrl()).toBe("/book-demo");
    await expect(schedulingService.lookupAvailability({ preferredDate: "tomorrow" })).resolves.toEqual([]);
    await expect(schedulingService.schedule({ email: "lead@example.com" }, "tomorrow at 2 PM")).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining("claim a slot is booked"),
    });
  });
});
