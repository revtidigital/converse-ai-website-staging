-- =============================================================================
-- Blog Converse Page Links Migration
-- Adds a table to store links to Converse website pages for each blog post.
-- These links appear as cards in the "Explore Converse Pages" carousel on the
-- blog post page, rendered ABOVE the Related Blogs carousel.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blog_converse_page_links (
  id          serial PRIMARY KEY,
  post_id     integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  url         text NOT NULL,
  label       text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  icon        text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_converse_page_links_post_idx ON public.blog_converse_page_links(post_id);

-- Enable RLS
ALTER TABLE public.blog_converse_page_links ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public read converse page links"
  ON public.blog_converse_page_links
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access blog_converse_page_links"
  ON public.blog_converse_page_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
