import { describe, expect, it, beforeEach, vi } from "vitest";
import { handleContactWorkflow, resetContactWorkflow } from "@/lib/voice/contactWorkflow";

describe("contactWorkflow", () => {
  beforeEach(() => resetContactWorkflow());

  it("collects fields one at a time and does not submit without confirmation", () => {
    const fieldSpy = vi.fn();
    const submitSpy = vi.fn();
    window.addEventListener("voice-agent:contact-field", fieldSpy);
    window.addEventListener("voice-agent:contact-submit-request", submitSpy);
    expect(handleContactWorkflow("yes", "/contact-us").speech).toContain("full name");
    handleContactWorkflow("Jane Doe", "/contact-us");
    expect(fieldSpy).toHaveBeenCalled();
    expect(handleContactWorkflow("not an email", "/contact-us").speech).toContain("doesn't sound valid");
    handleContactWorkflow("jane@example.com", "/contact-us");
    handleContactWorkflow("+14155552671", "/contact-us");
    handleContactWorkflow("AI Agent", "/contact-us");
    handleContactWorkflow("Demo", "/contact-us");
    const summary = handleContactWorkflow("Need help", "/contact-us");
    expect(summary.speech).toContain("Should I submit this now");
    expect(submitSpy).not.toHaveBeenCalled();
    handleContactWorkflow("yes", "/contact-us");
    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(fieldSpy).not.toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ field: "agreeToTerms" }) }));
  });
});
