import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";

const ChatbotHero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet/5 to-background" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mint/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container-tight relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <AnimatedSection>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                AI-Powered Chatbot
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                AI-Powered Solutions for{" "}
                <span className="gradient-text">Smarter Customer Service</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Elevate engagement, retention, and customer loyalty with our advanced 
                AI-driven chatbot solutions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <ContactFormDialog>
                  <Button title="Request a Demo to ConverseAI" variant="hero" size="xl">
                    Request a Demo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </ContactFormDialog>
                <Link to="/book-demo?product=chatbot">
                  <Button title="Book a Demo" variant="hero-outline" size="xl" className="w-full">
                    <Play className="w-5 h-5" />
                    Book a Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 500+ businesses</p>
                  <p className="text-xs text-muted-foreground">4.9/5 rating from customers</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right - Chatbot Mockup */}
          <AnimatedSection delay={0.2}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-violet/30 rounded-3xl blur-2xl scale-110" />
              
              {/* Chat Window */}
              <div className="relative glass-card rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">ConverseAI Bot</p>
                    <p className="text-xs text-mint flex items-center gap-1">
                      <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 py-6 min-h-[300px]">
                  <div className="flex justify-start">
                    <div className="chat-bubble-ai animate-fade-up">
                      👋 Hi! How can I help you today?
                    </div>
                  </div>
                  <div className="flex justify-end animate-fade-up" style={{ animationDelay: "0.5s" }}>
                    <div className="chat-bubble-user">
                      I need help with my order
                    </div>
                  </div>
                  <div className="flex justify-start animate-fade-up" style={{ animationDelay: "1s" }}>
                    <div className="chat-bubble-ai">
                      I'd be happy to help! Let me pull up your order details. What's your order number?
                    </div>
                  </div>
                  <div className="flex justify-start animate-fade-up" style={{ animationDelay: "1.5s" }}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </span>
                      AI is typing...
                    </div>
                  </div>
                </div>

                {/* Input */}
                {/* <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary/50 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    disabled
                  />
                  <Button size="icon" className="rounded-full gradient-bg">
                    <ArrowRight className="w-4 h-4" />
                  </Button> 
                </div> */}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg animate-float">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-xl bg-mint flex items-center justify-center shadow-lg animate-float-delayed">
                <span className="text-xl">💬</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ChatbotHero;
