import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";

const FinalCTA = memo(() => {
  return (
  <section 
  className="section-padding" 
  aria-labelledby="cta-heading"
  title="Start using ConverseAI for AI-powered customer conversations"
>
      <div className="container-tight">
        <div className="relative text-center max-w-4xl mx-auto">
          {/* Background Glow - optimized with contain */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet/10 to-mint/10 rounded-3xl blur-3xl" 
            aria-hidden="true"
            style={{ contain: 'strict', willChange: 'auto' }}
          />
          
          <div className="relative z-10 glass-card rounded-3xl p-12 md:p-16 lg:p-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Get Started Today
            </div>

            <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Start meaningful conversations{" "}
              <span className="gradient-text">today</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join leading businesses that trust ConverseAI to automate workflows and elevate customer interactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-demo">
                <Button 
                  variant="hero" 
                  size="xl" 
                  aria-label="Book a demo with ConverseAI"
                  title="Book a demo with ConverseAI"
                >
                  Book a Demo
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/contact-us">
                <Button 
                  variant="hero-outline" 
                  size="xl" 
                  aria-label="Contact our sales team"
                  title="Contact the ConverseAI sales team"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Custom AI implementations • Enterprise security • Dedicated support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTA.displayName = 'FinalCTA';

export default FinalCTA;
