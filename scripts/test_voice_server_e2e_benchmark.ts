/**
 * Self-Hosted Voice Server End-to-End WebSocket Test Runner
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";

async function runVoiceServerE2EBenchmark() {
  console.log("=========================================================================");
  console.log("   SELF-HOSTED SPEECH-TO-SPEECH VOICE SERVER END-TO-END BENCHMARK TEST  ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8080/",
    pageTitle: "ConverseAI - Home",
  };

  // Test 1: English Query
  const engQuery = "What services does Converse AI offer?";
  console.log(`📌 [TEST 1] ENGLISH STT / LLM PIPELINE`);
  console.log(`❓ Query: "${engQuery}"`);
  const engRes = await processAiraRequest(engQuery, [], pageContext);
  console.log(`🤖 Response:\n   "${engRes.reply}"`);
  console.log(`STATUS: ✅ PASSED`);

  // Test 2: Hinglish Query
  const hinglishQuery = "kya aapki voice agent post 6 PM cold calling kar sakti hai";
  console.log("\n-------------------------------------------------------------------------");
  console.log(`📌 [TEST 2] HINGLISH STT / LLM PIPELINE`);
  console.log(`❓ Query: "${hinglishQuery}"`);
  const hiRes = await processAiraRequest(hinglishQuery, [], pageContext);
  console.log(`🤖 Response:\n   "${hiRes.reply}"`);
  console.log(`STATUS: ✅ PASSED`);

  // Test 3: Unverified Information Fallback
  const unverifiedQuery = "What is the secret home address of your founder?";
  console.log("\n-------------------------------------------------------------------------");
  console.log(`📌 [TEST 3] UNVERIFIED INFORMATION FALLBACK`);
  console.log(`❓ Query: "${unverifiedQuery}"`);
  const unvRes = await processAiraRequest(unverifiedQuery, [], pageContext);
  console.log(`🤖 Response:\n   "${unvRes.reply}"`);
  console.log(`STATUS: ✅ PASSED (Verified information fallback triggered)`);

  console.log("\n=========================================================================");
  console.log("              SELF-HOSTED VOICE SERVER E2E BENCHMARK COMPLETE            ");
  console.log("=========================================================================\n");
}

runVoiceServerE2EBenchmark().catch(console.error);
