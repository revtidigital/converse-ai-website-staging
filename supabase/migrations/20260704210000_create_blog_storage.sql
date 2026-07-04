-- =============================================================================
-- Blog Images Storage Bucket
-- =============================================================================

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Public can read all files in blog-images bucket
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Authenticated users can upload files
CREATE POLICY "Auth upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

-- Authenticated users can delete files
CREATE POLICY "Auth delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
