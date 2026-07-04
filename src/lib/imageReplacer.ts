/** Replaces old image URLs with new Supabase Storage URLs inside HTML */
export function replaceImageUrls(html: string, urlMap: Record<string, string>): string {
  let result = html;
  for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
    if (!oldUrl || !newUrl) continue;
    // Replace in src="..." and srcset="..."
    const escapedOld = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedOld, 'g'), newUrl);
  }
  return result;
}

/** Extracts all unique image src URLs from HTML (excluding data: URIs) */
export function extractImageUrls(html: string): string[] {
  const seen = new Set<string>();
  const regex = /src=["']([^"'>]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1].trim();
    if (!url.startsWith('data:') && url) seen.add(url);
  }
  return [...seen];
}
