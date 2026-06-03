import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/HeroSection";
import TrustSignals from "@/components/TrustSignals";
import FeaturesGrid from "@/components/FeaturesGrid";
import UserBehaviorInsight from "@/components/UserBehaviorInsight";
import ProductModules from "@/components/ProductModules";
import MidCTA from "@/components/MidCTA";
import WhyConverseAI from "@/components/WhyConverseAI";
import HowItWorks from "@/components/HowItWorks";
import MobileExperience from "@/components/MobileExperience";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>ConverseAI - AI Conversations That Feel Human | Customer Engagement Platform</title>
        <meta
          name="description"
          content="ConverseAI helps businesses automate, engage, and support customers using intelligent chatbots and real-time messaging. Start your free trial today."
        />
        <meta property="og:title" content="ConverseAI - AI Conversations That Feel Human" />
        <meta
          property="og:description"
          content="ConverseAI helps businesses automate, engage, and support customers using intelligent chatbots and real-time messaging."
        />
        <link rel="canonical" href="https://www.theconverseai.com/" />
      </Helmet>
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <AnimatedSection>
            <HeroSection />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <TrustSignals />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <FeaturesGrid />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <UserBehaviorInsight />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <ProductModules />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <MidCTA />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <WhyConverseAI />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <HowItWorks />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <MobileExperience />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <FinalCTA />
          </AnimatedSection>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
