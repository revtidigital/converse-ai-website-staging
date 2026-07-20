import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import ChatbotHero from "@/components/chatbot/ChatbotHero";
import ChatbotComparison from "@/components/chatbot/ChatbotComparison";
import ChatbotRevolutionize from "@/components/chatbot/ChatbotRevolutionize";
import ChatbotAutomation from "@/components/chatbot/ChatbotAutomation";
import ChatbotAgents from "@/components/chatbot/ChatbotAgents";
import ChatbotPlatform from "@/components/chatbot/ChatbotPlatform";
import ChatbotOfferings from "@/components/chatbot/ChatbotOfferings";
import ChatbotIndustries from "@/components/chatbot/ChatbotIndustries";
import ChatbotFinalCTA from "@/components/chatbot/ChatbotFinalCTA";

const Chatbot = () => {
  return (
    <>
      <Helmet>
        <title>AI Chatbot for Customer Support | ConverseAI</title>
        <meta name="description" content="Build intelligent AI chatbots to automate customer support and manage conversations across multiple channels with ConverseAI." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="AI Chatbot for Customer Support | ConverseAI" />
        <meta property="og:description" content="Build intelligent AI chatbots to automate customer support and manage conversations across multiple channels with ConverseAI." />
        <link rel="canonical" href="https://theconverseai.com/chatbot" />
      </Helmet>
      
      <main className="pt-16 md:pt-20">
        <ChatbotHero />
        <ChatbotComparison />
        <ChatbotRevolutionize />
        <ChatbotAutomation />
        <ChatbotAgents />
        <ChatbotPlatform />
        <ChatbotOfferings />
        <ChatbotIndustries />
        <ChatbotFinalCTA />
      </main>

      <Footer />
    </>
  );
};

export default Chatbot;
