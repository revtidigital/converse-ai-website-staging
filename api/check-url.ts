// Vercel serverless function: server-side link checker (avoids browser CORS).
// POST { url } -> { status, httpCode, finalUrl?, error? }
// status: 'valid' | 'redirect' | 'broken' | 'empty'

type CheckStatus = "valid" | "redirect" | "broken" | "empty";

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function mapStatus(code: number): CheckStatus {
  if (code >= 200 && code <= 299) return "valid";
  if ([301, 302, 303, 307, 308].includes(code)) return "redirect";
  return "broken";
}

async function fetchWithTimeout(url: string, method: "HEAD" | "GET", ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ConverseAI-LinkChecker/1.0; +https://theconverseai.com)",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, apikey");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ status: "broken", httpCode: 0, error: "Method not allowed" });

  const url: string | undefined = req.body?.url ?? (typeof req.body === "string" ? JSON.parse(req.body || "{}").url : undefined);
  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(200).json({ status: "empty", httpCode: 0 });
  }
  if (!isValidUrl(url.trim())) {
    return res.status(200).json({ status: "broken", httpCode: 0, error: "Invalid URL" });
  }

  const target = url.trim();
  try {
    // Try HEAD first (cheap); some servers reject HEAD -> fall back to GET.
    let resp: Response;
    try {
      resp = await fetchWithTimeout(target, "HEAD", 8000);
      if (resp.status === 405 || resp.status === 501 || resp.status === 403) {
        resp = await fetchWithTimeout(target, "GET", 10000);
      }
    } catch {
      resp = await fetchWithTimeout(target, "GET", 10000);
    }
    const status = mapStatus(resp.status);
    const finalUrl = resp.headers.get("location") ?? undefined;
    return res.status(200).json({ status, httpCode: resp.status, finalUrl });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Timeout" : (err?.message || "Unreachable");
    return res.status(200).json({ status: "broken", httpCode: 0, error: msg });
  }
}
