/** Sanitizes blog HTML: strips dangerous tags/attributes, preserves safe content */
export function sanitizeHtml(html: string): {
  html: string;
  removedCount: number;
  warnings: string[];
} {
  if (typeof window === 'undefined') return { html, removedCount: 0, warnings: [] };

  const warnings: string[] = [];
  let removedCount = 0;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const FORBIDDEN_TAGS = new Set([
    'script', 'object', 'embed', 'form',
    'input', 'button', 'noscript', 'meta',
  ]);

  const ALLOWED_IFRAME_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'loom.com'];

  const DANGEROUS_ATTRS = /^on[a-z]/i;

  function walk(node: Element) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();

        if (FORBIDDEN_TAGS.has(tag)) {
          warnings.push(`Removed <${tag}> element`);
          removedCount++;
          node.removeChild(el);
          continue;
        }

        if (tag === 'iframe') {
          const src = el.getAttribute('src') ?? '';
          const allowed = ALLOWED_IFRAME_DOMAINS.some((d) => src.includes(d));
          if (!allowed) {
            warnings.push(`Removed <iframe> with disallowed src: ${src.slice(0, 60)}`);
            removedCount++;
            node.removeChild(el);
            continue;
          }
        }

        // Strip dangerous attributes
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (DANGEROUS_ATTRS.test(attr.name)) {
            el.removeAttribute(attr.name);
            warnings.push(`Removed event handler attribute: ${attr.name}`);
            removedCount++;
          } else if (attr.name === 'href' && /^javascript:/i.test(attr.value)) {
            el.removeAttribute('href');
            warnings.push('Removed javascript: href');
            removedCount++;
          } else if (attr.name === 'src' && /^data:/i.test(attr.value)) {
            el.removeAttribute('src');
            warnings.push('Removed data: src attribute');
            removedCount++;
          }
        }

        walk(el);
      }
    }
  }

  walk(doc.body);

  return {
    html: doc.body.innerHTML,
    removedCount,
    warnings: [...new Set(warnings)],
  };
}
