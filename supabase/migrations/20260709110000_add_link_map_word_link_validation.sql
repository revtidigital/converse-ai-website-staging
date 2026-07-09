-- Create duplicate link text validation for blog_link_map
CREATE OR REPLACE FUNCTION public.check_duplicate_link_map()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.blog_link_map
    WHERE source_post_id = NEW.source_post_id
      AND LOWER(TRIM(link_text)) = LOWER(TRIM(NEW.link_text))
      AND LOWER(TRIM(target_url)) = LOWER(TRIM(NEW.target_url))
      AND id <> COALESCE(NEW.id, -1)
  ) THEN
    RAISE EXCEPTION 'already this word has same link';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS blog_link_map_validation ON public.blog_link_map;

-- Create trigger BEFORE INSERT OR UPDATE on blog_link_map
CREATE TRIGGER blog_link_map_validation
  BEFORE INSERT OR UPDATE ON public.blog_link_map
  FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_link_map();

-- Create trigger function to sync links from blog_posts content_html to blog_link_map
CREATE OR REPLACE FUNCTION public.sync_blog_post_links()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  link_record RECORD;
  clean_text TEXT;
  clean_url TEXT;
  is_int BOOLEAN;
BEGIN
  -- Delete existing links for this post
  DELETE FROM public.blog_link_map WHERE source_post_id = NEW.id;

  -- Only parse links if content_html is not null/empty and contains anchor tags
  IF NEW.content_html IS NOT NULL AND NEW.content_html <> '' AND NEW.content_html ~* '<a\s+[^>]*href=' THEN
    FOR link_record IN 
      SELECT 
        (matches[1]) AS href,
        (matches[2]) AS text
      FROM regexp_matches(
        NEW.content_html, 
        '<a\s+[^>]*href=["'']([^"''>]+)["''][^>]*>([\s\S]*?)</a>', 
        'gi'
      ) AS matches
    LOOP
      clean_text := TRIM(regexp_replace(link_record.text, '<[^>]+>', '', 'g'));
      clean_url := TRIM(link_record.href);
      
      -- Skip mailto, tel, javascript, anchors, and empty text
      IF clean_url !~* '^(mailto:|tel:|javascript:|#)' AND clean_text <> '' THEN
        is_int := (clean_url LIKE '/%' OR clean_url NOT LIKE 'http%');
        
        -- Insert into blog_link_map
        -- This will automatically trigger check_duplicate_link_map() and throw validation errors
        INSERT INTO public.blog_link_map (
          source_post_id,
          target_url,
          link_text,
          is_internal
        ) VALUES (
          NEW.id,
          clean_url,
          clean_text,
          is_int
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS blog_posts_sync_links ON public.blog_posts;

-- Create trigger AFTER INSERT OR UPDATE on blog_posts
CREATE TRIGGER blog_posts_sync_links
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.sync_blog_post_links();
