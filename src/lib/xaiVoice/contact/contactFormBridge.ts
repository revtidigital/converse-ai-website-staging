import { validateContactForm } from "@/lib/validations/contact";
import { CONTACT_PRODUCT_OPTIONS, type ContactBridge, type ContactDraft, type ContactField, type ContactSubmissionResult, type ContactConfirmation } from "./types";

const MAX = { name: 100, email: 255, phone: 32, product: 64, subject: 200, message: 2000, agreeToTerms: 5 } satisfies Record<ContactField, number>;
const REQUIRED: ContactField[] = ["name", "email", "phone", "product", "agreeToTerms"];
const CONFIRM_MS = 2 * 60_000;
let bridge: ContactBridge | null = null;
let draftVersion = 0;
let confirmation: ContactConfirmation | null = null;

export const CONTACT_FIELDS: Array<{ id: ContactField; label: string; type: string; required: boolean; maxLength: number; options?: typeof CONTACT_PRODUCT_OPTIONS; canSkip: boolean; validation: string }> = [
  { id: "name", label: "Full Name", type: "text", required: true, maxLength: 100, canSkip: false, validation: "2 to 100 characters." },
  { id: "email", label: "Email Address", type: "email", required: true, maxLength: 255, canSkip: false, validation: "Valid email address, maximum 255 characters." },
  { id: "phone", label: "Phone Number", type: "phone", required: true, maxLength: 32, canSkip: false, validation: "Valid phone number for selected country." },
  { id: "product", label: "Select Product", type: "select", required: true, maxLength: 64, options: CONTACT_PRODUCT_OPTIONS, canSkip: false, validation: "Must match one of the real product options." },
  { id: "subject", label: "Subject", type: "text", required: false, maxLength: 200, canSkip: true, validation: "Optional, maximum 200 characters." },
  { id: "message", label: "Message", type: "textarea", required: false, maxLength: 2000, canSkip: true, validation: "Optional, maximum 2000 characters." },
  { id: "agreeToTerms", label: "Terms & Conditions and Privacy Policy agreement", type: "boolean", required: true, maxLength: 5, canSkip: false, validation: "Must be accepted before submission." },
];

export function registerContactFormBridge(next: ContactBridge) { bridge = next; return () => { if (bridge === next) { bridge = null; clearContactConfirmation(); } }; }
export function getContactBridge() { return bridge; }
export function getDraftVersion() { return draftVersion; }
export function incrementDraftVersion() { draftVersion += 1; clearContactConfirmation(); return draftVersion; }
export function clearContactConfirmation() { confirmation = null; }
function normalizeText(value: string, max: number) { return value.replace(/\s+/g, " ").trim().slice(0, max); }
function fingerprint(draft: ContactDraft) { return JSON.stringify(REQUIRED.map((field) => [field, draft[field]])); }
function safeResult(status: ContactSubmissionResult["status"], message: string, invalidFieldIds: ContactField[] = [], retryAllowed = true): ContactSubmissionResult { return { status, message, invalidFieldIds, retryAllowed, finalRoute: null, backendConfirmed: false }; }

export function validateDraft(draft: ContactDraft) {
  const validation = validateContactForm(draft);
  const errors = validation.success ? {} : validation.errors;
  const completedRequiredFields = REQUIRED.filter((field) => !errors[field] && Boolean(draft[field]));
  const missingRequiredFields = REQUIRED.filter((field) => !draft[field] || Boolean(errors[field]));
  return { success: validation.success, errors, completedRequiredFields, missingRequiredFields };
}

export function getContactFormSchema() { return { fields: CONTACT_FIELDS.map((field) => ({ ...field, enabled: Boolean(bridge) })), productOptions: CONTACT_PRODUCT_OPTIONS, bridgeReady: Boolean(bridge) }; }

export function getContactDraft() {
  if (!bridge) return { ready: false, result: safeResult("cancelled", "Contact form is not available on this page.", [], false) };
  const draft = bridge.getDraft();
  const validation = validateDraft(draft);
  return { ready: true, values: draft, completedRequiredFields: validation.completedRequiredFields, missingRequiredFields: validation.missingRequiredFields, fieldValidation: validation.errors, currentWorkflowStep: validation.missingRequiredFields[0] ?? "review", confirmationPending: Boolean(confirmation && !confirmation.consumed && confirmation.expiresAt > Date.now()), submissionInProgress: bridge.isSubmitting(), lastSubmissionOutcome: bridge.getResult(), draftVersion };
}

export function normalizeProductValue(value: string) {
  const normalized = normalizeText(value, 80).toLowerCase();
  const exact = CONTACT_PRODUCT_OPTIONS.find((option) => option.value === normalized || option.label.toLowerCase() === normalized);
  if (exact) return { ok: true as const, value: exact.value };
  const mappings: Array<[string[], string]> = [
    [["ai agent"], "ai-agent"],
    [["agentic ai", "automation", "agentic"], "services"],
    [["conversational ai", "chatbot", "website chatbot"], "conversational-ai-chatbot"],
    [["whatsapp chatbot", "whatsapp ai", "whatsapp"], "whatsapp-ai-chatbot"],
    [["live chat"], "live-chat"],
    [["omni channel", "omnichannel"], "omni-channel"],
    [["pre chat", "pre-chat"], "pre-chat-forms"],
    [["whatsapp marketing", "marketing"], "whatsapp-marketing"],
    [["other", "something else"], "other"],
  ];
  const matches = mappings.filter(([phrases]) => phrases.some((phrase) => normalized.includes(phrase))).map(([, mapped]) => mapped);
  const unique = [...new Set(matches)];
  return unique.length === 1 ? { ok: true as const, value: unique[0] } : { ok: false as const, options: CONTACT_PRODUCT_OPTIONS, message: unique.length ? "That product choice is ambiguous." : "That product choice is not available." };
}

export function setContactField(field: ContactField, rawValue: string | boolean) {
  if (!bridge) return { ok: false, error: "Contact form is not available on this page." };
  const definition = CONTACT_FIELDS.find((candidate) => candidate.id === field);
  if (!definition) return { ok: false, error: "Unsupported contact field." };
  let committed: string | boolean = rawValue;
  if (field === "agreeToTerms") committed = rawValue === true || String(rawValue).toLowerCase() === "true" || String(rawValue).toLowerCase() === "yes";
  else {
    committed = normalizeText(String(rawValue), MAX[field]);
    if (field === "product") {
      const mapped = normalizeProductValue(committed);
      if (!mapped.ok) return { ok: false, error: mapped.message, options: mapped.options };
      committed = mapped.value;
    }
  }
  bridge.setDraft((draft) => ({ ...draft, [field]: committed }));
  const nextDraft = { ...bridge.getDraft(), [field]: committed } as ContactDraft;
  const validation = validateDraft(nextDraft);
  bridge.setErrors(validation.errors);
  incrementDraftVersion();
  return { ok: true, field, committedValue: committed, validationErrors: validation.errors, draftVersion };
}

export function clearContactField(field: ContactField) {
  if (!bridge) return { ok: false, error: "Contact form is not available on this page." };
  if (!CONTACT_FIELDS.some((candidate) => candidate.id === field)) return { ok: false, error: "Unsupported contact field." };
  const value = field === "agreeToTerms" ? false : "";
  bridge.setDraft((draft) => ({ ...draft, [field]: value }));
  const nextDraft = { ...bridge.getDraft(), [field]: value } as ContactDraft;
  const validation = validateDraft(nextDraft);
  bridge.setErrors(validation.errors);
  incrementDraftVersion();
  return { ok: true, field, validationErrors: validation.errors, draftVersion };
}

export function resetContactForm() {
  if (!bridge) return { ok: false, error: "Contact form is not available on this page." };
  bridge.reset(); incrementDraftVersion(); bridge.setResult(safeResult("idle", "Contact form reset.", [], true));
  return { ok: true, draftVersion };
}

export async function requestContactSubmission(args: { confirmationId?: string; confirmed?: boolean }, signal: AbortSignal) {
  if (!bridge) return safeResult("cancelled", "Contact form is not available on this page.", [], false);
  if (bridge.isSubmitting()) return safeResult("duplicate-blocked", "The contact form is already submitting.", [], false);
  const validation = validateDraft(bridge.getDraft());
  bridge.setErrors(validation.errors);
  if (!validation.success) { clearContactConfirmation(); const result = safeResult("validation-failed", "Please complete the required contact fields before submitting.", validation.missingRequiredFields, true); bridge.setResult(result); return result; }
  const now = Date.now();
  if (!args.confirmed || !args.confirmationId) {
    confirmation = { id: crypto.randomUUID(), draftVersion, fingerprint: fingerprint(bridge.getDraft()), confirmedAction: "submit_contact_form", timestamp: now, expiresAt: now + CONFIRM_MS, consumed: false };
    const result = safeResult("awaiting-confirmation", "Please confirm that you want to submit the contact form.", [], true); bridge.setResult(result); return { ...result, confirmationId: confirmation.id, expiresAt: confirmation.expiresAt };
  }
  if (!confirmation || confirmation.id !== args.confirmationId || confirmation.consumed || confirmation.expiresAt <= now || confirmation.draftVersion !== draftVersion || confirmation.fingerprint !== fingerprint(bridge.getDraft())) { const result = safeResult("validation-failed", "Submission confirmation is missing, expired, or stale.", [], true); bridge.setResult(result); return result; }
  const form = bridge.formRef.current;
  if (!form?.requestSubmit) { const result = safeResult("backend-failed", "Contact form cannot be submitted right now.", [], true); bridge.setResult(result); return result; }
  confirmation.consumed = true;
  bridge.setDraft((draft) => ({ ...draft, agreeToTerms: true }));
  await Promise.resolve();
  if (signal.aborted) { const result = safeResult("cancelled", "Contact submission was cancelled.", [], false); bridge.setResult(result); return result; }
  bridge.setResult(safeResult("submitting", "Submitting the contact form.", [], false));
  form.requestSubmit();
  const result = await bridge.waitForResult(signal);
  return result;
}

export function getContactSubmissionResult() { return bridge?.getResult() ?? safeResult("idle", "Contact form is not active.", [], true); }
