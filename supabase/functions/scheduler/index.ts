import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const responseHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' }

  try {
    // 1. Auto-publish scheduled posts
    const { data: published } = await supabase
      .from('blog_posts')
      .update({ status: 'published', publish_date: new Date().toISOString().split('T')[0] })
      .eq('status', 'scheduled')
      .lte('publish_at', new Date().toISOString())
      .is('deleted_at', null)
      .select('id, title')

    // 2. Auto-archive posts past unpublish_at
    const { data: archived } = await supabase
      .from('blog_posts')
      .update({ status: 'archived' })
      .eq('status', 'published')
      .not('unpublish_at', 'is', null)
      .lte('unpublish_at', new Date().toISOString())
      .is('deleted_at', null)
      .select('id, title')

    // 3. Hard-delete trash posts older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: purged } = await supabase
      .from('blog_posts')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo)
      .select('id')

    // 4. Log activity
    await supabase.from('blog_activity_log').insert({
      action: 'scheduler.ran',
      resource_type: 'system',
      resource_title: 'Scheduled job',
      metadata: {
        published: published?.length ?? 0,
        archived: archived?.length ?? 0,
        purged: purged?.length ?? 0,
        timestamp: new Date().toISOString(),
      },
    })

    return new Response(JSON.stringify({
      published: published?.length ?? 0,
      archived: archived?.length ?? 0,
      purged: purged?.length ?? 0,
      timestamp: new Date().toISOString(),
    }), { status: 200, headers: responseHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: responseHeaders })
  }
})
