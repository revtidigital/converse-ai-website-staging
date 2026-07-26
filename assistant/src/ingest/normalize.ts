// HTML → clean, chunked, readable text with heading structure preserved.
// Strips scripts/styles/nav/footer boilerplate. Bounded chunk size & overlap;
// never splits mid-sentence unnecessarily.

import { createHash } from "node:crypto";

export interface Chunk {
  content: string;
  headingPath: string; // "H1 › H2"
  index: number;
}

const BLOCK_TAGS = /<\/(p|div|section|article|li|h[1-6]|tr|table|ul|ol|blockquote)>/gi;

function stripHtml(html: string): { text: string; headings: Array<{ level: number; text: string; at: number }> } {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const headings: Array<{ level: number; text: string; at: number }> = [];
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, lvl, inner) => {
    const t = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const marker = `\nH${lvl}:${t}\n`;
    return marker;
  });

  s = s.replace(BLOCK_TAGS, "\n").replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"');
  return { text: s, headings };
}

function sentences(text: string): string[] {
  return text.replace(/[ \t]+/g, " ").split(/(?<=[.!?।])\s+/).map((x) => x.trim()).filter(Boolean);
}

export interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

/** Normalise raw HTML (or plain text) into semantic chunks with heading paths. */
export function normalizeToChunks(raw: string, opts: ChunkOptions = {}): Chunk[] {
  const maxChars = opts.maxChars ?? 900;
  const overlap = opts.overlapChars ?? 150;
  const { text } = stripHtml(raw);

  // Split into blocks separated by our heading markers, tracking heading path.
  const parts = text.split("\n");
  const chunks: Chunk[] = [];
  let hPath: string[] = [];
  let buf = "";
  let idx = 0;

  const flush = () => {
    const body = buf.replace(/\n{2,}/g, "\n").replace(/[ \t]+/g, " ").trim();
    if (body.length < 30) { buf = ""; return; }
    for (const s of packSentences(body, maxChars, overlap)) {
      chunks.push({ content: s, headingPath: hPath.join(" › "), index: idx++ });
    }
    buf = "";
  };

  for (const part of parts) {
    const hm = part.match(/^H([1-6]):(.*)$/s);
    if (hm) {
      flush();
      const level = Number(hm[1]);
      hPath = hPath.slice(0, level - 1);
      hPath[level - 1] = hm[2].trim();
      hPath = hPath.filter(Boolean);
      buf += hm[2].trim() + ". ";
    } else {
      buf += " " + part;
      if (buf.length > maxChars * 1.5) flush();
    }
  }
  flush();
  return chunks;
}

function packSentences(text: string, maxChars: number, overlap: number): string[] {
  const sents = sentences(text);
  const out: string[] = [];
  let cur = "";
  for (const s of sents) {
    if (cur.length + s.length + 1 > maxChars && cur.length > 0) {
      out.push(cur.trim());
      const tail = cur.slice(-overlap);
      cur = tail + " " + s;
    } else {
      cur += " " + s;
    }
  }
  if (cur.trim().length >= 30) out.push(cur.trim());
  return out.length ? out : [text.slice(0, maxChars)];
}

export function contentHash(s: string): string {
  return createHash("sha256").update(s.replace(/\s+/g, " ").trim()).digest("hex");
}
