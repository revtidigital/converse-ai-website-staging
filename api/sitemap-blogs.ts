import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Returns the blog subdomain base URL based on the incoming request host.
 * Staging  → https://blog2.staging.theconverseai.com
 * Production → https://blog.theconverseai.com
 */
function getBlogBaseUrl(req: VercelRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers["host"] as string) || "";
  if (host.includes("staging") || host.includes("vercel.app")) {
    return "https://blog2.staging.theconverseai.com";
  }
  return "https://blog.theconverseai.com";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Individual blog posts — URL is /<slug> on the blog subdomain
    for (const post of posts ?? []) {
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
  } catch (err: any) {
    return res.status(500).send(`Error generating blog sitemap: ${err.message}`);
  }
}
