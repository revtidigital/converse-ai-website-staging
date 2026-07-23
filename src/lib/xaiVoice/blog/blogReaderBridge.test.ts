import { describe, expect, it, beforeEach } from "vitest";
import { extractReadableBlogArticle, getBlogReadingInfo, getBlogReadingState, getNextBlogChunk, interruptBlogReading, listBlogSections, markBlogChunkCompleted, pauseBlogReading, registerBlogReaderBridge, restartBlogReading, resumeBlogReading, startBlogReading, stopBlogReading, unregisterBlogReaderBridge } from "./blogReaderBridge";

const article = {
  id: "post-1",
  route: "/blog/post-1",
  title: "Useful AI Guide",
  description: "A public guide.",
  publishedAt: "2026-01-01",
  estimatedReadingTime: "4 min read",
  contentHtml: `<nav>Navigation should not appear</nav><h2>Intro</h2><p>First paragraph has enough meaningful words to be included in the narrated article content.</p><ul><li>First list item remains first.</li><li>Second list item remains second.</li></ul><h2>Conclusion</h2><p>This conclusion should be read after the introduction.</p><script>alert(1)</script><footer>Footer should not appear</footer>`,
};

beforeEach(() => unregisterBlogReaderBridge());

describe("blog reader bridge", () => {
  it("extracts published article sections without raw boilerplate", () => {
    const extracted = extractReadableBlogArticle(article);
    expect(extracted?.title).toBe("Useful AI Guide");
    expect(extracted?.sections.map((s) => s.heading)).toEqual(["Intro", "Conclusion"]);
    const text = extracted?.chunks.map((c) => c.narrationText).join(" ") ?? "";
    expect(text).toContain("First list item remains first");
    expect(text).not.toContain("Navigation should not appear");
    expect(text).not.toContain("alert(1)");
    expect(text).not.toContain("<p>");
    expect(extracted?.chunks.every((c) => c.narrationText.length <= 950)).toBe(true);
  });

  it("registers only readable blogs and reports safe state", () => {
    expect(registerBlogReaderBridge(article)).toBe(true);
    expect(getBlogReadingInfo(article.route)).toMatchObject({ readable: true, title: "Useful AI Guide" });
    const sections = listBlogSections(article.route);
    expect(sections.ok && sections.data.sections).toHaveLength(2);
  });

  it("starts, completes chunks after playback drain, pauses, resumes, stops, and restarts", () => {
    registerBlogReaderBridge(article);
    const start = startBlogReading({ startMode: "beginning" }, article.route);
    expect(start.ok).toBe(true);
    const chunk = start.ok ? start.data.chunk : null;
    expect(chunk?.narrationText).toContain("Intro");
    expect(chunk && markBlogChunkCompleted(chunk.chunkId, chunk.narrationGeneration, article.route)).toBe(true);
    expect(getNextBlogChunk({}, article.route).ok).toBe(true);
    expect(pauseBlogReading(article.route).ok).toBe(true);
    expect(getNextBlogChunk({}, article.route).ok).toBe(false);
    expect(resumeBlogReading(article.route).ok).toBe(true);
    expect(stopBlogReading(article.route).ok).toBe(true);
    expect(restartBlogReading(article.route).ok).toBe(true);
  });

  it("handles section navigation and interruption without completing stale chunks", () => {
    registerBlogReaderBridge(article);
    const section = startBlogReading({ startMode: "named-section", sectionId: "conclusion" }, article.route);
    expect(section.ok && section.data.chunk.sectionId).toBe("conclusion");
    const chunk = section.ok ? section.data.chunk : null;
    expect(interruptBlogReading(article.route)).toBe(true);
    expect(chunk && markBlogChunkCompleted(chunk.chunkId, chunk.narrationGeneration, article.route)).toBe(false);
    expect(getBlogReadingState(article.route).status).toBe("interrupted");
  });
});
