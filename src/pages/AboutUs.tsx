import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Link } from "react-router-dom";
import { 
  Bot, 
  MessageSquare, 
  Smartphone, 
  BarChart3, 
  Globe, 
  Shield, 
  Zap, 
  Users, 
  Clock,
  ArrowRight,
  Target,
  Eye,
  CheckCircle,
  Server,
  Headphones,
  TrendingUp
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Chatbot Automation",
      description: "Intelligent bots that handle inquiries, qualify leads, and provide 24/7 support."
    },
    {
      icon: MessageSquare,
      title: "Live Chat Solutions",
      description: "Seamless real-time conversations between your team and customers."
    },
    {
      icon: Smartphone,
      title: "WhatsApp Business Automation",
      description: "Engage customers on their preferred messaging platform with automated workflows."
    },
    {
      icon: Globe,
      title: "Omni-channel Engagement",
      description: "Unified customer conversations across web, mobile, and social channels."
    },
    {
      icon: BarChart3,
      title: "Analytics & Tracking",
      description: "Data-driven insights to optimize customer engagement and team performance."
    }
  ];

  const advantages = [
    {
      icon: Server,
      title: "Focus on Businesses",
      description: "Built around your business needs, ConverseAI provides simple, affordable tools that help you communicate better and grow faster."
    },
    {
      icon: Users,
      title: "Simplified Communication",
      description: "Streamline your customer communication with one powerful platform. Manage every interaction in one place—no more switching between multiple tools or channels."
    },
    {
      icon: Shield,
      title: "Enterprise-grade Security",
      description: "Bank-level encryption and compliance with global data protection standards."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live dashboards and insights to track every customer interaction."
    },
    {
      icon: Zap,
      title: "Fast Onboarding",
      description: "Get started in minutes with easy setup and seamless integrations."
    }
  ];

  const trustStats = [
    { icon: Clock, value: "24/7", label: "Always On Support" },
    { icon: Shield, value: "Secure", label: "Cloud Infrastructure" },
    { icon: Headphones, value: "Expert", label: "Dedicated Support" },
    { icon: TrendingUp, value: "1000+", label: "Growing Businesses" }
  ];

  return (
    <>
      <Helmet>
        <title>About ConverseAI | AI Customer Engagement Platform</title>
        <meta name="description" content="Learn about ConverseAI, our mission, vision, and how we help businesses grow using AI-powered chatbots, live chat, and WhatsApp automation." />
        <link rel="canonical" href="https://theconverseai.com/about-us" />
      </Helmet>
      
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-violet/20 to-background" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          
          <div className="container-tight relative z-10 text-center py-20 md:py-28">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                About Us
              </span>
            </AnimatedSection>
            
            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                About ConverseAI –{" "}
                <span className="gradient-text">Powering Smarter Conversations</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                ConverseAI is an AI-powered customer engagement platform that helps businesses 
                automate, connect, and grow through intelligent conversations across digital channels.
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ContactFormDialog>
                  <Button title="Start Free Trial With Converse AI" variant="hero" size="xl">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </ContactFormDialog>
                <Link to="/contact-us">
                  <Button title="Contact Sales" variant="hero-outline" size="xl" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="section-padding bg-gradient-to-b from-background to-secondary/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 title="Our Story" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our <span className="gradient-text">Story</span>
                </h2>
                <p title="Learn about the origins and mission of ConverseAI" className="text-lg text-muted-foreground leading-relaxed">
                  ConverseAI was built to solve modern customer communication challenges by bringing 
                  together AI chatbots, live chat, and WhatsApp Business automation into a single, 
                  easy-to-use platform. We help businesses simplify engagement while improving customer 
                  satisfaction and operational efficiency. Our journey began with a simple belief: 
                  every business deserves access to powerful conversational AI tools that were once 
                  reserved for enterprise giants.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="section-padding">
          <div className="container-tight">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <AnimatedSection delay={0.1}>
                <div className="glass-card rounded-2xl p-8 md:p-10 h-full border border-primary/20 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mb-6">
                      <Target className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 title="Our Mission" className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                    <p title="To empower businesses with intelligent conversational tools that drive engagement, improve support, and accelerate growth" className="text-muted-foreground leading-relaxed">
                      To empower businesses with intelligent conversational tools that drive engagement, 
                      improve support, and accelerate growth. We believe that meaningful conversations 
                      are the foundation of lasting customer relationships.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2}>
                <div className="glass-card rounded-2xl p-8 md:p-10 h-full border border-violet/20 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet to-primary flex items-center justify-center mb-6">
                      <Eye className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 title="Our Vision" className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                    <p title="To become the most trusted conversational AI platform for businesses worldwide. We envision a future where every business can deliver personalized, intelligent customer experiences at scale." className="text-muted-foreground leading-relaxed">
                      To become the most trusted conversational AI platform for businesses worldwide. 
                      We envision a future where every business can deliver personalized, intelligent 
                      customer experiences at scale.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="section-padding bg-gradient-to-b from-background to-secondary/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What We <span className="gradient-text">Do</span>
                </h2>
                <p title="Comprehensive solutions to transform your customer engagement strategy" className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive solutions to transform your customer engagement strategy
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <AnimatedSection key={feature.title} delay={index * 0.1}>
                  <div className="glass-card-hover rounded-2xl p-6 md:p-8 text-center h-full">
                    <div className="w-14 h-14 mx-auto rounded-2xl gradient-cta flex items-center justify-center mb-5">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 title={feature.title} className="text-lg font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p title={feature.description} className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose ConverseAI Section */}
        <section className="section-padding">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 title="Why Choose ConverseAI" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Why Choose <span className="gradient-text">ConverseAI</span>
                </h2>
                <p title="The platform trusted by forward-thinking businesses" className="text-muted-foreground max-w-2xl mx-auto">
                  The platform trusted by forward-thinking businesses
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantages.map((advantage, index) => (
                <AnimatedSection key={advantage.title} delay={index * 0.08}>
                  <div className="flex items-start gap-4 p-6 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <advantage.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 title={advantage.title} className="font-semibold text-foreground mb-1">
                        {advantage.title}
                      </h3>
                      <p title={advantage.description} className="text-sm text-muted-foreground">
                        {advantage.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Credibility Section */}
        <section className="section-padding bg-gradient-to-b from-secondary/30 to-background">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 title="Trust & Credibility" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Trust & <span className="gradient-text">Credibility</span>
                </h2>
                <p title="Built for reliability, designed for scale" className="text-muted-foreground max-w-2xl mx-auto">
                  Built for reliability, designed for scale
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {trustStats.map((stat, index) => (
                <AnimatedSection key={stat.label} delay={index * 0.1}>
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <div title={stat.label} className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            
            <AnimatedSection delay={0.4}>
              <div className="mt-12 max-w-3xl mx-auto">
                <div className="glass-card rounded-2xl p-8 border border-primary/20">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {[
                      "Secure Cloud Infrastructure",
                      "Dedicated Support Team",
                      "Trusted by Growing Businesses",
                      "24/7 Always On Support"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5 text-mint" />
                        <span title={item} className="text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet/15 to-background" />
          <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet/20 rounded-full blur-3xl" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h2  title="Join Thousands of Businesses" className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Join thousands of businesses building{" "}
                  <span className="gradient-text">better conversations</span> with ConverseAI
                </h2>
                <p title="Start transforming your customer engagement today" className="text-lg text-muted-foreground mb-10">
                  Start transforming your customer engagement today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ContactFormDialog>
                    <Button title="Get Started Free with ConverseAI" variant="hero" size="xl">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </ContactFormDialog>
                  <Link to="/contact-us">
                    <Button title="Talk to Sales" variant="hero-outline" size="xl" className="w-full">
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
