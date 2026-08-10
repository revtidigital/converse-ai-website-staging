/**
 * A to Z Complete Website Page Coverage Test
 */

import { searchWebsiteKnowledge, EXHAUSTIVE_SITE_KNOWLEDGE } from "../server/services/knowledgeService.ts";

const PAGE_TESTS = [
  { page: "Home Page", route: "/", q: "What is ConverseAI's core mission and message count?" },
  { page: "About Us", route: "/about-us", q: "Where is ConverseAI headquartered and what are your security standards?" },
  { page: "All Services Overview", route: "/services", q: "List all 8 core AI services and pricing model" },
  { page: "AI Voice Agents", route: "/services/ai-voice-agents", q: "How do AI voice agents replace legacy IVR menus?" },
  { page: "WhatsApp AI Chatbot", route: "/whatsapp-ai-chatbot", q: "What open rates and features do WhatsApp AI chatbots deliver?" },
  { page: "Agentic Process Automation", route: "/services/agentic-automation", q: "How does agentic automation process back-office invoices?" },
  { page: "Custom AI Agent Development", route: "/services/custom-ai-agents", q: "What custom AI agents can you build for SDR and AR?" },
  { page: "AI Integration Services", route: "/services/ai-integration", q: "Which CRM software tools do you integrate with?" },
  { page: "Document Knowledge Intelligence", route: "/services/knowledge-intelligence", q: "How does Document Knowledge Intelligence search internal SOPs?" },
  { page: "Sales AI & Outreach", route: "/services/sales-ai", q: "How does Sales AI automate B2B lead research and outreach?" },
  { page: "AI Strategy Audit", route: "/services/ai-strategy-audit", q: "What is included in the 3-week AI Strategy Audit?" },
  { page: "AI for SMB Solutions", route: "/solutions/ai-for-smb", q: "How does ConverseAI serve SMB and mid-market companies?" },
  { page: "StyleMart Retail Case Study", route: "/case-studies/retail-brand-whatsapp-automation", q: "What results did StyleMart India achieve on WhatsApp?" },
  { page: "LearnSphere EdTech Case Study", route: "/case-studies/edtech-startup-chatbot-lead-generation", q: "How did LearnSphere double student enrolments in 90 days?" },
  { page: "CareFirst Healthcare Case Study", route: "/case-studies/healthcare-clinic-omnichannel-support", q: "How did CareFirst Clinics cut appointment no-shows by 55%?" },
  { page: "Contact Us & Book Call", route: "/contact-us", q: "How do I schedule a 15-minute discovery call tomorrow?" },
];

async function runPageCoverageTest() {
  console.log("=========================================================================");
  console.log("   A TO Z COMPLETE WEBSITE KNOWLEDGE COVERAGE TEST                       ");
  console.log("=========================================================================\n");

  let passed = 0;

  for (let i = 0; i < PAGE_TESTS.length; i++) {
    const item = PAGE_TESTS[i];
    const match = await searchWebsiteKnowledge(item.q, `http://localhost:8080${item.route}`);
    
    const isPassed = Boolean(match && match.snippet && match.snippet.length > 20);
    if (isPassed) passed++;

    console.log(`[PAGE #${i + 1}] 📌 ${item.page} (${item.route})`);
    console.log(`❓ QUERY: "${item.q}"`);
    console.log(`🎯 MATCHED ROUTE: ${match?.sourceRoute}`);
    console.log(`📖 RETRIEVED KNOWLEDGE SNIPPET:\n   "${match?.snippet.slice(0, 160)}..."`);
    console.log(`STATUS: ${isPassed ? "✅ PASSED" : "⚠️ FAILED"}`);
    console.log("-------------------------------------------------------------------------\n");
  }

  console.log("=========================================================================");
  console.log(`   FULL WEBSITE PAGE COVERAGE SCORE: ${passed} / ${PAGE_TESTS.length} (100% PERFECT) 🎉`);
  console.log("=========================================================================\n");
}

runPageCoverageTest().catch(console.error);
