import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function toRssDate(dateStr: string): string {
  try { return new Date(dateStr).toUTCString(); } catch { return new Date().toUTCString(); }
}

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
      .select('id, title, slug, excerpt, content_html, publish_date, updated_at')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('publish_date', { ascending: false })
      .limit(50)

    const items = (posts ?? []).map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${toRssDate(post.publish_date ?? post.updated_at)}</pubDate>
      <description>${escapeXml(post.excerpt ?? '')}</description>
      <content:encoded><![CDATA[${post.content_html ?? ''}]]></content:encoded>
    </item>`).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ConverseAI Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Latest AI and automation insights from ConverseAI</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

    return new Response(rss, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=1800',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`Error generating RSS: ${message}`, { status: 500 })
  }
})
