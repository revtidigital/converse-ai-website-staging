/**
 * Test User's Exact 7 Questions
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

const USER_QUESTIONS = [
  "How does your AI voice agent handle caller accents in India?",
  "Can AI voice agents operate on toll-free 1800 numbers?",
  "What is the SIP trunk integration process for voice bots?",
  "How many simultaneous phone calls can one voice agent handle?",
  "Does the voice bot support call recording for compliance?",
  "What happens when a caller speaks both Hindi and English in one sentence?",
  "What document formats are supported by Knowledge Intelligence?",
];

async function runExactUserTest() {
  console.log("=========================================================================");
  console.log("   VERIFYING USER'S EXACT 7 TRANSCRIPT QUESTIONS                         ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8081/",
    pageTitle: "ConverseAI - Home",
  };

  for (let i = 0; i < USER_QUESTIONS.length; i++) {
    const q = USER_QUESTIONS[i];
    const res = await processAiraRequest(q, [], pageContext);
    console.log(`[Q#${i + 1}] ❓ Question: "${q}"`);
    console.log(`🤖 Updated Exact Answer:\n   "${res.reply}"`);
    console.log("-------------------------------------------------------------------------\n");
  }
}

runExactUserTest().catch(console.error);
