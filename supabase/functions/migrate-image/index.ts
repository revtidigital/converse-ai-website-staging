import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const MAX_FILE_SIZE = 10_485_760 // 10MB

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Derives a safe file name from a URL or a provided fileName.
 * Strips query strings, collapses unsafe characters, and preserves the extension.
 */
function buildSafeFileName(url: string, fileName?: string): string {
  if (fileName && fileName.trim()) {
    return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_')
  }
  const pathname = new URL(url).pathname
  const base = pathname.split('/').pop() ?? 'image'
  return base.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image'
}

Deno.serve(async (req: Request) => {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const responseHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', originalUrl: '' }),
        { status: 405, headers: responseHeaders },
      )
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await req.json().catch(() => null)
    if (!body || typeof body.url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Request body must include a "url" string field', originalUrl: '' }),
        { status: 400, headers: responseHeaders },
      )
    }

    const { url, fileName, postId: _postId, importSessionId: _importSessionId } = body as {
      url: string
      fileName?: string
      postId?: number
      importSessionId?: string
    }

    // ── Validate URL ──────────────────────────────────────────────────────
    if (!isValidUrl(url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format', originalUrl: url }),
        { status: 400, headers: responseHeaders },
      )
    }

    // ── Download image (30s timeout) ──────────────────────────────────────
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30_000)

    let imageRes: Response
    try {
      imageRes = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ConverseAI-ImageMigrator/1.0; +https://theconverseai.com)',
        },
      })
    } catch (err) {
      clearTimeout(timer)
      const message = err instanceof Error ? err.message : String(err)
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${message}`, originalUrl: url }),
        { status: 502, headers: responseHeaders },
      )
    }
    clearTimeout(timer)

    if (!imageRes.ok) {
      return new Response(
        JSON.stringify({
          error: `Remote server returned HTTP ${imageRes.status}`,
          originalUrl: url,
        }),
        { status: 502, headers: responseHeaders },
      )
    }

    // ── Validate MIME type ────────────────────────────────────────────────
    const contentType = (imageRes.headers.get('content-type') ?? '').split(';')[0].trim()
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported MIME type: "${contentType}". Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
          originalUrl: url,
        }),
        { status: 415, headers: responseHeaders },
      )
    }

    // ── Read body & validate size ─────────────────────────────────────────
    const arrayBuffer = await imageRes.arrayBuffer()
    const fileSize = arrayBuffer.byteLength

    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File size ${fileSize} bytes exceeds the 10 MB limit`,
          originalUrl: url,
        }),
        { status: 413, headers: responseHeaders },
      )
    }

    // ── Build storage path ────────────────────────────────────────────────
    const safeName = buildSafeFileName(url, fileName)
    const timestamp = Date.now()
    const storagePath = `originals/${timestamp}-${safeName}`

    // ── Upload to Supabase Storage ────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${uploadError.message}`, originalUrl: url }),
        { status: 500, headers: responseHeaders },
      )
    }

    // ── Get public URL ────────────────────────────────────────────────────
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storagePath)

    const storageUrl = publicUrlData.publicUrl

    return new Response(
      JSON.stringify({
        storageUrl,
        storagePath,
        fileName: safeName,
        mimeType: contentType,
        fileSize,
        originalUrl: url,
        width: null,
        height: null,
      }),
      { status: 200, headers: responseHeaders },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[migrate-image] Unhandled error:', message)
    return new Response(
      JSON.stringify({ error: `Internal server error: ${message}`, originalUrl: '' }),
      { status: 500, headers: responseHeaders },
    )
  }
})
