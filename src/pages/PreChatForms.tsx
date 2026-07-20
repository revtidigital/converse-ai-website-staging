import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Settings, 
  Database, 
  Users, 
  Zap, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Inbox,
  BarChart3
} from "lucide-react";

const PreChatForms = () => {
  const setupSteps = [
    { step: "01", title: "Configure Form Fields", description: "Choose from name, email, phone, or create custom fields for your needs." },
    { step: "02", title: "Add Custom Messages", description: "Welcome visitors with personalized messages before the chat begins." },
    { step: "03", title: "Publish & Go Live", description: "Deploy your forms instantly across all chat channels." },
  ];

  const customizationFeatures = [
    {
      icon: Settings,
      title: "Custom Fields",
      description: "Create unlimited custom fields to capture exactly the information you need from customers.",
    },
    {
      icon: Database,
      title: "CRM Integration",
      description: "Map form data directly to your CRM for seamless lead management and follow-ups.",
    },
    {
      icon: Users,
      title: "Structured Lead Capture",
      description: "Convert visitors into qualified leads with organized data collection.",
    },
    {
      icon: Zap,
      title: "Reduce Repetitive Questions",
      description: "Gather essential info upfront so agents can focus on solving problems, not asking basics.",
    },
  ];

  const dashboardBenefits = [
    "Pre-chat data flows directly to your inbox",
    "Smart routing based on form responses",
    "Faster resolution with complete context",
    "Unified view across all channels",
  ];

  return (
    <>
      <Helmet>
        <title>Pre-Chat Forms for Smarter Live Chat | ConverseAI</title>
        <meta name="description" content="Collect essential customer info before chats start with ConverseAI Pre-Chat Forms. Deliver faster, more personalized customer support." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Pre-Chat Forms for Smarter Live Chat | ConverseAI" />
        <meta property="og:description" content="Collect essential customer info before chats start with ConverseAI Pre-Chat Forms. Deliver faster, more personalized customer support." />
        <link rel="canonical" href="https://theconverseai.com/pre-chat-forms" />
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        
        <main>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-90" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            
            <div className="container-tight relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimatedSection>
                  <h1 title="Streamline customer interactions with ConverseAI's pre-chat forms" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Streamline Customer Interactions with{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                      Pre-Chat Context
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/80 mb-8">
                    Gather essential information before conversations begin for faster and more informed resolutions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/contact-us">
                    <Button title="Start Your Free Trial ConverseAI trial" variant="hero" size="lg" className="w-full px-8 py-6 text-lg rounded-xl">
                      Start Your Free Trial
                    </Button>
                  </Link>
                  </div>
                </AnimatedSection>

                {/* Form Preview */}
                <AnimatedSection delay={0.2}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-6 shadow-2xl">
                      <div className="bg-background rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">Before we chat...</h4>
                            <p className="text-sm text-muted-foreground">Help us serve you better</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                            <div className="h-10 bg-secondary/50 rounded-lg border border-border" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                            <div className="h-10 bg-secondary/50 rounded-lg border border-border" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">How can we help?</label>
                            <div className="h-20 bg-secondary/50 rounded-lg border border-border" />
                          </div>
                        </div>
                        
                        <div className="w-full gradient-bg text-white flex items-center justify-center py-2 rounded-lg cursor-pointer">
                          Start Chat <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          {/* Effortless Setup Section */}
          <section className="py-20 bg-secondary/30">
            <div className="container-tight">
              <AnimatedSection className="text-center mb-16">
                <h2 title="Effortless Setup for Enhanced User Experience" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Effortless Setup for Enhanced User Experience
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Easily configure forms, select fields, add custom messages, and publish in a few clicks.
                </p>
              </AnimatedSection>

              <div className="grid md:grid-cols-3 gap-8">
                {setupSteps.map((step, index) => (
                  <AnimatedSection key={step.step} delay={index * 0.1}>
                    <div title={step.step} className="relative">
                      <div className="text-7xl font-bold text-primary/10 absolute -top-6 left-0">
                        {step.step}
                      </div>
                      <div className="relative pt-8 pl-4">
                        <h3 title={step.title} className="text-xl font-semibold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p title={step.description} className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Customize Data Collection */}
          <section className="py-20">
            <div className="container-tight">
              <AnimatedSection className="text-center mb-16">
                <h2 title="Customize Your Data Collection" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                   Customize Your Data Collection
                </h2>
                <p title="Tailor pre-chat forms to capture the exact information your team needs." className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Tailor pre-chat forms to capture the exact information your team needs.
                </p>
              </AnimatedSection>

              <div className="grid md:grid-cols-2 gap-8">
                {customizationFeatures.map((feature, index) => (
                  <AnimatedSection key={feature.title} delay={index * 0.1}>
                    <div className="glass-card p-8 rounded-2xl h-full hover:shadow-glow transition-all duration-300 group">
                      <div  title={feature.title} className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p title={feature.description} className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Unified Dashboard Section */}
          <section className="py-20 bg-secondary/30">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimatedSection>
                  <h2 title="Unified Dashboard Advantage" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Unified Dashboard Advantage
                  </h2>
                  <p title="All pre-chat data integrates seamlessly with your existing workflow for maximum efficiency." className="text-lg text-muted-foreground mb-8">
                    All pre-chat data integrates seamlessly with your existing workflow for maximum efficiency.
                  </p>
                  <ul className="space-y-4">
                    {dashboardBenefits.map((benefit, index) => (
                      <li title={benefit} key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="bg-background rounded-xl p-6 space-y-4">
                      {/* Dashboard Preview */}
                      <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Inbox className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-foreground">Unified Inbox</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Live</span>
                        </div>
                      </div>
                      
                      {/* Conversation Items */}
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <div title="Conversation Item" className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="h-3 bg-secondary rounded w-24" />
                              <div className="h-2 bg-secondary rounded w-12" />
                            </div>
                            <div className="h-2 bg-secondary/50 rounded w-full mt-2" />
                            <div className="flex gap-2 mt-2">
                              <span title="Sales" className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Sales</span>
                              <span title="Pre-chat" className="text-xs px-2 py-1 bg-mint/10 text-mint rounded">Pre-chat</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-95" />
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
            </div>
            
            <div className="container-tight relative z-10">
              <AnimatedSection className="text-center max-w-3xl mx-auto">
                <h2 title="Unified Dashboard Advantage" className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Manage Conversations Across Multiple Channels
                </h2>
                <p title="All pre-chat data integrates seamlessly with your existing workflow for maximum efficiency." className="text-lg text-white/80 mb-8">
                  From one dashboard, handle pre-chat forms, live chats, and customer data seamlessly.
                </p>
                <Link to="/contact-us">
                  <Button  title="Request a Demo" variant="hero-outline"
                size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gradient-cta text-primary-foreground shadow-glow hover:shadow-[0_16px_50px_-10px_hsl(262_83%_58%_/_0.6)] hover:scale-[1.03] hover:-translate-y-1 active:scale-100 active:translate-y-0 font-semibold h-14 rounded-xl px-8 text-base"
            >
                    Request a Demo
                  </Button>
                </Link>
              </AnimatedSection>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PreChatForms;
