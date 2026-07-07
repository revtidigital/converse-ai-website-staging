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
  const host = window.location.hostname;
  
  // Local development
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const baseHost = host.replace(/^(blog\.|blog2\.)/, "");
    return {
      mainHost: `http://${baseHost}`,
      blogHost: `http://blog.${baseHost}`
    };
  }
  
  // Staging environments
  if (host.includes("converse-ai-website-staging")) {
    return {
      mainHost: "https://converse-ai-website-staging.vercel.app",
      blogHost: "https://blog2.converse-ai-website-staging.vercel.app"
    };
  }
  
  // Production default
  return {
    mainHost: "https://theconverseai.com",
    blogHost: "https://blog.theconverseai.com"
  };
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
