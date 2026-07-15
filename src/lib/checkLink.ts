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

// ── SEO anchor-text rules ──────────────────────────────────────────────────
// Rule 1: the same anchor text → same URL may appear at most twice; a 3rd is an error.
// Rule 2: a single URL must not be linked from two different anchor texts.
// Applies to both internal and external links; anchor comparison ignores case & extra spaces.
export type AnchorRuleType = "same-link-different-anchor" | "duplicate-anchor-link";

export interface AnchorRuleIssue {
  type: AnchorRuleType;
  url: string;
  anchors: string[]; // human-readable anchor text(s) involved
  count: number;     // occurrences (for the duplicate rule) or number of distinct anchors (for rule 2)
  message: string;   // plain-language explanation shown in the scanner
}

const normalizeAnchor = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();

export function analyzeAnchorRules(links: ExtractedLink[]): AnchorRuleIssue[] {
  const issues: AnchorRuleIssue[] = [];

  // Only keyword anchors matter — skip empty text and bare-URL links (text === url).
  const keyworded = links.filter((l) => {
    const t = normalizeAnchor(l.text);
    return t.length > 0 && t !== normalizeAnchor(l.url);
  });

  // Group by destination URL.
  const byUrl = new Map<string, ExtractedLink[]>();
  for (const l of keyworded) {
    const arr = byUrl.get(l.url) ?? [];
    arr.push(l);
    byUrl.set(l.url, arr);
  }

  for (const [url, group] of byUrl) {
    const firstSeen = new Map<string, string>(); // normalized -> original anchor text
    const counts = new Map<string, number>();     // normalized -> occurrences
    for (const l of group) {
      const n = normalizeAnchor(l.text);
      if (!firstSeen.has(n)) firstSeen.set(n, l.text.trim());
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }

    // Rule 2 — same link, different anchor texts.
    if (firstSeen.size > 1) {
      const anchors = Array.from(firstSeen.values());
      issues.push({
        type: "same-link-different-anchor",
        url,
        anchors,
        count: firstSeen.size,
        message: `This URL is linked using ${firstSeen.size} different anchor texts (${anchors.map((a) => `"${a}"`).join(", ")}). Use one consistent anchor text for the same link.`,
      });
    }

    // Rule 1 — same anchor + same link more than twice.
    for (const [n, c] of counts) {
      if (c > 2) {
        issues.push({
          type: "duplicate-anchor-link",
          url,
          anchors: [firstSeen.get(n)!],
          count: c,
          message: `"${firstSeen.get(n)}" links to this URL ${c} times. The same anchor → link may appear at most 2 times per post.`,
        });
      }
    }
  }

  return issues;
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
