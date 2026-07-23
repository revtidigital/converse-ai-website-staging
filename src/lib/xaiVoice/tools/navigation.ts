import { isSafeAnchor, normalizeRoute } from "./routes";

export async function navigateSafely(args: { route: string; anchor?: string }, navigate: (route: string) => void, waitForRouteRender: (route: string, anchor?: string, signal?: AbortSignal) => Promise<string>, signal: AbortSignal) {
  const route = normalizeRoute(args.route);
  if (!route) return { ok: false, error: { code: "unsafe_route", message: "That page cannot be opened by the voice agent." } } as const;
  if (!isSafeAnchor(args.anchor)) return { ok: false, error: { code: "unsafe_anchor", message: "That page section is not safe to open." } } as const;
  if (args.anchor && !document.getElementById(args.anchor)) {
    const destination = `${route}#${args.anchor}`;
    navigate(destination);
  } else {
    navigate(args.anchor ? `${route}#${args.anchor}` : route);
  }
  const finalRoute = await waitForRouteRender(route, args.anchor, signal);
  if (args.anchor && !document.getElementById(args.anchor)) return { ok: false, error: { code: "missing_anchor", message: "That page section was not found." } } as const;
  return { ok: true, data: { finalRoute, anchor: args.anchor || null } } as const;
}
