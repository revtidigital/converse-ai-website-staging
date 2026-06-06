import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, ClipboardList, BarChart3, Map } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const auditSteps = [
  {
    title: "Discovery workshops (week 1)",
    description:
      "Two 90-minute sessions with your leadership and team leads. We map current workflows, pain points, and existing AI spend.",
  },
  {
    title: "Data & tooling readiness assessment (week 2)",
    description:
      "We evaluate your data, systems, and integration layer to identify what’s AI-ready today, what needs to be fixed first, and where the quick wins are.",
  },
  {
    title: "Use case identification & scoring (week 2)",
    description:
      "5–10 AI use cases scored on our ROI-First framework: business impact, technical feasibility, time-to-value, and risk.",
  },
  {
    title: "90-day roadmap (week 3)",
    description:
      "Ranked action plan with recommended first build (and why), budget estimates per use case, team + tooling requirements, and milestones with success metrics.",
  },
  {
    title: "Executive readout (week 3)",
    description: "15-slide board-ready summary. Not 120. Built to be presented and acted on — not filed.",
  },
];

const scoringCriteria = [
  "Business impact (cost savings, revenue, CX)",
  "Technical feasibility (data quality, integration complexity)",
  "Time-to-value (weeks to first production)",
  "Risk (compliance, accuracy, change management)",
];

const audiences = [
  "Mid-market and SMB leaders ($5M–$500M revenue)",
  "CXOs, CTOs, Heads of Digital/Operations",
  "Teams who’ve tried AI tools but haven’t seen ROI",
  "Companies preparing to commit real budget to AI in the next 12 months",
];

const howItWorks = [
  {
    title: "Week 0 — Kickoff call (free).",
    description: "Confirm fit, scope, and stakeholders.",
  },
  {
    title: "Week 1 — Discovery.",
    description: "5–8 interviews across leadership and operating teams.",
  },
  {
    title: "Week 2 — Analysis.",
    description: "Stack + data + process review. Score use cases.",
  },
  {
    title: "Week 3 — Deliverables.",
    description: "Roadmap + executive readout + optional build proposal.",
  },
  {
    title: "Post-audit.",
    description: "If we build together, the audit fee is credited toward the first engagement.",
  },
];

const differentiators = [
  {
    title: "We build what we audit.",
    description: "Your audit fee is credited toward the first build — big firms can’t do that because they don’t build.",
  },
  {
    title: "Fixed fee, fixed timeline.",
    description: "Three weeks, one price. No scope creep or 12-week delays.",
  },
  {
    title: "Engineers and operators, not junior MBAs.",
    description: "Your audit is led by people who ship AI, not people who read about it.",
  },
  {
    title: "India + US delivery economics.",
    description: "From $999 — under 10% of what Deloitte or BCG quote.",
  },
];

const comparisonRows = [
  {
    label: "Timeline",
    converse: "3 weeks fixed",
    big4: "8–12 weeks",
    boutique: "4–8 weeks",
  },
  {
    label: "Deliverable",
    converse: "15-slide executive readout + roadmap",
    big4: "80–120 slide deck + findings report",
    boutique: "Variable",
  },
  {
    label: "Team",
    converse: "Engineers + operators",
    big4: "Partners + junior MBAs",
    boutique: "Mix",
  },
  {
    label: "Can they build what they recommend?",
    converse: "Yes — audit credited to build",
    big4: "Usually referred to SI partner",
    boutique: "Sometimes",
  },
  {
    label: "Best for",
    converse: "Mid-market + SMB committing real AI budget in 12 months",
    big4: "Fortune 500 enterprise transformations",
    boutique: "Teams wanting deeper strategy theater",
  },
];

const outcomes = [
  "A prioritized roadmap of 5–10 AI use cases",
  "Audits we've shipped typically surface $500K–$2M in annual efficiency opportunities",
  "Use-case pilot failure rate drops from 70% to under 20%",
  "A board-ready readout your CFO will actually sign off on",
  "Clear path from audit to first live AI system in 60–90 days",
];

const pricingTiers = [
  {
    title: "Essential",
    scope: "Single function (e.g., CX or RevOps)",
    price: "$999",
  },
  {
    title: "Growth",
    scope: "Cross-functional, 3 workstreams",
    price: "$4,999",
  },
  {
    title: "Enterprise",
    scope: "Multi-BU, data readiness deep-dive",
    price: "Custom",
  },
];

const faqs = [
  {
    question: "What’s an AI readiness assessment?",
    answer:
      "A structured evaluation of your business, data, tools, and team — designed to identify which AI use cases are worth building, in what order, and with what investment.",
  },
  {
    question: "How much does an AI readiness audit cost?",
    answer:
      "Our ROI-First Audit starts at $999 for a single-function scope. Cross-functional audits are $4,999. Enterprise/multi-BU scope is custom. Compare: Deloitte, BCG, and McKinsey quote $75K–$250K for equivalent work.",
  },
  {
    question: "How long does an AI audit take?",
    answer: "3 weeks from kickoff to executive readout. Longer audits rarely produce better decisions.",
  },
  {
    question: "How is this different from a Deloitte or BCG audit?",
    answer:
      "Our audit is three weeks and a fraction of the cost. We’re engineers who ship. Their audits are 8–12 weeks of frameworks and slides. Both can have value — ours is built for companies that need to move.",
  },
  {
    question: "Do you understand our industry?",
    answer:
      "We’ve worked across BFSI, healthcare, D2C, B2B SaaS, manufacturing, real estate, and education. If we’re not the right fit for your vertical, we’ll say so upfront.",
  },
  {
    question: "What if we decide not to build anything after the audit?",
    answer:
      "That’s fine. You walk away with a roadmap, budget estimates, and clarity — whether you build with us or not.",
  },
  {
    question: "Does the audit cover data readiness, not just use cases?",
    answer:
      "Yes. Data quality, integration, permissions, and governance are core to the assessment. Most pilots fail on data, not models.",
  },
  {
    question: "What frameworks do you use?",
    answer:
      "Our ROI-First Audit framework — use-case scoring on business impact × technical feasibility × time-to-value × risk. Built from shipping 40+ AI projects. Frameworks are a starting point — your business context is the real input.",
  },
  {
    question: "How do you handle compliance (DPDP, GDPR, SOC 2, HIPAA)?",
    answer:
      "Flagged as part of the readiness assessment. We note compliance exposure per use case so your legal/InfoSec team can sign off before the build.",
  },
];

const howToSteps = [
  {
    name: "Kickoff call",
    text: "Confirm fit, scope, and stakeholders for the audit.",
  },
  {
    name: "Discovery",
    text: "Interview leadership and operating teams to map workflows and pain points.",
  },
  {
    name: "Analysis",
    text: "Review stack, data, and processes to score ROI-ready use cases.",
  },
  {
    name: "Roadmap + readout",
    text: "Deliver the 90-day roadmap and board-ready executive readout.",
  },
];

const AIStrategyAudit = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://theconverseai.com/services/ai-strategy-audit#service",
        name: "AI Strategy & Readiness Audit",
        description:
          "3-week fixed-fee AI readiness audit that identifies 5–10 high-ROI use cases and delivers a 90-day roadmap.",
        serviceType: "AI readiness audit",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://theconverseai.com",
        },
        areaServed: ["India", "United States"],
        offers: {
          "@type": "Offer",
          url: "https://theconverseai.com/services/ai-strategy-audit",
          availability: "https://schema.org/InStock",
          priceSpecification: [
            {
              "@type": "UnitPriceSpecification",
              priceCurrency: "USD",
              price: 999,
            },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://theconverseai.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://theconverseai.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "AI Strategy & Readiness Audit",
            item: "https://theconverseai.com/services/ai-strategy-audit",
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
        "@type": "HowTo",
        name: "3-week AI Readiness Audit process",
        description: "A three-week process to identify, score, and prioritize high-ROI AI use cases.",
        totalTime: "P3W",
        step: howToSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>AI Readiness Audit — 3-Week Strategy Roadmap | ConverseAI</title>
        <meta
          name="description"
          content="3-week fixed-fee AI readiness audit. Identify 5–10 high-ROI use cases and get a 90-day roadmap. From $999 — book a free fit call today."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="AI Readiness Audit — 3-Week Strategy Roadmap | ConverseAI" />
        <meta
          property="og:description"
          content="3-week fixed-fee AI readiness audit. Identify 5–10 high-ROI use cases and get a 90-day roadmap. From $999 — book a free fit call today."
        />
        <link rel="canonical" href="https://www.theconverseai.com/services/ai-strategy-audit" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="absolute top-16 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet/15 rounded-full blur-3xl" />
            <div className="container-tight relative z-10 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <AnimatedSection>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">AI Strategy & Readiness Audit</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Stop guessing where AI fits. Get a 3-week AI Readiness Audit.
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                      A fixed-fee AI readiness audit that surfaces your 5–10 highest-ROI AI use cases, scores them by feasibility,
                      and delivers a 90-day action plan.{" "}
                      <span className="font-semibold text-foreground">
                        The audit fee is credited toward your first build if we work together.
                      </span>
                    </p>
                    <div className="flex flex-col gap-4 sm:max-w-xs">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Start my audit — proposal in 48 hours">
                          Start my audit — proposal in 48 hours
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Link to="/contact-us">
                        <Button variant="hero-outline" size="xl" title="Book a free 20-min fit call">
                          Book a free 20-min fit call
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative mt-6 lg:mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-6 text-center">3-Week ROI-First Audit</p>
                      <div className="space-y-4">
                        {[
                          { icon: ClipboardList, week: "Week 1", label: "Discovery", detail: "Leadership interviews + workflow mapping", color: "bg-primary/10 border-primary/20 text-primary" },
                          { icon: BarChart3, week: "Week 2", label: "Analysis", detail: "Stack & data review · 5–10 use cases scored", color: "bg-violet/10 border-violet/20 text-violet" },
                          { icon: Map, week: "Week 3", label: "Roadmap", detail: "90-day action plan + executive readout", color: "bg-mint/10 border-mint/20 text-mint" },
                        ].map((step, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${step.color}`}>
                            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <step.icon className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">{step.week}</p>
                              <p className="font-semibold text-sm">{step.label}</p>
                              <p className="text-xs text-muted-foreground">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-5 border-t border-border/50 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Audit fee credited toward build</p>
                        <p className="text-2xl font-bold text-primary">From $999</p>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-3 shadow-lg animate-float">
                      <p className="text-xs text-muted-foreground">Avg. opportunities surfaced</p>
                      <p className="text-lg font-bold text-primary">$1.2M+/yr</p>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The problem</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      You bought the Copilot licenses. You’ve read every “AI for business” article. Your team keeps asking
                      what to do next. And your board keeps asking why you haven’t done more.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">70% of GenAI pilots never reach production</span>{" "}
                      (Gartner, 2024 CIO Survey). The problem isn’t the tech. It’s that no one decided what to build, or why.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      You need a prioritized, feasibility-scored list of 5–10 AI use cases with real ROI — and the answer to
                      “which one do we build first.”
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">The ROI-First AI Audit delivers</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        5–10 high-ROI AI use cases scored by feasibility
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        A 90-day action plan with budgets, milestones, and owners
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        A board-ready readout your CFO will sign off on
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        A clear recommendation for the first build
                      </li>
                    </ul>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">The ROI-First AI Audit — what’s inside</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A structured 3-week process focused on ROI, feasibility, and time-to-value.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {auditSteps.map((step) => (
                  <AnimatedSection key={step.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.1}>
                <div className="mt-10 rounded-2xl border border-primary/10 bg-white/90 p-6">
                  <h3 className="text-lg font-semibold mb-3">ROI-First scoring framework</h3>
                  <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
                    {scoringCriteria.map((criteria) => (
                      <li key={criteria} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-1" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-br from-background via-secondary/20 to-background">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Who it’s for</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Designed for leaders who need ROI clarity before committing real AI budget.
                  </p>
                </div>
              </AnimatedSection>
              <ul className="max-w-3xl mx-auto space-y-3 text-muted-foreground text-lg">
                {audiences.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">How it works</h2>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {howItWorks.map((step) => (
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

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Wondering if your business is AI-ready?</p>
                <p className="text-muted-foreground mt-1">Get a free 20-min fit call to find out before committing to anything.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Book a free call">
                  Book a free call <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Most pilots fail on the wrong question, not the wrong model. That’s what this audit is for.
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

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    ROI-first delivery without the 12-week strategy theater.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI ROI-First Audit</TableHead>
                      <TableHead>Big-4 / MBB (Deloitte, Accenture, BCG, McKinsey)</TableHead>
                      <TableHead>Generalist boutique</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.big4}</TableCell>
                        <TableCell>{row.boutique}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Outcomes you can expect</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Clarity, prioritization, and a path to production within 60–90 days.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {outcomes.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-1" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    All tiers include the full deliverable set. Pricing differs by scope and interview count. Audit fee is
                    credited toward the first build if we work together.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map((tier) => (
                  <AnimatedSection key={tier.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <p className="text-sm uppercase tracking-wide text-primary mb-2">{tier.title}</p>
                      <h3 className="text-xl font-semibold mb-2">{tier.price}</h3>
                      <p className="text-muted-foreground">{tier.scope}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to stop guessing?</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Book a free 20-min fit call. If we’re a fit, we’ll send a proposal in 48 hours and start your audit within
                  2 weeks. If we’re not, we’ll say so.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Book my fit call">
                    Book my fit call
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

export default AIStrategyAudit;
