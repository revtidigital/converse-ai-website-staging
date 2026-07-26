-- Website Brain V2 — vector knowledge store + session memory.
-- Custom, self-hosted RAG for the ConverseAI voice/text assistant.
-- Embedding model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
-- Dimension: 384 (cosine). NO external LLM keys required.
--
-- STOP / DESTRUCTIVE-SCHEMA NOTE: this only CREATES new objects
-- (website_knowledge_chunks, assistant_session_memory, match_website_knowledge_chunks).
-- It never drops or alters existing website tables.

create extension if not exists vector;

-- ── Knowledge chunks (website pages + published blogs) ──────────────────────
create table if not exists public.website_knowledge_chunks (
  id                uuid primary key default gen_random_uuid(),
  source_id         text not null,            -- stable id per logical source (route or blog slug)
  source_type       text not null,            -- 'static' | 'service' | 'product' | 'faq' | 'case_study' | 'blog' | 'contact' | 'company' | 'legal'
  title             text not null default '',
  route             text not null default '',
  canonical_url     text not null default '',
  section           text not null default '',
  category          text not null default '',
  language          text not null default 'en',
  published         boolean not null default true,
  content           text not null,
  content_hash      text not null,            -- sha256 of normalized content; skip-unchanged
  -- blog-specific metadata (null for non-blog sources)
  blog_slug         text,
  author            text,
  publish_date      text,
  update_date       text,
  heading_path      text,                     -- "H1 › H2 › H3"
  chunk_index       int not null default 0,
  embedding         vector(384),              -- normalized; null rows are non-retrievable
  embedding_model   text not null default 'paraphrase-multilingual-MiniLM-L12-v2',
  embedding_version int not null default 1,
  source_updated_at timestamptz,
  indexed_at        timestamptz not null default now(),
  unique (source_id, chunk_index, embedding_version)
);

-- HNSW cosine index (only meaningful over non-null embeddings)
create index if not exists wkc_embedding_hnsw
  on public.website_knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

create index if not exists wkc_source_type_idx on public.website_knowledge_chunks (source_type);
create index if not exists wkc_route_idx        on public.website_knowledge_chunks (route);
create index if not exists wkc_blog_slug_idx    on public.website_knowledge_chunks (blog_slug);
create index if not exists wkc_published_idx     on public.website_knowledge_chunks (published);

-- ── Session memory (bounded, TTL-expired, NOT public) ───────────────────────
create table if not exists public.assistant_session_memory (
  session_id   text primary key,
  data         jsonb not null default '{}'::jsonb,  -- {topic, prevQuery, prevAnswer, sources, service, product, route, language, pendingClarification, turns[]}
  updated_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '30 minutes')
);
create index if not exists asm_expires_idx on public.assistant_session_memory (expires_at);

-- ── Retrieval RPC: cosine similarity, published-only, bounded, filterable ───
create or replace function public.match_website_knowledge_chunks(
  query_embedding   vector(384),
  match_count       int   default 5,
  similarity_floor  float default 0.0,
  filter_source_type text default null,
  filter_route       text default null,
  filter_blog_slug   text default null,
  filter_category    text default null
)
returns table (
  id uuid, source_id text, source_type text, title text, route text,
  canonical_url text, section text, category text, language text,
  content text, blog_slug text, author text, publish_date text,
  update_date text, heading_path text, similarity float
)
language sql stable
as $$
  select
    c.id, c.source_id, c.source_type, c.title, c.route, c.canonical_url,
    c.section, c.category, c.language, c.content, c.blog_slug, c.author,
    c.publish_date, c.update_date, c.heading_path,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.website_knowledge_chunks c
  where c.published = true
    and c.embedding is not null
    and (filter_source_type is null or c.source_type = filter_source_type)
    and (filter_route       is null or c.route = filter_route)
    and (filter_blog_slug   is null or c.blog_slug = filter_blog_slug)
    and (filter_category    is null or c.category = filter_category)
    and (1 - (c.embedding <=> query_embedding)) >= similarity_floor
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.website_knowledge_chunks enable row level security;
alter table public.assistant_session_memory enable row level security;

-- Anonymous/authenticated may READ only published chunks. No insert/update/delete.
drop policy if exists "public reads published chunks" on public.website_knowledge_chunks;
create policy "public reads published chunks"
  on public.website_knowledge_chunks for select
  using (published = true);

-- Session memory is NOT public: no anon/auth policies => service-role only.
-- (RLS enabled with zero policies blocks anon & authenticated entirely.)

-- match RPC is exposed to anon but only returns published rows (see WHERE clause).
grant execute on function public.match_website_knowledge_chunks to anon, authenticated;
