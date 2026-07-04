import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/about-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/services', priority: '0.8', changefreq: 'monthly' },
  { url: '/case-studies', priority: '0.8', changefreq: 'weekly' },
  { url: '/book-demo', priority: '0.9', changefreq: 'monthly' },
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { data: settingsData } = await supabase.from('cms_settings').select('key, value').eq('key', 'site_url').single()
    const siteUrl = (settingsData?.value as string) ?? 'https://theconverseai.com'

    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, publish_date')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('publish_date', { ascending: false })

    const urlEntries: string[] = []

    // Static pages
    for (const page of STATIC_PAGES) {
      urlEntries.push(`  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
    }

    // Blog posts
    for (const post of posts ?? []) {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split('T')[0]
        : post.publish_date ?? new Date().toISOString().split('T')[0]
      urlEntries.push(`  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`

    return new Response(xml, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`Error generating sitemap: ${message}`, { status: 500 })
  }
})
