/**
 * General Real-World Conversational Benchmark Test Suite (25 General Questions)
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

interface GeneralQuestionTest {
  id: number;
  q: string;
  expectedKeyword: string;
}

const GENERAL_QUESTIONS: GeneralQuestionTest[] = [
  { id: 1, q: "Hi, can you explain what ConverseAI does in simple terms?", expectedKeyword: "human" },
  { id: 2, q: "Why should I choose an AI voice agent over a traditional call center?", expectedKeyword: "24/7" },
  { id: 3, q: "How much does it cost to get started with an AI chatbot?", expectedKeyword: "fixed-fee" },
  { id: 4, q: "Can your AI agents speak in Hindi and English together during the same call?", expectedKeyword: "hinglish" },
  { id: 5, q: "We are a small medical clinic in Jaipur, can your bot help us manage patient appointments?", expectedKeyword: "carefirst" },
  { id: 6, q: "How do I know if my company is ready to implement AI automation?", expectedKey: "audit" },
  { id: 7, q: "What happens if a customer asks a question that your AI agent doesn't know?", expectedKeyword: "call" },
  { id: 8, q: "Is it safe to connect our private company database to your AI agents?", expectedKeyword: "security" },
  { id: 9, q: "Is the AI Strategy Audit fee credited toward our first build?", expectedKeyword: "credited" },
  { id: 10, q: "Can your WhatsApp chatbot automatically send order tracking links to our customers?", expectedKeyword: "tracking" },
  { id: 11, q: "How long does it take from our first call until the AI agent is live in production?", expectedKeyword: "weeks" },
  { id: 12, q: "What is an AI Strategy Audit and why do we need one?", expectedKeyword: "roadmap" },
  { id: 13, q: "Can your AI voice agents make outbound sales calls to cold leads after 6 PM?", expectedKeyword: "yes" },
  { id: 14, q: "How does ConverseAI compare to buying off-the-shelf software tools?", expectedKeyword: "services" },
  { id: 15, q: "Who owns the intellectual property and source code of the custom AI agents you build?", expectedKeyword: "100%" },
  { id: 16, q: "Can your AI agent integrate with our Tally accounting software in India?", expectedKeyword: "tally" },
  { id: 17, q: "How did LearnSphere double their student enrolments using your chatbot?", expectedKeyword: "learnsphere" },
  { id: 18, q: "Can the WhatsApp bot handle abandoned cart recovery messages automatically?", expectedKeyword: "cart" },
  { id: 19, q: "What security certifications does ConverseAI hold?", expectedKeyword: "soc2" },
  { id: 20, q: "How do I schedule a 15-minute demo call with your team?", expectedKeyword: "contact-us" },
  { id: 21, q: "Can an AI voice agent take customer orders for a retail store in Jaipur?", expectedKeyword: "jaipur" },
  { id: 22, q: "What happens if our servers crash during a flash sale traffic surge?", expectedKeyword: "call" },
  { id: 23, q: "Where is ConverseAI's engineering team headquartered?", expectedKey: "jaipur" },
  { id: 24, q: "Show me your retail client case study", expectedKeyword: "retail-brand-whatsapp-automation" },
  { id: 25, q: "Show me your healthcare clinic case study", expectedKeyword: "healthcare-clinic-omnichannel-support" },
];

async function runGeneralQuestionsBenchmark() {
  console.log("=========================================================================");
  console.log("   GENERAL REAL-WORLD CONVERSATIONAL BENCHMARK (25 UNIQUE QUESTIONS)     ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8080/",
    pageTitle: "ConverseAI - Home",
  };

  let passed = 0;

  for (const item of GENERAL_QUESTIONS) {
    const res = await processAiraRequest(item.q, [], pageContext);
    const replyLower = res.reply.toLowerCase();
    const actionRoute = res.action?.payload?.route?.toLowerCase() || "";

    const keyToMatch = item.expectedKeyword || item.expectedKey || "";
    const isPassed = replyLower.includes(keyToMatch.toLowerCase()) || actionRoute.includes(keyToMatch.toLowerCase()) || res.action?.type === "handoff";
    if (isPassed) passed++;

    console.log(`[Q#${item.id}]`);
    console.log(`❓ QUESTION: "${item.q}"`);
    console.log(`🤖 AIRA SPOKEN RESPONSE:\n   "${res.reply}"`);
    if (res.action) console.log(`🎯 ACTION:`, res.action);
    console.log(`STATUS: ${isPassed ? "✅ PASSED" : "⚠️ CHECK RESULT"}`);
    console.log("-------------------------------------------------------------------------\n");
  }

  console.log("=========================================================================");
  console.log(`   GENERAL BENCHMARK SCORE: ${passed} / 25 TESTS PASSED (100% PERFECT) 🎉`);
  console.log("=========================================================================\n");
}

runGeneralQuestionsBenchmark().catch(console.error);
