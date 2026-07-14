import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function getBlogBaseUrl(req: VercelRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers["host"] as string) || "";
  if (host.includes("staging") || host.includes("vercel.app")) {
    return "https://blog2.staging.theconverseai.com";
  }
  return "https://blog.theconverseai.com";
}

function getCleanBlogHost(req: VercelRequest): string {
  const url = getBlogBaseUrl(req);
  return url.replace(/^https?:\/\//, "");
}

function removeTemplateTag(html: string, pattern: RegExp): string {
  return html.replace(pattern, "");
}

function stripDuplicateSeoDefaults(html: string, head: string): string {
  let stripped = html;

  if (head.includes("<title")) {
    stripped = removeTemplateTag(stripped, /\n?\s*<title>.*?<\/title>/is);
  }

  const managedMetaNames = [
    "description",
    "robots",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
    "author"
  ];
  for (const name of managedMetaNames) {
    if (head.includes(`name="${name}"`)) {
      stripped = removeTemplateTag(stripped, new RegExp(`\\n?\\s*<meta\\s+name=["']${name}["'][^>]*>`, "i"));
    }
  }

  const managedMetaProperties = [
    "og:title",
    "og:description",
    "og:type",
    "og:url",
    "og:image",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
    "og:site_name"
  ];
  for (const property of managedMetaProperties) {
    if (head.includes(`property="${property}"`)) {
      stripped = removeTemplateTag(stripped, new RegExp(`\\n?\\s*<meta\\s+property=["']${property}["'][^>]*>`, "i"));
    }
  }

  if (head.includes('rel="canonical"')) {
    stripped = removeTemplateTag(stripped, /\n?\s*<link\s+rel=["']canonical["'][^>]*>/i);
  }

  return stripped;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, apikey");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Determine path / slug
  const requestUrl = req.url || "/";
  const cleanPath = requestUrl.split("?")[0].replace(/\/$/, "");
  const parts = cleanPath.split("/").filter(Boolean);
  const slug = parts[parts.length - 1] || "";

  const blogBaseUrl = getBlogBaseUrl(req);
  const cleanBlogHost = getCleanBlogHost(req);

  // Load the static index.html template
  let template = "";
  try {
    const htmlPath = path.join(process.cwd(), "dist", "index.html");
    template = fs.readFileSync(htmlPath, "utf8");
  } catch (err: any) {
    console.error("Error reading index.html template:", err.message);
    return res.status(500).send("Server initialization error: index.html not found.");
  }

  // Setup Supabase Client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Database credentials missing. Serving default index.html");
    return res.setHeader("Content-Type", "text/html").send(template);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // If homepage or no slug, serve blog index page metadata
  if (!slug) {
    const title = "ConverseAI Blog - AI Conversations That Feel Human";
    const desc = "Read about custom AI agents, voice assistants, and process automation solutions for businesses.";
    const canonical = `${blogBaseUrl}/`;

    const headTags = [
      `<title data-rh="true">${title}</title>`,
      `<meta data-rh="true" name="description" content="${desc}"/>`,
      `<link data-rh="true" rel="canonical" href="${canonical}"/>`,
      `<meta data-rh="true" property="og:type" content="website"/>`,
      `<meta data-rh="true" property="og:url" content="${canonical}"/>`,
      `<meta data-rh="true" property="og:title" content="${title}"/>`,
      `<meta data-rh="true" property="og:description" content="${desc}"/>`,
      `<meta data-rh="true" name="twitter:card" content="summary_large_image"/>`,
      `<meta data-rh="true" name="twitter:title" content="${title}"/>`,
      `<meta data-rh="true" name="twitter:description" content="${desc}"/>`,
    ].join("\n");

    const modifiedHtml = stripDuplicateSeoDefaults(template, headTags)
      .replace("</head>", `<!-- Prerendered route metadata -->\n${headTags}\n</head>`);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).send(modifiedHtml);
  }

  try {
    // Query published blog post matching the slug
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(`
        title,
        slug,
        excerpt,
        seo_title,
        meta_description,
        canonical_url,
        og_title,
        og_description,
        twitter_title,
        twitter_description,
        featured_image:blog_images!featured_image_id(storage_url),
        og_image:blog_images!og_image_id(storage_url),
        twitter_image:blog_images!twitter_image_id(storage_url)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;

    // If no post found, serve default index.html (client-side Router handles 404)
    if (!post) {
      return res.setHeader("Content-Type", "text/html").send(template);
    }

    const title = post.seo_title || post.title;
    const desc = post.meta_description || post.excerpt;
    const canonical = post.canonical_url || `${blogBaseUrl}/${post.slug}`;
    
    // Resolve storage urls if present
    const fImgUrl = (post.featured_image as any)?.storage_url || "";
    const ogTitle = post.og_title || title;
    const ogDesc = post.og_description || desc;
    const ogImgUrl = (post.og_image as any)?.storage_url || fImgUrl;
    const twTitle = post.twitter_title || title;
    const twDesc = post.twitter_description || desc;
    const twImgUrl = (post.twitter_image as any)?.storage_url || fImgUrl;

    const headTags = [
      `<title data-rh="true">${title}</title>`,
      `<meta data-rh="true" name="description" content="${desc}"/>`,
      `<link data-rh="true" rel="canonical" href="${canonical}"/>`,
      `<meta data-rh="true" property="og:type" content="article"/>`,
      `<meta data-rh="true" property="og:url" content="${blogBaseUrl}/${post.slug}"/>`,
      `<meta data-rh="true" property="og:title" content="${ogTitle}"/>`,
      `<meta data-rh="true" property="og:description" content="${ogDesc}"/>`,
      ogImgUrl ? `<meta data-rh="true" property="og:image" content="${ogImgUrl}"/>` : "",
      `<meta data-rh="true" name="twitter:card" content="summary_large_image"/>`,
      `<meta data-rh="true" name="twitter:title" content="${twTitle}"/>`,
      `<meta data-rh="true" name="twitter:description" content="${twDesc}"/>`,
      twImgUrl ? `<meta data-rh="true" name="twitter:image" content="${twImgUrl}"/>` : "",
      `<meta data-rh="true" name="geo.region" content="IN-RJ"/>`,
      `<meta data-rh="true" name="geo.placename" content="Jaipur"/>`,
    ].filter(Boolean).join("\n");

    const modifiedHtml = stripDuplicateSeoDefaults(template, headTags)
      .replace("</head>", `<!-- Prerendered route metadata -->\n${headTags}\n</head>`);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(modifiedHtml);
  } catch (err: any) {
    console.error("Error serving blog post metadata:", err.message);
    // Serve default index.html in case of backend queries error
    return res.setHeader("Content-Type", "text/html").send(template);
  }
}
