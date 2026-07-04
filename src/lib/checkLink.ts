export type LinkCheckStatus = "valid" | "redirect" | "broken" | "empty" | "checking" | "error";

export interface LinkCheckResult {
  status: LinkCheckStatus;
  httpCode: number;
  finalUrl?: string;
  error?: string;
}

/** Check a single URL via the server-side checker (avoids browser CORS). */
export async function checkLink(url: string): Promise<LinkCheckResult> {
  try {
    const res = await fetch("/api/check-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return { status: "error", httpCode: res.status, error: `Checker HTTP ${res.status}` };
    return (await res.json()) as LinkCheckResult;
  } catch (err: any) {
    return { status: "error", httpCode: 0, error: err?.message || "Checker unreachable" };
  }
}

/** Extract all href URLs from an HTML string. */
export function extractLinks(html: string): string[] {
  const urls = new Set<string>();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (/^https?:\/\//i.test(href)) urls.add(href);
  }
  return [...urls];
}
