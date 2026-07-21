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
      const avail = w.LanguageModel.availability ? await w.LanguageModel.availability() : "available";
      if (avail === "unavailable") return null;
      return await w.LanguageModel.create({
        initialPrompts: [
          {
            role: "system",
            content:
              "You are ConverseAI's friendly voice assistant. Answer in a warm, natural, spoken style. Keep answers to 2-4 short sentences unless asked for detail. Base answers only on the provided page context.",
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

async function phrase(question: string, context: string, detailed: boolean): Promise<string> {
  const session = await localSession();
  if (session) {
    try {
      const ask = detailed
        ? "Give a thorough but conversational spoken answer (about 5-7 sentences)."
        : "Give a concise, conversational spoken answer (2-4 sentences).";
      const out = await session.prompt(
        `${ask}\n\nUser question: ${question}\n\nPage context:\n${context.slice(0, 4000)}`
      );
      if (out && out.trim().length > 10) return out.trim();
    } catch {
      /* fall through */
    }
  }
  return extractiveAnswer(question, context, detailed ? 6 : 3);
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
    const hint = here?.followUps[0] ?? "Ask me anything about this page, or say 'summarize this page'.";
    return { speech: `Hi! I'm the ConverseAI voice assistant. ${hint}` };
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
    const content = extractPageText();
    const summary = content
      ? await phrase(`Summarize the "${pageTitle}" page for a first-time visitor.`, content, false)
      : here?.blurb ?? "";
    const follow = here?.followUps[0] ?? "";
    return {
      speech: `${summary || here?.blurb || "Here's the key idea of this page."} ${follow}`.trim(),
      topic: pageTitle,
    };
  }

  if (intent === "deepdive") {
    const content = extractPageText();
    const topic = ctx.lastTopic ?? pageTitle;
    const answer = content
      ? await phrase(`Explain "${topic}" in detail based on this page.`, content, true)
      : here?.blurb ?? "";
    return { speech: answer || here?.blurb || "Let me tell you more.", topic };
  }

  if (intent === "affirmative") {
    // Accept the last offered follow-up.
    if (ctx.lastFollowUp) {
      return respond(ctx.lastFollowUp.replace(/^would you like (to )?(hear|know) (about )?/i, ""), ctx);
    }
    const content = extractPageText();
    const answer = await phrase(`Tell me more about ${ctx.lastTopic ?? pageTitle}.`, content, true);
    return { speech: answer || (here?.followUps[0] ?? "What would you like to explore?"), topic: ctx.lastTopic };
  }

  if (intent === "negative") {
    return { speech: "No problem. Ask me anything else whenever you like." };
  }

  // General question — answer from page content, then offer a follow-up.
  const content = extractPageText();
  let answer = "";
  if (content) {
    answer = await phrase(text, content, DEEPDIVE_RE.test(text));
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
