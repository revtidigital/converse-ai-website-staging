import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, TrendingUp, Target, Mail, Users } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const icpCriteria = [
  "B2B SaaS selling into ops, RevOps, data, or engineering leaders",
  "$25K–$250K ACV (precision beats volume at this price point)",
  "10–500 employees, seed through Series C",
  "Usually US-based with expansion into UK/EU; India teams selling to US",
  "A named champion persona, clear first-meeting definition, and a real sales team to run discovery",
];

const notForUs = [
  "Agencies reselling outreach",
  "Low-ACV transactional e-commerce",
  "Anyone looking for “100 meetings a month” volume plays",
];

const triedAlready = [
  "An Apollo + Instantly stack stitched together in-house",
  "An “AI SDR” platform (11x, Artisan, Regie) that wrote confident emails to the wrong people",
  "A done-for-you agency (Belkins, Martal, Lemlist DFY) that sent 20,000 emails and booked 4 meetings",
  "A human SDR you hired, onboarded, and watched churn in 9 months",
];

const signalSources = [
  "Funding events",
  "Executive moves",
  "Job postings",
  "Tech-stack changes",
  "Competitor churn signals",
  "Intent data (Bombora, 6sense, Common Room)",
  "Warm-visitor de-anonymization",
  "LinkedIn engagement",
];

const signalPlays = [
  {
    title: "The Funding Trigger Play",
    signalSource: "Series A/B/C announcements with $10M+ round sizes, matched to ICP fit",
    speed: "60 minutes from signal fire",
    channelMix: "LinkedIn DM + email + optional voice follow-up",
    benchmark: "12–18% reply rate (last 6 months, aggregated across SaaS clients)",
  },
  {
    title: "The New-VP Play",
    signalSource: "LinkedIn job-change notifications for VP/Head-of roles in target functions",
    speed: "24 hours from detection",
    channelMix: "Engage on announcement post → DM → email",
    benchmark: "14–22% reply rate",
  },
  {
    title: "The Competitor-Churn Play",
    signalSource: "Intent spikes on competitor-alternative keywords + G2 review triggers + support-ticket chatter",
    speed: "48 hours",
    channelMix: "Email + LinkedIn with a specific “here’s how we handle the pain buyers leave X for” angle",
    benchmark: "9–14% reply rate",
  },
];

const additionalPlays = [
  "Hiring-Surge",
  "Tech-Stack Change",
  "Leadership-Exit",
  "Trade-Show-Roster",
  "Conference-Speaker",
  "Podcast-Guest",
];

const outboundPillars = [
  {
    title: "Human-written copy, not LLM wrappers",
    description:
      "Copy is written by a human SDR-copywriter on our team, assisted (not replaced) by AI for research and first-line personalization. Every sequence is reviewed and owned by a named operator.",
  },
  {
    title: "Deliverability infrastructure",
    description:
      "Dedicated secondary domains, inbox-level warming, per-inbox send caps (40/day), and placement monitoring via Google Postmaster + GlockApps. Automatic pause triggers if open rate dips below 60%, bounce >3%, or spam complaints rise.",
  },
  {
    title: "LinkedIn, safely",
    description:
      "Sales Navigator + Heyreach with residential IPs, daily caps enforced (15 connection requests, 30 engagement touches, 5 InMails). Engagement-based warming before requests and zero browser-automation patterns LinkedIn flags.",
  },
  {
    title: "Reply handling + qualification",
    description:
      "Replies triaged within the hour. Interested replies get a human response, not-now replies enter nurture, and spam/unsubscribe handled automatically. Qualified meetings auto-book with full lead context.",
  },
];

const pilotDetails = [
  "Price: bespoke per Stage-2-qualified meeting (based on ICP complexity, ACV, geography)",
  "Setup: one-time fee, scoped to you (domains, warming, Clay tables, copy, ICP workshop, CRM integration)",
  "Volume: ~500 tier-1 accounts over 6 weeks, not 5,000",
  "Commitment: 6 weeks, no contract rollover",
];

const retainedDetails = [
  "Monthly retainer + shared KPIs on pipeline and opportunities created, not meetings",
  "Bespoke monthly retainer for single-play + single-inbox setups",
  "Scales for multi-play, multi-channel programs with voice follow-up",
  "Quoted after a pilot, never sold upfront",
];

const caseSnippets = [
  "Series B HR-tech, $35K ACV, New-VP Play, X meetings in 6 weeks, Y advanced to Stage 2",
  "India-based dev services firm selling into US mid-market, Funding Trigger Play, reply rates + pipeline outcome",
  "US vertical SaaS, Competitor-Churn Play, ACV + meetings + close rate",
];

const comparisonRows = [
  {
    label: "Motion",
    converse: "Signal-first, human-assisted",
    aiSdr: "Autonomous AI SDR",
    clay: "Clay-heavy, DIY support",
    volume: "Volume + templated sequences",
    inHouse: "Whatever you train",
  },
  {
    label: "Hallucination risk",
    converse: "Low (human review every send)",
    aiSdr: "Medium (autonomous)",
    clay: "Low (you review)",
    volume: "Low",
    inHouse: "Low",
  },
  {
    label: "Speed to 8+ meetings",
    converse: "Weeks 4–6",
    aiSdr: "Weeks 2–4 (if ICP fits)",
    clay: "Depends on your time",
    volume: "Weeks 6–10",
    inHouse: "6–12 months with ramp",
  },
  {
    label: "Deliverability management",
    converse: "Included, monitored",
    aiSdr: "Platform-dependent",
    clay: "Your problem",
    volume: "Usually included",
    inHouse: "Your problem",
  },
  {
    label: "What you get",
    converse: "Operator-run signal plays",
    aiSdr: "Autonomous agent + dashboards",
    clay: "Tables + your execution",
    volume: "Volume + weekly reports",
    inHouse: "Your own hire",
  },
];

const whyConverse = [
  "Operator-run, not marketer-run. We’ve worked in-house at B2B SaaS before building this practice.",
  "Signal depth over Clay depth — the wedge is the plays we’ve refined, not the tables we can build.",
  "Inbound conversational AI as a bolt-on for rapid qualification of inbound replies.",
  "Performance pilot with real skin in the game — outcomes, not volume reports.",
  "India + US delivery: engineering and ops in Jaipur, copywriting in US-native voice.",
];

const outcomes = [
  "8–14 Stage-2-qualified meetings per quarter for $25K–$75K ACV clients",
  "10–20%+ reply rates on signal-triggered sequences (median across recent clients)",
  "95%+ inbox placement measured via Google Postmaster + GlockApps seed tests",
  "Zero banned LinkedIn accounts, zero burned primary domains in our operational history",
  "First meetings booked in weeks 3–4, steady state from week 5",
];

const faqs = [
  {
    question: "Does AI cold outreach actually work in 2026?",
    answer:
      "Yes, when it’s signal-triggered and human-assisted. Gmail and Yahoo’s 2024 sender rules killed spray-and-pray. Precision plays with per-inbox caps and weekly placement monitoring still win.",
  },
  {
    question: "How is this different from 11x or Artisan?",
    answer:
      "They sell autonomous AI SDRs. We run signal plays with humans writing copy. Autonomous agents hallucinate signals and burn domains; they can work when ICPs are broad and markets are huge.",
  },
  {
    question: "Will my domain get blacklisted or my LinkedIn banned?",
    answer:
      "Not on our watch. We use dedicated secondary domains, enforced send caps per inbox, residential IPs for LinkedIn, and engagement-based warming. Zero banned accounts or burned primary domains so far.",
  },
  {
    question: "Who writes the copy — a human or an LLM?",
    answer:
      "A human SDR-copywriter on our team, with their name attached to every campaign. AI assists with research and first-line personalization, but does not write sequences end-to-end.",
  },
  {
    question: "What happens if the campaign doesn’t work in month 1?",
    answer:
      "Our pilot has explicit kill criteria defined in week 1. If we’re off at week 3, we pivot ICP, angle, or signal source with you. If we’re off at 6 weeks, the pilot ends and you pay only for qualified meetings booked.",
  },
  {
    question: "How do you handle CAN-SPAM, GDPR, and Gmail/Yahoo 2024 sender rules?",
    answer:
      "SPF, DKIM, DMARC, BIMI configured per domain. Unsubscribe links on every email. DNC + GDPR suppression lists maintained. Postmaster and seed tests monitored weekly.",
  },
  {
    question: "Will this cannibalize our existing SDR team?",
    answer:
      "Usually no. We run different plays than in-house SDRs — the speed-to-signal, niche-signal plays your team doesn’t want to interpret. We share data weekly to avoid overlap.",
  },
  {
    question: "Who owns the data and infrastructure?",
    answer:
      "Your CRM records and lead data are fully yours. The domains and inboxes stay under our operational control during engagement because we warm and maintain them. Offboarding includes full documentation and optional domain transfer.",
  },
  {
    question: "How long until the first meetings?",
    answer:
      "Typical: weeks 3–4 for first meetings, week 5 onward is steady state. Domain warming takes 2–3 weeks regardless of agency — no shortcut exists.",
  },
  {
    question: "Clay vs Apollo vs your setup — which do we need?",
    answer:
      "For B2B outbound in 2026: Clay for enrichment, Apollo as a data source inside Clay, Smartlead/Instantly for sending, Sales Nav + Heyreach for LinkedIn. We run all of it.",
  },
];

const SalesAI = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://www.theconverseai.com/services/sales-ai#service",
        name: "Sales Intelligence & Outreach Automation",
        description:
          "Signal-triggered outbound for B2B SaaS: research, personalized email + LinkedIn + voice, reply handling, and outcome-based pricing.",
        serviceType: "Signal-based outbound and AI sales outreach automation",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://www.theconverseai.com",
        },
        areaServed: ["United States", "United Kingdom", "Europe", "India"],
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
            name: "Sales Intelligence & Outreach Automation",
            item: "https://www.theconverseai.com/services/sales-ai",
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
        <title>AI Sales Outreach &amp; LinkedIn Automation | ConverseAI</title>
        <meta
          name="description"
          content="Signal-triggered outbound for B2B SaaS: research, personalized email + LinkedIn + voice, reply handling. Performance pilot available."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="AI Sales Outreach & LinkedIn Automation | ConverseAI" />
        <meta
          property="og:description"
          content="Signal-triggered outbound for B2B SaaS: research, personalized email + LinkedIn + voice, reply handling. Performance pilot available."
        />
        <link rel="canonical" href="https://www.theconverseai.com/services/sales-ai" />
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Sales Intelligence & Outreach</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      Signal-based outbound. Built by operators. Priced on outcomes.
                    </h1>
                    <h2 className="text-xl sm:text-2xl text-foreground/80 font-semibold mb-6">
                      We run signal-triggered outbound for B2B SaaS teams — not volume campaigns, not
                      AI-SDR demoware.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10">
                      Start with a 6-week Performance Pilot: you pay per Stage-2-qualified meeting, or you don&apos;t pay.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/contact-us">
                        <Button variant="hero" size="xl" title="Start a Performance Pilot">
                          Start a Performance Pilot
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button asChild variant="hero-outline" size="xl">
                        <a href="#signal-plays" title="See how signal plays work">
                          See how signal plays work
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
                      <p className="text-sm font-semibold text-primary mb-5 text-center">Signal-to-meeting pipeline</p>
                      <div className="space-y-3">
                        {[
                          { icon: Target, step: "1", label: "Signal detected", detail: "Hiring surge · Funding · Tech change · Intent", color: "text-primary bg-primary/10" },
                          { icon: Users, step: "2", label: "ICP matched & researched", detail: "Decision-maker identified · Context built", color: "text-violet bg-violet/10" },
                          { icon: Mail, step: "3", label: "Hyper-personalised outreach", detail: "1-of-1 message · Not a template blast", color: "text-mint bg-mint/10" },
                          { icon: TrendingUp, step: "4", label: "Stage-2 meeting booked", detail: "You pay per qualified meeting", color: "text-primary bg-primary/10" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-border/40">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                              <item.icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold">{item.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground/50">{item.step}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-sm font-semibold text-primary">Pay per Stage-2 meeting</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Bespoke pricing · 6-week pilot</p>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-3 shadow-lg animate-float">
                      <p className="text-xs text-muted-foreground">Performance-based pricing</p>
                      <p className="text-sm font-bold text-primary">No meetings = no charge</p>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Who this is for</h2>
                    <p className="text-lg text-muted-foreground mb-6">A narrow ICP on purpose:</p>
                    <ul className="space-y-3 text-muted-foreground">
                      {icpCriteria.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-border/60 bg-white/90">
                    <h3 className="text-2xl font-semibold mb-4">Not for us</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {notForUs.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted-foreground mt-6">
                      We&apos;d rather send you to a volume shop than take the deal and fail.
                    </p>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The real problem</h2>
                    <p className="text-lg text-muted-foreground mb-6">You&apos;ve already tried:</p>
                    <ul className="space-y-3 text-muted-foreground">
                      {triedAlready.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-border/60 bg-white/90">
                    <h3 className="text-2xl font-semibold mb-4">Signal quality beats send volume.</h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      In 2026, reply rates are a function of signal quality, not send volume. Gmail and Yahoo&apos;s 2024
                      sender rules killed spray-and-pray. Autonomous AI SDRs still hallucinate signals.
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Teams winning outbound now run precision, signal-triggered plays with human-in-the-loop copy. We&apos;re
                      one of the few agencies who do it.
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we run outbound</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Signal-first, not list-first. We monitor 20+ sources and trigger plays when signals fire — not when
                    a list is ready.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Signal-first, not list-first</h3>
                    <p className="text-muted-foreground mb-6">
                      We don&apos;t build a 50,000-lead list and blast templates. We wait for intent and act fast.
                    </p>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                      <h4 className="text-lg font-semibold mb-3">Signal sources we track</h4>
                      <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                        {signalSources.map((source) => (
                          <li key={source} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary mt-1" />
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-8">
                    <h3 className="text-2xl font-semibold mb-4">Response speed matters.</h3>
                    <p className="text-muted-foreground mb-4">
                      Speed-to-contact is part of the play. We run SLAs from 60 minutes to 48 hours depending on the
                      signal.
                    </p>
                    <p className="text-muted-foreground">
                      Every play has a kill criterion, and every campaign has a named owner you can Slack.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="signal-plays" className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Named signal plays we run</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Plays are defined by signal source, speed-to-contact, channel mix, and benchmark reply rate.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-3 gap-6">
                {signalPlays.map((play) => (
                  <AnimatedSection key={play.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-xl font-semibold mb-3">{play.title}</h3>
                      <ul className="space-y-3 text-muted-foreground text-sm">
                        <li>
                          <span className="font-semibold text-foreground">Signal source:</span> {play.signalSource}
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">Speed-to-contact SLA:</span> {play.speed}
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">Channel mix:</span> {play.channelMix}
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">Benchmark reply rate:</span> {play.benchmark}
                        </li>
                      </ul>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.1}>
                <div className="mt-8 rounded-2xl border border-border/60 bg-white/90 p-6">
                  <h3 className="text-lg font-semibold mb-3">Additional plays we run per client</h3>
                  <div className="flex flex-wrap gap-2">
                    {additionalPlays.map((play) => (
                      <span key={play} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm">
                        {play}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Ready to launch your first signal play?</p>
                <p className="text-muted-foreground mt-1">Book a 30-min planning call — we'll map your ICP and pick the right signals to act on.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Book a planning call">
                  Book a planning call <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Execution details that protect your brand</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Signal quality gets replies. Deliverability and safe LinkedIn ops keep your domains and accounts
                    intact.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {outboundPillars.map((pillar) => (
                  <AnimatedSection key={pillar.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                      <p className="text-muted-foreground">{pillar.description}</p>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">The offer</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Start with a performance pilot. If it works, we scale. If it doesn&apos;t, you don&apos;t pay for missed
                    outcomes.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-6">
                <AnimatedSection>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-8 h-full">
                    <h3 className="text-2xl font-semibold mb-4">Performance Pilot (recommended)</h3>
                    <p className="text-muted-foreground mb-6">
                      6-week engagement. Pay per Stage-2-qualified meeting. If we can&apos;t hit 8+ Stage-2 meetings at your
                      qualification bar, we don&apos;t get paid.
                    </p>
                    <ul className="space-y-3 text-muted-foreground mb-6">
                      {pilotDetails.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      Stage-2-qualified = prospect attended the first call, confirmed problem fit, agreed to a
                      technical/demo conversation. Not a calendar-fill. Not a ghosted show.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-8 h-full">
                    <h3 className="text-2xl font-semibold mb-4">Retained Signal Program</h3>
                    <p className="text-muted-foreground mb-6">
                      For teams past pilot stage who want scale. Monthly retainer + shared KPIs on pipeline and
                      opportunities created.
                    </p>
                    <ul className="space-y-3 text-muted-foreground">
                      {retainedDetails.map((item) => (
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Case snippets</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Proof matters. These placeholders will be replaced with real or anonymized numbers before launch.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-3 gap-6">
                {caseSnippets.map((snippet) => (
                  <AnimatedSection key={snippet}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <p className="text-muted-foreground">{snippet}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.1}>
                <p className="text-sm text-muted-foreground italic mt-6 text-center">
                  Note to Himanshu: these placeholders need real or anonymized numbers from actual ConverseAI engagements
                  before launch. Case specificity is the #1 proof gap flagged by the outbound review.
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Honest framing: if you want a pure SaaS dashboard, go with 11x or Artisan. If you want a Clay
                    power-user and DIY execution, hire a freelancer. We fit when you want signal plays run end-to-end on
                    outcomes.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead />
                      <TableHead>ConverseAI</TableHead>
                      <TableHead>11x / Artisan</TableHead>
                      <TableHead>Clay freelancer</TableHead>
                      <TableHead>Belkins / Martal / volume DFY</TableHead>
                      <TableHead>In-house SDR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.aiSdr}</TableCell>
                        <TableCell>{row.clay}</TableCell>
                        <TableCell>{row.volume}</TableCell>
                        <TableCell>{row.inHouse}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                    <ul className="space-y-3 text-muted-foreground mb-10">
                      {whyConverse.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-xl font-semibold mb-4">Outcomes we aim for</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {outcomes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted-foreground mt-6">
                      We won&apos;t promise 60 meetings/month. Volume isn&apos;t the lever at this ACV. Precision is.
                    </p>
                  </div>
                </AnimatedSection>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Start a Performance Pilot. Pay per qualified meeting.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                  6 weeks. 500 tier-1 accounts. We share kill criteria in week 1. Book a 30-min planning call — we&apos;ll map
                  your ICP, pick the right signal plays, and send a proposal in 48 hours.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <Link to="/contact-us">
                  <Button variant="hero" size="xl" title="Start my Performance Pilot">
                    Start my Performance Pilot
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

export default SalesAI;
