/**
 * Test User's Exact Multi-Turn Browser Session Sequence
 */

import { AiraEngine } from "../src/components/VoiceAssistant/airaEngine.ts";

const SESSION_SEQUENCE = [
  "What details are needed to book a consultation session?",
  "How does Jaipur engineering deliver US-grade AI standards?",
  "Can international clients visit the Jaipur engineering office?",
  "What lead volume increase did edtech clients experience?",
  "What conversion rates do WhatsApp abandoned cart bots deliver?",
  "How did ConverseAI help a logistics company streamline support?",
];

async function runSessionSequenceTest() {
  console.log("=========================================================================");
  console.log("   SIMULATING USER'S MULTI-TURN BROWSER SESSION SEQUENCE                 ");
  console.log("=========================================================================\n");

  const engine = new AiraEngine();

  for (let i = 0; i < SESSION_SEQUENCE.length; i++) {
    const q = SESSION_SEQUENCE[i];
    const res = await engine.processMessageAsync(q, []);
    console.log(`[TURN #${i + 1}] 💬 User: "${q}"`);
    console.log(`🤖 AIRA RESPONSE:\n   "${res.reply}"`);
    console.log(`⚙️ ENGINE STATE: ${engine.getState()}`);
    console.log("-------------------------------------------------------------------------\n");
  }
}

runSessionSequenceTest().catch(console.error);
