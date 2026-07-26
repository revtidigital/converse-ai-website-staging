// Shared types for Website Brain V2. Used by the text endpoint and the
// realtime voice gateway alike — one brain, two transports.

export type Language = "en" | "hi" | "hinglish" | "mixed";

export type ConfidenceCategory = "high" | "medium" | "low";

export type SourceType =
  | "static"
  | "service"
  | "product"
  | "faq"
  | "case_study"
  | "blog"
  | "contact"
  | "company"
  | "legal";

export type IntentKind =
  | "website_question"
  | "blog_question"
  | "product_question"
  | "service_question"
  | "pricing_question"
  | "faq_question"
  | "contact_request"
  | "navigation_request"
  | "case_study_request"
  | "page_summary"
  | "blog_summary"
  | "comparison"
  | "follow_up"
  | "latest_blog"
  | "related_blog"
  | "stop_speaking"
  | "repeat"
  | "reset"
  | "unsupported_general"
  | "prompt_injection";

export type ActionType =
  | "none"
  | "navigate"
  | "scroll_to_section"
  | "open_blog"
  | "open_service"
  | "open_product"
  | "open_case_study"
  | "open_contact"
  | "focus_form"
  | "stop_speaking"
  | "repeat_response"
  | "reset_session";

export interface AssistantAction {
  type: ActionType;
  target: string | null;
}

export interface PageContext {
  route?: string | null;
  title?: string | null;
  visibleSection?: string | null;
  selectedService?: string | null;
  selectedProduct?: string | null;
  blogSlug?: string | null;
  blogTitle?: string | null;
  currentHeading?: string | null;
  language?: string | null;
}

export interface KnowledgeChunk {
  id: string;
  sourceId: string;
  sourceType: SourceType;
  title: string;
  route: string;
  canonicalUrl: string;
  section: string;
  category: string;
  language: string;
  content: string;
  blogSlug?: string | null;
  author?: string | null;
  publishDate?: string | null;
  updateDate?: string | null;
  headingPath?: string | null;
  similarity: number; // vector similarity, 0..1
  score?: number; // hybrid re-rank score
}

export interface Source {
  title: string;
  route: string;
  sourceType: SourceType;
  canonicalUrl?: string;
}

export interface AssistantRequest {
  message: string;
  sessionId: string;
  language?: string; // "auto" | Language
  pageContext?: PageContext;
}

export interface AssistantResponse {
  text: string;
  language: Language;
  confidence: number;
  confidenceCategory: ConfidenceCategory;
  intent: IntentKind;
  sources: Source[];
  action: AssistantAction;
}
