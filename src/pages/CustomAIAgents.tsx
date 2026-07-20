import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Bot, Brain, Database, Wrench } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fitCriteria = [
  "Unique to your business, domain, or data model",
  "Deeper than a template (custom logic, proprietary reasoning, internal jargon)",
  "Business-critical enough that you want your own IP, not a vendor's black box",
];

const manualWorkflows = [
  "SDRs researching accounts and drafting outreach",
  "AP clerks matching invoices across systems",
  "Support engineers triaging and diagnosing Tier-2 tickets",
  "Analysts pulling data across 6 tools to answer one question",
  "Recruiters screening and scheduling 50 candidates a week",
];

const comparisonRows = [
  {
    label: "What it does",
    chatbot: "Converses",
    agent: "Acts — calls tools, reads/writes systems, completes work",
  },
  {
    label: "Decision-making",
    chatbot: "Scripted / retrieval",
    agent: "LLM reasoning with guardrails",
  },
  {
    label: "Tool use",
    chatbot: "Rare",
    agent: "Core — CRM, calendar, database, email, API",
  },
  {
    label: "Output quality gate",
    chatbot: "Sounds right?",
    agent: "Evaluated against success criteria + eval harness",
  },
  {
    label: "Example",
    chatbot: "“Where’s my order?” → shows link",
    agent: "“Where’s my order?” → checks order system, triggers refund if appropriate, writes back to CRM",
  },
  {
    label: "Best for",
    chatbot: "FAQ, routing, light support",
    agent: "Work completion, decision-support, process automation",
  },
  {
    label: "Deployment complexity",
    chatbot: "Low",
    agent: "Medium–High (worth it for high-value workflows)",
  },
];

const buildAreas = [
  {
    title: "Sales & revenue agents",
    items: [
      "SDR research agent: account intel, firmographic data, personalized outreach drafts",
      "Lead qualification and routing agent",
      "Quote and proposal generation agent",
      "CRM hygiene agent (dedup, enrichment, activity logging)",
    ],
  },
  {
    title: "Support & CX agents",
    items: [
      "L2 support agent with tool access (order lookup, refund initiation, account updates)",
      "Ticket triage + resolution suggestions beyond Tier-1 templates",
      "Customer health monitoring with proactive alerts",
      "Survey and feedback analysis agent",
    ],
  },
  {
    title: "Finance & operations agents",
    items: [
      "Specialized AR/AP agents with domain-specific logic",
      "Contract negotiation assistants",
      "Treasury and cash-flow agents",
      "Audit-ready reconciliation for niche ledgers",
    ],
  },
  {
    title: "Research & analyst agents",
    items: [
      "RFP response drafting agent",
      "Competitive intel monitoring with summarization",
      "Market research synthesis",
      "Investment memo drafting",
    ],
  },
  {
    title: "People / recruiting agents",
    items: [
      "Candidate screening with structured scoring",
      "Interview scheduling across time zones",
      "Onboarding task orchestration",
    ],
  },
  {
    title: "Internal-tool & analyst agents",
    items: [
      "“Ask your data” analyst agent over your warehouse",
      <>
        Internal Q&A assistant over SOPs and policies (for cross-document, see{" "}
        <Link to="/services/knowledge-intelligence" className="text-primary hover:underline">
          Knowledge Intelligence
        </Link>
        )
      </>,
      "Meeting summarizer + action-item tracker",
    ],
  },
];

const stackSelections = [
  {
    title: "Frameworks",
    description: "LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK",
  },
  {
    title: "Model providers",
    description: "Anthropic, OpenAI, Google, Mistral, open models (Llama, Qwen)",
  },
  {
    title: "Vector",
    description: "Pinecone, Weaviate, pgvector, Turbopuffer",
  },
  {
    title: "Observability",
    description: "LangSmith, Langfuse, Arize, Helicone",
  },
  {
    title: "Deploy",
    description: "AWS, Azure, GCP, on-prem — your cloud, your control",
  },
];

const shipItems = [
  {
    title: "Eval harness",
    description: "Test suite covering success cases, edge cases, adversarial inputs. We don’t deploy what we can’t measure.",
  },
  {
    title: "Observability dashboard",
    description: "What the agent did, why, token spend, error rates.",
  },
  {
    title: "Guardrails",
    description: "Deterministic tool calls for irreversible actions. HITL on high-risk steps.",
  },
  {
    title: "Runbook",
    description: "What to do when things go wrong. Who to call. How to intervene.",
  },
  {
    title: "Handoff docs",
    description: "Architecture, prompt library, config, deployment — everything your team needs to own it.",
  },
];

const processSteps = [
  {
    title: "Week 0 — Scoping call (free).",
    description: "Workflow, success metrics, constraints, stack.",
  },
  {
    title: "Week 1 — Agent Feasibility Review.",
    description: "Architecture, cost/timeline estimate, go/no-go.",
  },
  {
    title: "Weeks 2–7 — Build.",
    description: "Working agent by week 4. Weekly demos. Iterate.",
  },
  {
    title: "Week 8 — Deploy.",
    description: "Shadow → HITL → autonomous. Monitored go-live.",
  },
  {
    title: "Ongoing (optional).",
    description: "Retainer for tuning, coverage expansion, model updates.",
  },
];

const differentiators = [
  "Own your agent, own your data. No per-conversation metering, no lock-in, and you can move to open models the day provider pricing shifts.",
  "Product-tested team. We run agents at scale in our own SaaS — not a pure services shop learning on client bills.",
  "Full-stack in one team. Prompt engineering, backend, integration, eval — no handoffs.",
  "No framework lock-in. Claude, GPT, Gemini, Llama. LangGraph, CrewAI, OpenAI Agents SDK. We pick per project.",
  "India delivery economics. 50–60% the cost of US-only firms, same engineering stack.",
];

const outcomes = [
  "Production agent live in 4–8 weeks",
  "60–80% of the target workflow automated end-to-end",
  "40–70% reduction in cost-per-ticket / case / lead",
  "One agent equivalent to 3–8 FTEs on repetitive work",
  "Move models without a rebuild as provider pricing shifts",
];


const faqs = [
  {
    question: "How much does it cost to build a custom AI agent?",
    answer:
      "We start with a 1-week Agent Feasibility Review that scopes your workflow, prototypes the core logic, and delivers a go/no-go recommendation. All builds are fixed-fee and fixed-timeline — no T&M.",
  },
  {
    question: "How long does AI agent development take?",
    answer:
      "4 weeks for the productized Agent Sprint. 6–10 weeks for complex bespoke builds with deep integrations and high reliability requirements.",
  },
  {
    question: "What's the difference between a chatbot and an AI agent?",
    answer:
      "Chatbots converse. Agents act — they call tools, read/write to systems, make decisions, complete work. See the comparison table above.",
  },
  {
    question: "Can AI agents integrate with our existing tools?",
    answer:
      "Yes — CRMs, ERPs, helpdesks, databases, internal APIs, SaaS tools with webhooks or APIs. If it has an interface, we can connect. See AI Integration Services for integration-only engagements.",
  },
  {
    question: "Which model / framework do you use — are we locked in?",
    answer:
      "No lock-in. We pick the best fit for your use case. Your agent is portable across providers; we document the swap path.",
  },
  {
    question: "Who owns the code and the IP?",
    answer: "You. Full source, prompts, configs, and docs are yours on delivery. We keep nothing proprietary to us.",
  },
  {
    question: "How do you handle hallucinations and guardrails?",
    answer:
      "Deterministic tool calls for irreversible actions, HITL approval gates, strict output schemas, retry logic, eval harnesses. Hallucination is a design problem, not an LLM problem.",
  },
  {
    question: "Can it work with our on-prem / VPC / private LLM?",
    answer:
      "Yes. AWS Bedrock, Azure OpenAI, GCP Vertex, VPC deployments, and open-source models (Llama, Qwen, Mistral) on your infrastructure.",
  },
  {
    question: "What happens when the underlying model changes or deprecates?",
    answer:
      "We build with abstraction layers so you can swap models. Our retainer clients get model-migration support included.",
  },
  {
    question: "Custom AI Agent Development vs Agentic Process Automation — which do I need?",
    answer:
      "Use Agentic Process Automation for productized back-office workflows (invoice-to-pay, ticket triage, reconciliation). Use Custom AI Agent Development for unique workflows not on our productized list — bespoke logic, proprietary data, domain-specific reasoning. Not sure? Start with a Feasibility Review.",
  },
];

const agentComparisonRows = [
  { label: "Timeline", converse: "4–8 weeks to first production agent", enterprise: "12–24 weeks", freelance: "Unpredictable" },
  { label: "Team", converse: "Engineers who ship AI in production", enterprise: "Partners + junior MBAs", freelance: "Single dev, no AI ops experience" },
  { label: "Deliverable", converse: "Working agent + eval harness + runbook", enterprise: "Architecture doc + recommendations", freelance: "Code only" },
  { label: "Eval & testing", converse: "Full test suite, every agent", enterprise: "Varies", freelance: "Manual only" },
  { label: "Production support", converse: "Observability dashboard + retainer available", enterprise: "Separate support contract", freelance: "Best effort" },
  { label: "Best for", converse: "Mid-market with unique workflows needing production-grade agents", enterprise: "Fortune 500 transformation programs", freelance: "Proof-of-concept only" },
];

const CustomAIAgents = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://theconverseai.com/services/custom-ai-agents#service",
        name: "Custom AI Agent Development",
        description:
          "Bespoke AI agents for SDR, support, finance, and research workflows. Production in 4–8 weeks. You own the IP.",
        serviceType: "Custom AI agent development",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://theconverseai.com",
        },
        areaServed: ["India", "United States"],
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
            name: "Custom AI Agent Development",
            item: "https://theconverseai.com/services/custom-ai-agents",
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
        <title>Custom AI Agent Development Services | ConverseAI</title>
        <meta
          name="description"
          content="Bespoke AI agents for SDR, support, finance, and research workflows. Production in 4–8 weeks, you own the IP. Book a free scoping call."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Custom AI Agent Development Services | ConverseAI" />
        <meta
          property="og:description"
          content="Bespoke AI agents for SDR, support, finance, and research workflows. Production in 4–8 weeks, you own the IP. Book a free scoping call."
        />
        <link rel="canonical" href="https://theconverseai.com/services/custom-ai-agents" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="absolute top-16 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet/15 rounded-full blur-3xl" />
            <div className="container-tight relative z-10 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimatedSection>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Custom AI Agent Development</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Off-the-shelf copilots don&apos;t know your business. We build the one that does.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      Custom AI agent development services for unique, high-value workflows.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      Production-ready bespoke AI agents for your specific workflow — not generic copilots, not templated
                      chatbots, not productized back-office bots.{" "}
                      <span className="font-semibold text-foreground">You own the code, the prompts, the data, the IP.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Scope my custom agent">
                          Scope my custom agent
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Link to="/contact-us">
                        <Button variant="hero-outline" size="xl" title="Start with an Agent Feasibility Review">
                          Start with an Agent Feasibility Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-5 text-center">How a custom agent is built</p>
                      <div className="flex flex-col gap-3">
                        {[
                          { icon: Brain, label: "Reasoning layer", detail: "LLM (Claude, GPT, Gemini, open model)", color: "bg-primary/10 text-primary" },
                          { icon: Wrench, label: "Tools & integrations", detail: "APIs, CRM, ERP, databases, your systems", color: "bg-violet/10 text-violet" },
                          { icon: Database, label: "Memory & context", detail: "Short-term + long-term · Permission-aware", color: "bg-mint/10 text-mint" },
                          { icon: Bot, label: "Agent orchestration", detail: "LangGraph · CrewAI · OpenAI Agents SDK · MCP", color: "bg-primary/10 text-primary" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-border/40">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                              <item.icon className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-xs text-muted-foreground">You own all code, prompts, and IP</p>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-3 shadow-lg animate-float">
                      <p className="text-xs text-muted-foreground">Feasibility Review</p>
                      <p className="text-lg font-bold text-primary">1-week scope</p>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">This page vs Agentic Process Automation</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      This page is for bespoke, unique-workflow AI agents — the ones you can&apos;t buy off the shelf. For
                      productized back-office automation (invoice-to-pay, ticket triage, reconciliation), see{" "}
                      <Link to="/services/agentic-automation" className="text-primary font-semibold hover:underline">
                        Agentic Process Automation
                      </Link>
                      — that&apos;s where our 4-week Agent Sprint lives.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Use this page when your workflow is deeper than a template and business-critical enough that you
                      want your own IP, not a vendor&apos;s black box.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">This page is for you if the workflow is:</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {fitCriteria.map((item) => (
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

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Agent Feasibility Review — 1 week</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Not ready to commit to a custom build? Start here. One week. We scope your
                      workflow, interview your team, prototype the core agent logic, and deliver a feasibility report —
                      technical architecture, cost/timeline estimate, risk flags, and a go/no-go recommendation. If we
                      build together, the fee is credited toward the build.
                    </p>
                    <Link to="/contact-us">
                      <Button variant="hero" size="lg" title="Start an Agent Feasibility Review">
                        Start an Agent Feasibility Review
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-xl font-semibold mb-3">What you get in 1 week</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Workflow deep-dive + team interviews
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Prototype of the core agent loop
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Architecture, cost, and timeline estimate
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Risk flags + go/no-go recommendation
                      </li>
                    </ul>
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
                      Off-the-shelf copilots are too generic for your workflow. Zapier and Make hit ceilings at real
                      complexity. Your internal team can prototype — but productionizing is another story: auth,
                      observability, evals, guardrails, error handling, model deprecation, scaling.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">Meanwhile, your highest-value workflows are still manual:</p>
                    <ul className="space-y-3 text-muted-foreground">
                      {manualWorkflows.map((workflow) => (
                        <li key={workflow} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {workflow}
                        </li>
                      ))}
                    </ul>
                    <p className="text-lg text-muted-foreground mt-6">These are agent-shaped problems. You just need someone to build them right.</p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">Design beats guesswork</h3>
                    <p className="text-lg text-muted-foreground">
                      <span className="font-semibold text-foreground">Hallucination is a design problem, not an LLM problem.</span>
                    </p>
                    <p className="text-muted-foreground mt-4">
                      We use evals, deterministic tool calls, and guardrails so the agent knows when to act, when to ask
                      for approval, and when to escalate.
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">AI agent vs chatbot — what&apos;s actually different</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">The short version: chatbots converse. Agents act.</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>Chatbot</TableHead>
                      <TableHead>Custom AI agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.chatbot}</TableCell>
                        <TableCell>{row.agent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Have an agent idea? Let's scope it in 30 minutes.</p>
                <p className="text-muted-foreground mt-1">We'll tell you honestly if it's buildable, what it'll cost, and when it can be live.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Book a scoping call">
                  Book a scoping call <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What we build</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Bespoke agents for sales, support, finance, research, and internal teams — tuned to your data and
                    systems.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildAreas.map((area) => (
                  <AnimatedSection key={area.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-3">{area.title}</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {area.items.map((item, index) => (
                          <li key={`${area.title}-${index}`} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.1}>
                <div className="mt-10 rounded-2xl border border-primary/10 bg-white/90 p-6">
                  <p className="text-lg text-muted-foreground">
                    For productized back-office automation (invoice-to-pay, IT ticket triage, vendor onboarding) — see{" "}
                    <Link to="/services/agentic-automation" className="text-primary font-semibold hover:underline">
                      Agentic Process Automation
                    </Link>
                    .
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Our engineering approach — the ConverseAI Agent Reliability Stack
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">Stack picked per project:</p>
                    <div className="space-y-4">
                      {stackSelections.map((stack) => (
                        <div key={stack.title} className="rounded-2xl border border-border/60 bg-white/90 p-5">
                          <p className="text-sm uppercase tracking-wide text-primary mb-2">{stack.title}</p>
                          <p className="text-muted-foreground">{stack.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">What every agent ships with</h3>
                    <div className="space-y-4">
                      {shipItems.map((item, index) => (
                        <div key={item.title} className="rounded-2xl border border-border/60 bg-white/90 p-5">
                          <p className="text-sm uppercase tracking-wide text-primary mb-1">{`0${index + 1}`}</p>
                          <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">How it works</h2>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {processSteps.map((step) => (
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

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {differentiators.map((item) => (
                  <AnimatedSection key={item}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        <p className="text-muted-foreground">{item}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <div>
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Outcomes you can expect</h2>
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

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <p className="text-muted-foreground">
                  Prefer productized back-office automation? See{" "}
                  <Link to="/services/agentic-automation" className="text-primary font-semibold hover:underline">
                    Agentic Process Automation
                  </Link>
                  .
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Production-grade AI agents without the enterprise price tag or freelance risk.</p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI</TableHead>
                      <TableHead>Enterprise AI vendor (Accenture, Deloitte)</TableHead>
                      <TableHead>Freelance / offshore dev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentComparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.enterprise}</TableCell>
                        <TableCell>{row.freelance}</TableCell>
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
              <AnimatedSection delay={0.1}>
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground">
                    Need integration-only help? See{" "}
                    <Link to="/services/ai-integration" className="text-primary font-semibold hover:underline">
                      AI Integration Services
                    </Link>
                    .
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-violet/10 to-background">
            <div className="container-tight text-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pick the workflow. We&apos;ll build the agent.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Book a free scoping call, or start with a 1-week Feasibility Review. We&apos;ll tell you honestly whether
                  it&apos;s agent-shaped, what it&apos;ll cost, and when it&apos;ll be live.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Scope my custom agent">
                    Scope my custom agent
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

export default CustomAIAgents;
