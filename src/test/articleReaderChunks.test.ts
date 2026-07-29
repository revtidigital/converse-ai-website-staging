import { describe, expect, it } from "vitest";
import { htmlToReadingChunks, faqsToReadingChunks } from "@/components/ArticleReader/textChunks";

describe("htmlToReadingChunks", () => {
  it("includes the title as the first chunk", () => {
    const chunks = htmlToReadingChunks("My Great Post", "<p>Hello world.</p>");
    expect(chunks[0]).toBe("My Great Post.");
  });

  it("reads paragraphs and headings in order", () => {
    const html = "<h2>Section One</h2><p>First paragraph.</p><p>Second paragraph.</p>";
    const chunks = htmlToReadingChunks("", html);
    expect(chunks).toEqual(["Section One.", "First paragraph.", "Second paragraph."]);
  });

  it("does not double-read a <p> nested inside a <blockquote>", () => {
    const html = "<blockquote><p>Quoted text.</p></blockquote>";
    const chunks = htmlToReadingChunks("", html);
    expect(chunks).toEqual(["Quoted text."]);
  });

  it("converts a table into one intro chunk plus one chunk per row", () => {
    const html = `
      <table>
        <tr><th>Plan</th><th>Price</th><th>Users</th></tr>
        <tr><td>Starter</td><td>$10</td><td>5</td></tr>
        <tr><td>Pro</td><td>$30</td><td>20</td></tr>
      </table>
    `;
    const chunks = htmlToReadingChunks("", html);
    expect(chunks[0]).toMatch(/following table has 2 rows/i);
    expect(chunks[1]).toBe("For Starter, Price is $10, Users is 5.");
    expect(chunks[2]).toBe("For Pro, Price is $30, Users is 20.");
  });

  it("expands abbreviations and percent signs for cleaner pronunciation", () => {
    const chunks = htmlToReadingChunks("", "<p>Revenue grew 20% e.g. via referrals & ads.</p>");
    expect(chunks[0]).toBe("Revenue grew 20 percent for example via referrals and ads.");
  });
});

describe("faqsToReadingChunks", () => {
  it("produces a question/answer pair per FAQ", () => {
    const chunks = faqsToReadingChunks([{ question: "What is X?", answer: "X is Y." }]);
    expect(chunks).toEqual([
      "Frequently asked questions.",
      "Question: What is X?",
      "Answer: X is Y.",
    ]);
  });

  it("returns an empty array when there are no FAQs", () => {
    expect(faqsToReadingChunks([])).toEqual([]);
  });
});
