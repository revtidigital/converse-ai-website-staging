-- Keep only the latest 3 version-history revisions per blog post.
--
-- The blog_posts_revision trigger snapshots the previous row into
-- blog_revisions on every meaningful update, so history grows unbounded.
-- We replace the trigger function so that after inserting a new revision it
-- prunes anything older than the most recent 3 versions for that post.

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

    -- Retain only the latest 3 revisions for this post; drop the rest.
    DELETE FROM public.blog_revisions
    WHERE post_id = OLD.id
      AND id NOT IN (
        SELECT id
        FROM public.blog_revisions
        WHERE post_id = OLD.id
        ORDER BY version_number DESC
        LIMIT 3
      );
  END IF;
  RETURN NEW;
END;
$$;

-- One-time cleanup of existing history so posts already over the limit are
-- trimmed down to their latest 3 revisions immediately.
DELETE FROM public.blog_revisions br
WHERE br.id NOT IN (
  SELECT id FROM (
    SELECT id,
           row_number() OVER (PARTITION BY post_id ORDER BY version_number DESC) AS rn
    FROM public.blog_revisions
  ) ranked
  WHERE ranked.rn <= 3
);
