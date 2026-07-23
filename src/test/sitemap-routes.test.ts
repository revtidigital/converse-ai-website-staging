import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "../lib/seo";
import { NON_INDEXED_PUBLIC_ROUTES, PUBLIC_STATIC_ROUTES, SITEMAP_ROUTES } from "../routes/publicRoutes";

const sitemapXml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
const robotsTxt = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc));
const sitemapPaths = sitemapUrls.map((url) => url.pathname);

describe("sitemap routes", () => {
  it("keeps every sitemap URL wired into the public route manifest", () => {
    expect(sitemapPaths).toHaveLength(32);
    expect(sitemapPaths).toEqual([...SITEMAP_ROUTES]);
  });


  it("keeps route-only pages routable but excluded from the sitemap", () => {
    expect(PUBLIC_STATIC_ROUTES).toContain("/blog-2");
    expect(PUBLIC_STATIC_ROUTES).toContain("/services/ai-strategy-audit/start");
    expect(NON_INDEXED_PUBLIC_ROUTES).toEqual(expect.arrayContaining(["/blog-2", "/services/ai-strategy-audit/start"]));
    expect(SITEMAP_ROUTES).not.toContain("/blog-2");
    expect(SITEMAP_ROUTES).not.toContain("/services/ai-strategy-audit/start");
    expect(sitemapPaths).not.toContain("/blog-2");
    expect(sitemapPaths).not.toContain("/services/ai-strategy-audit/start");
  });

  it("does not expose the public pricing URL", () => {
    expect(SITEMAP_ROUTES).not.toContain("/pricing");
    expect(sitemapPaths).not.toContain("/pricing");
  });

  it("does not publish duplicate sitemap URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });

  it("publishes canonical www URLs only", () => {
    expect(sitemapUrls.map((url) => url.origin)).toEqual(
      Array.from({ length: sitemapUrls.length }, () => SITE_URL),
    );
  });

  it("does not publish redirected or non-canonical legacy paths", () => {
    expect(sitemapPaths).not.toContain("/teams-2");
  });

  it("advertises the canonical sitemap URL in robots.txt", () => {
    expect(robotsTxt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
