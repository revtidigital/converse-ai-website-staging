// Hybrid retrieval + re-rank. Combines dense vector similarity with lexical /
// structural signals (title, keyword, route, blog-slug, heading, current-page,
// recent-topic and source-type weighting). Cross-lingual by construction —
// the embedding model maps Hindi / Hinglish / English into one space, so a
// Hindi query retrieves English content.

import type { KnowledgeChunk, PageContext, IntentKind } from "./types.js";
import type { KnowledgeStore, MatchOptions } from "./store.js";
import { embed } from "./embeddings.js";
import { CONFIG } from "./config.js";

export interface RetrieveInput {
  query: string;
  intent: IntentKind;
  page?: PageContext;
  recentTopic?: string;
  matchCount?: number;
}

const SOURCE_TYPE_FOR_INTENT: Partial<Record<IntentKind, MatchOptions["sourceType"]>> = {
  blog_question: "blog",
  blog_summary: "blog",
  latest_blog: "blog",
  related_blog: "blog",
  service_question: "service",
  product_question: "product",
  pricing_question: null, // pricing can live across static/product
  faq_question: "faq",
  case_study_request: "case_study",
  contact_request: "contact",
};

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s]/g, " ").split(/\s+/).filter(Boolean);
}

function overlap(a: string, b: string): number {
  const A = new Set(tokens(a));
  if (A.size === 0) return 0;
  let hit = 0;
  for (const t of new Set(tokens(b))) if (A.has(t)) hit++;
  return hit / A.size;
}

/** Re-rank score = vector similarity + bounded lexical/structural boosts. */
function rerankScore(q: string, c: KnowledgeChunk, page?: PageContext, recentTopic?: string): number {
  let s = c.similarity;
  const titleOv = overlap(q, c.title);
  s += 0.12 * titleOv; // title match
  s += 0.06 * Math.min(1, overlap(q, c.headingPath ?? "")); // heading match
  // exact keyword / entity presence in content
  const qToks = tokens(q).filter((t) => t.length >= 4);
  const contentLow = c.content.toLowerCase();
  const kwHits = qToks.filter((t) => contentLow.includes(t)).length;
  s += 0.02 * Math.min(4, kwHits);
  // current-page weighting
  if (page?.route && c.route === page.route) s += 0.08;
  if (page?.blogSlug && c.blogSlug === page.blogSlug) s += 0.12;
  // blog-slug / route mention in the query itself
  if (c.blogSlug && q.toLowerCase().includes(c.blogSlug.replace(/-/g, " "))) s += 0.1;
  // recent-conversation topic weighting
  if (recentTopic) s += 0.05 * overlap(recentTopic, c.title + " " + c.content.slice(0, 200));
  return s;
}

/** Deduplicate by sourceId+section, keeping the highest-scoring chunk. */
function dedupe(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  const best = new Map<string, KnowledgeChunk>();
  for (const c of chunks) {
    const key = `${c.sourceId}::${c.section}`;
    const cur = best.get(key);
    if (!cur || (c.score ?? c.similarity) > (cur.score ?? cur.similarity)) best.set(key, c);
  }
  return [...best.values()];
}

export async function retrieve(
  store: KnowledgeStore,
  input: RetrieveInput,
): Promise<{ chunks: KnowledgeChunk[]; topSimilarity: number }> {
  const queryEmbedding = await embed(input.query);
  const sourceType = SOURCE_TYPE_FOR_INTENT[input.intent];

  // Over-fetch, then re-rank & dedupe down to matchCount. Also fetch a small
  // current-page-scoped set so page context can win when relevant.
  const base = await store.match(queryEmbedding, {
    matchCount: Math.max((input.matchCount ?? CONFIG.retrievalCount) * 3, 12),
    similarityFloor: 0,
    sourceType: sourceType ?? null,
  });

  let pageScoped: KnowledgeChunk[] = [];
  if (input.page?.blogSlug) {
    pageScoped = await store.match(queryEmbedding, {
      matchCount: 4,
      blogSlug: input.page.blogSlug,
    });
  }

  const merged = dedupe([...base, ...pageScoped]).map((c) => ({
    ...c,
    score: rerankScore(input.query, c, input.page, input.recentTopic),
  }));
  merged.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const chunks = merged.slice(0, input.matchCount ?? CONFIG.retrievalCount);
  const topSimilarity = chunks.length ? Math.max(...chunks.map((c) => c.similarity)) : 0;
  return { chunks, topSimilarity };
}
