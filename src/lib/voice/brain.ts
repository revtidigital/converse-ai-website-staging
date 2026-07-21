// The voice agent's "brain": intent detection + answer generation.
// 100% client-side and free. Uses the page's own content for grounding.
// If the browser exposes an on-device model (Chrome's built-in Prompt API /
// window.ai — free, offline), it is used to phrase answers conversationally;
// otherwise a robust extractive fallback is used. No paid APIs, ever.

import {
  matchDestination,
  destinationForPath,
  PRICING_ALIASES,
  type VoiceDestination,
} from "./siteMap";
import {
  extractPageText,
  getPageTitle,
  toSentences,
  getBlogContentEl,
  matchBlogArticle,
} from "./pageContent";
import { VOICE_DESTINATIONS } from "./siteMap";

export type IntentKind =
  | "navigate"
  | "compare"
  | "summarize"
  | "deepdive"
  | "readblog"
  | "stop"
  | "question"
  | "affirmative"
  | "negative"
  | "greeting";

export interface AgentResult {
  /** What to speak. */
  speech: string;
  /** Optional route to navigate to (SPA, same-origin). */
  navigateTo?: string;
  /** Optional full URL to navigate to when it's on a different origin. */
  externalNavigateTo?: string;
  /** Whether the caller should trigger blog read-aloud. */
  startReadAloud?: boolean;
  /** Whether the agent should stop / close. */
  stop?: boolean;
  /** Topic the answer was about, for multi-turn context. */
  topic?: string;
  /** A named entity (e.g. a competitor) the answer discussed, so a follow-up
   *  like "how is ConverseAI better than it?" can resolve "it". */
  entity?: string;
}

// ── Intent detection ────────────────────────────────────────────────────────

const SUMMARY_RE = /\b(summar|overview|quick (look|rundown)|key (points|takeaways|takeaway)|main points|what.?s (this|the) page|tl;?dr)\b/i;
const DEEPDIVE_RE = /\b(tell me more|more detail|in detail|explain (in )?(detail|more|everything)|complete information|go deeper|elaborate|full (info|information))\b/i;
const READ_RE = /\b(read (the )?(full )?(article|blog|post)|read (this|the|it)? ?(aloud|out loud)|listen to (this|the)|narrate)\b/i;
// Navigation ONLY on EXPLICIT verbs. Informational phrasings ("what is",
// "tell me about", "explain") must ANSWER in place, never navigate.
const NAV_RE = /\b(open|go to|take me( to)?|navigate( to)?|visit|show me|show|bring up|jump to|read the full article)\b/i;
const STOP_RE = /\b(stop|be quiet|shut up|cancel|never mind|end (the )?(conversation|chat)|goodbye|bye|that.?s all|exit|close)\b/i;
const GREET_RE = /^\s*(hi|hello|hey|hii+|yo|namaste|good (morning|afternoon|evening))\b/i;
const YES_RE = /^\s*(yes|yeah|yep|yup|sure|okay|ok|please do|go ahead|sounds good|do it)\b/i;
const NO_RE = /^\s*(no|nope|nah|not now|no thanks?)\b/i;
// Comparison questions ("why is ConverseAI better than Sierra?", "X vs Y",
// "how does it compare", "difference between …"). Answered specifically.
const COMPARE_RE = /\b(better than|worse than|compare[ds]?( to| with)?|comparison|versus|vs\.?|difference between|differ from|how (is|are|do(es)?) .*(compare|differ|stack up)|why (should|is|would).*(better|choose|pick|switch|instead)|instead of|over (sierra|decagon|intercom|zendesk|ada|drift|tidio|freshchat))\b/i;

export function detectIntent(text: string): IntentKind {
  const t = text.trim();
  const low = t.toLowerCase();
  const mentionsPricing = PRICING_ALIASES.some((a) => low.includes(a));
  if (STOP_RE.test(t)) return "stop";
  if (READ_RE.test(t)) return "readblog";
  if (COMPARE_RE.test(t)) return "compare";
  if (SUMMARY_RE.test(t)) return "summarize";
  if (DEEPDIVE_RE.test(t)) return "deepdive";
  if (NAV_RE.test(t) && (matchDestination(t) || mentionsPricing)) return "navigate";
  if (GREET_RE.test(t) && t.split(/\s+/).length <= 3) return "greeting";
  if (YES_RE.test(t)) return "affirmative";
  if (NO_RE.test(t)) return "negative";
  // A bare page name ("pricing", "voice agents") counts as navigate — but an
  // interrogative that merely NAMES a topic ("what is WhatsApp marketing?",
  // "how does the chatbot work?") must be ANSWERED, not navigated.
  const looksLikeQuestion = /\?\s*$/.test(t) || /^\s*(what|how|why|who|when|where|which|does|do|is|are|can|could|should|tell|explain)\b/i.test(t);
  if (!looksLikeQuestion && (matchDestination(t) || mentionsPricing) && t.split(/\s+/).length <= 4) return "navigate";
  return "question";
}

// ── Named-entity handling (for comparisons + "it" follow-ups) ────────────────

/** Canonical entity names the agent knows how to talk about / compare. */
const ENTITY_ALIASES: Record<string, string> = {
  converseai: "ConverseAI",
  "converse ai": "ConverseAI",
  converse: "ConverseAI",
  "sierra ai": "Sierra AI",
  sierra: "Sierra AI",
  "decagon ai": "Decagon AI",
  decagon: "Decagon AI",
  intercom: "Intercom",
  "intercom fin": "Intercom",
  zendesk: "Zendesk",
  ada: "Ada",
  drift: "Drift",
  tidio: "Tidio",
  freshchat: "Freshchat",
};

/** Longest aliases first so "converse ai" wins over "converse". */
const ENTITY_KEYS = Object.keys(ENTITY_ALIASES).sort((a, b) => b.length - a.length);

/** Find every known entity named in the text, canonicalised + de-duplicated,
 *  in the order they appear. */
export function detectEntities(text: string): string[] {
  const low = text.toLowerCase();
  const hits: { name: string; at: number }[] = [];
  const claimed: Array<[number, number]> = [];
  for (const key of ENTITY_KEYS) {
    const re = new RegExp(`(?:^|\\W)${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|\\W)`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(low))) {
      const start = m.index + m[0].indexOf(key[0], 0);
      const end = start + key.length;
      // Skip if this span is already covered by a longer alias match.
      if (claimed.some(([s, e]) => start >= s && start < e)) continue;
      claimed.push([m.index, m.index + m[0].length]);
      hits.push({ name: ENTITY_ALIASES[key], at: m.index });
    }
  }
  hits.sort((a, b) => a.at - b.at);
  const out: string[] = [];
  for (const h of hits) if (!out.includes(h.name)) out.push(h.name);
  return out;
}

/** Replace a bare pronoun ("it", "them", "that one") with the entity the last
 *  turn was about, so follow-ups keep their referent. */
function resolvePronouns(text: string, lastEntity?: string): string {
  if (!lastEntity) return text;
  return text.replace(/\b(it|them|they|that one|the other one)\b/gi, lastEntity);
}

/** A short, on-brand answer to "why is ConverseAI better than X / how does it
 *  compare" — directly addresses the compared entity instead of a generic blurb. */
function comparisonAnswer(other?: string): string {
  const base =
    "ConverseAI is a done-for-you service — we build and run your AI agents for you across website chat, WhatsApp, voice and email, with custom agents tailored to your business, live human handoff, and ongoing management.";
  if (!other || other === "ConverseAI") {
    return `Here's what makes ConverseAI stand out. ${base} You get a whole team building and running it, not just a tool you have to configure yourself.`;
  }
  return `Great question. Compared with ${other}, the big difference is that ConverseAI is a done-for-you service, not just a product you set up on your own. ${base} So instead of a single chatbot you configure yourself, you get end-to-end automation across every channel plus a team that builds and runs it for you.`;
}

// ── Optional on-device model (free, offline) ────────────────────────────────

interface PromptSession {
  prompt: (input: string) => Promise<string>;
  destroy?: () => void;
}

async function getLocalSession(): Promise<PromptSession | null> {
  try {
    const w = window as unknown as {
      LanguageModel?: { availability?: () => Promise<string>; create?: (o?: unknown) => Promise<PromptSession> };
      ai?: { languageModel?: { create?: (o?: unknown) => Promise<PromptSession> } };
    };
    if (w.LanguageModel?.create) {
      // Only use the on-device model if it is ALREADY downloaded. Any other
      // state ("downloadable"/"downloading") would trigger a large download and
      // stall responses — for a snappy experience we skip straight to the fast
      // extractive path instead.
      const avail = w.LanguageModel.availability ? await w.LanguageModel.availability() : "available";
      if (avail !== "available" && avail !== "readily") return null;
      return await w.LanguageModel.create({
        initialPrompts: [
          {
            role: "system",
            content:
              "You are ConverseAI's friendly voice assistant. Answer in a warm, natural, spoken style using clear, simple words. Base answers only on the provided page context.",
          },
        ],
      });
    }
    if (w.ai?.languageModel?.create) {
      return await w.ai.languageModel.create();
    }
  } catch {
    /* fall through to extractive */
  }
  return null;
}

let sessionPromise: Promise<PromptSession | null> | null = null;
function localSession() {
  if (!sessionPromise) sessionPromise = getLocalSession();
  return sessionPromise;
}

/** Resolve `p`, but give up after `ms` so the model can never stall the reply. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

// ── Extractive fallback (keyword relevance ranking) ─────────────────────────

function extractiveAnswer(question: string, context: string, sentenceCount = 3): string {
  const sentences = toSentences(context);
  if (!sentences.length) return "";
  const stop = new Set([
    "the","a","an","is","are","was","were","of","to","and","in","on","for","with","that","this","it","as","at","by","be","or","from","what","how","who","why","tell","me","about","does","do","can","you","your","our","we",
  ]);
  const qWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));

  const scored = sentences.map((s, i) => {
    const low = s.toLowerCase();
    let score = 0;
    qWords.forEach((w) => {
      if (low.includes(w)) score += 1;
    });
    return { s, score, i };
  });
  const hasMatch = scored.some((x) => x.score > 0);
  const picked = (hasMatch ? scored.filter((x) => x.score > 0) : scored)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, sentenceCount)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return picked.join(" ");
}

type AnswerMode = "brief" | "detailed" | "full";

async function phrase(question: string, context: string, mode: AnswerMode): Promise<string> {
  const session = await withTimeout(localSession(), 1200);
  if (session) {
    try {
      const ask =
        mode === "full"
          ? "Summarize the ENTIRE page thoroughly in a natural, spoken style, covering every main section and point. Use clear, simple words."
          : mode === "detailed"
          ? "Give a thorough, conversational spoken answer covering all the relevant detail. Use clear, simple words."
          : "Give a concise, conversational spoken answer in 2-4 sentences. Use clear, simple words.";
      const out = await withTimeout(
        session.prompt(`${ask}\n\nUser question: ${question}\n\nPage context:\n${context.slice(0, 6000)}`),
        3500
      );
      if (out && out.trim().length > 10) return out.trim();
    } catch {
      /* fall through */
    }
  }
  // Keep spoken answers tight and conversational — not paragraph dumps.
  const counts: Record<AnswerMode, number> = { brief: 3, detailed: 6, full: 10 };
  return extractiveAnswer(question, context, counts[mode]);
}

/**
 * Answer a general question about ConverseAI / the site using the built-in
 * site knowledge (every page's description) when the current page doesn't
 * contain the answer. Lets the agent respond to questions about anything on
 * the website, not just the page you're on.
 */
function siteKnowledge(question: string): string {
  const stop = new Set(["the","a","an","is","are","of","to","and","in","on","for","with","that","this","it","what","how","who","why","tell","me","about","does","do","can","you","your","our","we","i","want","know"]);
  const qWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  if (!qWords.length) return "";
  const scored = VOICE_DESTINATIONS.map((d) => {
    const hay = `${d.title} ${d.aliases.join(" ")} ${d.blurb}`.toLowerCase();
    let score = 0;
    for (const w of qWords) if (hay.includes(w)) score += 1;
    return { d, score };
  }).filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return "";
  // Combine the top couple of matching topics for a fuller answer.
  return scored.slice(0, 2).map((x) => x.d.blurb).join(" ");
}

/**
 * Build a comprehensive spoken summary of the whole page — covers headings and
 * the leading sentences of each section so nothing important is skipped.
 */
function fullPageSummary(): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    const t = s.replace(/\s+/g, " ").trim();
    if (t.length > 15 && t.length < 320 && !seen.has(t)) {
      seen.add(t);
      parts.push(t);
    }
  };
  const scope =
    getBlogContentEl() ||
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  if (scope) {
    const nodes = scope.querySelectorAll("h1, h2, h3, p, li");
    nodes.forEach((n) => {
      const el = n as HTMLElement;
      if (el.closest("[data-voice-agent], header, nav, footer")) return;
      const txt = (el.innerText || el.textContent || "").trim();
      if (!txt) return;
      if (/^(H1|H2|H3)$/.test(el.tagName)) push(txt);
      else push(txt.split(/(?<=[.!?])\s/)[0]); // first sentence of each block
    });
  }
  // A spoken overview should hit the highlights, not narrate the whole page —
  // keep it to the leading sections so it stays natural to listen to.
  return parts.slice(0, 10).join(" ");
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function respond(
  text: string,
  ctx: { pathname: string; lastTopic?: string; lastFollowUp?: string; lastEntity?: string }
): Promise<AgentResult> {
  // Resolve "it"/"them" against the last entity so follow-ups keep context,
  // e.g. after "tell me about Sierra AI" → "how is ConverseAI better than it?".
  const resolved = resolvePronouns(text, ctx.lastEntity);
  const intent = detectIntent(resolved);
  const here = destinationForPath(ctx.pathname);
  const pageTitle = getPageTitle();

  if (intent === "stop") {
    return { speech: "Okay, ending the conversation. Just tap the mic whenever you need me.", stop: true };
  }

  if (intent === "greeting") {
    return { speech: "Hi! Welcome to ConverseAI. What would you like to know?" };
  }

  // ── Comparison ("why is ConverseAI better than Sierra AI?") ─────────────────
  // Answer the exact comparison asked, using the resolved entities. Never
  // navigate for a comparison question.
  if (intent === "compare") {
    const ents = detectEntities(resolved);
    const other = ents.find((e) => e !== "ConverseAI");
    return {
      speech: comparisonAnswer(other),
      topic: other ?? ctx.lastTopic,
      entity: other,
    };
  }

  // ── Blog article by name — ONLY on an explicit navigation/read request ──────
  // If the user explicitly asks to OPEN/READ an article that's linked on this
  // page (e.g. the blog list), open the exact one. This must NOT run for plain
  // informational questions ("what is WhatsApp marketing?") — those answer in
  // place instead of jumping to a loosely-related article.
  if (intent === "navigate" || intent === "readblog") {
    const article = matchBlogArticle(resolved);
    if (article) {
      const sameOrigin =
        typeof window !== "undefined" && article.href.startsWith(window.location.origin);
      const path = (() => {
        try {
          return new URL(article.href).pathname;
        } catch {
          return article.href;
        }
      })();
      return {
        speech: "Sure, opening that article.",
        navigateTo: sameOrigin ? path : undefined,
        externalNavigateTo: sameOrigin ? undefined : article.href,
        topic: article.title,
      };
    }
  }

  if (intent === "navigate") {
    // Pricing has no dedicated destination alias set; handle explicitly.
    if (PRICING_ALIASES.some((a) => resolved.toLowerCase().includes(a))) {
      return {
        speech:
          "Pricing is tailored to each business, and you can book a demo for a custom quote.",
        navigateTo: "/services",
        topic: "pricing",
      };
    }
    const dest = matchDestination(resolved) as VoiceDestination;
    if (dest.path === ctx.pathname) {
      // Already here — just answer, don't announce the page name.
      return {
        speech: `${dest.blurb} ${dest.followUps[0]}`,
        topic: dest.title,
        navigateTo: undefined,
      };
    }
    // Open the page and speak its info — do NOT say "going to the X page".
    return {
      speech: dest.blurb,
      navigateTo: dest.path,
      topic: dest.title,
    };
  }

  if (intent === "readblog") {
    if (ctx.pathname.includes("/blog") || getBlogContentEl()) {
      return { speech: "Sure, I'll read this article aloud for you now.", startReadAloud: true };
    }
    return { speech: "The read-aloud feature is available on blog articles. Would you like me to open the blog?" };
  }

  if (intent === "summarize") {
    // Comprehensive: cover the whole page, not just a couple of sentences.
    const content = extractPageText(12000);
    let summary = content ? await phrase(`Summarize the "${pageTitle}" page.`, content, "full") : "";
    // Always prefer whichever is more complete — the on-device model sometimes
    // returns just a couple of sentences, which the user flagged as too short.
    const structured = fullPageSummary();
    if (!summary || summary.length < structured.length) summary = structured || summary;
    const follow = here?.followUps[0] ?? "";
    const opener = `Here's the gist of this page. `;
    return {
      speech: `${opener}${summary || here?.blurb || "This page introduces ConverseAI."} ${follow}`.trim(),
      topic: pageTitle,
    };
  }

  if (intent === "deepdive") {
    const content = extractPageText(12000);
    const topic = ctx.lastTopic ?? pageTitle;
    const answer = content
      ? await phrase(`Explain "${topic}" in detail based on this page.`, content, "detailed")
      : here?.blurb ?? "";
    return { speech: answer || here?.blurb || "Let me tell you more.", topic };
  }

  if (intent === "affirmative") {
    // Accept the last offered follow-up.
    if (ctx.lastFollowUp) {
      return respond(ctx.lastFollowUp.replace(/^would you like (to )?(hear|know) (about )?/i, ""), ctx);
    }
    const content = extractPageText(12000);
    const answer = await phrase(`Tell me more about ${ctx.lastTopic ?? pageTitle}.`, content, "detailed");
    return { speech: answer || (here?.followUps[0] ?? "What would you like to explore?"), topic: ctx.lastTopic };
  }

  if (intent === "negative") {
    return { speech: "No problem. Ask me anything else whenever you like." };
  }

  // ── General / informational question — ANSWER in place, never navigate. ─────
  const named = detectEntities(resolved);
  const topicEntity = named.find((e) => e !== "ConverseAI");
  const onArticle = !!getBlogContentEl();

  // Prefer whichever source actually knows about the asked topic. On a marketing
  // page, a keyword-matched destination blurb is a cleaner, more on-topic answer
  // than scraping loosely-related sentences off the current page; on a blog
  // article we answer from the article body itself.
  const dest = matchDestination(resolved);
  let answer = "";

  if (onArticle) {
    const content = extractPageText();
    if (content) answer = await phrase(resolved, content, DEEPDIVE_RE.test(resolved) ? "detailed" : "brief");
  }
  if (!answer || answer.length < 40) {
    // A directly-matched page topic ("what is WhatsApp marketing?") answers from
    // that topic's description — concise and exactly on point.
    if (dest) answer = dest.blurb;
  }
  if (!answer || answer.length < 40) {
    const content = extractPageText();
    if (content) answer = await phrase(resolved, content, DEEPDIVE_RE.test(resolved) ? "detailed" : "brief");
  }
  if (!answer || answer.length < 40) {
    const known = siteKnowledge(resolved);
    if (known) answer = known;
  }
  if (!answer || answer.length < 40) {
    answer =
      here?.blurb ??
      "ConverseAI builds AI agents, chatbots and automation that help businesses talk to their customers across chat, WhatsApp and voice. You can ask me about our services, voice agents, WhatsApp automation, pricing, case studies, or say 'open' followed by a page name.";
  }

  // Natural spoken lead-in for "what is …" style questions so it feels like an
  // explanation, not a page being read out.
  const wantsDefinition = /^\s*(what|who|how)\b/i.test(resolved) && /\b(is|are|does|do|mean)\b/i.test(resolved);
  const subject = dest?.title ?? topicEntity ?? "that";
  const opener = wantsDefinition ? `Okay, let me explain ${subject === "that" ? "that" : subject}. ` : "";

  const follow = here?.followUps[0] ?? "";
  return {
    speech: `${opener}${answer}${follow && Math.random() > 0.5 ? ` ${follow}` : ""}`.trim(),
    topic: topicEntity ?? dest?.title ?? pageTitle,
    entity: topicEntity,
  };
}
