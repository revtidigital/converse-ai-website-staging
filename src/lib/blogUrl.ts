/**
 * Host-aware blog URL helpers.
 *
 * On the dedicated blog subdomain, posts live at the root (e.g. subdomain/<slug>),
 * while on the main site they point absolutely to the blog subdomain.
 */

export function isBlogHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.startsWith("blog.") || host.startsWith("blog2.");
}

export function getSubdomainHosts(): { mainHost: string; blogHost: string } {
  if (typeof window === "undefined") {
    return { mainHost: "", blogHost: "" };
  }
  const host = window.location.host;
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    const baseHost = host.replace(/^(blog\.|blog2\.)/, "");
    return {
      mainHost: `http://${baseHost}`,
      blogHost: `http://blog.${baseHost}`
    };
  }
  
  // Staging environments
  if (hostname.includes("converse-ai-website-staging") || hostname.includes("staging.theconverseai.com")) {
    return {
      mainHost: "https://staging.theconverseai.com",
      blogHost: "https://blog2.staging.theconverseai.com"
    };
  }
  
  // Production default
  return {
    mainHost: "https://theconverseai.com",
    blogHost: "https://blog.theconverseai.com"
  };
}

/**
 * Canonical origin used for absolute SEO image URLs (og:image, structured data).
 * Mirrors the hardcoded canonical origin so social crawlers always resolve to the
 * live production blog, regardless of which environment renders the page.
 */
export const SEO_IMAGE_ORIGIN = "https://blog.theconverseai.com";

/**
 * Normalize any stored image URL to a host-relative `/storage/...` path.
 *
 * We store relative paths so an image works on any deployed domain (prod blog,
 * staging blog, main site preview) — every domain in the Vercel project proxies
 * `/storage/*` to the Supabase bucket. External (non-storage) URLs are left as-is.
 */
export function toStoragePath(url: string): string {
  if (!url) return url;
  const i = url.indexOf("/storage/");
  return i === -1 ? url : url.slice(i);
}

/**
 * Force an image URL (Supabase storage URL or host-relative path) to use
 * the current environment's absolute blog subdomain host origin.
 */
export function cleanBlogImageUrl(src: string): string {
  if (!src) return "";
  const { blogHost } = getSubdomainHosts();
  
  if (src.includes("supabase.co/storage/")) {
    const i = src.indexOf("/storage/");
    return `${blogHost}${src.slice(i)}`;
  }
  
  if (src.startsWith("/storage/")) {
    return `${blogHost}${src}`;
  }
  
  return src;
}

/**
 * Turn a stored image path into an absolute URL for meta tags / SEO. Relative
 * `/storage/...` paths get the canonical SEO origin; already-absolute URLs pass
 * through unchanged.
 */
export function absoluteImageUrl(src: string): string {
  if (!src || /^https?:\/\//.test(src)) return src;
  return `${SEO_IMAGE_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Path to a single blog post. */
export function blogHref(slug: string): string {
  if (isBlogHost()) {
    return `/${slug}`;
  } else {
    const { blogHost } = getSubdomainHosts();
    return `${blogHost}/${slug}`;
  }
}

/** Path to the blog index/listing. */
export function blogIndexHref(): string {
  if (isBlogHost()) {
    return "/";
  } else {
    const { blogHost } = getSubdomainHosts();
    return `${blogHost}/`;
  }
}
