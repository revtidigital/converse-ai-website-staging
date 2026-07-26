// Intent detection. Deterministic, multilingual (English + Romanised Hinglish +
// Devanagari markers). Prompt-injection is checked first so it can never be
// masked as a normal question.

import type { IntentKind, PageContext } from "./types.js";
import { isInjectionAttempt } from "./promptInjection.js";

const STOP = /\b(stop|be quiet|shut up|cancel|chup|ruk(o)?|band karo|bandh karo|rehne do)\b/i;
const REPEAT = /\b(repeat|phir se|dobara|again|kya kaha|firse (bolo|batao))\b/i;
const RESET = /\b(reset|start over|clear|naya|nayi baat|forget (this|everything))\b/i;
const NAV = /\b(open|go to|take me|navigate|visit|show me the|jump to|kholo|khol do|le chalo|dikhao)\b/i;
const PRICE = /\b(pric(e|ing)|cost|kitne? (ka|ki|paisa|rupay)|charge|plan(s)?|kitna lagega)\b/i;
const CONTACT = /\b(contact|reach|email|phone|call|talk to|sales|contact kaise|baat karni|sampark)\b/i;
const CASE = /\b(case stud(y|ies)|success stor|client result|portfolio|projects?)\b/i;
const PAGE_SUM = /\b(this page|is page|yeh page|ye page|current page|is section|is section ko)\b/i;
const BLOG_SUM = /\b(this (blog|article|post)|is (blog|article|post)|is article|ka summary|one[- ]minute summary|conclusion|recommendations)\b/i;
const LATEST_BLOG = /\b(latest|newest|recent|naya)\b[\w\s]{0,20}\b(blog|article|post)\b/i;
const RELATED = /\b(related|similar|milte julte|aur (blog|article)|other (blog|article))\b/i;
const COMPARE = /\b(vs\.?|versus|compare|comparison|better than|difference between|farak|antar|difference|kis me(in)? (behtar|acha))\b/i;
const BLOG = /\b(blog|article|post|likha hai|is me(in)? kya)\b/i;
const SERVICE = /\b(service|voice agent|chatbot|automation|integration|agentic|whatsapp|solution)\b/i;
const PRODUCT = /\b(product|feature|plan|offering)\b/i;
const FAQ = /\b(faq|frequently asked|common question)\b/i;
const FOLLOWUP = /^\s*(aur batao|iske baare|is (ke|ka)|uske baare|us (blog|article)|ye (service|blog)|same (cheez|thing)|and (more|what about)|tell me more|thoda aur|isi ke|about (it|this|that)|iska|uska)\b/i;

export function detectIntent(text: string, page?: PageContext): IntentKind {
  const t = text.trim();
  if (isInjectionAttempt(t)) return "prompt_injection";
  if (STOP.test(t)) return "stop_speaking";
  if (REPEAT.test(t)) return "repeat";
  if (RESET.test(t)) return "reset";

  const onBlog = !!page?.blogSlug;

  if (LATEST_BLOG.test(t)) return "latest_blog";
  if (RELATED.test(t)) return "related_blog";
  if (COMPARE.test(t)) return "comparison";
  if (BLOG_SUM.test(t) && (onBlog || BLOG.test(t))) return "blog_summary";
  if (PAGE_SUM.test(t)) return "page_summary";
  if (NAV.test(t)) return "navigation_request";
  if (PRICE.test(t)) return "pricing_question";
  if (CONTACT.test(t)) return "contact_request";
  if (CASE.test(t)) return "case_study_request";
  if (FAQ.test(t)) return "faq_question";
  if (FOLLOWUP.test(t)) return "follow_up";
  if (BLOG.test(t) || onBlog) return "blog_question";
  if (SERVICE.test(t)) return "service_question";
  if (PRODUCT.test(t)) return "product_question";
  return "website_question";
}
