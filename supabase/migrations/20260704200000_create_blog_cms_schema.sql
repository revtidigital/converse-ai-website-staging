-- =============================================================================
-- Blog CMS Schema Migration
-- Replaces the flat blog_posts table with a fully normalized CMS schema.
-- =============================================================================

-- -------------------------------------------------------
-- 0. Drop old table and its dependent policies
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin full access blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can insert blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can update blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can delete blog_posts" ON public.blog_posts;

DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- -------------------------------------------------------
-- 1. blog_images  (no FK deps)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_images (
  id                  serial PRIMARY KEY,
  storage_path        text NOT NULL,
  storage_url         text NOT NULL,
  original_url        text,
  alt_text            text NOT NULL DEFAULT '',
  caption             text NOT NULL DEFAULT '',
  description         text NOT NULL DEFAULT '',
  file_name           text NOT NULL DEFAULT '',
  width               integer,
  height              integer,
  file_size           integer,
  mime_type           text NOT NULL DEFAULT 'image/jpeg',
  is_webp_converted   boolean NOT NULL DEFAULT false,
  has_thumbnail       boolean NOT NULL DEFAULT false,
  import_session_id   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 2. blog_categories
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 3. blog_tags
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 4. blog_authors
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_authors (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  avatar_url    text NOT NULL DEFAULT '',
  designation   text NOT NULL DEFAULT '',
  bio           text NOT NULL DEFAULT '',
  social_links  jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 5. blog_posts  (references blog_images, blog_authors)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                   serial PRIMARY KEY,
  wp_id                integer,
  title                text NOT NULL,
  slug                 text UNIQUE NOT NULL,
  permalink            text NOT NULL DEFAULT '',
  content_html         text NOT NULL DEFAULT '',
  excerpt              text NOT NULL DEFAULT '',
  featured_image_id    integer REFERENCES public.blog_images(id) ON DELETE SET NULL,
  author_id            integer REFERENCES public.blog_authors(id) ON DELETE SET NULL,
  publish_date         date,
  publish_at           timestamptz,
  unpublish_at         timestamptz,
  reading_time         integer NOT NULL DEFAULT 1 CHECK (reading_time > 0),
  status               text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','archived')),
  seo_title            text NOT NULL DEFAULT '',
  meta_description     text NOT NULL DEFAULT '',
  canonical_url        text NOT NULL DEFAULT '',
  focus_keyphrase      text NOT NULL DEFAULT '',
  og_title             text NOT NULL DEFAULT '',
  og_description       text NOT NULL DEFAULT '',
  og_image_id          integer REFERENCES public.blog_images(id) ON DELETE SET NULL,
  twitter_title        text NOT NULL DEFAULT '',
  twitter_description  text NOT NULL DEFAULT '',
  twitter_image_id     integer REFERENCES public.blog_images(id) ON DELETE SET NULL,
  display_order        integer NOT NULL DEFAULT 99,
  search_index         tsvector,
  seo_score            integer NOT NULL DEFAULT 0,
  view_count           integer NOT NULL DEFAULT 0,
  deleted_at           timestamptz,
  deleted_by           text,
  import_session_id    text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Partial unique index for wp_id (only when not null)
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_wp_id_idx ON public.blog_posts(wp_id) WHERE wp_id IS NOT NULL;

-- -------------------------------------------------------
-- 6. blog_post_categories  (junction)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
  post_id     integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- -------------------------------------------------------
-- 7. blog_post_tags  (junction)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id  integer NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- -------------------------------------------------------
-- 8. blog_faqs
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_faqs (
  id          serial PRIMARY KEY,
  post_id     integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question    text NOT NULL,
  answer      text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 9. blog_related_posts  (junction, no self-reference)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_related_posts (
  post_id         integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  related_post_id integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, related_post_id),
  CHECK (post_id <> related_post_id)
);

-- -------------------------------------------------------
-- 10. blog_revisions
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_revisions (
  id               serial PRIMARY KEY,
  post_id          integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  version_number   integer NOT NULL DEFAULT 1,
  content_html     text NOT NULL DEFAULT '',
  seo_title        text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  slug             text NOT NULL DEFAULT '',
  canonical_url    text NOT NULL DEFAULT '',
  updated_by       text NOT NULL DEFAULT '',
  change_notes     text NOT NULL DEFAULT '',
  snapshot         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 11. blog_url_checks
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_url_checks (
  id            serial PRIMARY KEY,
  post_id       integer REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  url           text NOT NULL,
  url_type      text NOT NULL DEFAULT 'external',
  status        text NOT NULL DEFAULT 'empty' CHECK (status IN ('valid','redirect','broken','empty')),
  http_code     integer,
  error_message text,
  checked_at    timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 12. blog_redirects
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_redirects (
  id            serial PRIMARY KEY,
  old_url       text UNIQUE NOT NULL,
  new_url       text NOT NULL,
  redirect_type smallint NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  is_active     boolean NOT NULL DEFAULT true,
  source        text NOT NULL DEFAULT 'manual',
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (old_url <> new_url)
);

-- -------------------------------------------------------
-- 13. blog_content_blocks
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_content_blocks (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  block_type  text NOT NULL CHECK (block_type IN ('cta','newsletter','banner','video','code','quote','table','alert')),
  content     jsonb NOT NULL DEFAULT '{}',
  is_global   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 14. blog_slug_history
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_slug_history (
  id               serial PRIMARY KEY,
  post_id          integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  old_slug         text NOT NULL,
  new_slug         text NOT NULL,
  redirect_created boolean NOT NULL DEFAULT false,
  changed_at       timestamptz NOT NULL DEFAULT now(),
  changed_by       text NOT NULL DEFAULT '',
  UNIQUE (post_id, old_slug)
);

-- -------------------------------------------------------
-- 15. blog_link_map
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_link_map (
  id             serial PRIMARY KEY,
  source_post_id integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  target_post_id integer REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  target_url     text NOT NULL,
  link_text      text NOT NULL DEFAULT '',
  is_internal    boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 16. blog_user_roles
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_user_roles (
  id          serial PRIMARY KEY,
  user_id     text NOT NULL,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin','editor','author','seo_manager','content_reviewer')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  text NOT NULL DEFAULT ''
);

-- -------------------------------------------------------
-- 17. blog_activity_log
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_activity_log (
  id             serial PRIMARY KEY,
  user_email     text NOT NULL DEFAULT '',
  action         text NOT NULL,
  resource_type  text NOT NULL DEFAULT 'blog',
  resource_id    integer,
  resource_title text NOT NULL DEFAULT '',
  metadata       jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 18. cms_settings
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cms_settings (key, value) VALUES
  ('site_url',              'https://theconverseai.com'),
  ('link_hover_color',      '#7c3aed'),
  ('link_default_color',    '#4f46e5'),
  ('link_font_weight',      '600'),
  ('default_og_image',      ''),
  ('default_twitter_image', '')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- blog_posts
CREATE INDEX IF NOT EXISTS blog_posts_status_idx         ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_publish_date_idx   ON public.blog_posts(publish_date);
CREATE INDEX IF NOT EXISTS blog_posts_author_idx         ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_posts_featured_image_idx ON public.blog_posts(featured_image_id);
CREATE INDEX IF NOT EXISTS blog_posts_search_idx         ON public.blog_posts USING GIN(search_index);
CREATE INDEX IF NOT EXISTS blog_posts_deleted_idx        ON public.blog_posts(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS blog_posts_scheduled_idx      ON public.blog_posts(publish_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS blog_posts_status_date_idx    ON public.blog_posts(status, publish_date);

-- other tables
CREATE INDEX IF NOT EXISTS blog_faqs_post_idx            ON public.blog_faqs(post_id);
CREATE INDEX IF NOT EXISTS blog_revisions_post_idx       ON public.blog_revisions(post_id);
CREATE INDEX IF NOT EXISTS blog_url_checks_post_idx      ON public.blog_url_checks(post_id);
CREATE INDEX IF NOT EXISTS blog_activity_log_created_idx ON public.blog_activity_log(created_at);
CREATE INDEX IF NOT EXISTS blog_activity_log_email_idx   ON public.blog_activity_log(user_email);
CREATE INDEX IF NOT EXISTS blog_slug_history_post_idx    ON public.blog_slug_history(post_id);
CREATE INDEX IF NOT EXISTS blog_link_map_source_idx      ON public.blog_link_map(source_post_id);
CREATE INDEX IF NOT EXISTS blog_link_map_target_idx      ON public.blog_link_map(target_post_id);
CREATE INDEX IF NOT EXISTS blog_images_session_idx       ON public.blog_images(import_session_id);
CREATE INDEX IF NOT EXISTS blog_posts_session_idx        ON public.blog_posts(import_session_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- 1. updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Apply updated_at to blog_posts
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Search index update function
CREATE OR REPLACE FUNCTION public.update_blog_search_index()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_index := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.seo_title, '') || ' ' ||
    coalesce(NEW.excerpt, '') || ' ' ||
    coalesce(NEW.focus_keyphrase, '') || ' ' ||
    coalesce(regexp_replace(NEW.content_html, '<[^>]+>', ' ', 'g'), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_search_index
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_search_index();

-- 4. Auto-create revision on update
CREATE OR REPLACE FUNCTION public.create_blog_revision()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  next_version integer;
BEGIN
  -- Only create revision if content or key SEO fields changed
  IF OLD.content_html IS DISTINCT FROM NEW.content_html OR
     OLD.seo_title IS DISTINCT FROM NEW.seo_title OR
     OLD.meta_description IS DISTINCT FROM NEW.meta_description OR
     OLD.slug IS DISTINCT FROM NEW.slug OR
     OLD.canonical_url IS DISTINCT FROM NEW.canonical_url THEN

    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM public.blog_revisions
    WHERE post_id = OLD.id;

    INSERT INTO public.blog_revisions (
      post_id, version_number, content_html, seo_title,
      meta_description, slug, canonical_url, snapshot
    ) VALUES (
      OLD.id, next_version, OLD.content_html, OLD.seo_title,
      OLD.meta_description, OLD.slug, OLD.canonical_url,
      to_jsonb(OLD)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_revision
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.create_blog_revision();

-- 5. Auto-create redirect when slug changes
CREATE OR REPLACE FUNCTION public.track_slug_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    -- Record slug history
    INSERT INTO public.blog_slug_history (post_id, old_slug, new_slug, redirect_created)
    VALUES (OLD.id, OLD.slug, NEW.slug, true)
    ON CONFLICT (post_id, old_slug) DO NOTHING;

    -- Auto-create 301 redirect
    INSERT INTO public.blog_redirects (old_url, new_url, redirect_type, source)
    VALUES ('/blog/' || OLD.slug, '/blog/' || NEW.slug, 301, 'slug_change')
    ON CONFLICT (old_url) DO UPDATE SET new_url = EXCLUDED.new_url, redirect_type = 301;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_slug_change
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.track_slug_change();

-- 6. increment_blog_views RPC function
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id AND deleted_at IS NULL;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.blog_images          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_faqs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_related_posts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_revisions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_url_checks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_redirects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content_blocks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_slug_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_link_map        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_user_roles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_activity_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings         ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read published posts"  ON public.blog_posts           FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Public read categories"       ON public.blog_categories      FOR SELECT USING (true);
CREATE POLICY "Public read tags"             ON public.blog_tags            FOR SELECT USING (true);
CREATE POLICY "Public read authors"          ON public.blog_authors         FOR SELECT USING (true);
CREATE POLICY "Public read images"           ON public.blog_images          FOR SELECT USING (true);
CREATE POLICY "Public read post categories"  ON public.blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Public read post tags"        ON public.blog_post_tags       FOR SELECT USING (true);
CREATE POLICY "Public read faqs"             ON public.blog_faqs            FOR SELECT USING (true);
CREATE POLICY "Public read related posts"    ON public.blog_related_posts   FOR SELECT USING (true);
CREATE POLICY "Public read content blocks"   ON public.blog_content_blocks  FOR SELECT USING (true);
CREATE POLICY "Public read cms settings"     ON public.cms_settings         FOR SELECT USING (true);
CREATE POLICY "Public read redirects"        ON public.blog_redirects       FOR SELECT USING (is_active = true);

-- Authenticated admin policies (full access on all tables)
DO $$ DECLARE t text; BEGIN FOR t IN SELECT unnest(ARRAY[
  'blog_images','blog_categories','blog_tags','blog_authors','blog_posts',
  'blog_post_categories','blog_post_tags','blog_faqs','blog_related_posts',
  'blog_revisions','blog_url_checks','blog_redirects','blog_content_blocks',
  'blog_slug_history','blog_link_map','blog_user_roles','blog_activity_log','cms_settings'
]) LOOP
  EXECUTE format(
    'CREATE POLICY "Admin full access %s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
    t, t
  );
END LOOP; END $$;
