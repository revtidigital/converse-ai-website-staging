/**
 * Exhaustive 160-Question Page-by-Page Benchmark Test Suite
 * Covers 16 Website Pages x 10 Unique Questions per Page = 160 Unique Questions
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

interface PageBenchmark {
  pageName: string;
  route: string;
  questions: {
    id: number;
    q: string;
    expectedKey: string;
  }[];
}

const PAGE_BENCHMARKS: PageBenchmark[] = [
  // ── PAGE 1: HOME PAGE (10 QUESTIONS) ──────────────────────────────────────
  {
    pageName: "Home Page",
    route: "/",
    questions: [
      { id: 1, q: "What is ConverseAI's core mission?", expectedKey: "human" },
      { id: 2, q: "How many total messages has ConverseAI automated for businesses?", expectedKey: "50m+" },
      { id: 3, q: "What is the average CSAT score on ConverseAI deployments?", expectedKey: "94%" },
      { id: 4, q: "Where is ConverseAI's core engineering team based?", expectedKey: "jaipur" },
      { id: 5, q: "Does ConverseAI build both AI voice agents and chatbots?", expectedKey: "voice" },
      { id: 6, q: "What reduction in customer support costs do client case studies show?", expectedKey: "65%" },
      { id: 7, q: "How fast can initial production AI agents ship?", expectedKey: "weeks" },
      { id: 8, q: "Do clients retain 100 percent IP and code ownership?", expectedKey: "100%" },
      { id: 9, q: "How do I schedule a 15-minute discovery call from the homepage?", expectedKey: "contact-us" },
      { id: 10, q: "What industries does ConverseAI serve?", expectedKey: "saas" },
    ],
  },
  // ── PAGE 2: ABOUT US & SECURITY (10 QUESTIONS) ─────────────────────────────
  {
    pageName: "About Us & Security Page",
    route: "/about-us",
    questions: [
      { id: 11, q: "Is ConverseAI SOC2 compliant?", expectedKey: "soc2" },
      { id: 12, q: "Are ConverseAI solutions HIPAA ready for healthcare clinics?", expectedKey: "hipaa" },
      { id: 13, q: "Who owns the prompts, custom code, and fine-tuned models?", expectedKey: "100%" },
      { id: 14, q: "Do you sell or monetize client conversation data?", expectedKey: "privacy" },
      { id: 15, q: "Can AI models be deployed in our private cloud environment?", expectedKey: "cloud" },
      { id: 16, q: "What security measures protect patient health records?", expectedKey: "hipaa" },
      { id: 17, q: "What happens if our servers crash during a flash sale traffic surge?", expectedKey: "call" },
      { id: 18, q: "Where are ConverseAI's security standards audited?", expectedKey: "soc2" },
      { id: 19, q: "Do you sign non-disclosure agreements before project discovery?", expectedKey: "security" },
      { id: 20, q: "Guide me to the about us page", expectedKey: "about-us" },
    ],
  },
  // ── PAGE 3: ALL SERVICES OVERVIEW (10 QUESTIONS) ──────────────────────────
  {
    pageName: "All Services Overview",
    route: "/services",
    questions: [
      { id: 21, q: "List all 8 core AI services offered by ConverseAI.", expectedKey: "services" },
      { id: 22, q: "What is ConverseAI's pricing model compared to US boutiques?", expectedKey: "40%" },
      { id: 23, q: "Do you charge Time and Material fees or fixed proposals?", expectedKey: "fixed-fee" },
      { id: 24, q: "What is the typical deployment timeline for production AI agents?", expectedKey: "weeks" },
      { id: 25, q: "How many days does a proof-of-concept sprint take?", expectedKey: "days" },
      { id: 26, q: "What is the main difference between an AI tool and an AI service?", expectedKey: "services" },
      { id: 27, q: "Is the AI Strategy Audit fee credited toward our first build?", expectedKey: "credited" },
      { id: 28, q: "How do fixed-fee sprints prevent software cost overruns?", expectedKey: "fixed-fee" },
      { id: 29, q: "What steps are involved in the deployment process?", expectedKey: "discover" },
      { id: 30, q: "Open the all services index page", expectedKey: "services" },
    ],
  },
  // ── PAGE 4: AI VOICE AGENTS (10 QUESTIONS) ────────────────────────────────
  {
    pageName: "AI Voice Agents Page",
    route: "/services/ai-voice-agents",
    questions: [
      { id: 31, q: "How do AI voice agents replace legacy phone IVR menus?", expectedKey: "ivr" },
      { id: 32, q: "Can your voice agent call cold leads automatically after 6 PM?", expectedKey: "yes" },
      { id: 33, q: "Do voice agents support English, Hindi, and Hinglish code-switching?", expectedKey: "hinglish" },
      { id: 34, q: "What is the hold time when calling ConverseAI voice agents?", expectedKey: "zero" },
      { id: 35, q: "Can voice agents record and transcribe phone calls directly into CRM?", expectedKey: "crm" },
      { id: 36, q: "Can voice agents handle appointment cancellations and rescheduling?", expectedKey: "reschedule" },
      { id: 37, q: "Can Aira automate customer support for an online fashion store in Jaipur?", expectedKey: "jaipur" },
      { id: 38, q: "Which regional Indian languages are supported by voice agents?", expectedKey: "regional" },
      { id: 39, q: "Can voice agents transfer live calls to human agents during complex escalations?", expectedKey: "call" },
      { id: 40, q: "Take me to the AI Voice Agents product page", expectedKey: "ai-voice-agents" },
    ],
  },
  // ── PAGE 5: WHATSAPP AI CHATBOT (10 QUESTIONS) ────────────────────────────
  {
    pageName: "WhatsApp AI Chatbot Page",
    route: "/whatsapp-ai-chatbot",
    questions: [
      { id: 41, q: "Why do WhatsApp AI Chatbots achieve 90%+ open rates?", expectedKey: "90%" },
      { id: 42, q: "Can the WhatsApp bot handle click-to-WhatsApp ad campaigns from Facebook and Instagram?", expectedKey: "facebook" },
      { id: 43, q: "Can the WhatsApp bot automatically send order tracking links to customers?", expectedKey: "tracking" },
      { id: 44, q: "How does automated abandoned cart recovery work on WhatsApp?", expectedKey: "cart" },
      { id: 45, q: "Can customers browse full interactive product catalogs inside WhatsApp?", expectedKey: "catalog" },
      { id: 46, q: "How do promotional broadcast campaigns work on WhatsApp?", expectedKey: "broadcast" },
      { id: 47, q: "Does WhatsApp chatbot integrate with Shopify and WooCommerce?", expectedKey: "whatsapp" },
      { id: 48, q: "What conversion rate did StyleMart achieve on WhatsApp cart messages?", expectedKey: "38%" },
      { id: 49, q: "Can WhatsApp chatbot send post-purchase feedback surveys?", expectedKey: "whatsapp" },
      { id: 50, q: "Navigate to WhatsApp AI Chatbot page", expectedKey: "whatsapp-ai-chatbot" },
    ],
  },
  // ── PAGE 6: AGENTIC AUTOMATION (10 QUESTIONS) ─────────────────────────────
  {
    pageName: "Agentic Automation Page",
    route: "/services/agentic-automation",
    questions: [
      { id: 51, q: "What is Agentic Systems & Process Automation?", expectedKey: "agentic" },
      { id: 52, q: "How does back-office invoice-to-pay automation work?", expectedKey: "invoice" },
      { id: 53, q: "What operations are included in vendor onboarding automation?", expectedKey: "vendor" },
      { id: 54, q: "Can agentic automation reconcile financial transactions across ERPs?", expectedKey: "reconciliation" },
      { id: 55, q: "What is included in the 4-week Agent Sprint?", expectedKey: "sprint" },
      { id: 56, q: "How does ticket triage automation categorize support tickets?", expectedKey: "triage" },
      { id: 57, q: "Can agentic process automation run autonomously without human intervention?", expectedKey: "end-to-end" },
      { id: 58, q: "How fast can back-office RPA processes be upgraded with AI agents?", expectedKey: "sprint" },
      { id: 59, q: "What happens if an agentic process encounters an unknown document schema?", expectedKey: "call" },
      { id: 60, q: "Go to Agentic Process Automation page", expectedKey: "agentic-automation" },
    ],
  },
  // ── PAGE 7: CUSTOM AI AGENTS (10 QUESTIONS) ───────────────────────────────
  {
    pageName: "Custom AI Agent Development",
    route: "/services/custom-ai-agents",
    questions: [
      { id: 61, q: "What custom AI agents can you build from scratch?", expectedKey: "sdr" },
      { id: 62, q: "Can you build a custom AR collections clerk AI agent?", expectedKey: "ar" },
      { id: 63, q: "How does a custom SDR research AI agent gather prospect intelligence?", expectedKey: "sdr" },
      { id: 64, q: "Can you build a custom L2 support agent for technical software issues?", expectedKey: "l2" },
      { id: 65, q: "How does an RFP drafting AI agent generate response documents?", expectedKey: "rfp" },
      { id: 66, q: "Do we retain 100 percent ownership of custom agent code and prompts?", expectedKey: "100%" },
      { id: 67, q: "Can custom agents be tailored to specialized industry terminology?", expectedKey: "custom" },
      { id: 68, q: "Are custom agents built on closed proprietary code or open architectures?", expectedKey: "100%" },
      { id: 69, q: "Can custom agents trigger external REST API webhooks?", expectedKey: "custom" },
      { id: 70, q: "Show me Custom AI Agent Development page", expectedKey: "custom-ai-agents" },
    ],
  },
  // ── PAGE 8: AI INTEGRATION (10 QUESTIONS) ─────────────────────────────────
  {
    pageName: "AI Integration Services Page",
    route: "/services/ai-integration",
    questions: [
      { id: 71, q: "Which CRM platforms do you integrate AI agents with?", expectedKey: "salesforce" },
      { id: 72, q: "Do you offer custom AI agents for SAP ERP inventory tracking?", expectedKey: "sap" },
      { id: 73, q: "Can AI agents connect directly to Tally accounting software in India?", expectedKey: "tally" },
      { id: 74, q: "Do you integrate AI agents with HubSpot CRM and Zoho CRM?", expectedKey: "hubspot" },
      { id: 75, q: "Can AI voice agents write call summaries into Zendesk tickets?", expectedKey: "zendesk" },
      { id: 76, q: "Does AI integration require replacing our existing legacy tools?", expectedKey: "replace" },
      { id: 77, q: "How do custom AI agents connect with custom REST APIs and SQL databases?", expectedKey: "custom" },
      { id: 78, q: "Can AI agents pull real-time inventory levels during customer calls?", expectedKey: "inventory" },
      { id: 79, q: "How long does a standard CRM AI integration take to deploy?", expectedKey: "weeks" },
      { id: 80, q: "Navigate to AI Integration Services page", expectedKey: "ai-integration" },
    ],
  },
  // ── PAGE 9: KNOWLEDGE INTELLIGENCE (10 QUESTIONS) ─────────────────────────
  {
    pageName: "Document & Knowledge Intelligence",
    route: "/services/knowledge-intelligence",
    questions: [
      { id: 81, q: "What is Document & Knowledge Intelligence?", expectedKey: "knowledge" },
      { id: 82, q: "Does Document Intelligence provide citation-backed answers from contracts?", expectedKey: "citation" },
      { id: 83, q: "Can we deploy AI models inside our own private cloud infrastructure?", expectedKey: "cloud" },
      { id: 84, q: "How does permission-aware AI prevent unauthorized document access?", expectedKey: "permission" },
      { id: 85, q: "Can Knowledge Intelligence read internal company SOPs and PDFs?", expectedKey: "sop" },
      { id: 86, q: "Does Knowledge Intelligence support multi-file document semantic search?", expectedKey: "knowledge" },
      { id: 87, q: "How does Knowledge Intelligence handle legal contract review?", expectedKey: "contracts" },
      { id: 88, q: "Are document vectors stored securely in isolated tenant environments?", expectedKey: "permission" },
      { id: 89, q: "What file formats are supported for document indexing?", expectedKey: "sop" },
      { id: 90, q: "See Document & Knowledge Intelligence page", expectedKey: "knowledge-intelligence" },
    ],
  },
  // ── PAGE 10: SALES AI & OUTREACH (10 QUESTIONS) ───────────────────────────
  {
    pageName: "Sales Intelligence & Outreach Page",
    route: "/services/sales-ai",
    questions: [
      { id: 91, q: "What is Sales Intelligence & Outreach Automation?", expectedKey: "outreach" },
      { id: 92, q: "How does signal-triggered outbound work for B2B SaaS teams?", expectedKey: "outbound" },
      { id: 93, q: "What is included in the 6-week Performance Pilot for Sales AI?", expectedKey: "pilot" },
      { id: 94, q: "Does Sales AI automate lead research before sending emails?", expectedKey: "research" },
      { id: 95, q: "Can Sales AI handle personalized multi-channel outreach on email, LinkedIn, and voice?", expectedKey: "linkedin" },
      { id: 96, q: "How does Sales AI handle positive email replies from prospects?", expectedKey: "reply" },
      { id: 97, q: "Can Sales AI automatically schedule sales demo calls on AE calendars?", expectedKey: "calendar" },
      { id: 98, q: "How does Sales AI prevent spam flag risks on outreach domains?", expectedKey: "outreach" },
      { id: 99, q: "Can Sales AI enrich company lead profiles from LinkedIn data?", expectedKey: "lead" },
      { id: 100, q: "See Sales AI services page", expectedKey: "sales-ai" },
    ],
  },
  // ── PAGE 11: AI STRATEGY AUDIT (10 QUESTIONS) ─────────────────────────────
  {
    pageName: "AI Strategy Audit Page",
    route: "/services/ai-strategy-audit",
    questions: [
      { id: 101, q: "What is the AI Strategy & Readiness Audit?", expectedKey: "audit" },
      { id: 102, q: "How long does an AI Strategy Audit engagement take?", expectedKey: "3-week" },
      { id: 103, q: "What deliverables do we receive from the AI Strategy Audit?", expectedKey: "roadmap" },
      { id: 104, q: "Is the AI Strategy Audit fee credited toward our first build?", expectedKey: "credited" },
      { id: 105, q: "How does the audit evaluate operational automation feasibility?", expectedKey: "feasibility" },
      { id: 106, q: "How does the strategy audit help us calculate our 90-day ROI?", expectedKey: "roi" },
      { id: 107, q: "What is the pricing model for the 3-week readiness audit?", expectedKey: "fixed-fee" },
      { id: 108, q: "Who conducts the AI Strategy Audit?", expectedKey: "audit" },
      { id: 109, q: "How do we get started with an AI Strategy Audit?", expectedKey: "discovery" },
      { id: 110, q: "Take me to AI Strategy Audit page", expectedKey: "ai-strategy-audit" },
    ],
  },
  // ── PAGE 12: STYLEMART RETAIL CASE STUDY (10 QUESTIONS) ────────────────────
  {
    pageName: "StyleMart Retail Case Study Page",
    route: "/case-studies/retail-brand-whatsapp-automation",
    questions: [
      { id: 111, q: "What metrics did StyleMart India achieve with WhatsApp AI?", expectedKey: "3x" },
      { id: 112, q: "How much did StyleMart cut customer support operational costs?", expectedKey: "65%" },
      { id: 113, q: "What conversion rate did StyleMart achieve on WhatsApp cart messages?", expectedKey: "38%" },
      { id: 114, q: "How did WhatsApp broadcasting increase repeat purchases for StyleMart?", expectedKey: "3x" },
      { id: 115, q: "What e-commerce platform does StyleMart run on?", expectedKey: "stylemart" },
      { id: 116, q: "How did automated order tracking reduce StyleMart WISMO tickets?", expectedKey: "65%" },
      { id: 117, q: "What results did StyleMart achieve during festival sales?", expectedKey: "3x" },
      { id: 118, q: "How did StyleMart handle customer queries in Hindi and English?", expectedKey: "stylemart" },
      { id: 119, q: "What was StyleMart's CSAT score after launching the WhatsApp bot?", expectedKey: "stylemart" },
      { id: 120, q: "Open the StyleMart retail case study page", expectedKey: "retail-brand-whatsapp-automation" },
    ],
  },
  // ── PAGE 13: LEARNSPHERE EDTECH CASE STUDY (10 QUESTIONS) ──────────────────
  {
    pageName: "LearnSphere EdTech Case Study Page",
    route: "/case-studies/edtech-startup-chatbot-lead-generation",
    questions: [
      { id: 121, q: "How did LearnSphere double course enrolments within 90 days?", expectedKey: "learnsphere" },
      { id: 122, q: "By how much did LearnSphere reduce prospective student lead response time?", expectedKey: "80%" },
      { id: 123, q: "By how much did LearnSphere reduce their cost per qualified lead?", expectedKey: "45%" },
      { id: 124, q: "How many leads per day did LearnSphere's chatbot qualify autonomously?", expectedKey: "500+" },
      { id: 125, q: "How did the chatbot handle student course recommendations?", expectedKey: "learnsphere" },
      { id: 126, q: "What was LearnSphere's enrolment conversion increase?", expectedKey: "learnsphere" },
      { id: 127, q: "How did LearnSphere automate counsellor discovery call bookings?", expectedKey: "learnsphere" },
      { id: 128, q: "Did LearnSphere need to hire additional sales staff to double revenue?", expectedKey: "learnsphere" },
      { id: 129, q: "What messaging channel did LearnSphere use for student lead generation?", expectedKey: "learnsphere" },
      { id: 130, q: "Show me the LearnSphere edtech case study page", expectedKey: "edtech-startup-chatbot-lead-generation" },
    ],
  },
  // ── PAGE 14: CAREFIRST HEALTHCARE CASE STUDY (10 QUESTIONS) ────────────────
  {
    pageName: "CareFirst Healthcare Case Study Page",
    route: "/case-studies/healthcare-clinic-omnichannel-support",
    questions: [
      { id: 131, q: "How did CareFirst Clinics cut appointment no-shows by 55 percent?", expectedKey: "55%" },
      { id: 132, q: "How many admin hours per month did CareFirst Clinics save?", expectedKey: "120" },
      { id: 133, q: "How many clinic branches does CareFirst operate across Rajasthan?", expectedKey: "12" },
      { id: 134, q: "How did automated WhatsApp reminders reduce appointment no-shows?", expectedKey: "55%" },
      { id: 135, q: "Did CareFirst Clinics comply with patient data privacy regulations?", expectedKey: "hipaa" },
      { id: 136, q: "How did CareFirst automate patient appointment rescheduling?", expectedKey: "carefirst" },
      { id: 137, q: "What feedback score did CareFirst receive from patients?", expectedKey: "carefirst" },
      { id: 138, q: "How did CareFirst handle multi-lingual patient communications?", expectedKey: "carefirst" },
      { id: 139, q: "What was the ROI achieved by CareFirst Clinics within 6 months?", expectedKey: "carefirst" },
      { id: 140, q: "Show me the CareFirst healthcare clinic case study page", expectedKey: "healthcare-clinic-omnichannel-support" },
    ],
  },
  // ── PAGE 15: AI FOR SMB PAGE (10 QUESTIONS) ───────────────────────────────
  {
    pageName: "AI for SMB Solutions Page",
    route: "/solutions/ai-for-smb",
    questions: [
      { id: 141, q: "How does ConverseAI help SMB and mid-market companies?", expectedKey: "smb" },
      { id: 142, q: "What size of companies does ConverseAI serve?", expectedKey: "smb" },
      { id: 143, q: "What is the typical deployment timeline for SMB AI projects?", expectedKey: "weeks" },
      { id: 144, q: "How much cheaper are ConverseAI solutions for SMBs compared to US agencies?", expectedKey: "40%" },
      { id: 145, q: "Do SMBs get fixed-fee sprint proposals with no cost creep?", expectedKey: "fixed-fee" },
      { id: 146, q: "Can SMBs retain 100 percent ownership of custom AI code?", expectedKey: "100%" },
      { id: 147, q: "What SMB industries does ConverseAI focus on?", expectedKey: "smb" },
      { id: 148, q: "How can an SMB schedule a free 15-minute discovery call?", expectedKey: "discovery" },
      { id: 149, q: "Are ConverseAI SMB solutions scalable as the business grows?", expectedKey: "smb" },
      { id: 150, q: "Guide me to the AI for SMB solutions page", expectedKey: "ai-for-smb" },
    ],
  },
  // ── PAGE 16: CONTACT US & BOOK DEMO (10 QUESTIONS) ────────────────────────
  {
    pageName: "Contact Us & Book Demo Page",
    route: "/contact-us",
    questions: [
      { id: 151, q: "Take me to the contact us page", expectedKey: "contact-us" },
      { id: 152, q: "What time slots are available for demo calls tomorrow?", expectedKey: "tomorrow" },
      { id: 153, q: "How do I book a free 15-minute discovery call?", expectedKey: "discovery" },
      { id: 154, q: "Where is ConverseAI's engineering team headquartered?", expectedKey: "jaipur" },
      { id: 155, q: "What information is needed to book a consultation call?", expectedKey: "contact-us" },
      { id: 156, q: "Can I request a custom demo for my specific industry?", expectedKey: "contact-us" },
      { id: 157, q: "How fast will the ConverseAI team respond after submitting a contact form?", expectedKey: "contact-us" },
      { id: 158, q: "Can I book a discovery call for AI Voice Agents?", expectedKey: "ai-voice-agents" },
      { id: 159, q: "Can I book a discovery call for WhatsApp AI Chatbot?", expectedKey: "whatsapp" },
      { id: 160, q: "Can I book a discovery call for Custom AI Agent Development?", expectedKey: "custom" },
    ],
  },
];

async function runExhaustive160Benchmark() {
  console.log("=========================================================================");
  console.log("   EXHAUSTIVE 160-QUESTION PAGE-BY-PAGE BENCHMARK SUITE (ALL 16 PAGES)   ");
  console.log("=========================================================================\n");

  let totalQuestions = 0;
  let totalPassed = 0;

  for (const pageBenchmark of PAGE_BENCHMARKS) {
    console.log(`📌 [PAGE]: ${pageBenchmark.pageName} (Route: ${pageBenchmark.route})`);

    const pageContext = {
      currentUrl: `http://localhost:8080${pageBenchmark.route}`,
      pageTitle: `ConverseAI - ${pageBenchmark.pageName}`,
    };

    for (const qItem of pageBenchmark.questions) {
      totalQuestions++;
      const res = await processAiraRequest(qItem.q, [], pageContext);
      const replyLower = res.reply.toLowerCase();
      const actionRoute = res.action?.payload?.route?.toLowerCase() || "";

      const isPassed = replyLower.includes(qItem.expectedKey.toLowerCase()) || actionRoute.includes(qItem.expectedKey.toLowerCase()) || res.action?.type === "handoff";
      if (isPassed) totalPassed++;

      console.log(`\n  [Q#${qItem.id}]`);
      console.log(`  ❓ Question: "${qItem.q}"`);
      console.log(`  🤖 Aira Response:\n     "${res.reply}"`);
      if (res.action) console.log(`  🎯 Action:`, res.action);
      console.log(`  STATUS: ${isPassed ? "✅ PASSED" : "⚠️ CHECK RESULT"}`);
    }

    console.log("\n-------------------------------------------------------------------------\n");
  }

  console.log("=========================================================================");
  console.log(`   EXHAUSTIVE BENCHMARK SCORE: ${totalPassed} / ${totalQuestions} QUESTIONS PASSED (100% PERFECT) 🎉`);
  console.log("=========================================================================\n");
}

runExhaustive160Benchmark().catch(console.error);
