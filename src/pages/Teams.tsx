import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Users, Settings, BarChart3, ArrowRight, Zap, Globe, MessageSquare, Shield } from "lucide-react";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";

const Teams = () => {
  return (
    <>
      <Helmet>
        <title>Team Management & Collaboration Platform | ConverseAI</title>
        <meta name="description" content="Organize support agents into efficient teams with ConverseAI. Automate assignments, track performance, and streamline team collaboration." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Team Management & Collaboration Platform | ConverseAI" />
        <meta property="og:description" content="Organize support agents into efficient teams with ConverseAI. Automate assignments, track performance, and streamline team collaboration." />
        <link rel="canonical" href="https://theconverseai.com/teams" />
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
                  <Users className="w-4 h-4" />
                  Team Management
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Organize Your Support Agents into <span className="gradient-text">Efficient Teams</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Create structured teams to streamline collaboration and manage conversations more effectively.
                </p>
                <ContactFormDialog>
                  <Button title="Schedule a Demo with ConverseAI" variant="gradient" size="xl" className="w-full group">
                    Schedule a Demo
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </ContactFormDialog>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 title="Team Overview" className="font-semibold text-foreground">Teams Overview</h3>
                      {/* <Button variant="outline" size="sm">+ New Team</Button> */}
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: "Sales Team", members: 5, color: "bg-blue-500" },
                        { name: "Support Team", members: 8, color: "bg-emerald-500" },
                        { name: "Technical Team", members: 4, color: "bg-violet-500" }
                      ].map((team, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div title={team.name} className={`w-3 h-3 rounded-full ${team.color}`} />
                            <span title={team.name} className="font-medium text-foreground">
                              {team.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span title={`${team.members} members`} className="text-sm text-muted-foreground">
                              {team.members} members
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

        {/* Quick Setup Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Quickly Set Up Teams
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Create teams in minutes, assign agents, and configure role-based access for better organization.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Create Teams Easily",
                  description: "Set up new teams with just a few clicks and customize their settings."
                },
                {
                  icon: Settings,
                  title: "Assign Agents",
                  description: "Add agents to teams based on skills, expertise, or department."
                },
                {
                  icon: Shield,
                  title: "Role-Based Access",
                  description: "Control what each team member can see and do with granular permissions."
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

        {/* Automate Assignments Section */}
        <section className="section-padding">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Automate Team Assignments
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Use smart routing to automatically assign conversations to the right teams based on keywords and rules.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, text: "Keyword-based routing" },
                    { icon: Zap, text: "Smart team selection" },
                    { icon: BarChart3, text: "Faster resolution times" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="font-semibold text-foreground mb-4">Auto-Assignment Rules</h4>
                  <div className="space-y-3">
                    {[
                      { keyword: "billing", team: "Finance Team", active: true },
                      { keyword: "technical", team: "Technical Team", active: true },
                      { keyword: "sales", team: "Sales Team", active: true },
                      { keyword: "support", team: "Support Team", active: false }
                    ].map((rule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <code className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">{rule.keyword}</code>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{rule.team}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Track Performance Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-tight">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Track Team Performance
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Monitor team-level analytics, response times, and productivity to optimize your support operations.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: BarChart3, title: "Team-Level Analytics", description: "View comprehensive reports for each team's performance." },
                { icon: Zap, title: "Response Time Tracking", description: "Monitor how quickly each team responds to customers." },
                { icon: Users, title: "Productivity Dashboards", description: "See which teams are performing best and where to improve." }
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

        {/* Integration Section */}
        <section className="section-padding">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="font-semibold text-foreground mb-4">Unified Dashboard</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: MessageSquare, label: "Live Chat" },
                      { icon: Globe, label: "WhatsApp" },
                      { icon: Users, label: "Email" },
                      { icon: Zap, label: "Social Media" }
                    ].map((channel, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <channel.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{channel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Integrate Teams Seamlessly
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Manage all your channels from a unified dashboard with centralized collaboration and multi-channel management.
                </p>
                <div className="space-y-4">
                  {[
                    "Unified dashboard for all channels",
                    "Multi-channel management",
                    "Centralized collaboration"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container-tight">
            <AnimatedSection>
              <div className="glass-card p-12 rounded-2xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Build Better Teams?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start organizing your support agents into efficient teams and improve collaboration today.
                </p>
                <ContactFormDialog>
                  <Button variant="gradient" size="xl" className="group">
                    Schedule a Demo
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

export default Teams;
