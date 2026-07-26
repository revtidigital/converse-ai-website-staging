// Safe-action validation. Actions proposed by the synthesis layer (or a future
// model) are UNTRUSTED. Only same-site relative routes to known destinations
// and known section ids are allowed. Everything else collapses to {none}.
//
// This is enforced on the backend (here) AND mirrored on the frontend.

import type { ActionType, AssistantAction } from "./types.js";

// Known static public routes (from src/routes/publicRoutes.ts).
export const KNOWN_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/about-us",
  "/contact-us",
  "/book-demo",
  "/blog",
  "/blog-2",
  "/case-studies",
  "/solutions",
  "/ai-for-smb",
  "/services",
  "/ai-strategy-audit",
  "/start",
  "/agentic-automation",
  "/ai-integration",
  "/ai-voice-agents",
  "/custom-ai-agents",
  "/knowledge-intelligence",
  "/sales-ai",
  "/chatbot",
  "/live-chat",
  "/pre-chat-forms",
  "/omni-channel",
  "/whatsapp-ai-chatbot",
  "/whatsapp-shop",
  "/whatsapp-marketing",
  "/agent-capacity",
  "/private-notes",
  "/live-view",
  "/teams",
  "/agent-reports",
  "/csat-report",
  "/team-reports",
  "/inbox-reports",
  "/terms-and-conditions",
  "/privacy-policy",
  "/thank-you",
]);

// Dynamic route prefixes that accept a slug segment.
const DYNAMIC_PREFIXES = ["/blog/", "/blog-2/", "/case-studies/", "/services/"];

// Section ids allowed for scroll_to_section (safe DOM anchors on the site).
export const KNOWN_SECTIONS: ReadonlySet<string> = new Set([
  "hero", "features", "services", "pricing", "faq", "faqs", "contact",
  "testimonials", "case-studies", "how-it-works", "integrations",
  "ai-voice-agents", "custom-ai-agents", "whatsapp-automation", "cta",
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True only for a safe same-site relative path to a known destination. */
export function isSafeRoute(route: string): boolean {
  if (typeof route !== "string") return false;
  const r = route.trim();
  // Reject schemes / protocol-relative / absolute URLs / traversal.
  if (!r.startsWith("/")) return false;
  if (r.startsWith("//")) return false;
  if (/[a-z]+:/i.test(r.split("?")[0])) return false; // javascript:, data:, http:
  if (r.includes("..")) return false;
  const path = r.split(/[?#]/)[0];
  if (KNOWN_ROUTES.has(path)) return true;
  for (const p of DYNAMIC_PREFIXES) {
    if (path.startsWith(p)) {
      const slug = path.slice(p.length);
      return SLUG_RE.test(slug);
    }
  }
  return false;
}

const ROUTE_ACTIONS: ReadonlySet<ActionType> = new Set([
  "navigate", "open_blog", "open_service", "open_product",
  "open_case_study", "open_contact",
]);

const NO_TARGET_ACTIONS: ReadonlySet<ActionType> = new Set([
  "none", "focus_form", "stop_speaking", "repeat_response", "reset_session",
]);

const NONE: AssistantAction = { type: "none", target: null };

/**
 * Validate & normalise an action. Returns {none} when anything is unsafe so the
 * text answer is always preserved even if the action is discarded.
 */
export function validateAction(action: unknown): AssistantAction {
  if (!action || typeof action !== "object") return NONE;
  const a = action as Partial<AssistantAction>;
  const type = a.type as ActionType;

  if (NO_TARGET_ACTIONS.has(type)) return { type, target: null };

  if (type === "scroll_to_section") {
    const id = String(a.target ?? "").replace(/^#/, "").trim();
    return KNOWN_SECTIONS.has(id) ? { type, target: id } : NONE;
  }

  if (ROUTE_ACTIONS.has(type)) {
    const target = String(a.target ?? "").trim();
    return isSafeRoute(target) ? { type, target } : NONE;
  }

  return NONE;
}
