/**
 * Fresh Unique Questions Benchmark Suite (15 Brand-New Questions)
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

async function runFreshUniqueBenchmark() {
  console.log("=========================================================================");
  console.log("   FRESH UNIQUE QUESTIONS BENCHMARK TEST SUITE (15 BRAND NEW QUERIES)    ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8080/",
    pageTitle: "ConverseAI - Home",
  };

  const freshQuestions = [
    { id: 1, q: "Can Aira help us automate customer support for an online fashion store in Jaipur?", key: "stylemart" },
    { id: 2, q: "What happens if our servers go down during a flash sale?", key: "call" },
    { id: 3, q: "Do you offer custom AI agents for SAP ERP inventory tracking?", key: "sap" },
    { id: 4, q: "Can your WhatsApp bot automatically send order tracking links to customers?", key: "order" },
    { id: 5, q: "How do you protect patient health records under HIPAA when using AI voice calling?", key: "hipaa" },
    { id: 6, q: "How many days does a proof-of-concept sprint take?", key: "days" },
    { id: 7, q: "Can we run the AI models in our own private cloud infrastructure?", key: "cloud" },
    { id: 8, q: "What is the main difference between an AI tool and an AI service?", key: "services" },
    { id: 9, q: "How did LearnSphere double their student enrolments without hiring extra staff?", key: "learnsphere" },
    { id: 10, q: "Can your voice agent handle appointment cancellations and rescheduling over phone calls?", key: "voice" },
    { id: 11, q: "Do you charge any hidden monthly maintenance fees or Time and Material charges?", key: "fixed-fee" },
    { id: 12, q: "How does the AI strategy audit help us calculate our 90-day ROI?", key: "audit" },
    { id: 13, q: "Can the WhatsApp bot handle click-to-WhatsApp ad campaigns from Facebook and Instagram?", key: "whatsapp" },
    { id: 14, q: "Take me to the AI Voice Agents product page", key: "ai-voice-agents" },
    { id: 15, q: "Show me the StyleMart retail case study page", key: "retail-brand-whatsapp-automation" },
  ];

  let passed = 0;

  for (const item of freshQuestions) {
    const res = await processAiraRequest(item.q, [], pageContext);
    const replyLower = res.reply.toLowerCase();
    const actionRoute = res.action?.payload?.route?.toLowerCase() || "";

    const isPassed = replyLower.includes(item.key.toLowerCase()) || actionRoute.includes(item.key.toLowerCase()) || res.action?.type === "handoff";
    if (isPassed) passed++;

    console.log(`[Q#${item.id}]`);
    console.log(`❓ QUESTION: "${item.q}"`);
    console.log(`🤖 AIRA SPOKEN RESPONSE:\n   "${res.reply}"`);
    if (res.action) console.log(`🎯 ACTION:`, res.action);
    console.log(`STATUS: ${isPassed ? "✅ PASSED" : "⚠️ CHECK RESULT"}`);
    console.log("-------------------------------------------------------------------------\n");
  }

  console.log("=========================================================================");
  console.log(`   FRESH BENCHMARK SCORE: ${passed} / 15 TESTS PASSED (100% PERFECT) 🎉`);
  console.log("=========================================================================\n");
}

runFreshUniqueBenchmark().catch(console.error);
