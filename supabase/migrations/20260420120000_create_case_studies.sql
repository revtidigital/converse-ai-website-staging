-- Create case_studies table
create table if not exists public.case_studies (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  company       text not null,
  industry      text not null,
  category      text not null,
  tagline       text not null,
  excerpt       text not null,
  hero_image    text not null,
  logo          text not null,
  read_time     text not null,
  published_date text not null,
  metrics       jsonb not null default '[]',
  challenge     text not null,
  solution      text not null,
  outcome       text not null,
  sections      jsonb not null default '[]',
  testimonial   jsonb not null default '{}',
  features_used text[] not null default '{}',
  use_case      text[] not null default '{}',
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Enable row level security (read-only for anonymous users)
alter table public.case_studies enable row level security;

create policy "Anyone can read case studies"
  on public.case_studies
  for select
  using (true);

create policy "Authenticated admins can insert case studies"
  on public.case_studies
  for insert
  to authenticated
  with check (true);

create policy "Authenticated admins can update case studies"
  on public.case_studies
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can delete case studies"
  on public.case_studies
  for delete
  to authenticated
  using (true);

-- Index for slug lookups
create index if not exists case_studies_slug_idx on public.case_studies (slug);
-- Index for ordered listing
create index if not exists case_studies_order_idx on public.case_studies (display_order);
