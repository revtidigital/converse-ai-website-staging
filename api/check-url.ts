// Vercel serverless function: server-side link checker (avoids browser CORS).
// POST { url } -> { status, httpCode, finalUrl?, error? }
// status: 'valid' | 'redirect' | 'broken' | 'empty'
//
// NOTE ON "SOFT 404s": theconverseai.com (main site + blog subdomains) is a React
// SPA. Vercel serves index.html with HTTP 200 for EVERY path, so a plain HTTP check
// reports every internal link — even non-existent pages — as "200 OK". To fix that,
// internal links are validated against the real routes/slugs in the database instead
// of trusting the HTTP status. External links keep the normal HEAD/GET check.

import { createClient } from "@supabase/supabase-js";

// Inlined from src/routes/publicRoutes.ts — importing across ../src into this
// serverless function made the Vercel bundle crash on cold start
// (FUNCTION_INVOCATION_FAILED). Keep this list in sync with publicRoutes.ts.
const PUBLIC_STATIC_ROUTES = [
  "/", "/about-us", "/contact-us", "/book-demo", "/blog", "/blog-2",
  "/case-studies", "/solutions/ai-for-smb", "/services",
  "/services/ai-strategy-audit", "/services/agentic-automation",
  "/services/ai-integration", "/services/ai-voice-agents",
  "/services/custom-ai-agents", "/services/knowledge-intelligence",
  "/services/sales-ai", "/chatbot", "/live-chat", "/pre-chat-forms",
  "/omni-channel", "/whatsapp-ai-chatbot", "/whatsapp-shop",
  "/whatsapp-marketing", "/agent-capacity", "/private-notes", "/live-view",
  "/teams", "/agent-reports", "/csat-report", "/team-reports",
  "/inbox-reports", "/terms-and-conditions", "/privacy-policy", "/thank-you",
] as const;

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

// ── Internal (own-domain) soft-404 detection ────────────────────────────────

/** Our own domains — links here are SPA routes and must be validated by route/slug. */
function isInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "theconverseai.com" ||
    h.endsWith(".theconverseai.com") ||
    h.includes("converse-ai-website-staging") || // vercel preview/staging
    h.includes("converse-ai-website-production")
  );
}

function isBlogHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.startsWith("blog.") || h.startsWith("blog2.");
}

/** Strip trailing slash (except root) and decode. */
function normalizePath(pathname: string): string {
  let p = pathname;
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep raw */
  }
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p || "/";
}

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

async function blogSlugExists(slug: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("no-db");
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

async function caseStudySlugExists(slug: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("no-db");
  const { data, error } = await supabase
    .from("case_studies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

async function redirectExists(path: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("no-db");
  const variants = path.endsWith("/") ? [path, path.slice(0, -1)] : [path, `${path}/`];
  const { data, error } = await supabase
    .from("blog_redirects")
    .select("id")
    .in("old_url", variants)
    .limit(1);
  if (error) throw error;
  return !!(data && data.length);
}

/**
 * Validate an internal SPA URL by checking whether the route/slug actually exists.
 * Returns a CheckResult, or null to signal "fall back to the normal HTTP check".
 */
async function checkInternal(u: URL): Promise<{ status: CheckStatus; httpCode: number; error?: string } | null> {
  const host = u.hostname;
  const path = normalizePath(u.pathname);

  try {
    if (isBlogHost(host)) {
      // blog.theconverseai.com/<slug>  (root = blog index)
      if (path === "/") return { status: "valid", httpCode: 200 };
      const seg = path.split("/").filter(Boolean);
      if (seg.length === 1) {
        if ((await blogSlugExists(seg[0])) || (await redirectExists(path))) {
          return { status: "valid", httpCode: 200 };
        }
        return { status: "broken", httpCode: 404, error: "Blog post not found (soft 404)" };
      }
      return { status: "broken", httpCode: 404, error: "Unknown blog path (soft 404)" };
    }

    // ── Main site ──
    // Known static routes (/, /services/..., /pricing, etc.)
    if ((PUBLIC_STATIC_ROUTES as readonly string[]).includes(path)) {
      return { status: "valid", httpCode: 200 };
    }
    // Admin routes exist in the app
    if (path === "/admin" || path.startsWith("/admin/")) {
      return { status: "valid", httpCode: 200 };
    }
    // Dynamic: /case-studies/<slug>
    const cs = path.match(/^\/case-studies\/([^/]+)$/);
    if (cs) {
      if (await caseStudySlugExists(cs[1])) return { status: "valid", httpCode: 200 };
      return { status: "broken", httpCode: 404, error: "Case study not found (soft 404)" };
    }
    // Dynamic: /blog/<slug> and /blog-2/<slug> resolve to blog posts
    const bp = path.match(/^\/blog(?:-2)?\/([^/]+)$/);
    if (bp) {
      if (await blogSlugExists(bp[1])) return { status: "valid", httpCode: 200 };
      return { status: "broken", httpCode: 404, error: "Blog post not found (soft 404)" };
    }
    // Configured redirect?
    if (await redirectExists(path)) return { status: "valid", httpCode: 200 };

    // Nothing matched → this is a soft 404 on the SPA.
    return { status: "broken", httpCode: 404, error: "Page not found (soft 404)" };
  } catch (err: any) {
    // DB unavailable / query failed → let caller fall back to plain HTTP check.
    if (err?.message === "no-db") return null;
    return null;
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

  // Internal links: validate against real routes/slugs (SPA soft-404 fix).
  try {
    const parsed = new URL(target);
    if (isInternalHost(parsed.hostname)) {
      const internal = await checkInternal(parsed);
      if (internal) return res.status(200).json(internal);
      // else: fall through to HTTP check (DB unavailable)
    }
  } catch {
    /* fall through */
  }

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
