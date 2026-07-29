export interface Topic {
  id: string;
  keywords: string[];
  label: string;
  path: string;
}

// No canned answers here — keywords only decide *which page* is relevant.
// The actual spoken answer is read live from that page's real content
// (see pageContent.ts). Add a new topic whenever a new page should be
// reachable by voice.
export const TOPICS: Topic[] = [
  { id: "chatbot", keywords: ["ai chatbot", "chatbot", "chat bot", "build a bot"], label: "AI Chatbot", path: "/chatbot" },
  { id: "whatsapp-marketing", keywords: ["whatsapp marketing", "whatsapp campaign", "broadcast message", "whatsapp broadcast"], label: "WhatsApp Marketing", path: "/whatsapp-marketing" },
  { id: "whatsapp-chatbot", keywords: ["whatsapp chatbot", "whatsapp bot", "whatsapp ai chatbot"], label: "WhatsApp AI Chatbot", path: "/whatsapp-ai-chatbot" },
  { id: "whatsapp-shop", keywords: ["whatsapp shop", "whatsapp store", "sell on whatsapp"], label: "WhatsApp Shop", path: "/whatsapp-shop" },
  { id: "live-chat", keywords: ["live chat", "real time chat", "website chat"], label: "Live Chat", path: "/live-chat" },
  { id: "pre-chat-forms", keywords: ["pre chat form", "pre-chat form", "contact form before chat"], label: "Pre-Chat Forms", path: "/pre-chat-forms" },
  { id: "omni-channel", keywords: ["omni channel", "omnichannel", "unified inbox", "all channels in one place"], label: "Omni Channel", path: "/omni-channel" },
  { id: "agent-capacity", keywords: ["agent capacity", "agent workload", "auto assignment"], label: "Agent Capacity", path: "/agent-capacity" },
  { id: "private-notes", keywords: ["private note", "internal note", "tag teammate"], label: "Private Notes", path: "/private-notes" },
  { id: "live-view", keywords: ["live view", "monitor agents", "real time monitoring"], label: "Live View", path: "/live-view" },
  { id: "teams", keywords: ["teams feature", "team management", "organize agents"], label: "Teams", path: "/teams" },
  { id: "agent-reports", keywords: ["agent report", "agent performance", "agent productivity"], label: "Agent Reports", path: "/agent-reports" },
  { id: "csat-report", keywords: ["csat", "customer satisfaction report", "satisfaction score"], label: "CSAT Report", path: "/csat-report" },
  { id: "team-reports", keywords: ["team report", "team productivity", "team performance"], label: "Team Reports", path: "/team-reports" },
  { id: "inbox-reports", keywords: ["inbox report", "inbox performance", "resolution time"], label: "Inbox Reports", path: "/inbox-reports" },
  { id: "case-studies", keywords: ["case study", "case studies", "success story", "customer story"], label: "Case Studies", path: "/case-studies" },
  { id: "ai-for-smb", keywords: ["small business", "smb", "for small businesses"], label: "AI for Small Businesses", path: "/solutions/ai-for-smb" },
  { id: "book-demo", keywords: ["book a demo", "schedule a demo", "see a demo"], label: "Book a Demo", path: "/book-demo" },
  { id: "services", keywords: ["services", "what do you offer", "what can you do"], label: "Services", path: "/services" },
  { id: "ai-strategy-audit", keywords: ["strategy audit", "readiness audit", "ai audit"], label: "AI Strategy Audit", path: "/services/ai-strategy-audit" },
  { id: "agentic-automation", keywords: ["agentic automation", "process automation", "rpa"], label: "Agentic Automation", path: "/services/agentic-automation" },
  { id: "ai-voice-agents", keywords: ["voice agent", "voice ai", "ai voice"], label: "AI Voice Agents", path: "/services/ai-voice-agents" },
  { id: "ai-integration", keywords: ["integration", "integrate", "connect crm", "salesforce", "hubspot", "zoho", "zendesk"], label: "AI Integration", path: "/services/ai-integration" },
  { id: "custom-agents", keywords: ["custom agent", "custom ai agent"], label: "Custom AI Agents", path: "/services/custom-ai-agents" },
  { id: "knowledge-intelligence", keywords: ["knowledge intelligence", "document intelligence", "rag", "knowledge assistant"], label: "Knowledge Intelligence", path: "/services/knowledge-intelligence" },
  { id: "sales-ai", keywords: ["sales ai", "sales automation", "outreach"], label: "Sales AI", path: "/services/sales-ai" },
  { id: "about", keywords: ["about you", "who are you", "about converseai", "company"], label: "About Us", path: "/about-us" },
  { id: "contact", keywords: ["contact", "talk to someone", "get in touch", "book a call", "book demo"], label: "Contact Us", path: "/contact-us" },
];

export const FALLBACK_ANSWER =
  "I didn't catch a specific topic. Could you tell me what you're looking for — for example, services, chatbot, or WhatsApp marketing?";

export function matchTopic(transcript: string): Topic | null {
  const text = transcript.toLowerCase();
  let best: { topic: Topic; length: number } | null = null;

  // Pick the most specific match, not the first one in array order — e.g.
  // "whatsapp chatbot" should resolve to the "whatsapp-chatbot" topic, not
  // the generic "chatbot" topic, even though both keyword lists match.
  for (const topic of TOPICS) {
    for (const keyword of topic.keywords) {
      if (text.includes(keyword) && (!best || keyword.length > best.length)) {
        best = { topic, length: keyword.length };
      }
    }
  }

  return best?.topic ?? null;
}
