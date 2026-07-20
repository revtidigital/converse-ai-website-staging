import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Zap, 
  BarChart3, 
  Users, 
  Bell,
  ShoppingCart,
  Truck,
  RefreshCw,
  Eye,
  MousePointer,
  TrendingUp,
  PieChart,
  MessageCircle,
  Heart,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const WhatsAppMarketing = () => {
  const automationFeatures = [
    { icon: Bell, title: "Broadcast Campaigns", description: "Send targeted messages to thousands at once" },
    { icon: RefreshCw, title: "Drip Sequences", description: "Automated follow-up message series" },
    { icon: ShoppingCart, title: "Abandoned Cart Reminders", description: "Recover lost sales automatically" },
    { icon: Truck, title: "Order & Delivery Notifications", description: "Keep customers informed in real-time" },
  ];

  const metrics = [
    { icon: Eye, label: "Open Rate", value: "98%", color: "text-green-500" },
    { icon: MousePointer, label: "Click Rate", value: "45%", color: "text-primary" },
    { icon: TrendingUp, label: "Conversion", value: "32%", color: "text-purple-500" },
    { icon: PieChart, label: "ROI", value: "5.2x", color: "text-pink-500" },
  ];

  const benefits = [
    { icon: MessageCircle, title: "Higher Open Rates", description: "98% message open rate compared to 20% for email" },
    { icon: DollarSign, title: "Lower CAC", description: "Reduce customer acquisition costs significantly" },
    { icon: Clock, title: "Faster Responses", description: "Real-time engagement with instant replies" },
    { icon: Heart, title: "Better Satisfaction", description: "Customers prefer messaging over other channels" },
  ];

  return (
    <>
      <Helmet>
        <title>WhatsApp Marketing Automation Platform | ConverseAI</title>
        <meta name="description" content="Run high-converting WhatsApp campaigns with ConverseAI. Automate broadcast messages, drip sequences, and boost customer engagement." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="WhatsApp Marketing Automation Platform | ConverseAI" />
        <meta property="og:description" content="Run high-converting WhatsApp campaigns with ConverseAI. Automate broadcast messages, drip sequences, and boost customer engagement." />
        <link rel="canonical" href="https://theconverseai.com/whatsapp-marketing" />
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
                <span className="text-sm font-medium text-green-600">WhatsApp Marketing</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Engage Customers & Boost Lifetime Value with WhatsApp
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Run targeted campaigns, automate notifications, and personalize outreach with AI-powered WhatsApp marketing.
              </p>
              
              <Link to="/contact-us">
                <Button title="Start Your Free Trial with ConverseAI" size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <p className="mt-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Trusted by 25,000+ Global Businesses
                </span>
              </p>
            </AnimatedSection>

            {/* Hero Visual */}
            <AnimatedSection delay={0.2} className="mt-12 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-2xl">
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Campaign Performance</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {metrics.map((metric, index) => (
                      <div key={index} className="text-center p-3 bg-muted/30 rounded-xl">
                        <metric.icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
                        <p title={metric.value} className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                        <p  title={metric.label} className="text-xs text-muted-foreground">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* AI Optimization Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 title=" Optimize WhatsApp Campaigns with AI" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Optimize WhatsApp Campaigns with AI
                </h2>
                <p title="Leverage artificial intelligence to maximize your campaign performance" className="text-lg text-muted-foreground mb-8">
                  Leverage artificial intelligence to maximize your campaign performance
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Target, text: "AI-powered audience segmentation" },
                    { icon: Clock, text: "Smart campaign scheduling" },
                    { icon: Sparkles, text: "Personalized messaging at scale" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-background/80 rounded-xl border border-border/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span title={item.text} className="font-medium text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Summer Sale Campaign</span>
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">12.5K</p>
                          <p className="text-xs text-muted-foreground">Messages Sent</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-500">89%</p>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                      </div>
                      <div className="h-24 bg-muted/30 rounded-lg flex items-end p-3 gap-1">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div
                            key={i}
                            title={`Message ${i + 1}`}
                            className="flex-1 bg-gradient-to-t from-primary to-purple-500 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Automate Interactions Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Automate Customer Interactions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Set up once and let automation handle the rest
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {automationFeatures.map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3  title={feature.title} className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p title={feature.description} className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Targeting Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 title="Precision Targeting & Retargeting" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Precision Targeting & Retargeting
              </h2>
              <p title="Reach the right customers at the right time with intelligent targeting" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reach the right customers at the right time with intelligent targeting
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Audience Filters", description: "Segment users by behavior, demographics, and preferences" },
                { icon: Target, title: "Behavior-Based Targeting", description: "Target users based on their actions and interests" },
                { icon: BarChart3, title: "Campaign Performance Tracking", description: "Real-time analytics for data-driven decisions" },
              ].map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-full">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 title={item.title} className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                    <p title={item.description} className="text-muted-foreground">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Track Performance Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Track Campaign Performance
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get complete visibility into your campaign metrics
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-2xl">
                    <div className="grid md:grid-cols-4 gap-6">
                      {metrics.map((metric, index) => (
                        <div key={index} className="text-center p-4 bg-muted/30 rounded-xl">
                          <metric.icon className={`w-8 h-8 mx-auto mb-3 ${metric.color}`} />
                          <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                          <p title={metric.label} className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 text-center">
                      <Link to="/contact-us">
                        <Button title="Explore Campaign Insights" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                          Explore Campaign Insights
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Why WhatsApp Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 title="Why WhatsApp for Customer Engagement?" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Why WhatsApp for Customer Engagement?
              </h2>
              <p title="The numbers speak for themselves" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The numbers speak for themselves
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 title={benefit.title} className="text-lg font-semibold mb-2 text-foreground">{benefit.title}</h3>
                    <p title={benefit.description} className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="text-center">
              <h2 title="Get Started with ConverseAI Today" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Get Started with ConverseAI Today
              </h2>
              <p title="Join thousands of businesses growing with WhatsApp Marketing" className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses growing with WhatsApp Marketing
              </p>
              <Link to="/contact-us">
                <Button title="Start Free Trial" size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default WhatsAppMarketing;
