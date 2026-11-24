import { Brain, MessageSquare, BarChart3, Settings, Globe, Shield } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";

const offeringCards = [
  {
    icon: Brain,
    title: "Conversational Intelligence",
    description: "Natural language understanding that comprehends context, intent, and sentiment for meaningful conversations.",
    href: "/live-chat",
    color: "from-primary to-violet",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant for FAQs & Lead Capture",
    description: "Automatically answer common questions and qualify leads 24/7 without human intervention.",
    href: "/pre-chat-forms",
    color: "from-violet to-pink-400",
  },
  {
    icon: Settings,
    title: "Smart Routing & Automation",
    description: "Intelligent ticket routing based on query type, priority, and agent availability.",
    href: "/agent-capacity",
    color: "from-primary to-mint",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Communicate with customers in their preferred language with real-time translation.",
    href: "/omni-channel",
    color: "from-mint to-primary",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Enterprise-grade security with GDPR, HIPAA, and SOC 2 compliance built-in.",
    href: "/privacy-policy",
    color: "from-violet to-primary",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Comprehensive dashboards with actionable insights on performance and customer satisfaction.",
    href: "/inbox-reports",
    color: "from-primary to-violet",
  },
];

const ChatbotOfferings = () => {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <AnimatedSection>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div title="we offer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              What We Offer
            </div>
            
            <h2 title="What We Are Offering" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              What We Are{" "}
              <span className="gradient-text">Offering</span>
            </h2>
            
            <p title="Comprehensive AI-powered solutions designed to transform your customer engagement." className="text-lg text-muted-foreground">
              Comprehensive AI-powered solutions designed to transform your customer engagement.
            </p>
          </div>
        </AnimatedSection>

        {/* Feature Cards Grid - 3 columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offeringCards.map((card, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <Link to={card.href} className="block group h-full">
                <div className="glass-card-hover rounded-2xl p-6 h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-primary/10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 title={card.title} className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  
                  <p title={card.description} className="text-muted-foreground text-sm">
                    {card.description}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChatbotOfferings;
