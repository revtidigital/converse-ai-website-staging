// Reads the current page's own visible content so the voice agent can
// summarize / answer questions about it — entirely in the browser, no cost.

/** Selector matching any blog article body across the two blog templates. */
export const BLOG_CONTENT_SELECTOR = ".wp-post-content, .blogpost-content";

export function getBlogContentEl(): HTMLElement | null {
  return document.querySelector(BLOG_CONTENT_SELECTOR) as HTMLElement | null;
}

/** Return the page title, best-effort. */
export function getPageTitle(): string {
  const h1 = document.querySelector("h1");
  if (h1?.textContent?.trim()) return h1.textContent.trim();
  const og = document.querySelector('meta[property="og:title"]');
  const c = og?.getAttribute("content");
  if (c) return c.replace(/\|.*/, "").trim();
  return document.title.replace(/\|.*/, "").trim();
}

const SKIP_SELECTORS = [
  "header",
  "nav",
  "footer",
  "script",
  "style",
  "noscript",
  "[data-voice-agent]", // the agent's own UI
];

/**
 * Extract the main readable text of the page as clean paragraphs.
 * Prefers an <article> / <main> / blog content container, else the body.
 */
export function extractPageText(maxChars = 6000): string {
  const root =
    getBlogContentEl() ||
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  if (!root) return "";

  const clone = root.cloneNode(true) as HTMLElement;
  SKIP_SELECTORS.forEach((sel) =>
    clone.querySelectorAll(sel).forEach((el) => el.remove())
  );

  const text = (clone.innerText || clone.textContent || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return text.slice(0, maxChars);
}

/** Split extracted text into sentence-ish chunks. */
export function toSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 400);
}

const NAV_FILLER = /\b(tell me about|about|open|go to|take me( to)?|show me|read|the|a|an|blog|post|article|please|on|for)\b/gi;

/** Normalise a phrase to comparable content words. */
function contentWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(NAV_FILLER, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export interface BlogLinkMatch {
  href: string;
  title: string;
  score: number;
  /** Combined ranking weight (higher = stronger, more exact match). */
  weight: number;
}

/**
 * When the user names a blog article by (part of) its title, find the matching
 * link on the current page (e.g. the blog listing) so we can navigate straight
 * to it instead of misfiring to some marketing page.
 */
export function matchBlogArticle(phrase: string): BlogLinkMatch | null {
  const want = contentWords(phrase);
  if (!want.length) return null;

  const anchors = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];
  let best: BlogLinkMatch | null = null;

  for (const a of anchors) {
    const href = a.href;
    if (!href || a.closest("header, nav, footer, [data-voice-agent]")) continue;
    // Blog article links: same-origin (or blog host) with a slug-like path and
    // no extra query/hash. Skip obvious non-article routes.
    let path = "";
    try {
      path = new URL(href).pathname;
    } catch {
      continue;
    }
    if (/#/.test(a.getAttribute("href") || "")) continue;
    const slug = path.replace(/^\/(blog\/)?/, "").replace(/\/$/, "");
    if (slug.length < 6 || slug.includes("/")) continue;
    if (/^(services|about-us|contact-us|case-studies|book-demo|solutions|teams|chatbot|live-chat|omni-channel|whatsapp|admin|privacy|terms)$/i.test(slug)) continue;

    const title = (a.innerText || a.textContent || "").trim();
    const haystack = `${title} ${slug.replace(/-/g, " ")}`.toLowerCase();
    const linkWords = contentWords(haystack);
    const linkSet = new Set(linkWords);

    // How many of the requested words this link contains…
    let score = 0;
    for (const w of want) if (haystack.includes(w)) score += 1;
    const coverWanted = score / want.length; // did we cover what the user said?
    // …and how focused the link is on exactly those words (guards against a
    // comparison article that merely name-drops the competitor in passing).
    const coverLink = linkSet.size ? [...linkSet].filter((w) => want.includes(w)).length / linkSet.size : 0;
    // Bonus when the requested phrase appears as a contiguous run in the title.
    const phrase = want.join(" ");
    const contiguous = haystack.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").includes(phrase) ? 0.5 : 0;
    // Strong bonus when the article's own subject LEADS with the requested term
    // — this is what separates the "Decagon Alternative" post from a "Sierra
    // Alternative" post that merely name-drops Decagon in its comparison.
    const lead = want[0] && (slug.startsWith(want[0]) || linkWords[0] === want[0]) ? 1 : 0;

    // Weight favours BOTH covering the request and being about it — so
    // "decagon ai alternative" picks the Decagon post, not a Sierra post that
    // only mentions Decagon once.
    const weight = coverWanted * 2 + coverLink + contiguous + lead;

    // Require a solid overlap so we don't jump to a loosely-related post.
    if (score >= 2 && coverWanted >= 0.5 && (!best || weight > best.weight)) {
      best = { href, title: title || slug.replace(/-/g, " "), score, weight };
    }
  }
  return best;
}

/** Read a blog article's clean plain text for read-aloud narration. */
export function extractBlogText(): { title: string; body: string } {
  const title = getPageTitle();
  const container = getBlogContentEl();
  const body = container
    ? (container.innerText || container.textContent || "").replace(/\n{2,}/g, "\n").trim()
    : "";
  return { title, body };
}
