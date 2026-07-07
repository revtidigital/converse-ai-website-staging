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
