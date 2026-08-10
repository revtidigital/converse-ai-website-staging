import { processAiraRequest } from "../server/services/ollamaService.ts";

async function testComplexQuery() {
  const pageContext = {
    currentUrl: "http://localhost:8080/",
    pageTitle: "ConverseAI - Home",
  };

  const query = "What happens if an agent encounters a complex query?";
  console.log(`\n❓ QUESTION: "${query}"`);

  const res = await processAiraRequest(query, [], pageContext);
  console.log(`🤖 AIRA SPOKEN ANSWER:\n"${res.reply}"`);
  if (res.action) console.log(`🎯 ACTION:`, res.action);
}

testComplexQuery().catch(console.error);
