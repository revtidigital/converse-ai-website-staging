import { z } from "zod";
import { contactFieldValues } from "../contact/contactTools";
import { CONTACT_PRODUCT_OPTIONS } from "../contact/types";
import type { XaiFunctionDefinition, XaiVoiceToolName } from "./types";

const routePattern = /^\/[a-z0-9\-/]*$/i;
const anchorPattern = /^[A-Za-z][A-Za-z0-9_-]{0,80}$/;
const contactFieldEnum = z.enum(contactFieldValues as [typeof contactFieldValues[number], ...typeof contactFieldValues[number][]]);

export const toolSchemas = {
  get_current_page_context: z.object({}).strict(),
  search_site_knowledge: z.object({ query: z.string().trim().min(1).max(160), maxResults: z.number().int().min(1).max(6).optional() }).strict(),
  get_available_page_actions: z.object({}).strict(),
  navigate_to_page: z.object({ route: z.string().trim().min(1).max(120).regex(routePattern), anchor: z.string().trim().max(80).regex(anchorPattern).optional() }).strict(),
  get_contact_form_schema: z.object({}).strict(),
  get_contact_draft: z.object({}).strict(),
  set_contact_field: z.object({ field: contactFieldEnum, value: z.union([z.string().max(2000), z.boolean()]) }).strict(),
  clear_contact_field: z.object({ field: contactFieldEnum }).strict(),
  reset_contact_form: z.object({}).strict(),
  request_contact_submission: z.object({ confirmationId: z.string().max(80).optional(), confirmed: z.boolean().optional() }).strict(),
  get_contact_submission_result: z.object({}).strict(),
} satisfies Record<XaiVoiceToolName, z.ZodType>;

export const XAI_WEBSITE_TOOL_INSTRUCTION = "You may use the provided website tools to answer questions about the Converse website. Use current-page context for questions about the current page, use site search for information on other public pages, and navigate only when the user explicitly asks to open or visit a page. Do not invent information that is not present in tool results. Summarize results naturally and do not read raw JSON aloud.";
export const XAI_CONTACT_TOOL_INSTRUCTION = "You may help the user complete the visible contact form using the provided contact tools. Ask for one missing required value at a time, allow optional fields to be skipped, and support corrections. Before submission, summarize the important values and ask for explicit confirmation. Never claim submission success until the contact submission tool reports backend-confirmed success.";
export const XAI_TOOL_INSTRUCTION = `${XAI_WEBSITE_TOOL_INSTRUCTION} ${XAI_CONTACT_TOOL_INSTRUCTION}`;

const productEnum = CONTACT_PRODUCT_OPTIONS.map((option) => option.value);
export const xaiToolDefinitions: XaiFunctionDefinition[] = [
  { type: "function", name: "get_current_page_context", description: "Get bounded visible context for the current Converse website page. Returns structured page content and safe actions, not HTML.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
  { type: "function", name: "search_site_knowledge", description: "Search approved public Converse website pages for factual answers. Returns matched snippets with source routes and safe navigation targets.", parameters: { type: "object", additionalProperties: false, properties: { query: { type: "string", minLength: 1, maxLength: 160 }, maxResults: { type: "integer", minimum: 1, maximum: 6 } }, required: ["query"] } },
  { type: "function", name: "get_available_page_actions", description: "List safe website navigation actions available from the current page. Contact form filling, blog narration, and scheduling are unavailable in this phase.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
  { type: "function", name: "navigate_to_page", description: "Navigate to an approved internal Converse route or safe section anchor only when the user explicitly asks to open or visit it.", parameters: { type: "object", additionalProperties: false, properties: { route: { type: "string", minLength: 1, maxLength: 120 }, anchor: { type: "string", maxLength: 80 } }, required: ["route"] } },
  { type: "function", name: "get_contact_form_schema", description: "Read the actual visible Contact Us form schema, required fields, max lengths, and product options.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
  { type: "function", name: "get_contact_draft", description: "Read the current controlled Contact Us form draft, validation state, missing required fields, confirmation state, and last safe submission outcome.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
  { type: "function", name: "set_contact_field", description: "Set one allowed Contact Us form field using the real controlled React state. Natural product phrases are mapped only to real options.", parameters: { type: "object", additionalProperties: false, properties: { field: { type: "string", enum: contactFieldValues }, value: { anyOf: [{ type: "string", maxLength: 2000 }, { type: "boolean" }] } }, required: ["field", "value"] } },
  { type: "function", name: "clear_contact_field", description: "Clear one allowed Contact Us form field and invalidate any prior submission confirmation.", parameters: { type: "object", additionalProperties: false, properties: { field: { type: "string", enum: contactFieldValues } }, required: ["field"] } },
  { type: "function", name: "reset_contact_form", description: "Reset the real Contact Us form draft, validation, workflow confirmation, and safe submission result.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
  { type: "function", name: "request_contact_submission", description: "Request or perform confirmed submission of the real Contact Us form. Submission requires a fresh confirmationId and backend-confirmed success before success may be claimed.", parameters: { type: "object", additionalProperties: false, properties: { confirmationId: { type: "string", maxLength: 80 }, confirmed: { type: "boolean" } }, required: [] } },
  { type: "function", name: "get_contact_submission_result", description: "Read the current safe Contact Us form submission result status without raw backend details.", parameters: { type: "object", additionalProperties: false, properties: {}, required: [] } },
];
void productEnum;
