import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogTag { id: number; name: string; slug: string; }

export function useBlogTags() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blog_tags').select('id, name, slug').order('name');
    setLoading(false);
    if (err) setError(err.message);
    else setTags(data ?? []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upsertTag = async (name: string, slug: string): Promise<BlogTag> => {
    const { data, error: err } = await supabase
      .from('blog_tags').upsert({ name, slug }, { onConflict: 'slug' })
      .select('id, name, slug').single();
    if (err) throw new Error(err.message);
    await fetch();
    return data;
  };

  const deleteTag = async (id: number) => {
    const { error: err } = await supabase.from('blog_tags').delete().eq('id', id);
    if (err) throw new Error(err.message);
    await fetch();
  };

  return { tags, loading, error, refetch: fetch, upsertTag, deleteTag };
}
