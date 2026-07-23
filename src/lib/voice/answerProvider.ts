import { retrievePageSections, extractPageKnowledge, type PageKnowledgeSection } from "./pageKnowledge";
import { toSentences } from "./pageContent";

export interface AnswerProviderContext { pathname: string; lastTopic?: string; lastAnswer?: string; signal?: AbortSignal; }
export interface AnswerProviderResult { answer: string; topic?: string; sections: PageKnowledgeSection[]; }
export interface AnswerProvider { generate(question: string, ctx: AnswerProviderContext): Promise<AnswerProviderResult>; }

const conversationalize = (text: string) => {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "I couldn't find that information on this page.";
  const end = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return end.replace(/^(and|but|so)\s+/i, "").replace(/\bclick here\b/gi, "use the relevant link");
};

function directAnswer(question: string, sections: PageKnowledgeSection[]) {
  const context = sections.map(s => s.text).join(" ");
  const sentences = toSentences(context);
  const first = sentences.slice(0, /detail|more|explain|how/i.test(question) ? 5 : 3).join(" ");
  return conversationalize(first || context.slice(0, 420));
}

class DeterministicAnswerProvider implements AnswerProvider {
  async generate(question: string, ctx: AnswerProviderContext): Promise<AnswerProviderResult> {
    const knowledge = extractPageKnowledge(ctx.pathname);
    const sections = retrievePageSections(question, knowledge, 6);
    if (ctx.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (!sections.length) {
      return { answer: "I don't see that information in the current page content. I can help you navigate to a related page if you'd like.", sections: [] };
    }
    const topic = sections[0].headingPath.at(-1) || knowledge.title;
    return { answer: directAnswer(question, sections), topic, sections };
  }
}

export const defaultAnswerProvider: AnswerProvider = new DeterministicAnswerProvider();
