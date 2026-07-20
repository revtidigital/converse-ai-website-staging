import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { BarChart3, Calendar, Download, Clock, Users, Zap, TrendingUp, FileText } from "lucide-react";

const TeamReports = () => {
  return (
    <>
      <Helmet>
        <title>Team Performance Reports & Analytics | ConverseAI</title>
        <meta name="description" content="Track team productivity and performance with ConverseAI Team Reports. Analyze workload, response times, and team efficiency." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Team Performance Reports & Analytics | ConverseAI" />
        <meta property="og:description" content="Track team productivity and performance with ConverseAI Team Reports. Analyze workload, response times, and team efficiency." />
        <link rel="canonical" href="https://theconverseai.com/team-reports" />
      </Helmet>

      <main className="min-h-screen bg-background pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-pink-500/10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />
          
          <div className="container-tight relative z-10">
            <AnimatedSection className="text-center max-w-4xl mx-auto">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                Team Analytics
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Monitor Team Performance with{" "}
                <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  Real-Time Auto-Updating Team Reports
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get comprehensive insights into your team's productivity, workload distribution, and response efficiency with automated reporting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact-us">
                  <Button title="Try for Free" size="lg" className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white px-8 py-6 text-lg">
                    Try for Free
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Intuitive Data Visualization */}
        <section className="py-20 bg-secondary/30">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 title="Intuitive Data Visualization" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Intuitive Data Visualization
              </h2>
              <p title="Transform complex team data into actionable insights with beautiful visual representations" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform complex team data into actionable insights with beautiful visual representations
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Activity Charts",
                  description: "Visual charts tracking team activity, message volume, and engagement patterns over time"
                },
                {
                  icon: Clock,
                  title: "Resolution Time Analytics",
                  description: "Monitor average resolution times and identify bottlenecks in your support workflow"
                },
                {
                  icon: Download,
                  title: "Exportable Reports",
                  description: "Download comprehensive reports in multiple formats for stakeholder presentations"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3  title={feature.title} className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p title={feature.description} className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Customizable Filters */}
        <section className="py-20">
          <div className="container-tight">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <span className="inline-block px-4 py-2 bg-violet-500/10 text-violet-600 rounded-full text-sm font-medium mb-6">
                  Flexible Reporting
                </span>
                <h2 title="Customizable Filters for Targeted Insights" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Customizable Filters for{" "}
                  <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    Targeted Insights
                  </span>
                </h2>
                <p title="Slice and dice your team data exactly how you need it. Filter by date ranges, business hours, teams, and more." className="text-lg text-muted-foreground mb-8">
                  Slice and dice your team data exactly how you need it. Filter by date ranges, business hours, teams, and more.
                </p>
                <ul className="space-y-4">
                  {[
                    "Custom date range selection",
                    "Business hours vs. all hours comparison",
                    "Team-wise performance views",
                    "One-click report downloads"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <span title={item} className="text-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Calendar, label: "Date Ranges", value: "Custom" },
                    { icon: Clock, label: "Business Hours", value: "Tracked" },
                    { icon: Users, label: "Team Views", value: "Unlimited" },
                    { icon: Download, label: "Export", value: "PDF/CSV" }
                  ].map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-border/50 rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p title={stat.label} className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p title={stat.value} className="text-lg font-semibold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Optimize Team Tracking */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-violet-500/5 to-pink-500/5">
          <div className="container-tight">
            <AnimatedSection className="text-center mb-16">
              <h2 title="Optimize Team Tracking with AI" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Optimize Team Tracking with AI
              </h2>
              <p title="Let AI do the heavy lifting while you focus on strategic decisions" className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let AI do the heavy lifting while you focus on strategic decisions
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "AI-Powered Summaries",
                  description: "Automatically generated insights highlighting key performance trends and anomalies"
                },
                {
                  icon: TrendingUp,
                  title: "Real-Time Updates",
                  description: "Live dashboard updates ensure you're always looking at the latest team metrics"
                },
                {
                  icon: FileText,
                  title: "Zero Manual Reporting",
                  description: "Eliminate spreadsheet work with automated report generation and scheduling"
                }
              ].map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 title={feature.title} className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p title={feature.description} className="text-muted-foreground">
                      {feature.description}
                    </p>
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
                  <h2 title="Ready to Unlock Team Insights?" className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Unlock Team Insights?
                  </h2>
                  <p title="See how ConverseAI Team Reports can transform your team's productivity tracking" className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                    See how ConverseAI Team Reports can transform your team's productivity tracking
                  </p>
                  <Link to="/contact-us">
                    <Button title="Request a Demo to ConveerseAI" size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold">
                      Request a Demo
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

export default TeamReports;
