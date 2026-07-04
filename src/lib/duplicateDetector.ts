import { supabase } from '@/integrations/supabase/client';

export interface DuplicateCheckResult {
  duplicateTitle?: { id: number; title: string };
  duplicateSlug?: { id: number; slug: string };
  duplicateSeoTitle?: { id: number; seo_title: string };
  duplicateCanonical?: { id: number; canonical_url: string };
  duplicateKeyphrase?: { id: number; focus_keyphrase: string };
  hasDuplicates: boolean;
}

export async function checkDuplicates(post: {
  title: string;
  slug: string;
  seo_title?: string;
  canonical_url?: string;
  focus_keyphrase?: string;
  excludeId?: number;
}): Promise<DuplicateCheckResult> {
  const result: DuplicateCheckResult = { hasDuplicates: false };

  const buildQuery = (column: string, value: string) => {
    let q = supabase
      .from('blog_posts')
      .select('id, ' + column)
      .eq(column, value)
      .is('deleted_at', null)
      .limit(1);
    if (post.excludeId) q = q.neq('id', post.excludeId);
    return q;
  };

  const checks = await Promise.allSettled([
    post.title.trim() ? buildQuery('title', post.title.trim()) : null,
    post.slug.trim() ? buildQuery('slug', post.slug.trim()) : null,
    post.seo_title?.trim() ? buildQuery('seo_title', post.seo_title.trim()) : null,
    post.canonical_url?.trim() ? buildQuery('canonical_url', post.canonical_url.trim()) : null,
    post.focus_keyphrase?.trim() ? buildQuery('focus_keyphrase', post.focus_keyphrase.trim()) : null,
  ]);

  const [titleRes, slugRes, seoTitleRes, canonicalRes, keyphraseRes] = checks;

  if (titleRes?.status === 'fulfilled' && titleRes.value) {
    const { data } = titleRes.value as { data: any[] | null };
    if (data && data.length > 0) result.duplicateTitle = data[0];
  }
  if (slugRes?.status === 'fulfilled' && slugRes.value) {
    const { data } = slugRes.value as { data: any[] | null };
    if (data && data.length > 0) result.duplicateSlug = data[0];
  }
  if (seoTitleRes?.status === 'fulfilled' && seoTitleRes.value) {
    const { data } = seoTitleRes.value as { data: any[] | null };
    if (data && data.length > 0) result.duplicateSeoTitle = data[0];
  }
  if (canonicalRes?.status === 'fulfilled' && canonicalRes.value) {
    const { data } = canonicalRes.value as { data: any[] | null };
    if (data && data.length > 0) result.duplicateCanonical = data[0];
  }
  if (keyphraseRes?.status === 'fulfilled' && keyphraseRes.value) {
    const { data } = keyphraseRes.value as { data: any[] | null };
    if (data && data.length > 0) result.duplicateKeyphrase = data[0];
  }

  result.hasDuplicates = !!(
    result.duplicateTitle ||
    result.duplicateSlug ||
    result.duplicateSeoTitle ||
    result.duplicateCanonical ||
    result.duplicateKeyphrase
  );

  return result;
}
