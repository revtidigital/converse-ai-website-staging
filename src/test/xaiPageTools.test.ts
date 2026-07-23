import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPageTools, indexApprovedRouteKnowledge, invalidateSiteKnowledge, siteKnowledgeCacheSize } from "@/lib/voice/xai/tools/pageTools";
import { invalidatePageKnowledge, type PageKnowledge } from "@/lib/voice/pageKnowledge";

function context(signal = new AbortController().signal) {
  return { sessionId: "s", turnId: 1, routeGenerationId: 1, toolCallId: "call", currentRoute: window.location.pathname, signal };
}

function tool(name: string) {
  const found = createPageTools({ afterNavigationDelayMs: 0 }).find((entry) => entry.definition.name === name);
  if (!found) throw new Error(`missing ${name}`);
  return found;
}

function renderPage() {
  document.title = "Meta description title";
  document.body.innerHTML = `
    <header><a>Duplicate nav</a></header>
    <main>
      <h1>AI Voice Agents</h1>
      <section><h2>Natural voice automation</h2><p>ConverseAI builds voice agents for support, sales, and scheduling workflows.</p><ul><li>Handles follow up questions</li><li>Routes customers safely</li></ul><button>Contact the team</button></section>
      <section style="display:none"><p>Hidden secret content</p></section>
      <section aria-hidden="true"><p>Aria hidden content</p></section>
      <div data-voice-agent><p>Voice agent UI should not appear</p></div>
      <footer>Footer boilerplate</footer>
    </main>
    <meta name="description" content="Metadata should be last resort only">
  `;
}

describe("xAI page tools", () => {
  beforeEach(() => {
    vi.useRealTimers();
    window.history.pushState({}, "", "/services/ai-voice-agents");
    invalidatePageKnowledge();
    invalidateSiteKnowledge();
    renderPage();
  });

  it("get_current_page_context returns bounded visible structured content", async () => {
    const result = await tool("get_current_page_context").handler({ query: "voice support" }, context());
    expect(result.ok).toBe(true);
    const data = result.data as Record<string, unknown>;
    const text = JSON.stringify(data);
    expect(data.route).toBe("/services/ai-voice-agents");
    expect(text).toContain("AI Voice Agents");
    expect(text).toContain("ConverseAI builds voice agents");
    expect(text).not.toContain("Hidden secret content");
    expect(text).not.toContain("Aria hidden content");
    expect(text).not.toContain("Voice agent UI should not appear");
    expect(text.indexOf("ConverseAI builds voice agents")).toBeLessThan(text.indexOf("Metadata should be last resort only"));
    expect(text.length).toBeLessThan(9000);
  });

  it("search_site_knowledge searches approved cached routes and excludes unsafe routes", async () => {
    const seeded: PageKnowledge = {
      route: "/services/sales-ai",
      title: "Sales AI",
      extractedAt: Date.now(),
      signature: "test",
      sections: [{ id: "sales", kind: "paragraph", route: "/services/sales-ai", headingPath: ["Sales AI"], text: "Sales AI automates lead qualification and follow ups.", weight: 3 }],
    };
    expect(indexApprovedRouteKnowledge(seeded)).toBe(true);
    expect(indexApprovedRouteKnowledge({ ...seeded, route: "/admin" })).toBe(false);
    const result = await tool("search_site_knowledge").handler({ query: "lead qualification", maxResults: 3 }, context());
    expect(result.ok).toBe(true);
    const data = result.data as { results: Array<Record<string, unknown>>; searchedRoutes: string[] };
    expect(data.results[0]).toMatchObject({ sourceRoute: "/services/sales-ai", pageTitle: "Sales AI", sectionHeading: "Sales AI" });
    expect(data.searchedRoutes.some((route) => route.startsWith("/admin") || route.startsWith("/api"))).toBe(false);
    const sizeAfterFirstSearch = siteKnowledgeCacheSize();
    await tool("search_site_knowledge").handler({ query: "lead qualification", maxResults: 3 }, context());
    expect(siteKnowledgeCacheSize()).toBe(sizeAfterFirstSearch);
  });

  it("search_site_knowledge honors AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await tool("search_site_knowledge").handler({ query: "anything" }, context(controller.signal));
    expect(result).toMatchObject({ ok: false, code: "cancelled" });
  });

  it("get_available_page_actions returns safe actions only", async () => {
    const result = await tool("get_available_page_actions").handler({}, context());
    expect(result.ok).toBe(true);
    const text = JSON.stringify(result.data);
    expect(text).toContain("Open contact page");
    expect(text).toContain("Contact tools are not implemented in this phase");
    expect(text).not.toContain("querySelector");
  });

  it("navigate_to_page allows approved routes and blocks unsafe routes", async () => {
    const navigated: string[] = [];
    const navigateTool = createPageTools({ navigate: (route) => { navigated.push(route); window.history.pushState({}, "", route); }, afterNavigationDelayMs: 0 }).find((entry) => entry.definition.name === "navigate_to_page")!;
    const ok = await navigateTool.handler({ route: "/contact-us" }, context());
    expect(ok).toMatchObject({ ok: true, data: { finalRoute: "/contact-us", preservedVoiceSession: true } });
    expect(navigated).toEqual(["/contact-us"]);

    for (const bad of ["https://evil.test", "//evil.test", "javascript:alert(1)", "data:text/html,hi", "file:///tmp/a", "blob:https://x", "%6A%61%76%61%73%63%72%69%70%74:alert(1)", "/../admin", "/api/x", "/admin", "/not-a-real-route"]) {
      const blocked = await navigateTool.handler({ route: bad }, context());
      expect(blocked.ok).toBe(false);
    }
  });
});
