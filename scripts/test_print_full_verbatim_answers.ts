/**
 * Print Full Verbatim Answers for Inspection
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

const INSPECTION_QUESTIONS = [
  { id: 1, topic: "India Accent & Multilingual Telephony", q: "How does your AI voice agent handle caller accents in India?" },
  { id: 2, topic: "Facebook Ads Lead Tracking", q: "Can your WhatsApp bot automatically track leads coming from Facebook Click-to-WhatsApp ads?" },
  { id: 3, topic: "PDF Invoice Processing", q: "How does agentic process automation process PDF invoices?" },
  { id: 4, topic: "Custom SDR Lead Research", q: "How do custom SDR AI agents research prospect leads on LinkedIn?" },
  { id: 5, topic: "Internal SOP Search", q: "How does private document AI read internal company SOPs?" },
  { id: 6, topic: "Salesforce CRM Integration", q: "How does ConverseAI integrate with Salesforce CRM?" },
  { id: 7, topic: "SOC2 Compliance & Privacy", q: "Is ConverseAI fully SOC2 Type II compliant?" },
  { id: 8, topic: "US Agency Pricing Comparison", q: "How much cheaper are ConverseAI solutions compared to US agencies?" },
  { id: 9, topic: "StyleMart Revenue Growth Case Study", q: "How did StyleMart India achieve 3x repeat purchase revenue?" },
  { id: 10, topic: "Jaipur Engineering Hub", q: "Where is ConverseAI's core engineering team headquartered?" },
  { id: 11, topic: "Hindi Language Support", q: "Kya aapke AI voice agents Hindi aur Hinglish me baat kar sakte hain?" },
  { id: 12, topic: "CRM Automatic Call Summary", q: "Kya AI voice call summary CRM me automatic save ho jati hai?" },
  { id: 13, topic: "Private AWS Cloud Hosting", q: "Can our company host the AI model inside our private AWS cloud environment?" },
  { id: 14, topic: "Interruption & Barge-in", q: "How does your AI agent handle caller interruptions mid-sentence during a live call?" },
  { id: 15, topic: "Demo Time Slots Tomorrow", q: "What time slots are available for a 15-minute discovery call tomorrow?" },
];

async function printVerbatim() {
  console.log("=========================================================================");
  console.log("   VERBATIM AGENT ANSWERS LOG FOR USER INSPECTION                        ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8081/",
    pageTitle: "ConverseAI - Home",
  };

  for (const item of INSPECTION_QUESTIONS) {
    const res = await processAiraRequest(item.q, [], pageContext);
    console.log(`📌 [${item.topic}]`);
    console.log(`❓ QUESTION: "${item.q}"`);
    console.log(`🗣️ EXACT FULL AGENT RESPONSE:\n   "${res.reply}"`);
    if (res.action) {
      console.log(`🎯 ACTION DISPATCHED:`, res.action);
    }
    console.log("-------------------------------------------------------------------------\n");
  }
}

printVerbatim().catch(console.error);
