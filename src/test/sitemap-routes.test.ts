import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITEMAP_ROUTES } from "../routes/publicRoutes";

const sitemapXml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
const robotsTxt = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc));
const sitemapPaths = sitemapUrls.map((url) => url.pathname);

describe("sitemap routes", () => {
  it("keeps every sitemap URL wired into the public route manifest", () => {
    sitemapPaths.forEach((path) => {
      expect(SITEMAP_ROUTES).toContain(path);
    });
  });

  it("does not expose the public pricing URL", () => {
    expect(SITEMAP_ROUTES).not.toContain("/pricing");
    expect(sitemapPaths).not.toContain("/pricing");
  });

  it("does not publish duplicate sitemap URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });

  it("publishes canonical non-www URLs only", () => {
    sitemapUrls.forEach((url) => {
      expect(url.hostname).not.toContain("www.");
    });
  });

  it("advertises the canonical sitemap URL in robots.txt", () => {
    expect(robotsTxt).toContain("Sitemap: https://theconverseai.com/sitemap.xml");
  });

  it("uses the canonical non-www host for every sitemap URL", () => {
    expect(sitemapUrls.every((url) => url.origin === "https://theconverseai.com")).toBe(true);
  });
});
