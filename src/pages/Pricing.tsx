import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Check,
  PhoneCall,
  Bot,
  Plug,
  FileText,
  Target,
  ClipboardCheck,
  Headphones,
  Layers,
  Globe,
  Shield,
  Workflow,
  ArrowRight,
  Phone,
  Cpu,
} from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Data Definitions ---

const PLANS = [
  {
    name: "Engage",
    tagline: "Launch your first AI agent",
    price: "Custom quote",
    priceDetail: "Based on call and conversation volume",
    ctaPrimary: "Get a custom quote",
    ctaPrimaryHref: "/contact-us",
    ctaSecondary: "Book a live demo",
    ctaSecondaryHref: "/book-demo",
    popular: false,
    included: [
      "Voice agent",
      "AI agent for your first use case",
      "WhatsApp and web chat channels",
      "Human handover",
      "Email support, business hours",
      "Guided setup",
    ],
  },
  {
    name: "Grow",
    tagline: "Everything in Engage, plus",
    price: "Custom quote",
    priceDetail: "Based on agents, channels and team size",
    ctaPrimary: "Get a custom quote",
    ctaPrimaryHref: "/contact-us",
    ctaSecondary: "Book a live demo",
    ctaSecondaryHref: "/book-demo",
    popular: true,
    included: [
      "Voice agent",
      "Multiple agent types — Sales, Support & Lead-Gen",
      "Live chat and omni-channel inbox",
      "Team management and routing",
      "100+ languages",
      "Chat and phone, extended hours",
      "Shared success manager",
    ],
  },
  {
    name: "Scale",
    tagline: "Everything in Grow, plus",
    price: "Custom quote",
    priceDetail: "Based on scope and compliance",
    ctaPrimary: "Talk to sales",
    ctaPrimaryHref: "/contact-us",
    ctaSecondary: "Book a live demo",
    ctaSecondaryHref: "/book-demo",
    popular: false,
    included: [
      "Voice agent",
      "Custom AI agents and agentic workflows",
      "CRM and ERP integrations via API",
      "Full analytics suite with AI insights",
      "Custom onboarding",
      "24/7 support with SLA",
      "Dedicated success manager",
    ],
  },
];

const SERVICES = [
  {
    title: "AI voice agents",
    description:
      "Inbound and outbound voice AI for sales, support, and recruitment. Multilingual, CRM-connected.",
    badge: "Included in every plan",
    badgeType: "included",
    icon: PhoneCall,
  },
  {
    title: "Agentic systems and automation",
    description:
      "Agents that reason, decide, and act across multi-step workflows. Included in Scale.",
    badge: "Add-on for Engage, Grow",
    badgeType: "addon",
    icon: Workflow,
  },
  {
    title: "Custom AI agent development",
    description:
      "Bespoke agents built on your workflows and data. You own the IP. Included in Scale.",
    badge: "Add-on for Engage, Grow",
    badgeType: "addon",
    icon: Bot,
  },
  {
    title: "API integrations",
    description:
      "Connect AI to your CRM, ERP, helpdesk, or internal tools via API, with upkeep handled by us.",
    badge: "Available on: All plans",
    badgeType: "available",
    icon: Plug,
  },
  {
    title: "Document and knowledge intelligence",
    description:
      "Private RAG that lets teams query contracts, manuals, and reports in your own cloud.",
    badge: "Available on: All plans",
    badgeType: "available",
    icon: FileText,
  },
  {
    title: "Sales intelligence and outreach",
    description:
      "Intent signals, sequences, and outreach campaigns, built and run for you.",
    badge: "Available on: All plans",
    badgeType: "available",
    icon: Target,
  },
  {
    title: "AI strategy and readiness audit",
    description:
      "Find where AI moves the needle. We map high-value workflows and give you a clear build plan.",
    badge: "Start with Get a free AI audit",
    badgeType: "link",
    href: "/services/ai-strategy-audit",
    icon: ClipboardCheck,
  },
  {
    title: "Support and expansion",
    description:
      "24/7 support with SLA, dedicated onboarding, extra channels and languages. Included in Scale.",
    badge: "Add-on for Engage, Grow",
    badgeType: "addon",
    icon: Headphones,
  },
];

const SHAPING_FACTORS = [
  {
    title: "Call and conversation volume",
    description: "More calls and conversations mean more AI processing and usage.",
    icon: Phone,
  },
  {
    title: "Agents and workflows",
    description: "More agent types and multi-step workflows need more design and testing.",
    icon: Cpu,
  },
  {
    title: "Channels",
    description: "Each channel adds setup and upkeep, from voice to WhatsApp and web.",
    icon: Layers,
  },
  {
    title: "Languages",
    description: "More languages need extra training and quality checks.",
    icon: Globe,
  },
  {
    title: "Integrations",
    description: "Connecting your CRM, ERP, or tools via API takes build and upkeep.",
    icon: Plug,
  },
  {
    title: "Support and compliance",
    description: "24/7 coverage, SLAs, and compliance setups need dedicated resources.",
    icon: Shield,
  },
];

type TableValue = boolean | string;

interface ComparisonCategory {
  category: string;
  rows: {
    feature: string;
    engage: TableValue;
    grow: TableValue;
    scale: TableValue;
  }[];
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    category: "Voice and agentic AI",
    rows: [
      { feature: "Voice agent", engage: true, grow: true, scale: true },
      {
        feature: "Agent types",
        engage: "Single use case",
        grow: "Sales, Support & Lead-Gen",
        scale: "Custom-built, you own the IP",
      },
      { feature: "Agentic workflow automation", engage: "Add-on", grow: "Add-on", scale: true },
    ],
  },
  {
    category: "Conversation channels",
    rows: [
      { feature: "WhatsApp AI and web chatbot", engage: true, grow: true, scale: true },
      { feature: "Lead qualification and human handover", engage: true, grow: true, scale: true },
      { feature: "Live chat and omni-channel inbox", engage: false, grow: true, scale: true },
      { feature: "Smart routing and team management", engage: false, grow: true, scale: true },
      { feature: "Languages", engage: "Standard set", grow: "100+ languages", scale: "100+ languages" },
    ],
  },
  {
    category: "Insights and integrations",
    rows: [
      { feature: "Reports and analytics", engage: "Basic reports", grow: "Standard reports", scale: "Full suite with AI insights" },
      { feature: "API integrations", engage: "Add-on", grow: "CRM", scale: "CRM, ERP, custom" },
    ],
  },
  {
    category: "Support and success",
    rows: [
      { feature: "Support", engage: "Email, business hours", grow: "Chat and phone, extended hours", scale: "24/7 with SLA" },
      { feature: "Onboarding", engage: "Guided setup", grow: "Setup and training", scale: "Custom onboarding" },
      { feature: "Success manager", engage: false, grow: "Shared", scale: "Dedicated" },
    ],
  },
  {
    category: "Security and compliance",
    rows: [
      { feature: "GDPR and CCPA", engage: true, grow: true, scale: true },
      { feature: "DPDP and custom compliance", engage: true, grow: true, scale: true },
    ],
  },
];

const STEPS = [
  {
    num: "1",
    title: "Get a free AI audit",
    description: "We map your highest-value workflows, channels, and the right build approach.",
  },
  {
    num: "2",
    title: "See a live demo",
    description: "We show the agent working on your own use case, so you see the value first.",
  },
  {
    num: "3",
    title: "Get a tailored proposal",
    description: "Plan, add-ons, scope, and pricing in one document, sized to your business.",
  },
];

const FAQS = [
  {
    question: "Why no fixed prices?",
    answer:
      "Every business differs in call volume, channels, agents, and integrations. A sized quote means you pay for what you actually use, not a bundle built for someone else.",
  },
  {
    question: "Can we grow into more?",
    answer:
      "Plans are built to grow with you. Add agents, channels, or add-ons as your needs change, without starting over.",
  },
  {
    question: "Do we need a technical team?",
    answer:
      "No. We scope, build, deploy, and run the AI agents in production, so your team can focus on growth.",
  },
  {
    question: "How fast can our AI agents go live?",
    answer:
      "Engage and Grow setups are typically operational within 1 to 2 weeks. Custom Scale implementations with deep ERP and agentic workflows follow an agreed rollout schedule.",
  },
  {
    question: "Can we connect our existing CRM and phone numbers?",
    answer:
      "Yes. ConverseAI connects directly to major CRMs (HubSpot, Salesforce, Zoho, Zendesk) and integrates with your existing telecom lines, VoIP, and WhatsApp Business API. Converse AI also provides API that you can use to directly integrate with your existing custom CRM",
  },
  {
    question: "How is our business and customer data protected?",
    answer:
      "All plans include enterprise-grade data protection adhering to GDPR, CCPA, and DPDP standards. Your data is isolated in secure cloud environments and is never used to train public foundation models.",
  },
];

const Pricing = () => {
  const renderTableCell = (val: TableValue) => {
    if (typeof val === "boolean") {
      return val ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#9d00ff]/10 text-[#9d00ff] mx-auto">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </span>
      ) : (
        <span className="text-gray-300 font-bold text-lg select-none">—</span>
      );
    }
    if (val === "Add-on") {
      return (
        <a
          href="#addons"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("addons");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9d00ff]/10 text-[#9d00ff] border border-[#9d00ff]/30 hover:bg-[#9d00ff] hover:text-white transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          title="Click to view Add-on services"
        >
          Add-on
        </a>
      );
    }
    return <span className="text-sm font-medium text-gray-700">{val}</span>;
  };

  return (
    <>
      <Helmet>
        <title>Pricing Built Around Your Business | ConverseAI</title>
        <meta
          name="description"
          content="Voice and agentic AI agents, built and run for you. Every plan is sized to your needs. Engage, Grow, and Scale plans with tailored custom quotes."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://theconverseai.com/pricing" />
      </Helmet>

      <div className="min-h-screen bg-[#fafafd] text-[#1f2937] pt-20 md:pt-24 font-sans selection:bg-[#9d00ff]/15 selection:text-[#9d00ff] overflow-x-hidden">
        <main id="main-content">
          {/* ─── Hero Section ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
            {/* Subtle brand glow matching ConverseAI logo colors */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-[#9d00ff]/15 via-[#7c3aed]/10 to-transparent blur-3xl pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <AnimatedSection>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-950 mb-4 leading-[1.15]">
                  Pricing built around your business
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                  Voice and agentic AI agents, built and run for you. Every plan is sized to your needs.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#9d00ff] hover:bg-[#8800e0] text-white font-semibold px-7 py-2.5 h-11 rounded-xl shadow-md shadow-[#9d00ff]/30 transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(157,0,255,0.5)] active:scale-100 active:translate-y-0"
                  >
                    <Link to="/services/ai-strategy-audit">Get a free AI audit</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-[#9d00ff]/40 text-[#9d00ff] bg-white hover:bg-[#9d00ff] hover:text-white hover:border-[#9d00ff] font-semibold px-7 py-2.5 h-11 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_10px_30px_-6px_rgba(157,0,255,0.35)] active:scale-100 active:translate-y-0"
                  >
                    <Link to="/book-demo">Book a live demo</Link>
                  </Button>
                </div>
              </AnimatedSection>

              {/* ─── 3 Pricing Cards ───────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch text-left">
                {PLANS.map((plan, index) => (
                  <AnimatedSection key={plan.name} delay={index * 0.1}>
                    <div
                      className={cn(
                        "relative flex flex-col h-full rounded-2xl bg-white p-7 transition-all duration-200 shadow-sm",
                        plan.popular
                          ? "border-2 border-[#9d00ff] shadow-xl shadow-[#9d00ff]/15 ring-2 ring-[#9d00ff]/20"
                          : "border border-border/80 hover:border-[#9d00ff]/40 hover:shadow-md"
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                          <span className="inline-block bg-[#9d00ff] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-[#9d00ff]/30 whitespace-nowrap">
                            Most popular
                          </span>
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-1 mb-5 min-h-[18px]">
                        {plan.tagline}
                      </p>

                      <div className="mb-6">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                          {plan.price}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 min-h-[34px] flex items-start">
                          {plan.priceDetail}
                        </p>
                      </div>

                      {/* Stacked CTA Buttons */}
                      <div className="flex flex-col gap-2.5 mb-7">
                        <Button
                          asChild
                          className="w-full bg-[#9d00ff] hover:bg-[#8800e0] text-white font-semibold py-2.5 h-10 rounded-xl transition-all duration-300 ease-out shadow-sm shadow-[#9d00ff]/20 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_10px_30px_-6px_rgba(157,0,255,0.45)] active:scale-100 active:translate-y-0"
                        >
                          <Link to={plan.ctaPrimaryHref}>{plan.ctaPrimary}</Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-2 border-[#9d00ff]/35 text-[#9d00ff] bg-white hover:bg-[#9d00ff] hover:text-white hover:border-[#9d00ff] font-semibold py-2.5 h-10 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-md hover:shadow-[#9d00ff]/25 active:scale-100 active:translate-y-0"
                        >
                          <Link to={plan.ctaSecondaryHref}>{plan.ctaSecondary}</Link>
                        </Button>
                      </div>

                      <div className="border-t border-gray-100 pt-5 mt-auto">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3.5">
                          What's included
                        </p>
                        <ul className="space-y-3">
                          {plan.included.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                              <Check className="w-4 h-4 text-[#9d00ff] shrink-0 mt-0.5" />
                              <span className="leading-snug">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* ─── Bottom Banner: Not sure where to start? ─────────────── */}
              <AnimatedSection delay={0.35}>
                <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#7c3aed] via-[#9d00ff] to-[#d90086] p-6 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-5 text-left shadow-xl shadow-[#9d00ff]/25 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-white">
                      Not sure where to start?
                    </h4>
                    <p className="text-sm text-white/90 font-normal">
                      A free AI audit maps the right workflow, channel, and build approach for your business.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white hover:bg-white/95 text-[#9d00ff] font-bold px-6 py-2.5 h-11 rounded-xl shrink-0 shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.3)] active:scale-100 active:translate-y-0"
                  >
                    <Link to="/services/ai-strategy-audit">Get a free AI audit</Link>
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* ─── Section 2: Add-ons for any plan (Page 2 of PDF) ─── */}
          <section id="addons" className="py-16 md:py-20 bg-white border-t border-b border-border/50 scroll-mt-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedSection>
                <div className="mb-12">
                  <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                    Add-ons for any plan
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 font-normal">
                    Voice, agentic, and custom AI, built and run by us. Attach any of these to your plan.
                  </p>
                </div>
              </AnimatedSection>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {SERVICES.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <AnimatedSection key={service.title} delay={index * 0.05}>
                      <div className="flex flex-col h-full rounded-2xl border border-border/70 bg-[#fbfafd] p-6 hover:border-[#9d00ff]/40 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d00ff] to-[#7c3aed] text-white flex items-center justify-center mb-4 shrink-0 shadow-sm shadow-[#9d00ff]/30">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">
                          {service.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-normal mb-5 flex-1">
                          {service.description}
                        </p>
                        <div className="pt-3 border-t border-border/40 mt-auto">
                          {service.href ? (
                            <Link
                              to={service.href}
                              className="text-[11px] font-bold text-[#9d00ff] hover:text-[#7c3aed] flex items-center gap-1 group transition-colors"
                            >
                              <span>{service.badge}</span>
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          ) : (
                            <span
                              className={cn(
                                "text-[11px] font-semibold",
                                service.badgeType === "included" && "text-[#9d00ff] font-bold",
                                service.badgeType === "addon" && "text-[#9d00ff] font-bold",
                                service.badgeType === "available" && "text-[#9d00ff] font-bold"
                              )}
                            >
                              {service.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>

              {/* ─── What shapes your quote ───────────────────────────────── */}
              <AnimatedSection delay={0.2}>
                <div className="mt-20 pt-16 border-t border-gray-150">
                  <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                      What shapes your quote
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2 font-normal">
                      Each factor maps to real effort and cost on our side, so you pay for what you use.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {SHAPING_FACTORS.map((factor, i) => {
                      const IconComponent = factor.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#9d00ff]/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d00ff] to-[#7c3aed] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#9d00ff]/25">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900 mb-1">
                              {factor.title}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-normal">
                              {factor.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* ─── Section 3: Compare plans (Comparison Table - Page 3 of PDF) ─── */}
          <section className="py-16 md:py-24 bg-[#fafafd]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedSection>
                <div className="mb-12">
                  <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                    Compare plans
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 font-normal">
                    See what each plan covers. Every plan can take any add-on.
                  </p>
                </div>
              </AnimatedSection>

              {/* Table Container with horizontal scroll on mobile */}
              <AnimatedSection delay={0.1}>
                <div className="rounded-2xl border border-border/80 bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-150 bg-gray-50/70">
                          <th className="py-4 px-6 text-sm font-bold text-gray-900 w-1/3">
                            What's included
                          </th>
                          <th className="py-4 px-6 text-center w-[22%]">
                            <span className="block text-base font-bold text-gray-900">Engage</span>
                            <span className="block text-xs font-normal text-gray-500 mt-0.5">Custom quote</span>
                          </th>
                          <th className="py-4 px-6 text-center w-[22%] bg-[#9d00ff]/[0.03]">
                            <span className="inline-block bg-[#9d00ff] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
                              Most popular
                            </span>
                            <span className="block text-base font-bold text-[#9d00ff]">Grow</span>
                            <span className="block text-xs font-normal text-[#9d00ff]/80 mt-0.5">Custom quote</span>
                          </th>
                          <th className="py-4 px-6 text-center w-[23%]">
                            <span className="block text-base font-bold text-gray-900">Scale</span>
                            <span className="block text-xs font-normal text-gray-500 mt-0.5">Custom quote</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {COMPARISON_DATA.map((cat, catIdx) => (
                          <>
                            {/* Category Header Row */}
                            <tr key={`cat-${catIdx}`} className="border-t border-b border-gray-150 bg-gray-50/40">
                              <td
                                className="py-2.5 px-6 text-xs font-bold text-[#9d00ff] uppercase tracking-wider bg-[#9d00ff]/5"
                              >
                                {cat.category}
                              </td>
                              <td className="bg-transparent" />
                              <td className="bg-[#9d00ff]/[0.03]" />
                              <td className="bg-transparent" />
                            </tr>

                            {/* Category Feature Rows */}
                            {cat.rows.map((row, rowIdx) => (
                              <tr
                                key={`row-${catIdx}-${rowIdx}`}
                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                              >
                                <td className="py-3.5 px-6 text-sm font-medium text-gray-800">
                                  {row.feature}
                                </td>
                                <td className="py-3.5 px-6 text-center">
                                  {renderTableCell(row.engage)}
                                </td>
                                <td className="py-3.5 px-6 text-center bg-[#9d00ff]/[0.03]">
                                  {renderTableCell(row.grow)}
                                </td>
                                <td className="py-3.5 px-6 text-center">
                                  {renderTableCell(row.scale)}
                                </td>
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footnote matching PDF */}
                  <div className="p-4 sm:p-5 bg-gray-50/80 border-t border-gray-150 text-xs text-gray-500 text-center font-normal">
                    Agentic workflows, custom agents, 24/7 support with SLA, and extra onboarding are available as{" "}
                    <a
                      href="#addons"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById("addons");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="text-[#9d00ff] font-bold underline hover:text-[#7c3aed] cursor-pointer"
                    >
                      add-ons
                    </a>{" "}
                    on Engage and Grow.
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* ─── Section 4: How it works (Page 4 of PDF) ─────────────── */}
          <section className="py-16 md:py-20 bg-white border-t border-b border-border/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedSection>
                <div className="mb-12">
                  <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                    How it works
                  </h2>
                </div>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STEPS.map((step, index) => (
                  <AnimatedSection key={step.num} delay={index * 0.1}>
                    <div className="h-full rounded-2xl border border-border/70 bg-[#fafafd] p-7 transition-all hover:border-[#9d00ff]/40 hover:shadow-md">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9d00ff] to-[#7c3aed] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-[#9d00ff]/30">
                          {step.num}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* ─── Common questions (FAQs - 6 Questions) ───────────────── */}
              <AnimatedSection delay={0.2}>
                <div className="mt-20 pt-16 border-t border-gray-150">
                  <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                      Common questions
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {FAQS.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-200/80 bg-white p-6 hover:border-[#9d00ff]/40 transition-all shadow-xs"
                      >
                        <h3 className="text-base font-bold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* ─── Section 5: Get a quote sized to your business (Bottom CTA Banner) ─── */}
          <section className="py-16 md:py-24 bg-[#fafafd]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedSection>
                <div className="rounded-3xl bg-gradient-to-br from-[#7c3aed] via-[#9d00ff] to-[#d90086] p-8 sm:p-12 md:p-14 text-center text-white shadow-2xl shadow-[#9d00ff]/30 relative overflow-hidden">
                  {/* Decorative background blurs matching logo colors */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#d90086]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#531def]/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                  <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                      Get a quote sized to your business
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 mb-9 font-normal">
                      Start with a free AI audit or a live demo. No commitment.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5">
                      <Button
                        asChild
                        size="lg"
                        className="bg-white hover:bg-white/95 text-[#9d00ff] font-bold px-7 py-3 h-12 rounded-xl shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.3)] active:scale-100 active:translate-y-0"
                      >
                        <Link to="/services/ai-strategy-audit">Get a free AI audit</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-2 border-white/70 text-white bg-white/10 hover:bg-white hover:text-[#9d00ff] hover:border-white font-bold px-7 py-3 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.25)] active:scale-100 active:translate-y-0"
                      >
                        <Link to="/book-demo">Book a live demo</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-2 border-white/70 text-white bg-white/10 hover:bg-white hover:text-[#9d00ff] hover:border-white font-bold px-7 py-3 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.25)] active:scale-100 active:translate-y-0"
                      >
                        <Link to="/contact-us">Get a custom quote</Link>
                      </Button>
                    </div>
                  </div>
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

export default Pricing;
