import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ContactFormDialog from "./ContactFormDialog";
import ChatbotMockup from "./ChatbotMockup";



const HeroSection = () => {
  return (
    <section 
        className="relative min-h-screen pt-24 pb-16 overflow-hidden"
        aria-labelledby="hero-heading"
        title="AI chatbot platform for customer engagement by ConverseAI"
      >
      {/* Background Elements - using CSS instead of multiple divs for performance */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" 
        aria-hidden="true"
        style={{ willChange: 'auto' }}
      />
      <div 
        className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" 
        aria-hidden="true"
        style={{ willChange: 'auto', contain: 'layout style paint' }}
      />
      <div 
        className="absolute top-40 right-1/4 w-80 h-80 bg-violet/10 rounded-full blur-3xl" 
        aria-hidden="true"
        style={{ willChange: 'auto', contain: 'layout style paint' }}
      />
      
      <div className="container-tight relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Content - LCP critical content */}
          <div className="text-center lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" aria-hidden="true" />
                AI-Powered Customer Engagement
              </span>
            </div>
            
            {/* H1 is the primary LCP element on mobile */}
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AI conversations that{" "}
              <span className="gradient-text">feel human.</span>
              <br />
              Business results that{" "}
              <span className="gradient-text">scale.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              ConverseAI helps businesses automate, engage, and support customers 
              using intelligent chatbots and real-time messaging.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/book-demo">
                <Button variant="hero" size="xl" title="Book a demo with ConverseAI" aria-label="Book a demo">
                  Book a Demo
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/services">
                <Button 
                    variant="hero-outline" 
                    size="xl" 
                    aria-label="Explore our AI services"
                    title="Explore Solutions"
                  >
                  Explore Solutions
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start" role="list" aria-label="Key statistics">
              {[
                { value: "50M+", label: "Messages Sent" },
                { value: "24/7", label: "Always On Support" },
                { value: "Multi", label: "Channel Platform" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left" role="listitem">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Chatbot Mockup (lazy loaded) */}
          <div className="relative lg:pl-8">
            <ChatbotMockup />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-soft" aria-hidden="true">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        {/* <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start md:items-center justify-start md:justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
