export const SITEMAP_ROUTES = [
  "/",
  "/about-us",
  "/contact-us",
  "/book-demo",
  "/blog",
  "/case-studies",
  "/solutions/ai-for-smb",
  "/services",
  "/services/ai-strategy-audit",
  "/services/agentic-automation",
  "/services/ai-integration",
  "/services/ai-voice-agents",
  "/services/custom-ai-agents",
  "/services/knowledge-intelligence",
  "/services/sales-ai",
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
  "/teams-2",
  "/agent-reports",
  "/csat-report",
  "/team-reports",
  "/inbox-reports",
  "/terms-and-conditions",
  "/privacy-policy",
] as const;

export const NON_INDEXED_PUBLIC_ROUTES = ["/thank-you"] as const;

export const PUBLIC_STATIC_ROUTES = [
  ...SITEMAP_ROUTES,
  ...NON_INDEXED_PUBLIC_ROUTES,
] as const;

export type PublicStaticRoutePath = (typeof PUBLIC_STATIC_ROUTES)[number];
