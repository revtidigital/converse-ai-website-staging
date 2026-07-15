import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { PUBLIC_STATIC_ROUTES, type PublicStaticRoutePath } from "./routes/publicRoutes";
import { initTracking } from "./lib/tracking";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
} from "./lib/seo";

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
import { isBlogHost, getSubdomainHosts } from "@/lib/blogUrl";
import Blog2 from "./pages/Blog2";
import BlogPost2 from "./pages/BlogPost2";
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
import AdminPricing from "./pages/admin/AdminPricing";
import AdminPricingForm from "./pages/admin/AdminPricingForm";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogForm from "./pages/admin/AdminBlogForm";
import AdminBlogTrash from "./pages/admin/AdminBlogTrash";
import AdminBlogCategories from "./pages/admin/AdminBlogCategories";
import AdminRedirects from "./pages/admin/AdminRedirects";
import AdminActivityLog from "./pages/admin/AdminActivityLog";

type RouterComponent = ComponentType<{ children: ReactNode }>;

const BlogRedirect = () => {
  useEffect(() => {
    if (!isBlogHost()) {
      const { blogHost } = getSubdomainHosts();
      window.location.replace(`${blogHost}/`);
    }
  }, []);
  return isBlogHost() ? <Blog /> : <div className="min-h-screen bg-background" />;
};

const BlogPostRedirect = () => {
  const { slug } = useParams();
  useEffect(() => {
    if (!isBlogHost()) {
      const { blogHost } = getSubdomainHosts();
      window.location.replace(`${blogHost}/${slug || ""}`);
    }
  }, [slug]);
  return isBlogHost() ? <BlogPost /> : <div className="min-h-screen bg-background" />;
};

// On the blog subdomain (blog.theconverseai.com) the root shows the blog index;
// on the main site it shows the homepage.
const HomeRoute = () => (isBlogHost() ? <Blog /> : <Index />);
// Root-level slug (blog.theconverseai.com/<slug>) resolves to a blog post on the
// blog subdomain; on the main site an unmatched top-level path is a 404.
const RootSlugRoute = () => (isBlogHost() ? <BlogPost /> : <NotFound />);

const staticRouteElements: Record<PublicStaticRoutePath, ReactNode> = {
  "/": <HomeRoute />,
  "/about-us": <AboutUs />,
  "/contact-us": <ContactUs />,
  "/book-demo": <BookDemo />,
  "/blog": <BlogRedirect />,
  "/blog-2": <Blog2 />,
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
  "/teams": <Teams />,
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
        <Route path="/blog/:slug" element={<PageTransition><BlogPostRedirect /></PageTransition>} />
        <Route path="/blog-2/:slug" element={<PageTransition><BlogPost2 /></PageTransition>} />
        <Route path="/case-studies/:slug" element={<PageTransition><CaseStudyDetail /></PageTransition>} />
        <Route path="/teams-2" element={<Navigate to="/teams" replace />} />

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
          path="/admin/pricing"
          element={
            <ProtectedRoute>
              <AdminPricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing/new"
          element={
            <ProtectedRoute>
              <AdminPricingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing/:id/edit"
          element={
            <ProtectedRoute>
              <AdminPricingForm />
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
        
        {/* Blog admin routes */}
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute>
              <AdminBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/new"
          element={
            <ProtectedRoute>
              <AdminBlogForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/:id/edit"
          element={
            <ProtectedRoute>
              <AdminBlogForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/trash"
          element={
            <ProtectedRoute>
              <AdminBlogTrash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/categories"
          element={
            <ProtectedRoute>
              <AdminBlogCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/redirects"
          element={
            <ProtectedRoute>
              <AdminRedirects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute>
              <AdminActivityLog />
            </ProtectedRoute>
          }
        />

        {/* Root-level slug — blog subdomain post URLs (blog.theconverseai.com/<slug>).
            Ranks below all static routes, so it only catches otherwise-unmatched
            single-segment paths. */}
        <Route path="/:slug" element={<PageTransition><RootSlugRoute /></PageTransition>} />

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
      <Helmet>
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta property="og:image:width" content={DEFAULT_OG_IMAGE_WIDTH} />
        <meta property="og:image:height" content={DEFAULT_OG_IMAGE_HEIGHT} />
        <meta property="og:image:alt" content={DEFAULT_OG_IMAGE_ALT} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta name="twitter:image:alt" content={DEFAULT_OG_IMAGE_ALT} />
      </Helmet>
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
