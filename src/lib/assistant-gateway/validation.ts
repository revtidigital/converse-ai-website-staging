import type { AssistantGatewayEvent, GatewayRouteContext, GatewaySource } from "./types";

const unsafeProtocol = /^(javascript|data|file|blob):/i;

export function validateGatewayUrl(value: string): URL {
  const url = new URL(value);
  if (!["ws:", "wss:"].includes(url.protocol)) throw new Error("Assistant gateway URL must use ws or wss.");
  return url;
}

export function normalizeGatewayUrl(value: string): string {
  return validateGatewayUrl(value).toString().replace(/\/$/, "");
}

export function isSafeInternalRoute(pathname: string): boolean {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) return false;
  if (unsafeProtocol.test(pathname)) return false;
  if (/\p{Cc}/u.test(pathname)) return false;
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.includes("..") || decoded.includes("\\")) return false;
  } catch {
    return false;
  }
  return !(pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/api" || pathname.startsWith("/api/"));
}

export function sanitizeRouteContext(context?: GatewayRouteContext): GatewayRouteContext | undefined {
  if (!context) return undefined;
  if (!isSafeInternalRoute(context.pathname)) return undefined;
  return {
    pathname: context.pathname,
    title: context.title?.slice(0, 160),
    metaDescription: context.metaDescription?.slice(0, 300),
    headings: context.headings?.slice(0, 8).map((heading) => heading.slice(0, 120))
  };
}

export function validateSource(source: GatewaySource): GatewaySource | null {
  if (!source.title || !isSafeInternalRoute(source.route)) return null;
  if (source.canonicalUrl) {
    try {
      const url = new URL(source.canonicalUrl);
      if (!["http:", "https:"].includes(url.protocol)) return null;
    } catch {
      return null;
    }
  }
  return {
    title: source.title.slice(0, 160),
    route: source.route,
    canonicalUrl: source.canonicalUrl,
    heading: source.heading?.slice(0, 160),
    snippet: source.snippet?.slice(0, 500),
    contentType: source.contentType?.slice(0, 80)
  };
}

export function parseGatewayEvent(value: string): AssistantGatewayEvent | null {
  const parsed = JSON.parse(value) as AssistantGatewayEvent;
  if (parsed.type === "response.completed") {
    return { ...parsed, sources: parsed.sources?.map(validateSource).filter((source): source is GatewaySource => source !== null) };
  }
  return parsed;
}
