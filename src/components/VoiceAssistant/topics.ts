export interface Topic {
  id: string;
  keywords: string[];
  answer: string;
  path: string;
}

// Canned, page-grounded answers — no LLM, no external API.
// Add a new topic here whenever a new page should be reachable by voice.
export const TOPICS: Topic[] = [
  {
    id: "whatsapp-marketing",
    keywords: ["whatsapp marketing", "whatsapp campaign", "broadcast message", "whatsapp broadcast"],
    answer:
      "WhatsApp Marketing lets you run high-converting campaigns with automated broadcasts and drip sequences. It has a 98 percent open rate compared to 20 percent for email, and helps reduce customer acquisition costs. I'm opening the WhatsApp Marketing page for you now.",
    path: "/whatsapp-marketing",
  },
  {
    id: "whatsapp-chatbot",
    keywords: ["whatsapp chatbot", "whatsapp bot", "whatsapp ai chatbot"],
    answer:
      "Our WhatsApp AI Chatbot automatically answers customer questions, qualifies leads, and handles support around the clock on WhatsApp. Opening that page for you now.",
    path: "/whatsapp-ai-chatbot",
  },
  {
    id: "whatsapp-shop",
    keywords: ["whatsapp shop", "whatsapp store", "sell on whatsapp"],
    answer:
      "WhatsApp Shop lets your customers browse products and complete purchases directly inside WhatsApp. Opening that page for you now.",
    path: "/whatsapp-shop",
  },
  {
    id: "services",
    keywords: ["services", "what do you offer", "what can you do"],
    answer:
      "We offer AI Strategy Audits, Agentic Automation, AI Integration with tools like Salesforce and HubSpot, Custom AI Agents, Knowledge Intelligence, and Sales AI for outreach automation. Opening the Services page for you now.",
    path: "/services",
  },
  {
    id: "ai-voice-agents",
    keywords: ["voice agent", "voice ai", "ai voice"],
    answer:
      "Our AI Voice Agents handle inbound and outbound calls, answering questions and booking appointments automatically. Opening that page for you now.",
    path: "/services/ai-voice-agents",
  },
  {
    id: "ai-integration",
    keywords: ["integration", "integrate", "connect crm", "salesforce", "hubspot", "zoho", "zendesk"],
    answer:
      "AI Integration plugs directly into the tools you already run, such as Salesforce, HubSpot, Zoho, Zendesk, SAP, or Tally, without a rip-and-replace. Opening that page for you now.",
    path: "/services/ai-integration",
  },
  {
    id: "custom-agents",
    keywords: ["custom agent", "custom ai agent"],
    answer:
      "Custom AI Agents are built specifically around your workflow and data. Opening that page for you now.",
    path: "/services/custom-ai-agents",
  },
  {
    id: "sales-ai",
    keywords: ["sales ai", "sales automation", "outreach"],
    answer:
      "Sales AI automates outreach and sales intelligence so your team spends time only on qualified leads. Opening that page for you now.",
    path: "/services/sales-ai",
  },
  {
    id: "pricing",
    keywords: ["pricing", "cost", "price", "how much"],
    answer:
      "We work on a fixed-fee, fixed-timeline model with no time-and-materials creep, starting with a free 30 minute call to understand your workflow. Opening the Pricing page for you now.",
    path: "/pricing",
  },
  {
    id: "about",
    keywords: ["about you", "who are you", "about converseai", "company"],
    answer:
      "ConverseAI builds and runs AI products at scale for businesses, and we're not building our first AI deployment. Opening the About Us page for you now.",
    path: "/about-us",
  },
  {
    id: "contact",
    keywords: ["contact", "talk to someone", "get in touch", "book a call", "book demo"],
    answer: "I'll open the contact page so you can book a call with our team.",
    path: "/contact-us",
  },
];

export const FALLBACK_ANSWER =
  "I didn't catch a specific topic. Could you tell me what you're looking for — for example, services, pricing, or WhatsApp marketing?";

export function matchTopic(transcript: string): Topic | null {
  const text = transcript.toLowerCase();
  for (const topic of TOPICS) {
    if (topic.keywords.some((k) => text.includes(k))) return topic;
  }
  return null;
}
