import { processAiraRequest } from "../server/services/ollamaService.ts";

async function testServicesQuestion() {
  const pageContext = {
    currentUrl: "http://localhost:8080/",
    pageTitle: "ConverseAI - Home",
  };

  const query = "What services does Converse AI offer?";
  console.log(`\n❓ QUESTION: "${query}"`);

  const res = await processAiraRequest(query, [], pageContext);
  console.log(`🤖 AIRA SPOKEN ANSWER:\n"${res.reply}"`);
  if (res.action) console.log(`🎯 ACTION:`, res.action);
}

testServicesQuestion().catch(console.error);
