import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Bot, Mic, Brain, Puzzle, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";

const services = [
  {
    id: "ai-strategy-audit",
    title: "AI Strategy & Readiness Audit",
    description:
      "Fixed-fee, 3-week engagement that maps your highest-ROI AI opportunities, scores them by feasibility, and delivers a 90-day action plan. Pricing is bespoke to your scope — book a free discovery call to get a clear number.",
    cta: "See the AI Strategy Audit",
    href: "/services/ai-strategy-audit",
    url: "https://www.theconverseai.com/services/ai-strategy-audit",
  },
  {
    id: "agentic-automation",
    title: "Agentic Systems & Process Automation",
    description:
      "Productized AI agents that run back-office processes end-to-end — invoice-to-pay, ticket triage, reconciliation, vendor onboarding. Start with our 4-week Agent Sprint — pricing is bespoke to your scope.",
    cta: "See Agentic Automation services",
    href: "/services/agentic-automation",
    url: "https://www.theconverseai.com/services/agentic-automation",
  },
  {
    id: "ai-voice-agents",
    title: "AI Voice Agents",
    description:
      "Human-sounding voice bots for inbound support, outbound qualification, collections, appointment booking. Multilingual (Hindi, English, regional Indian languages, Spanish). 24/7 operation, zero hold time.",
    cta: "See AI Voice Agents",
    href: "/services/ai-voice-agents",
    url: "https://www.theconverseai.com/services/ai-voice-agents",
  },
  {
    id: "custom-ai-agent-development",
    title: "Custom AI Agent Development",
    description:
      "Bespoke agents for your unique workflow — SDR research, AR clerk, L2 support, RFP drafting, internal analyst. Built from scratch, not templated. You own the code, data, and IP.",
    cta: "See Custom AI Agent Development",
    href: "/services/custom-ai-agents",
    url: "https://www.theconverseai.com/services/custom-ai-agents",
  },
  {
    id: "ai-integration-services",
    title: "AI Integration Services",
    description:
      "Plug AI into the tools you already run — Salesforce, HubSpot, Zoho, Zendesk, SAP, Tally, custom internal systems. No rip-and-replace.",
    cta: "See AI Integration Services",
    href: "/services/ai-integration",
    url: "https://www.theconverseai.com/services/ai-integration",
  },
  {
    id: "knowledge-intelligence",
    title: "Document & Knowledge Intelligence",
    description:
      "Private, permission-aware AI that reads your documents, contracts, SOPs, and knowledge bases — and answers with citations. Deployed in your cloud.",
    cta: "See Knowledge Intelligence services",
    href: "/services/knowledge-intelligence",
    url: "https://www.theconverseai.com/services/knowledge-intelligence",
  },
  {
    id: "sales-ai",
    title: "Sales Intelligence & Outreach Automation",
    description:
      "Signal-triggered outbound for B2B SaaS. Lead research, personalized email + LinkedIn + voice, reply handling. Start with a 6-week Performance Pilot — pricing is bespoke to your scope.",
    cta: "See Sales AI services",
    href: "/services/sales-ai",
    url: "https://www.theconverseai.com/services/sales-ai",
  },
];

const steps = [
  {
    title: "Step 1 — Discover (week 0).",
    description: "Free 30-min call. We understand your workflow, stack, and constraints. No slide dump.",
  },
  {
    title: "Step 2 — Scope (week 1).",
    description: "Fixed-fee proposal with outcome targets, timeline, deliverables. No T&M.",
  },
  {
    title: "Step 3 — Build (weeks 2–8).",
    description: "Sprint-based delivery. Working output weekly, not at the end.",
  },
  {
    title: "Step 4 — Deploy & measure (week 8+).",
    description: "Go live with evals, monitoring, weekly ops. We stay on retainer or hand off clean.",
  },
];

const differentiators = [
  {
    title: "Product + services DNA",
    description: "We run our own AI product at scale. You're not our first AI deployment.",
  },
  {
    title: "Ship in weeks, not quarters",
    description: "Fixed-fee, fixed-timeline. No T&M creep.",
  },
  {
    title: "Own your stack",
    description: "No lock-in; pick the model, framework, and cloud that fits your business.",
  },
  {
    title: "India + US delivery",
    description: "Built in Jaipur, delivered to US standards, priced 40–60% below US boutiques.",
  },
  {
    title: "Execution, not slideware",
    description: "Every engagement ends with something running in production.",
  },
];


const audiences = [
  "SMB and mid-market teams (20–5,000 employees) in India and the US",
  "Heads of Ops, RevOps, CX, IT, Sales, Finance — anyone owning a painful workflow",
  "B2B SaaS, services, D2C, BFSI, healthcare, education, real estate, manufacturing",
];

const faqs = [
  {
    question: "What are AI services and how are they different from AI tools?",
    answer:
      "AI services are end-to-end engagements — strategy, build, integration, deployment, and ongoing ops. AI tools are software licenses. Services are what you need when AI has to fit your workflow, your data, and the tools you already run.",
  },
  {
    question: "How is this different from a big consultancy like Deloitte or Accenture?",
    answer:
      "We actually build what we recommend. Our engagements end in production systems, not decks — and we're 30–60% of the cost because we're India-delivered with US-grade engineering.",
  },
  {
    question: "Do you only work with our existing stack, or do we have to migrate?",
    answer:
      "We work with what you have. Most engagements extend your current tools (Salesforce, HubSpot, Zoho, Zendesk, SAP, Tally) rather than replacing them.",
  },
  {
    question: "Who owns the code and the AI agents you build for us?",
    answer: "You do. Code, prompts, configs, data — all yours. We deliver clean handoff documentation on every project.",
  },
  {
    question: "What AI models do you use — are we locked in?",
    answer:
      "No lock-in. We pick the model, framework, and cloud that fits your use case — and you can swap later without a rebuild.",
  },
  {
    question: "How do you handle data security and compliance?",
    answer:
      "We deploy in your cloud (AWS/Azure/GCP/VPC) where required. We're GDPR-compliant, and engineer each solution to meet the specific compliance requirements of your engagement (e.g. DPDP India). No training on your data.",
  },
  {
    question: "What's the typical engagement size and timeline?",
    answer: "Audits: 3–4 weeks, fixed fee (bespoke to your scope). Builds: 4–12 weeks depending on complexity. Ongoing managed services available monthly.",
  },
  {
    question: "Can you work with our internal team, or do you need to own the whole thing?",
    answer: "Both. We embed with internal teams or run end-to-end — depending on what you need. Clean handoff in either case.",
  },
];

const Services = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "https://www.theconverseai.com/#professionalservice",
        name: "ConverseAI",
        url: "https://www.theconverseai.com/services",
        description:
          "End-to-end AI services: strategy audits, agent development, voice bots, integrations, and knowledge AI. Fixed-fee, shipped in weeks.",
        serviceType: "AI services for business",
        areaServed: ["India", "United States"],
      },
      {
        "@type": "ItemList",
        name: "ConverseAI AI Services",
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            name: service.title,
            description: service.description,
            url: service.url,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.theconverseai.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.theconverseai.com/services",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "Organization",
        name: "ConverseAI",
        url: "https://www.theconverseai.com",
        sameAs: [
          "https://www.linkedin.com/company/theconverseai",
          "https://www.youtube.com/@theconverseai",
          "https://www.instagram.com/theconverseai/",
          "https://www.facebook.com/61564130560658/",
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>AI Services Company: Agents, Automation & Voice | ConverseAI</title>
        <meta
          name="description"
          content="End-to-end AI services: strategy audits, agent development, voice bots, integrations, and knowledge AI. Fixed-fee, shipped in weeks. Book a free call."
        />
        <meta property="og:title" content="AI Services Company: Agents, Automation & Voice | ConverseAI" />
        <meta
          property="og:description"
          content="End-to-end AI services: strategy audits, agent development, voice bots, integrations, and knowledge AI. Fixed-fee, shipped in weeks. Book a free call."
        />
        <link rel="canonical" href="https://www.theconverseai.com/services" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="absolute top-16 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet/15 rounded-full blur-3xl" />
            <div className="container-tight relative z-10 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimatedSection>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Services</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      AI services that actually ship — not slide decks.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      AI services for businesses that want outcomes, not strategy frameworks.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      We help growing businesses move from "AI is amazing" to "AI is running our work." Strategy audits,
                      custom agents, agentic automation, voice, integration, knowledge intelligence, and outbound — delivered
                      by people who've shipped AI in production, not pitched it in PowerPoint.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Get my 90-day AI roadmap">
                          Get my 90-day AI roadmap
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Link to="/contact-us">
                        <Button variant="hero-outline" size="xl" title="Book a free AI Readiness discovery call">
                          Book a free AI Readiness discovery call
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-5 text-center">What we build & ship</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: Brain, label: "AI Strategy Audit", color: "text-primary bg-primary/10" },
                          { icon: Bot, label: "Custom AI Agents", color: "text-violet bg-violet/10" },
                          { icon: TrendingUp, label: "Agentic Automation", color: "text-mint bg-mint/10" },
                          { icon: Mic, label: "AI Voice Agents", color: "text-primary bg-primary/10" },
                          { icon: Puzzle, label: "AI Integration", color: "text-violet bg-violet/10" },
                          { icon: BookOpen, label: "Knowledge AI", color: "text-mint bg-mint/10" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-border/40">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-sm text-muted-foreground">India + US delivery · Fixed fees · Ships in weeks</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">What are AI services?</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      AI services are engagements where a specialist team scopes, builds, integrates, and runs AI systems
                      inside your business — strategy audits, custom AI agent development, voice AI, AI-powered automation,
                      AI integration with your existing CRM/ERP/helpdesk, and AI-native knowledge and sales systems.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      The difference between AI tools and AI services: tools are software you buy and try to figure out.
                      Services are teams that build the AI that fits your workflow, deploy it with guardrails, and make sure
                      it works.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Most companies know AI can transform their operations. Far fewer know where to start, what's worth
                      building, or how to make it talk to the tools they already run on. That's the gap we close.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">The problem we solve</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li>• A ChatGPT Enterprise license that barely anyone uses</li>
                      <li>• A "pilot" that stalled after the demo</li>
                      <li>• Tools with AI features that don't talk to each other</li>
                      <li>• A consulting firm that shipped a 120-slide deck and no working product</li>
                    </ul>
                    <p className="text-muted-foreground mt-6">
                      Most AI services firms don't run AI themselves. We do — every day, in our own conversational AI
                      product, at scale. That's the difference.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Our services</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Pick a starting point or build a full-stack AI roadmap — every engagement ships working systems.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <AnimatedSection key={service.id}>
                    <div
                      id={service.id}
                      className="glass-card rounded-2xl p-8 border border-border/60 bg-white/90 h-full scroll-mt-28"
                    >
                      <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <Link
                        to={service.href}
                        className="text-primary font-semibold inline-flex items-center gap-2 hover:underline"
                      >
                        {service.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">How we work</h2>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {steps.map((step) => (
                  <AnimatedSection key={step.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-br from-background via-secondary/20 to-background">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We combine product engineering with services delivery so outcomes show up fast.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {differentiators.map((item) => (
                  <AnimatedSection key={item.title}>
                    <div className="rounded-2xl border border-primary/10 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Who we work with</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We partner with teams who want AI to reduce workload, boost revenue, and improve customer experience.
                  </p>
                </div>
              </AnimatedSection>
              <ul className="max-w-3xl mx-auto space-y-3 text-muted-foreground text-lg">
                {audiences.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <Link to="/contact-us" className="text-primary font-semibold inline-flex items-center gap-2">
                  See our approach for small and mid-sized businesses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">FAQs</h2>
              </AnimatedSection>
              <div className="space-y-6 max-w-4xl mx-auto">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-violet/10 to-background">
            <div className="container-tight text-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Not sure where to start?</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start with a free AI Readiness discovery call. Pricing is bespoke to your scope, and if we build
                  together after, the audit fee is credited toward your first engagement. If we're not the right fit,
                  we'll say so in 30 minutes.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Get my 90-day AI roadmap">
                    Get my 90-day AI roadmap
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </AnimatedSection>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Services;
