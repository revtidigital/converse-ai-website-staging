-- Add canonical_url column to blog_posts table
alter table public.blog_posts 
add column if not exists canonical_url text;
