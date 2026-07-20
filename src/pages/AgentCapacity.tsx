import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Settings, Inbox, Users, Zap, ArrowRight, MessageSquare, Clock, BarChart3 } from "lucide-react";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";

const AgentCapacity = () => {
  return (
    <>
      <Helmet>
        <title>Agent Capacity Management & Workload Control | ConverseAI</title>
        <meta name="description" content="Optimize agent workloads with ConverseAI Agent Capacity. Set auto-assignment limits and balance team performance in real time." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Agent Capacity Management & Workload Control | ConverseAI" />
        <meta property="og:description" content="Optimize agent workloads with ConverseAI Agent Capacity. Set auto-assignment limits and balance team performance in real time." />
        <link rel="canonical" href="https://theconverseai.com/agent-capacity" />
      </Helmet>

      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
          </div>

          <div className="container-tight relative z-10 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Settings className="w-4 h-4" />
                  Agent Capacity Management
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Optimize Agent Efficiency with <span className="gradient-text">ConverseAI</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Effortlessly manage agent workloads by setting precise auto-assignment limits and balancing capacity in real time.
                </p>
                <ContactFormDialog>
                  <Button title="Start Your Free Trial With ConverseAI" variant="gradient" size="xl" className="w-full group">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 title="Agent Capacity Dashboard" className="font-semibold text-foreground">Agent Capacity Dashboard</h3>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm rounded-full">Live</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: "Sarah M.", capacity: 8, current: 5, status: "online" },
                        { name: "John D.", capacity: 10, current: 8, status: "busy" },
                        { name: "Emma K.", capacity: 6, current: 3, status: "online" },
                      ].map((agent, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span title={agent.name} className="font-medium text-foreground flex-1">{agent.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                style={{ width: `${(agent.current / agent.capacity) * 100}%` }}
                              />
                            </div>
                            <span title={`${agent.current} out of ${agent.capacity} conversations`} className="text-sm text-muted-foreground">
                              {agent.current}/{agent.capacity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Auto-Assignment Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 title="Streamlined Auto-Assignment Configuration" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Streamlined Auto-Assignment Configuration
                </h2>
                <p title="Set maximum conversations per agent, prevent overload, and ensure balanced task distribution" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Set maximum conversations per agent, prevent overload, and ensure balanced task distribution.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Settings,
                  title: "Set Max Conversations",
                  description: "Define the maximum number of concurrent conversations each agent can handle."
                },
                {
                  icon: Zap,
                  title: "Prevent Overload",
                  description: "Automatically stop new assignments when agents reach their capacity limits."
                },
                {
                  icon: BarChart3,
                  title: "Balanced Distribution",
                  description: "Smart routing ensures work is evenly distributed across your team."
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p title={feature.description} className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Per-Inbox Capacity Section */}
        <section className="section-padding">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 title="Tailored Capacity for Each Inbox" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Tailored Capacity for Each Inbox
                </h2>
                <p title="Configure unique capacity limits for different inboxes and channels to optimize your support workflow." className="text-lg text-muted-foreground mb-8">
                  Configure unique capacity limits for different inboxes and channels to optimize your support workflow.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Inbox, text: "Per-inbox capacity limits" },
                    { icon: MessageSquare, text: "Multi-channel support" },
                    { icon: Zap, text: "Smart routing algorithms" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span title={item.text} className="text-foreground font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="font-semibold text-foreground mb-4">Inbox Capacity Settings</h4>
                  <div className="space-y-4">
                    {[
                      { name: "WhatsApp Support", limit: 15, icon: "💬" },
                      { name: "Email Inbox", limit: 20, icon: "📧" },
                      { name: "Live Chat", limit: 8, icon: "🔴" }
                    ].map((inbox, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{inbox.icon}</span>
                          <span title={inbox.name} className="font-medium text-foreground">
                            {inbox.name}
                          </span>
                        </div>
                        <span title={`Max: ${inbox.limit}`} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          Max: {inbox.limit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Customer Engagement Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 title="Enhance Customer Engagement" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Enhance Customer Engagement
                </h2>
                <p title="Better capacity management leads to faster responses, reduced wait times, and higher agent productivity." className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Better capacity management leads to faster responses, reduced wait times, and higher agent productivity.
                </p>
              </div>
            </AnimatedSection>

            {/* <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Faster Responses", value: "40%", description: "Reduction in response time" },
                { icon: Clock, title: "Reduced Wait Times", value: "60%", description: "Less customer waiting" },
                { icon: Users, title: "Higher Productivity", value: "35%", description: "Increase in agent output" }
              ].map((stat, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="glass-card p-8 rounded-xl text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{stat.title}</h3>
                    <p className="text-muted-foreground">{stat.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div> */}
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container-tight">
            <AnimatedSection>
              <div className="glass-card p-12 rounded-2xl text-center">
                <h2 title="Ready to Optimize Your Team's Capacity?" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Optimize Your Team's Capacity?
                </h2>
                <p title="Start managing agent workloads intelligently and deliver exceptional customer experiences." className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start managing agent workloads intelligently and deliver exceptional customer experiences.
                </p>
                <ContactFormDialog>
                  <Button title="Request a Demo" variant="gradient" size="xl" className="group">
                    Request a Demo
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AgentCapacity;
