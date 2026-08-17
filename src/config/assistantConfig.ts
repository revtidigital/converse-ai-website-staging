/**
 * Central Configuration for Aira Local AI Voice Assistant (Ollama + Gemma 2)
 * Defines allowed dropdown values, synonyms for mapping user language,
 * website route mapping, and core system persona.
 */

export interface DropdownOption {
  id: string;
  label: string;
  synonyms: string[];
}

export const SERVICE_INTEREST_OPTIONS: DropdownOption[] = [
  {
    id: "ai_voice_agents",
    label: "AI Voice Agents",
    synonyms: [
      "phone call ai bot",
      "voice agent",
      "calling bot",
      "telephony agent",
      "inbound outbound call agent",
      "ai call center",
      "voice bot",
      "phone bot",
      "call automation",
    ],
  },
  {
    id: "whatsapp_ai_chatbot",
    label: "WhatsApp AI Chatbot",
    synonyms: [
      "whatsapp automation",
      "whatsapp bot",
      "whatsapp chat bot",
      "whatsapp marketing",
      "whatsapp shop",
      "meta whatsapp bot",
    ],
  },
  {
    id: "agentic_process_automation",
    label: "Agentic Process Automation",
    synonyms: [
      "process automation",
      "rpa",
      "workflow automation",
      "back office ai",
      "agentic automation",
      "task automation",
    ],
  },
  {
    id: "custom_ai_agents",
    label: "Custom AI Agents",
    synonyms: [
      "crm ai agent",
      "erp ai bot",
      "bespoke ai",
      "custom agent",
      "custom software integration",
      "salesforce ai",
      "hubspot ai",
    ],
  },
  {
    id: "ai_strategy_audit",
    label: "AI Strategy Audit",
    synonyms: [
      "ai audit",
      "strategy session",
      "readiness assessment",
      "ai roadmap",
      "ai consulting",
      "tech audit",
    ],
  },
];

export const BUDGET_RANGE_OPTIONS: DropdownOption[] = [
  {
    id: "<$5k",
    label: "Under $5,000",
    synonyms: ["under 5k", "below 5000", "small budget", "less than 5k", "<5k"],
  },
  {
    id: "$5k-$15k",
    label: "$5,000 - $15,000",
    synonyms: ["5k to 15k", "5000 to 15000", "mid budget", "10k"],
  },
  {
    id: "$15k-$50k",
    label: "$15,000 - $50,000",
    synonyms: ["15k to 50k", "15000 to 50000", "growth budget", "25k"],
  },
  {
    id: "$50k+",
    label: "$50,000+",
    synonyms: ["over 50k", "above 50000", "enterprise budget", "50k plus"],
  },
  {
    id: "not_specified",
    label: "Not Specified Yet",
    synonyms: ["not sure", "depends", "flexible", "tbd", "discuss later"],
  },
];

export const WEBSITE_ROUTES: Record<string, { title: string; path: string; description: string }> = {
  "ai-voice-agents": {
    title: "AI Voice Agents",
    path: "/services/ai-voice-agents",
    description: "Natural human-quality phone voice agents for inbound support & outbound sales.",
  },
  "whatsapp-ai-chatbot": {
    title: "WhatsApp AI Chatbot",
    path: "/whatsapp-ai-chatbot",
    description: "90%+ open rates, click-to-WhatsApp ads, broadcast campaigns, and automated sales.",
  },
  "agentic-automation": {
    title: "Agentic Process Automation",
    path: "/services/agentic-automation",
    description: "Autonomous AI workflows for back-office operations, invoicing, and SDR research.",
  },
  "custom-ai-agents": {
    title: "Custom AI Agents",
    path: "/services/custom-ai-agents",
    description: "Bespoke AI agents integrated directly into your existing CRM (Salesforce, HubSpot, Zoho).",
  },
  "ai-strategy-audit": {
    title: "AI Strategy Audit",
    path: "/services/ai-strategy-audit",
    description: "2-week deep-dive technology evaluation and high-ROI AI implementation roadmap.",
  },
  "case-studies": {
    title: "Case Studies",
    path: "/case-studies",
    description: "Real success stories: StyleMart (3x revenue), LearnSphere (2x enrolments), CareFirst (55% drop in no-shows).",
  },
  "services": {
    title: "All AI Services",
    path: "/services",
    description: "Full suite of ConverseAI solutions and enterprise AI services.",
  },
  "contact-us": {
    title: "Contact Us & Book Demo",
    path: "/contact-us",
    description: "Schedule a 15-minute discovery session with our AI leadership team.",
  },
  "about-us": {
    title: "About ConverseAI",
    path: "/about-us",
    description: "Learn about ConverseAI mission, enterprise security, SOC2 compliance, and client IP ownership.",
  },
};

export function mapUserLanguageToDropdownId(
  userText: string,
  options: DropdownOption[]
): string | null {
  if (!userText) return null;
  const normalized = userText.trim().toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");

  // 1. Direct match on ID or Label
  for (const opt of options) {
    const normId = opt.id.toLowerCase().replace(/-/g, " ");
    const normLabel = opt.label.toLowerCase().replace(/-/g, " ");
    if (normId === normalized || normLabel === normalized) {
      return opt.id;
    }
  }

  // 2. Match on Synonyms
  for (const opt of options) {
    for (const syn of opt.synonyms) {
      const normSyn = syn.toLowerCase().replace(/-/g, " ");
      if (normalized.includes(normSyn) || normSyn.includes(normalized)) {
        return opt.id;
      }
    }
  }

  return null;
}

export const AIRA_SYSTEM_PERSONA = `You are Aira, the AI Consultant for ConverseAI. You are warm, confident, concise, and helpful. Use only verified information returned by the approved website knowledge tools. Do not invent prices, timelines, integrations, case studies, or capabilities. If the required information is not present in approved knowledge, say: "I don’t want to give you an incorrect answer. I can arrange a quick call with our team to clarify this." Ask no more than one follow-up question at a time. Before any form submission or booking, repeat the details and obtain explicit confirmation. You must never claim to be human.`;
