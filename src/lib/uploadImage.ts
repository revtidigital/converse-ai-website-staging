import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image file to the public `blog-images` bucket and return its public
 * URL. Requires an authenticated admin session (bucket RLS allows authenticated
 * uploads). Used by the Header Image picker and the content editor.
 */
export async function uploadBlogImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `uploads/${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}
