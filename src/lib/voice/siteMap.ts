// Site knowledge registry for the voice agent.
// Fully static + client-side — no external services, no cost.
// Maps spoken navigation phrases to real routes and provides
// page-aware follow-up suggestions and short "elevator" descriptions
// used when the live page DOM has not been extracted yet.

export interface VoiceDestination {
  /** Canonical route path in the SPA. */
  path: string;
  /** Human title spoken by the agent. */
  title: string;
  /** Spoken keywords/aliases used to match navigation intents. */
  aliases: string[];
  /** One-line description used as a fallback summary. */
  blurb: string;
  /** Context-aware follow-up prompts the agent can offer. */
  followUps: string[];
}

export const VOICE_DESTINATIONS: VoiceDestination[] = [
  {
    path: "/",
    title: "Home",
    aliases: ["home", "homepage", "main page", "start", "landing"],
    blurb:
      "ConverseAI builds AI agents, chatbots and automation that help businesses talk to their customers across chat, WhatsApp and voice.",
    followUps: [
      "Would you like to hear about our AI voice agents, WhatsApp automation, or pricing?",
    ],
  },
  {
    path: "/services/ai-voice-agents",
    title: "AI Voice Agents",
    aliases: ["voice agent", "voice agents", "ai voice", "voice ai", "voice assistant", "calling agent"],
    blurb:
      "Our AI voice agents handle phone and voice conversations automatically, answering questions, qualifying leads and booking demos around the clock.",
    followUps: [
      "Would you like to hear how voice agents are used in customer support, or in sales?",
    ],
  },
  {
    path: "/chatbot",
    title: "AI Chatbot",
    aliases: ["chatbot", "chat bot", "bot", "ai chatbot"],
    blurb:
      "Our AI chatbot answers customer questions instantly on your website using your own knowledge base.",
    followUps: [
      "Would you like to know how the chatbot connects with live chat, or with WhatsApp?",
    ],
  },
  {
    path: "/live-chat",
    title: "Live Chat",
    aliases: ["live chat", "livechat", "human chat", "agent chat"],
    blurb:
      "Live Chat lets your human agents jump into conversations, with the AI handling everything else.",
    followUps: ["Would you like to hear about agent capacity, or private notes?"],
  },
  {
    path: "/omni-channel",
    title: "Omni Channel",
    aliases: ["omni channel", "omnichannel", "channels", "multi channel"],
    blurb:
      "Omni Channel brings every conversation — website, WhatsApp, email and social — into one inbox.",
    followUps: ["Would you like to hear about WhatsApp automation, or reporting?"],
  },
  {
    path: "/whatsapp-ai-chatbot",
    title: "WhatsApp AI Chatbot",
    aliases: ["whatsapp chatbot", "whatsapp ai", "whatsapp bot", "whatsapp assistant"],
    blurb:
      "The WhatsApp AI chatbot automates conversations on WhatsApp, from support to sales, on the official WhatsApp Business platform.",
    followUps: ["Would you like to hear about WhatsApp Shop, or WhatsApp Marketing?"],
  },
  {
    path: "/whatsapp-shop",
    title: "WhatsApp Shop",
    aliases: ["whatsapp shop", "whatsapp store", "whatsapp commerce", "shop"],
    blurb:
      "WhatsApp Shop lets customers browse products and check out right inside WhatsApp.",
    followUps: ["Would you like to hear about WhatsApp Marketing, or the AI chatbot?"],
  },
  {
    path: "/whatsapp-marketing",
    title: "WhatsApp Marketing",
    aliases: ["whatsapp marketing", "broadcast", "campaigns", "whatsapp campaign"],
    blurb:
      "WhatsApp Marketing sends broadcasts, campaigns and offers to your customers on WhatsApp.",
    followUps: ["Would you like to hear about WhatsApp Shop, or the AI chatbot?"],
  },
  {
    path: "/services/agentic-automation",
    title: "Agentic Automation",
    aliases: ["agentic automation", "automation", "workflow automation", "agentic"],
    blurb:
      "Agentic Automation builds AI agents that carry out multi-step tasks and workflows on their own.",
    followUps: ["Would you like to hear about AI integration, or custom AI agents?"],
  },
  {
    path: "/services/ai-integration",
    title: "AI Integration",
    aliases: ["ai integration", "integration", "integrations", "connect ai"],
    blurb:
      "AI Integration connects AI into your existing tools, CRMs and systems.",
    followUps: ["Would you like to hear about custom AI agents, or agentic automation?"],
  },
  {
    path: "/services/custom-ai-agents",
    title: "Custom AI Agents",
    aliases: ["custom ai agents", "custom agents", "custom agent", "build agent"],
    blurb:
      "Custom AI Agents are tailored assistants built for your specific business processes.",
    followUps: ["Would you like to hear about knowledge intelligence, or sales AI?"],
  },
  {
    path: "/services/knowledge-intelligence",
    title: "Knowledge Intelligence",
    aliases: ["knowledge intelligence", "knowledge base", "knowledge", "rag"],
    blurb:
      "Knowledge Intelligence turns your documents and data into answers your AI can use.",
    followUps: ["Would you like to hear about custom AI agents, or AI integration?"],
  },
  {
    path: "/services/sales-ai",
    title: "Sales AI",
    aliases: ["sales ai", "sales", "ai sales", "lead generation"],
    blurb:
      "Sales AI qualifies leads, follows up and books meetings automatically.",
    followUps: ["Would you like to hear about voice agents, or WhatsApp marketing?"],
  },
  {
    path: "/services/ai-strategy-audit",
    title: "AI Strategy Audit",
    aliases: ["ai strategy audit", "strategy audit", "audit", "ai audit", "ai strategy"],
    blurb:
      "The AI Strategy Audit reviews your business and maps where AI will have the biggest impact.",
    followUps: ["Would you like to start the audit, or hear about our services?"],
  },
  {
    path: "/solutions/ai-for-smb",
    title: "AI for Small Business",
    aliases: ["ai for smb", "small business", "smb", "ai for small business"],
    blurb:
      "AI for Small Business brings affordable AI agents and automation to smaller teams.",
    followUps: ["Would you like to hear about pricing, or book a demo?"],
  },
  {
    path: "/services",
    title: "Services",
    aliases: ["services", "what do you offer", "solutions", "offerings"],
    blurb:
      "Our Services span AI strategy, custom agents, automation, integration and voice.",
    followUps: ["Would you like to hear about voice agents, automation, or custom AI agents?"],
  },
  {
    path: "/case-studies",
    title: "Case Studies",
    aliases: ["case studies", "case study", "results", "success stories", "customers"],
    blurb:
      "Our Case Studies show real results customers achieved with ConverseAI.",
    followUps: ["Would you like to hear about our services, or book a demo?"],
  },
  {
    path: "/about-us",
    title: "About Us",
    aliases: ["about", "about us", "who are you", "company", "your team"],
    blurb:
      "ConverseAI is a team building conversational AI and automation for modern businesses.",
    followUps: ["Would you like to hear about our services, or contact us?"],
  },
  {
    path: "/contact-us",
    title: "Contact Us",
    aliases: ["contact", "contact us", "get in touch", "reach you", "email you"],
    blurb: "You can reach the ConverseAI team through our contact page.",
    followUps: ["Would you like to book a demo instead?"],
  },
  {
    path: "/book-demo",
    title: "Book a Demo",
    aliases: ["book demo", "book a demo", "demo", "schedule demo", "get a demo", "talk to sales"],
    blurb: "Book a demo to see ConverseAI in action with your own use case.",
    followUps: ["Would you like to hear about pricing first?"],
  },
  {
    path: "/blog",
    title: "Blog",
    aliases: ["blog", "articles", "posts", "read blog"],
    blurb: "Our Blog covers AI agents, automation and conversational AI.",
    followUps: ["Would you like me to read an article aloud once you open one?"],
  },
  {
    path: "/teams",
    title: "Teams",
    aliases: ["teams", "team feature", "collaboration"],
    blurb: "Teams lets you organise agents and collaborate on conversations.",
    followUps: ["Would you like to hear about reports, or agent capacity?"],
  },
];

/** A phrase like "pricing" that indicates the user wants the pricing page. */
export const PRICING_ALIASES = ["pricing", "price", "cost", "plans", "how much", "subscription"];

/** Find the best navigation destination for a spoken phrase, or null. */
export function matchDestination(text: string): VoiceDestination | null {
  const t = text.toLowerCase();

  // Longest-alias-first matching so "whatsapp ai chatbot" beats "chatbot".
  let best: { dest: VoiceDestination; len: number } | null = null;
  for (const dest of VOICE_DESTINATIONS) {
    for (const alias of dest.aliases) {
      if (t.includes(alias) && (!best || alias.length > best.len)) {
        best = { dest, len: alias.length };
      }
    }
  }
  return best ? best.dest : null;
}

/** Find the destination whose route matches the current pathname. */
export function destinationForPath(pathname: string): VoiceDestination | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return (
    VOICE_DESTINATIONS.find((d) => d.path === clean) ||
    (clean.startsWith("/blog") ? VOICE_DESTINATIONS.find((d) => d.path === "/blog") ?? null : null)
  );
}
