import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbBlogPost = Tables<"blog_posts">;

/**
 * Public-facing post shape. Extends the raw DB row with resolved/compat fields
 * the blog UI expects (image URL, plain `content`, primary category name, etc.),
 * which live in related tables (blog_images, blog_categories, blog_authors)
 * under the normalized CMS schema.
 */
export type PublicBlogPost = DbBlogPost & {
  hero_image: string;
  content: string;
  category: string;
  published_date: string;
  read_time: string;
  author_name: string;
  related_page_links: unknown[];
};

/** Embed clause: resolve featured image, author name, and category names. */
const EMBED =
  "featured_image:blog_images!featured_image_id(storage_url,alt_text)," +
  "author:blog_authors!author_id(name)," +
  "blog_post_categories(blog_categories(name))";

function normalize(row: any): PublicBlogPost {
  const cats: string[] = (row.blog_post_categories ?? [])
    .map((j: any) => j?.blog_categories?.name)
    .filter(Boolean);
  return {
    ...row,
    hero_image: row.featured_image?.storage_url ?? "",
    content: row.content_html ?? "",
    category: cats[0] ?? "Uncategorized",
    published_date: row.publish_date ?? "",
    read_time: row.reading_time ? `${row.reading_time} min read` : "",
    author_name: row.author?.name ?? "ConverseAI",
    related_page_links: [],
  };
}

/** Public blog listing — published posts only (light payload for cards). */
export function useBlogPosts() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, publish_date, reading_time, seo_title, meta_description, canonical_url, featured_image_id, author_id, display_order, status, view_count," +
          EMBED
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("publish_date", { ascending: false });

    if (err) setError(err.message);
    else setPosts((data ?? []).map(normalize));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  return { posts, loading, error, refetch: fetchPosts };
}

/** Fetch a single post by slug (public — published only, full content). */
export function useBlogPostBySlug(slug: string | undefined) {
  const [post, setPost] = useState<PublicBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    supabase
      .from("blog_posts")
      .select(`*, ${EMBED}`)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setLoading(false);
        } else if (data) {
          // Fetch the related posts from blog_related_posts junction table
          supabase
            .from("blog_related_posts")
            .select("related_post_id")
            .eq("post_id", data.id)
            .then(async ({ data: relData, error: relErr }) => {
              if (relErr) {
                console.error("Error fetching related posts:", relErr.message);
                setPost(normalize(data));
              } else {
                const relIds = (relData ?? []).map((r: any) => r.related_post_id);
                if (relIds.length > 0) {
                  // Fetch slug and title for matching posts
                  const { data: postsData, error: postsErr } = await supabase
                    .from("blog_posts")
                    .select("title, slug")
                    .in("id", relIds)
                    .is("deleted_at", null);
                  
                  if (postsErr) {
                    console.error("Error fetching related posts details:", postsErr.message);
                    setPost(normalize(data));
                  } else {
                    const relatedLinks = (postsData ?? []).map((p: any) => ({
                      url: `https://blog.theconverseai.com/${p.slug}`,
                      label: p.title,
                    }));
                    const normalized = normalize(data);
                    normalized.related_page_links = relatedLinks;
                    setPost(normalized);
                  }
                } else {
                  setPost(normalize(data));
                }
              }
              setLoading(false);
            });
        } else {
          setPost(null);
          setLoading(false);
        }
      });
  }, [slug]);

  return { post, loading, error };
}

/** Admin: all posts (all statuses, not deleted), with pagination + search + status filter */
export function useAllBlogPosts(params?: {
  page?: number; pageSize?: number; search?: string; status?: string;
}) {
  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 25;
  const search = params?.search ?? "";
  const status = params?.status ?? "";

  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from("blog_posts")
      .select("id, title, slug, status, seo_score, reading_time, publish_date, created_at, view_count, deleted_at, display_order", { count: "exact" })
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (status && status !== "all") q = q.eq("status", status);
    if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);

    const { data, error: err, count } = await q;
    if (err) setError(err.message);
    else { setPosts((data ?? []) as DbBlogPost[]); setTotal(count ?? 0); }
    setLoading(false);
  }, [page, pageSize, search, status]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  return { posts, total, loading, error, refetch: fetchPosts };
}
