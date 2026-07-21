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

/** Read a blog article's clean plain text for read-aloud narration. */
export function extractBlogText(): { title: string; body: string } {
  const title = getPageTitle();
  const container = getBlogContentEl();
  const body = container
    ? (container.innerText || container.textContent || "").replace(/\n{2,}/g, "\n").trim()
    : "";
  return { title, body };
}
