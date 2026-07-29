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

  let best: { text: string; score: number } | null = null;
  let firstGoodParagraph: string | null = null;

  for (const el of blocks) {
    const text = cleanText(el.textContent || "");
    if (text.length < 30 || text.length > 500) continue;

    if (!firstGoodParagraph && el.tagName.toLowerCase() === "p") {
      firstGoodParagraph = text;
    }

    if (queryWords.size === 0) continue;
    const score = keywordsOf(text).reduce((acc, w) => acc + (queryWords.has(w) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { text, score };
  }

  const chosen = best?.text ?? firstGoodParagraph;
  return chosen ? (/[.!?]$/.test(chosen) ? chosen : `${chosen}.`) : null;
}
