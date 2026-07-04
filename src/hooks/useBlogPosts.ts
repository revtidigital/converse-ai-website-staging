import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbBlogPost = Tables<"blog_posts">;

/** Public blog listing — published posts only */
export function useBlogPosts() {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, publish_date, reading_time, seo_title, featured_image_id, author_id, display_order, status, view_count")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("publish_date", { ascending: false });

    if (err) setError(err.message);
    else setPosts((data ?? []) as DbBlogPost[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  return { posts, loading, error, refetch: fetchPosts };
}

/** Fetch a single post by slug (public — published only) */
export function useBlogPostBySlug(slug: string | undefined) {
  const [post, setPost] = useState<DbBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setPost(data);
        setLoading(false);
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
