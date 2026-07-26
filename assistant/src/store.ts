// Knowledge store abstraction. The retriever depends only on this interface,
// so it can run against real Supabase pgvector in production and an in-memory
// fixture in tests.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "./config.js";
import type { KnowledgeChunk, SourceType } from "./types.js";

export interface MatchOptions {
  matchCount?: number;
  similarityFloor?: number;
  sourceType?: SourceType | null;
  route?: string | null;
  blogSlug?: string | null;
  category?: string | null;
}

export interface KnowledgeStore {
  match(queryEmbedding: number[], opts?: MatchOptions): Promise<KnowledgeChunk[]>;
}

interface RpcRow {
  id: string;
  source_id: string;
  source_type: SourceType;
  title: string;
  route: string;
  canonical_url: string;
  section: string;
  category: string;
  language: string;
  content: string;
  blog_slug: string | null;
  author: string | null;
  publish_date: string | null;
  update_date: string | null;
  heading_path: string | null;
  similarity: number;
}

function rowToChunk(r: RpcRow): KnowledgeChunk {
  return {
    id: r.id,
    sourceId: r.source_id,
    sourceType: r.source_type,
    title: r.title,
    route: r.route,
    canonicalUrl: r.canonical_url,
    section: r.section,
    category: r.category,
    language: r.language,
    content: r.content,
    blogSlug: r.blog_slug,
    author: r.author,
    publishDate: r.publish_date,
    updateDate: r.update_date,
    headingPath: r.heading_path,
    similarity: r.similarity,
  };
}

export class SupabaseKnowledgeStore implements KnowledgeStore {
  private client: SupabaseClient;
  constructor(client?: SupabaseClient) {
    this.client =
      client ??
      createClient(
        CONFIG.supabaseUrl,
        // Anon key is enough: the match RPC only returns published rows.
        CONFIG.supabaseServiceRoleKey || CONFIG.supabaseAnonKey,
        { auth: { persistSession: false } },
      );
  }

  async match(queryEmbedding: number[], opts: MatchOptions = {}): Promise<KnowledgeChunk[]> {
    const { data, error } = await this.client.rpc("match_website_knowledge_chunks", {
      query_embedding: queryEmbedding,
      match_count: Math.min(Math.max(opts.matchCount ?? CONFIG.retrievalCount, 1), 20),
      similarity_floor: opts.similarityFloor ?? 0,
      filter_source_type: opts.sourceType ?? null,
      filter_route: opts.route ?? null,
      filter_blog_slug: opts.blogSlug ?? null,
      filter_category: opts.category ?? null,
    });
    if (error) throw new Error(`match RPC failed: ${error.message}`);
    return (data as RpcRow[]).map(rowToChunk);
  }
}

/** Deterministic in-memory store for tests (cosine over provided fixtures). */
export class InMemoryKnowledgeStore implements KnowledgeStore {
  constructor(private rows: Array<KnowledgeChunk & { embedding: number[] }>) {}
  async match(q: number[], opts: MatchOptions = {}): Promise<KnowledgeChunk[]> {
    const floor = opts.similarityFloor ?? 0;
    return this.rows
      .filter((r) => (opts.sourceType ? r.sourceType === opts.sourceType : true))
      .filter((r) => (opts.blogSlug ? r.blogSlug === opts.blogSlug : true))
      .map((r) => {
        let dot = 0;
        for (let i = 0; i < q.length; i++) dot += q[i] * r.embedding[i];
        return { ...r, similarity: dot };
      })
      .filter((r) => r.similarity >= floor)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(opts.matchCount ?? 5, 20));
  }
}
