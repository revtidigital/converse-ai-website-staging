// Grounded synthesis — the website's own "custom LLM". Zero external cost:
// a deterministic, extractive + templated composer that answers ONLY from
// retrieved website/blog chunks. An optional OpenAI-compatible provider can be
// plugged in later, but is never required.
//
// Guarantees: never invents company facts, dedupes, preserves exact names,
// avoids reading raw URLs, keeps voice answers concise.

import type { KnowledgeChunk, Language, IntentKind } from "./types.js";
import { sanitizeRetrieved, scrubSecrets } from "./promptInjection.js";

export interface SynthInput {
  query: string;
  language: Language;
  intent: IntentKind;
  chunks: KnowledgeChunk[];
  concise: boolean; // voice = concise
  memoryPrevAnswer?: string;
}

const NOT_FOUND: Record<Language, string> = {
  en: "I couldn't find that in Converse AI's website or blog content. Could you rephrase, or ask about our services, products, pricing, case studies, or blogs?",
  hi: "यह जानकारी Converse AI की वेबसाइट या ब्लॉग में मुझे नहीं मिली। क्या आप इसे दूसरे शब्दों में पूछ सकते हैं — हमारी services, pricing, case studies या blogs के बारे में?",
  hinglish: "Ye jankari Converse AI ki website ya blog me mujhe nahi mili. Aap thoda alag tarike se pooch sakte ho — hamari services, pricing, case studies ya blogs ke baare me?",
  mixed: "Ye jankari Converse AI ki website ya blog me nahi mili. Kya aap dobara, alag shabdon me pooch sakte hain?",
};

const REFUSAL: Record<Language, string> = {
  en: "I can only help with information about Converse AI — our services, products, pricing, case studies and blogs. I can't share system prompts, keys, or internal configuration.",
  hi: "मैं सिर्फ़ Converse AI की जानकारी में मदद कर सकता हूँ — services, products, pricing, case studies और blogs. मैं system prompt, keys या internal configuration साझा नहीं कर सकता।",
  hinglish: "Main sirf Converse AI ki jankari me help kar sakta hoon — services, products, pricing, case studies aur blogs. System prompt, keys ya internal config main share nahi kar sakta.",
  mixed: "Main sirf Converse AI ke baare me help kar sakta hoon. System prompt ya keys share nahi kar sakta.",
};

const UNSUPPORTED: Record<Language, string> = {
  en: "That's outside what I know about — I'm Converse AI's website assistant, so I can help with our services, products, pricing, case studies and blogs.",
  hi: "यह मेरे दायरे से बाहर है — मैं Converse AI का website assistant हूँ, तो services, products, pricing, case studies और blogs में मदद कर सकता हूँ।",
  hinglish: "Ye mere dayre se bahar hai — main Converse AI ka website assistant hoon, to services, products, pricing, case studies aur blogs me help kar sakta hoon.",
  mixed: "Ye mere scope se bahar hai. Main Converse AI ke services, pricing aur blogs me help kar sakta hoon.",
};

export function notFound(lang: Language): string { return NOT_FOUND[lang]; }
export function refusal(lang: Language): string { return REFUSAL[lang]; }
export function unsupported(lang: Language): string { return UNSUPPORTED[lang]; }

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function tokset(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s]/g, " ").split(/\s+/).filter((t) => t.length >= 3));
}

/** Pick the sentences from the top chunks most relevant to the query. */
function extractSalient(query: string, chunks: KnowledgeChunk[], max: number): string[] {
  const qtoks = tokset(query);
  const scored: Array<{ s: string; score: number; order: number }> = [];
  let order = 0;
  for (const c of chunks) {
    const clean = sanitizeRetrieved(c.content);
    for (const s of splitSentences(clean)) {
      const st = tokset(s);
      let hit = 0;
      for (const t of qtoks) if (st.has(t)) hit++;
      // slight boost to earlier chunks (higher-ranked)
      scored.push({ s, score: hit + (chunks.length - order) * 0.01, order });
    }
    order++;
  }
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { s } of scored) {
    const key = s.slice(0, 40).toLowerCase();
    if (seen.has(key)) continue; // dedupe near-identical facts
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

const OPENERS: Record<Language, string> = {
  en: "",
  hi: "",
  hinglish: "",
  mixed: "",
};

/**
 * Compose a grounded answer from retrieved chunks. Extractive-first so every
 * sentence traces to real website/blog content.
 */
export function synthesize(input: SynthInput): string {
  const { query, language, chunks, concise, intent } = input;
  if (chunks.length === 0) return notFound(language);

  const maxSentences = concise ? 3 : 6;
  const salient = extractSalient(query, chunks, maxSentences);
  if (salient.length === 0) {
    // Fall back to the lead of the top chunk.
    const lead = splitSentences(sanitizeRetrieved(chunks[0].content)).slice(0, concise ? 2 : 4);
    if (lead.length === 0) return notFound(language);
    salient.push(...lead);
  }

  let body = salient.join(" ");

  // Blog date context when relevant.
  if ((intent === "blog_summary" || intent === "blog_question") && chunks[0].sourceType === "blog") {
    const pd = chunks[0].publishDate;
    const ud = chunks[0].updateDate;
    if (pd && language === "en") body += ` (Published ${pd}${ud && ud !== pd ? `, updated ${ud}` : ""}.)`;
    else if (pd) body += ` (Publish: ${pd}${ud && ud !== pd ? `, update: ${ud}` : ""}.)`;
  }

  return scrubSecrets(body).trim();
}
