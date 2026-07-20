import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  Bot, 
  Zap, 
  Globe, 
  ShoppingCart, 
  Plane, 
  Calendar, 
  Ticket, 
  PartyPopper,
  Sparkles,
  Languages,
  Target,
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const WhatsAppAIChatbot = () => {
  const useCases = [
    { icon: ShoppingCart, title: "Shopping", description: "Personalized product recommendations and order assistance" },
    { icon: Plane, title: "Travel Booking", description: "Instant travel queries, bookings, and itinerary support" },
    { icon: Calendar, title: "Appointment Scheduling", description: "Automated booking and reminder management" },
    { icon: PartyPopper, title: "Event Registration", description: "Seamless event signups and confirmations" },
    { icon: Ticket, title: "Ticketing", description: "Quick ticket purchases and support queries" },
  ];

  const aiFeatures = [
    { icon: Sparkles, title: "Overcome Writer's Block", description: "AI suggestions help craft perfect responses instantly" },
    { icon: Languages, title: "Speak Your Customer's Language", description: "Multi-language support for global reach" },
    { icon: Target, title: "Tailor Replies Dynamically", description: "Context-aware responses based on customer history" },
    { icon: FileText, title: "Simplify Complex Responses", description: "Break down complex info into digestible messages" },
  ];

  return (
    <>
      <Helmet>
        <title>WhatsApp AI Chatbot for Customer Engagement | ConverseAI</title>
        <meta name="description" content="Automate WhatsApp conversations with ConverseAI WhatsApp AI Chatbot. Deliver personalized, instant support and boost customer engagement." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="WhatsApp AI Chatbot for Customer Engagement | ConverseAI" />
        <meta property="og:description" content="Automate WhatsApp conversations with ConverseAI WhatsApp AI Chatbot. Deliver personalized, instant support and boost customer engagement." />
        <link rel="canonical" href="https://theconverseai.com/whatsapp-ai-chatbot" />
      </Helmet>

      <main className="min-h-screen bg-background pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <WhatsAppIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">WhatsApp AI Chatbot</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Enhanced Conversations with WhatsApp AI Chatbot
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Simplify customer queries with AI-driven WhatsApp automation, deliver personalized replies, and improve engagement at scale.
              </p>
              
              <Link to="/contact-us">
                <Button title="Request a Demo with ConverseAI" size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25">
                  Request a Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </AnimatedSection>

            {/* Hero Visual */}
            <AnimatedSection delay={0.2} className="mt-12 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div title="ConverseAI Bot" className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <WhatsAppIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 title="ConverseAI Bot" className="font-semibold text-foreground">ConverseAI Bot</h3>
                      <p title="Online" className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-2xl rounded-tl-none p-3 max-w-xs">
                      <p  title="Hi! How can I help you today? 🤖" className="text-sm text-foreground">Hi! How can I help you today? 🤖</p>
                    </div>
                    <div className="bg-primary/10 rounded-2xl rounded-tr-none p-3 max-w-xs ml-auto">
                      <p title="I need help with my order" className="text-sm text-foreground">I need help with my order</p>
                    </div>
                    <div className="bg-muted/50 rounded-2xl rounded-tl-none p-3 max-w-xs">
                      <p title="I'll help you track your order. Please share your order ID 📦" className="text-sm text-foreground">I'll help you track your order. Please share your order ID 📦</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Accelerate Sales Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 title="Accelerate WhatsApp Sales with Personalization" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Accelerate WhatsApp Sales with Personalization
              </h2>
              <p title="Deliver context-aware conversations that convert visitors into loyal customers" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deliver context-aware conversations that convert visitors into loyal customers
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Bot, title: "AI-Powered Responses", description: "Intelligent replies that understand customer intent and context" },
                { icon: MessageCircle, title: "Context-Aware Conversations", description: "Every message builds on previous interactions for seamless support" },
                { icon: Zap, title: "Personalized Offers", description: "Dynamic recommendations based on customer preferences and history" },
              ].map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 title={item.title} className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p title={item.description} className="text-muted-foreground">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* AI Content Enhancement Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 title="AI-Powered Content Enhancement" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                AI-Powered Content Enhancement
              </h2>
              <p title="Leverage AI to craft perfect responses every time" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Leverage AI to craft perfect responses every time
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 title={feature.title} className="text-lg font-semibold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p title={feature.description} className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Use Cases */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 title="Industry Use Cases" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Industry Use Cases
              </h2>
              <p title="Transform customer experiences across industries" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform customer experiences across industries
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {useCases.map((useCase, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <useCase.icon className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 title={useCase.title} className="text-lg font-semibold mb-2 text-foreground">
                      {useCase.title}
                    </h3>
                    <p title={useCase.description} className="text-sm text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center">
              <div className="max-w-3xl mx-auto">
                <h2 title="Powerful Integrations" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Powerful Integrations
                </h2>
                <p title="Power up your workflow with integrations into your favourite tools" className="text-lg text-muted-foreground mb-8">
                  Power up your workflow with integrations into your favourite tools.
                </p>
                <Link to="/contact-us">
                  <Button title="Explore Integrations" variant="outline" size="lg" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                    Explore Integrations
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Elevate Your WhatsApp Customer Engagement Today
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses delivering exceptional customer experiences on WhatsApp
              </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us">
              <Button
                title="Get Started Free with ConverseAI"
                variant="hero-outline"
                size="lg"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gradient-cta text-primary-foreground shadow-glow hover:shadow-[0_16px_50px_-10px_hsl(262_83%_58%_/_0.6)] hover:scale-[1.03] hover:-translate-y-1 active:scale-100 active:translate-y-0 font-semibold h-14 rounded-xl px-8 text-base"
              >
                Get Started Free
              </Button>
            </Link>
            { <Link to="/contact-us">
              <Button
                title="Contact Sales"
                variant="outline"
                size="lg"
                className="inline-flex w-[194px]  items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-primary/30 bg-white/80 backdrop-blur-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow hover:scale-[1.03] hover:-translate-y-1 active:scale-100 font-medium h-14 rounded-xl px-8 text-base"
              >
                Talk to Sales
              </Button>
            </Link> }
            {/*  <Button variant="outline" size="lg"  className="border-2 border-white text-white bg-transparent px-8 py-6 text-lg rounded-full 
               hover:bg-white/10 hover:text-white backdrop-blur-sm" >
               Contact Sales
             </Button> */}

          </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default WhatsAppAIChatbot;
