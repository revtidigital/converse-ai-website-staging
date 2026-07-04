import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogRevision {
  id: number; post_id: number; version_number: number;
  content_html: string; seo_title: string; meta_description: string;
  slug: string; canonical_url: string; updated_by: string;
  change_notes: string; snapshot: Record<string, unknown>; created_at: string;
}

export function useBlogRevisions(postId: number | undefined) {
  const [revisions, setRevisions] = useState<BlogRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blog_revisions')
      .select('*')
      .eq('post_id', postId)
      .order('version_number', { ascending: false });
    setLoading(false);
    if (err) setError(err.message);
    else setRevisions((data ?? []) as BlogRevision[]);
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { revisions, loading, error, refetch: fetch };
}
