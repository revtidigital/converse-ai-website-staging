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

export interface ExtractedLink {
  url: string;
  text: string;
}

/** Extract all href URLs and their text from an HTML string. */
export function extractLinks(html: string, includeRelative = false): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  
  const isAcceptableUrl = (url: string) => {
    if (!url) return false;
    if (/^(mailto:|tel:|javascript:|#)/i.test(url)) return false;
    if (includeRelative) return true;
    return /^https?:\/\//i.test(url);
  };

  if (typeof window === "undefined") {
    // Fallback for non-browser/SSR environments
    const re = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const href = m[1].trim();
      const text = m[2].replace(/<[^>]*>/g, "").trim(); // strip nested HTML
      if (isAcceptableUrl(href)) {
        links.push({ url: href, text: text || href });
      }
    }
    return links;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const aElements = doc.querySelectorAll("a");
    aElements.forEach((a) => {
      const href = a.getAttribute("href")?.trim();
      if (href && isAcceptableUrl(href)) {
        links.push({
          url: href,
          text: a.textContent?.trim() || href,
        });
      }
    });
  } catch (e) {
    // Fallback if parsing fails
    const re = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const href = m[1].trim();
      const text = m[2].replace(/<[^>]*>/g, "").trim();
      if (href && isAcceptableUrl(href)) {
        links.push({ url: href, text: text || href });
      }
    }
  }

  return links;
}
