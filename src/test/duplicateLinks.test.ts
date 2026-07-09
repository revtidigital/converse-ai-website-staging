import { describe, it, expect } from "vitest";
import { extractLinks } from "../lib/checkLink";

function validateDuplicateLinks(html: string): { valid: boolean; error?: string } {
  const links = extractLinks(html, true);
  const seenPairs = new Set<string>();
  for (const link of links) {
    const text = link.text.trim().toLowerCase();
    const url = link.url.trim().toLowerCase();
    const pairKey = `${text}||${url}`;
    if (seenPairs.has(pairKey)) {
      return { valid: false, error: "already this word has same link" };
    }
    seenPairs.add(pairKey);
  }
  return { valid: true };
}

describe("Duplicate Links Validation", () => {
  it("allows different links for the same word", () => {
    const html = `
      <p>Please check out our <a href="https://example.com/chatbot1">chatbot</a> or <a href="https://example.com/chatbot2">chatbot</a></p>
    `;
    const result = validateDuplicateLinks(html);
    expect(result.valid).toBe(true);
  });

  it("allows same link for different words", () => {
    const html = `
      <p>Use <a href="https://example.com/bot">chatbot</a> and also <a href="https://example.com/bot">chat tool</a></p>
    `;
    const result = validateDuplicateLinks(html);
    expect(result.valid).toBe(true);
  });

  it("fails when same word has the same link", () => {
    const html = `
      <p>Try <a href="https://example.com/bot">chatbot</a> and <a href="https://example.com/bot">chatbot</a></p>
    `;
    const result = validateDuplicateLinks(html);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("already this word has same link");
  });

  it("is case-insensitive and trims whitespaces", () => {
    const html = `
      <p>Try <a href="https://example.com/bot"> Chatbot </a> and <a href="https://example.com/bot">chatbot</a></p>
    `;
    const result = validateDuplicateLinks(html);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("already this word has same link");
  });

  it("works with relative/internal URLs", () => {
    const html = `
      <p>Find our <a href="/services/ai-voice-agents">voice agents</a> or <a href="/services/ai-voice-agents">voice agents</a> here</p>
    `;
    const result = validateDuplicateLinks(html);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("already this word has same link");
  });
});
