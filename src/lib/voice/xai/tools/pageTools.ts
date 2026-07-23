import { extractPageKnowledge, invalidatePageKnowledge, retrievePageSections, type PageKnowledge, type PageKnowledgeSection } from "../../pageKnowledge";
import { PUBLIC_STATIC_ROUTES, type PublicStaticRoutePath } from "../../../../routes/publicRoutes";
import type { JsonObject, JsonValue, XaiRegisteredTool, XaiToolExecutionContext, XaiToolResult } from "./types";
import { createXaiToolRegistry, XaiToolRegistry } from "./registry";

const MAX_CONTEXT_SECTIONS = 12;
const MAX_SECTION_TEXT = 420;
const MAX_TOTAL_TEXT = 5_500;
const MAX_SITE_CACHE = 32;
const SITE_CACHE_TTL_MS = 5 * 60_000;
const DANGEROUS_PROTOCOL = /^(?:javascript|data|file|blob)\s*:/i;
const approvedRoutes = new Set<string>(PUBLIC_STATIC_ROUTES);

export interface PageToolOptions {
  navigate?: (route: string) => void | Promise<void>;
  getCurrentRoute?: () => string;
  onRouteChange?: (route: string) => void;
  afterNavigationDelayMs?: number;
}

interface CachedKnowledge {
  knowledge: PageKnowledge;
  cachedAt: number;
}

const siteCache = new Map<string, CachedKnowledge>();

function currentRoute() {
  return window.location.pathname || "/";
}

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function clip(text: string, max = MAX_SECTION_TEXT) {
  const cleaned = clean(text);
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

function routeTitle(route: string) {
  if (route === "/") return "Home";
  return route.split("/").filter(Boolean).map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" / ");
}

function makeStaticKnowledge(route: PublicStaticRoutePath): PageKnowledge {
  const title = routeTitle(route);
  return {
    route,
    title,
    extractedAt: Date.now(),
    signature: `static:${route}`,
    sections: [{ id: `static-${route}`, kind: "title", headingPath: [], text: title, route, weight: 1 }],
  };
}

function cacheKnowledge(knowledge: PageKnowledge) {
  siteCache.set(knowledge.route, { knowledge, cachedAt: Date.now() });
  while (siteCache.size > MAX_SITE_CACHE) siteCache.delete(siteCache.keys().next().value as string);
}

function getCachedKnowledge(route: string): PageKnowledge | null {
  const cached = siteCache.get(route);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > SITE_CACHE_TTL_MS) {
    siteCache.delete(route);
    return null;
  }
  return cached.knowledge;
}

function structuredSections(sections: PageKnowledgeSection[]) {
  let total = 0;
  const out: JsonObject[] = [];
  for (const section of sections.slice(0, MAX_CONTEXT_SECTIONS)) {
    const text = clip(section.text);
    if (total + text.length > MAX_TOTAL_TEXT) break;
    total += text.length;
    out.push({
      id: section.id,
      kind: section.kind,
      headingPath: section.headingPath,
      heading: section.headingPath.at(-1) || section.text,
      text,
      weight: section.weight,
    });
  }
  return out;
}

function summarizeKnowledge(knowledge: PageKnowledge): JsonObject {
  const sections = knowledge.sections.filter((section) => section.kind !== "metadata");
  const metadata = knowledge.sections.filter((section) => section.kind === "metadata").slice(0, 1);
  const links = sections.filter((section) => section.kind === "link").slice(0, 8).map((section) => clip(section.text, 120));
  const buttons = sections.filter((section) => section.kind === "link" && /contact|demo|start|learn|read|view|pricing/i.test(section.text)).slice(0, 8).map((section) => clip(section.text, 120));
  return {
    route: knowledge.route,
    title: knowledge.title,
    documentTitle: clean(document.title || knowledge.title),
    extractedAt: knowledge.extractedAt,
    headings: sections.filter((section) => section.kind === "heading").slice(0, 10).map((section) => ({ text: clip(section.text, 140), path: section.headingPath })),
    visibleSections: structuredSections(sections),
    paragraphs: structuredSections(sections.filter((section) => section.kind === "paragraph")),
    lists: structuredSections(sections.filter((section) => section.kind === "list")),
    serviceCards: structuredSections(sections.filter((section) => section.kind === "card" || /service|solution|agent|automation|integration/i.test(section.text))),
    featureCards: structuredSections(sections.filter((section) => /feature|capability|benefit/i.test(section.text))),
    comparisonInformation: structuredSections(sections.filter((section) => section.kind === "table" || /compare|comparison|versus|vs\.?/i.test(section.text))),
    pricingInformation: structuredSections(sections.filter((section) => /pricing|price|plan|cost|subscription/i.test(section.text))),
    faqs: structuredSections(sections.filter((section) => section.kind === "faq" || /\?|faq/i.test(section.text))),
    caseStudyDetails: structuredSections(sections.filter((section) => /case study|customer|results|retail|edtech|healthcare/i.test(section.text))),
    projectDetails: structuredSections(sections.filter((section) => /project|implementation|timeline|requirements/i.test(section.text))),
    contactInformation: structuredSections(sections.filter((section) => section.kind === "form" || /contact|email|phone|schedule|demo/i.test(section.text))),
    meaningfulLinks: links,
    actionableButtons: buttons,
    activeTab: document.querySelector("[role='tab'][aria-selected='true']")?.textContent?.trim() || null,
    openModalContext: document.querySelector("[role='dialog']:not([data-voice-agent])")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) || null,
    currentlyVisibleSection: sections.find((section) => section.kind === "heading")?.text || knowledge.title,
    availableSafeActions: availableActions(knowledge.route),
    metadataLastResort: metadata.map((section) => clip(section.text, 240)),
    unavailable: sections.length === 0,
  };
}

function availableActions(route = currentRoute()): JsonObject[] {
  const actions: JsonObject[] = [
    { id: "open_contact", label: "Open contact page", type: "navigate", targetRoute: "/contact-us", enabled: true },
    { id: "open_demo", label: "Open booking page", type: "navigate", targetRoute: "/book-demo", enabled: true },
    { id: "view_services", label: "View services", type: "navigate", targetRoute: "/services", enabled: true },
    { id: "view_case_studies", label: "View case studies", type: "navigate", targetRoute: "/case-studies", enabled: true },
    { id: "fill_contact_form", label: "Fill contact form", type: "contact", targetRoute: "/contact-us", enabled: false, reason: "Contact tools are not implemented in this phase." },
    { id: "schedule_call", label: "Schedule a call", type: "scheduling", targetRoute: "/book-demo", enabled: false, reason: "Scheduling tools are not implemented in this phase." },
  ];
  if (route.startsWith("/blog")) actions.unshift({ id: "read_current_blog", label: "Read current blog", type: "blog", enabled: false, reason: "Blog tools are not implemented in this phase." });
  return actions;
}

function rejectIfAborted(signal: AbortSignal) {
  if (signal.aborted) return { ok: false, code: "cancelled", error: "Tool call was cancelled" } satisfies XaiToolResult;
  return null;
}

function safeRoute(raw: string): { ok: true; route: string } | { ok: false; error: string; code: string } {
  const value = clean(raw);
  if (!value || value.length > 160) return { ok: false, code: "invalid_route", error: "Route is empty or too long" };
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { return { ok: false, code: "malformed_route", error: "Route is malformed" }; }
  if (DANGEROUS_PROTOCOL.test(decoded) || DANGEROUS_PROTOCOL.test(value)) return { ok: false, code: "blocked_protocol", error: "Dangerous URL protocols are not allowed" };
  if (/^https?:\/\//i.test(decoded) || decoded.startsWith("//")) return { ok: false, code: "external_route_blocked", error: "External URLs are not allowed" };
  if (!decoded.startsWith("/")) return { ok: false, code: "invalid_route", error: "Route must be an internal path" };
  if (decoded.includes("..") || /\/api(?:\/|$)|\/admin(?:\/|$)|\/dashboard(?:\/|$)|\/preview(?:\/|$)|\/private(?:\/|$)/i.test(decoded)) return { ok: false, code: "private_route_blocked", error: "Private or unsafe routes are not allowed" };
  const [path] = decoded.split(/[?#]/);
  if (!approvedRoutes.has(path)) return { ok: false, code: "unknown_route", error: "That page is not an approved public route" };
  return { ok: true, route: path };
}

function safeAnchor(raw?: string): string | null {
  if (!raw) return null;
  const anchor = raw.replace(/^#/, "");
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(anchor)) return null;
  return anchor;
}

export function invalidateSiteKnowledge(route?: string) {
  if (route) siteCache.delete(route);
  else siteCache.clear();
}

export function siteKnowledgeCacheSize() {
  return siteCache.size;
}

export function indexApprovedRouteKnowledge(knowledge: PageKnowledge) {
  if (!approvedRoutes.has(knowledge.route)) return false;
  cacheKnowledge(knowledge);
  return true;
}

export function createPageTools(options: PageToolOptions = {}): XaiRegisteredTool[] {
  const getRoute = options.getCurrentRoute ?? currentRoute;
  return [
    {
      definition: {
        type: "function",
        name: "get_current_page_context",
        description: "Return structured, visible context for the current public website page without raw HTML.",
        parameters: { type: "object", additionalProperties: false, properties: { query: { type: "string", maxLength: 200 } } },
      },
      handler: (args: JsonObject, context: XaiToolExecutionContext) => {
        const aborted = rejectIfAborted(context.signal); if (aborted) return aborted;
        const route = getRoute();
        const knowledge = extractPageKnowledge(route, false);
        cacheKnowledge(knowledge);
        const query = typeof args.query === "string" ? args.query : "";
        const selected = query ? { relevantSections: structuredSections(retrievePageSections(query, knowledge, 6)) } : {};
        return { ok: true, data: { ...summarizeKnowledge(knowledge), ...selected } };
      },
    },
    {
      definition: {
        type: "function",
        name: "search_site_knowledge",
        description: "Search cached, approved public website knowledge for relevant sections across safe internal routes.",
        parameters: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string", minLength: 2, maxLength: 180 }, maxResults: { type: "integer", minimum: 1, maximum: 8 } } },
      },
      handler: async (args: JsonObject, context: XaiToolExecutionContext) => {
        const aborted = rejectIfAborted(context.signal); if (aborted) return aborted;
        const query = String(args.query || "");
        const maxResults = Math.min(Number(args.maxResults || 5), 8);
        const route = getRoute();
        cacheKnowledge(extractPageKnowledge(route, false));
        for (const approved of PUBLIC_STATIC_ROUTES) {
          if (context.signal.aborted) return { ok: false, code: "cancelled", error: "Search was cancelled" };
          if (!getCachedKnowledge(approved)) cacheKnowledge(makeStaticKnowledge(approved));
          if (siteCache.size >= MAX_SITE_CACHE) break;
        }
        const matches = Array.from(siteCache.values()).flatMap(({ knowledge }) => retrievePageSections(query, knowledge, 4).map((section) => ({ knowledge, section })));
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const scored = matches.map(({ knowledge, section }) => {
          const hay = `${knowledge.title} ${section.headingPath.join(" ")} ${section.text}`.toLowerCase();
          const score = words.reduce((n, word) => n + (hay.includes(word) ? 1 : 0), 0) * section.weight;
          return { knowledge, section, score };
        }).filter((match) => match.score > 0).sort((a, b) => b.score - a.score).slice(0, maxResults);
        return { ok: true, data: { query, searchedRoutes: Array.from(siteCache.keys()).filter((cachedRoute) => approvedRoutes.has(cachedRoute)), results: scored.map(({ knowledge, section, score }) => ({ matchedText: clip(section.text), sourceRoute: knowledge.route, pageTitle: knowledge.title, sectionHeading: section.headingPath.at(-1) || section.text, relevanceScore: score, navigationTarget: knowledge.route })) } };
      },
    },
    {
      definition: {
        type: "function",
        name: "get_available_page_actions",
        description: "Return safe actions currently available on the website route without DOM selectors.",
        parameters: { type: "object", additionalProperties: false, properties: {} },
      },
      handler: (_args: JsonObject, context: XaiToolExecutionContext) => {
        const aborted = rejectIfAborted(context.signal); if (aborted) return aborted;
        return { ok: true, data: { route: getRoute(), actions: availableActions(getRoute()) } };
      },
    },
    {
      definition: {
        type: "function",
        name: "navigate_to_page",
        description: "Navigate to an approved internal website route only when the user explicitly asks to open or navigate there.",
        parameters: { type: "object", additionalProperties: false, required: ["route"], properties: { route: { type: "string", minLength: 1, maxLength: 160 }, sectionAnchor: { type: "string", maxLength: 80 } } },
      },
      handler: async (args: JsonObject, context: XaiToolExecutionContext) => {
        const aborted = rejectIfAborted(context.signal); if (aborted) return aborted;
        const checked = safeRoute(String(args.route || ""));
        if (!checked.ok) return { ok: false, code: checked.code, error: checked.error };
        const anchor = typeof args.sectionAnchor === "string" ? safeAnchor(args.sectionAnchor) : null;
        if (args.sectionAnchor && !anchor) return { ok: false, code: "invalid_anchor", error: "Section anchor is not safe" };
        const target = `${checked.route}${anchor ? `#${anchor}` : ""}`;
        await options.navigate?.(target);
        if (!options.navigate) window.history.pushState({}, "", target);
        await new Promise((resolve) => setTimeout(resolve, options.afterNavigationDelayMs ?? 30));
        invalidatePageKnowledge(checked.route);
        invalidateSiteKnowledge(checked.route);
        const finalRoute = currentRoute();
        options.onRouteChange?.(finalRoute);
        return { ok: true, data: { requestedRoute: checked.route, finalRoute, anchor, preservedVoiceSession: true } };
      },
    },
  ];
}

export function createPageToolRegistry(options: PageToolOptions = {}): XaiToolRegistry {
  return createXaiToolRegistry(createPageTools(options));
}
