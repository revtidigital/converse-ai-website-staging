// Builds an ordered list of speakable text chunks from a blog post's HTML body,
// including a dedicated per-row reading for <table> elements (plain textContent
// on a table reads cells out of order with no column context).

const ABBREVIATIONS: [RegExp, string][] = [
  [/\be\.g\.,?/gi, "for example"],
  [/\bi\.e\.,?/gi, "that is"],
  [/\betc\.(?=\s|$)/gi, "et cetera"],
  [/\bvs\.(?=\s|$)/gi, "versus"],
  [/\bapprox\.(?=\s|$)/gi, "approximately"],
  [/&/g, " and "],
];

function normalizeForSpeech(raw: string): string {
  let text = raw.replace(/\s+/g, " ").trim();
  if (!text) return text;
  for (const [pattern, replacement] of ABBREVIATIONS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/(\d)%/g, "$1 percent");
  text = text.replace(/\s+/g, " ").trim();
  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}

function cellText(cell: Element): string {
  return (cell.textContent || "").replace(/\s+/g, " ").trim();
}

function tableToChunks(table: HTMLTableElement): string[] {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return [];

  const headerRow = rows[0];
  const headerCells = Array.from(headerRow.querySelectorAll("th, td")).map(cellText);
  const bodyRows = rows.slice(1);

  const chunks: string[] = [normalizeForSpeech("The following table has " + bodyRows.length + " rows.")];

  bodyRows.forEach((row, rowIdx) => {
    const cells = Array.from(row.querySelectorAll("td, th")).map(cellText);
    if (cells.every((c) => !c)) return;

    const parts: string[] = [];
    const subject = cells[0] || `Row ${rowIdx + 1}`;
    for (let i = 1; i < cells.length; i++) {
      const header = headerCells[i] || `column ${i + 1}`;
      const value = cells[i] || "not specified";
      parts.push(`${header} is ${value}`);
    }
    const sentence = parts.length
      ? `For ${subject}, ${parts.join(", ")}.`
      : `${subject}.`;
    chunks.push(normalizeForSpeech(sentence));
  });

  return chunks;
}

const SKIP_IF_NESTED_IN = "li, blockquote, td, th";
const BLOCK_SELECTOR = "h1, h2, h3, h4, h5, h6, p, li, blockquote, table";

export function htmlToReadingChunks(title: string, html: string): string[] {
  const chunks: string[] = [];

  if (typeof window === "undefined" || !html) {
    if (title.trim()) chunks.push(normalizeForSpeech(title));
    return chunks;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = Array.from(doc.body.querySelectorAll(BLOCK_SELECTOR));

  // Read whatever heading already exists in the blog content itself — do not
  // also inject the post title as a separate chunk, or the heading gets read twice.
  const hasHeadingInContent = blocks.some((el) => /^h[1-6]$/.test(el.tagName.toLowerCase()));
  if (!hasHeadingInContent && title.trim()) chunks.push(normalizeForSpeech(title));

  for (const el of blocks) {
    const tag = el.tagName.toLowerCase();

    if (tag === "table") {
      chunks.push(...tableToChunks(el as HTMLTableElement));
      continue;
    }

    // A <p> or similar living inside an li/blockquote/table cell is already
    // covered by that ancestor's own text — skip it to avoid double-reading.
    if (tag === "p" && el.closest(SKIP_IF_NESTED_IN)) continue;

    const text = (el.textContent || "").trim();
    if (!text) continue;

    chunks.push(normalizeForSpeech(text));
  }

  return chunks.filter(Boolean);
}

export function faqsToReadingChunks(faqs: { question: string; answer: string }[]): string[] {
  const chunks: string[] = [];
  if (!faqs || faqs.length === 0) return chunks;
  chunks.push(normalizeForSpeech("Frequently asked questions."));
  for (const faq of faqs) {
    const q = (new DOMParser().parseFromString(faq.question, "text/html").body.textContent || "").trim();
    const a = (new DOMParser().parseFromString(faq.answer, "text/html").body.textContent || "").trim();
    if (q) chunks.push(normalizeForSpeech(`Question: ${q}`));
    if (a) chunks.push(normalizeForSpeech(`Answer: ${a}`));
  }
  return chunks;
}
