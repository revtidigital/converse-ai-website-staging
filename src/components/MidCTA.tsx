import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const MidCTA = () => {
  return (
    <section className="section-padding" title="Start using ConverseAI for AI-powered customer support">
      <div className="container-tight">
        <div className="relative gradient-bg rounded-3xl p-12 md:p-16 lg:p-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet/30 rounded-full blur-3xl" />
          
          {/* Floating Chat Bubbles */}
          <div className="absolute top-8 right-8 md:right-16 glass-card rounded-2xl px-4 py-3 shadow-lg animate-float hidden md:block">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Hey! How can I help?</span>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-8 md:left-16 glass-card rounded-2xl px-4 py-3 shadow-lg animate-float-delayed hidden md:block">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-sm font-medium">AI is typing...</span>
            </div>
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Don't let your customers wait.
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              Every second counts. Start delivering instant, intelligent responses that delight your customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-demo">
                <Button 
                  variant="hero-outline" 
                  size="xl"
                  title="Book a demo with ConverseAI"
                  className="bg-white text-foreground border-0 hover:bg-primary hover:text-primary-foreground"
                >
                  Book a Demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact-us">
                <Button 
                  variant="outline" 
                  title="Talk to the ConverseAI sales team"
                  size="xl"
                  className="text-white border-2 border-white/50 bg-white/10 hover:bg-white hover:text-primary hover:border-white"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MidCTA;
