import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogAuthor {
  id: number; name: string; slug: string;
  avatar_url: string; designation: string; bio: string;
  social_links: Record<string, string>;
}

export function useBlogAuthors() {
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blog_authors').select('*').order('name');
    setLoading(false);
    if (err) setError(err.message);
    else setAuthors((data ?? []) as BlogAuthor[]);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const saveAuthor = async (author: Partial<BlogAuthor> & { name: string; slug: string }): Promise<BlogAuthor> => {
    const { id, ...rest } = author as any;
    const { data, error: err } = id
      ? await supabase.from('blog_authors').update(rest).eq('id', id).select('*').single()
      : await supabase.from('blog_authors').insert(rest).select('*').single();
    if (err) throw new Error(err.message);
    await fetch();
    return data as BlogAuthor;
  };

  const deleteAuthor = async (id: number) => {
    const { error: err } = await supabase.from('blog_authors').delete().eq('id', id);
    if (err) throw new Error(err.message);
    await fetch();
  };

  return { authors, loading, error, refetch: fetch, saveAuthor, deleteAuthor };
}
