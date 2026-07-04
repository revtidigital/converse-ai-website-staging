/**
 * Host-aware blog URL helpers.
 *
 * On the dedicated blog subdomain (blog.theconverseai.com) posts live at the
 * root — e.g. https://blog.theconverseai.com/<slug> — so links must NOT be
 * prefixed with "/blog". On the main site (theconverseai.com) the blog is
 * nested under "/blog". These helpers pick the right path per host.
 */
export function isBlogHost(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("blog.");
}

/** Path to a single blog post. */
export function blogHref(slug: string): string {
  return isBlogHost() ? `/${slug}` : `/blog/${slug}`;
}

/** Path to the blog index/listing. */
export function blogIndexHref(): string {
  return isBlogHost() ? "/" : "/blog";
}
