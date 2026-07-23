import { normalizeRoute } from "./routes";

const MAX_TEXT = 220;
const MAX_SECTIONS = 8;
const MAX_LINKS = 12;
const MAX_BUTTONS = 10;
const MAX_JSON = 10000;
const EXCLUDE = "nav, footer, script, style, [aria-hidden='true'], .xai-voice-orb, [class*='whatsapp' i], [class*='chatbot' i]";

type Section = { heading?: string; paragraphs: string[]; lists: string[]; links: { label: string; route: string }[]; buttons: string[] };

function clean(text: string) { return text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT); }
function visible(el: Element) { const style = window.getComputedStyle(el); const rect = el.getBoundingClientRect(); return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width >= 0 && rect.height >= 0; }
function meaningful(text: string) { const value = clean(text); return value.length >= 18 ? value : ""; }
function pushBounded<T>(arr: T[], item: T, max: number) { if (arr.length < max) arr.push(item); }

export function extractCurrentPageContext(route = window.location.pathname) {
  const root = document.querySelector("main") || document.body;
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(EXCLUDE).forEach((el) => el.remove());
  const headings = Array.from(clone.querySelectorAll("h1,h2,h3")).map((h) => ({ level: h.tagName.toLowerCase(), text: clean(h.textContent || "") })).filter((h) => h.text);
  const sections: Section[] = [];
  const sectionEls = [clone, ...Array.from(clone.querySelectorAll("section, article, main > div"))].slice(0, MAX_SECTIONS * 2);
  for (const sectionEl of sectionEls) {
    if (sectionEl !== clone && !visible(sectionEl)) continue;
    const heading = clean(sectionEl.querySelector("h1,h2,h3")?.textContent || "");
    const paragraphs = Array.from(sectionEl.querySelectorAll("p")).map((p) => meaningful(p.textContent || "")).filter(Boolean).slice(0, 4);
    const lists = Array.from(sectionEl.querySelectorAll("li")).map((li) => meaningful(li.textContent || "")).filter(Boolean).slice(0, 8);
    const links = Array.from(sectionEl.querySelectorAll("a[href]")).map((a) => ({ label: clean(a.textContent || ""), route: normalizeRoute(a.getAttribute("href") || "") || "" })).filter((l) => l.label && l.route).slice(0, 4);
    const buttons = Array.from(sectionEl.querySelectorAll("button, [role='button']")).map((b) => clean(b.textContent || b.getAttribute("aria-label") || "")).filter(Boolean).slice(0, 4);
    if (heading || paragraphs.length || lists.length || links.length || buttons.length) pushBounded(sections, { heading, paragraphs, lists, links, buttons }, MAX_SECTIONS);
  }
  const links = Array.from(clone.querySelectorAll("a[href]")).map((a) => ({ label: clean(a.textContent || ""), route: normalizeRoute(a.getAttribute("href") || "") || "" })).filter((l, i, arr) => l.label && l.route && arr.findIndex((x) => x.route === l.route && x.label === l.label) === i).slice(0, MAX_LINKS);
  const buttons = Array.from(clone.querySelectorAll("button, [role='button']")).map((b) => clean(b.textContent || b.getAttribute("aria-label") || "")).filter(Boolean).slice(0, MAX_BUTTONS);
  const result = { currentRoute: route, documentTitle: document.title, headings, sections, meaningfulInternalLinks: links, actionableButtons: buttons, activeTab: clean(document.querySelector("[role='tab'][aria-selected='true']")?.textContent || "") || null, openModalContext: clean(document.querySelector("[role='dialog']")?.textContent || "") || null, currentlyVisibleSection: headings[0]?.text || null, availableSafeActions: ["open_internal_page", "open_section_anchor", "open_service_page", "view_pricing", "open_comparison", "open_case_study", "open_contact_page", "open_book_demo_page"], metaDescriptionFallback: clean(document.querySelector("meta[name='description']")?.getAttribute("content") || "") || null };
  const json = JSON.stringify(result);
  return json.length <= MAX_JSON ? result : { ...result, sections: result.sections.slice(0, 4), meaningfulInternalLinks: result.meaningfulInternalLinks.slice(0, 6), bounded: true };
}

export function getAvailablePageActions(route = window.location.pathname) {
  return [
    { actionId: "open-contact", label: "Open contact page", type: "open_internal_page", targetRoute: "/contact-us", enabled: true },
    { actionId: "open-book-demo", label: "Open book demo page", type: "open_internal_page", targetRoute: "/book-demo", enabled: true },
    { actionId: "view-pricing", label: "View pricing", type: "open_internal_page", targetRoute: "/pricing", enabled: Boolean(normalizeRoute("/pricing")), disabledReason: normalizeRoute("/pricing") ? undefined : "Pricing route is not in the approved public route allowlist." },
    { actionId: "contact-form-fill", label: "Fill contact form", type: "unavailable", enabled: false, disabledReason: "Contact-form tools are not implemented in this phase." },
    { actionId: "blog-narration", label: "Narrate blog", type: "unavailable", enabled: false, disabledReason: "Blog narration tools are not implemented in this phase." },
    { actionId: "schedule-meeting", label: "Schedule meeting", type: "unavailable", enabled: false, disabledReason: "Scheduling tools are not implemented in this phase." },
  ].map((action) => ({ ...action, currentRoute: route }));
}
