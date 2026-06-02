import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITEMAP_ROUTES } from "../routes/publicRoutes";

const sitemapXml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
const sitemapPaths = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, loc]) => new URL(loc).pathname,
);

describe("sitemap routes", () => {
  it("keeps every sitemap URL wired into the public route manifest", () => {
    expect(sitemapPaths).toHaveLength(32);
    expect(sitemapPaths).toEqual([...SITEMAP_ROUTES]);
  });

  it("does not expose the public pricing URL", () => {
    expect(SITEMAP_ROUTES).not.toContain("/pricing");
    expect(sitemapPaths).not.toContain("/pricing");
  });

  it("does not publish duplicate sitemap URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });
});
