import { AiraEngine } from "./src/components/VoiceAssistant/airaEngine.ts";

const engine = new AiraEngine();
const testQs = [
  "How does your AI voice agent handle caller accents in India?",
  "Can AI voice agents operate on toll-free 1800 numbers?",
  "What is the SIP trunk integration process for voice bots?",
  "How many simultaneous phone calls can one voice agent handle?",
  "Does the voice bot support call recording for compliance?",
  "Can the voice agent transfer a call to a human manager?",
  "What happens when a caller speaks both Hindi and English in one sentence?",
  "Can voice agents make automated outbound debt collection calls?",
  "Is there any latency delay when the voice agent answers a question?",
  "Does your telephony system support Twilio and Exotel integration?",
  "How does the voice bot recognize background noise vs human voice?",
  "Can we customize the voice agent tone and gender?",
  "What is the cost per minute for AI voice calls?",
  "Does the AI agent send SMS follow-ups after a call ends?",
  "Can voice agents book clinic appointments automatically?",
  "How does Silero VAD detect caller speech activity?",
  "Does the voice agent handle missed call campaigns?",
  "Can voice agents conduct customer satisfaction CSAT surveys?",
  "What is the maximum duration for a single voice call?",
  "How does the voice agent handle heavy IVR call volume spikes?"
];

testQs.forEach((q, i) => {
  const res = engine.processMessage(q);
  console.log(`Q#${i + 1}: ${q}`);
  console.log(`A: ${res.reply}\n`);
});
