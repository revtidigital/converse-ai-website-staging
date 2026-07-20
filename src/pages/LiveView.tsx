import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Users, Activity, ArrowRight, Clock, AlertCircle, TrendingUp } from "lucide-react";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";

const LiveView = () => {
  return (
    <>
      <Helmet>
        <title>Live View & Real-Time Agent Monitoring | ConverseAI</title>
        <meta name="description" content="Monitor conversations and agent activity in real time with ConverseAI Live View. Track availability, workload, and performance instantly." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Live View & Real-Time Agent Monitoring | ConverseAI" />
        <meta property="og:description" content="Monitor conversations and agent activity in real time with ConverseAI Live View. Track availability, workload, and performance instantly." />
        <link rel="canonical" href="https://theconverseai.com/live-view" />
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
                  <Eye className="w-4 h-4" />
                  Live View Monitoring
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Monitor Conversations and Agent Activity <span className="gradient-text">in Real Time</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Get instant visibility into agent status, conversations, and workload — all from one live dashboard.
                </p>
                <ContactFormDialog>
                  <Button title="Request a Demo to See ConverseAI in Action" variant="gradient" size="xl" className="w-full group">
                    Request a Demo
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-foreground">Live Dashboard</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-emerald-600">Live</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-foreground">24</div>
                        <div className="text-xs text-muted-foreground">Active Chats</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-foreground">8</div>
                        <div className="text-xs text-muted-foreground">Agents Online</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-foreground">3</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { status: "online", name: "Sarah M.", chats: 5 },
                        { status: "busy", name: "John D.", chats: 8 },
                        { status: "online", name: "Emma K.", chats: 3 }
                      ].map((agent, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-sm font-medium text-foreground">{agent.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{agent.chats} chats</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Open Conversations Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Track Open Conversations at a Glance
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  See all active, pending, and unassigned conversations in real-time with priority visibility.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Open vs Pending Chats",
                  description: "Instantly see which conversations are active and which need attention."
                },
                {
                  icon: AlertCircle,
                  title: "Unassigned Queues",
                  description: "Monitor unassigned conversations and assign them to available agents."
                },
                {
                  icon: TrendingUp,
                  title: "Priority Visibility",
                  description: "Identify high-priority conversations that need immediate attention."
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Agent Availability Section */}
        <section className="section-padding">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Monitor Agent Availability
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Track each agent's status in real-time and make informed decisions about task distribution.
                </p>
                <div className="space-y-4">
                  {[
                    { color: "bg-emerald-500", label: "Online", desc: "Available for new conversations" },
                    { color: "bg-amber-500", label: "Busy", desc: "At capacity, no new assignments" },
                    { color: "bg-muted-foreground", label: "Offline", desc: "Not available" }
                  ].map((status, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-4 h-4 rounded-full ${status.color}`} />
                      <div>
                        <span className="font-medium text-foreground">{status.label}</span>
                        <p className="text-sm text-muted-foreground">{status.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="font-semibold text-foreground mb-4">Real-Time Status Updates</h4>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah M.", status: "Online", capacity: "5/8", indicator: "bg-emerald-500" },
                      { name: "John D.", status: "Busy", capacity: "8/8", indicator: "bg-amber-500" },
                      { name: "Emma K.", status: "Online", capacity: "3/6", indicator: "bg-emerald-500" },
                      { name: "Mike R.", status: "Offline", capacity: "0/10", indicator: "bg-muted-foreground" }
                    ].map((agent, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${agent.indicator}`} />
                          <div>
                            <span className="font-medium text-foreground">{agent.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{agent.status}</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{agent.capacity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Workload Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  View Agent Workload in Real Time
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Monitor conversations per agent, detect peak loads, and make smart staffing decisions.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Conversations Per Agent", description: "See exactly how many chats each agent is handling right now." },
                { icon: Activity, title: "Peak Load Detection", description: "Get alerts when your team is approaching maximum capacity." },
                { icon: Clock, title: "Smart Staffing Decisions", description: "Use real-time data to optimize your team scheduling." }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container-tight">
            <AnimatedSection>
              <div className="glass-card p-12 rounded-2xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start monitoring your team's performance in real-time and deliver exceptional customer experiences.
                </p>
                <ContactFormDialog>
                  <Button variant="gradient" size="xl" className="group">
                    Get a Call Back
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

export default LiveView;
