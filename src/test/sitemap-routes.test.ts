import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "../lib/seo";
import { SITEMAP_ROUTES } from "../routes/publicRoutes";

const sitemapXml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
const robotsTxt = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc));
const sitemapPaths = sitemapUrls.map((url) => url.pathname);

describe("sitemap routes", () => {
  it("keeps every sitemap URL wired into the public route manifest", () => {
    expect(sitemapPaths).toHaveLength(33);
    expect(sitemapPaths).toEqual([...SITEMAP_ROUTES]);
  });

  it("does not publish duplicate sitemap URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });

  it("publishes canonical non-www URLs only", () => {
    expect(sitemapUrls.map((url) => url.origin)).toEqual(
      Array.from({ length: sitemapUrls.length }, () => SITE_URL),
    );
  });

  it("advertises the canonical sitemap URL in robots.txt", () => {
    expect(robotsTxt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
