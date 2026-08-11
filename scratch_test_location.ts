import { AiraEngine } from "./src/components/VoiceAssistant/airaEngine.ts";

const engine = new AiraEngine();
const testQs = [
  "Where is Conversia located?",
  "Where is Converse AI located?",
  "Where is your office located?",
  "Why is your engineering hub located in Jaipur?"
];

testQs.forEach((q) => {
  const res = engine.processMessage(q);
  console.log(`Q: ${q}`);
  console.log(`A: ${res.reply}\n`);
});
