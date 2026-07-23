import { describe, expect, it, beforeEach } from "vitest";
import { extractPageKnowledge, invalidatePageKnowledge, retrievePageSections, pageKnowledgeCacheSize } from "@/lib/voice/pageKnowledge";

describe("pageKnowledge", () => {
  beforeEach(() => {
    invalidatePageKnowledge();
    document.body.innerHTML = "";
    document.title = "Fallback title";
  });

  it("extracts visible body content and keeps metadata as last-resort", () => {
    document.head.innerHTML = '<meta name="description" content="Meta only summary">';
    document.body.innerHTML = `<main><h1>Voice Agents</h1><p>Real voice agents answer calls and qualify leads.</p><p hidden>Hidden text</p><footer>Footer duplicate</footer></main>`;
    const k = extractPageKnowledge("/voice", true);
    expect(k.sections.some((s) => s.text.includes("Real voice agents"))).toBe(true);
    expect(k.sections.some((s) => s.text.includes("Hidden text"))).toBe(false);
    const retrieved = retrievePageSections("qualify leads", k, 2);
    expect(retrieved[0].kind).not.toBe("metadata");
    expect(retrieved[0].text).toContain("qualify leads");
  });

  it("deduplicates repeated content and caches until invalidated", () => {
    document.body.innerHTML = `<main><h1>Pricing</h1><p>Custom pricing for each business.</p><p>Custom pricing for each business.</p></main>`;
    const first = extractPageKnowledge("/pricing", true);
    const second = extractPageKnowledge("/pricing");
    expect(second).toBe(first);
    expect(pageKnowledgeCacheSize()).toBe(1);
    expect(first.sections.filter((s) => s.text === "Custom pricing for each business.")).toHaveLength(1);
    invalidatePageKnowledge("/pricing");
    expect(pageKnowledgeCacheSize()).toBe(0);
  });
});
