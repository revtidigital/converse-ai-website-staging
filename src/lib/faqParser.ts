/**
 * Utility for detecting and extracting FAQ (Q&A) pairs from blog post HTML.
 * Relies on the browser-native DOMParser API.
 */

export interface FAQPair {
  question: string;
  answer: string;
}

/** Strips all HTML tags from a string and normalises whitespace. */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the inner text of a DOM element without HTML tags. */
function innerText(el: Element): string {
  return stripTags(el.innerHTML ?? '');
}

/**
 * Keywords whose presence in a heading marks the start of an FAQ section.
 */
const FAQ_MARKERS = [
  'faq',
  'faqs',
  'frequently asked questions',
  'common questions',
  'frequently asked',
];

/** Returns true if the element text contains an FAQ section marker. */
function isFAQHeading(el: Element): boolean {
  const text = innerText(el).toLowerCase().trim();
  return FAQ_MARKERS.some((marker) => text.includes(marker));
}

/**
 * Collects all sibling elements after `startEl` until the next heading of the
 * same or higher level is encountered (or the parent runs out of children).
 */
function collectSectionElements(startEl: Element): Element[] {
  const tagName = startEl.tagName.toUpperCase();
  const startLevel = parseInt(tagName.replace('H', ''), 10);
  const siblings: Element[] = [];

  let next = startEl.nextElementSibling;
  while (next) {
    const nt = next.tagName.toUpperCase();
    if (/^H[1-6]$/.test(nt)) {
      const level = parseInt(nt.replace('H', ''), 10);
      if (level <= startLevel) break; // same/higher heading ends the section
    }
    siblings.push(next);
    next = next.nextElementSibling;
  }

  return siblings;
}

/**
 * Tries to extract FAQ pairs from a list of sibling elements using four
 * different structural patterns commonly found in blog posts.
 */
function extractPairsFromSection(sectionEls: Element[]): FAQPair[] {
  const pairs: FAQPair[] = [];

  let i = 0;
  while (i < sectionEls.length) {
    const el = sectionEls[i];
    const tag = el.tagName.toUpperCase();

    // Pattern 1: <h3>Question</h3> followed by <p>Answer</p>
    if (tag === 'H3') {
      const questionText = innerText(el).replace(/^Q[:.]?\s*/i, '').trim();
      const nextEl = sectionEls[i + 1];
      if (nextEl && nextEl.tagName.toUpperCase() === 'P') {
        const answerText = innerText(nextEl).replace(/^A[:.]?\s*/i, '').trim();
        if (questionText && answerText) {
          pairs.push({ question: questionText, answer: answerText });
          i += 2;
          continue;
        }
      }
    }

    // Pattern 2: <dt>Question</dt><dd>Answer</dd> (definition list items
    //            inside a <dl> block that is itself in the section)
    if (tag === 'DL') {
      const dts = Array.from(el.querySelectorAll('dt'));
      dts.forEach((dt) => {
        const dd = dt.nextElementSibling;
        if (dd && dd.tagName.toUpperCase() === 'DD') {
          const q = innerText(dt).trim();
          const a = innerText(dd).trim();
          if (q && a) pairs.push({ question: q, answer: a });
        }
      });
      i++;
      continue;
    }

    // Pattern 3: <h4>Q: Question</h4> followed by <p>A: Answer</p>
    if (tag === 'H4') {
      const raw = innerText(el);
      const isQPattern = /^Q[:.]?\s+/i.test(raw);
      const questionText = raw.replace(/^Q[:.]?\s*/i, '').trim();
      const nextEl = sectionEls[i + 1];
      if (isQPattern && nextEl && nextEl.tagName.toUpperCase() === 'P') {
        const answerRaw = innerText(nextEl);
        const isAPattern = /^A[:.]?\s+/i.test(answerRaw);
        if (isAPattern) {
          const answerText = answerRaw.replace(/^A[:.]?\s*/i, '').trim();
          if (questionText && answerText) {
            pairs.push({ question: questionText, answer: answerText });
            i += 2;
            continue;
          }
        }
      }
    }

    // Pattern 4: <p><strong>Question?</strong></p> followed by answer text
    if (tag === 'P') {
      const strong = el.querySelector('strong');
      if (strong) {
        const questionText = innerText(strong).trim();
        const isQuestion =
          questionText.endsWith('?') || questionText.length > 10;
        if (isQuestion) {
          // Gather the following <p> elements as combined answer
          const answerParts: string[] = [];
          let j = i + 1;
          while (j < sectionEls.length) {
            const candidate = sectionEls[j];
            const ct = candidate.tagName.toUpperCase();
            if (ct === 'P' && !candidate.querySelector('strong')) {
              answerParts.push(innerText(candidate).trim());
              j++;
            } else {
              break;
            }
          }
          if (questionText && answerParts.length > 0) {
            pairs.push({
              question: questionText,
              answer: answerParts.join(' '),
            });
            i = j;
            continue;
          }
        }
      }
    }

    i++;
  }

  return pairs;
}

/**
 * Parses FAQ Q&A pairs from a blog post HTML string.
 *
 * Detection strategy:
 * 1. Parse the HTML with DOMParser.
 * 2. Find any heading (h1–h6) whose text matches known FAQ markers.
 * 3. Collect all sibling elements until the next same/higher heading.
 * 4. Extract pairs using four structural patterns.
 *
 * @param html - The full HTML content of the blog post.
 * @returns Array of `{ question, answer }` objects; empty if none found.
 */
export function parseFAQsFromHTML(html: string): FAQPair[] {
  if (!html || typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allHeadings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const faqHeadings = allHeadings.filter(isFAQHeading);

  if (faqHeadings.length === 0) return [];

  const allPairs: FAQPair[] = [];

  for (const heading of faqHeadings) {
    const sectionEls = collectSectionElements(heading);
    const pairs = extractPairsFromSection(sectionEls);
    allPairs.push(...pairs);
  }

  // Deduplicate by question text
  const seen = new Set<string>();
  return allPairs.filter(({ question }) => {
    if (seen.has(question)) return false;
    seen.add(question);
    return true;
  });
}
