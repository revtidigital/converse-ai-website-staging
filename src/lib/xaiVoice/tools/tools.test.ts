import { beforeEach, describe, expect, it, vi } from "vitest";
import { XaiToolExecutor } from "./executor";
import { extractCurrentPageContext } from "./pageContext";
import { invalidateSiteKnowledgeCache, searchSiteKnowledge, getSiteKnowledgeCacheSnapshot } from "./siteSearch";
import { navigateSafely } from "./navigation";
import type { PendingToolCall } from "./types";

const context = (signal = new AbortController().signal) => ({ route: "/", routeGeneration: 1, turnGeneration: 1, signal, navigate: vi.fn(), waitForRouteRender: vi.fn(async (route: string, anchor?: string) => `${route}${anchor ? `#${anchor}` : ""}`) });
const call = (overrides: Partial<PendingToolCall> = {}): PendingToolCall => ({ callId: "call_1", name: "get_available_page_actions", argumentsJson: "{}", routeGeneration: 1, turnGeneration: 1, ...overrides });

describe("xAI tool executor", () => {
  it("executes a valid tool and preserves call_id", async () => { const exec = new XaiToolExecutor(); const result = await exec.executeBatch([call()], context()); expect(result.outputs[0].item.call_id).toBe("call_1"); expect(result.shouldContinue).toBe(true); });
  it("rejects unknown tools, malformed JSON, schema failures, oversized args, and stale calls", async () => {
    const exec = new XaiToolExecutor();
    const cases = [call({ name: "bad" }), call({ argumentsJson: "{" }), call({ name: "search_site_knowledge", argumentsJson: JSON.stringify({ query: "ok", extra: true }) }), call({ argumentsJson: "x".repeat(5000) })];
    const { outputs } = await exec.executeBatch(cases, context());
    const body = outputs.map((o) => JSON.parse(o.item.output));
    expect(body.map((b) => b.error?.code)).toEqual(["unknown_tool", "malformed_json", "schema_error", "arguments_too_large"]);
    const stale = await exec.executeBatch([call({ routeGeneration: 0 })], context());
    expect(JSON.parse(stale.outputs[0].item.output).error.code).toBe("stale_call");
  });
  it("supports AbortSignal cancellation and exactly one continuation decision for parallel calls", async () => { const controller = new AbortController(); const exec = new XaiToolExecutor(); exec.beginTurn(); controller.abort(); const result = await exec.executeBatch([call({ callId: "a" }), call({ callId: "b" })], context(controller.signal)); expect(result.outputs).toHaveLength(2); expect(result.shouldContinue).toBe(true); });
  it("explicit stop cancels pending tools", async () => { const exec = new XaiToolExecutor(); exec.beginTurn(); exec.reset(); const result = await exec.executeBatch([call()], context()); expect(result.outputs).toHaveLength(1); });
});

describe("page context", () => {
  beforeEach(() => { document.body.innerHTML = `<main><h1>Visible Heading</h1><p>Meaningful visible paragraph about Converse services and support.</p><p style="display:none">Hidden secret</p><div class="xai-voice-orb">Voice UI</div><a href="/services">Services</a><a href="https://evil.example">External</a><button>Book demo</button></main>`; document.title = "Page title"; });
  it("includes visible content and excludes hidden/widget/external content", () => { const result = extractCurrentPageContext("/"); const json = JSON.stringify(result); expect(json).toContain("Visible Heading"); expect(json).toContain("Meaningful visible paragraph"); expect(json).not.toContain("Hidden secret"); expect(json).not.toContain("Voice UI"); expect(json).not.toContain("evil.example"); });
});

describe("site knowledge search", () => {
  beforeEach(() => { invalidateSiteKnowledgeCache(); vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => "<title>Home</title><h1>AI Voice Agents</h1><p>ConverseAI builds AI voice agents for support.</p>" }))); });
  it("searches approved public routes, returns source and heading, reuses and invalidates cache", async () => { const first = await searchSiteKnowledge({ query: "voice agents", maxResults: 2 }, new AbortController().signal); expect(first.results[0].sourceRoute).toBe("/"); expect(first.results[0].sectionHeading).toBe("AI Voice Agents"); expect(getSiteKnowledgeCacheSnapshot().length).toBeGreaterThan(0); const afterFirst = vi.mocked(fetch).mock.calls.length; await searchSiteKnowledge({ query: "voice agents", maxResults: 2 }, new AbortController().signal); expect(fetch).toHaveBeenCalledTimes(afterFirst); invalidateSiteKnowledgeCache("/"); await searchSiteKnowledge({ query: "voice agents", maxResults: 1 }, new AbortController().signal); expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(afterFirst); });
  it("honestly returns empty results when content cannot be found", async () => { const result = await searchSiteKnowledge({ query: "nonexistentterm", maxResults: 2 }, new AbortController().signal); expect(result.results).toEqual([]); });
});

describe("safe navigation", () => {
  const navigate = vi.fn(); const wait = vi.fn(async (route: string) => route);
  it("allows approved routes", async () => { await expect(navigateSafely({ route: "/services" }, navigate, wait, new AbortController().signal)).resolves.toMatchObject({ ok: true }); });
  it.each(["https://evil.test", "//evil.test", "javascript:alert(1)", "data:text/html,x", "file:///x", "blob:https://x", "/../admin", "/admin", "/api/x", "/unknown"])("blocks unsafe route %s", async (route) => { await expect(navigateSafely({ route }, navigate, wait, new AbortController().signal)).resolves.toMatchObject({ ok: false }); });
  it("blocks unsafe anchors", async () => { await expect(navigateSafely({ route: "/services", anchor: "bad<script>" }, navigate, wait, new AbortController().signal)).resolves.toMatchObject({ ok: false }); });
});
