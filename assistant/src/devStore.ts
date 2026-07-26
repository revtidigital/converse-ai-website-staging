// Local/dev knowledge store: builds an in-memory vector index from the curated
// static docs using REAL embeddings. Lets the whole stack (gateway → service →
// brain) run end-to-end without Supabase — for local verification and demos.

import { InMemoryKnowledgeStore } from "./store.js";
import { embed } from "./embeddings.js";
import { STATIC_DOCS } from "./ingest/static-knowledge.js";
import type { KnowledgeChunk } from "./types.js";

export async function buildStaticMemoryStore(): Promise<InMemoryKnowledgeStore> {
  const rows: Array<KnowledgeChunk & { embedding: number[] }> = [];
  for (const d of STATIC_DOCS) {
    rows.push({
      id: d.sourceId, sourceId: d.sourceId, sourceType: d.sourceType, title: d.title,
      route: d.route, canonicalUrl: `https://theconverseai.com${d.route}`, section: d.section,
      category: d.category, language: d.language, content: d.body, similarity: 0,
      blogSlug: null, author: null, publishDate: null, updateDate: null, headingPath: null,
      embedding: await embed(d.body),
    });
  }
  return new InMemoryKnowledgeStore(rows);
}
