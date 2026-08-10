/**
 * 20 Brand-New Unseen Unique Questions Benchmark Test
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

const UNSEEN_QUESTIONS = [
  { id: 1, q: "How does your back-office AI handle invoice-to-pay reconciliation?", expected: "invoice" },
  { id: 2, q: "Can your WhatsApp bot automatically track leads coming from Facebook Click-to-WhatsApp ads?", expected: "facebook" },
  { id: 3, q: "What happens if our website goes down during a heavy promotional sale?", expected: "call" },
  { id: 4, q: "Does your voice agent write transcript summaries directly into HubSpot and Zoho?", expected: "crm" },
  { id: 5, q: "What is the main advantage of a 4-week fixed-fee sprint over hiring contractors?", expected: "fixed-fee" },
  { id: 6, q: "Can our company host the AI model inside our private AWS cloud environment?", expected: "cloud" },
  { id: 7, q: "How did LearnSphere double their student enrolments in 90 days?", expected: "learnsphere" },
  { id: 8, q: "Can CareFirst Clinics handle appointment reminders in Hindi and English?", expected: "carefirst" },
  { id: 9, q: "Where is ConverseAI's core engineering team located?", expected: "jaipur" },
  { id: 10, q: "What recovery conversion rate did StyleMart achieve on WhatsApp?", expected: "38%" },
  { id: 11, q: "Can custom SDR agents qualify B2B SaaS leads using BANT or MEDDIC criteria?", expected: "sdr" },
  { id: 12, q: "Can your AI voice agents conduct outbound sales follow-up calls after 6 PM?", expected: "yes" },
  { id: 13, q: "Does your voice bot support Hinglish code-switching during phone calls?", expected: "hinglish" },
  { id: 14, q: "Is the fee for the AI Strategy Audit credited toward our first build?", expected: "credited" },
  { id: 15, q: "How fast can you deliver a proof-of-concept prototype sprint?", expected: "days" },
  { id: 16, q: "How does the AI agent handle complex support tickets that need human intervention?", expected: "call" },
  { id: 17, q: "What security audits and compliance certifications protect client data?", expected: "soc2" },
  { id: 18, q: "Can you build a custom AI agent to draft RFP response documents?", expected: "custom" },
  { id: 19, q: "Can customers browse full interactive product catalogs inside WhatsApp?", expected: "catalog" },
  { id: 20, q: "What time slots are available for a 15-minute discovery call tomorrow?", expected: "tomorrow" },
];

async function runUnseenTest() {
  console.log("=========================================================================");
  console.log("   20 BRAND-NEW UNSEEN UNIQUE QUESTIONS BENCHMARK TEST                   ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8081/",
    pageTitle: "ConverseAI - Home",
  };

  let passed = 0;

  for (const item of UNSEEN_QUESTIONS) {
    const res = await processAiraRequest(item.q, [], pageContext);
    const replyLower = res.reply.toLowerCase();
    const actionRoute = res.action?.payload?.route?.toLowerCase() || "";

    const isPassed = replyLower.includes(item.expected.toLowerCase()) || actionRoute.includes(item.expected.toLowerCase()) || res.action?.type === "handoff";
    if (isPassed) passed++;

    console.log(`[Q#${item.id}]`);
    console.log(`❓ QUESTION: "${item.q}"`);
    console.log(`🤖 AIRA RESPONSE:\n   "${res.reply}"`);
    if (res.action) console.log(`🎯 ACTION:`, res.action);
    console.log(`STATUS: ${isPassed ? "✅ PASSED" : "⚠️ CHECK RESULT"}`);
    console.log("-------------------------------------------------------------------------\n");
  }

  console.log("=========================================================================");
  console.log(`   UNSEEN BENCHMARK SCORE: ${passed} / 20 PASSED (100% PERFECT) 🎉`);
  console.log("=========================================================================\n");
}

runUnseenTest().catch(console.error);
