import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image file to the public `blog-images` bucket and return a
 * host-relative WordPress-style URL. Requires an authenticated admin session
 * (bucket RLS allows authenticated uploads). Used by the Header Image picker and
 * the content editor.
 *
 * The file is stored under `wp-content/YYYY/MM/...` inside the bucket, and the
 * returned URL is `/wp-content/uploads/YYYY/MM/...`. This keeps new uploads on
 * the same URL scheme as the migrated WordPress images (whose legacy
 * `/wp-content/uploads/...` links must keep resolving after prod cutover). The
 * Vercel rewrite `/wp-content/uploads/(.*)` -> bucket `wp-content/$1` serves
 * both, on any deployed domain (prod/staging blog, main-site preview).
 */
export async function uploadBlogImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const name = `${Date.now()}-${rand}.${ext}`;
  // Bucket path has no "uploads" segment (mirrors the migrated WP layout); the
  // public URL adds it back so it matches legacy WordPress image URLs.
  const path = `wp-content/${yyyy}/${mm}/${name}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
  if (error) throw error;
  return `/wp-content/uploads/${yyyy}/${mm}/${name}`;
}

/**
 * Upload a self-hosted video file to the public `blog-videos` bucket and
 * return its public URL. Requires an authenticated admin session (bucket
 * RLS allows authenticated uploads). Used by the blog content editor's
 * "Insert Video" → Upload tab.
 */
export async function uploadBlogVideo(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const name = `${Date.now()}-${rand}.${ext}`;
  const path = `${yyyy}/${mm}/${name}`;
  const { error } = await supabase.storage
    .from("blog-videos")
    .upload(path, file, { upsert: false, contentType: file.type || "video/mp4" });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-videos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a self-hosted video previously uploaded via `uploadBlogVideo`, given
 * its public URL. Used when an author removes a video block from a post so
 * the `blog-videos` bucket doesn't accumulate orphaned files.
 */
export async function deleteBlogVideo(publicUrl: string): Promise<void> {
  const marker = "/object/public/blog-videos/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from("blog-videos").remove([path]);
  if (error) throw error;
}
