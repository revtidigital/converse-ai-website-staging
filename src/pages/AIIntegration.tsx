import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Plug, Globe, Zap, RefreshCw } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const buildAreas = [
  {
    title: "AI-in-your-CRM",
    description: "Inbox copilot, deal insights, auto-enrichment, next-best-action, meeting summaries with CRM write-back.",
  },
  {
    title: "AI-in-your-helpdesk",
    description: "Ticket auto-triage, resolution suggestions, draft reply generation, sentiment alerts, macro selection.",
  },
  {
    title: "AI-in-your-ERP",
    description: "Invoice capture and coding, vendor matching, reconciliation, anomaly flagging.",
  },
  {
    title: "MCP-powered agent access",
    description: "MCP servers so AI agents can safely read and write to your tools — with permissions, auth, and audit.",
  },
  {
    title: "Context layer (cross-tool AI memory)",
    description: "A unified data layer that lets AI see context across all your systems, not just the one it lives in.",
  },
  {
    title: "Custom copilots",
    description: "Internal copilots for your team, grounded on your data, deployed where they work (Slack, Teams, your app).",
  },
];

const mcpBenefits = [
  "One place to manage AI permissions across your stack",
  "Consistent auth, logging, and audit trails",
  "Agents that can’t exceed their defined scope",
  "Re-usable integrations across every AI system you build",
];

const toolGroups = [
  {
    title: "CRM & sales",
    items: ["Salesforce", "HubSpot", "Zoho CRM", "Pipedrive", "LeadSquared"],
  },
  {
    title: "Helpdesk & CX",
    items: ["Zendesk", "Freshdesk", "Intercom", "ServiceNow", "Jira Service Management"],
  },
  {
    title: "ERP & finance",
    items: ["SAP", "Oracle", "NetSuite", "Dynamics", "Tally", "Zoho Books", "QuickBooks", "Xero"],
  },
  {
    title: "Data & collab",
    items: [
      "Snowflake",
      "BigQuery",
      "Postgres",
      "Slack",
      "Teams",
      "Google Workspace",
      "Microsoft 365",
      "Notion",
      "Confluence",
      "SharePoint",
    ],
  },
  {
    title: "Plus whatever you already run",
    items: ["Legacy, on-prem, homegrown tools", "Excel-driven workflows"],
  },
];

const toolItemList = toolGroups.flatMap((group) => group.items);

const howItWorks = [
  {
    title: "Week 0 — Integration scoping.",
    description: "Current stack, target use cases, security constraints.",
  },
  {
    title: "Weeks 1–3 — Build & integrate.",
    description: "Connectors, MCP servers, AI logic, guardrails.",
  },
  {
    title: "Week 4 — Test & deploy.",
    description: "UAT with your team, staged rollout.",
  },
  {
    title: "Week 5+ — Scale & maintain.",
    description: "Tune, expand coverage, keep integrations healthy as vendor APIs evolve.",
  },
];

const whyConverse = [
  "Tool-neutral. Not a Salesforce-only or Microsoft-only shop. We pick what fits.",
  "Integration + agents in one team. Most SIs punt agent builds to partners. We do both.",
  "Faster than big SIs. Weeks, not quarters. Fixed-fee, not T&M.",
  "India delivery economics. 30–50% below US-only shops for the same quality.",
  "We live this. Our conversational AI product runs these integrations every day. Not theoretical.",
];

const outcomes = [
  "AI live inside your existing CRM/helpdesk in 2–6 weeks",
  "30% reduction in support tickets via AI triage in helpdesk",
  "20–40% sales rep time saved through CRM-embedded AI",
  "Single context layer — AI sees data across all your tools",
  "No rip-and-replace — we extend, not replace",
];


const faqs = [
  {
    question: "How do I integrate AI into my existing CRM?",
    answer:
      "Two paths: (1) enable and configure the vendor's native AI (Einstein, Breeze, Zia) — limited but fast; (2) build custom AI layers that do what native features can't. We evaluate both per use case and recommend honestly.",
  },
  {
    question: "What's the cost of integrating AI with ERP?",
    answer:
      "Depends on ERP and use case. Modern cloud ERPs (NetSuite, Dynamics) are cheaper and faster. Legacy on-prem (older SAP, custom ERPs) costs more due to API work. Fixed-fee quotes after scoping.",
  },
  {
    question: "Can AI work with legacy systems?",
    answer:
      "Yes. We've integrated with SAP ECC, Oracle EBS, Tally, and custom in-house tools. Where no API exists, we'll build one. Or wrap it in RPA until there is.",
  },
  {
    question: "How long does AI integration take?",
    answer: "Simple single-tool integrations: 2–4 weeks. Multi-tool programs: 3–6 months. Fixed timeline after scoping.",
  },
  {
    question: "Will this break our existing workflows?",
    answer:
      "No. We extend, not replace. Changes are additive, deployed through test environments first, and rolled out in stages.",
  },
  {
    question: "How do you handle data security and residency?",
    answer:
      "Deployments in your cloud (AWS/Azure/GCP), VPC or on-prem where required. DPDP, GDPR, HIPAA, SOC 2 compliance as applicable.",
  },
  {
    question: "Which AI models do you integrate — can we use our Azure/AWS credits?",
    answer: "Yes. Azure OpenAI, AWS Bedrock, GCP Vertex, plus direct provider APIs. Your cloud credits, your choice.",
  },
  {
    question: "What is MCP (Model Context Protocol)?",
    answer:
      "An open standard for letting AI agents access your tools safely — with permissions, auth, and audit. See the dedicated section above.",
  },
  {
    question: "Who maintains this when Salesforce or HubSpot updates their API?",
    answer:
      "Retainer clients get integration health monitoring and updates included. Non-retainer clients get a monitored alert so you know before things break.",
  },
];

const integrationComparisonRows = [
  { label: "Custom AI logic", converse: "Yes — built per workflow", zapier: "No — if/then only", ipaas: "Limited without custom code" },
  { label: "AI-native", converse: "Yes — LLM + tool calls across 50+ connectors", zapier: "Basic AI steps only", ipaas: "Add-on modules" },
  { label: "Timeline", converse: "2–6 weeks per integration", zapier: "Hours to days (simple flows)", ipaas: "Weeks to months" },
  { label: "Handles unstructured data", converse: "Yes — PDFs, emails, free text", zapier: "No", ipaas: "Partial" },
  { label: "Maintenance", converse: "Observability dashboard + retainer available", zapier: "You maintain", ipaas: "Vendor-managed, expensive" },
  { label: "Best for", converse: "AI-heavy, multi-system workflows with business logic", zapier: "Simple linear automations", ipaas: "Enterprise ESB / EDI patterns" },
];

const AIIntegration = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://theconverseai.com/services/ai-integration#service",
        name: "AI Integration Services",
        description:
          "AI integration services that plug AI into your CRM, ERP, and helpdesk tools without rip-and-replace.",
        serviceType: "AI integration services",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://theconverseai.com",
        },
        areaServed: ["India", "United States"],
      },
      {
        "@type": "ItemList",
        name: "Supported AI integration tools",
        itemListElement: toolItemList.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool,
        })),
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
            name: "AI Integration Services",
            item: "https://theconverseai.com/services/ai-integration",
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
        <title>AI Integration Services for CRM, ERP &amp; Helpdesk | ConverseAI</title>
        <meta
          name="description"
          content="Plug AI into Salesforce, HubSpot, Zoho, SAP, Zendesk and your internal tools. No rip-and-replace. Live in weeks — book a scoping call."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="AI Integration Services for CRM, ERP & Helpdesk | ConverseAI" />
        <meta
          property="og:description"
          content="Plug AI into Salesforce, HubSpot, Zoho, SAP, Zendesk and your internal tools. No rip-and-replace. Live in weeks — book a scoping call."
        />
        <link rel="canonical" href="https://theconverseai.com/services/ai-integration" />
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">AI Integration Services</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Your tools already charge you for AI. Make it actually do something.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      AI integration services — plug AI into the CRM, ERP, and helpdesk you already run.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      Salesforce, HubSpot, Zoho, Zendesk, SAP, Tally, Oracle, your in-house systems — we wire AI into your
                      existing stack. No rip-and-replace. AI live in weeks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Map my stack (free 30-min audit)">
                          Map my stack (free 30-min audit)
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button asChild variant="hero-outline" size="xl">
                        <a href="#supported-tools" title="See supported tools">
                          See supported tools
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-5 text-center">Your stack → AI-powered</p>
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="grid grid-cols-2 gap-2">
                          {["Salesforce", "HubSpot", "Zendesk", "SAP"].map((tool) => (
                            <div key={tool} className="px-3 py-2 rounded-lg bg-white/80 border border-border/50 text-xs font-medium text-center shadow-sm">{tool}</div>
                          ))}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <RefreshCw className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                          <div className="w-px h-6 bg-primary/30" />
                          <Plug className="w-5 h-5 text-primary" />
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shadow-lg">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          { icon: Globe, label: "No rip-and-replace", sub: "Works with what you already run" },
                          { icon: Zap, label: "Live in weeks", sub: "Not months of implementation" },
                          { icon: Plug, label: "50+ integrations built", sub: "CRM, ERP, helpdesk, custom APIs" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 border border-border/40">
                            <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.sub}</p>
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

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The problem</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">
                        “We&apos;re paying for AI in every tool — where&apos;s the ROI?”
                      </span>{" "}
                      That&apos;s the CFO question every CTO is now answering. Every SaaS vendor has bolted AI features onto
                      their product — Einstein, Breeze, Zia, ChatSpot, Joule, Now Assist. They don&apos;t talk to each other.
                      Your data sits siloed in each one.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">
                        The AI in your SaaS isn&apos;t broken. It&apos;s just not connected to the AI in your other SaaS.
                      </span>
                    </p>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Your CRM doesn&apos;t see your helpdesk&apos;s context
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Your ERP is too old to have a real API
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Your internal tools have no AI at all
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Your team still copies data between 6 systems a day
                      </li>
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">Integration is the gap</h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      Integration is the gap between tools with AI and a business that runs on AI. We run these
                      integrations on our own product every day. Real traffic, real bugs, real fixes.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Enterprise AI integration starts with connecting the tools you already pay for — and then letting
                      AI act across them.
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What we build</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    AI integration services for CRM, ERP, and helpdesk platforms — plus MCP server implementation for
                    safe agent access across your stack.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-8">
                {buildAreas.map((area, index) => (
                  <AnimatedSection key={area.title} delay={index * 0.1}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-xl font-semibold mb-3">{area.title}</h3>
                      <p className="text-muted-foreground">{area.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">What is a Model Context Protocol (MCP) server?</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      MCP (Model Context Protocol) is an open standard for letting AI agents access tools and data with
                      permissions, auth, and audit — the same way a human employee uses your CRM but with code-level
                      guarantees. Instead of hardcoding every integration into each agent, you build MCP servers once per
                      tool; any agent can then use them safely.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      We build MCP servers for proprietary and legacy tools where vendors haven&apos;t shipped their own. It&apos;s
                      the cleanest way to make AI work across your whole business without rebuilding integrations per
                      agent.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-xl font-semibold mb-4">For you, it means</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {mcpBenefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="supported-tools" className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported tools</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    AI workflow automation for enterprises across CRM, helpdesk, ERP, data, and collaboration systems —
                    plus whatever you already run.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-8">
                {toolGroups.map((group, index) => (
                  <AnimatedSection key={group.title} delay={index * 0.1}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-xl font-semibold mb-4">{group.title}</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {group.items.map((item) => (
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
                  Want a per-tool deep-dive? Ask about Salesforce, HubSpot, or Zoho AI integration during your scoping
                  call.
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Need help connecting your tools to AI?</p>
                <p className="text-muted-foreground mt-1">Book a free 30-min stack review — we'll map your setup and show the fastest path forward.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Get a free stack review">
                  Get a free stack review <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
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
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">AI-native integration vs no-code tools vs enterprise iPaaS.</p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI</TableHead>
                      <TableHead>Zapier / Make</TableHead>
                      <TableHead>MuleSoft / Boomi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrationComparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.zapier}</TableCell>
                        <TableCell>{row.ipaas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Keep your stack. Add the AI.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Book a free 30-min stack-mapping audit. We&apos;ll map your current tools and show you the fastest path to
                  AI-native workflows.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Map my stack">
                    Map my stack
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

export default AIIntegration;
