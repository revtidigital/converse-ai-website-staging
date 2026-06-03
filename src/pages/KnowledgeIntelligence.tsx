import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Search, FileText, ShieldCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const painPoints = [
  "New hires take 3–6 months to ramp because no one can find anything",
  "Contract teams spend hours locating clauses across thousands of agreements",
  "Support teams answer the same questions with conflicting answers",
  "Employees paste confidential docs into ChatGPT because your intranet search is unusable",
];

const comparisonRows = [
  {
    label: "Deployment",
    converse: "Your cloud / VPC / on-prem",
    glean: "Glean SaaS, their cloud",
    diy: "Yours",
  },
  {
    label: "Model choice",
    converse: "Any — Claude, GPT, Llama, Qwen",
    glean: "Glean's stack",
    diy: "You choose",
  },
  {
    label: "Time to production",
    converse: "4–6 weeks",
    glean: "6-month rollout typical",
    diy: "3–6+ months",
  },
  {
    label: "Permission-aware retrieval",
    converse: "Yes (inherits source ACLs)",
    glean: "Yes",
    diy: "Depends on build quality",
  },
  {
    label: "Citation-backed answers",
    converse: "Yes (configurable refuse-if-no-citation)",
    glean: "Yes",
    diy: "Depends",
  },
  {
    label: "Custom domain accuracy",
    converse: "Tuned per engagement",
    glean: "Generic enterprise search",
    diy: "You tune",
  },
  {
    label: "On-prem / air-gapped option",
    converse: "Yes",
    glean: "No (SaaS-only)",
    diy: "Yes",
  },
  {
    label: "Best for",
    converse: "Teams wanting domain-tuned RAG with control",
    glean: "Large enterprises comfortable with SaaS + pricing",
    diy: "Teams with AI engineering talent + time",
  },
];

const ragVsFineTuneRows = [
  {
    label: "Use for",
    rag: "Injecting knowledge from your documents",
    fineTune: "Teaching specialized reasoning or output patterns",
  },
  {
    label: "Handles frequent updates",
    rag: "Yes (re-index in minutes)",
    fineTune: "No (re-train per change)",
  },
  {
    label: "Citations",
    rag: "Yes",
    fineTune: "No",
  },
  {
    label: "Permission-aware",
    rag: "Yes",
    fineTune: "No (model memorizes)",
  },
  {
    label: "Typical accuracy for internal-doc Q&A",
    rag: "85–95% (measured, see benchmark below)",
    fineTune: "Lower — model can't cite source",
  },
];

const buildAreas = [
  {
    title: "Employee knowledge assistants",
    description:
      "Ask anything about policies, SOPs, benefits, IT, HR, compliance — get a cited answer in seconds. Deployed in Slack, Teams, your intranet, or a custom chat UI.",
  },
  {
    title: "Customer support knowledge bots",
    description:
      "Grounded on your help center, internal playbooks, and product docs. Deployable as a chatbot, WhatsApp bot, or agent-facing co-pilot.",
  },
  {
    title: "Contract intelligence",
    description:
      "Search, summarize, and extract clauses across thousands of agreements. Compare contracts. Flag missing terms. Auto-draft from templates.",
  },
  {
    title: "SOP & compliance assistants",
    description:
      "For regulated industries (BFSI, pharma, healthcare) — answers tied to the current version of a policy, with clause-level citations and audit trail.",
  },
  {
    title: "Sales enablement assistants",
    description:
      "Grounded on battle cards, win/loss notes, case studies. Instant answers during discovery calls.",
  },
  {
    title: "RFP and proposal assistants",
    description:
      "Pulls from your response library, past proposals, and product docs. Drafts responses with citations.",
  },
];

const buildPrinciples = [
  {
    title: "Grounded answers only, with citations.",
    description:
      "Every answer links back to source documents and page numbers. If it can't cite, it won't answer — configurable per use case.",
  },
  {
    title: "Permission-aware.",
    description:
      "Users only see content they have access to in the source system (SharePoint ACLs, Google Drive permissions, Confluence groups). No data leakage across roles.",
  },
  {
    title: "Your cloud, your control.",
    description:
      "Deployed in your AWS/Azure/GCP VPC. Open models (Llama, Qwen, Mistral) for on-prem. No data leaves your perimeter.",
  },
  {
    title: "Real-time sync.",
    description: "When a document updates, the index updates. No stale answers from last quarter's policy.",
  },
  {
    title: "Eval-first — the ConverseAI RAG Accuracy Benchmark.",
    description:
      "We measure citation precision, answer accuracy, refusal correctness against a domain-specific test set built per engagement. Weekly eval review post-launch.",
  },
  {
    title: "Multi-modal.",
    description:
      "PDFs with tables and images, scanned documents, handwriting, audio transcripts — not just clean text.",
  },
];

const dataSources = [
  "SharePoint",
  "Google Drive",
  "Confluence",
  "Notion",
  "Dropbox",
  "OneDrive",
  "Box",
  "Slack",
  "Microsoft Teams",
  "Zendesk",
  "Salesforce attachments",
  "Internal wikis",
  "Databases",
  "Custom document stores",
  "Email archives",
  "PDF libraries",
  "Contract repositories",
];

const howItWorks = [
  {
    title: "Week 0 — Knowledge audit.",
    description: "What you have, where it lives, access patterns, accuracy bar.",
  },
  {
    title: "Weeks 1–3 — Build.",
    description: "Ingestion pipeline, embeddings, retrieval, LLM orchestration, permissions, UI.",
  },
  {
    title: "Week 4 — Deploy.",
    description: "Internal pilot. Eval tuning.",
  },
  {
    title: "Weeks 5–6 — Scale.",
    description: "Full rollout, monitoring, feedback loop.",
  },
];

const whyConverse = [
  "Built in your cloud, not ours. VPC/on-prem deployment with open models.",
  "Accuracy-measured. Every RAG build has an eval harness with citation precision + answer accuracy measured weekly.",
  "Conversational AI DNA. Ships as a real assistant — WhatsApp, Slack, Teams, web, voice — not just a search box.",
  "Domain-specific. Pharma SOPs, BFSI compliance, legal contracts — not generic enterprise search.",
  "India pricing, US quality. 4–6 week pilots vs. 6-month Glean rollouts.",
];

const outcomes = [
  "Answer policy/SOP questions in 5 seconds instead of 2 hours of searching",
  "Cut new-hire ramp time by 40–60%",
  "Find a specific contract clause across 10,000 agreements in under 10 seconds",
  "Deflect 30–50% of internal IT/HR tickets with a grounded assistant",
  "100% citation-backed answers — zero hallucination tolerance for compliance",
];

const pricingRows = [
  {
    engagement: "Pilot",
    scope: "One use case, one data source, 4–6 weeks",
    range: "$15K–$40K",
  },
  {
    engagement: "Production build",
    scope: "Multi-source, multi-channel deployment",
    range: "$40K–$150K",
  },
  {
    engagement: "Managed retainer",
    scope: "Tuning, evals, re-indexing, new sources",
    range: "$2K–$10K/month",
  },
];

const faqs = [
  {
    question: "How does RAG work on internal documents?",
    answer:
      "We ingest your documents, split them into chunks, create vector embeddings, and store them in a vector database. When you ask a question, the system retrieves the most relevant chunks and feeds them to an LLM to generate a grounded answer with citations.",
  },
  {
    question: "Is enterprise RAG secure and private?",
    answer:
      "Yes, when built right. We deploy in your cloud, use permission-aware retrieval, and never train on your data. Open models for fully on-prem deployments.",
  },
  {
    question: "RAG vs. fine-tuning — which is better for internal docs?",
    answer:
      "RAG for most cases. Handles frequent updates, provides citations, respects permissions. See the comparison table above.",
  },
  {
    question: "How do you compare to Glean?",
    answer:
      "Glean is SaaS, priced per-seat, generic enterprise search. We build custom RAG in your cloud, with domain-tuning, open models, and lower year-1 cost at most scales. Honest: Glean is the right call for some Fortune 500 buyers; we're a better fit for teams wanting control, accuracy, or air-gapped deployment.",
  },
  {
    question: "What accuracy can we expect?",
    answer:
      "Measured via our RAG Accuracy Benchmark per engagement. Typical deployments hit 85–95% answer accuracy with near-100% citation fidelity. We define the target accuracy bar with you in week 1.",
  },
  {
    question: "How do you handle permissions — will employees see docs they shouldn't?",
    answer:
      "No. We inherit permissions from the source system (SharePoint ACLs, Google Drive permissions). The retrieval layer filters before content ever reaches the LLM.",
  },
  {
    question: "Can it handle scanned PDFs, images, and tables?",
    answer:
      "Yes. Modern OCR, layout-aware parsing, and multi-modal embeddings handle complex documents including scans, diagrams, and tables.",
  },
  {
    question: "What happens when documents are updated?",
    answer: "Real-time or scheduled re-indexing. Changes propagate in minutes.",
  },
  {
    question: "Can we deploy on-prem, fully air-gapped?",
    answer:
      "Yes. Open models (Llama 3.3, Qwen, Mistral) on your hardware, no external API calls. Common for defense, BFSI, healthcare.",
  },
];

const knowledgeComparisonRows = [
  { label: "Answers with citations", converse: "Yes — every answer sourced to document + page", llm: "No — hallucinated summaries", search: "No — returns links, not answers" },
  { label: "Handles proprietary docs", converse: "Yes — PDFs, Word, Confluence, SharePoint, Notion", llm: "Only if uploaded each session", search: "Depends on indexing" },
  { label: "Hallucination control", converse: "Strict — only answers from ingested corpus", llm: "Medium — may generate outside source", search: "N/A — keyword match only" },
  { label: "Private deployment", converse: "Yes — your cloud or on-premise", llm: "No — data leaves your environment", search: "Yes (on-prem SharePoint)" },
  { label: "Keeps up with new docs", converse: "Yes — automated re-ingestion pipeline", llm: "No — static training cutoff", search: "Depends on crawl schedule" },
  { label: "Best for", converse: "Teams that need accurate, cited answers from internal knowledge", llm: "General-purpose Q&A on public knowledge", search: "Finding documents, not answering questions" },
];

const KnowledgeIntelligence = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://www.theconverseai.com/services/knowledge-intelligence#service",
        name: "Document & Knowledge Intelligence",
        description:
          "Private, citation-backed enterprise RAG and AI knowledge assistants over your documents, built in your cloud.",
        serviceType: "Enterprise RAG implementation and AI knowledge assistants",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://www.theconverseai.com",
        },
        areaServed: ["India", "United States"],
      },
      {
        "@type": "Offer",
        "@id": "https://www.theconverseai.com/services/knowledge-intelligence#offer",
        name: "Knowledge intelligence build",
        url: "https://www.theconverseai.com/services/knowledge-intelligence",
        price: "15000-150000",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
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
            name: "Document & Knowledge Intelligence",
            item: "https://www.theconverseai.com/services/knowledge-intelligence",
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
        <title>Enterprise RAG &amp; AI Document Assistants | ConverseAI</title>
        <meta
          name="description"
          content="Private, citation-backed enterprise RAG and AI knowledge assistants over your docs. Built in your cloud. Live in 4–6 weeks. Book a demo."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Enterprise RAG & AI Document Assistants | ConverseAI" />
        <meta
          property="og:description"
          content="Private, citation-backed enterprise RAG and AI knowledge assistants over your docs. Built in your cloud. Live in 4–6 weeks. Book a demo."
        />
        <link rel="canonical" href="https://www.theconverseai.com/services/knowledge-intelligence" />
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Document &amp; Knowledge Intelligence</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Your best documentation is trapped in your worst search tool.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      Enterprise RAG implementation and AI knowledge assistants, built in your cloud.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      AI that reads your SOPs, contracts, policies, and internal docs — and answers with citations.
                      Permission-aware. Deployed in your VPC or on-prem. Zero hallucination tolerance for compliance teams.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Book a free knowledge audit">
                          Book a free knowledge audit
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button asChild variant="hero-outline" size="xl">
                        <a href="#live-demo" title="Try the live demo">
                          Try the live demo (upload a sample doc)
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
                      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-white/80 border border-border/40">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">What is the refund policy for enterprise contracts?</span>
                        <div className="ml-auto w-2 h-4 bg-primary rounded-sm animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                          <p className="text-sm font-medium mb-2">Answer</p>
                          <p className="text-sm text-muted-foreground">Enterprise contracts are eligible for a pro-rated refund within 30 days of the billing cycle, subject to the terms in Section 8.3...</p>
                          <div className="mt-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-mint flex-shrink-0" />
                            <p className="text-xs text-mint font-medium">Cited from: Enterprise Agreement v2.4, §8.3</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-border/50" />
                          <p className="text-xs text-muted-foreground">Sources</p>
                          <div className="flex-1 h-px bg-border/50" />
                        </div>
                        {["Enterprise_Agreement_v2.4.pdf", "Billing_Policy_2025.pdf"].map((doc) => (
                          <div key={doc} className="flex items-center gap-2 p-2 rounded-lg bg-white/70 border border-border/40">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{doc}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-center text-xs">
                        <div><p className="font-bold text-primary">85–95%</p><p className="text-muted-foreground">Answer accuracy</p></div>
                        <div><p className="font-bold text-violet">100%</p><p className="text-muted-foreground">Citation-backed</p></div>
                        <div><p className="font-bold text-mint">Your cloud</p><p className="text-muted-foreground">VPC / on-prem</p></div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The problem</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      80% of your business data is unstructured — SOPs, contracts, policies, playbooks, meeting notes,
                      tribal Slack threads. Your team spends roughly 20% of their week searching through it.
                    </p>
                    <ul className="space-y-3 text-muted-foreground">
                      {painPoints.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">Enterprise RAG fixes this — when built right.</h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      When it&apos;s built badly, it hallucinates with citations. We build it right — accuracy-measured,
                      permission-aware, deployed in your cloud.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      The result is a knowledge assistant your compliance team trusts and your teams actually use.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">ConverseAI vs Glean vs DIY RAG</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Honest positioning: Glean is excellent if you&apos;re a Fortune 500 comfortable with SaaS pricing and
                    generic enterprise search. We fit when you want domain-tuned accuracy, your cloud, open models, or 4–6
                    week shipping.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead />
                      <TableHead>ConverseAI custom RAG</TableHead>
                      <TableHead>Glean / Guru</TableHead>
                      <TableHead>DIY (your engineering team)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.glean}</TableCell>
                        <TableCell>{row.diy}</TableCell>
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
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What we build</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Enterprise RAG and AI knowledge assistants deployed where your teams already work.
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

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we build it right</h2>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-8">
                {buildPrinciples.map((item, index) => (
                  <AnimatedSection key={item.title} delay={index * 0.1}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Got documents scattered across tools and systems?</p>
                <p className="text-muted-foreground mt-1">Let's audit your knowledge sources and design a retrieval system that actually works.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Start a knowledge audit">
                  Start a knowledge audit <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Data sources we connect</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    We plug into your document stack, inherit permissions, and keep your index in sync.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataSources.map((source, index) => (
                  <AnimatedSection key={source} delay={index * 0.05}>
                    <div className="rounded-xl border border-border/60 bg-white/90 p-4 text-muted-foreground">
                      {source}
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

          <section className="py-12 md:py-16">
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

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Private knowledge AI vs generic LLMs vs document search.</p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI Knowledge AI</TableHead>
                      <TableHead>Generic LLM (ChatGPT, Copilot)</TableHead>
                      <TableHead>SharePoint / Confluence search</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {knowledgeComparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.llm}</TableCell>
                        <TableCell>{row.search}</TableCell>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Put your knowledge to work.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Book a free 30-min knowledge audit. We&apos;ll map your sources and recommend the fastest path to a working
                  RAG system.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Book my knowledge audit">
                    Book my knowledge audit
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

export default KnowledgeIntelligence;
