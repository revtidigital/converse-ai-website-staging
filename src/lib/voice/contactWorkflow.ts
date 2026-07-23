export interface ContactVoiceResult { handled: boolean; speech: string; done?: boolean; }
type Field = "name" | "email" | "phone" | "product" | "subject" | "message";
const fields: Array<{ key: Field; label: string; required: boolean }> = [
  { key: "name", label: "your full name", required: true },
  { key: "email", label: "your work email", required: true },
  { key: "phone", label: "your phone number", required: true },
  { key: "product", label: "which product or service you’re interested in", required: true },
  { key: "subject", label: "a short subject", required: false },
  { key: "message", label: "a short message about your project", required: false },
];
let active = false;
let index = 0;
let confirming = false;
const draft: Partial<Record<Field, string>> = {};
const yes = /^(yes|yeah|yep|sure|okay|ok|submit|send|go ahead)/i;
const no = /^(no|nope|not now|cancel|never mind)/i;
function setField(field: Field, value: string) {
  draft[field] = value;
  window.dispatchEvent(new CustomEvent("voice-agent:contact-field", { detail: { field, value } }));
}
function valid(field: Field, value: string) {
  if (field === "email") return /\S+@\S+\.\S+/.test(value);
  if (field === "phone") return value.replace(/\D/g, "").length >= 7;
  if (["name", "product"].includes(field)) return value.trim().length >= 2;
  return value.trim().length <= (field === "message" ? 2000 : 200);
}
function nextQuestion() {
  const f = fields[index];
  return `I'll fill the contact form one step at a time. What is ${f.label}?`;
}
function summary() {
  return `I have name ${draft.name || "not provided"}, email ${draft.email || "not provided"}, phone ${draft.phone || "not provided"}, interest ${draft.product || "not provided"}, and message ${draft.message || draft.subject || "not provided"}. Should I submit this now?`;
}
export function resetContactWorkflow() { active = false; index = 0; confirming = false; for (const k of Object.keys(draft)) delete draft[k as Field]; }
export function handleContactWorkflow(text: string, pathname: string): ContactVoiceResult {
  const t = text.trim();
  if (!pathname.includes("contact") && !active) return { handled: false, speech: "" };
  if (/schedule|book.*call|demo/i.test(t) && !active) return { handled: false, speech: "" };
  if (/help.*(contact|form)|fill.*form|send.*message|yes/i.test(t) && pathname.includes("contact") && !active) { active = true; return { handled: true, speech: nextQuestion() }; }
  if (!active) return { handled: false, speech: "" };
  if (/^(no|nope|not now|cancel|never mind)$/i.test(t)) { resetContactWorkflow(); return { handled: true, speech: "No problem. I’ve cleared the temporary contact details." }; }
  const correction = t.match(/change my (name|email|phone|product|subject|message)\s*(?:to)?\s*(.*)/i);
  if (correction) { index = Math.max(0, fields.findIndex(f => f.key === correction[1].toLowerCase())); if (correction[2]) { const f = fields[index]; if (!valid(f.key, correction[2])) return { handled: true, speech: `That ${f.label} doesn't sound valid. Please say it again.` }; setField(f.key, correction[2]); index++; } return { handled: true, speech: index >= fields.length ? summary() : `Okay, changing that. What is ${fields[index].label}?` }; }
  if (confirming) {
    if (yes.test(t)) { window.dispatchEvent(new CustomEvent("voice-agent:contact-submit-request")); resetContactWorkflow(); return { handled: true, speech: "Submitting the form now. I’ll report the result shown by the website.", done: true }; }
    confirming = false; return { handled: true, speech: "Okay, I will not submit it. Which detail would you like to change?" };
  }
  const f = fields[index];
  if (/^skip$/i.test(t) && !f.required) { index++; return { handled: true, speech: index >= fields.length ? summary() : `Okay, skipping that. What is ${fields[index].label}?` }; }
  if (!valid(f.key, t)) return { handled: true, speech: `That ${f.label} doesn't sound valid. Please say it again${f.required ? "" : ", or say skip"}.` };
  setField(f.key, t);
  index++;
  if (index >= fields.length) { confirming = true; return { handled: true, speech: summary() }; }
  return { handled: true, speech: `Got it. I filled ${f.label}. What is ${fields[index].label}?` };
}
