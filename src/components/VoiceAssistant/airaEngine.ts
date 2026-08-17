/**
 * Aira — Custom Intelligent AI Voice Consultant Engine for theconverseai.com
 * Powered by Google Gemma LLM & NVIDIA Parakeet Human Voice Speech Engine.
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

import { ALL_200_APPROVED_KNOWLEDGE } from "./topicsData";

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
  ...ALL_200_APPROVED_KNOWLEDGE,
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
    id: "voice-agent-accents-india",
    keywords: [
      "accents in india",
      "caller accents",
      "indian accents",
      "handle accents",
      "regional accents",
      "accents",
    ],
    title: "Indian Accents & Dialects",
    path: "/services/ai-voice-agents",
    benefits:
      "Our AI Voice Agents feature acoustic model adaptation fine-tuned on diverse Indian regional accents (North, South, East, West) and Hinglish dialects to ensure high speech recognition accuracy.",
    details:
      "The speech engine filters background noise and recognizes regional speech nuances without dropping call context.",
    followUp: "Would you like to test how our voice agent handles regional speech in a live demo call?",
  },
  {
    id: "toll-free-1800",
    keywords: [
      "toll-free",
      "1800",
      "toll free",
      "1800 numbers",
      "operate on toll-free",
      "tollfree",
    ],
    title: "Toll-Free 1800 Telephony",
    path: "/services/ai-voice-agents",
    benefits:
      "Yes! Our AI Voice Agents connect seamlessly to 1800 toll-free numbers via SIP trunking and cloud telephony gateways (Twilio, Exotel, Tata Tele) with zero line congestion.",
    details:
      "They handle high-volume inbound customer queries 24/7 on toll-free lines with automated CRM logging.",
    followUp: "Shall I show you how we connect AI voice agents to your existing 1800 toll-free lines?",
  },
  {
    id: "sip-trunk-integration",
    keywords: [
      "sip trunk",
      "sip trunking",
      "sip integration",
      "sip trunk integration process",
      "pbx integration",
    ],
    title: "SIP Trunk Integration",
    path: "/services/ai-voice-agents",
    benefits:
      "SIP trunk integration connects directly via WebSockets and WebRTC to your PBX or cloud telephony provider, enabling instant call initiation and bi-directional audio streaming.",
    details:
      "Our architecture plugs into existing PBX, Asterisk, Twilio, or Exotel infrastructure without requiring any hardware changes.",
    followUp: "Would you like to review our SIP trunking integration architecture guide?",
  },
  {
    id: "simultaneous-concurrent-calls",
    keywords: [
      "simultaneous phone calls",
      "how many simultaneous",
      "concurrent calls",
      "simultaneous calls",
      "how many calls",
      "simultaneous",
    ],
    title: "High Concurrency Scaling",
    path: "/services/ai-voice-agents",
    benefits:
      "A single ConverseAI deployment can handle thousands of simultaneous concurrent phone calls automatically with auto-scaling worker queues and zero hold times.",
    details:
      "Dynamic load balancing ensures every caller gets instant response times even during peak holiday sales spikes.",
    followUp: "Would you like to see how our auto-scaling architecture handles high call concurrency?",
  },
  {
    id: "call-recording-compliance",
    keywords: [
      "call recording",
      "support call recording",
      "recording for compliance",
      "record calls",
      "compliance recording",
    ],
    title: "Call Recording & Compliance",
    path: "/services/ai-voice-agents",
    benefits:
      "Yes! Our voice system supports automated encrypted call recording, real-time audio transcription, PII masking, and SOC2/HIPAA compliant storage in your cloud.",
    details:
      "All audio recordings and transcript summaries are indexed and securely attached to CRM contact records.",
    followUp: "Shall I walk you through our call recording security and PII masking controls?",
  },
  {
    id: "hinglish-code-switching-sentence",
    keywords: [
      "hindi and english in one sentence",
      "code switching",
      "hinglish in one sentence",
      "both hindi and english",
      "mixed languages",
    ],
    title: "Hinglish Code-Switching",
    path: "/services/ai-voice-agents",
    benefits:
      "Our speech recognition engine is specially trained for code-switching, seamlessly understanding mixed Hindi and English (Hinglish) spoken naturally within the exact same sentence!",
    details:
      "Whether callers switch between Hindi and English phrases mid-sentence, the AI maintains full contextual understanding and responds fluently.",
    followUp: "Would you like to test Hinglish code-switching live on a call demo?",
  },
  {
    id: "supported-document-formats",
    keywords: [
      "document formats",
      "supported by knowledge intelligence",
      "formats are supported",
      "file formats",
      "supported formats",
    ],
    title: "Supported Document Formats",
    path: "/services/knowledge-intelligence",
    benefits:
      "Knowledge Intelligence supports all major document formats including PDF, DOCX, TXT, CSV, XLSX, Markdown, HTML, and Notion/Confluence pages with citation-backed vector search.",
    details:
      "The engine extracts text, tables, and structured data while maintaining document section hierarchy and source page metadata.",
    followUp: "Would you like to test uploading internal SOP documents to see citation-backed answers?",
  },
  {
    id: "whatsapp-cart-conversion-rates",
    keywords: [
      "conversion rates do whatsapp abandoned cart",
      "whatsapp abandoned cart bots deliver",
      "cart bots deliver",
      "conversion rates do whatsapp",
      "abandoned cart conversion",
    ],
    title: "WhatsApp Cart Conversion",
    path: "/case-studies/retail-brand-whatsapp-automation",
    benefits:
      "ConverseAI WhatsApp AI Chatbots deliver a 38% conversion rate on automated abandoned cart recovery messages and a 65% total reduction in support operational costs.",
    details:
      "For retail clients like StyleMart India, automated cart reminders helped recover lost revenue within minutes of cart abandonment.",
    followUp: "Would you like to explore setting up automated WhatsApp abandoned cart recovery for your store?",
  },
  {
    id: "logistics-company-support",
    keywords: [
      "logistics company",
      "logistics company streamline support",
      "logistics support",
      "help a logistics company",
      "logistics",
    ],
    title: "Logistics Support Automation",
    path: "/services/agentic-automation",
    benefits:
      "For global logistics and supply chain clients, ConverseAI deployed automated WhatsApp and voice bots that handle shipment tracking, ETA queries, and delivery rescheduling 24/7.",
    details:
      "Our AI agents integrate directly with TMS and ERP software to resolve delivery inquiries with zero human agent involvement.",
    followUp: "Would you like to see how AI automation streamlines logistics and supply chain customer support?",
  },
  {
    id: "jaipur-office",
    keywords: [
      "jaipur",
      "jai poor",
      "jypur",
      "jaypur",
      "jai pur",
      "jeypur",
      "engineering office",
      "core engineering office",
      "office in jaipur",
      "jaipur office",
      "jaipur me hai",
      "jaipur me",
      "office jaipur",
      "headquartered in jaipur",
      "based in jaipur",
    ],
    title: "Jaipur Headquarters",
    path: "/about-us",
    benefits:
      "Yes! ConverseAI's core engineering office is headquartered in Jaipur, delivering US-grade engineering standards at 40% to 60% below US boutique pricing.",
    details:
      "Our Jaipur engineering hub builds custom AI voice agents, WhatsApp chatbots, and agentic process automation with fixed-fee transparent proposals.",
    followUp: "Would you like to explore how our Jaipur engineering team can build custom AI agents for your business?",
  },
  {
    id: "crm-summary-save",
    keywords: [
      "call summary crm",
      "summary crm",
      "save call summary",
      "save in crm",
      "crm me save",
      "log into crm",
      "transcript crm",
      "save call transcripts",
      "automatic save",
      "automatic save ho",
      "c r m",
      "see arm",
      "see ar em",
    ],
    title: "CRM Integration & Call Logging",
    path: "/services/ai-voice-agents",
    benefits:
      "Yes! Our AI Voice Agents automatically record, transcribe, summarize, and save full call logs and summaries into your CRM in real time.",
    details:
      "They seamlessly write structured call outcome data, sentiment analysis, and transcript summaries into Salesforce, HubSpot, Zoho, Zendesk, or custom databases.",
    followUp: "Shall I show you how our AI voice agents log calls into your specific CRM?",
  },
  {
    id: "custom-sdr-agent",
    keywords: [
      "sdr",
      "s d r",
      "es de ar",
      "es dr",
      "custom sdr",
      "sdr lead research",
      "lead research agent",
      "sdr agent",
      "build a custom sdr",
      "outreach agent",
      "sales sdr",
    ],
    title: "Custom SDR AI Agents",
    path: "/services/custom-ai-agents",
    benefits:
      "Yes! We build custom SDR lead research AI agents that automatically research prospects, score lead intent, handle multi-channel outreach, and book qualified demos into your calendar.",
    details:
      "Custom SDR agents handle lead research across LinkedIn, email, and voice calls to qualify prospects before booking sales meetings for your account executives.",
    followUp: "Would you like to explore building a custom SDR lead research AI agent for your sales team?",
  },
  {
    id: "interruption-barge-in",
    keywords: [
      "interruption",
      "caller interruptions",
      "barge in",
      "barge-in",
      "interrupts",
      "interrupting",
      "speak mid-sentence",
      "mid sentence",
    ],
    title: "Caller Interruption Handling",
    path: "/services/ai-voice-agents",
    benefits:
      "Our AI Voice Agents feature real-time Silero VAD barge-in detection.",
    details:
      "When a caller interrupts or speaks mid-sentence, the AI instantly stops its voice playback and listens to the caller naturally without dropping context.",
    followUp: "Would you like to test interruption handling on a live voice demo call?",
  },
  {
    id: "crm-integrations-list",
    keywords: [
      "which crm",
      "crm tools",
      "crm integrate",
      "integrate with crm",
      "tools do you integrate",
      "crm platforms",
      "salesforce hubspot zoho",
      "c r m",
      "see arm",
    ],
    title: "CRM Integrations",
    path: "/services/ai-integration",
    benefits:
      "We seamlessly integrate with all major CRMs including Salesforce, HubSpot, Zoho CRM, LeadSquared, Freshsales, Pipedrive, Zendesk, SAP, Tally, and custom REST APIs.",
    details:
      "Our AI agents plug directly into your existing software stack without requiring any expensive infrastructure rebuild or software replacements.",
    followUp: "Which CRM software does your team currently use?",
  },
  {
    id: "pricing-comparison-boutiques",
    keywords: [
      "cost compared to us",
      "compared to us agencies",
      "how much does an ai project cost",
      "pricing compared",
      "cheaper than us",
      "boutique pricing",
      "us agency cost",
    ],
    title: "Pricing Comparison",
    path: "/services",
    benefits:
      "ConverseAI operates on a transparent fixed-fee, fixed-timeline sprint model priced 40% to 60% below US boutiques with zero hidden cost creep.",
    details:
      "Engineering is delivered from Jaipur with US-grade standards, ensuring clear deliverable milestones without expensive Time & Material billing overruns.",
    followUp: "Would you like a tailored fixed-fee proposal for your AI project?",
  },
  {
    id: "ship-timeline-weeks",
    keywords: [
      "weeks does it take",
      "weeks to ship",
      "how many weeks",
      "timeline to ship",
      "how fast can you build",
      "ship a production",
      "development timeline",
    ],
    title: "Deployment Timeline",
    path: "/services",
    benefits:
      "Initial production-ready AI agents ship within 2 to 4 weeks, with fast proof-of-concept prototype sprints delivered in just 3 to 5 days.",
    details:
      "Our structured sprint process runs: 1) Discover, 2) Scope, 3) Build & Tune, and 4) Deploy & Scale.",
    followUp: "Shall I walk you through our 4-week AI Agent Sprint workflow?",
  },
  {
    id: "code-ip-ownership",
    keywords: [
      "100 percent ownership",
      "ownership of custom code",
      "retain 100 percent",
      "code and ip",
      "ip ownership",
      "who owns the code",
      "own the code",
    ],
    title: "100% IP & Code Ownership",
    path: "/about-us",
    benefits:
      "Yes! Clients retain 100% full ownership of all custom code, prompts, fine-tuned models, data, and intellectual property.",
    details:
      "We never lock you into proprietary vendor frameworks. You own 100% of the build assets from day one.",
    followUp: "Would you like to review our client IP ownership and code transfer terms?",
  },
  {
    id: "private-cloud-env",
    keywords: [
      "private cloud",
      "inside our private cloud",
      "private cloud environment",
      "on premise",
      "on-premise",
      "deploy in our cloud",
      "isolated environment",
    ],
    title: "Private Cloud Deployment",
    path: "/services/knowledge-intelligence",
    benefits:
      "Yes! All ConverseAI models and Knowledge Intelligence engines can be deployed inside your private cloud environment (AWS, GCP, Azure) for full data privacy.",
    details:
      "We build permission-aware, isolated tenant environments with SOC2 and HIPAA compliant data security controls.",
    followUp: "Would you like to see how we deploy AI models inside private cloud environments?",
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
    id: "security-hipaa-soc2",
    keywords: [
      "soc2",
      "soc 2",
      "hipaa",
      "hipaa compliant",
      "hipaa ready",
      "soc2 compliant",
      "security compliant",
      "data privacy",
      "patient health records",
      "security standards",
    ],
    title: "Security & Compliance",
    path: "/about-us",
    benefits:
      "Yes! All ConverseAI solution deployments are fully SOC2 compliant and HIPAA ready with custom data privacy controls.",
    details:
      "You retain 100% ownership of all code, data, and intellectual property. We operate in isolated tenant environments with zero data selling.",
    followUp: "Would you like to review our enterprise security and data protection framework?",
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
  let text = rawText.trim();
  text = text.replace(/^[*_\s]*Question:[^*_\n]+\n*/i, "").trim();

  // 1. Look for explicit Draft / Final answer markers (e.g. Draft 1: ..., Draft 2: ..., Final: ...)
  const draftMatches = Array.from(
    text.matchAll(/(?:Draft\s*\d*|Final\s*Polish|Final\s*Version|Spoken\s*Answer|Output)\s*:\s*\*?\s*(.*?)(?=(?:Draft\s*\d*|Final|Spoken|\n\n|\n\*|$))/gis)
  );
  if (draftMatches && draftMatches.length > 0) {
    for (let i = draftMatches.length - 1; i >= 0; i--) {
      const candidate = stripMarkdown(draftMatches[i][1]).replace(/^["'*]+|["'*]+$/g, "").trim();
      if (isValidSpokenAnswer(candidate)) {
        return candidate;
      }
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

  // Strategy 4: Join all non-reasoning lines and check if the result is valid
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

  // Exact word token or substring match for technical acronyms (crm, sdr, soc2, hipaa, etc.)
  if (s1.includes(s2) || s2.includes(s1)) return 0.95;

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
      (typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_GEMINI_API_KEY
        : "") ||
      (typeof window !== "undefined" ? sessionStorage.getItem("aira_gemini_api_key") : null);

    if (!apiKey || !apiKey.trim() || apiKey === "your_gemini_api_key_here") {
      return localAnswer;
    }

    // Race: API call vs 3-second timer
    let cancelled = false;
    const apiPromise = (async (): Promise<AiraResponse | null> => {
      try {
        // Only keep the most recent user/model turn for context to prevent repetition
        const historyContents = historyMessages.slice(-2).map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const dedupedHistory: typeof historyContents = [];
        for (const entry of historyContents) {
          if (dedupedHistory.length === 0 || dedupedHistory[dedupedHistory.length - 1].role !== entry.role) {
            dedupedHistory.push(entry);
          }
        }

        const systemPromptPart = `You are Aira, a warm, witty, and highly intelligent AI sales consultant for Converse AI (theconverseai.com), powered by Google Gemma LLM and NVIDIA Parakeet Speech AI Engine. 

DIRECTIVES FOR YOUR RESPONSE:
1. Respond directly to the visitor in 2-3 warm, natural spoken sentences optimized for NVIDIA Parakeet human voice output.
2. DO NOT repeat phrasing, intros, or sentences from prior conversation history. Every answer must feel fresh, natural, and insightful.
3. Do not include thinking, reasoning, drafts, bullet points, asterisks, or markdown formatting.
4. If appropriate, mention relevant Converse AI solutions or real metrics (e.g. StyleMart 3x revenue, LearnSphere 2x enrolments, CareFirst 55% no-show drop).

Visitor Question: "${userTranscript}"
Spoken Response:`;

        const contents = [
          ...dedupedHistory,
          { role: "user" as const, parts: [{ text: systemPromptPart }] },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Try Gemma 2 9B model first, fallback to Gemini 2.0 Flash with Gemma instruction set
        let url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent?key=${apiKey.trim()}`;
        let res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 256,
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 256,
              },
            }),
            signal: controller.signal,
          });
        }

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
    } else if (this.state === "OFFERING_CALL") {
      // User asked a new question instead of accepting call offer -> reset state to ANSWERING
      this.state = "ANSWERING";
    }

    // Instant Single-Sentence Booking & Contact Form Pre-Fill Extraction
    const emailMatch = userTranscript.match(EMAIL_REGEX);
    const phoneMatch = userTranscript.match(PHONE_REGEX);
    const contactInfo = emailMatch ? emailMatch[0] : phoneMatch ? phoneMatch[0] : null;

    if (contactInfo && /(book|schedule|call|demo|contact|consultation)/i.test(userTranscript)) {
      let namePart = userTranscript
        .replace(contactInfo, "")
        .replace(/book a call for|schedule a demo for|call me back|my name is|i am|this is/gi, "")
        .replace(/\b(book|schedule|call|demo|contact|at|for|about|with)\b/gi, "")
        .replace(/[0-9]+/g, "")
        .replace(/[^a-zA-Z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const name = namePart.length > 1 && namePart.length < 30 ? namePart : "Valued Client";
      this.bookingDetails.name = name;
      this.bookingDetails.contact = contactInfo;
      this.bookingDetails.topic = "AI Voice Agents & Automation";
      this.state = "BOOKED";

      return {
        reply: `Thank you, ${name}! I have noted your contact info (${contactInfo}) and opened the Contact Form with your details pre-filled. Our team will reach out to you shortly!`,
        nextState: "ANSWERING",
        triggerDemoPopup: true,
        bookingDetails: { ...this.bookingDetails },
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
          .replace(/i am|this is|my name is/gi, "")
          .replace(/\b(and|or|is|email|phone|contact)\b/gi, "")
          .replace(/[0-9]+/g, "")
          .replace(/[^a-zA-Z\s]/g, "")
          .replace(/\s+/g, " ")
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
      } else {
        // Reset state so subsequent knowledge queries answer cleanly
        this.state = "ANSWERING";
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

    // 5a. Priority: Call / Demo BOOKING intent — check BEFORE knowledge base to prevent
    //     generic topic keywords like 'call' or 'demo' from hijacking booking requests
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

    // 5. Knowledge Match Engine (Hybrid Exact & Fuzzy Intent Priority Matching)
    let bestTopic: KnowledgeTopic | null = null;
    let maxMatchedLength = 0;
    let highestFuzzyScore = 0;

    for (const topic of APPROVED_KNOWLEDGE) {
      for (const kw of topic.keywords) {
        const kwLower = kw.toLowerCase();
        // Exact substring match
        if (text.includes(kwLower)) {
          if (kwLower.length > maxMatchedLength) {
            maxMatchedLength = kwLower.length;
            bestTopic = topic;
          }
        } else {
          // Token intersection match: all significant words in keyword exist in query
          const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
          if (kwWords.length >= 2 && kwWords.every((w) => text.includes(w))) {
            const score = kwLower.length + 10;
            if (score > maxMatchedLength) {
              maxMatchedLength = score;
              bestTopic = topic;
            }
          } else {
            const sim = bigramSimilarity(text, kwLower);
            if (sim >= 0.65 && sim > highestFuzzyScore && maxMatchedLength === 0) {
              highestFuzzyScore = sim;
              bestTopic = topic;
            }
          }
        }
      }
    }

    if (bestTopic && (maxMatchedLength >= 3 || highestFuzzyScore >= 0.70)) {
      this.state = "ANSWERING";
      this.lastOfferedTopic = bestTopic.title;
      this.lastOfferedTopicObj = bestTopic;
      this.bookingDetails.topic = bestTopic.title;

      const answer = bestTopic.details && !bestTopic.details.includes("zero framework lock-in")
        ? `${bestTopic.benefits} ${bestTopic.details}`
        : bestTopic.benefits;

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

    // 7. Check for Call / Demo intent triggers — secondary fallback (already checked above as 5a)
    // kept here as safety net for edge-case phrasings not caught earlier

    // 8. Fallback for low confidence match
    this.state = "OFFERING_CALL";
    return {
      reply: `${EXACT_FALLBACK} Shall I arrange a short call with one of our AI consultants?`,
      nextState: "OFFERING_CALL",
      navigateTo: "/contact-us",
    };
  }
}
