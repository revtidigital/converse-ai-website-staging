export const CONTACT_PRODUCT_OPTIONS = [
  { value: "ai-agent", label: "AI Agent" },
  { value: "services", label: "Agentic AI" },
  { value: "conversational-ai-chatbot", label: "Conversational AI Chatbot" },
  { value: "whatsapp-ai-chatbot", label: "WhatsApp AI Chatbot" },
  { value: "live-chat", label: "Live Chat" },
  { value: "omni-channel", label: "Omni Channel" },
  { value: "pre-chat-forms", label: "Pre-Chat Forms" },
  { value: "whatsapp-marketing", label: "WhatsApp Marketing" },
  { value: "other", label: "Other" },
] as const;

export type ContactProductValue = (typeof CONTACT_PRODUCT_OPTIONS)[number]["value"];
export type ContactField = "name" | "email" | "phone" | "product" | "subject" | "message" | "agreeToTerms";
export type ContactSubmissionStatus = "idle" | "awaiting-confirmation" | "validation-failed" | "submitting" | "success" | "backend-failed" | "cancelled" | "duplicate-blocked";

export type ContactDraft = {
  name: string;
  email: string;
  phone: string;
  countryName: string;
  product: string;
  subject: string;
  message: string;
  agreeToTerms: boolean;
};

export type ContactSubmissionResult = {
  status: ContactSubmissionStatus;
  message: string;
  invalidFieldIds: ContactField[];
  retryAllowed: boolean;
  finalRoute: string | null;
  backendConfirmed: boolean;
};

export type ContactConfirmation = {
  id: string;
  draftVersion: number;
  fingerprint: string;
  confirmedAction: "submit_contact_form";
  timestamp: number;
  expiresAt: number;
  consumed: boolean;
};

export type ContactBridge = {
  getDraft: () => ContactDraft;
  setDraft: (updater: (draft: ContactDraft) => ContactDraft) => void;
  getErrors: () => Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: () => boolean;
  formRef: React.RefObject<HTMLFormElement>;
  reset: () => void;
  getResult: () => ContactSubmissionResult;
  setResult: (result: ContactSubmissionResult) => void;
  waitForResult: (signal: AbortSignal) => Promise<ContactSubmissionResult>;
};
