import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Inbox, BarChart3, Filter, Clock, TrendingUp, Zap, Download, Layers } from "lucide-react";

const InboxReports = () => {
  return (
    <>
      <Helmet>
        <title>Inbox Reports & Conversation Analytics | ConverseAI</title>
        <meta name="description" content="Analyze inbox performance with real-time reporting using ConverseAI Inbox Reports. Track resolution time, volume, and team workload." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Inbox Reports & Conversation Analytics | ConverseAI" />
        <meta property="og:description" content="Analyze inbox performance with real-time reporting using ConverseAI Inbox Reports. Track resolution time, volume, and team workload." />
        <link rel="canonical" href="https://theconverseai.com/inbox-reports" />
      </Helmet>

      <main className="min-h-screen bg-background pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-pink-500/10" />
          <div className="absolute top-10 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="text-center max-w-4xl mx-auto">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                Inbox Analytics
              </span>
              <h1 title="Analyze Your Inboxes with Real-Time Reporting"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Analyze Your Inboxes with{" "}
                <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  Real-Time Reporting
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get a complete picture of your inbox performance across all channels with actionable insights and trends.
              </p>
              <div title="Request a Demo to Converse AI" className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact-us">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white px-8 py-6 text-lg">
                    Request a Demo
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Clear Data Visualization */}
        <section className="py-20 bg-secondary/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Clear and Concise Data Visualization
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Understand your inbox health at a glance with intuitive visual analytics
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "Resolution Time Tracking",
                  description: "Monitor average and median resolution times to ensure SLA compliance and customer satisfaction"
                },
                {
                  icon: TrendingUp,
                  title: "Message Volume Trends",
                  description: "Track incoming message patterns to optimize staffing and resource allocation"
                },
                {
                  icon: Layers,
                  title: "Channel Distribution",
                  description: "Visualize message volume across all channels including email, chat, WhatsApp, and social"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p title={feature.description} className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Customizable Reporting Filters */}
        <section className="py-20">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <span className="inline-block px-4 py-2 bg-violet-500/10 text-violet-600 rounded-full text-sm font-medium mb-6">
                  Flexible Filters
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Customizable{" "}
                  <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    Reporting Filters
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Slice your inbox data any way you need to uncover insights specific to your business.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Filter, text: "Date, team, and channel-based filtering" },
                    { icon: Download, text: "Download tailored reports in PDF/CSV" },
                    { icon: BarChart3, text: "Custom metric dashboards" },
                    { icon: Zap, text: "Scheduled automated reports" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span title={item.text} className="text-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-3xl p-8">
                  <div className="space-y-4">
                    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">Filter by Channel</span>
                        <Filter className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["All Channels", "Email", "Chat", "WhatsApp", "Social"].map((channel, index) => (
                           <div
                              key={index}
                              role="button"
                              tabIndex={0}
                              title={`Filter by ${channel}`}
                              className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                                index === 0 
                                  ? 'bg-primary text-white' 
                                  : 'bg-secondary text-foreground hover:bg-primary/10'
                              }`}
                            >
                              {channel}
                            </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Avg Resolution</p>
                        <p className="text-2xl font-bold text-foreground">2.4h</p>
                        <p className="text-xs text-green-500">↓ 15% from last week</p>
                      </div>
                      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Messages Today</p>
                        <p className="text-2xl font-bold text-foreground">847</p>
                        <p className="text-xs text-primary">↑ 8% from average</p>
                      </div>
                    </div>
                    
                    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                      <p className="text-sm font-medium text-foreground mb-3">Volume by Channel</p>
                      <div className="space-y-2">
                        {[
                          { channel: "Chat", percent: 45 },
                          { channel: "Email", percent: 30 },
                          { channel: "WhatsApp", percent: 20 },
                          { channel: "Social", percent: 5 }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span title={item.channel} className="text-sm text-muted-foreground w-20">{item.channel}</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                            <span title={`${item.percent}%`} className="text-sm text-foreground w-10 text-right">{item.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Start Monitoring */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-violet-500/5 to-pink-500/5">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Start Monitoring Your Inboxes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take control of your inbox performance with comprehensive analytics
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Inbox,
                  title: "Unified Inbox Performance View",
                  description: "See all your channels in one place with a consolidated dashboard that highlights key metrics and trends across every inbox"
                },
                {
                  icon: Zap,
                  title: "Faster Operational Decisions",
                  description: "Real-time data empowers you to make quick, informed decisions about resource allocation and process improvements"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3  title={feature.title} className="text-2xl font-semibold text-foreground mb-4">{feature.title}</h3>
                    <p title={feature.description} className="text-muted-foreground text-lg">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container-tight">
            <AnimatedSection>
              <div className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Optimize Your Inbox?
                  </h2>
                  <p title="See how ConverseAI Inbox Reports can help you deliver faster, better support" className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                    See how ConverseAI Inbox Reports can help you deliver faster, better support
                  </p>
                  <Link to="/contact-us">
                    <Button title="Request a callback to learn more about Inbox Reports" size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold">
                      Get a Call Back
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default InboxReports;
