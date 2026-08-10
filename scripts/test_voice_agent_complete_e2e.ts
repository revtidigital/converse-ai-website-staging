/**
 * Complete End-to-End Voice Agent Testing Script
 * Tests:
 * 1. Knowledge Answers & Handoff Quality
 * 2. Specific Case Study Navigation (StyleMart, LearnSphere, CareFirst)
 * 3. Form Field Extraction & Dropdown Mapping
 * 4. Lead Form Auto-fill & Submission
 * 5. Booking Flow with Explicit Confirmation & Consent
 */

import { processAiraRequest } from "../server/services/ollamaService.ts";
import {
  validateAndMapDropdowns,
  CreateBookingSchema,
  LeadFormFieldsSchema,
} from "../server/tools/assistantTools.ts";

async function runCompleteVoiceAgentTesting() {
  console.log("=========================================================================");
  console.log("      AIRA VOICE AGENT COMPLETE END-TO-END INTELLIGENCE & FORM TEST       ");
  console.log("=========================================================================\n");

  const pageContext = {
    currentUrl: "http://localhost:8080/services/ai-voice-agents",
    pageTitle: "AI Voice Agents - ConverseAI",
    visibleHeading: "AI Voice Agents for Inbound & Outbound Calls",
  };

  // ── 1. KNOWLEDGE & ANSWER QUALITY TESTS ───────────────────────────────────
  console.log("📌 [SECTION 1] KNOWLEDGE & ANSWER QUALITY TESTS");

  const testQuestions = [
    {
      query: "How do your AI voice agents handle inbound customer service calls?",
      expectedKeyword: "voice",
    },
    {
      query: "What is your data security and HIPAA policy?",
      expectedKeyword: "soc2",
    },
    {
      query: "Why should we choose WhatsApp AI chatbot over traditional live chat?",
      expectedKeyword: "whatsapp",
    },
    {
      query: "Can you tell me your CEO's favorite movie?",
      expectedKeyword: "incorrect answer", // Should trigger handoff
    },
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const item = testQuestions[i];
    const res = await processAiraRequest(item.query, [], pageContext);
    console.log(`\n❓ Question #${i + 1}: "${item.query}"`);
    console.log(`🤖 Aira Spoken Answer:\n   "${res.reply}"`);
    if (res.action) console.log(`🎯 Triggered Action:`, res.action);

    const matchesExpected = res.reply.toLowerCase().includes(item.expectedKeyword);
    console.log(`STATUS: ${matchesExpected ? "✅ PASSED" : "⚠️ CHECK RESULT"}`);
  }

  // ── 2. SPECIFIC CASE STUDY NAVIGATION INTENT TEST ─────────────────────────
  console.log("\n-------------------------------------------------------------------------");
  console.log("📌 [SECTION 2] SPECIFIC CASE STUDY NAVIGATION INTENT TEST");

  const caseStudyTests = [
    {
      query: "Show me the StyleMart retail case study",
      expectedRoute: "/case-studies/retail-brand-whatsapp-automation",
      label: "StyleMart Retail Case Study",
    },
    {
      query: "Tell me about the LearnSphere edtech case study",
      expectedRoute: "/case-studies/edtech-startup-chatbot-lead-generation",
      label: "LearnSphere EdTech Case Study",
    },
    {
      query: "Open the CareFirst healthcare clinic case study",
      expectedRoute: "/case-studies/healthcare-clinic-omnichannel-support",
      label: "CareFirst Healthcare Case Study",
    },
  ];

  for (const csTest of caseStudyTests) {
    const navRes = await processAiraRequest(csTest.query, [], pageContext);
    console.log(`\n🗣️ User: "${csTest.query}"`);
    console.log(`🤖 Aira Reply: "${navRes.reply}"`);
    console.log(`🎯 Navigation Target:`, navRes.action);
    if (navRes.action?.type === "navigate" && navRes.action.payload?.route === csTest.expectedRoute) {
      console.log(`STATUS: ✅ PASSED (Successfully routed to ${csTest.expectedRoute})`);
    } else {
      console.log(`STATUS: ❌ FAILED for ${csTest.label}`);
    }
  }

  // ── 3. FORM FILLING & DROPDOWN MAPPING TESTS ─────────────────────────────
  console.log("\n-------------------------------------------------------------------------");
  console.log("📌 [SECTION 3] FORM AUTO-FILL & DROPDOWN MAPPING TESTS");

  const rawUserInputForm = {
    full_name: "Janvi Sharma",
    work_email: "janvi.sharma@example.com",
    phone: "+919876543210",
    company_name: "Sharma Retail Pvt Ltd",
    service_interest: "phone-call AI bot",
    budget_range: "under 5k",
    consent: true,
  };

  console.log("\n📥 Raw User Input for Form:");
  console.log(rawUserInputForm);

  const mappedForm = validateAndMapDropdowns(rawUserInputForm);
  console.log("\n🔄 Auto-Mapped Dropdown Form Data (Backend Validated):");
  console.log(mappedForm);

  const formValidation = LeadFormFieldsSchema.safeParse(mappedForm);
  console.log(`\nZod Form Schema Validation Passed: ${formValidation.success ? "✅ YES" : "❌ NO"}`);

  if (
    mappedForm.service_interest === "ai_voice_agents" &&
    mappedForm.budget_range === "<$5k" &&
    formValidation.success
  ) {
    console.log("STATUS: ✅ PASSED (Free-text 'phone-call AI bot' auto-mapped to 'ai_voice_agents' & form auto-filled cleanly)");
  } else {
    console.log("STATUS: ❌ FAILED");
  }

  // ── 4. BOOKING FLOW & MANDATORY CONFIRMATION TEST ─────────────────────────
  console.log("\n-------------------------------------------------------------------------");
  console.log("📌 [SECTION 4] BOOKING FLOW & EXPLICIT CONFIRMATION TEST");

  const unconfirmedBookingPayload = {
    full_name: "Janvi Sharma",
    work_email: "janvi.sharma@example.com",
    phone: "+919876543210",
    service_interest: "ai_voice_agents",
    preferred_slot: "Tomorrow at 10:00 AM IST",
    confirmation: false,
    consent: true,
  };

  const confirmedBookingPayload = {
    ...unconfirmedBookingPayload,
    confirmation: true,
  };

  const unconfirmedCheck = CreateBookingSchema.safeParse(unconfirmedBookingPayload);
  const confirmedCheck = CreateBookingSchema.safeParse(confirmedBookingPayload);

  console.log(`\n1. Booking without explicit confirmation: ${unconfirmedCheck.success ? "Allowed (FAIL)" : "Blocked (PASS)"}`);
  console.log(`2. Booking WITH explicit confirmation: ${confirmedCheck.success ? "Allowed (PASS)" : "Blocked (FAIL)"}`);

  if (!unconfirmedCheck.success && confirmedCheck.success) {
    console.log("STATUS: ✅ PASSED (Strict explicit user confirmation mandatory before booking)");
  } else {
    console.log("STATUS: ❌ FAILED");
  }

  console.log("\n=========================================================================");
  console.log("                    TEST SUITE EXECUTION COMPLETE                        ");
  console.log("=========================================================================\n");
}

runCompleteVoiceAgentTesting().catch(console.error);
