import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, Bot, Settings, Layers } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const useCases = [
  "Invoice-to-pay automation",
  "Ticket triage and routing",
  "Payments reconciliation across systems",
  "Vendor onboarding with document verification",
  "Expense classification + policy checks",
  "Tier-1 IT/HR ticket resolution",
  "Employee onboarding/offboarding across SaaS tools",
  "Policy Q&A with citations",
  "Procurement requisition handling",
  "Purchase-order matching + flagging",
  "Returns + refund processing",
  "Escalation routing with full context handoff",
];

const agentSprintDetails = [
  { label: "Timeline", value: "4 weeks, fixed" },
  { label: "Price", value: "flat fee" },
  { label: "Deliverable", value: "One production agent, eval harness, observability dashboard, runbook" },
  { label: "Best for", value: "Testing the waters — or shipping one workflow fast" },
  { label: "What comes next", value: "Optional retained engagement for additional agents" },
];

const problemWorkflows = [
  "Copies invoice data between SAP, your bank, and Excel",
  "Reads support tickets to figure out where to route them",
  "Reconciles payments across 5 systems",
  "Chases approvals across email, Slack, and SharePoint",
  "Onboards vendors with 40-step checklists",
];

const comparisonRows = [
  {
    label: "Core mechanism",
    rpa: "Rule-based scripts",
    apa: "LLM reasoning + deterministic tool calls",
  },
  {
    label: "Handles unstructured data",
    rpa: "No (brittle on OCR, free-text fields)",
    apa: "Yes (PDFs, emails, handwriting, varied formats)",
  },
  {
    label: "Exception handling",
    rpa: "Escalate to human",
    apa: "Reason, act, or escalate with full context",
  },
  {
    label: "Maintenance overhead",
    rpa: "40–60% of TCO is fixing broken bots",
    apa: "Lower — agents adapt to variations",
  },
  {
    label: "UI change resilience",
    rpa: "Breaks",
    apa: "Typically tolerates",
  },
  {
    label: "Best for",
    rpa: "High-volume, fully deterministic steps",
    apa: "Messy middle — invoices, tickets, approvals, onboarding",
  },
];

const buildAreas = [
  {
    title: "Finance & accounting agents",
    items: [
      "Invoice-to-pay: capture → match → code → route for approval → post to ledger",
      "AR reconciliation across bank feeds, payment gateways, CRM",
      "Expense classification + policy checking",
      "Month-end close accelerators",
    ],
  },
  {
    title: "IT & HR ops agents",
    items: [
      "Tier-1 IT ticket triage, diagnosis, and resolution (password resets, access, provisioning)",
      "Employee onboarding / offboarding across 10+ SaaS tools",
      "Leave and attendance queries with HRMS write-back",
      "Policy Q&A with citations",
    ],
  },
  {
    title: "Procurement & vendor agents",
    items: [
      "KYC + vendor onboarding with document verification",
      "Procurement requisition handling",
      "Purchase-order matching + flagging",
    ],
  },
  {
    title: "Support ops agents (shared with the Conversational AI product)",
    items: [
      "Multi-step customer inquiries across order/billing/product systems",
      "Returns + refund processing",
      "Escalation routing with full context handoff",
    ],
  },
];

const methodSteps = [
  {
    title: "Scope the workflow.",
    description: "Map current process, exceptions, success metrics.",
  },
  {
    title: "Design the agent.",
    description: "Roles, tools, guardrails, handoff points, eval criteria.",
  },
  {
    title: "Build and test.",
    description: "Working agent in 2–3 weeks with a full eval harness.",
  },
  {
    title: "Deploy with HITL.",
    description: "Humans-in-the-loop for high-risk actions until confidence is proven.",
  },
  {
    title: "Observe and tune.",
    description: "Weekly eval reviews, guardrail updates, coverage expansion.",
  },
];

const shipItems = [
  "Test suite + eval harness (not demo-ware)",
  "Observability dashboard (what it did, why, token spend)",
  "Guardrails (deterministic tool calls for irreversible actions)",
  "Clean handoff docs and runbooks",
];

const howItWorks = [
  {
    title: "Week 0 — Scoping call (free).",
    description: "Pick a workflow, confirm scope, align on success metrics.",
  },
  {
    title: "Weeks 1–4 — Agent Sprint.",
    description: "Working agent with full test coverage. Demo weekly.",
  },
  {
    title: "Weeks 5–6 — Deploy.",
    description: "Shadow mode → HITL → autonomous. Monitored go-live.",
  },
  {
    title: "Month 2+ — Scale.",
    description: "Expand coverage, add workflows, retainer-based ops support.",
  },
];

const whyConverse = [
  "Eval-first delivery. Every agent ships with a test suite. We don’t deploy what we can’t measure.",
  "Depth over breadth. We pick the right stack per use case (LangGraph, CrewAI, n8n, native APIs) — no lock-in.",
  "Integration native. Our Conversational AI product already integrates with 50+ tools. Those connectors carry over.",
  "India + US delivery. 30–50% below US boutiques, same engineering quality.",
  "Product discipline. We run agents at scale in our own SaaS — not a services shop learning on client bills.",
];

const outcomes = [
  "Cut invoice-to-pay cycle from 9 days to 18 hours",
  "Automate 70–80% of Tier-1 IT/HR tickets end-to-end",
  "1 agent replaces 3–5 FTE-hours per day on reconciliation",
  "First production agent live in 30 days via Agent Sprint",
  "24/7 autonomous ops across 20+ SaaS tools with one orchestrator",
];

const faqs = [
  {
    question: "What is agentic process automation?",
    answer:
      "APA uses LLM-powered agents that reason, read unstructured inputs, and make decisions — going beyond rule-based RPA. Agents handle the exceptions RPA used to escalate.",
  },
  {
    question: "How is APA different from RPA?",
    answer:
      "RPA automates the happy path with deterministic rules. APA adds reasoning — so agents handle variations, unstructured data, and exceptions. Most companies run both: RPA for high-volume deterministic steps, APA for the messy middle.",
  },
  {
    question: "Will agents hallucinate on financial data?",
    answer:
      "Not when designed correctly. Deterministic tool calls for irreversible actions, HITL approvals on high-risk steps, strict guardrails. Agents reason about the decision; the action is code.",
  },
  {
    question: "How do we measure ROI?",
    answer:
      "Cycle time, cost-per-transaction, FTE hours reclaimed, exception rate, error rate. Metrics defined with you in week 1 and tracked weekly post-launch.",
  },
  {
    question: "Does our data train your models?",
    answer:
      "No. We deploy in your cloud (AWS/Azure/GCP) or via API providers with zero-retention settings. Your data stays yours.",
  },
  {
    question: "What if the agent breaks?",
    answer:
      "Observability, eval harnesses, fallback workflows, and a monitored alerting channel. Breaks are visible in minutes, not discovered by customers.",
  },
  {
    question: "Which processes can AI agents automate?",
    answer:
      "Back-office processes with structured or semi-structured inputs: invoices, tickets, reconciliation, onboarding, policy Q&A, ticket triage, approvals. If it involves reading unstructured data, making a decision, and updating systems, it’s agent-shaped.",
  },
  {
    question: "Build vs buy — why not just use UiPath Agents or Automation Anywhere?",
    answer:
      "Platform agents work for standard patterns. For deep custom logic, integration depth, or cost-sensitive mid-market, custom builds are 30–60% cheaper long-term and more flexible. We help you pick honestly.",
  },
  {
    question: "Timeline to first production agent?",
    answer: "4 weeks via Agent Sprint. Larger programs run 8–12 weeks for the first production cohort.",
  },
];

const providerComparisonRows = [
  { label: "Timeline to first agent", converse: "4 weeks fixed (Agent Sprint)", platform: "8–16 weeks", custom: "Unpredictable" },
  { label: "Core mechanism", converse: "LLM reasoning + deterministic tool calls", platform: "Rule-based + limited AI layer", custom: "Custom code, no standard pattern" },
  { label: "Exception handling", converse: "Agent reasons, acts, or escalates with context", platform: "Escalate to human", custom: "Manual scripting" },
  { label: "Maintenance overhead", converse: "Low — agents adapt to variations", platform: "40–60% of TCO fixing broken bots", custom: "High — no eval harness" },
  { label: "Deliverable", converse: "Agent + eval harness + observability + runbook", platform: "Configured flows + support contract", custom: "Code only" },
  { label: "Best for", converse: "Messy middle — invoices, tickets, approvals, onboarding", platform: "High-volume, fully deterministic steps", custom: "One-off prototypes" },
];

const AgenticAutomation = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://www.theconverseai.com/services/agentic-automation#service",
        name: "Agentic Process Automation",
        description:
          "Agentic Process Automation services that replace brittle RPA with AI agents that reason across your SaaS stack.",
        serviceType: "Agentic process automation",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://www.theconverseai.com",
        },
        areaServed: ["India", "United States"],
        offers: {
          "@id": "https://www.theconverseai.com/services/agentic-automation#agent-sprint",
        },
      },
      {
        "@type": "Offer",
        "@id": "https://www.theconverseai.com/services/agentic-automation#agent-sprint",
        name: "Agent Sprint",
        url: "https://www.theconverseai.com/services/agentic-automation#agent-sprint",
        availability: "https://schema.org/InStock",
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            priceCurrency: "USD",
            price: 999,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Agentic Process Automation use cases",
        itemListElement: useCases.map((useCase, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: useCase,
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
          {
            "@type": "ListItem",
            position: 3,
            name: "Agentic Process Automation",
            item: "https://www.theconverseai.com/services/agentic-automation",
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
    ],
  };

  return (
    <>
      <Helmet>
        <title>Agentic Process Automation & AI Agents | ConverseAI</title>
        <meta
          name="description"
          content="Replace brittle RPA with AI agents that reason across your SaaS stack. First production agent live in 30 days — book a free scoping call."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Agentic Process Automation & AI Agents | ConverseAI" />
        <meta
          property="og:description"
          content="Replace brittle RPA with AI agents that reason across your SaaS stack. First production agent live in 30 days — book a free scoping call."
        />
        <link rel="canonical" href="https://www.theconverseai.com/services/agentic-automation" />
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Agentic Process Automation</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      RPA couldn&apos;t think. Your AI agents can.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      Agentic Process Automation services for back-office operations.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      AI agents that handle exceptions, reason across systems, and run end-to-end back-office processes —
                      invoice-to-pay, ticket triage, reconciliation, vendor onboarding. First production agent live in 30 days.
                    </p>
                    <div className="flex flex-col gap-4 sm:max-w-xs">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Start a 4-week Agent Sprint">
                          Start a 4-week Agent Sprint
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button asChild variant="hero-outline" size="xl">
                        <a href="#use-cases" title="See APA use cases">
                          See APA use cases
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative mt-6 lg:mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-5 text-center">Workflow before → after</p>
                      <div className="space-y-3">
                        {[
                          { icon: FileText, before: "Invoice arrives (PDF, email)", after: "Agent reads, codes, routes for approval", color: "text-primary bg-primary/10" },
                          { icon: Layers, before: "Support ticket lands in queue", after: "Agent triages, resolves or escalates", color: "text-violet bg-violet/10" },
                          { icon: Settings, before: "Vendor onboarding (40-step checklist)", after: "Agent runs KYC + document verification", color: "text-mint bg-mint/10" },
                        ].map((item, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/70 border border-border/40">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                <item.icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-xs text-muted-foreground line-through">{item.before}</p>
                            </div>
                            <div className="flex items-center gap-2 pl-8">
                              <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <p className="text-xs font-medium text-foreground">{item.after}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between text-center">
                        <div>
                          <p className="text-xl font-bold text-primary">30 days</p>
                          <p className="text-xs text-muted-foreground">First agent live</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-violet">$999</p>
                          <p className="text-xs text-muted-foreground">Agent Sprint fixed fee</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-mint">24/7</p>
                          <p className="text-xs text-muted-foreground">Autonomous ops</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="agent-sprint" className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                      Agent Sprint — productized engagement
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      4 weeks. One production-ready agent.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      The Agent Sprint is our productized entry engagement. We pick one back-office workflow with you,
                      build and test the agent, deploy it with HITL guardrails, and hand over with eval harness +
                      observability. No scope creep, no T&amp;M.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      Larger multi-agent programs run 8–12 weeks and are quoted per scope.
                    </p>
                    <Link to="/contact-us">
                      <Button variant="hero" size="lg" title="Start an Agent Sprint">
                        Start an Agent Sprint
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-xl font-semibold mb-4">Agent Sprint</h3>
                    <div className="space-y-4">
                      {agentSprintDetails.map((detail) => (
                        <div key={detail.label} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <p className="text-sm uppercase tracking-wide text-primary">{detail.label}</p>
                          <p className="text-muted-foreground sm:text-right">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link to="/contact-us" className="text-primary font-semibold hover:underline">
                        → Start an Agent Sprint
                      </Link>
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
                      You automated the happy path with RPA. Then every UI change broke your bots. Every exception got
                      escalated to humans. Every new process required a full rebuild.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      Meanwhile, your operations team still does this:
                    </p>
                    <ul className="space-y-3 text-muted-foreground mb-6">
                      {problemWorkflows.map((workflow) => (
                        <li key={workflow} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {workflow}
                        </li>
                      ))}
                    </ul>
                    <p className="text-lg text-muted-foreground">
                      Agentic Process Automation (APA) replaces this work with AI agents that reason through exceptions —
                      not just follow rules. They read unstructured data, call tools, handle edge cases, and escalate only
                      when they should. Agents reason about the decision. The action is code.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">Replace RPA with AI agents for business</h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      APA implementation services bring intelligent process automation to the messy middle — invoices,
                      tickets, approvals, onboarding — where hyperautomation services typically stall.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      We help you keep RPA for deterministic steps and layer AI agents for back office decisions on top.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">APA vs RPA — what&apos;s different</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Most teams keep both: RPA for deterministic steps, APA for the judgment-heavy layer. We help you split
                    the work correctly.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Traditional RPA</TableHead>
                      <TableHead>Agentic Process Automation (APA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{row.label}</div>
                          {row.rpa}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{row.label}</div>
                          {row.apa}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section id="use-cases" className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What we build (productized back-office automation)</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    This page focuses on productized, back-office process automation. For bespoke, unique-workflow agents
                    (SDR research, custom analyst, domain-specific bots), see{" "}
                    <Link to="/services/custom-ai-agents" className="text-primary font-semibold hover:underline">
                      Custom AI Agent Development
                    </Link>
                    .
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-8">
                {buildAreas.map((area, index) => (
                  <AnimatedSection key={area.title} delay={index * 0.1}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
                      <ul className="space-y-3 text-muted-foreground">
                        {area.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.2}>
                <p className="text-muted-foreground mt-8 text-center">
                  For bespoke builds outside these productized templates — new workflow, unique data model, proprietary
                  logic — use{" "}
                  <Link to="/services/custom-ai-agents" className="text-primary font-semibold hover:underline">
                    Custom AI Agent Development
                  </Link>
                  .
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Have a workflow you want to automate?</p>
                <p className="text-muted-foreground mt-1">Tell us the process — we'll tell you if it's agent-shaped and what it'll cost.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Discuss my workflow">
                  Discuss my workflow <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How we build</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Our stack (picked per use case): LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, custom MCP
                      servers. Telephony and messaging rails come from our own ConverseAI product — your LangGraph
                      implementation partner when the workflow demands it.
                    </p>
                    <div className="space-y-4">
                      {methodSteps.map((step) => (
                        <div key={step.title} className="rounded-xl border border-border/60 bg-white/90 p-4">
                          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-xl font-semibold mb-4">Every agent ships with</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {shipItems.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted-foreground mt-6 font-semibold">We don’t deploy what we can’t measure.</p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Week-by-week delivery for multi-agent workflow automation and intelligent process automation at scale.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {howItWorks.map((step, index) => (
                  <AnimatedSection key={step.title} delay={index * 0.1}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div>
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                    <ul className="space-y-3 text-muted-foreground mb-8">
                      {whyConverse.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <h3 className="text-2xl font-semibold mb-4">Outcomes you can expect</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {outcomes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Agent Sprint vs RPA platforms vs custom dev shops.</p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI Agent Sprint</TableHead>
                      <TableHead>UiPath / Automation Anywhere</TableHead>
                      <TableHead>Custom dev shop</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providerComparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.platform}</TableCell>
                        <TableCell>{row.custom}</TableCell>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pick one workflow. See it run in 30 days.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start with a 4-week Agent Sprint — one production agent live. No T&amp;M. No scope creep. If
                  it works, we talk about retained.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Start my Agent Sprint">
                    Start my Agent Sprint
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

export default AgenticAutomation;
