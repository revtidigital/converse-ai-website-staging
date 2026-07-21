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
import { extractPageText, getPageTitle, toSentences, getBlogContentEl } from "./pageContent";

export type IntentKind =
  | "navigate"
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
  /** Optional route to navigate to. */
  navigateTo?: string;
  /** Whether the caller should trigger blog read-aloud. */
  startReadAloud?: boolean;
  /** Whether the agent should stop / close. */
  stop?: boolean;
  /** Topic the answer was about, for multi-turn context. */
  topic?: string;
}

// ── Intent detection ────────────────────────────────────────────────────────

const SUMMARY_RE = /\b(summar|overview|quick (look|rundown)|key (points|takeaways|takeaway)|main points|what.?s (this|the) page|tl;?dr)\b/i;
const DEEPDIVE_RE = /\b(tell me more|more detail|in detail|explain (in )?(detail|more|everything)|complete information|go deeper|elaborate|full (info|information))\b/i;
const READ_RE = /\b(read (this|the|it)? ?(article|blog|post|aloud|out loud)|listen to (this|the)|narrate)\b/i;
const NAV_RE = /\b(open|go to|take me|show me|navigate|visit|bring up|i want to (know|see|learn) about|tell me about)\b/i;
const STOP_RE = /\b(stop|be quiet|shut up|cancel|never mind|end (the )?(conversation|chat)|goodbye|bye|that.?s all|exit|close)\b/i;
const GREET_RE = /^\s*(hi|hello|hey|hii+|yo|namaste|good (morning|afternoon|evening))\b/i;
const YES_RE = /^\s*(yes|yeah|yep|yup|sure|okay|ok|please do|go ahead|sounds good|do it)\b/i;
const NO_RE = /^\s*(no|nope|nah|not now|no thanks?)\b/i;

export function detectIntent(text: string): IntentKind {
  const t = text.trim();
  const low = t.toLowerCase();
  const mentionsPricing = PRICING_ALIASES.some((a) => low.includes(a));
  if (STOP_RE.test(t)) return "stop";
  if (READ_RE.test(t)) return "readblog";
  if (SUMMARY_RE.test(t)) return "summarize";
  if (DEEPDIVE_RE.test(t)) return "deepdive";
  if (NAV_RE.test(t) && (matchDestination(t) || mentionsPricing)) return "navigate";
  if (GREET_RE.test(t) && t.split(/\s+/).length <= 3) return "greeting";
  if (YES_RE.test(t)) return "affirmative";
  if (NO_RE.test(t)) return "negative";
  // Bare page name ("pricing", "voice agents") counts as navigate.
  if ((matchDestination(t) || mentionsPricing) && t.split(/\s+/).length <= 4) return "navigate";
  return "question";
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
  const counts: Record<AnswerMode, number> = { brief: 5, detailed: 12, full: 24 };
  return extractiveAnswer(question, context, counts[mode]);
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
  // Keep it comprehensive but bounded so narration stays reasonable.
  return parts.slice(0, 60).join(" ");
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function respond(
  text: string,
  ctx: { pathname: string; lastTopic?: string; lastFollowUp?: string }
): Promise<AgentResult> {
  const intent = detectIntent(text);
  const here = destinationForPath(ctx.pathname);
  const pageTitle = getPageTitle();

  if (intent === "stop") {
    return { speech: "Okay, ending the conversation. Just tap the mic whenever you need me.", stop: true };
  }

  if (intent === "greeting") {
    return { speech: "Hi! Welcome to ConverseAI. What would you like to know?" };
  }

  if (intent === "navigate") {
    // Pricing has no dedicated destination alias set; handle explicitly.
    if (PRICING_ALIASES.some((a) => text.toLowerCase().includes(a))) {
      return {
        speech:
          "Pricing is tailored to each business. Let me take you to our services, and you can book a demo for a custom quote.",
        navigateTo: "/services",
        topic: "pricing",
      };
    }
    const dest = matchDestination(text) as VoiceDestination;
    if (dest.path === ctx.pathname) {
      return {
        speech: `You're already on the ${dest.title} page. ${dest.followUps[0]}`,
        topic: dest.title,
        navigateTo: undefined,
      };
    }
    return {
      speech: `Sure, taking you to ${dest.title}. ${dest.blurb}`,
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
    const opener = `Here's a full overview of the ${pageTitle} page. `;
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

  // General question — answer from page content, then offer a follow-up.
  const content = extractPageText();
  let answer = "";
  if (content) {
    answer = await phrase(text, content, DEEPDIVE_RE.test(text) ? "detailed" : "brief");
  }
  if (!answer) {
    // Maybe the question is about another page — steer there.
    const dest = matchDestination(text);
    if (dest) {
      return {
        speech: `${dest.blurb} Would you like me to open the ${dest.title} page?`,
        topic: dest.title,
      };
    }
    answer =
      here?.blurb ??
      "I can help you explore this website by voice. Try asking me to summarize this page, or to open a page like pricing or voice agents.";
  }
  const follow = here?.followUps[0] ?? "";
  return {
    speech: follow && Math.random() > 0.4 ? `${answer} ${follow}` : answer,
    topic: pageTitle,
  };
}
