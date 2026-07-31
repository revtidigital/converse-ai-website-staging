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
      "solutions",
      "services",
      "help in growing sales",
      "grow sales",
      "growing business",
      "grow my business",
      "help my business",
      "help business",
      "help in business",
      "improve sales",
      "increase sales",
      "boost sales",
      "help with sales",
      "how can you help",
      "how do you help",
      "how does converse ai help",
      "what can converse ai do",
      "how can ai help",
    ],
    title: "Converse AI Services Overview",
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
    ],
    title: "Customer Case Studies & Success Stories",
    path: "/case-studies",
    benefits:
      "Converse AI has helped over 500 businesses transform customer operations. For example, StyleMart India achieved 3× revenue growth and a 65% support cost reduction using our WhatsApp AI Chatbot. LearnSphere doubled course enrolments in 90 days with 80% faster lead responses, and CareFirst Clinics cut appointment no-shows by 55%.",
    details:
      "Our case studies demonstrate real measurable growth across retail, edtech, and healthcare industries.",
    followUp: "Would you like me to guide you to our Case Studies page or arrange a quick call to see similar results for your business?",
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
    title: "Agentic Systems & Process Automation",
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
    title: "WhatsApp Marketing & Automation",
    path: "/whatsapp-marketing",
    benefits:
      "Our WhatsApp Marketing solutions help you engage customers directly on WhatsApp with ninety percent plus open rates.",
    details:
      "You can launch targeted broadcast campaigns, run click-to-WhatsApp ad funnels, and manage customer conversations from a single team inbox.",
    followUp: "Shall I guide you through our WhatsApp automation workflow or arrange a quick call with our team?",
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
    id: "ai-strategy-audit",
    keywords: [
      "strategy audit",
      "ai strategy audit",
      "ai audit",
      "readiness audit",
      "ai roadmap",
      "ai consulting",
    ],
    title: "AI Strategy Audit",
    path: "/services/ai-strategy-audit",
    benefits:
      "Our AI Strategy Audit evaluates your current operations and tech stack before you deploy AI.",
    details:
      "Our engineering team identifies your highest ROI opportunities and provides a step-by-step implementation roadmap tailored to your goals.",
    followUp: "Would you like to book an AI Strategy Audit session with our leadership team?",
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

// Call / Demo booking triggers
const CALL_TRIGGERS = [
  /\b(book|schedule|arrange|set up|call|demo|consultation|talk|speak|contact|get in touch)\b/i,
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
  let text = rawText.trim();

  // If the output is short and looks clean already, return it
  if (text.length < 500 && !text.includes("* ") && !text.includes("Draft") && isValidSpokenAnswer(text)) {
    return stripMarkdown(text);
  }

  // Strategy 1: Extract ALL quoted blocks, filter for valid spoken answers, take the LONGEST
  const quotedBlocks = text.match(/"([^"]{30,})"/g);
  if (quotedBlocks && quotedBlocks.length > 0) {
    const validQuotes = quotedBlocks
      .map((q) => q.replace(/^"|"$/g, "").trim())
      .filter((q) => isValidSpokenAnswer(q));
    if (validQuotes.length > 0) {
      // Take the longest valid quoted block (usually the final polished answer)
      validQuotes.sort((a, b) => b.length - a.length);
      return stripMarkdown(validQuotes[0]);
    }
  }

  // Strategy 2: Split by double newlines, find the last clean paragraph
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const para = paragraphs[i].replace(/^["']|["']$/g, "").trim();
    if (isValidSpokenAnswer(para)) {
      return stripMarkdown(para);
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
  private bookingDetails: BookingDetails = {};

  public getState(): AiraState {
    return this.state;
  }

  public resetState(): void {
    this.state = "GREETING";
    this.lastOfferedTopic = null;
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

        const contents = [
          ...dedupedHistory,
          { role: "user" as const, parts: [{ text: userTranscript }] },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: `You are Aira, a warm AI sales consultant for Converse AI (theconverseai.com). Your ENTIRE response must be ONLY 2-3 natural spoken sentences. Do NOT include ANY thinking, reasoning, drafts, bullet points, asterisks, or planning. Just speak directly. Knowledge: AI Voice Agents, WhatsApp AI Chatbots, Agentic Automation, Custom AI Agents, AI Strategy Audits. Case studies: StyleMart India (3x revenue, 65% cost saved), LearnSphere (2x enrolments in 90 days), CareFirst Clinics (55% no-show drop). No fake prices.`
              }]
            },
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
              return { reply: cleanAnswer, nextState: "ANSWERING" };
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
    }, 3000));

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
    if (isPositive && this.state === "OFFERING_CALL") {
      this.state = "COLLECTING_INFO";
      const topicContext = this.lastOfferedTopic ? ` for ${this.lastOfferedTopic}` : "";
      return {
        reply: `Wonderful! I can schedule a live demonstration or discovery call${topicContext} with our expert team. Could you please share your name and email address or phone number?`,
        nextState: "COLLECTING_INFO",
        navigateTo: "/contact-us",
      };
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

    // 5. Check for Low Confidence / Pricing / Timeline / Policy triggers
    const isUnsupported = UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(text));
    if (isUnsupported) {
      this.state = "OFFERING_CALL";
      return {
        reply: `${EXACT_FALLBACK} Would you like me to book a brief fifteen-minute discovery call for you?`,
        nextState: "OFFERING_CALL",
        navigateTo: "/contact-us",
      };
    }

    // 6. Check for Call / Demo intent triggers
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

    // 7. Knowledge Match Engine (Hybrid Exact & Fuzzy Intent Priority Matching)
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
      this.bookingDetails.topic = bestTopic.title;

      const answer = `${bestTopic.benefits} ${bestTopic.details} ${bestTopic.followUp}`;

      return {
        reply: answer,
        nextState: "ANSWERING",
        navigateTo: bestTopic.path,
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
