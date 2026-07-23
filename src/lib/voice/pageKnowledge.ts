export type KnowledgeKind = "title" | "heading" | "paragraph" | "list" | "table" | "faq" | "card" | "link" | "form" | "image" | "metadata";

export interface PageKnowledgeSection {
  id: string;
  kind: KnowledgeKind;
  headingPath: string[];
  text: string;
  route: string;
  weight: number;
}

export interface PageKnowledge {
  route: string;
  title: string;
  extractedAt: number;
  signature: string;
  sections: PageKnowledgeSection[];
}

const SKIP = "header, nav, footer, script, style, noscript, [hidden], [aria-hidden='true'], [data-voice-agent], .sr-only";
const cache = new Map<string, PageKnowledge>();

function visible(el: Element): boolean {
  const h = el as HTMLElement;
  if (h.closest(SKIP)) return false;
  let current: HTMLElement | null = h;
  while (current && current !== document.body) {
    const style = window.getComputedStyle?.(current);
    if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) return false;
    current = current.parentElement;
  }
  const rects = h.getClientRects?.();
  return !rects || rects.length > 0 || ["META", "TITLE"].includes(el.tagName) || (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent));
}

function clean(text = ""): string {
  return text.replace(/\s+/g, " ").trim();
}

function title(): string {
  const h1 = document.querySelector("h1");
  const h = h1 && visible(h1) ? clean(h1.textContent || "") : "";
  if (h) return h;
  return clean(document.title.replace(/\|.*/, ""));
}

function root(): HTMLElement {
  return (document.querySelector(".wp-post-content, .blogpost-content") || document.querySelector("article") || document.querySelector("main") || document.body) as HTMLElement;
}

function signatureFor(r: HTMLElement) {
  return `${location.pathname}:${clean(r.innerText || r.textContent || "").slice(0, 4000).length}:${document.querySelectorAll("main *, article *").length}`;
}

function pushUnique(out: PageKnowledgeSection[], seen: Set<string>, item: Omit<PageKnowledgeSection, "id" | "route">, route: string) {
  const text = clean(item.text);
  const key = text.toLowerCase();
  if (text.length < 3 || seen.has(key)) return;
  seen.add(key);
  out.push({ ...item, text, route, id: `sec-${out.length}` });
}

export function extractPageKnowledge(route = location.pathname, force = false): PageKnowledge {
  const r = root();
  const sig = signatureFor(r);
  const cached = cache.get(route);
  if (!force && cached?.signature === sig) return cached;

  const sections: PageKnowledgeSection[] = [];
  const seen = new Set<string>();
  const headings: string[] = [];
  pushUnique(sections, seen, { kind: "title", headingPath: [], text: title(), weight: 5 }, route);

  r.querySelectorAll("h1,h2,h3,h4,p,li,dt,dd,figcaption,blockquote,button,a[href],label,input,textarea,select,table,img").forEach((node) => {
    const el = node as HTMLElement;
    if (!visible(el)) return;
    const tag = el.tagName.toLowerCase();
    if (/h[1-4]/.test(tag)) {
      const level = Number(tag[1]);
      headings[level - 1] = clean(el.textContent || "");
      headings.length = level;
      pushUnique(sections, seen, { kind: "heading", headingPath: headings.slice(0, -1), text: headings[level - 1], weight: 4 }, route);
      return;
    }
    if (tag === "img") {
      const alt = clean((el as HTMLImageElement).alt || "");
      if (alt && !/decorative|background/i.test(alt)) pushUnique(sections, seen, { kind: "image", headingPath: [...headings], text: alt, weight: 1 }, route);
      return;
    }
    if (["input", "textarea", "select"].includes(tag)) {
      const field = el as HTMLInputElement;
      const label = clean(field.labels?.[0]?.textContent || field.getAttribute("aria-label") || field.getAttribute("placeholder") || "");
      if (label) pushUnique(sections, seen, { kind: "form", headingPath: [...headings], text: `Form field: ${label}`, weight: 3 }, route);
      return;
    }
    const txt = clean(el.innerText || el.textContent || "");
    if (!txt || txt.length > 900) return;
    const kind: KnowledgeKind = tag === "li" ? "list" : tag === "table" ? "table" : tag === "a" || tag === "button" ? "link" : /question|answer|faq/i.test(el.className) ? "faq" : "paragraph";
    const weight = kind === "paragraph" ? 3 : kind === "list" || kind === "table" || kind === "faq" ? 3.5 : 1.5;
    pushUnique(sections, seen, { kind, headingPath: [...headings], text: txt, weight }, route);
  });

  const meta = clean(document.querySelector("meta[name='description']")?.getAttribute("content") || "");
  if (meta) pushUnique(sections, seen, { kind: "metadata", headingPath: [], text: meta, weight: 0.25 }, route);

  const knowledge = { route, title: title(), extractedAt: Date.now(), signature: sig, sections };
  cache.set(route, knowledge);
  return knowledge;
}

const STOP = new Set("the a an is are was were of to and in on for with that this it as at by be or from what how who why tell me about does do can you your our we i want know compare second one previous option".split(" "));
function words(s: string) { return clean(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)); }

export function retrievePageSections(question: string, knowledge = extractPageKnowledge(), limit = 5): PageKnowledgeSection[] {
  const q = words(question);
  if (!q.length) return knowledge.sections.filter(s => s.kind !== "metadata").slice(0, limit);
  return knowledge.sections.map((s, i) => {
    const hay = `${s.headingPath.join(" ")} ${s.text}`.toLowerCase();
    const score = q.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) * s.weight - (s.kind === "metadata" ? 3 : 0);
    return { s, score, i };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score || a.i - b.i).slice(0, limit).map(x => x.s);
}

export function invalidatePageKnowledge(route?: string) {
  if (route) cache.delete(route);
  else cache.clear();
}
export function pageKnowledgeCacheSize() { return cache.size; }
