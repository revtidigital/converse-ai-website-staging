/** Calculates reading time from HTML content */
export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter((w) => w.length > 0);
  return Math.max(1, Math.ceil(words.length / 200));
}

/** Formats reading time as "3 min read" */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
