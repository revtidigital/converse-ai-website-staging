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

function injectSeoMetadata(template: string, headTags: string): string {
  const marker = "<!-- Prerendered route metadata -->";
  const parts = template.split(marker);
  
  if (parts.length > 1) {
    const secondPart = parts[1];
    const headCloseIndex = secondPart.indexOf("</head>");
    if (headCloseIndex !== -1) {
      const bodyAndAfter = secondPart.substring(headCloseIndex);
      return parts[0] + marker + "\n" + headTags + "\n" + bodyAndAfter;
    }
  }

  // Fallback if marker is missing
  return template.replace("</head>", `${marker}\n${headTags}\n</head>`);
}

function injectBodyHtml(template: string, bodyHtml: string): string {
  const rootParts = template.split('<div id="root">');
  if (rootParts.length > 1) {
    const rest = rootParts[1];
    let scriptIndex = rest.indexOf("<script");
    const captchaIndex = rest.indexOf("<!-- ✅ reCAPTCHA");
    
    if (scriptIndex === -1 || (captchaIndex !== -1 && captchaIndex < scriptIndex)) {
      scriptIndex = captchaIndex;
    }
    
    if (scriptIndex !== -1) {
      const afterRoot = rest.substring(scriptIndex);
      const beforeScript = rest.substring(0, scriptIndex);
      const lastDivIndex = beforeScript.lastIndexOf("</div>");
      if (lastDivIndex !== -1) {
        const bodyAndAfter = beforeScript.substring(lastDivIndex + 6) + afterRoot;
        return rootParts[0] + '<div id="root">\n' + bodyHtml + '\n' + bodyAndAfter;
      }
    }
  }

  // Fallback if marker is missing
  return template.replace('<div id="root"></div>', `<div id="root">\n${bodyHtml}\n</div>`);
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

    let bodyHtml = `<div id="root"></div>`;
    try {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("title, slug, excerpt, publish_date")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("publish_date", { ascending: false });

      const postItems = (posts || []).map(p => `
        <li style="margin-bottom: 30px; list-style: none;">
          <h2 style="font-size: 24px; margin-bottom: 10px;"><a href="${blogBaseUrl}/${p.slug}" style="color: #7c3aed; text-decoration: none; font-weight: 700;">${p.title}</a></h2>
          <p style="color: #4b5563; line-height: 1.6;">${p.excerpt}</p>
        </li>
      `).join("\n");

      bodyHtml = `
<header style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
  <a href="/" style="font-weight: bold; text-decoration: none; font-size: 24px; color: #7c3aed;">ConverseAI</a>
</header>
<main style="max-width: 800px; margin: 40px auto; padding: 0 20px;">
  <h1 style="font-size: 36px; font-weight: 800; margin-bottom: 40px;">ConverseAI Blog</h1>
  <ul>
    ${postItems}
  </ul>
</main>
      `.trim();
    } catch (dbErr: any) {
      console.error("Error fetching posts for blog index body:", dbErr.message);
    }

    const modifiedHtml = injectBodyHtml(injectSeoMetadata(template, headTags), bodyHtml);

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
        content_html,
        publish_date,
        reading_time,
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

    const bodyHtml = `
<header style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
  <a href="/" style="font-weight: bold; text-decoration: none; font-size: 24px; color: #7c3aed;">ConverseAI</a>
  <nav>
    <a href="/" style="margin-left: 20px; text-decoration: none; color: #4b5563;">Home</a>
    <a href="/case-studies" style="margin-left: 20px; text-decoration: none; color: #4b5563;">Case Studies</a>
    <a href="/" style="margin-left: 20px; text-decoration: none; color: #4b5563;">Blog</a>
  </nav>
</header>
<main style="max-width: 800px; margin: 40px auto; padding: 0 20px;">
  <article>
    <header style="margin-bottom: 40px;">
      <h1 style="font-size: 40px; line-height: 1.2; margin-bottom: 20px; font-weight: 800; color: #111827;">${post.title}</h1>
      <div style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        <span>Published on ${post.publish_date || ""}</span>
        <span style="margin: 0 10px;">•</span>
        <span>${post.reading_time || 5} min read</span>
      </div>
      ${fImgUrl ? `<img src="${fImgUrl}" alt="${post.title}" style="width: 100%; border-radius: 12px; margin-bottom: 30px;" />` : ""}
      <p style="font-size: 18px; line-height: 1.6; color: #4b5563; font-style: italic; margin-bottom: 30px;">${post.excerpt}</p>
    </header>
    <section class="wp-post-content" style="line-height: 1.8; color: #1f2937; font-size: 16px;">
      ${post.content_html}
    </section>
  </article>
</main>
<footer style="padding: 40px 20px; border-top: 1px solid #eee; text-align: center; color: #6b7280; font-size: 14px; margin-top: 60px;">
  <p>© ${new Date().getFullYear()} ConverseAI. All rights reserved.</p>
</footer>
    `.trim();

    const modifiedHtml = injectBodyHtml(injectSeoMetadata(template, headTags), bodyHtml);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(modifiedHtml);
  } catch (err: any) {
    console.error("Error serving blog post metadata:", err.message);
    // Serve default index.html in case of backend queries error
    return res.setHeader("Content-Type", "text/html").send(template);
  }
}
