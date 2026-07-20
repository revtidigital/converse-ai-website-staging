import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Slugs served with robots "noindex, follow" and dropped from the sitemap: old 2025
// hospitality/banking/generic-chatbot posts kept live (backlinks) but out of the index.
// Ref: Dev Fixes July 2026 — Fix #7 (18 posts) & Fix #12 (banking). Inlined (not a shared
// api/_*.ts module) because Vercel excludes underscore-prefixed files from the bundle.
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

// Serialize a JSON-LD object into a <script> tag, escaping "<" so an embedded
// "</script>" in any string value can't break out of the tag.
function jsonLd(obj: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
}

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

function cleanBlogImageUrl(src: string, blogBaseUrl: string): string {
  if (!src) return "";
  if (src.includes("supabase.co/storage/")) {
    const i = src.indexOf("/storage/");
    return `${blogBaseUrl}${src.slice(i)}`;
  }
  if (src.startsWith("/storage/")) {
    return `${blogBaseUrl}${src}`;
  }
  return src;
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

  // ── 301/302 redirects (old slug → new) ────────────────────────────────
  // Managed via /admin/redirects (blog_redirects table). Runs before rendering
  // so retired/renamed slugs hand off link equity instead of soft-404ing.
  if (slug) {
    try {
      // Match encoded and decoded forms (e.g. ₹ arrives as %E2%82%B9), with/without trailing slash.
      let decodedPath = cleanPath;
      try { decodedPath = decodeURIComponent(cleanPath); } catch { /* keep raw */ }
      const variants = Array.from(new Set([
        cleanPath, `${cleanPath}/`, `/${slug}`, `/${slug}/`,
        decodedPath, `${decodedPath}/`,
      ]));
      const { data: redirect } = await supabase
        .from("blog_redirects")
        .select("new_url, redirect_type")
        .in("old_url", variants)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (redirect && redirect.new_url) {
        const target = /^https?:\/\//.test(redirect.new_url)
          ? redirect.new_url
          : `${blogBaseUrl}${redirect.new_url.startsWith("/") ? "" : "/"}${redirect.new_url}`;
        res.setHeader("Location", target);
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.status(redirect.redirect_type === 302 ? 302 : 301).end();
      }
    } catch (redirErr: any) {
      console.error("Redirect lookup failed:", redirErr?.message);
      // fall through to normal rendering
    }
  }

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
        id,
        title,
        slug,
        excerpt,
        content_html,
        publish_date,
        updated_at,
        reading_time,
        seo_title,
        meta_description,
        canonical_url,
        og_title,
        og_description,
        twitter_title,
        twitter_description,
        featured_image:blog_images!featured_image_id(storage_url,original_url),
        og_image:blog_images!og_image_id(storage_url,original_url),
        twitter_image:blog_images!twitter_image_id(storage_url,original_url)
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
    
    // Prefer original_url (the exact WordPress /wp-content URL) for SEO parity; fall back to storage_url for new uploads.
    const imgUrlOf = (img: any, fallback = ""): string =>
      img?.original_url || cleanBlogImageUrl(img?.storage_url || fallback, blogBaseUrl);

    // Resolve image urls, preferring the original WordPress URL where present.
    const rawFeaturedUrl = (post.featured_image as any)?.storage_url || "";
    const fImgUrl = imgUrlOf(post.featured_image);

    const ogTitle = post.og_title || title;
    const ogDesc = post.og_description || desc;
    const ogImgUrl = imgUrlOf(post.og_image, rawFeaturedUrl) || fImgUrl;

    const twTitle = post.twitter_title || title;
    const twDesc = post.twitter_description || desc;
    const twImgUrl = imgUrlOf(post.twitter_image, rawFeaturedUrl) || fImgUrl;

    // FAQ rows (if any) power the FAQPage rich result.
    let faqs: { question: string; answer: string }[] = [];
    try {
      const { data: faqRows } = await supabase
        .from("blog_faqs")
        .select("question, answer, order_index")
        .eq("post_id", (post as any).id)
        .order("order_index", { ascending: true });
      faqs = (faqRows || []).map((f: any) => ({ question: f.question, answer: f.answer }));
    } catch (faqErr: any) {
      console.error("FAQ fetch failed:", faqErr?.message);
    }

    const isNoindex = NOINDEX_SLUGS.has(post.slug);

    const articleSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: desc,
      datePublished: post.publish_date || undefined,
      dateModified: (post as any).updated_at || post.publish_date || undefined,
      author: { "@type": "Organization", name: "ConverseAI", url: "https://theconverseai.com" },
      publisher: {
        "@type": "Organization",
        name: "ConverseAI",
        logo: { "@type": "ImageObject", url: "https://theconverseai.com/logo.png" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    };
    if (ogImgUrl || fImgUrl) articleSchema.image = ogImgUrl || fImgUrl;

    const breadcrumbSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://theconverseai.com/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${blogBaseUrl}/` },
        { "@type": "ListItem", position: 3, name: title, item: canonical },
      ],
    };

    const faqSchema = faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

    const headTags = [
      `<title data-rh="true">${title}</title>`,
      `<meta data-rh="true" name="description" content="${desc}"/>`,
      isNoindex
        ? `<meta data-rh="true" name="robots" content="noindex, follow"/>`
        : `<meta data-rh="true" name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>`,
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
      jsonLd(articleSchema),
      jsonLd(breadcrumbSchema),
      faqSchema ? jsonLd(faqSchema) : "",
    ].filter(Boolean).join("\n");

    const cleanedContentHtml = (post.content_html || "").replace(
      /(src=["'])(https?:\/\/[^"'>]*?supabase\.co\/storage\/[^"'>]*?)(["'])/gi,
      (match, p1, p2, p3) => {
        const i = p2.indexOf("/storage/");
        return `${p1}${blogBaseUrl}${p2.slice(i)}${p3}`;
      }
    ).replace(
      /(src=["'])(\/storage\/[^"'>]*?)(["'])/gi,
      `$1${blogBaseUrl}$2$3`
    );

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
      ${cleanedContentHtml}
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
