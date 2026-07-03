-- Create blog_posts table
create table if not exists public.blog_posts (
  id               serial primary key,
  slug             text unique not null,
  title            text not null,
  seo_title        text,
  meta_description text,
  category         text not null default '',
  excerpt          text not null default '',
  content          text not null default '',
  hero_image       text not null default '',
  author_name      text not null default '',
  author_role      text not null default '',
  author_avatar    text not null default '',
  read_time        text not null default '5 min read',
  published_date   text not null default '',
  tags             text[] not null default '{}',
  related_page_links jsonb not null default '[]',
  display_order    int not null default 99,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.blog_posts enable row level security;

-- Public can read published posts
create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  using (is_published = true);

-- Authenticated admins can do everything
create policy "Admins can manage blog posts"
  on public.blog_posts
  for all
  to authenticated
  using (true)
  with check (true);

-- Index for fast slug lookups
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_published_idx on public.blog_posts(is_published, display_order);
