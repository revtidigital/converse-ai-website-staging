/**
 * Real-Time Live Hindi / Hinglish Questions Benchmark Test
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

const HINDI_TEST_QUESTIONS = [
  { id: 1, q: "ConverseAI kya karta hai?" },
  { id: 2, q: "Kya aapke AI voice agents Hindi aur Hinglish me baat kar sakte hain?" },
  { id: 3, q: "StyleMart retail store ko kitna fayda hua tha WhatsApp bot se?" },
  { id: 4, q: "ConverseAI ka main office Jaipur me hai kya?" },
  { id: 5, q: "Kya mera customer data safe rahega SOC2 aur HIPAA ke mutabiq?" },
  { id: 6, q: "Kya AI voice call summary CRM me automatic save ho jati hai?" },
  { id: 7, q: "Project complete hone par code aur IP kiski ownership me rahega?" },
  { id: 8, q: "LearnSphere edtech brand ke student enrolments kitne badhe the?" },
  { id: 9, q: "CareFirst clinic me patient no-show kitne percent kam hue the?" },
  { id: 10, q: "Kal discovery call book karne ke liye konse time slots available hain?" },
];

async function runHindiRealtimeTest() {
  console.log("=========================================================================");
  console.log("   REAL-TIME HINDI / HINGLISH QUESTIONS LIVE TEST EXECUTION             ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8081/",
    pageTitle: "ConverseAI - Home",
  };

  for (const item of HINDI_TEST_QUESTIONS) {
    console.log(`[QUESTION #${item.id}] ❓ "${item.q}"`);
    const startTime = Date.now();
    const res = await processAiraRequest(item.q, [], pageContext);
    const durationMs = Date.now() - startTime;

    console.log(`🤖 AIRA RAW REAL-TIME RESPONSE (${durationMs}ms):\n   "${res.reply}"`);
    if (res.action) {
      console.log(`🎯 EXECUTED ACTION:`, res.action);
    }
    console.log("-------------------------------------------------------------------------\n");
  }
}

runHindiRealtimeTest().catch(console.error);
