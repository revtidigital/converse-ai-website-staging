type ApiHeaderValue = string | string[] | undefined;
type ApiRequest = { method?: string; url?: string; headers: Record<string, ApiHeaderValue> };
type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; json(body: unknown): unknown; send(body: string): unknown; end(): unknown };

import { createClient } from "@supabase/supabase-js";

function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Unknown error"; }

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/about-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/services', priority: '0.8', changefreq: 'monthly' },
  { url: '/case-studies', priority: '0.8', changefreq: 'weekly' },
  { url: '/book-demo', priority: '0.9', changefreq: 'monthly' },
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, apikey");
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send("Database credentials missing");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: settingsData } = await supabase
      .from('cms_settings')
      .select('key, value')
      .eq('key', 'site_url')
      .maybeSingle();

    const siteUrl = (settingsData?.value as string) ?? 'https://theconverseai.com';

    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, publish_date')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('publish_date', { ascending: false });

    const urlEntries: string[] = [];

    // Static pages
    for (const page of STATIC_PAGES) {
      urlEntries.push(`  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    // Blog posts
    for (const post of posts ?? []) {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split('T')[0]
        : post.publish_date ?? new Date().toISOString().split('T')[0];
      urlEntries.push(`  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(xml);
  } catch (err: unknown) {
    return res.status(500).send(`Error generating sitemap: ${errorMessage(err)}`);
  }
}
