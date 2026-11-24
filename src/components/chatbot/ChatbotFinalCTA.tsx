import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageSquare, Globe } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Link } from "react-router-dom";

const ChatbotFinalCTA = () => {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <AnimatedSection>
          <div className="relative text-center max-w-4xl mx-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet/10 to-mint/10 rounded-3xl blur-3xl" />
            
            <div className="relative z-10 glass-card rounded-3xl p-12 md:p-16 lg:p-20">
              {/* Floating Icons */}
              <div className="absolute -top-6 left-1/4 w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg animate-float">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-4 right-1/4 w-10 h-10 rounded-lg bg-mint flex items-center justify-center shadow-lg animate-float-delayed">
                <Globe className="w-5 h-5 text-white" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Get Started Today
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Comprehensive Solutions for{" "}
                <span className="gradient-text">Unified Customer Engagement</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Automate interactions across your website, WhatsApp, and digital channels 
                using ConverseAI. Transform how you connect with customers today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/book-demo?product=chatbot">
                  <Button title="Book a Demo" variant="hero" size="xl" className="w-full">
                    Book a Demo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <ContactFormDialog>
                  <Button title="Contact Sales" variant="hero-outline" size="xl">
                    Contact Sales
                  </Button>
                </ContactFormDialog>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                No credit card required • Tailored solutions • 24/7 dedicated support
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-border/50">
                {[
                  { label: "500+", sublabel: "Happy Clients" },
                  { label: "10M+", sublabel: "Messages Sent" },
                  { label: "99.9%", sublabel: "Uptime" },
                  { label: "24/7", sublabel: "Support" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <p title={stat.label} className="text-2xl font-bold gradient-text">
                      {stat.label}
                    </p>
                    <p title={stat.sublabel} className="text-xs text-muted-foreground">
                      {stat.sublabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ChatbotFinalCTA;
