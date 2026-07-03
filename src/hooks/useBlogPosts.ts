import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbBlogPost = Tables<"blog_posts">;

export interface RelatedPageLink {
  label: string;
  url: string;
  description: string;
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

export function useBlogPostBySlug(slug: string | undefined) {
  const [post, setPost] = useState<DbBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setPost(data);
        setLoading(false);
      });
  }, [slug]);

  return { post, loading, error };
}

// Admin: fetch all posts (published + drafts)
export function useAllBlogPosts() {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .order("display_order", { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}
