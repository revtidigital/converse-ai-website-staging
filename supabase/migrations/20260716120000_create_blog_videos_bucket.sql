-- =============================================================================
-- Blog Videos Storage Bucket (self-hosted video uploads from the blog editor)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-videos',
  'blog-videos',
  true,
  524288000,
  ARRAY['video/mp4','video/webm','video/ogg','video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Public can read all files in blog-videos bucket
CREATE POLICY "Public read blog videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-videos');

-- Authenticated users can upload files
CREATE POLICY "Auth upload blog videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-videos');

-- Authenticated users can update files (overwrite requests)
CREATE POLICY "Auth update blog videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-videos');

-- Authenticated users can delete files
CREATE POLICY "Auth delete blog videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-videos');
