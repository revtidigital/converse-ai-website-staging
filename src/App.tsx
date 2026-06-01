import { useState, type ReactNode, type ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Services from "./pages/Services";
import AIStrategyAudit from "./pages/AIStrategyAudit";
import AIVoiceAgents from "./pages/AIVoiceAgents";
import AgenticAutomation from "./pages/AgenticAutomation";
import AIIntegration from "./pages/AIIntegration";
import CustomAIAgents from "./pages/CustomAIAgents";
import KnowledgeIntelligence from "./pages/KnowledgeIntelligence";
import SalesAI from "./pages/SalesAI";
import AIForSMB from "./pages/AIForSMB";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Chatbot from "./pages/Chatbot";
import LiveChat from "./pages/LiveChat";
import OmniChannel from "./pages/OmniChannel";
import PreChatForms from "./pages/PreChatForms";
import TeamReports from "./pages/TeamReports";
import AgentReports from "./pages/AgentReports";
import CSATReport from "./pages/CSATReport";
import InboxReports from "./pages/InboxReports";
import WhatsAppAIChatbot from "./pages/WhatsAppAIChatbot";
import WhatsAppShop from "./pages/WhatsAppShop";
import WhatsAppMarketing from "./pages/WhatsAppMarketing";
import AgentCapacity from "./pages/AgentCapacity";
import PrivateNotes from "./pages/PrivateNotes";
import LiveView from "./pages/LiveView";
import Teams from "./pages/Teams";
import BookDemo from "./pages/BookDemo";
import ThankYou from "./pages/ThankYou";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCaseStudyForm from "./pages/admin/AdminCaseStudyForm";

type RouterComponent = ComponentType<{ children: ReactNode }>;

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/contact-us" element={<PageTransition><ContactUs /></PageTransition>} />
        <Route path="/about-us" element={<PageTransition><AboutUs /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/services/ai-strategy-audit" element={<PageTransition><AIStrategyAudit /></PageTransition>} />
        <Route path="/services/agentic-automation" element={<PageTransition><AgenticAutomation /></PageTransition>} />
        <Route path="/services/ai-integration" element={<PageTransition><AIIntegration /></PageTransition>} />
        <Route path="/services/ai-voice-agents" element={<PageTransition><AIVoiceAgents /></PageTransition>} />
        <Route path="/services/custom-ai-agents" element={<PageTransition><CustomAIAgents /></PageTransition>} />
        <Route path="/services/knowledge-intelligence" element={<PageTransition><KnowledgeIntelligence /></PageTransition>} />
        <Route path="/services/sales-ai" element={<PageTransition><SalesAI /></PageTransition>} />
        <Route path="/solutions/ai-for-smb" element={<PageTransition><AIForSMB /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/chatbot" element={<PageTransition><Chatbot /></PageTransition>} />
        <Route path="/live-chat" element={<PageTransition><LiveChat /></PageTransition>} />
        <Route path="/omni-channel" element={<PageTransition><OmniChannel /></PageTransition>} />
        <Route path="/pre-chat-forms" element={<PageTransition><PreChatForms /></PageTransition>} />
        <Route path="/team-reports" element={<PageTransition><TeamReports /></PageTransition>} />
        <Route path="/agent-reports" element={<PageTransition><AgentReports /></PageTransition>} />
        <Route path="/csat-report" element={<PageTransition><CSATReport /></PageTransition>} />
        <Route path="/inbox-reports" element={<PageTransition><InboxReports /></PageTransition>} />
        <Route path="/whatsapp-ai-chatbot" element={<PageTransition><WhatsAppAIChatbot /></PageTransition>} />
        <Route path="/whatsapp-shop" element={<PageTransition><WhatsAppShop /></PageTransition>} />
        <Route path="/whatsapp-marketing" element={<PageTransition><WhatsAppMarketing /></PageTransition>} />
        <Route path="/agent-capacity" element={<PageTransition><AgentCapacity /></PageTransition>} />
        <Route path="/private-notes" element={<PageTransition><PrivateNotes /></PageTransition>} />
        <Route path="/live-view" element={<PageTransition><LiveView /></PageTransition>} />
        <Route path="/teams-2" element={<PageTransition><Teams /></PageTransition>} />
        <Route path="/book-demo" element={<PageTransition><BookDemo /></PageTransition>} />
        <Route path="/thank-you" element={<PageTransition><ThankYou /></PageTransition>} />
        <Route path="/case-studies" element={<PageTransition><CaseStudies /></PageTransition>} />
        <Route path="/case-studies/:slug" element={<PageTransition><CaseStudyDetail /></PageTransition>} />
        <Route path="/terms-and-conditions" element={<PageTransition><TermsAndConditions /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

        {/* Admin routes — no page transition, no public header */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/case-studies/new"
          element={
            <ProtectedRoute>
              <AdminCaseStudyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/case-studies/:id/edit"
          element={
            <ProtectedRoute>
              <AdminCaseStudyForm />
            </ProtectedRoute>
          }
        />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const PublicLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && (
        <>
          {/* Header outside PageTransition to maintain fixed positioning */}
          <Header />
          <ScrollToTop />
          <WhatsAppFloat />
        </>
      )}
      <AnimatedRoutes />
    </>
  );
};

interface AppProps {
  Router?: RouterComponent;
  helmetContext?: object;
}

const App = ({ Router = BrowserRouter, helmetContext = {} }: AppProps) => {
  // Loading screen disabled to improve LCP (was adding 1.5s delay)
  const [isLoading] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AnimatePresence mode="wait">
            {isLoading && <LoadingScreen key="loading" />}
          </AnimatePresence>
          <Toaster />
          <Sonner />
          <Router>
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <PublicLayout />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
