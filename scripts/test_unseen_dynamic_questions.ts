/**
 * Unseen Dynamic Questions Test Runner
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

const RANDOM_UNSEEN_QUESTIONS = [
  "How do you ensure zero data leak when training custom AI models for healthcare clients?",
  "What is the average response latency when an AI voice agent makes an outbound call?",
  "Can a small retail store in Jaipur start with just WhatsApp AI automation first before voice agents?",
  "How does your AI agent handle caller interruptions mid-sentence during a live call?",
  "What deliverables are handed over at the end of a 4-week Agent Sprint?",
];

async function testRandomUnseen() {
  console.log("=========================================================================");
  console.log("   DYNAMIC GENERATIVE LLM & RAG UNSEEN QUESTIONS VERIFICATION            ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8081/",
    pageTitle: "ConverseAI - Home",
  };

  for (let i = 0; i < RANDOM_UNSEEN_QUESTIONS.length; i++) {
    const q = RANDOM_UNSEEN_QUESTIONS[i];
    console.log(`[Q#${i + 1}] ❓ Question: "${q}"`);
    const res = await processAiraRequest(q, [], pageContext);
    console.log(`🤖 Aira Dynamic Answer:\n   "${res.reply}"`);
    console.log("-------------------------------------------------------------------------\n");
  }
}

testRandomUnseen().catch(console.error);
