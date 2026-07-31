/**
 * Aira — Custom Intelligent AI Voice Consultant Engine for theconverseai.com
 * Supports both Google Gemini / Gemma 2026 Realtime Generative API & Client-side NLP Engine.
 */

export type AiraState =
  | "GREETING"
  | "ANSWERING"
  | "OFFERING_CALL"
  | "COLLECTING_INFO"
  | "CONFIRMING_BOOKING"
  | "BOOKED";

export interface BookingDetails {
  name?: string;
  contact?: string;
  topic?: string;
}

export interface AiraResponse {
  reply: string;
  nextState: AiraState;
  navigateTo?: string;
  bookingDetails?: BookingDetails;
  triggerDemoPopup?: boolean;
}

export const EXACT_FALLBACK =
  "I don’t want to give you an incorrect answer. I can arrange a quick call with our team to clarify this.";

interface KnowledgeTopic {
  id: string;
  keywords: string[];
  title: string;
  path: string;
  benefits: string;
  details: string;
  followUp: string;
}

const APPROVED_KNOWLEDGE: KnowledgeTopic[] = [
  {
    id: "services",
    keywords: [
      "services that converse ai offers",
      "services converse ai offers",
      "what services does converse ai offer",
      "tell me the services",
      "services you offer",
      "what services do you offer",
      "list your services",
      "what do you offer",
      "what can you do",
      "all services",
      "our services",
      "solutions overview",
      "overview of services",
      "list of services",
      "all AI services",
    ],
    title: "Services Overview",
    path: "/services",
    benefits:
      "Converse AI offers end-to-end AI services including AI Strategy Audits, Custom AI Agent Development, AI Voice Agents, Agentic Process Automation, AI Integration, and Document Knowledge Intelligence.",
    details:
      "We build productized AI solutions that integrate seamlessly into your existing software stack, shipped in weeks with zero framework lock-in.",
    followUp: "Which of these specific AI services would you like to explore for your business?",
  },
  {
    id: "case-studies",
    keywords: [
      "example of how converse ai helped",
      "converse ai helped in businesses",
      "how converse ai helped",
      "how converse ai helps",
      "how has converse ai helped",
      "case study",
      "case studies",
      "success story",
      "success stories",
      "customer story",
      "client example",
      "real business examples",
      "business results",
      "client results",
      "customer results",
      "examples",
      "example of how you helped",
      "example of how converse ai help",
      "how you helped a business",
      "how you help business",
      "converse ai help the business",
      "converse ai help business",
      "helped a retail",
      "helped retail",
      "helped a company",
      "results you achieved",
      "show me results",
      "any example",
      "give me an example",
      "tell me an example",
      "can i give me an example",
      "give me an example of any case study",
      "case study of how ai helped",
      "how ai helped the business",
      "how ai helped business",
      "healthcare or education",
      "healthcare or education companies",
      "healthcare",
      "healthcare companies",
      "education",
      "education companies",
      "edtech",
      "clinics",
      "help healthcare",
      "help education",
      "helped healthcare",
      "helped education",
    ],
    title: "Case Studies",
    path: "/case-studies",
    benefits:
      "Yes, absolutely! We helped edtech platform LearnSphere double course enrolments in 90 days with 80% faster lead responses. For CareFirst Clinics, a healthcare network, our AI voice agents cut appointment no-shows by 55%.",
    details:
      "We've also helped retail brand StyleMart India achieve 3x revenue growth and a 65% support cost reduction using our WhatsApp AI Chatbot.",
    followUp: "Would you like me to guide you to our Case Studies page or arrange a quick discovery call?",
  },
  {
    id: "case-study-retail",
    keywords: [
      "retail case study",
      "retail example",
      "stylemart",
      "stylemart india",
      "retail business example",
      "retail success story",
      "helped a retail business",
      "retail AI example",
    ],
    title: "Case Studies",
    path: "/case-studies",
    benefits:
      "For StyleMart India, a major retail brand, we implemented a custom WhatsApp AI Chatbot for automated customer service, product recommendation, and order tracking.",
    details:
      "This drove 3x revenue growth and reduced customer support costs by 65% in just 90 days.",
    followUp: "Would you like to explore how a similar WhatsApp chatbot can grow your retail operations?",
  },
  {
    id: "case-study-education",
    keywords: [
      "education case study",
      "edtech case study",
      "learnsphere",
      "education example",
      "edtech example",
      "helped education",
      "education companies",
    ],
    title: "Case Studies",
    path: "/case-studies",
    benefits:
      "Yes! For edtech platform LearnSphere, we deployed AI lead-qualification agents that doubled course enrolments in 90 days with 80% faster lead response times.",
    details:
      "Our AI agents handled student inquiries 24/7 and instantly qualified leads before handing them to course advisors.",
    followUp: "Would you like to explore how AI can double your course enrolments or student sign-ups?",
  },
  {
    id: "case-study-healthcare",
    keywords: [
      "healthcare case study",
      "clinic case study",
      "carefirst",
      "carefirst clinics",
      "healthcare example",
      "medical case study",
      "helped healthcare",
      "healthcare companies",
      "hospitals",
      "clinics",
    ],
    title: "Case Studies",
    path: "/case-studies",
    benefits:
      "Yes! For CareFirst Clinics, a healthcare network, we integrated automated appointment scheduling AI voice agents that cut appointment no-shows by 55%.",
    details:
      "The AI voice agents conducted automated appointment reminders, handled rescheduling, and saved over 120 staff hours every month.",
    followUp: "Would you like to see how AI appointment scheduling can reduce patient no-shows for your clinic?",
  },
  {
    id: "agentic-automation",
    keywords: [
      "agentic automation",
      "agentic systems",
      "agentic process automation",
      "process automation",
      "back office automation",
      "invoice to pay",
      "reconciliation bot",
      "agentic",
    ],
    title: "Agentic Automation",
    path: "/services/agentic-automation",
    benefits:
      "Our Agentic Systems and Process Automation run back-office operations end-to-end, such as invoice processing, ticket triage, and financial reconciliation.",
    details:
      "We deploy productized AI agents that handle multi-step business workflows autonomously with zero human intervention required for routine operations.",
    followUp: "Would you like to explore how an Agentic Automation sprint could streamline your back-office operations?",
  },
  {
    id: "whatsapp-chatbot",
    keywords: [
      "whatsapp ai chatbot",
      "whatsapp chatbot",
      "whatsapp bot",
      "whatsapp ai",
      "whatsapp support bot",
      "watsapp bot",
      "whatsap bot",
      "whatsapp a chat",
      "whatsapp chat",
      "how whatsapp chatbot help",
      "how whatsapp chatbot will help",
      "whatsapp help my business",
      "whatsapp chatbot help my business",
      "how whatsapp helps",
      "how whatsapp will help",
      "whatsapp for business",
      "whatsapp chatbot for business",
      "benefits of whatsapp bot",
      "why use whatsapp chatbot",
    ],
    title: "WhatsApp AI Chatbot",
    path: "/whatsapp-ai-chatbot",
    benefits:
      "Our WhatsApp AI Chatbots deliver instant twenty-four seven customer support directly inside WhatsApp.",
    details:
      "They automatically answer inquiries, process product requests, and capture qualified leads round the clock while handing off complex queries to human agents when needed.",
    followUp: "Would you like to test a live WhatsApp bot demo or see how it integrates with your business?",
  },
  {
    id: "whatsapp-marketing",
    keywords: [
      "whatsapp marketing",
      "whatsapp campaign",
      "whatsapp broadcast",
      "click to whatsapp",
      "whatsapp store",
      "whatsapp shop",
      "sell on whatsapp",
    ],
    title: "WhatsApp Marketing",
    path: "/whatsapp-marketing",
    benefits:
      "Our WhatsApp Marketing solutions help you engage customers directly on WhatsApp with ninety percent plus open rates.",
    details:
      "You can launch targeted broadcast campaigns, run click-to-WhatsApp ad funnels, and manage customer conversations from a single team inbox.",
    followUp: "Shall I guide you through our WhatsApp automation workflow or arrange a quick call with our team?",
  },
  {
    id: "whatsapp-marketing-vs-chatbot",
    keywords: [
      "difference between whatsapp marketing and whatsapp chatbot",
      "difference between whatsapp marketing and whatsapp bot",
      "difference between whatsapp marketing and whatsapp chat bought",
      "whatsapp marketing vs whatsapp chatbot",
      "whatsapp marketing vs whatsapp bot",
      "whatsapp marketing vs chatbot",
      "difference between whatsapp marketing",
      "difference between whatsapp chatbot",
    ],
    title: "WhatsApp AI Chatbot",
    path: "/whatsapp-ai-chatbot",
    benefits:
      "The key difference is that WhatsApp Marketing focuses on outbound campaigns and promotional broadcasts to reach large audiences with 90%+ open rates.",
    details:
      "In contrast, a WhatsApp AI Chatbot is an interactive 24/7 automated agent that handles two-way customer conversations, answers inquiries instantly, and closes sales round the clock.",
    followUp: "Would you like to explore combining broadcast marketing with an interactive WhatsApp AI chatbot for your business?",
  },
  {
    id: "ai-voice-agents",
    keywords: [
      "voice agent",
      "ai voice agent",
      "voice ai",
      "ai voice",
      "phone agent",
      "calling bot",
      "ivr replacement",
      "call center ai",
      "vois agent",
      "voicebot",
    ],
    title: "AI Voice Agents",
    path: "/services/ai-voice-agents",
    benefits:
      "Our AI Voice Agents replace rigid IVR menus with natural, human-quality phone conversations.",
    details:
      "They handle inbound customer support calls, conduct outbound sales follow-ups, and log call transcripts directly into your CRM twenty-four seven.",
    followUp: "Would you like to see how an AI voice agent could handle your business phone calls?",
  },
  {
    id: "outbound-voice-agents",
    keywords: [
      "outbound calls",
      "outbound calling",
      "outbound lead follow up",
      "lead follow up",
      "make outbound calls",
      "outbound sales call",
      "follow up on leads",
      "lead follow ups",
      "calling leads",
      "can a voice agent make outbound calls",
      "outbound voice agent",
      "lead follow ups",
      "follow ups",
    ],
    title: "AI Voice Agents",
    path: "/services/ai-voice-agents",
    benefits:
      "Yes, absolutely! Our AI Voice Agents can automatically place outbound calls to fresh leads within seconds of form submission.",
    details:
      "They engage leads in natural conversation, qualify buyer intent, answer product questions, and instantly book discovery calls directly onto your sales team's calendar.",
    followUp: "Would you like to see how automated outbound calling can double your lead conversion rates?",
  },
  {
    id: "chatbot",
    keywords: [
      "website chatbot",
      "website bot",
      "ai chatbot",
      "chat bot",
      "chatbot",
      "live chat bot",
      "customer support bot",
    ],
    title: "AI Website Chatbots",
    path: "/chatbot",
    benefits:
      "Converse AI website chatbots convert passive site visitors into qualified sales opportunities twenty-four seven.",
    details:
      "They answer visitor questions accurately using your company knowledge base and capture lead contact details effortlessly.",
    followUp: "Would you like to see a demo of our website chatbot capabilities or schedule a walk-through?",
  },
  {
    id: "custom-agents",
    keywords: [
      "custom agent",
      "custom ai agent",
      "custom ai agent development",
      "custom bot",
      "bespoke agent",
      "custom workflow automation",
      "crm integration",
      "back office bot",
    ],
    title: "Custom AI Agent Development",
    path: "/services/custom-ai-agents",
    benefits:
      "Our Custom AI Agents are bespoke AI systems built specifically for your unique workflow, such as SDR research, AR clerk, or L2 support.",
    details:
      "We build custom agents from scratch to fit your exact proprietary data and tools. You retain one hundred percent ownership of the code, data, and IP.",
    followUp: "What specific workflow or manual process in your business are you looking to automate?",
  },
  {
    id: "crm-custom-agents",
    keywords: [
      "existing software like crm",
      "custom ai agent for existing software",
      "ai agent for crm",
      "crm ai agent",
      "integrate with crm",
      "salesforce ai agent",
      "hubspot ai agent",
      "existing crm",
      "existing software",
      "existing software like",
      "software like crm",
    ],
    title: "Custom AI Agents",
    path: "/services/custom-ai-agents",
    benefits:
      "Yes, absolutely! We build custom AI agents that integrate seamlessly into your existing CRM like Salesforce, HubSpot, or Zoho, as well as ERPs and internal databases.",
    details:
      "Our agents read and write data directly into your software stack, automating repetitive tasks without requiring any changes to your team's existing workflows.",
    followUp: "Which CRM or software platform does your team currently use?",
  },
  {
    id: "ai-strategy-audit",
    keywords: [
      "strategy audit",
      "ai strategy audit",
      "ai audit",
      "readiness assessment",
      "roadmap",
    ],
    title: "AI Strategy Audit",
    path: "/services/ai-strategy-audit",
    benefits:
      "Our AI Strategy Audit evaluates your current technology stack and identifies high-ROI automation opportunities across your operations.",
    details:
      "We deliver a clear, actionable AI implementation roadmap within two weeks to maximize efficiency and cost savings.",
    followUp: "Would you like to schedule an AI strategy audit for your business?",
  },
  {
    id: "deployment-timeline",
    keywords: [
      "how fast can you deploy",
      "how fast",
      "deployment time",
      "how long to build",
      "turnaround time",
      "how long does it take",
      "time to deploy",
      "delivery time",
      "build timeline",
      "how fast can you build",
      "speed of deployment",
      "how long",
    ],
    title: "Deployment Timeline",
    path: "/services",
    benefits:
      "We deploy initial production-ready AI agents in just 2 to 4 weeks, with fast proof-of-concept prototypes delivered in just a few days.",
    details:
      "Our productized AI framework integrates directly into your existing software stack so your business gets immediate ROI without any long development cycles.",
    followUp: "Would you like to schedule a quick discovery call to discuss a timeline for your specific AI project?",
  },
  {
    id: "about",
    keywords: [
      "about us",
      "about converse ai",
      "who are you",
      "who is converse ai",
      "company overview",
      "tell me about your company",
    ],
    title: "About Converse AI",
    path: "/about-us",
    benefits:
      "Converse AI is a premier AI agency specializing in intelligent voice agents, WhatsApp automation, and custom workflow AI.",
    details:
      "We partner with growing businesses to design, build, and deploy enterprise-grade conversational AI systems that scale customer operations efficiently.",
    followUp: "Which specific area of your business operations are you hoping to transform with AI?",
  },
];

// Small talk patterns
const SMALLTALK_PATTERNS = [
  {
    regex: /\b(how are you|how do you do|how's it going|how are u|how r u|kaise ho)\b/i,
    reply:
      "I'm doing great, thank you for asking! I'm here and ready to help you explore Converse AI's automation and voice solutions. How can I assist your business today?",
  },
  {
    regex: /\b(hi|hello|hey|good morning|good afternoon|good evening|namaste|greetings)\b/i,
    reply: "Hello! How can I assist your business with our AI solutions today?",
  },
  {
    regex: /\b(who are you|what is your name|who made you|who created you)\b/i,
    reply:
      "I'm Aira, your warm and knowledgeable AI consultant at Converse AI! We design, build, and deploy AI Voice Agents, WhatsApp chatbots, and custom workflow automation for growing businesses.",
  },
];

// Completely out-of-context patterns
const OUT_OF_CONTEXT_PATTERNS = [
  /\b(capital of|weather|joke|movie|song|president|prime minister|sports|cricket|football|game|joke|tell me a joke)\b/i,
];

// Low confidence / unsupported request patterns (pricing, timelines, custom policies)
const UNSUPPORTED_PATTERNS = [
  /\b(price|pricing|cost|rate|charge|fee|subscription|how much|dollar|rupee|inr|quotes?)\b/i,
  /\b(timeline|how long|duration|delivery date|weeks|months|turnaround|sla)\b/i,
  /\b(discount|refund|guarantee|warranty|contract terms)\b/i,
];

// Call / Demo booking triggers (requires intent phrase, not single word 'call')
const CALL_TRIGGERS = [
  /\b(book|schedule|arrange|set up|request)\b.*\b(call|demo|consultation|meeting|appointment)\b/i,
  /\b(book a call|book demo|schedule call|schedule demo|talk to sales|speak to sales|speak with sales|speak to a consultant|contact sales|get a demo|want a call|want a demo)\b/i,
];

// Positive confirmation patterns
const POSITIVE_CONFIRM_PATTERNS = [
  /\b(yes|yeah|sure|yep|ok|okay|sounds good|let's do it|please do|confirm|go ahead|right|correct|show me|tell me more|of course)\b/i,
];

// Contact extraction regexes
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}\b/;

// Words that indicate meta-commentary rather than actual spoken answers
const META_WORDS = /\b(sentence count|draft \d|constraint check|option \d|persona:|mandate:|user question:|knowledge base:|final polish|meets all criteria|sentence \d)/i;

function isValidSpokenAnswer(text: string): boolean {
  if (!text || text.length < 15) return false;
  if (text.length > 1500) return false;
  if (META_WORDS.test(text)) return false;
  // Strip markdown before checking start characters
  const stripped = text.replace(/^\*\*/, "").trim();
  if (stripped.startsWith("* ") || stripped.startsWith("- ") || stripped.startsWith("# ")) return false;
  // Must contain at least one period, question mark, or exclamation (real sentences)
  if (!/[.!?]/.test(text)) return false;
  return true;
}

function cleanAIResponse(rawText: string): string | null {
  const text = rawText.trim();

  // 1. Look for explicit Draft / Final answer markers
  const matches = text.match(/(?:\*Draft \d|\*Final Polish|\*Final Version|\*Final|Draft \d|Final:)[^*]*?:\s*["']?([\s\S]+?)(?:["']?\s*\n\*|\s*$)/gi);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1];
    const cleaned = last.replace(/^[^*]*:\s*["']?|["']?$/g, "").trim();
    if (isValidSpokenAnswer(cleaned)) {
      return stripMarkdown(cleaned);
    }
  }

  // 2. Extract ALL quoted blocks, filter for valid spoken answers, take the LONGEST
  const quotedBlocks = text.match(/"([^"]{30,})"/g);
  if (quotedBlocks && quotedBlocks.length > 0) {
    const validQuotes = quotedBlocks
      .map((q) => q.replace(/^"|"$/g, "").trim())
      .filter((q) => isValidSpokenAnswer(q));
    if (validQuotes.length > 0) {
      validQuotes.sort((a, b) => b.length - a.length);
      return stripMarkdown(validQuotes[0]);
    }
  }

  // 3. Split by double newlines, scan backwards for clean non-meta paragraph
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const para = stripMarkdown(paragraphs[i]).replace(/^["']|["']$/g, "").trim();
    if (
      !para.startsWith("*") &&
      !para.startsWith("-") &&
      !para.startsWith("#") &&
      !/^(Draft|User|Goal|Persona|Constraints|Check|Option|Sentence|Count|Knowledge|Total|Markdown|Self-Correction|Refining)/i.test(para) &&
      isValidSpokenAnswer(para)
    ) {
      return para;
    }
  }

  // Strategy 3: Join all non-reasoning lines and check if the result is valid
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const cleanLines = lines.filter(
    (l) => {
      const stripped = stripMarkdown(l).trim();
      return (
        !stripped.startsWith("* ") &&
        !stripped.startsWith("- ") &&
        !stripped.startsWith("# ") &&
        !META_WORDS.test(stripped) &&
        stripped.length > 20
      );
    }
  );
  if (cleanLines.length > 0) {
    const joined = cleanLines.join(" ").replace(/^["']|["']$/g, "").trim();
    if (isValidSpokenAnswer(joined)) {
      return stripMarkdown(joined);
    }
  }

  // All strategies failed — return null to signal fallback to local engine
  return null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .trim();
}

/**
 * Normalizes common speech-to-text misrecognitions.
 * Speech recognition often transcribes "Converse AI" as "conversation",
 * "converse your", "converse a i", "converse ai eye", etc.
 */
function normalizeTranscript(text: string): string {
  return text
    // STT prefix noise like "es ", "ey ", "ye "
    .replace(/^(es|ey|ye)\s+/gi, "yes ")
    // STT slip "can i give me" / "can i get" → "can you give me"
    .replace(/^can i (give|get|tell|show) me/gi, "can you $1 me")
    // STT slip "chat bought" / "chat bot" → "chatbot"
    .replace(/\bchat\s*(bought|bot)\b/gi, "chatbot")
    // STT slip "whatsapp a chat" / "whatsapp chat" → "whatsapp chatbot"
    .replace(/\bwhatsapp\s+a?\s*chat(bot|bought)?\b/gi, "whatsapp chatbot")
    // "conversation" → "converse ai" (most common STT error)
    .replace(/\bconversation\b/gi, "converse ai")
    // "converse your" → "converse ai"
    .replace(/\bconverse your\b/gi, "converse ai")
    // "converse a i" → "converse ai"
    .replace(/\bconverse a i\b/gi, "converse ai")
    // "converse ai eye" → "converse ai"
    .replace(/\bconverse ai eye\b/gi, "converse ai")
    // "can verse" → "converse"
    .replace(/\bcan verse\b/gi, "converse")
    // "convert ai" → "converse ai"
    .replace(/\bconvert ai\b/gi, "converse ai")
    // "conserve ai" → "converse ai"
    .replace(/\bconserve ai\b/gi, "converse ai")
    .trim();
}

function bigramSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  // Only count as substring match if the keyword is at least 5 chars
  // to avoid false positives like "bot" matching inside "about"
  if (s2.length >= 5 && s1.includes(s2)) return 0.85;
  if (s1.length >= 5 && s2.includes(s1)) return 0.85;

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.slice(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return 0;

  let intersection = 0;
  bg1.forEach((b) => {
    if (bg2.has(b)) intersection++;
  });

  return (2 * intersection) / (bg1.size + bg2.size);
}

export class AiraEngine {
  private state: AiraState = "GREETING";
  private lastOfferedTopic: string | null = null;
  private lastOfferedTopicObj: KnowledgeTopic | null = null;
  private bookingDetails: BookingDetails = {};

  public getState(): AiraState {
    return this.state;
  }

  public resetState(): void {
    this.state = "GREETING";
    this.lastOfferedTopic = null;
    this.lastOfferedTopicObj = null;
    this.bookingDetails = {};
  }

  public getGreeting(): AiraResponse {
    this.state = "GREETING";
    return {
      reply:
        "Hello! I'm Aira, your AI consultant at Converse AI. We build intelligent voice agents, WhatsApp chatbots, and custom workflow automation for growing businesses. How can I assist your business today?",
      nextState: "ANSWERING",
    };
  }

  /**
   * Async Realtime Generative API Processor — races API against 3s timer for instant response
   */
  public async processMessageAsync(
    userTranscript: string,
    historyMessages: { sender: "user" | "aira"; text: string }[] = []
  ): Promise<AiraResponse> {
    // Local engine answer is ALWAYS ready instantly as fallback
    const localAnswer = this.processMessage(userTranscript);

    const apiKey =
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      (typeof window !== "undefined" ? sessionStorage.getItem("aira_gemini_api_key") : null);

    if (!apiKey || !apiKey.trim() || apiKey === "your_gemini_api_key_here") {
      return localAnswer;
    }

    // Race: API call vs 3-second timer
    let cancelled = false;
    const apiPromise = (async (): Promise<AiraResponse | null> => {
      try {
        // Build properly alternating contents array for Gemini API
        const historyContents = historyMessages.slice(-6).map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        // Ensure proper role alternation (no consecutive same-role entries)
        const dedupedHistory: typeof historyContents = [];
        for (const entry of historyContents) {
          if (dedupedHistory.length === 0 || dedupedHistory[dedupedHistory.length - 1].role !== entry.role) {
            dedupedHistory.push(entry);
          }
        }

        const systemPromptPart = `You are Aira, a warm and intelligent AI sales consultant for Converse AI (theconverseai.com). Respond directly to the visitor in 2-3 warm, natural spoken sentences. Do not write any thoughts, scratchpads, or drafts.

Company Knowledge:
- Solutions: AI Voice Agents (/services/ai-voice-agents), WhatsApp AI Chatbots (/whatsapp-ai-chatbot), Agentic Process Automation (/services/agentic-automation), Custom AI Agents (/services/custom-ai-agents), AI Strategy Audits (/services/ai-strategy-audit).
- Case Studies: StyleMart India (3x revenue, 65% cost saved via WhatsApp AI Chatbot), LearnSphere (doubled enrolments in 90 days), CareFirst Clinics (55% drop in no-shows).

Visitor Question: "${userTranscript}"
Spoken Answer:`;

        const contents = [
          ...dedupedHistory,
          { role: "user" as const, parts: [{ text: systemPromptPart }] },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 256,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (cancelled) return null; // Race lost, don't mutate state

        if (res.ok) {
          const json = await res.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText && !cancelled) {
            const cleanAnswer = cleanAIResponse(rawText);
            if (cleanAnswer) {
              this.state = "ANSWERING";
              // Intelligently detect if Gemini mentioned a page path to navigate to
              let navigateTo: string | undefined = undefined;
              const pathMatch = rawText.match(/\/(services\/[a-z-]+|whatsapp-ai-chatbot|whatsapp-marketing|case-studies|contact-us|about-us)/i);
              if (pathMatch) {
                navigateTo = pathMatch[0];
              }
              // Clean out raw path strings and leading prepositions from spoken answer so speech sounds 100% natural
              const finalReply = cleanAnswer
                .replace(/\s*(at|on|check out|visit|see|explore)?\s*\/(services\/[a-z-]+|whatsapp-ai-chatbot|whatsapp-marketing|case-studies|contact-us|about-us)[.\s]*/gi, " ")
                .replace(/\s+([.,!?])/g, "$1")
                .trim();

              return { reply: finalReply || cleanAnswer, nextState: "ANSWERING", navigateTo };
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => {
      cancelled = true;
      resolve(null);
    }, 8000));

    // Whichever finishes first wins
    const result = await Promise.race([apiPromise, timeoutPromise]);
    return result || localAnswer;
  }

  public processMessage(userTranscript: string): AiraResponse {
    const text = normalizeTranscript(userTranscript.trim().toLowerCase());
    if (!text) {
      return {
        reply: "I didn't quite catch that. Could you please repeat your question?",
        nextState: this.state,
      };
    }

    // 1. Small Talk & Friendly Greetings Match
    for (const st of SMALLTALK_PATTERNS) {
      if (st.regex.test(text)) {
        this.state = "ANSWERING";
        return {
          reply: st.reply,
          nextState: "ANSWERING",
        };
      }
    }

    // 1.5 Navigation Intent — user wants to GO TO a page, not learn about it
    const navIntent = /\b(guide me|take me|show me|go to|navigate|open|visit)\b.*\b(case stud|services|about|voice agent|whatsapp|chatbot|automation|contact|pricing)/i;
    if (navIntent.test(text)) {
      // Find which page they want
      for (const topic of APPROVED_KNOWLEDGE) {
        for (const kw of topic.keywords) {
          if (text.includes(kw) || bigramSimilarity(text, kw) >= 0.65) {
            this.state = "ANSWERING";
            this.lastOfferedTopic = topic.title;
            return {
              reply: `Sure! Let me take you to our ${topic.title} page right away. You'll find all the details there.`,
              nextState: "ANSWERING",
              navigateTo: topic.path,
            };
          }
        }
      }
    }

    // 2. Out of Context Questions Handling
    const isOutOfContext = OUT_OF_CONTEXT_PATTERNS.some((p) => p.test(text));
    if (isOutOfContext) {
      this.state = "ANSWERING";
      return {
        reply:
          "I am specialized in Converse AI's solutions such as AI Voice Agents, WhatsApp Chatbots, and Workflow Automation. For topics outside our AI services, I can connect you with our team or help you explore our automation solutions. Which area of your business operations would you like to transform?",
        nextState: "ANSWERING",
      };
    }

    const isPositive = POSITIVE_CONFIRM_PATTERNS.some((p) => p.test(text));

    // 3. Handle positive response when Aira asked a follow-up or offered a call/demo
    if (isPositive) {
      if (this.lastOfferedTopicObj) {
        const topic = this.lastOfferedTopicObj;
        this.lastOfferedTopicObj = null;
        this.state = "ANSWERING";
        return {
          reply: `Sure! Taking you right to our ${topic.title} page now. You'll find all the details and case studies there!`,
          nextState: "ANSWERING",
          navigateTo: topic.path,
        };
      }

      if (this.state === "OFFERING_CALL") {
        this.state = "COLLECTING_INFO";
        const topicContext = this.lastOfferedTopic ? ` for ${this.lastOfferedTopic}` : "";
        return {
          reply: `Wonderful! I can schedule a live demonstration or discovery call${topicContext} with our expert team. Could you please share your name and email address or phone number?`,
          nextState: "COLLECTING_INFO",
          navigateTo: "/contact-us",
        };
      }
    }

    // 4. Contact Collection Flow
    if (this.state === "COLLECTING_INFO") {
      const emailMatch = userTranscript.match(EMAIL_REGEX);
      const phoneMatch = userTranscript.match(PHONE_REGEX);
      const contactInfo = emailMatch ? emailMatch[0] : phoneMatch ? phoneMatch[0] : null;

      if (contactInfo) {
        const namePart = userTranscript
          .replace(contactInfo, "")
          .replace(/my (email|phone|number|name) is/gi, "")
          .replace(/i am|this is/gi, "")
          .replace(/[0-9]+/g, "")
          .replace(/[^a-zA-Z\s]/g, "")
          .trim();

        const name = namePart.length > 1 && namePart.length < 30 ? namePart : "Valued Guest";
        this.bookingDetails.name = name;
        this.bookingDetails.contact = contactInfo;
        this.state = "CONFIRMING_BOOKING";

        return {
          reply: `Thank you! I have noted your contact details as ${contactInfo}${
            name !== "Valued Guest" ? ` for ${name}` : ""
          }. Should I confirm this consultation request with our team now?`,
          nextState: "CONFIRMING_BOOKING",
          bookingDetails: { ...this.bookingDetails },
        };
      }
    }

    if (this.state === "CONFIRMING_BOOKING") {
      if (isPositive) {
        this.state = "BOOKED";
        return {
          reply:
            "Fantastic! Your consultation request has been confirmed. Our specialist team will reach out to you shortly. Is there anything else about Converse AI I can help you with today?",
          nextState: "ANSWERING",
          triggerDemoPopup: true,
          bookingDetails: { ...this.bookingDetails },
        };
      } else {
        this.state = "ANSWERING";
        return {
          reply:
            "No problem at all! What else would you like to explore regarding our AI solutions?",
          nextState: "ANSWERING",
        };
      }
    }

    // 5. Knowledge Match Engine (Hybrid Exact & Fuzzy Intent Priority Matching)
    let bestTopic: KnowledgeTopic | null = null;
    let maxMatchedLength = 0;
    let highestFuzzyScore = 0;

    for (const topic of APPROVED_KNOWLEDGE) {
      for (const kw of topic.keywords) {
        if (text.includes(kw)) {
          if (kw.length > maxMatchedLength) {
            maxMatchedLength = kw.length;
            bestTopic = topic;
          }
        } else {
          const sim = bigramSimilarity(text, kw);
          if (sim >= 0.70 && sim > highestFuzzyScore && maxMatchedLength === 0) {
            highestFuzzyScore = sim;
            bestTopic = topic;
          }
        }
      }
    }

    if (bestTopic && (maxMatchedLength >= 3 || highestFuzzyScore >= 0.70)) {
      this.state = "ANSWERING";
      this.lastOfferedTopic = bestTopic.title;
      this.lastOfferedTopicObj = bestTopic;
      this.bookingDetails.topic = bestTopic.title;

      const answer = `${bestTopic.benefits} ${bestTopic.details} ${bestTopic.followUp}`;

      return {
        reply: answer,
        nextState: "ANSWERING",
        navigateTo: bestTopic.path,
      };
    }

    // 6. Check for Low Confidence / Pricing / Custom SLA triggers (only if no knowledge topic matched)
    const isUnsupported = UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(text));
    if (isUnsupported) {
      this.state = "OFFERING_CALL";
      return {
        reply: `${EXACT_FALLBACK} Would you like me to book a brief fifteen-minute discovery call for you?`,
        nextState: "OFFERING_CALL",
        navigateTo: "/contact-us",
      };
    }

    // 7. Check for Call / Demo intent triggers (only if no specific topic matched)
    const isCallRequest = CALL_TRIGGERS.some((pattern) => pattern.test(text));
    if (isCallRequest) {
      this.state = "COLLECTING_INFO";
      return {
        reply:
          "I would be delighted to set up a discovery call with our team for you. Could you please share your name and email address or phone number?",
        nextState: "COLLECTING_INFO",
        navigateTo: "/contact-us",
      };
    }

    // 8. Fallback for low confidence match
    this.state = "OFFERING_CALL";
    return {
      reply: `${EXACT_FALLBACK} Shall I arrange a short call with one of our AI consultants?`,
      nextState: "OFFERING_CALL",
      navigateTo: "/contact-us",
    };
  }
}
