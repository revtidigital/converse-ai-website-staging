import { APPROVED_PUBLIC_ROUTES, normalizeRoute } from "./routes";

const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHE = 12;
const MAX_RESULT_BYTES = 12000;

type CacheEntry = { route: string; title: string; text: string; headings: string[]; cachedAt: number };
const cache = new Map<string, CacheEntry>();

function compact(text: string) { return text.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function words(value: string) { return value.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2); }
function trimPayload<T>(value: T): T { const json = JSON.stringify(value); if (json.length <= MAX_RESULT_BYTES) return value; const copy = JSON.parse(json) as { results?: unknown[] }; if (Array.isArray(copy.results)) copy.results = copy.results.slice(0, 3); return copy as T; }

export function invalidateSiteKnowledgeCache(route?: string) { if (route) cache.delete(route); else cache.clear(); }
export function getSiteKnowledgeCacheSnapshot() { return Array.from(cache.values()).map(({ route, cachedAt }) => ({ route, cachedAt })); }

async function loadRoute(route: string, signal: AbortSignal): Promise<CacheEntry> {
  const existing = cache.get(route);
  if (existing && Date.now() - existing.cachedAt < CACHE_TTL_MS) return existing;
  const response = await fetch(route, { signal, headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error("Route content unavailable.");
  const html = await response.text();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || route;
  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi)).map((m) => compact(m[1])).filter(Boolean).slice(0, 10);
  const entry = { route, title: compact(title), text: compact(html).slice(0, 14000), headings, cachedAt: Date.now() };
  cache.set(route, entry);
  while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value as string);
  return entry;
}

export async function searchSiteKnowledge(args: { query: string; maxResults?: number }, signal: AbortSignal) {
  const terms = words(args.query);
  const maxResults = Math.min(Math.max(args.maxResults ?? 4, 1), 6);
  if (!terms.length) return { query: args.query, results: [], cache: getSiteKnowledgeCacheSnapshot() };
  const candidateRoutes = APPROVED_PUBLIC_ROUTES.filter((route) => terms.some((term) => route.toLowerCase().includes(term))).slice(0, 5);
  if (!candidateRoutes.includes("/")) candidateRoutes.unshift("/");
  const results: Array<{ matchedText: string; sourceRoute: string; pageTitle: string; sectionHeading: string | null; relevanceScore: number; safeNavigationTarget: string; cachedAt: number }> = [];
  for (const route of candidateRoutes) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const normalized = normalizeRoute(route);
    if (!normalized) continue;
    const entry = await loadRoute(normalized, signal).catch(() => null);
    if (!entry) continue;
    const lower = entry.text.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
    if (!score) continue;
    const firstIndex = Math.max(0, Math.min(...terms.map((term) => lower.indexOf(term)).filter((i) => i >= 0)) - 80);
    results.push({ matchedText: entry.text.slice(firstIndex, firstIndex + 320), sourceRoute: entry.route, pageTitle: entry.title, sectionHeading: entry.headings[0] || null, relevanceScore: score, safeNavigationTarget: entry.route, cachedAt: entry.cachedAt });
  }
  return trimPayload({ query: args.query, results: results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults), cache: getSiteKnowledgeCacheSnapshot() });
}
