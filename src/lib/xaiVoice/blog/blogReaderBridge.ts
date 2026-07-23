import type { BlogArticleInput, BlogChunk, BlogReadingState, BlogReaderStatus, BlogSection } from "./types";

const MAX_CHUNK_CHARS = 900;
const MAX_SECTIONS = 40;
const WORDS_PER_MINUTE = 180;

type Article = BlogArticleInput & { sections: BlogSection[]; chunks: Omit<BlogChunk, "narrationGeneration" | "progressBeforePlayback">[] };
type Reader = { article: Article; status: BlogReaderStatus; currentChunkIndex: number; completed: Set<string>; generation: number; registeredRoute: string };

let reader: Reader | null = null;

function normalizeText(text: string) { return text.replace(/\s+/g, " ").trim(); }
function slugify(value: string, fallback: string) { const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70); return slug || fallback; }
function estimateSeconds(text: string) { return Math.max(5, Math.ceil((text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE) * 60)); }
function pushChunk(chunks: Omit<BlogChunk, "narrationGeneration" | "progressBeforePlayback">[], articleId: string, sectionId: string, heading: string, parts: string[], first: boolean) {
  const narrationText = normalizeText(`${first ? `${heading}. ` : ""}${parts.join(" ")}`);
  if (!narrationText) return;
  chunks.push({ articleId, chunkId: `${sectionId}-chunk-${chunks.filter((c) => c.sectionId === sectionId).length + 1}`, sectionId, sectionHeading: first ? heading : undefined, narrationText, chunkNumber: chunks.length + 1, totalChunkCount: 0, finalChunk: false });
}
function chunkSection(articleId: string, section: BlogSection) {
  const chunks: Omit<BlogChunk, "narrationGeneration" | "progressBeforePlayback">[] = [];
  let parts: string[] = []; let length = 0; let first = true;
  for (const block of section.textBlocks) {
    const sentences = block.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(normalizeText).filter(Boolean) ?? [block];
    for (const sentence of sentences) {
      if (length && length + sentence.length + 1 > MAX_CHUNK_CHARS) { pushChunk(chunks, articleId, section.sectionId, section.heading, parts, first); first = false; parts = []; length = 0; }
      if (sentence.length > MAX_CHUNK_CHARS) {
        const words = sentence.split(/\s+/); let current: string[] = [];
        for (const word of words) {
          if (current.join(" ").length + word.length + 1 > MAX_CHUNK_CHARS) { pushChunk(chunks, articleId, section.sectionId, section.heading, current, first); first = false; current = []; }
          current.push(word);
        }
        if (current.length) { parts.push(current.join(" ")); length += current.join(" ").length + 1; }
      } else { parts.push(sentence); length += sentence.length + 1; }
    }
  }
  if (parts.length) pushChunk(chunks, articleId, section.sectionId, section.heading, parts, first);
  return chunks;
}

export function extractReadableBlogArticle(input: BlogArticleInput): Article | null {
  if (!input.contentHtml || input.contentHtml.trim().length < 20) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(input.contentHtml, "text/html");
  doc.querySelectorAll("script,style,nav,footer,header,iframe,form,.xai-voice-orb,.whatsapp,.chatbot,.related-post,.wp-related-reading,.further-reading,#further-reading-section,[aria-hidden='true']").forEach((node) => node.remove());
  const sections: BlogSection[] = [];
  let current: BlogSection = { sectionId: "intro", heading: input.title, order: 0, textBlocks: [], estimatedDurationSeconds: 0 };
  const commit = () => { if (current.textBlocks.length && sections.length < MAX_SECTIONS) { current.estimatedDurationSeconds = estimateSeconds(current.textBlocks.join(" ")); sections.push(current); } };
  Array.from(doc.body.querySelectorAll("h1,h2,h3,p,li,blockquote,img")).forEach((node) => {
    const tag = node.tagName.toLowerCase();
    if (/^h[1-3]$/.test(tag)) { commit(); const heading = normalizeText(node.textContent ?? ""); current = { sectionId: slugify(heading, `section-${sections.length + 1}`), heading, order: sections.length, textBlocks: [], estimatedDurationSeconds: 0 }; return; }
    if (tag === "img") { const alt = normalizeText((node as HTMLImageElement).alt || ""); if (alt && alt.length > 8) current.textBlocks.push(`Image: ${alt.slice(0, 180)}`); return; }
    const text = normalizeText(node.textContent ?? "");
    if (text.length > 24) current.textBlocks.push(text.slice(0, 1200));
  });
  commit();
  if (!sections.length) return null;
  const article: Article = { ...input, id: input.id.slice(0, 80), sections } as Article;
  const chunks = sections.flatMap((section) => chunkSection(article.id, section));
  chunks.forEach((chunk, index) => { chunk.chunkNumber = index + 1; chunk.totalChunkCount = chunks.length; chunk.finalChunk = index === chunks.length - 1; });
  article.chunks = chunks;
  return article.chunks.length ? article : null;
}

export function registerBlogReaderBridge(input: BlogArticleInput) {
  const article = extractReadableBlogArticle(input);
  if (!article) { reader = null; return false; }
  reader = { article, status: "idle", currentChunkIndex: 0, completed: new Set(), generation: 1, registeredRoute: input.route };
  return true;
}
export function unregisterBlogReaderBridge(route?: string) { if (!route || reader?.registeredRoute === route) reader = null; }
function unavailable(reason = "No readable published blog article is mounted.") { return { ok: false as const, error: { code: "blog_unavailable", message: reason } }; }
function active(route?: string) { if (!reader) return null; if (route && reader.registeredRoute !== route) return null; return reader; }
function chunkWithProgress(r: Reader, index = r.currentChunkIndex): BlogChunk {
  const c = r.article.chunks[index];
  return { ...c, narrationGeneration: r.generation, progressBeforePlayback: Math.round((r.completed.size / r.article.chunks.length) * 100) };
}
export function getBlogReadingInfo(route?: string) { const r = active(route); if (!r) return { readable: false, unavailableReason: "No readable published blog article is mounted." }; return { readable: true, publicRoute: r.article.route, title: r.article.title, description: r.article.description ?? "", sectionCount: r.article.sections.length, estimatedReadingTime: r.article.estimatedReadingTime ?? `${Math.ceil(r.article.sections.reduce((s, x) => s + x.estimatedDurationSeconds, 0) / 60)} min read`, currentSection: r.article.chunks[r.currentChunkIndex]?.sectionId ?? null, progressPercentage: Math.round((r.completed.size / r.article.chunks.length) * 100), readerState: r.status }; }
export function listBlogSections(route?: string) { const r = active(route); if (!r) return unavailable(); return { ok: true as const, data: { sections: r.article.sections.map((s) => ({ sectionId: s.sectionId, heading: s.heading, order: s.order, estimatedDuration: s.estimatedDurationSeconds, completed: r.article.chunks.filter((c) => c.sectionId === s.sectionId).every((c) => r.completed.has(c.chunkId)), current: r.article.chunks[r.currentChunkIndex]?.sectionId === s.sectionId })) } }; }
function findSectionIndex(r: Reader, sectionId?: string, sectionName?: string) { if (sectionId) return r.article.chunks.findIndex((c) => c.sectionId === sectionId); if (sectionName) { const q = normalizeText(sectionName).toLowerCase(); const matches = r.article.sections.filter((s) => s.heading.toLowerCase().includes(q)); if (matches.length === 1) return r.article.chunks.findIndex((c) => c.sectionId === matches[0].sectionId); if (matches.length > 1) return -2; } return -1; }
export function startBlogReading(args: { startMode?: "beginning" | "current-section" | "named-section"; sectionId?: string }, route?: string) { const r = active(route); if (!r) return unavailable(); let index = args.startMode === "current-section" ? r.currentChunkIndex : 0; if (args.startMode === "named-section") { index = findSectionIndex(r, args.sectionId); if (index < 0) return { ok: false as const, error: { code: "section_not_found", message: "That blog section is not available." } }; } r.status = "reading"; r.generation += 1; r.currentChunkIndex = index; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function getNextBlogChunk(args: { narrationGeneration?: number }, route?: string) { const r = active(route); if (!r) return unavailable(); if (args.narrationGeneration && args.narrationGeneration !== r.generation) return { ok: false as const, error: { code: "stale_narration", message: "Blog narration request is stale." } }; if (r.status === "paused" || r.status === "stopped") return { ok: false as const, error: { code: "not_reading", message: "Blog reading is not active." } }; while (r.completed.has(r.article.chunks[r.currentChunkIndex]?.chunkId) && r.currentChunkIndex < r.article.chunks.length - 1) r.currentChunkIndex += 1; if (r.completed.size >= r.article.chunks.length) { r.status = "completed"; return { ok: false as const, error: { code: "completed", message: "The blog reading is complete." } }; } return { ok: true as const, data: chunkWithProgress(r) }; }
export function pauseBlogReading(route?: string) { const r = active(route); if (!r) return unavailable(); r.status = "paused"; r.generation += 1; return { ok: true as const, data: getBlogReadingState(route) }; }
export function resumeBlogReading(route?: string) { const r = active(route); if (!r) return unavailable(); r.status = "reading"; r.generation += 1; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function stopBlogReading(route?: string) { const r = active(route); if (!r) return unavailable(); r.status = "stopped"; r.generation += 1; return { ok: true as const, data: getBlogReadingState(route) }; }
export function restartBlogReading(route?: string) { const r = active(route); if (!r) return unavailable(); r.completed.clear(); r.currentChunkIndex = 0; r.status = "reading"; r.generation += 1; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function goToNextBlogSection(route?: string) { const r = active(route); if (!r) return unavailable(); const current = r.article.chunks[r.currentChunkIndex]?.sectionId; const idx = r.article.sections.findIndex((s) => s.sectionId === current); const next = r.article.sections[Math.min(idx + 1, r.article.sections.length - 1)]; r.currentChunkIndex = r.article.chunks.findIndex((c) => c.sectionId === next.sectionId); r.status = "reading"; r.generation += 1; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function goToPreviousBlogSection(route?: string) { const r = active(route); if (!r) return unavailable(); const current = r.article.chunks[r.currentChunkIndex]?.sectionId; const idx = r.article.sections.findIndex((s) => s.sectionId === current); const prev = r.article.sections[Math.max(idx - 1, 0)]; r.currentChunkIndex = r.article.chunks.findIndex((c) => c.sectionId === prev.sectionId); r.status = "reading"; r.generation += 1; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function readBlogSection(args: { sectionId?: string; sectionName?: string }, route?: string) { const r = active(route); if (!r) return unavailable(); const index = findSectionIndex(r, args.sectionId, args.sectionName); if (index === -2) return { ok: false as const, error: { code: "ambiguous_section", message: "Multiple blog sections matched. Please choose one from list_blog_sections." } }; if (index < 0) return { ok: false as const, error: { code: "section_not_found", message: "That blog section is not available." } }; r.currentChunkIndex = index; r.status = "reading"; r.generation += 1; return { ok: true as const, data: { state: getBlogReadingState(route), chunk: chunkWithProgress(r) } }; }
export function getBlogReadingState(route?: string): BlogReadingState { const r = active(route); if (!r) return { status: "unavailable", articleTitle: null, currentSection: null, currentChunk: null, progressPercentage: 0, remainingEstimatedDuration: 0, canResume: false, finalChunkCompleted: false }; const chunk = r.article.chunks[r.currentChunkIndex]; const remaining = r.article.chunks.filter((c) => !r.completed.has(c.chunkId)).reduce((sum, c) => sum + estimateSeconds(c.narrationText), 0); return { status: r.status, articleTitle: r.article.title, currentSection: chunk?.sectionId ?? null, currentChunk: chunk?.chunkId ?? null, progressPercentage: Math.round((r.completed.size / r.article.chunks.length) * 100), remainingEstimatedDuration: remaining, canResume: r.status === "paused" || r.status === "interrupted", finalChunkCompleted: r.completed.size >= r.article.chunks.length }; }
export function markBlogChunkCompleted(chunkId: string, generation: number, route?: string) { const r = active(route); if (!r || r.generation !== generation) return false; if (r.article.chunks[r.currentChunkIndex]?.chunkId !== chunkId) return false; r.completed.add(chunkId); if (r.completed.size >= r.article.chunks.length) r.status = "completed"; else r.currentChunkIndex += 1; return true; }
export function interruptBlogReading(route?: string) { const r = active(route); if (!r || r.status !== "reading") return false; r.status = "interrupted"; r.generation += 1; return true; }
export function isBlogReadingActive(route?: string) { const r = active(route); return r?.status === "reading"; }
