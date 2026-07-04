export interface ParsedLink {
  url: string;
  text: string;
  isInternal: boolean;
  isRelative: boolean;
}

/** Extracts all <a href> links from HTML, classifies as internal or external */
export function parseLinksFromHTML(html: string, siteDomain: string): ParsedLink[] {
  const seen = new Set<string>();
  const links: ParsedLink[] = [];
  const anchorRegex = /<a\s+[^>]*href=["']([^"'>]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[1].trim();
    const rawText = match[2].replace(/<[^>]+>/g, '').trim();

    // Skip special protocols
    if (/^(mailto:|tel:|javascript:|#)/i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    const isRelative = url.startsWith('/') || (!url.startsWith('http://') && !url.startsWith('https://'));
    const isInternal = isRelative || url.includes(siteDomain);

    links.push({ url, text: rawText, isInternal, isRelative });
  }
  return links;
}

/** Extracts all image src URLs from HTML (excludes data: URIs) */
export function extractImageUrls(html: string): string[] {
  const seen = new Set<string>();
  const srcRegex = /src=["']([^"'>]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = srcRegex.exec(html)) !== null) {
    const url = match[1].trim();
    if (!url.startsWith('data:') && !seen.has(url)) {
      seen.add(url);
    }
  }
  return [...seen];
}
