import { AiraEngine } from "./src/components/VoiceAssistant/airaEngine.ts";

const engine = new AiraEngine();
const tests = [
  "Book a demo call for me",
  "I want to book a demo",
  "Schedule a demo",
  "I'd like to schedule a call",
  "Book a call",
  "Can I get a demo?",
  "Talk to sales",
];

tests.forEach((q) => {
  engine["state"] = "IDLE"; // reset
  const res = engine.processMessage(q);
  const correct = res.reply.toLowerCase().includes("name") || res.reply.toLowerCase().includes("email");
  console.log(`${correct ? "✅" : "❌"} Q: "${q}"\n   A: ${res.reply.substring(0, 100)}...\n`);
});
