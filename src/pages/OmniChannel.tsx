import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Globe, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Layers, 
  Brain, 
  Shield, 
  TrendingUp,
  ShoppingCart,
  GraduationCap,
  Plane,
  Code
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const OmniChannel = () => {
  const channels = [
    { icon: Globe, label: "Website", color: "from-primary to-violet" },
    { icon: WhatsAppIcon, label: "WhatsApp", color: "from-mint to-accent" },
    { icon: MessageSquare, label: "Live Chat", color: "from-violet to-pink-soft" },
    { icon: Smartphone, label: "Mobile Apps", color: "from-accent to-primary" },
    { icon: Mail, label: "Email", color: "from-primary to-accent" },
  ];

  const features = [
    {
      icon: Layers,
      title: "Unified Inbox for All Channels",
      description: "Manage every conversation from website, WhatsApp, social media, and email in one centralized inbox. No more switching between platforms.",
    },
    {
      icon: Brain,
      title: "AI-Powered Routing & Prioritization",
      description: "Intelligent algorithms automatically route conversations to the right agents based on skills, availability, and context for faster resolutions.",
    },
    {
      icon: Shield,
      title: "Enterprise-Ready & Scalable",
      description: "Built for businesses of all sizes with enterprise-grade security, compliance features, and infrastructure that scales with your growth.",
    },
    {
      icon: TrendingUp,
      title: "Seamless Channel Switching",
      description: "Customers can switch between channels mid-conversation without losing context. Continue on WhatsApp what started on your website.",
    },
  ];

  const industries = [
    {
      icon: ShoppingCart,
      title: "E-commerce",
      description: "Handle order inquiries, returns, and product questions across all channels with unified customer profiles.",
    },
    {
      icon: Code,
      title: "SaaS",
      description: "Provide technical support and onboarding assistance through the channel your customers prefer.",
    },
    {
      icon: GraduationCap,
      title: "Education",
      description: "Engage students and parents across platforms with consistent information and personalized support.",
    },
    {
      icon: Plane,
      title: "Travel",
      description: "Manage bookings, changes, and travel updates seamlessly across website, app, and messaging channels.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Omni Channel Customer Engagement Platform | ConverseAI</title>
        <meta name="description" content="Unify customer conversations across website, WhatsApp, and digital channels using ConverseAI's Omni Channel platform. One inbox, every channel." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Omni Channel Customer Engagement Platform | ConverseAI" />
        <meta property="og:description" content="Unify customer conversations across website, WhatsApp, and digital channels using ConverseAI's Omni Channel platform." />
        <link rel="canonical" href="https://theconverseai.com/omni-channel" />
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
              <AnimatedSection className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Omni Channel Customer Engagement{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                    Made Simple
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Deliver consistent, connected conversations across every channel from a single platform.
                </p>
                <Link to="/contact-us">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow px-8 py-6 text-lg">
                    Start Your Free Trial
                  </Button>
                </Link>
              </AnimatedSection>

              {/* Channel Icons */}
              <AnimatedSection className="mt-16">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {channels.map((channel, index) => (
                    <div 
                      key={channel.label}
                      className="group flex flex-col items-center gap-3"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${channel.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <channel.icon className="w-full h-full text-white" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{channel.label}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Engage Customers Section */}
          <section className="py-20 bg-secondary/30">
            <div className="container-tight">
              <AnimatedSection className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Engage Customers Across Every Channel
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Website, WhatsApp, Social Media & more — all connected in one seamless experience.
                </p>
              </AnimatedSection>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <AnimatedSection key={feature.title} delay={index * 0.1}>
                    <div className="glass-card p-8 rounded-2xl h-full hover:shadow-glow transition-all duration-300 group">
                      <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Industry Solutions */}
          <section className="py-20">
            <div className="container-tight">
              <AnimatedSection className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Industry-Tailored Solutions
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Omni channel engagement designed for your specific industry needs.
                </p>
              </AnimatedSection>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {industries.map((industry, index) => (
                  <AnimatedSection key={industry.title} delay={index * 0.1}>
                    <div className="glass-card p-6 rounded-2xl text-center h-full hover:shadow-glow transition-all duration-300 group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <industry.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {industry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {industry.description}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
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
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Deliver Consistent Experiences Everywhere
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Connect with customers on their preferred channels while maintaining context and continuity.
                </p>
             {/* from here to  */}
                { <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact-us">

                    <Button size="lg" className=" w-[250px] inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gradient-cta text-primary-foreground shadow-glow hover:shadow-[0_16px_50px_-10px_hsl(262_83%_58%_/_0.6)] hover:scale-[1.03] hover:-translate-y-1 active:scale-100 active:translate-y-0 font-semibold h-14 rounded-xl px-8 text-base">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/contact-us">
                  
                    <Button variant="outline" size="lg" className=" w-[250px] inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-primary/30 bg-white/80 backdrop-blur-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow hover:scale-[1.03] hover:-translate-y-1 active:scale-100 font-medium h-14 rounded-xl px-8 text-base" > 
                        Talk to Sales 
                    </Button>
                  </Link>
                </div> } 
   {/*till here  */}

               
              </AnimatedSection>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OmniChannel;
