export type ReadabilityCheckStatus = 'pass' | 'warn' | 'fail' | 'neutral';

export interface ReadabilityCheck {
  id: string;
  title: string;
  status: ReadabilityCheckStatus;
  message: string;
}

export interface ReadabilityAnalysisResult {
  score: number;
  checks: ReadabilityCheck[];
}

function stripTags(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

const TRANSITION_WORDS = [
  "however", "therefore", "consequently", "furthermore", "moreover", "meanwhile",
  "nevertheless", "besides", "subsequently", "initially", "finally", "additionally",
  "as a result", "because", "but", "in addition", "for example", "for instance",
  "on the other hand", "specifically", "in contrast", "likewise", "similarly",
  "indeed", "in fact", "in other words", "thus", "hence", "although", "even though",
  "though", "while", "whereas"
];

const IRREGULAR_PAST_PARTICIPLES = [
  "done", "written", "seen", "taken", "made", "built", "run", "shown", "given", "known",
  "held", "brought", "chosen", "spoken", "broken", "grown", "left", "lost", "paid",
  "met", "led", "set", "understood", "found", "kept", "told"
];

function getSentences(text: string): string[] {
  if (!text) return [];
  // Split on sentence boundaries: dot, question mark, or exclamation mark followed by space or end of string
  return text
    .split(/[.!?]+(?:\s|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function analyzeReadability(html: string): ReadabilityAnalysisResult {
  const checks: ReadabilityCheck[] = [];
  const rawText = stripTags(html);
  
  if (!rawText.trim()) {
    return {
      score: 0,
      checks: []
    };
  }

  const sentences = getSentences(rawText);
  const totalSentences = sentences.length;

  // 1. Word Complexity (Neutral/Premium Yoast advertisement)
  checks.push({
    id: "word_complexity",
    title: "Word complexity",
    status: "neutral",
    message: "Word complexity: Is your vocabulary suited for a larger audience? Yoast SEO Premium will tell you!"
  });

  if (totalSentences === 0) {
    return {
      score: 0,
      checks: [
        ...checks,
        { id: "transition_words", title: "Transition words", status: "pass", message: "No content to analyze." },
        { id: "subheading_distribution", title: "Subheading distribution", status: "pass", message: "No content to analyze." },
        { id: "passive_voice", title: "Passive voice", status: "pass", message: "No content to analyze." },
        { id: "consecutive_sentences", title: "Consecutive sentences", status: "pass", message: "No content to analyze." },
        { id: "paragraph_length", title: "Paragraph length", status: "pass", message: "No content to analyze." },
        { id: "sentence_length", title: "Sentence length", status: "pass", message: "No content to analyze." }
      ]
    };
  }

  // 2. Transition Words
  let transitionCount = 0;
  for (const sentence of sentences) {
    const lower = ` ${sentence.toLowerCase()} `.replace(/[^a-z0-9\s]/g, " ");
    const hasTransition = TRANSITION_WORDS.some(word => lower.includes(` ${word} `));
    if (hasTransition) transitionCount++;
  }
  const transitionRatio = (transitionCount / totalSentences) * 100;
  if (transitionRatio < 30) {
    checks.push({
      id: "transition_words",
      title: "Transition words",
      status: "fail",
      message: `Transition words: Only ${transitionRatio.toFixed(1)}% of the sentences contain transition words, which is not enough. Use more of them.`
    });
  } else {
    checks.push({
      id: "transition_words",
      title: "Transition words",
      status: "pass",
      message: `Transition words: ${transitionRatio.toFixed(1)}% of the sentences contain transition words. That's great!`
    });
  }

  // 3. Subheading Distribution
  // Parse H tags and count words between them
  const sections: number[] = [];
  const matches = [...html.matchAll(/<(h[1-6]|p|div|section)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  
  let currentWordCount = 0;
  let hasHeading = false;
  
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    const content = stripTags(match[2]);
    const wCount = countWords(content);
    
    if (tag.startsWith("h")) {
      if (currentWordCount > 0) {
        sections.push(currentWordCount);
      }
      currentWordCount = 0;
      hasHeading = true;
    } else {
      currentWordCount += wCount;
    }
  }
  if (currentWordCount > 0) {
    sections.push(currentWordCount);
  }

  const longSection = sections.find(s => s > 300);
  if (longSection !== undefined && hasHeading) {
    checks.push({
      id: "subheading_distribution",
      title: "Subheading distribution",
      status: "warn",
      message: "Subheading distribution: 1 section of your text is longer than the recommended number of words (300) and is not separated by any subheadings. Add subheadings to improve readability."
    });
  } else {
    checks.push({
      id: "subheading_distribution",
      title: "Subheading distribution",
      status: "pass",
      message: "Subheading distribution: Good! No sections exceed the recommended 300-word limit between subheadings."
    });
  }

  // 4. Passive Voice
  let passiveCount = 0;
  const beVerbs = ["is", "am", "are", "was", "were", "be", "been", "being"];
  
  for (const sentence of sentences) {
    const tokens = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    let isPassive = false;
    for (let i = 0; i < tokens.length - 1; i++) {
      if (beVerbs.includes(tokens[i])) {
        // Look up to 2 words ahead for past participle
        const lookahead = tokens.slice(i + 1, Math.min(i + 4, tokens.length));
        const hasParticiple = lookahead.some(token => 
          token.endsWith("ed") || IRREGULAR_PAST_PARTICIPLES.includes(token)
        );
        if (hasParticiple) {
          isPassive = true;
          break;
        }
      }
    }
    if (isPassive) passiveCount++;
  }
  const passiveRatio = (passiveCount / totalSentences) * 100;
  if (passiveRatio > 10) {
    checks.push({
      id: "passive_voice",
      title: "Passive voice",
      status: "warn",
      message: `Passive voice: ${passiveRatio.toFixed(1)}% of the sentences contain passive voice, which is more than the recommended maximum of 10%.`
    });
  } else {
    checks.push({
      id: "passive_voice",
      title: "Passive voice",
      status: "pass",
      message: "Passive voice: You are not using too much passive voice. That's great!"
    });
  }

  // 5. Consecutive Sentences
  let hasRepetitiveStart = false;
  if (sentences.length >= 3) {
    let consecutiveCount = 1;
    let prevWord = "";
    
    for (const sentence of sentences) {
      const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
      if (firstWord && firstWord === prevWord) {
        consecutiveCount++;
        if (consecutiveCount >= 3) {
          hasRepetitiveStart = true;
          break;
        }
      } else {
        consecutiveCount = 1;
        prevWord = firstWord;
      }
    }
  }

  if (hasRepetitiveStart) {
    checks.push({
      id: "consecutive_sentences",
      title: "Consecutive sentences",
      status: "fail",
      message: "Consecutive sentences: Repetitive sentence beginnings found (3 or more sentences start with the same word). Vary your sentence structure."
    });
  } else {
    checks.push({
      id: "consecutive_sentences",
      title: "Consecutive sentences",
      status: "pass",
      message: "Consecutive sentences: There are no repetitive sentence beginnings. That's great!"
    });
  }

  // 6. Paragraph Length
  const paragraphs = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) ?? [];
  const longParagraph = paragraphs.some(p => countWords(stripTags(p)) > 150);
  if (longParagraph) {
    checks.push({
      id: "paragraph_length",
      title: "Paragraph length",
      status: "warn",
      message: "Paragraph length: Some paragraphs are longer than the recommended 150 words. Try to split them into shorter paragraphs."
    });
  } else {
    checks.push({
      id: "paragraph_length",
      title: "Paragraph length",
      status: "pass",
      message: "Paragraph length: There are no paragraphs that are too long. Great job!"
    });
  }

  // 7. Sentence Length
  let longSentenceCount = 0;
  for (const sentence of sentences) {
    if (countWords(sentence) > 20) {
      longSentenceCount++;
    }
  }
  const longSentenceRatio = (longSentenceCount / totalSentences) * 100;
  if (longSentenceRatio > 25) {
    checks.push({
      id: "sentence_length",
      title: "Sentence length",
      status: "warn",
      message: `Sentence length: More than 25% of your sentences contain more than 20 words (currently ${longSentenceRatio.toFixed(1)}%). Try to make some sentences shorter.`
    });
  } else {
    checks.push({
      id: "sentence_length",
      title: "Sentence length",
      status: "pass",
      message: "Sentence length: Great!"
    });
  }

  // Calculate overall score
  const activeChecks = checks.filter(c => c.status !== "neutral");
  const passed = activeChecks.filter(c => c.status === "pass").length;
  const score = Math.round((passed / activeChecks.length) * 100);

  return { score, checks };
}
