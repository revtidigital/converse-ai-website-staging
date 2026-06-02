import { useEffect, useState, type ReactNode, type ComponentType } from "react";
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
import { PUBLIC_STATIC_ROUTES, type PublicStaticRoutePath } from "./routes/publicRoutes";
import { initTracking } from "./lib/tracking";

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

const staticRouteElements: Record<PublicStaticRoutePath, ReactNode> = {
  "/": <Index />,
  "/about-us": <AboutUs />,
  "/contact-us": <ContactUs />,
  "/book-demo": <BookDemo />,
  "/blog": <Blog />,
  "/case-studies": <CaseStudies />,
  "/solutions/ai-for-smb": <AIForSMB />,
  "/services": <Services />,
  "/services/ai-strategy-audit": <AIStrategyAudit />,
  "/services/agentic-automation": <AgenticAutomation />,
  "/services/ai-integration": <AIIntegration />,
  "/services/ai-voice-agents": <AIVoiceAgents />,
  "/services/custom-ai-agents": <CustomAIAgents />,
  "/services/knowledge-intelligence": <KnowledgeIntelligence />,
  "/services/sales-ai": <SalesAI />,
  "/chatbot": <Chatbot />,
  "/live-chat": <LiveChat />,
  "/pre-chat-forms": <PreChatForms />,
  "/omni-channel": <OmniChannel />,
  "/whatsapp-ai-chatbot": <WhatsAppAIChatbot />,
  "/whatsapp-shop": <WhatsAppShop />,
  "/whatsapp-marketing": <WhatsAppMarketing />,
  "/agent-capacity": <AgentCapacity />,
  "/private-notes": <PrivateNotes />,
  "/live-view": <LiveView />,
  "/teams-2": <Teams />,
  "/agent-reports": <AgentReports />,
  "/csat-report": <CSATReport />,
  "/team-reports": <TeamReports />,
  "/inbox-reports": <InboxReports />,
  "/terms-and-conditions": <TermsAndConditions />,
  "/privacy-policy": <PrivacyPolicy />,
  "/thank-you": <ThankYou />,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {PUBLIC_STATIC_ROUTES.map((path) => (
          <Route
            key={path}
            path={path}
            element={<PageTransition>{staticRouteElements[path]}</PageTransition>}
          />
        ))}
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/case-studies/:slug" element={<PageTransition><CaseStudyDetail /></PageTransition>} />

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

  useEffect(() => {
    initTracking();
  }, []);

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
