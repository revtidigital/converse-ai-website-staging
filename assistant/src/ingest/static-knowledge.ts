// Curated canonical website knowledge (services, products, FAQs, contact,
// company). Hand-authored so we index accurate, boilerplate-free facts rather
// than scraping React TSX. Extend this as the site grows. Each entry becomes
// one or more embedded chunks. NO pricing numbers are asserted here to avoid
// unsupported claims — pricing is deferred to the live pricing_plans table.

import type { SourceType } from "../types.js";

export interface StaticDoc {
  sourceId: string;
  sourceType: SourceType;
  title: string;
  route: string;
  section: string;
  category: string;
  language: string;
  body: string;
}

export const STATIC_DOCS: StaticDoc[] = [
  {
    sourceId: "home", sourceType: "company", title: "Converse AI", route: "/",
    section: "overview", category: "company", language: "en",
    body: "Converse AI builds custom AI agents that automate customer conversations across voice, chat and WhatsApp. The platform combines conversational AI, agentic automation and knowledge intelligence so businesses can handle support, sales and engagement with human-like AI while staying grounded in their own content.",
  },
  {
    sourceId: "ai-voice-agents", sourceType: "service", title: "AI Voice Agents", route: "/ai-voice-agents",
    section: "service", category: "services", language: "en",
    body: "Converse AI's AI Voice Agents answer and make phone calls with natural, human-like speech. They understand caller intent, answer questions from your knowledge base, qualify leads, book appointments and route or escalate to human agents when needed. Voice agents support multiple languages and integrate with your telephony and CRM.",
  },
  {
    sourceId: "custom-ai-agents", sourceType: "service", title: "Custom AI Agents", route: "/custom-ai-agents",
    section: "service", category: "services", language: "en",
    body: "Custom AI Agents are tailored assistants built around your business processes and data. They are grounded in your website, documents and systems, follow your rules, and can take safe actions such as answering FAQs, capturing leads and guiding users — deployable on web chat, voice and messaging channels.",
  },
  {
    sourceId: "agentic-automation", sourceType: "service", title: "Agentic Automation", route: "/agentic-automation",
    section: "service", category: "services", language: "en",
    body: "Agentic Automation lets AI agents complete multi-step tasks end to end — retrieving information, calling tools and APIs, updating records and coordinating workflows — rather than only chatting. It automates repetitive operations across support and back-office processes.",
  },
  {
    sourceId: "ai-integration", sourceType: "service", title: "AI Integration & CRM", route: "/ai-integration",
    section: "service", category: "services", language: "en",
    body: "Converse AI integrates with your existing stack — CRMs, help desks, telephony, calendars and databases. CRM integration syncs contacts, conversations and lead data both ways so AI agents can read customer context and write back outcomes like notes, tickets and updated deal stages.",
  },
  {
    sourceId: "knowledge-intelligence", sourceType: "service", title: "Knowledge Intelligence", route: "/knowledge-intelligence",
    section: "service", category: "services", language: "en",
    body: "Knowledge Intelligence turns your website, documents and FAQs into a retrievable knowledge base. AI agents answer strictly from this grounded content, reducing hallucination and keeping responses accurate and up to date.",
  },
  {
    sourceId: "sales-ai", sourceType: "service", title: "Sales AI", route: "/sales-ai",
    section: "service", category: "services", language: "en",
    body: "Sales AI engages website and messaging visitors, qualifies leads, answers product questions and books demos automatically, handing warm prospects to your sales team with full conversation context.",
  },
  {
    sourceId: "whatsapp", sourceType: "product", title: "WhatsApp AI Chatbot", route: "/whatsapp-ai-chatbot",
    section: "product", category: "products", language: "en",
    body: "The WhatsApp AI Chatbot automates customer conversations on WhatsApp — answering questions, sharing catalogues, capturing orders and sending updates. It supports WhatsApp Shop and WhatsApp Marketing for commerce and outreach.",
  },
  {
    sourceId: "chatbot", sourceType: "product", title: "AI Chatbot & Live Chat", route: "/chatbot",
    section: "product", category: "products", language: "en",
    body: "Converse AI's website chatbot handles support and sales chat with AI, with seamless handoff to live human agents, pre-chat forms, omni-channel inbox and team collaboration features.",
  },
  {
    sourceId: "faq", sourceType: "faq", title: "Frequently Asked Questions", route: "/",
    section: "faq", category: "faq", language: "en",
    body: "Converse AI grounds every answer in your own website and knowledge content, so agents stay accurate. Agents can be deployed on web chat, voice calls and WhatsApp. They support multiple languages including English and Hindi, integrate with popular CRMs, and can escalate to human agents. Getting started involves connecting your content and channels; the team assists with setup.",
  },
  {
    sourceId: "contact", sourceType: "contact", title: "Contact Converse AI", route: "/contact-us",
    section: "contact", category: "contact", language: "en",
    body: "You can contact Converse AI through the contact page to talk to the team, ask questions or get help. To see the product in action, book a demo. The team responds to enquiries about services, integrations and getting started.",
  },
  {
    sourceId: "book-demo", sourceType: "contact", title: "Book a Demo", route: "/book-demo",
    section: "contact", category: "contact", language: "en",
    body: "Book a demo to see Converse AI's voice agents, chatbots and automation live, tailored to your use case. The team walks you through setup, integrations and how agents are grounded in your content.",
  },
  {
    sourceId: "about", sourceType: "company", title: "About Converse AI", route: "/about-us",
    section: "about", category: "company", language: "en",
    body: "Converse AI is a company focused on building grounded, human-like AI agents for customer conversations. Its mission is to help businesses automate support, sales and engagement responsibly, keeping AI answers accurate by grounding them in each customer's own content.",
  },
  {
    sourceId: "case-studies", sourceType: "case_study", title: "Case Studies", route: "/case-studies",
    section: "case_studies", category: "case_studies", language: "en",
    body: "Converse AI case studies show how businesses used AI voice agents, chatbots and automation to reduce response times, qualify more leads and scale customer support. Each case study describes the challenge, the deployed AI solution and the results.",
  },
];
