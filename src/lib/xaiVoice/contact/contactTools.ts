import { getContactDraft, getContactFormSchema, getContactSubmissionResult, requestContactSubmission, resetContactForm, setContactField, clearContactField } from "./contactFormBridge";
import type { ContactField } from "./types";
import type { ToolExecutionContext, ToolResult } from "../tools/types";

export const contactFieldValues: ContactField[] = ["name", "email", "phone", "product", "subject", "message", "agreeToTerms"];

export function getContactFormSchemaTool(): ToolResult { return { ok: true, data: getContactFormSchema() }; }
export function getContactDraftTool(): ToolResult { return { ok: true, data: getContactDraft() }; }
export function setContactFieldTool(args: { field: ContactField; value: string | boolean }): ToolResult { const result = setContactField(args.field, args.value); return result.ok ? { ok: true, data: result } : { ok: false, error: { code: "field_rejected", message: result.error } }; }
export function clearContactFieldTool(args: { field: ContactField }): ToolResult { const result = clearContactField(args.field); return result.ok ? { ok: true, data: result } : { ok: false, error: { code: "field_rejected", message: result.error } }; }
export function resetContactFormTool(): ToolResult { const result = resetContactForm(); return result.ok ? { ok: true, data: result } : { ok: false, error: { code: "form_unavailable", message: result.error } }; }
export async function requestContactSubmissionTool(args: { confirmationId?: string; confirmed?: boolean }, context: ToolExecutionContext): Promise<ToolResult> { return { ok: true, data: await requestContactSubmission(args, context.signal) }; }
export function getContactSubmissionResultTool(): ToolResult { return { ok: true, data: getContactSubmissionResult() }; }
