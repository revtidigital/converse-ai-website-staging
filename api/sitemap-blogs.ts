type ApiHeaderValue = string | string[] | undefined;
type ApiRequest = { method?: string; url?: string; headers: Record<string, ApiHeaderValue> };
type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; json(body: unknown): unknown; send(body: string): unknown; end(): unknown };

import { createClient } from "@supabase/supabase-js";

function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Unknown error"; }

// Kept in sync with serve-blog.ts. Inlined (not a shared api/_*.ts) because Vercel
// excludes underscore-prefixed files from the function bundle. Ref: Dev Fixes Jul 2026 #7/#12.
const NOINDEX_SLUGS = new Set<string>([
  "how-hotel-chatbots-is-transforming-indonesias-guest-experience",
  "how-aipowered-chatbot-shaping-hospitality-revenue-management",
  "solving-hospitality-labor-shortages-with-chatbots-smart-frameworks",
  "how-to-combat-rising-operational-costs-without-compromising-quality",
  "improving-your-hotels-online-reputation-strategies-for-success",
  "how-robotics-ai-is-tackling-hospitalitys-labor-challenge",
  "must-have-hotel-management-software",
  "5-ways-hotel-chatbots-can-simplify-refunds-and-cancellations",
  "5-ways-whatsapp-marketing-is-revolutionizing-travel-and-hospitality",
  "how-ai-can-tackle-challenges-faced-by-hotel-managers",
  "how-marketing-teams-can-balance-direct-bookings-and-ota-partnerships",
  "nvidia-ai-diplomacy-signals-a-new-era-for-business-innovation",
  "cybersecurity-in-hospitality-understanding-the-growing-threat-landscape",
  "the-sustainability-shift-in-travel-how-ai-chatbot-can-tackle-it",
  "bridging-the-gap-how-to-combine-automated-and-human-customer-service-for-maximum-efficiency",
  "new-upi-rules-are-here-august-1st-why-your-banks-best-response-is-a-chatbot96",
  "air-indias-response-to-ai171-why-crisis-ready-chatbots-matter",
  "ios-26-just-changed-how-people-answer-calls-heres-how-to-stay-relevant-with-ai",
  "14815-2",
]);

/**
 * Returns the blog subdomain base URL based on the incoming request host.
 * Staging  → https://blog2.staging.theconverseai.com
 * Production → https://blog.theconverseai.com
 */
function getBlogBaseUrl(req: ApiRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers["host"] as string) || "";
  if (host.includes("staging") || host.includes("vercel.app")) {
    return "https://blog2.staging.theconverseai.com";
  }
  return "https://blog.theconverseai.com";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, apikey");
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send("Database credentials missing");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const blogBaseUrl = getBlogBaseUrl(req);

  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, publish_date")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("publish_date", { ascending: false });

    if (error) throw error;

    const urlEntries: string[] = [];

    // Blog index page
    urlEntries.push(`  <url>
    <loc>${blogBaseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);

    // Individual blog posts — URL is /<slug> on the blog subdomain.
    // Skip noindexed posts so Google dequeues them faster.
    for (const post of posts ?? []) {
      if (NOINDEX_SLUGS.has(post.slug)) continue;
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split("T")[0]
        : post.publish_date ?? new Date().toISOString().split("T")[0];

      urlEntries.push(`  <url>
    <loc>${blogBaseUrl}/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(xml);
  } catch (err: unknown) {
    return res.status(500).send(`Error generating blog sitemap: ${errorMessage(err)}`);
  }
}
