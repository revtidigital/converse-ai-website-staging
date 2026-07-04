export type CheckStatus = 'pass' | 'warn' | 'fail';

export interface SEOCheck {
  id: string;
  category: 'seo' | 'accessibility' | 'performance';
  title: string;
  description: string;
  status: CheckStatus;
  message: string;
}

export interface SEOAnalysisResult {
  score: number;
  seoScore: number;
  a11yScore: number;
  checks: SEOCheck[];
}

interface PostInput {
  title: string;
  seo_title: string;
  meta_description: string;
  content_html: string;
  focus_keyphrase: string;
  canonical_url: string;
  featured_image_id: number | null;
  excerpt: string;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(html: string): number {
  return stripTags(html).split(' ').filter((w) => w.length > 0).length;
}

function getHeadings(html: string): { level: number; text: string }[] {
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { level: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1]), text: stripTags(m[2]) });
  }
  return headings;
}

function check(
  id: string,
  category: 'seo' | 'accessibility' | 'performance',
  title: string,
  description: string,
  status: CheckStatus,
  message: string
): SEOCheck {
  return { id, category, title, description, status, message };
}

export function analyzeSEO(post: PostInput): SEOAnalysisResult {
  const checks: SEOCheck[] = [];
  const { seo_title, meta_description, content_html, focus_keyphrase, canonical_url, featured_image_id, excerpt } = post;
  const headings = getHeadings(content_html);
  const wordCount = countWords(content_html);
  const h1s = headings.filter((h) => h.level === 1);

  // ── SEO CHECKS ──────────────────────────────────────────────────────────

  // 1. SEO Title set
  checks.push(check('seo_title_set', 'seo', 'SEO Title', 'SEO title should be set',
    seo_title.trim() ? 'pass' : 'fail',
    seo_title.trim() ? 'SEO title is set' : 'SEO title is missing'));

  // 2. SEO Title length
  const titleLen = seo_title.trim().length;
  const titleStatus: CheckStatus = titleLen >= 50 && titleLen <= 60 ? 'pass' : titleLen >= 30 && titleLen <= 70 ? 'warn' : titleLen === 0 ? 'fail' : 'warn';
  checks.push(check('seo_title_length', 'seo', 'SEO Title Length', 'Ideal: 50–60 characters',
    titleStatus, `SEO title is ${titleLen} characters (ideal: 50–60)`));

  // 3. Meta description set
  checks.push(check('meta_desc_set', 'seo', 'Meta Description', 'Meta description should be set',
    meta_description.trim() ? 'pass' : 'fail',
    meta_description.trim() ? 'Meta description is set' : 'Meta description is missing'));

  // 4. Meta description length
  const metaLen = meta_description.trim().length;
  const metaStatus: CheckStatus = metaLen >= 120 && metaLen <= 160 ? 'pass' : metaLen >= 60 && metaLen <= 170 ? 'warn' : metaLen === 0 ? 'fail' : 'warn';
  checks.push(check('meta_desc_length', 'seo', 'Meta Description Length', 'Ideal: 120–160 characters',
    metaStatus, `Meta description is ${metaLen} characters (ideal: 120–160)`));

  // 5. H1 present
  checks.push(check('h1_present', 'seo', 'H1 Tag', 'Content should have exactly one H1',
    h1s.length === 1 ? 'pass' : h1s.length === 0 ? 'fail' : 'warn',
    h1s.length === 0 ? 'No H1 tag found in content' : h1s.length > 1 ? `${h1s.length} H1 tags found (should be 1)` : 'H1 tag is present'));

  // 6. H2 present
  const h2Count = headings.filter((h) => h.level === 2).length;
  checks.push(check('h2_present', 'seo', 'H2 Tags', 'Content should have at least one H2',
    h2Count > 0 ? 'pass' : 'warn',
    h2Count > 0 ? `${h2Count} H2 tag(s) found` : 'No H2 tags found — consider adding subheadings'));

  // 7. Focus keyphrase set
  checks.push(check('focus_keyphrase_set', 'seo', 'Focus Keyphrase', 'Focus keyphrase should be set',
    focus_keyphrase.trim() ? 'pass' : 'warn',
    focus_keyphrase.trim() ? 'Focus keyphrase is set' : 'Focus keyphrase is missing'));

  // 8. Keyphrase in SEO title
  const kpInTitle = focus_keyphrase.trim() && seo_title.toLowerCase().includes(focus_keyphrase.toLowerCase());
  checks.push(check('keyphrase_in_title', 'seo', 'Keyphrase in SEO Title', 'Focus keyphrase should appear in SEO title',
    !focus_keyphrase.trim() ? 'warn' : kpInTitle ? 'pass' : 'warn',
    !focus_keyphrase.trim() ? 'Set a focus keyphrase first' : kpInTitle ? 'Keyphrase found in SEO title' : 'Keyphrase not found in SEO title'));

  // 9. Keyphrase in meta description
  const kpInMeta = focus_keyphrase.trim() && meta_description.toLowerCase().includes(focus_keyphrase.toLowerCase());
  checks.push(check('keyphrase_in_meta', 'seo', 'Keyphrase in Meta Description', 'Focus keyphrase should appear in meta description',
    !focus_keyphrase.trim() ? 'warn' : kpInMeta ? 'pass' : 'warn',
    !focus_keyphrase.trim() ? 'Set a focus keyphrase first' : kpInMeta ? 'Keyphrase found in meta description' : 'Keyphrase not found in meta description'));

  // 10. Keyphrase in H1
  const kpInH1 = focus_keyphrase.trim() && h1s.some((h) => h.text.toLowerCase().includes(focus_keyphrase.toLowerCase()));
  checks.push(check('keyphrase_in_h1', 'seo', 'Keyphrase in H1', 'Focus keyphrase should appear in the H1 heading',
    !focus_keyphrase.trim() || h1s.length === 0 ? 'warn' : kpInH1 ? 'pass' : 'warn',
    !kpInH1 ? 'Keyphrase not found in H1' : 'Keyphrase found in H1'));

  // 11. Canonical URL
  checks.push(check('canonical_url_set', 'seo', 'Canonical URL', 'Canonical URL should be set',
    canonical_url.trim() ? 'pass' : 'warn',
    canonical_url.trim() ? 'Canonical URL is set' : 'Canonical URL is not set'));

  // 12. Featured image
  checks.push(check('featured_image_set', 'seo', 'Featured Image', 'A featured image should be set',
    featured_image_id ? 'pass' : 'fail',
    featured_image_id ? 'Featured image is set' : 'Featured image is missing'));

  // 13. Excerpt
  checks.push(check('excerpt_set', 'seo', 'Excerpt', 'A blog excerpt should be written',
    excerpt.trim() ? 'pass' : 'warn',
    excerpt.trim() ? 'Excerpt is set' : 'Excerpt is missing'));

  // 14. Content length
  const contentStatus: CheckStatus = wordCount >= 300 ? 'pass' : wordCount >= 150 ? 'warn' : 'fail';
  checks.push(check('content_length', 'seo', 'Content Length', 'Recommended: 300+ words',
    contentStatus, `Content has ${wordCount} words (recommended: 300+)`));

  // 15. Duplicate H1 (already covered in #5)

  // ── ACCESSIBILITY CHECKS ─────────────────────────────────────────────────

  // 16. Image alt text
  const imgMatches = [...content_html.matchAll(/<img[^>]*>/gi)];
  const imgsWithoutAlt = imgMatches.filter((m) => !/alt=["'][^"']+["']/.test(m[0]));
  checks.push(check('img_alt_text', 'accessibility', 'Image Alt Text', 'All images should have descriptive alt text',
    imgsWithoutAlt.length === 0 ? 'pass' : imgMatches.length === 0 ? 'pass' : 'warn',
    imgsWithoutAlt.length === 0
      ? imgMatches.length === 0 ? 'No images in content' : 'All images have alt text'
      : `${imgsWithoutAlt.length} image(s) missing alt text`));

  // 17. Heading order
  let headingOrderOk = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      headingOrderOk = false;
      break;
    }
  }
  checks.push(check('heading_order', 'accessibility', 'Heading Order', 'Headings should not skip levels (H1→H2→H3)',
    headings.length < 2 || headingOrderOk ? 'pass' : 'warn',
    headingOrderOk ? 'Heading hierarchy is correct' : 'Heading levels skip — e.g. H1 directly to H3'));

  // 18. Link text quality
  const badLinkTexts = ['click here', 'here', 'read more', 'link', 'more', 'this'];
  const anchors = [...content_html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)];
  const badLinks = anchors.filter((m) => badLinkTexts.includes(stripTags(m[1]).toLowerCase().trim()));
  checks.push(check('link_text_quality', 'accessibility', 'Link Text Quality', 'Avoid vague link text like "click here"',
    badLinks.length === 0 ? 'pass' : 'warn',
    badLinks.length === 0 ? 'All link texts are descriptive' : `${badLinks.length} link(s) have vague text`));

  // 19. Empty paragraphs
  const emptyPs = (content_html.match(/<p>(\s|&nbsp;)*<\/p>/gi) ?? []).length;
  checks.push(check('empty_paragraphs', 'accessibility', 'Empty Paragraphs', 'Remove empty paragraphs',
    emptyPs <= 2 ? 'pass' : 'warn',
    emptyPs === 0 ? 'No empty paragraphs' : `${emptyPs} empty paragraph(s) found`));

  // 20. No inline styles
  const styleBlocks = (content_html.match(/<style[^>]*>/gi) ?? []).length;
  checks.push(check('no_inline_styles', 'accessibility', 'Inline Styles', 'Avoid <style> blocks in content',
    styleBlocks === 0 ? 'pass' : 'warn',
    styleBlocks === 0 ? 'No inline style blocks' : `${styleBlocks} <style> block(s) found`));

  // ── PERFORMANCE CHECKS ───────────────────────────────────────────────────

  // 21. Image dimensions
  const imgsWithoutDims = imgMatches.filter((m) => !/width=/.test(m[0]) || !/height=/.test(m[0]));
  checks.push(check('img_dimensions', 'performance', 'Image Dimensions', 'Images should have width and height attributes',
    imgsWithoutDims.length === 0 ? 'pass' : 'warn',
    imgsWithoutDims.length === 0 ? 'All images have dimensions' : `${imgsWithoutDims.length} image(s) missing width/height`));

  // 22. Image count
  checks.push(check('img_count', 'performance', 'Image Count', 'Too many images can slow page load',
    imgMatches.length <= 20 ? 'pass' : 'warn',
    `Content has ${imgMatches.length} image(s)`));

  // 23. No script tags
  const scripts = (content_html.match(/<script[^>]*>/gi) ?? []).length;
  checks.push(check('external_scripts', 'performance', 'Script Tags', 'No <script> tags allowed in content',
    scripts === 0 ? 'pass' : 'fail',
    scripts === 0 ? 'No script tags found' : `${scripts} <script> tag(s) found — these will be stripped`));

  // 24. Content too long
  checks.push(check('content_too_long', 'performance', 'Content Length', 'Very long content may affect readability',
    wordCount <= 5000 ? 'pass' : 'warn',
    wordCount > 5000 ? `Content is very long (${wordCount} words)` : 'Content length is appropriate'));

  // 25. No large images (heuristic: check if src is Supabase)
  const nonOptimized = imgMatches.filter((m) => {
    const srcMatch = m[0].match(/src=["']([^"'>]+)["']/);
    if (!srcMatch) return false;
    const src = srcMatch[1];
    return !src.includes('supabase') && !src.includes('.webp');
  });
  checks.push(check('no_large_images', 'performance', 'Image Optimization', 'Images should be hosted on Supabase and optimized',
    nonOptimized.length === 0 ? 'pass' : 'warn',
    nonOptimized.length === 0 ? 'All images are optimized' : `${nonOptimized.length} image(s) may not be optimized`));

  // ── SCORING ──────────────────────────────────────────────────────────────

  const seoChecks = checks.filter((c) => c.category === 'seo');
  const a11yChecks = checks.filter((c) => c.category !== 'seo');

  const seoRaw = seoChecks.reduce((sum, c) => sum + (c.status === 'pass' ? 4 : c.status === 'warn' ? 2 : 0), 0);
  const a11yRaw = a11yChecks.reduce((sum, c) => sum + (c.status === 'pass' ? 4 : c.status === 'warn' ? 2 : 0), 0);

  const seoMax = seoChecks.length * 4;
  const a11yMax = a11yChecks.length * 4;

  const seoScore = seoMax > 0 ? Math.round((seoRaw / seoMax) * 100) : 0;
  const a11yScore = a11yMax > 0 ? Math.round((a11yRaw / a11yMax) * 100) : 0;
  const score = Math.round((seoScore + a11yScore) / 2);

  return { score, seoScore, a11yScore, checks };
}
