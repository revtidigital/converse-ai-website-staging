const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CheckStatus = 'valid' | 'redirect' | 'broken' | 'empty'

interface CheckResult {
  status: CheckStatus
  httpCode: number
  finalUrl?: string
  error?: string
  checkedAt: string
}

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchWithTimeout(
  url: string,
  method: 'HEAD' | 'GET',
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ConverseAI-LinkChecker/1.0; +https://theconverseai.com)',
      },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

function mapStatus(httpCode: number): CheckStatus {
  if (httpCode >= 200 && httpCode <= 299) return 'valid'
  if ([301, 302, 307, 308].includes(httpCode)) return 'redirect'
  if ((httpCode >= 400 && httpCode <= 499) || (httpCode >= 500 && httpCode <= 599)) return 'broken'
  // Unexpected codes (1xx, 3xx other) — treat as broken
  return 'broken'
}

Deno.serve(async (req: Request) => {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const responseHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  const checkedAt = new Date().toISOString()

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: responseHeaders },
      )
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await req.json().catch(() => null)
    if (!body || typeof body.url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Request body must include a "url" string field' }),
        { status: 400, headers: responseHeaders },
      )
    }

    const { url } = body as { url: string }

    // ── Empty string shortcut ─────────────────────────────────────────────
    if (url.trim() === '') {
      const result: CheckResult = { status: 'empty', httpCode: 0, checkedAt }
      return new Response(JSON.stringify(result), { status: 200, headers: responseHeaders })
    }

    // ── Validate URL format ───────────────────────────────────────────────
    if (!isValidUrl(url)) {
      const result: CheckResult = {
        status: 'broken',
        httpCode: 0,
        error: 'Invalid URL format',
        checkedAt,
      }
      return new Response(JSON.stringify(result), { status: 200, headers: responseHeaders })
    }

    // ── HEAD request (primary) ────────────────────────────────────────────
    let res: Response | null = null
    let fetchError: string | undefined

    try {
      res = await fetchWithTimeout(url, 'HEAD', 10_000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // If the HEAD itself fails at the network level → try GET before declaring broken
      fetchError = msg
    }

    // ── Fallback: GET if HEAD returned 405 or network failed ──────────────
    if (!res || res.status === 405) {
      try {
        res = await fetchWithTimeout(url, 'GET', 10_000)
        fetchError = undefined
      } catch (err) {
        if (!fetchError) {
          fetchError = err instanceof Error ? err.message : String(err)
        }
      }
    }

    // ── Network / timeout failure ─────────────────────────────────────────
    if (!res) {
      const result: CheckResult = {
        status: 'broken',
        httpCode: 0,
        error: fetchError ?? 'Network error',
        checkedAt,
      }
      return new Response(JSON.stringify(result), { status: 200, headers: responseHeaders })
    }

    // ── Map HTTP status ───────────────────────────────────────────────────
    const httpCode = res.status
    const status = mapStatus(httpCode)

    const result: CheckResult = { status, httpCode, checkedAt }

    if (status === 'redirect') {
      const location = res.headers.get('location') ?? undefined
      if (location) result.finalUrl = location
    }

    return new Response(JSON.stringify(result), { status: 200, headers: responseHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[check-url] Unhandled error:', message)
    const result: CheckResult = {
      status: 'broken',
      httpCode: 0,
      error: `Internal server error: ${message}`,
      checkedAt,
    }
    return new Response(JSON.stringify(result), { status: 500, headers: responseHeaders })
  }
})
