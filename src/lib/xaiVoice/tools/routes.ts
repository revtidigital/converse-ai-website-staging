import { PUBLIC_STATIC_ROUTES } from "@/routes/publicRoutes";

export const APPROVED_PUBLIC_ROUTES = PUBLIC_STATIC_ROUTES.filter((route) => !route.startsWith("/admin") && !route.startsWith("/api") && !route.includes("private-notes"));

export function isApprovedRoute(route: string): boolean {
  return APPROVED_PUBLIC_ROUTES.includes(route as (typeof PUBLIC_STATIC_ROUTES)[number]) || route.startsWith("/case-studies/") || route.startsWith("/blog/") || route.startsWith("/blog-2/");
}

export function normalizeRoute(route: string): string | null {
  try {
    const decoded = decodeURIComponent(route.trim());
    const lower = decoded.toLowerCase();
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
    if (/^(https?:|javascript:|data:|file:|blob:)/i.test(decoded) || /%2f|%5c/i.test(route)) return null;
    if (decoded.includes("..") || decoded.includes("\\")) return null;
    if (lower.startsWith("/admin") || lower.startsWith("/api") || lower.includes("dashboard") || lower.includes("private")) return null;
    const clean = decoded.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    return isApprovedRoute(clean) ? clean : null;
  } catch {
    return null;
  }
}

export function isSafeAnchor(anchor?: string): boolean {
  return !anchor || /^[A-Za-z][A-Za-z0-9_-]{0,80}$/.test(anchor);
}
