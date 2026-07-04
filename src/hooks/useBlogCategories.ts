import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogCategory { id: number; name: string; slug: string; }

export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blog_categories').select('id, name, slug').order('name');
    setLoading(false);
    if (err) setError(err.message);
    else setCategories(data ?? []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upsertCategory = async (name: string, slug: string): Promise<BlogCategory> => {
    const { data, error: err } = await supabase
      .from('blog_categories').upsert({ name, slug }, { onConflict: 'slug' })
      .select('id, name, slug').single();
    if (err) throw new Error(err.message);
    await fetch();
    return data;
  };

  const deleteCategory = async (id: number) => {
    const { error: err } = await supabase.from('blog_categories').delete().eq('id', id);
    if (err) throw new Error(err.message);
    await fetch();
  };

  return { categories, loading, error, refetch: fetch, upsertCategory, deleteCategory };
}
