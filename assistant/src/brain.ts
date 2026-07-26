// WebsiteBrainService — the single shared orchestrator used by BOTH the text
// endpoint and the realtime voice gateway. There is exactly one place where
// business logic lives.
//
// Pipeline: language → intent → memory → retrieval → confidence policy →
// grounded synthesis → safe-action validation.

import type {
  AssistantAction, AssistantResponse, IntentKind, Language, PageContext, Source,
} from "./types.js";
import { detectLanguage } from "./language.js";
import { detectIntent } from "./intent.js";
import { categorize, isGrounded } from "./confidence.js";
import { retrieve } from "./retriever.js";
import { validateAction } from "./safeActions.js";
import { synthesize, notFound, refusal, unsupported } from "./synthesis.js";
import { scrubSecrets } from "./promptInjection.js";
import type { KnowledgeStore } from "./store.js";
import { InMemoryStore, recordTurn, type MemoryStore, type SessionMemory } from "./memory.js";

export interface BrainInput {
  message: string;
  sessionId: string;
  language?: string; // "auto" | Language
  pageContext?: PageContext;
  concise?: boolean; // voice => true
}

export class WebsiteBrainService {
  constructor(
    private store: KnowledgeStore,
    private memoryStore: MemoryStore = new InMemoryStore(),
  ) {}

  async respond(input: BrainInput): Promise<AssistantResponse> {
    const mem = await this.memoryStore.get(input.sessionId);
    const requested = input.language && input.language !== "auto" ? (input.language as Language) : undefined;
    const language = requested ?? detectLanguage(input.message, mem.language);
    const intent = detectIntent(input.message, input.pageContext);

    // ── Control intents (no retrieval) ──────────────────────────────────────
    const control = this.handleControlIntent(intent, language, mem);
    if (control) {
      if (intent === "reset") await this.memoryStore.reset(input.sessionId);
      return control;
    }

    // ── Retrieval ───────────────────────────────────────────────────────────
    let chunks; let topSimilarity = 0;
    try {
      const r = await retrieve(this.store, {
        query: this.expandFollowup(input.message, intent, mem),
        intent,
        page: input.pageContext,
        recentTopic: mem.topic,
      });
      chunks = r.chunks;
      topSimilarity = r.topSimilarity;
    } catch (err) {
      // Infrastructure failure is NOT low confidence — return a safe unavailable answer.
      return this.infra(language, intent);
    }

    const category = categorize(topSimilarity);

    // ── Low confidence => never invent, never navigate ─────────────────────
    if (!isGrounded(category)) {
      const text = notFound(language);
      await this.persist(input, mem, language, text, undefined);
      return this.pack(text, language, topSimilarity, category, intent, [], { type: "none", target: null });
    }

    // ── Grounded synthesis ──────────────────────────────────────────────────
    const text = synthesize({
      query: input.message,
      language,
      intent,
      chunks,
      concise: input.concise ?? false,
      memoryPrevAnswer: mem.prevAnswer,
    });

    const sources = this.buildSources(chunks);
    const action = this.deriveAction(intent, chunks, category);

    await this.persist(input, mem, language, text, sources, chunks[0]?.title);
    return this.pack(text, language, topSimilarity, category, intent, sources, action);
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private handleControlIntent(intent: IntentKind, language: Language, mem: SessionMemory): AssistantResponse | null {
    const none: AssistantAction = { type: "none", target: null };
    switch (intent) {
      case "prompt_injection":
        return this.pack(refusal(language), language, 0, "low", intent, [], none);
      case "contact_request": {
        // Deterministic, safe routing — not a fabricated fact, so it is not
        // gated by retrieval confidence. Sends the user to the contact page.
        const msg = {
          en: "You can reach the Converse AI team on our contact page, or book a demo to see the product live. Opening the contact page for you.",
          hi: "आप हमारी contact page के ज़रिए Converse AI टीम से संपर्क कर सकते हैं, या live demo book कर सकते हैं। मैं contact page खोल रहा हूँ।",
          hinglish: "Aap hamari contact page se Converse AI team se baat kar sakte ho, ya live demo book kar sakte ho. Main contact page khol raha hoon.",
          mixed: "Aap contact page se Converse AI team se baat kar sakte ho. Main contact page khol raha hoon.",
        }[language];
        const sources: Source[] = [{ title: "Contact Converse AI", route: "/contact-us", sourceType: "contact" }];
        return this.pack(msg, language, 0.9, "high", intent, sources, { type: "open_contact", target: "/contact-us" });
      }
      case "unsupported_general":
        return this.pack(unsupported(language), language, 0, "low", intent, [], none);
      case "stop_speaking":
        return this.pack("", language, 1, "high", intent, [], { type: "stop_speaking", target: null });
      case "reset":
        return this.pack("", language, 1, "high", intent, [], { type: "reset_session", target: null });
      case "repeat":
        return this.pack(mem.prevAnswer ?? "", language, 1, "high", intent, mem.prevSources ?? [], { type: "repeat_response", target: null });
      default:
        return null;
    }
  }

  /** Resolve terse follow-ups ("iske baare mein aur batao") against memory. */
  private expandFollowup(msg: string, intent: IntentKind, mem: SessionMemory): string {
    if (intent === "follow_up" && mem.topic) return `${mem.topic} ${msg}`;
    return msg;
  }

  private deriveAction(intent: IntentKind, chunks: { route: string; blogSlug?: string | null; sourceType: string }[], category: ReturnType<typeof categorize>): AssistantAction {
    if (category === "low") return { type: "none", target: null };
    const top = chunks[0];
    if (!top) return { type: "none", target: null };
    switch (intent) {
      case "navigation_request":
        return validateAction({ type: "navigate", target: top.route });
      case "contact_request":
        return validateAction({ type: "open_contact", target: "/contact-us" });
      case "case_study_request":
        return validateAction({ type: "open_case_study", target: top.route });
      case "blog_question":
      case "blog_summary":
      case "latest_blog":
      case "related_blog":
        return validateAction({ type: "open_blog", target: top.route });
      case "service_question":
        return validateAction({ type: "open_service", target: top.route });
      case "pricing_question":
        return validateAction({ type: "navigate", target: "/services" });
      default:
        return { type: "none", target: null };
    }
  }

  private buildSources(chunks: { title: string; route: string; sourceType: string; canonicalUrl: string }[]): Source[] {
    const seen = new Set<string>();
    const out: Source[] = [];
    for (const c of chunks) {
      if (seen.has(c.route)) continue;
      seen.add(c.route);
      out.push({ title: c.title, route: c.route, sourceType: c.sourceType as Source["sourceType"], canonicalUrl: c.canonicalUrl });
      if (out.length >= 4) break;
    }
    return out;
  }

  private infra(language: Language, intent: IntentKind): AssistantResponse {
    const msg = language === "en"
      ? "Our assistant is temporarily unavailable. Please try again shortly, or browse the site directly."
      : "Assistant abhi temporarily unavailable hai. Thodi der me dobara try karein, ya site directly browse karein.";
    return this.pack(msg, language, 0, "low", intent, [], { type: "none", target: null });
  }

  private async persist(input: BrainInput, mem: SessionMemory, language: Language, text: string, sources?: Source[], topic?: string): Promise<void> {
    mem.language = language;
    mem.route = input.pageContext?.route ?? mem.route;
    if (sources) mem.prevSources = sources;
    recordTurn(mem, input.message, text, topic ?? mem.topic);
    await this.memoryStore.save(input.sessionId, mem);
  }

  private pack(text: string, language: Language, confidence: number, category: ReturnType<typeof categorize>, intent: IntentKind, sources: Source[], action: AssistantAction): AssistantResponse {
    return {
      text: scrubSecrets(text),
      language,
      confidence: Number(confidence.toFixed(3)),
      confidenceCategory: category,
      intent,
      sources,
      action: validateAction(action),
    };
  }
}
