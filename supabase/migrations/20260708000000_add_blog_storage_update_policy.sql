-- Authenticated users can update files in blog-images bucket (useful for overwrite requests)
CREATE POLICY "Auth update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images');
