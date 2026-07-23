import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearContactConfirmation, getContactDraft, getContactFormSchema, normalizeProductValue, registerContactFormBridge, requestContactSubmission, setContactField } from "./contactFormBridge";
import type { ContactBridge, ContactDraft, ContactSubmissionResult } from "./types";

const validDraft: ContactDraft = { name: "Jane Doe", email: "jane@example.com", phone: "+14155552671", countryName: "United States", product: "ai-agent", subject: "", message: "", agreeToTerms: true };

function setupBridge(initial: ContactDraft = { name: "", email: "", phone: "", countryName: "", product: "", subject: "", message: "", agreeToTerms: false }) {
  let draft = initial;
  let errors: Record<string, string> = {};
  let result: ContactSubmissionResult = { status: "idle", message: "Idle", invalidFieldIds: [], retryAllowed: true, finalRoute: null, backendConfirmed: false };
  const form = { requestSubmit: vi.fn(() => { result = { status: "success", message: "Submitted", invalidFieldIds: [], retryAllowed: false, finalRoute: "/thank-you", backendConfirmed: true }; waiters.splice(0).forEach((resolve) => resolve(result)); }) } as unknown as HTMLFormElement;
  const waiters: Array<(result: ContactSubmissionResult) => void> = [];
  const bridge: ContactBridge = { getDraft: () => draft, setDraft: (updater) => { draft = updater(draft); }, getErrors: () => errors, setErrors: (next) => { errors = next; }, isSubmitting: () => result.status === "submitting", formRef: { current: form }, reset: () => { draft = { name: "", email: "", phone: "", countryName: "", product: "", subject: "", message: "", agreeToTerms: false }; errors = {}; }, getResult: () => result, setResult: (next) => { result = next; }, waitForResult: () => Promise.resolve(result) };
  const unregister = registerContactFormBridge(bridge);
  return { bridge, form, unregister, get draft() { return draft; }, get result() { return result; } };
}

describe("contact form bridge tools", () => {
  afterEach(() => { clearContactConfirmation(); });
  it("returns actual fields and product options", () => { const data = getContactFormSchema(); expect(data.fields.map((f) => f.id)).toEqual(["name", "email", "phone", "product", "subject", "message", "agreeToTerms"]); expect(data.productOptions.map((o) => o.value)).toContain("live-chat"); expect(data.fields.some((f) => f.id === "lookingFor")).toBe(false); });
  it("gets current controlled draft and validation", () => { const env = setupBridge(); const draft = getContactDraft(); expect(draft.ready).toBe(true); expect(draft.missingRequiredFields).toContain("name"); env.unregister(); });
  it("sets text fields, clears fields, enforces max length, and visibly updates draft", () => { const env = setupBridge(); expect(setContactField("name", "  Jane   Doe  ").committedValue).toBe("Jane Doe"); expect(env.draft.name).toBe("Jane Doe"); expect(setContactField("message", "x".repeat(2500)).committedValue).toHaveLength(2000); expect(setContactField("product", "live chat").committedValue).toBe("live-chat"); expect(env.draft.product).toBe("live-chat"); env.unregister(); });
  it("maps natural product phrases and refuses unknown choices", () => { expect(normalizeProductValue("chatbot")).toMatchObject({ ok: true, value: "conversational-ai-chatbot" }); expect(normalizeProductValue("voice agent").ok).toBe(false); });
  it("requires confirmation, rejects stale confirmation after edit, and uses requestSubmit exactly once", async () => { const env = setupBridge(validDraft); const first = await requestContactSubmission({}, new AbortController().signal) as ContactSubmissionResult & { confirmationId?: string }; expect(first.status).toBe("awaiting-confirmation"); setContactField("subject", "New subject"); const stale = await requestContactSubmission({ confirmed: true, confirmationId: first.confirmationId }, new AbortController().signal); expect(stale.status).toBe("validation-failed"); const fresh = await requestContactSubmission({}, new AbortController().signal) as ContactSubmissionResult & { confirmationId?: string }; const submitted = await requestContactSubmission({ confirmed: true, confirmationId: fresh.confirmationId }, new AbortController().signal); expect(submitted).toMatchObject({ status: "success", backendConfirmed: true }); expect(env.form.requestSubmit).toHaveBeenCalledTimes(1); env.unregister(); });
});
