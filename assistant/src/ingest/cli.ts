// Ingestion CLI — indexes website + published blogs into website_knowledge_chunks.
//
// Usage:
//   tsx src/ingest/cli.ts --source all
//   tsx src/ingest/cli.ts --source blogs --dry-run --verbose
//   tsx src/ingest/cli.ts --source static --force --remove-stale
//
// Flags: --source static|blogs|knowledge|all  --dry-run  --limit N  --force
//        --remove-stale  --route /x  --blog-slug s  --verbose
//
// Only PUBLISHED content is indexed. Unchanged chunks (same content_hash) are
// skipped. Writes require SUPABASE_SERVICE_ROLE_KEY; without it the CLI runs a
// dry-run and reports clearly (no silent failure).

import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "../config.js";
import { embed } from "../embeddings.js";
import { normalizeToChunks, contentHash } from "./normalize.js";
import { STATIC_DOCS } from "./static-knowledge.js";
import type { SourceType } from "../types.js";

interface Args {
  source: "static" | "blogs" | "knowledge" | "all";
  dryRun: boolean; limit?: number; force: boolean; removeStale: boolean;
  route?: string; blogSlug?: string; verbose: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { source: "all", dryRun: false, force: false, removeStale: false, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case "--source": a.source = v as Args["source"]; i++; break;
      case "--dry-run": a.dryRun = true; break;
      case "--force": a.force = true; break;
      case "--remove-stale": a.removeStale = true; break;
      case "--verbose": a.verbose = true; break;
      case "--limit": a.limit = Number(v); i++; break;
      case "--route": a.route = v; i++; break;
      case "--blog-slug": a.blogSlug = v; i++; break;
    }
  }
  return a;
}

interface Record {
  sourceId: string; sourceType: SourceType; title: string; route: string;
  canonicalUrl: string; section: string; category: string; language: string;
  raw: string; blogSlug?: string; author?: string; publishDate?: string;
  updateDate?: string; sourceUpdatedAt?: string;
}

function log(a: Args, ...m: unknown[]) { if (a.verbose) console.log(...m); }

async function collectStatic(a: Args): Promise<Record[]> {
  return STATIC_DOCS
    .filter((d) => !a.route || d.route === a.route)
    .map((d) => ({
      sourceId: d.sourceId, sourceType: d.sourceType, title: d.title, route: d.route,
      canonicalUrl: `https://theconverseai.com${d.route}`, section: d.section,
      category: d.category, language: d.language, raw: d.body,
    }));
}

async function collectBlogs(a: Args): Promise<Record[]> {
  if (!CONFIG.supabaseUrl || !(CONFIG.supabaseServiceRoleKey || CONFIG.supabaseAnonKey)) {
    console.warn("[blogs] no Supabase credentials — skipping blog adapter (reported, not silent)");
    return [];
  }
  const client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey || CONFIG.supabaseAnonKey, { auth: { persistSession: false } });
  let q = client.from("blog_posts").select("*").eq("is_published", true);
  if (a.blogSlug) q = q.eq("slug", a.blogSlug);
  const { data, error } = await q;
  if (error) throw new Error(`[blogs] read failed: ${error.message}`);
  const rows = (data ?? []) as any[];
  return rows.map((r) => ({
    sourceId: `blog:${r.slug}`, sourceType: "blog" as SourceType,
    title: r.title, route: `/blog/${r.slug}`,
    canonicalUrl: r.canonical_url || `https://theconverseai.com/blog/${r.slug}`,
    section: "blog", category: r.category || "blog", language: "en",
    raw: `${r.title}. ${r.excerpt || ""}\n${r.content || ""}`,
    blogSlug: r.slug, author: r.author_name || null,
    publishDate: r.published_date || null, updateDate: r.updated_at || r.published_date || null,
    sourceUpdatedAt: r.updated_at || null,
  }));
}

async function run() {
  const a = parseArgs(process.argv.slice(2));
  const canWrite = !!CONFIG.supabaseServiceRoleKey && !a.dryRun;
  if (!CONFIG.supabaseServiceRoleKey && !a.dryRun) {
    console.warn("⚠️  No SUPABASE_SERVICE_ROLE_KEY set → running as DRY-RUN (no writes).");
    a.dryRun = true;
  }

  let records: Record[] = [];
  if (a.source === "static" || a.source === "knowledge" || a.source === "all") records.push(...await collectStatic(a));
  if (a.source === "blogs" || a.source === "all") records.push(...await collectBlogs(a));
  if (a.limit) records = records.slice(0, a.limit);

  const client = canWrite
    ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey, { auth: { persistSession: false } })
    : null;

  let planned = 0, skipped = 0, written = 0, embedded = 0;
  const seenSourceIds = new Set<string>();

  for (const rec of records) {
    seenSourceIds.add(rec.sourceId);
    const chunks = normalizeToChunks(rec.raw);
    log(a, `→ ${rec.sourceId} (${rec.sourceType}) ${chunks.length} chunks`);
    for (const ch of chunks) {
      planned++;
      const hash = contentHash(ch.content);
      if (client && !a.force) {
        const { data: existing } = await client
          .from("website_knowledge_chunks")
          .select("content_hash")
          .eq("source_id", rec.sourceId).eq("chunk_index", ch.index)
          .eq("embedding_version", CONFIG.embeddingVersion).maybeSingle();
        if (existing?.content_hash === hash) { skipped++; continue; }
      }
      if (a.dryRun) continue;
      const embedding = await embed(ch.content);
      embedded++;
      const row = {
        source_id: rec.sourceId, source_type: rec.sourceType, title: rec.title,
        route: rec.route, canonical_url: rec.canonicalUrl, section: rec.section,
        category: rec.category, language: rec.language, published: true,
        content: ch.content, content_hash: hash, blog_slug: rec.blogSlug ?? null,
        author: rec.author ?? null, publish_date: rec.publishDate ?? null,
        update_date: rec.updateDate ?? null, heading_path: ch.headingPath || null,
        chunk_index: ch.index, embedding,
        embedding_model: CONFIG.embeddingModel.replace(/^Xenova\//, ""),
        embedding_version: CONFIG.embeddingVersion,
        source_updated_at: rec.sourceUpdatedAt ?? null,
        indexed_at: new Date().toISOString(),
      };
      const { error } = await client!.from("website_knowledge_chunks")
        .upsert(row, { onConflict: "source_id,chunk_index,embedding_version" });
      if (error) throw new Error(`upsert failed for ${rec.sourceId}#${ch.index}: ${error.message}`);
      written++;
    }
  }

  if (a.removeStale && client) {
    const { data: all } = await client.from("website_knowledge_chunks").select("source_id");
    const stale = [...new Set((all ?? []).map((r: any) => r.source_id))].filter((s) => !seenSourceIds.has(s));
    for (const s of stale) {
      log(a, `× removing stale source ${s}`);
      if (!a.dryRun) await client.from("website_knowledge_chunks").delete().eq("source_id", s);
    }
    if (stale.length) console.log(`Stale sources ${a.dryRun ? "(would remove)" : "removed"}: ${stale.length}`);
  }

  console.log(JSON.stringify({
    mode: a.dryRun ? "dry-run" : "write", source: a.source,
    records: records.length, plannedChunks: planned, skippedUnchanged: skipped,
    embedded, written,
  }, null, 2));
}

run().catch((e) => { console.error("INGEST FAILED:", e.message); process.exit(1); });
