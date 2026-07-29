// Reads the real, live text of a page and picks the passage most relevant
// to the spoken question — no canned copy, no LLM. Pages are prerendered
// static HTML (see scripts/prerender.mjs), so a same-origin fetch of the
// route returns real content, not just the SPA shell.

const docCache = new Map<string, Document | null>();

async function loadDoc(path: string): Promise<Document | null> {
  if (docCache.has(path)) return docCache.get(path) ?? null;
  try {
    const res = await fetch(path, { headers: { Accept: "text/html" } });
    if (!res.ok) {
      docCache.set(path, null);
      return null;
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    docCache.set(path, doc);
    return doc;
  } catch {
    docCache.set(path, null);
    return null;
  }
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "of", "for", "to",
  "and", "or", "in", "on", "with", "what", "how", "tell", "me", "about", "your",
  "you", "do", "does", "can", "i", "we", "our", "it", "this", "that", "us",
]);

function keywordsOf(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g)?.filter((w) => w.length > 2 && !STOPWORDS.has(w)) ?? [];
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// A generic query ("services", "pricing") is really asking for the named
// list under a matching heading, not a single sentence about it — a page's
// section (e.g. "Our services") followed by a grid of h3-titled cards is a
// much better spoken answer than any one card's prose. Look for a heading
// that matches the query and, if its section has multiple h3 sub-items,
// read the heading + intro + item names instead of falling through to
// paragraph scoring.
function findSectionListAnswer(root: Element, queryWords: Set<string>): string | null {
  const headings = Array.from(root.querySelectorAll("h1, h2"));
  for (const heading of headings) {
    const headingText = cleanText(heading.textContent || "");
    const headingWords = keywordsOf(headingText);
    if (headingWords.length === 0) continue;
    if (!headingWords.some((w) => queryWords.has(w))) continue;

    const section = heading.closest("section") || heading.parentElement;
    if (!section) continue;

    const items = Array.from(section.querySelectorAll("h3"))
      .map((el) => cleanText(el.textContent || ""))
      .filter((t) => t.length > 0 && t.length < 80);
    if (items.length < 2) continue;

    const intro = Array.from(section.querySelectorAll("p"))
      .map((el) => cleanText(el.textContent || ""))
      .find((t) => t.length >= 20 && t.length <= 200);

    const list =
      items.length > 1
        ? `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
        : items[0];

    const parts = [headingText, intro].filter(Boolean).map((t) => t!.replace(/[.!?]+$/, ""));
    parts.push(`They include: ${list}.`);
    return parts.join(". ");
  }
  return null;
}

export async function fetchPageAnswer(path: string, query: string): Promise<string | null> {
  const doc = await loadDoc(path);
  if (!doc) return null;

  const root = doc.querySelector("main") || doc.body;
  const queryWords = new Set(keywordsOf(query));

  const sectionAnswer = findSectionListAnswer(root, queryWords);
  if (sectionAnswer) return sectionAnswer;

  const blocks = Array.from(root.querySelectorAll("h1, h2, h3, p, li"));

  // Headings and short CTA lines ("Ready to be our next success story?") are
  // punchy taglines, not descriptions — they can accidentally out-score a
  // real explanatory paragraph just by reusing the question's words. Require
  // a meatier minimum length and give <p> a tie-break bonus so an actual
  // description wins over a slogan when scores are close.
  const MIN_LENGTH = 50;
  let best: { text: string; score: number } | null = null;
  let firstGoodParagraph: string | null = null;

  for (const el of blocks) {
    const text = cleanText(el.textContent || "");
    const tag = el.tagName.toLowerCase();
    if (text.length < MIN_LENGTH || text.length > 500) continue;

    if (!firstGoodParagraph && tag === "p") {
      firstGoodParagraph = text;
    }

    if (queryWords.size === 0) continue;
    const matchCount = keywordsOf(text).reduce((acc, w) => acc + (queryWords.has(w) ? 1 : 0), 0);
    if (matchCount === 0) continue;

    const tagBonus = tag === "p" ? 0.5 : tag === "li" ? 0.25 : 0;
    const lengthBonus = Math.min(text.length / 400, 0.5); // mild preference for a fuller description
    // Enumeration-style passages ("strategy audits, custom agents, voice AI, ...")
    // are what a one-word question like "services" or "pricing" actually wants.
    // Without this, a short fluffy paragraph that happens to repeat the query
    // word more often (e.g. "services" used twice in a tools-vs-services aside)
    // can outscore the real answer that names each item just once.
    const commaCount = (text.match(/,/g) || []).length;
    const enumerationBonus = Math.min(commaCount * 0.15, 0.9);
    const score = matchCount + tagBonus + lengthBonus + enumerationBonus;
    if (!best || score > best.score) best = { text, score };
  }

  const chosen = best?.text ?? firstGoodParagraph;
  return chosen ? (/[.!?]$/.test(chosen) ? chosen : `${chosen}.`) : null;
}
