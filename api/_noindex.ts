// Slugs served with <meta name="robots" content="noindex, follow"> and excluded
// from the blog sitemap. These are old 2025 hospitality / banking / generic-chatbot
// posts that dilute the blog's agentic-AI topical authority. We keep them live (so
// existing backlinks are preserved) but drop them from Google's index.
// Ref: Dev Fixes July 2026 — Fix #7 (18 hospitality/chatbot posts) & Fix #12 (banking).
export const NOINDEX_SLUGS = new Set<string>([
  // Fix #7 — 18 hospitality/chatbot posts
  "how-hotel-chatbots-is-transforming-indonesias-guest-experience",
  "how-aipowered-chatbot-shaping-hospitality-revenue-management",
  "solving-hospitality-labor-shortages-with-chatbots-smart-frameworks",
  "how-to-combat-rising-operational-costs-without-compromising-quality",
  "improving-your-hotels-online-reputation-strategies-for-success",
  "how-robotics-ai-is-tackling-hospitalitys-labor-challenge",
  "must-have-hotel-management-software",
  "5-ways-hotel-chatbots-can-simplify-refunds-and-cancellations",
  "5-ways-whatsapp-marketing-is-revolutionizing-travel-and-hospitality",
  "how-ai-can-tackle-challenges-faced-by-hotel-managers",
  "how-marketing-teams-can-balance-direct-bookings-and-ota-partnerships",
  "nvidia-ai-diplomacy-signals-a-new-era-for-business-innovation",
  "cybersecurity-in-hospitality-understanding-the-growing-threat-landscape",
  "the-sustainability-shift-in-travel-how-ai-chatbot-can-tackle-it",
  "bridging-the-gap-how-to-combine-automated-and-human-customer-service-for-maximum-efficiency",
  "new-upi-rules-are-here-august-1st-why-your-banks-best-response-is-a-chatbot96",
  "air-indias-response-to-ai171-why-crisis-ready-chatbots-matter",
  "ios-26-just-changed-how-people-answer-calls-heres-how-to-stay-relevant-with-ai",
  // Fix #12 — banking chatbot post (old positioning, auto-generated numeric slug)
  "14815-2",
]);
