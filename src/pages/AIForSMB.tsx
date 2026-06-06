import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, TrendingUp, Clock, DollarSign, Zap } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/submitContactForm";
import { trackFormError, trackFormStart, trackFormSuccess, trackFormView } from "@/lib/tracking";

const metaTitle = "AI for Small & Mid-Sized Businesses (SMB) | ConverseAI";
const metaDescription =
  "Affordable AI services for SMBs and mid-market — voice agents, custom AI, outbound, knowledge assistants. Fixed-fee, live in weeks. Book a call.";

const diagnosticQuestions = [
  "Team size",
  "Biggest pain point",
  "Current AI use",
  "Budget range",
];

const smbServices = [
  {
    title: "AI Readiness Audit",
    price: "from $999",
    description:
      "The most common entry point. 3-week fixed-fee engagement that maps your highest-ROI AI opportunities. Audit fee credited toward the build.",
    href: "/services/ai-strategy-audit",
  },
  {
    title: "AI Voice Agents",
    price: "from $250 setup + usage",
    description:
      "Answer inbound calls 24/7, qualify leads, book appointments. Most SMBs recover setup cost in month one on missed-call recovery alone.",
    href: "/services/ai-voice-agents",
  },
  {
    title: "Agent Sprint",
    price: "$9,995",
    description:
      "4 weeks to one production agent. Pick one back-office workflow (invoice processing, ticket triage, vendor onboarding). See it run in 30 days.",
    href: "/services/agentic-automation",
  },
  {
    title: "Sales Intelligence & Outreach",
    price: "pay per Stage-2 meeting (from $300/meeting)",
    description:
      "6-week performance pilot. Pay per qualified meeting, not per send. Built for pipeline without SDR overhead.",
    href: "/services/sales-ai",
  },
  {
    title: "Custom AI Agent Development",
    price: "$200 feasibility review → $25K+ build",
    description:
      "When off-the-shelf doesn’t fit. Start with a 1-week feasibility review before committing to a custom build.",
    href: "/services/custom-ai-agents",
  },
  {
    title: "Document & Knowledge Intelligence",
    price: "pilot from $15K",
    description:
      "When new hires take forever to ramp and SOPs are a mess. Private knowledge assistants that answer with citations.",
    href: "/services/knowledge-intelligence",
  },
  {
    title: "AI Integration Services",
    price: "from $10K per integration",
    description:
      "Extend your CRM or helpdesk with AI layers that actually work. We integrate with what you already run.",
    href: "/services/ai-integration",
  },
];

const smbNeeds = [
  {
    pain: "“We know AI could help us — we have no idea where to start.”",
    recommendation: "Start with an AI Readiness Audit ($999). 3 weeks to a prioritized roadmap.",
  },
  {
    pain: "“We’re missing calls / leads / support requests because we can’t staff 24/7.”",
    recommendation:
      "Deploy AI Voice Agents. Answer 100% of inbound, qualify leads, book appointments — live in 4 weeks.",
  },
  {
    pain: "“Our team is drowning in repetitive back-office work.”",
    recommendation: "Start with a 4-week Agent Sprint. One production agent.",
  },
  {
    pain: "“We need more pipeline but can’t afford SDRs.”",
    recommendation:
      "Run our Sales Intelligence & Outreach performance pilot. Pay per Stage-2 meeting booked.",
  },
  {
    pain: "“New hires take forever to ramp. Our SOPs are a mess.”",
    recommendation:
      "Launch a Knowledge Assistant that ingests your docs and answers team questions in seconds. Pilot from $15K.",
  },
  {
    pain: "“Our CRM/helpdesk has ‘AI features’ but they don’t do anything useful.”",
    recommendation:
      "Use AI Integration Services to extend your existing tools with custom AI layers that actually work.",
  },
];

const smbReasons = [
  {
    title: "Fixed fees, not open-ended.",
    description: "Every engagement is fixed-fee and fixed-timeline. No T&M creep.",
  },
  {
    title: "Ship in weeks.",
    description: "Most engagements go live in 4–8 weeks. Big firms take 4–8 months.",
  },
  {
    title: "Jaipur-built engineering, US-grade craft.",
    description: "Our pricing reflects the economics; our quality doesn’t.",
  },
];

const journeySteps = [
  {
    title: "Month 0 — Discovery.",
    description: "30-min free call. We figure out if AI helps you, and where to start.",
  },
  {
    title: "Month 1 — First engagement.",
    description: "Typically a Readiness Audit or an Agent Sprint. Budget: $5K–$25K.",
  },
  {
    title: "Months 2–3 — Build the first system.",
    description: "Voice agent, knowledge assistant, custom agent, or integration. Live by month 3.",
  },
  {
    title: "Months 4–6 — Expand coverage.",
    description: "Second and third workflows. By month 4, the second system starts paying for the first.",
  },
  {
    title: "Ongoing.",
    description: "Managed retainer or clean handoff — your call.",
  },
];

const industries = [
  "D2C & e-commerce — WhatsApp commerce, support bots, abandoned-cart voice calls",
  "Professional services — RFP automation, sales outreach, knowledge assistants",
  "B2B SaaS — SDR automation, support deflection, onboarding assistants",
  "Real estate — lead qualification voice bots, property matching agents",
  "Healthcare clinics — appointment scheduling, reminders, intake automation",
  "Education & EdTech — admissions outreach, student support, content assistants",
  "Local services — 24/7 reception, missed-call recovery, booking automation",
  "Manufacturing & trade — invoice automation, vendor management, procurement agents",
];

const benchmarks = [
  "Voice agents: 40% of missed calls recovered within first month",
  "Custom support agents: 30–60% of Tier-1 tickets deflected",
  "Sales outreach pilots: 8–14 Stage-2 meetings per quarter, pay-per-meeting",
  "Knowledge assistants: 50%+ reduction in “where do I find…” questions",
  "Finance automation: 70%+ reduction in manual invoice cycles",
];

const faqs = [
  {
    question: "Can we afford AI as a small business?",
    answer:
      "If “small” means under 10 employees — probably not custom builds yet. Start with our Strategy Audit or a voice agent pilot. If you’re 20–500 employees, yes — our pricing is built for you.",
  },
  {
    question: "What’s the minimum engagement?",
    answer:
      "The $200 Agent Feasibility Review and the $250 Voice Agent setup are our smallest fixed-scope entries. Audit starts at $999. Sales outreach Performance Pilot is pay-per-meeting.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Yes — especially funded B2B SaaS and services startups. We don’t do equity-for-work engagements.",
  },
  {
    question: "We don’t have technical staff. Can you still help?",
    answer:
      "Yes. We deliver turnkey systems with clean handoff docs. Many SMB clients have no internal AI team.",
  },
  {
    question: "What tools do we need to already have?",
    answer:
      "Usually just the tools you already run — CRM, helpdesk, spreadsheets, WhatsApp. We integrate with what exists.",
  },
  {
    question: "How do we measure ROI?",
    answer:
      "We define 2–3 outcome metrics with you at kickoff and report weekly/monthly. Most engagements pay back in 3–6 months.",
  },
  {
    question: "What AI should a small business implement first?",
    answer:
      "Depends on your biggest pain. Missing calls → voice agent. Too much repetitive back-office work → Agent Sprint. No pipeline → sales outreach pilot. Can’t decide → Readiness Audit. Or take the 2-min diagnostic above.",
  },
  {
    question: "Can we start small and expand?",
    answer:
      "Yes. Most SMB clients start with one engagement, see results, then expand. No contract lock-in.",
  },
];

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const AIForSMB = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const hasStartedPdfForm = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    trackFormView("smb_ai_starting_point_pdf", { form_location: "smb_page_pdf_card" });
  }, []);

  const trackPdfFormStart = () => {
    if (hasStartedPdfForm.current) return;

    hasStartedPdfForm.current = true;
    trackFormStart("smb_ai_starting_point_pdf", { form_location: "smb_page_pdf_card" });
  };

  const handlePdfRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Work email is required.");
      trackFormError("smb_ai_starting_point_pdf", "email_required", { form_location: "smb_page_pdf_card" });
      toast({ title: "Email required", description: "Please enter your work email to get the PDF.", variant: "destructive" });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      trackFormError("smb_ai_starting_point_pdf", "invalid_email", { form_location: "smb_page_pdf_card" });
      toast({ title: "Invalid email", description: "Enter a valid email address to continue.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm({
        fullName: "SMB AI Starting Point PDF",
        email,
        phone: "",
        countryName: "",
        product: "AI Starting Point PDF",
        subject: "AI Starting Point PDF request",
        message: "Requested the AI Starting Point PDF from the SMB solutions page.",
        form_source: "SMB AI Diagnostic PDF",
      });

      trackFormSuccess("smb_ai_starting_point_pdf", { form_location: "smb_page_pdf_card" });
      setFormSubmitted(true);
      setEmail("");
    } catch {
      trackFormError("smb_ai_starting_point_pdf", "submission_failed", { form_location: "smb_page_pdf_card" });
      toast({
        title: "Submission failed",
        description: "Please try again or book a discovery call instead.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://theconverseai.com/solutions/ai-for-smb#webpage",
        name: metaTitle,
        url: "https://theconverseai.com/solutions/ai-for-smb",
        description: metaDescription,
        inLanguage: "en",
        audience: { "@id": "https://theconverseai.com/solutions/ai-for-smb#audience" },
        breadcrumb: { "@id": "https://theconverseai.com/solutions/ai-for-smb#breadcrumb" },
      },
      {
        "@type": "BusinessAudience",
        "@id": "https://theconverseai.com/solutions/ai-for-smb#audience",
        audienceType: "SMB",
        name: "Small and mid-sized businesses",
      },
      {
        "@type": "ItemList",
        "@id": "https://theconverseai.com/solutions/ai-for-smb#services",
        name: "AI services SMBs actually use",
        itemListOrder: "http://schema.org/ItemListOrderAscending",
        itemListElement: smbServices.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: service.title,
          url: `https://theconverseai.com${service.href}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": "https://theconverseai.com/solutions/ai-for-smb#faq",
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
        "@type": "BreadcrumbList",
        "@id": "https://theconverseai.com/solutions/ai-for-smb#breadcrumb",
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
            name: "Solutions",
            item: "https://theconverseai.com/solutions",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "AI for SMBs",
            item: "https://theconverseai.com/solutions/ai-for-smb",
          },
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <link rel="canonical" href="https://www.theconverseai.com/solutions/ai-for-smb" />
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">AI for SMBs</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Big AI. SMB price point. Same team.
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                      AI services for small and mid-sized businesses — built for outcomes, priced to be accessible.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      You don’t need a $500K AI project. You need one that pays back in 90 days. That’s what we build for SMBs
                      and mid-market teams in India and the US.
                    </p>
                    <div className="flex flex-col gap-4 sm:max-w-xs">
                      <a href="#smb-diagnostic">
                        <Button variant="hero" size="xl" title="Find my starting point (2-min diagnostic)">
                          Find my starting point (2-min diagnostic)
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </a>
                      <a href="#smb-services">
                        <Button variant="hero-outline" size="xl" title="Browse SMB-friendly services">
                          Browse SMB-friendly services
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative mt-6 lg:mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <p className="text-sm font-semibold text-primary mb-5 text-center">SMB AI — typical 90-day outcomes</p>
                      <div className="space-y-4">
                        {[
                          { icon: DollarSign, metric: "$999", label: "Starting price", sub: "AI Strategy Audit — fixed fee", color: "text-primary bg-primary/10" },
                          { icon: Clock, metric: "30 days", label: "First agent live", sub: "Agent Sprint — 4-week delivery", color: "text-violet bg-violet/10" },
                          { icon: TrendingUp, metric: "3–5×", label: "ROI in year one", sub: "Measured across 40+ deployments", color: "text-mint bg-mint/10" },
                          { icon: Zap, metric: "24/7", label: "Autonomous ops", sub: "No extra headcount needed", color: "text-primary bg-primary/10" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/70 border border-border/40">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">{item.metric}</span>
                                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-3 shadow-lg animate-float">
                      <p className="text-xs text-muted-foreground">Audit fee credited toward build</p>
                      <p className="text-sm font-bold text-primary">Always.</p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="smb-diagnostic" className="py-12 md:py-16">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">SMB AI diagnostic</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      A 2-minute diagnostic that returns a personalized service recommendation and an email-gated PDF:{" "}
                      <span className="font-semibold text-foreground">AI Roadmap for Your Business.</span>
                    </p>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                      <h3 className="text-lg font-semibold mb-3">We ask 4 questions</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {diagnosticQuestions.map((question) => (
                          <li key={question} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-1" />
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-2">Get your AI Starting Point PDF</h3>
                    <p className="text-muted-foreground mb-6">
                      Enter your email to receive the SMB AI roadmap plus a recommended first engagement.
                    </p>
                    {formSubmitted ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground">
                        Thanks! Check your inbox for the PDF and your starting point recommendation.
                      </div>
                    ) : (
                      <form onSubmit={handlePdfRequest} onFocus={trackPdfFormStart} className="space-y-4" noValidate>
                        <div className="space-y-2">
                          <label htmlFor="smb-email" className="sr-only">
                            Work email
                          </label>
                          <Input
                            id="smb-email"
                            type="email"
                            placeholder="Work email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            maxLength={255}
                            aria-invalid={!!emailError}
                            aria-describedby={emailError ? "smb-email-error" : undefined}
                            className={`h-12 bg-white/80 border-muted focus:ring-primary ${emailError ? "border-destructive" : ""}`}
                          />
                          {emailError && (
                            <p id="smb-email-error" className="text-xs text-destructive" role="alert">
                              {emailError}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          type="submit"
                          disabled={isSubmitting}
                          title="Get your AI Starting Point PDF"
                        >
                          {isSubmitting ? "Sending..." : "Get my PDF"}
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          We’ll email your PDF within minutes. No spam, unsubscribe anytime.
                        </p>
                      </form>
                    )}
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why this page exists</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Most AI services are built for Fortune 500 buyers — long engagements, six-figure minimums, enterprise
                    sales cycles. SMBs get ignored or priced out.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <AnimatedSection>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>You don’t have an AI budget problem. You have an AI scoping problem.</p>
                    <p>
                      We built our service menu differently: fixed-fee engagements, 4-week sprints, starting prices a small
                      business can actually afford. Outcomes that move your P&L next quarter.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-primary/20 bg-white/90 p-6">
                    <h3 className="text-lg font-semibold mb-3">Operator truth</h3>
                    <p className="text-muted-foreground italic">
                      “You don’t have an AI budget problem. You have an AI scoping problem.”
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="smb-services" className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    The AI services SMBs actually use (ranked by how often we start here)
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Fixed-fee, outcome-led options that get you to production fast.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-6">
                {smbServices.map((service, index) => (
                  <AnimatedSection key={service.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full flex flex-col">
                      <div className="mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <Link to={service.href} className="text-primary font-semibold inline-flex items-center gap-2 mt-auto">
                        Learn more
                        <ArrowRight className="w-4 h-4" />
                      </Link>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What SMBs typically want from us</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    If one of these sounds like you, you’re in the right place.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-6">
                {smbNeeds.map((need) => (
                  <AnimatedSection key={need.pain}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <p className="text-lg font-semibold text-foreground mb-3">{need.pain}</p>
                      <p className="text-muted-foreground">{need.recommendation}</p>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SMBs work with us</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-3 gap-6">
                {smbReasons.map((reason) => (
                  <AnimatedSection key={reason.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <div className="flex items-start gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        <h3 className="text-lg font-semibold">{reason.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{reason.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Not sure which AI use case is right for your SMB?</p>
                <p className="text-muted-foreground mt-1">We'll give you an honest answer in 20 minutes — no sales pitch.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Talk to an expert">
                  Talk to an expert <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">A typical SMB journey with us</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {journeySteps.map((step) => (
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

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Industries we commonly serve</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground text-lg">
                {industries.map((industry) => (
                  <AnimatedSection key={industry}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-4">
                      {industry}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-violet/10 to-background">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">SMB outcome benchmarks</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6 text-muted-foreground text-lg">
                {benchmarks.map((benchmark) => (
                  <AnimatedSection key={benchmark}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                      {benchmark}
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
                  <AnimatedSection key={faq.question}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                      <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-violet/10 to-background">
            <div className="container-tight text-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Big AI, SMB price point.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                  Take the 2-min diagnostic to find your starting point — or book a 30-min discovery call. We’ll be
                  straight with you about what’s worth building and what’s not.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#smb-diagnostic">
                    <Button variant="hero" size="lg" title="Find my starting point">
                      Find my starting point
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                  <Link to="/book-demo">
                    <Button variant="hero-outline" size="lg" title="Book a 30-min discovery call">
                      Book a 30-min discovery call
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AIForSMB;
