import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { User, BarChart2, Filter, TrendingUp, Target, Lightbulb, Award, Activity } from "lucide-react";

const AgentReports = () => {
  return (
    <>
      <Helmet>
        <title>Agent Performance Reports & Analytics | ConverseAI</title>
        <meta name="description" content="Analyze agent productivity and performance with ConverseAI Agent Reports. Gain insights into individual contributions and trends." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Agent Performance Reports & Analytics | ConverseAI" />
        <meta property="og:description" content="Analyze agent productivity and performance with ConverseAI Agent Reports. Gain insights into individual contributions and trends." />
        <link rel="canonical" href="https://theconverseai.com/agent-reports" />
      </Helmet>

      <main className="min-h-screen bg-background pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-pink-500/10" />
          <div className="absolute top-10 left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="text-center max-w-4xl mx-auto">
              <span className="inline-block px-4 py-2 bg-violet-500/10 text-violet-600 rounded-full text-sm font-medium mb-6">
                Agent Analytics
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Monitor Agent Performance with{" "}
                <span className="bg-gradient-to-r from-violet-500 via-primary to-pink-500 bg-clip-text text-transparent">
                  Real-Time Reports
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Track individual agent contributions, identify top performers, and optimize workload distribution with actionable insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact-us">
                  <Button title="Request a Demo to converse AI" size="lg" className="bg-gradient-to-r from-violet-500 to-primary hover:from-violet-500/90 hover:to-primary/90 text-white px-8 py-6 text-lg">
                    Request a Demo
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Simplified Data Visualization */}
        <section className="py-20 bg-secondary/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 title="Simplified Data Visualization" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simplified Data Visualization
              </h2>
              <p title="Easy-to-understand metrics that tell the story of each agent's performance" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Easy-to-understand metrics that tell the story of each agent's performance
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: User,
                  title: "Individual Agent Metrics",
                  description: "Deep dive into each agent's performance with personalized dashboards and KPIs"
                },
                {
                  icon: BarChart2,
                  title: "Bar & Trend Charts",
                  description: "Visual representations of performance trends over time with easy-to-read charts"
                },
                {
                  icon: Activity,
                  title: "Live Activity Tracking",
                  description: "Real-time visibility into agent availability, current workload, and response status"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-violet-500/30 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-primary/20 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-violet-500" />
                    </div>
                    <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p title={feature.description} className="text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Customizable Targeted Insights */}
        <section className="py-20">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection delay={0.2} className="order-2 lg:order-1">
                <div className="relative">
                  <div className="bg-gradient-to-br from-violet-500/10 to-primary/10 rounded-3xl p-8">
                    <div className="space-y-4">
                      {[
                        { name: "Sarah Johnson", score: 95, color: "from-green-500 to-emerald-500" },
                        { name: "Mike Chen", score: 88, color: "from-violet-500 to-primary" },
                        { name: "Emily Davis", score: 82, color: "from-primary to-pink-500" }
                      ].map((agent, index) => (
                        <div key={index} className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {agent.name.charAt(0)}
                              </div>
                              <span title={agent.name} className="font-medium text-foreground">{agent.name}</span>
                            </div>
                            <span title={`${agent.score}%`} className="text-lg font-bold text-foreground">{agent.score}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${agent.color} rounded-full transition-all duration-500`}
                              style={{ width: `${agent.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection className="order-1 lg:order-2">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  Targeted Insights
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Customizable{" "}
                  <span className="bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
                    Agent Insights
                  </span>
                </h2>
                <p title="Filter and compare agent performance across different time periods to identify trends and areas for improvement." className="text-lg text-muted-foreground mb-8">
                  Filter and compare agent performance across different time periods to identify trends and areas for improvement.
                </p>
                <ul className="space-y-4">
                  {[
                    "Agent-wise performance filters",
                    "Time period comparisons",
                    "Custom metric selection",
                    "Peer benchmarking"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center">
                        <Filter className="w-3 h-3 text-violet-500" />
                      </div>
                      <span title={item} className="text-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Optimize Agent Productivity */}
        <section className="py-20 bg-gradient-to-br from-violet-500/5 via-primary/5 to-pink-500/5">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Optimize Agent Productivity
              </h2>
              <p title="Leverage AI-powered insights to maximize each agent's potential" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Leverage AI-powered insights to maximize each agent's potential
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Lightbulb,
                  title: "AI-Generated Insights",
                  description: "Receive intelligent recommendations for improving individual agent performance"
                },
                {
                  icon: Target,
                  title: "Skill Optimization",
                  description: "Match agents with conversations that align with their expertise and strengths"
                },
                {
                  icon: Award,
                  title: "Workload Balancing",
                  description: "Automatically distribute conversations to prevent burnout and maintain quality"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-violet-500/30 transition-all duration-300 text-center h-full">
                    <div title={feature.title} className="w-16 h-16 bg-gradient-to-br from-violet-500 to-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p title={feature.description} className="text-muted-foreground">{feature.description}</p>
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
              <div className="bg-gradient-to-r from-violet-500 via-primary to-pink-500 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="relative z-10">
                  <h2 title="Empower Your Agents Today" className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Empower Your Agents Today
                  </h2>
                  <p title="Discover how ConverseAI Agent Reports can help your team reach peak performance" className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                    Discover how ConverseAI Agent Reports can help your team reach peak performance
                  </p>
                  <Link to="/contact-us">
                    <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold">
                      Start Free Trial
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

export default AgentReports;
