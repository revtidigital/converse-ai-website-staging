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

export async function fetchPageAnswer(path: string, query: string): Promise<string | null> {
  const doc = await loadDoc(path);
  if (!doc) return null;

  const root = doc.querySelector("main") || doc.body;
  const blocks = Array.from(root.querySelectorAll("h1, h2, h3, p, li"));
  const queryWords = new Set(keywordsOf(query));

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
