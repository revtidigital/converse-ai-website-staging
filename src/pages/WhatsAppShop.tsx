import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Package, 
  CreditCard, 
  Truck, 
  RefreshCw,
  Grid3X3,
  Layers,
  Sparkles,
  Bot,
  Workflow,
  Clock,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const WhatsAppShop = () => {
  const setupFeatures = [
    { icon: RefreshCw, title: "Sync with WooCommerce / Google Sheets", description: "Import your product catalog in seconds" },
    { icon: Package, title: "Create Catalogs Instantly", description: "Beautiful product displays with images and pricing" },
    { icon: Zap, title: "Real-Time Inventory Sync", description: "Always show accurate stock levels" },
  ];

  const categoryFeatures = [
    { icon: Grid3X3, title: "Smart Categories", description: "Organize products for easy browsing" },
    { icon: Layers, title: "Product Bundles", description: "Create attractive combo offers" },
    { icon: Sparkles, title: "Personalized Suggestions", description: "AI-powered product recommendations" },
  ];

  const salesFeatures = [
    { icon: MessageSquare, title: "Instant Inquiry", description: "Answer product questions in real-time" },
    { icon: ShoppingBag, title: "Order Placement", description: "Complete purchases within WhatsApp" },
    { icon: CreditCard, title: "Payment Collection", description: "Secure payment processing" },
    { icon: Truck, title: "Order Tracking", description: "Real-time delivery updates" },
    { icon: RefreshCw, title: "Automated Follow-ups", description: "Post-purchase engagement" },
  ];

  return (
    <>
      <Helmet>
        <title>WhatsApp Shop for Ecommerce & Product Catalogs | ConverseAI</title>
        <meta name="description" content="Sell directly on WhatsApp with ConverseAI WhatsApp Shop. Create product catalogs, automate orders, and convert conversations into sales." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="WhatsApp Shop for Ecommerce & Product Catalogs | ConverseAI" />
        <meta property="og:description" content="Sell directly on WhatsApp with ConverseAI WhatsApp Shop. Create product catalogs, automate orders, and convert conversations into sales." />
        <link rel="canonical" href="https://theconverseai.com/whatsapp-shop" />
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
                <span className="text-sm font-medium text-green-600">WhatsApp Shop</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Empower Customers to Shop Seamlessly Through WhatsApp
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Transform your ecommerce experience by enabling direct purchases, catalogs, and payments inside WhatsApp.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link to="/contact-us">
                  <Button  title="Start Your Free Trial with ConverseAI" size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No setup fee
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No credit card required
                </span>
              </div>
            </AnimatedSection>

            {/* Hero Visual */}
            <AnimatedSection delay={0.2} className="mt-12 max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-2xl">
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Summer Collection", price: "$49.99", image: "👗" },
                      { name: "Wireless Earbuds", price: "$79.99", image: "🎧" },
                      { name: "Smart Watch", price: "$199.99", image: "⌚" },
                    ].map((product, index) => (
                      <div key={index} className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="text-4xl mb-3">{product.image}</div>
                        <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                        <p className="text-primary font-bold">{product.price}</p>
                        <button title="Buy on WhatsApp" className="mt-2 w-full py-2 bg-green-500 text-white text-xs rounded-lg font-medium">
                          Buy on WhatsApp
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Quick Setup Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Quick Product Setup & Management
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your shop running in minutes with our intuitive setup process
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {setupFeatures.map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Categorization Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Categorization & Product Bundling
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Organize your products for maximum discoverability and sales
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {categoryFeatures.map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-gradient-to-br from-background to-muted/30 rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Automated Chatbots Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Automated Chatbots & Flows
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Create powerful shopping experiences with our intuitive automation tools
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Workflow, text: "Drag & drop flow builder" },
                    { icon: Clock, text: "24/7 shopping assistant" },
                    { icon: Bot, text: "Auto catalog sharing" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-background/80 rounded-xl border border-border/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bot className="w-4 h-4" />
                        Flow Builder
                      </div>
                      <div className="space-y-3">
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <span className="text-sm font-medium text-primary">Welcome Message</span>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-0.5 h-6 bg-border" />
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-3 text-center">
                          <span className="text-sm font-medium text-green-600">Show Catalog</span>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-0.5 h-6 bg-border" />
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                          <span className="text-sm font-medium text-purple-600">Process Order</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Convert Sales Section */}
        <section className="py-16 md:py-24">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Convert Conversations into Sales
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete the entire shopping journey within WhatsApp
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {salesFeatures.map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="group bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center h-full">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Elevate Your WhatsApp Sales Strategy Today
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Transform chats into conversions with ConverseAI WhatsApp Shop
              </p>
              <Link to="/contact-us">
                <Button title="Request a Demo to See ConverseAI in Action" size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg">
                  Request a Demo
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

export default WhatsAppShop;
