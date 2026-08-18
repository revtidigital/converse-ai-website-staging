import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Mic, Phone, Globe, BarChart3, Shield, CheckCircle2, Brain, Clock,
  Users, TrendingUp, ArrowRight, MessageCircle, Target, Lock,
  Database, AlertCircle
} from 'lucide-react'
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const metaTitle = "AI Voice Agents — Multilingual, Compliant, Production-Ready | ConverseAI";
const metaDescription =
  "AI voice agents for collections, lead qualification, customer support, and appointments. RBI-compliant, TCPA-compliant, Hindi/English, 24/7 managed service. 60-80% resolution rate.";
const ogTitle = "AI Voice Agents That Scale With You — ConverseAI";
const ogDescription =
  "Multilingual voice agents for collections, lead qualification, support, and appointments. RBI & TCPA compliant. 60-80% resolution rate.";
const twitterTitle = "AI Voice Agents for Enterprise | ConverseAI";
const twitterDescription =
  "Build, deploy, and operate multilingual voice agents. RBI-compliant collections, lead qualification, support automation.";

const features = [
  { icon: Brain, title: "Real-Time NLU & Context", description: "Understands multi-turn conversations, context history, and intent shifts in real time — not keyword matching." },
  { icon: Globe, title: "Multilingual & Compliant", description: "Hindi (72-85% ASR), Tamil, English (95%+). India: RBI & TRAI approved. US: TCPA compliant." },
  { icon: AlertCircle, title: "Sentiment Detection", description: "Monitors caller emotion second-by-second. Escalates proactively when frustration is detected." },
  { icon: Database, title: "CRM Integration", description: "Reads account history, writes call outcomes, creates tasks, logs sentiment — zero manual work." },
  { icon: Lock, title: "Compliance Audit Trail", description: "Every call recorded, transcribed, and logged. Regulators can review anytime. DND screening automated." },
  { icon: Clock, title: "24/7 Production Monitoring", description: "Our team monitors call quality, sentiment trends, and anomalies in real time. Weekly optimization cycles." },
];

const useCases = [
  {
    icon: Phone,
    title: "Collections & NBFC",
    description: "RBI-compliant voice agents handling 5K+ calls/month. Cost-effective automation. Self-resolution: 60-70%.",
    metric: "60-70% self-resolution",
  },
  {
    icon: Target,
    title: "Lead Qualification",
    description: "Qualify leads in real-time with BANT scoring. Auto-book meetings. 40-50% conversion to qualified pipeline.",
    metric: "40-50% qualified leads",
  },
  {
    icon: Users,
    title: "Customer Support",
    description: "Deflect routine calls (order status, FAQs, returns). 1.5 min avg handling time vs 5-7 min human.",
    metric: "40-60% call deflection",
  },
  {
    icon: Clock,
    title: "Appointment Reminders",
    description: "Reduce no-shows by 15-25%. Confirm attendance, offer rescheduling. Works for healthcare, salons, clinics.",
    metric: "15-25% no-show reduction",
  },
];

const deploymentModels = [
  {
    title: "DIY Platform",
    description: "Self-service platform. You build and operate.",
    setup: "2-4 weeks",
    bestFor: "Experts with high-volume, simple use cases",
    cons: ["Requires ops maturity", "Higher failure rate in production", "Limited support"],
  },
  {
    title: "Dev Project",
    description: "We build custom agent. You run it.",
    setup: "2-3 months",
    bestFor: "Companies with strong ops teams",
    cons: ["Requires internal maintenance", "Training curve", "Scaling challenges"],
  },
  {
    title: "Managed Service",
    description: "We build, deploy, operate, and optimize.",
    setup: "2-4 weeks",
    bestFor: "Most companies. Faster ROI, lowest risk.",
    pros: ["24/7 monitoring", "Weekly optimization", "Compliance built-in", "Highest success rate"],
  },
];

const stats = [
  { value: "5-7K", label: "Calls/month (Live)", subtext: "Enterprise production scale" },
  { value: "60-80%", label: "Call Resolution Rate", subtext: "vs 15-25% traditional IVR" },
  { value: "2-4", label: "Weeks to Deploy", subtext: "Managed service model" },
  { value: "24/7", label: "Monitoring & Support", subtext: "We operate it for you" },
];

const complianceItems = [
  {
    region: "India",
    items: [
      "RBI Master Circular (Collections) approved",
      "TRAI DND Registry screening (pre-call)",
      "Consent logging with audio proof",
      "Call frequency limits (max 2/week per debtor)",
      "Sentiment monitoring (abuse detection)",
      "Audit trail for regulators",
    ],
  },
  {
    region: "US",
    items: [
      "TCPA compliant (Telephone Consumer Protection Act)",
      "FDCPA compliant (Fair Debt Collection Practices)",
      "Prior written consent tracking",
      "Time-zone aware (8 AM - 9 PM calls)",
      "Explicit caller ID & company identification",
      "Stop-request enforcement (immediate halt)",
    ],
  },
];

const faqItems = [
  { q: "How long does deployment take?", a: "Managed service: 2-4 weeks (we handle everything). Dev project: 2-3 months. DIY platform: 2-4 weeks learning curve + ongoing ops." },
  { q: "Does it work in Hindi?", a: "Yes. Hindi ASR is 72-85% accurate (vs 60% in 2023). English is 95%+. Regional language support (Tamil, Telugu, Kannada) available with tuning." },
  { q: "Can it handle angry customers?", a: "Yes. Agent detects frustration in real-time, adapts tone, offers empathy, and escalates warm to humans if needed. Escalation rules are customizable." },
  { q: "What if call quality is bad?", a: "Agent detects low confidence and asks for clarification or escalates. ASR accuracy drops on poor audio, but agent handles gracefully." },
  { q: "How do you monitor quality?", a: "We monitor 24/7: call sentiment trends, resolution rates, handling time, escalation patterns, and anomalies. Weekly optimization reviews with your team." },
  { q: "Is it really compliant with RBI/TRAI/TCPA?", a: "Yes. Every call pre-screens DND, logs consent, monitors abuse, and stores audit trails. Regulators can review recordings anytime. We've deployed 5K+ compliant calls." },
  { q: "What CRM systems do you integrate with?", a: "Salesforce, HubSpot, Freshsales, Zoho, Microsoft Dynamics, and custom APIs. We also integrate with Calendly, Twilio, and most modern phone systems." },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const VoiceAgents = () => {
  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content="https://www.theconverseai.com/og-voice-agents.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.theconverseai.com/voice-agents" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        <meta name="twitter:image" content="https://www.theconverseai.com/og-voice-agents.png" />
        <link rel="canonical" href="https://theconverseai.com/voice-agents" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          {/* Hero */}
          <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="absolute top-16 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet/15 rounded-full blur-3xl" />
            <div className="container-tight relative z-10 py-12">
              <AnimatedSection>
                <div className="text-center max-w-4xl mx-auto">
                  <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                    AI Voice Agents
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                    Voice Agents That <span className="gradient-text">Scale With You</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                    Multilingual, RBI-compliant voice agents for collections, lead qualification, support, and appointments.
                    We build, deploy, and operate them for you. 60-80% resolution rate. 5,000+ calls/month in production.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/book-demo">
                      <Button variant="hero" size="lg" title="Get Demo">
                        Get Demo <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link to="/contact-us">
                      <Button variant="hero-outline" size="lg" title="Contact Our Team">
                        Contact Our Team
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">See voice agents in action | No commitment</p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 bg-muted/30">
            <div className="container-tight">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <AnimatedSection key={stat.label} delay={i * 0.1}>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                      <p className="font-semibold text-foreground mb-1">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Key Capabilities */}
          <section className="py-24">
            <div className="container-tight">
              <SectionHeading
                label="Why We Win"
                title="What Makes Our Voice Agents Different"
                description="It's not just technology — it's 70% service, 30% tech. We design, build, deploy, monitor, and optimize. You don't."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <FeatureCard key={f.title} {...f} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-24 bg-muted/30">
            <div className="container-tight">
              <SectionHeading
                label="Industry Solutions"
                title="Voice Agents for Every Vertical"
                description="Collections. Lead qualification. Customer support. Appointment reminders. Pick your use case and scale."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, i) => (
                  <AnimatedSection key={useCase.title} delay={i * 0.1}>
                    <div className="glass-card p-8 rounded-xl h-full">
                      <useCase.icon className="w-10 h-10 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-3 text-foreground">{useCase.title}</h3>
                      <p className="text-muted-foreground mb-4">{useCase.description}</p>
                      <span className="text-sm font-semibold text-primary">{useCase.metric}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Proof Point */}
          <section className="py-24">
            <div className="container-tight">
              <SectionHeading
                label="Live in Production"
                title="Voice Agents That Work at Scale"
                description="Not theory. Real customers, real calls, real outcomes."
              />
              <AnimatedSection>
                <div className="p-8 bg-gradient-to-br from-primary/5 to-violet/5 rounded-xl border border-primary/20 max-w-3xl mx-auto">
                  <p className="text-sm font-semibold text-primary mb-2">Leading Auction Company</p>
                  <p className="text-3xl font-bold text-foreground mb-4">7,000-8,000 calls/month</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Hindi/English voice agents handling lead qualification, bid processing, and appointment reminders in production.
                    Live since 2025 with zero human intervention once agent approves a bid. 60-70% self-resolution rate with full RBI compliance.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Deployment Models */}
          <section className="py-24 bg-muted/30">
            <div className="container-tight">
              <SectionHeading
                label="How It Works"
                title="Three Deployment Models"
                description="Pick the one that fits your team's ops maturity and timeline."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deploymentModels.map((model, i) => (
                  <AnimatedSection key={model.title} delay={i * 0.1}>
                    <div
                      className={`p-8 rounded-xl h-full ${
                        model.title === "Managed Service"
                          ? "bg-gradient-to-br from-primary/10 to-violet/10 border border-primary/50"
                          : "glass-card"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-2 text-foreground">{model.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6">{model.description}</p>

                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Setup Time</p>
                          <p className="font-semibold text-foreground">{model.setup}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Best For</p>
                          <p className="text-sm text-foreground">{model.bestFor}</p>
                        </div>
                      </div>

                      {model.pros && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-primary mb-3">Why ConverseAI Managed Service Wins</p>
                          {model.pros.map((pro) => (
                            <div key={pro} className="flex items-start gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{pro}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {model.cons && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-destructive mb-3">Challenges</p>
                          {model.cons.map((con) => (
                            <div key={con} className="flex items-start gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{con}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section className="py-24">
            <div className="container-tight">
              <SectionHeading
                label="Regulatory"
                title="Compliance Built-In"
                description="RBI & TRAI approved in India. TCPA & FDCPA compliant in US. Audit trail for every call."
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {complianceItems.map((region, i) => (
                  <AnimatedSection key={region.region} delay={i * 0.1}>
                    <h3 className="text-2xl font-bold mb-6 text-foreground">{region.region}</h3>
                    <ul className="space-y-3">
                      {region.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="py-24 bg-muted/30">
            <div className="container-tight">
              <AnimatedSection>
                <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-8 rounded-xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shrink-0">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Enterprise-Grade Security</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Your data is protected with GDPR, HIPAA, and SOC 2 compliance. Encrypted calls, secure CRM integrations,
                      and audit trails. We host on enterprise cloud infrastructure with DDoS protection and 99.99% uptime SLA.
                    </p>
                    <ul className="grid grid-cols-2 gap-4 text-sm">
                      {["GDPR compliant", "HIPAA compliant", "SOC 2 Type II", "99.99% uptime"].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">FAQs</h2>
              </AnimatedSection>
              <div className="space-y-6 max-w-4xl mx-auto">
                {faqItems.map((item) => (
                  <AnimatedSection key={item.q}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                      <h3 className="text-lg font-semibold mb-2">{item.q}</h3>
                      <p className="text-muted-foreground">{item.a}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>


   {/* Related Blog
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Learn More"
            title="Deeper Dives on Voice Agents"
            description="Blog posts, guides, and case studies"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Voice Agents vs IVR: Complete Comparison',
                link: '/blog/voice-agents-vs-ivr',
                desc: 'Understand why voice agents resolve 60-80% of calls vs 15-25% for IVR.'
              },
              {
                title: 'Collections Compliance: RBI & TRAI Guide',
                link: '/blog/voice-agents-collections-compliance',
                desc: 'Deep dive into regulations, implementation, and real-world outcomes.'
              },
              {
                title: 'How to Build Your Own Voice Agent',
                link: '/blog/how-to-build-voice-agents',
                desc: 'Technical guide for teams ready to build in-house. Training data, NLU tuning, monitoring.'
              },
            ].map((post, i) => (
              <Link
                key={i}
                to={post.link}
                className="glass-card p-6 rounded-lg hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted mb-4">{post.desc}</p>
                <span className="text-primary text-sm font-semibold">Read article →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      */}


          {/* Final CTA */}
          <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-violet/10 to-background">
            <div className="container-tight text-center">
              <AnimatedSection>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  Ready to Transform Your <span className="gradient-text">Voice Operations?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  See voice agents in action. Get a personalized demo that shows how voice automation would work for your specific use case.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/book-demo">
                    <Button variant="hero" size="lg" title="Get Demo">
                      Get Demo <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/contact-us">
                    <Button variant="hero-outline" size="lg" title="Contact Our Team">
                      Contact Our Team
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  See it in action. No commitment. Just a real conversation about your business.
                </p>
              </AnimatedSection>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default VoiceAgents;
