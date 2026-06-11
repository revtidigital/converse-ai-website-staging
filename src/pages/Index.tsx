import { Helmet } from "react-helmet-async";
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bot, MessageCircle, Smartphone, BarChart3, Users, Shield,
  Globe, Zap, ArrowRight, Star,
  Cpu, Mic, Network, FileText, TrendingUp, Target
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import ChatbotMockup from '@/components/ChatbotMockup'
import FeatureCard from '@/components/FeatureCard'
import SectionHeading from '@/components/SectionHeading'
import StatCard from '@/components/StatCard'
import Footer from '@/components/Footer'

const products = [
  { icon: Bot, title: 'AI Chatbot', description: 'Natural language understanding with 24/7 automated support, lead qualification, and smart handover to human agents.', path: '/chatbot' },
  { icon: MessageCircle, title: 'Live Chat', description: 'Real-time conversations with smart routing, AI-assisted replies, and persistent chat history.', path: '/live-chat' },
  { icon: Smartphone, title: 'WhatsApp AI', description: 'AI-driven WhatsApp automation with personalized, context-aware responses and multi-language support.', path: '/whatsapp-ai-chatbot' },
  { icon: Globe, title: 'Omni-Channel', description: 'Unified inbox across website, WhatsApp, social media, and email with seamless channel switching.', path: '/omni-channel' },
  { icon: BarChart3, title: 'Analytics Suite', description: 'Comprehensive agent, team, CSAT, and inbox reports with AI-generated insights and live monitoring.', path: '/agent-reports' },
  { icon: Users, title: 'Team Management', description: 'Agent capacity management, smart assignment, overload prevention, and team-based routing.', path: '/about-us' },
]

const stats = [
  { value: '1000+', label: 'Growing Businesses' },
  { value: '98%', label: 'WhatsApp Open Rate' },
  { value: '60%', label: 'Faster Response Times' },
  { value: '24/7', label: 'Always On Support' },
]

const services = [
  {
    icon: Target,
    title: 'AI Strategy & Readiness Audit',
    description: 'Map where AI can move the needle in your business. We scope the highest-value workflows, assess readiness, and give you a clear build plan — not a slide deck.',
    path: '/services/ai-strategy-readiness-audit',
  },
  {
    icon: Cpu,
    title: 'Agentic Systems & Process Automation',
    description: 'Replace manual, multi-step workflows with agents that reason, decide, and act. We build and run agentic pipelines that integrate with your existing stack.',
    path: '/services/agentic-systems-process-automation',
  },
  {
    icon: Mic,
    title: 'AI Voice Agents',
    description: 'Inbound and outbound voice AI for sales, support, and recruitment — multilingual, integrated with your CRM and telephony, and operated by us in production.',
    path: '/services/ai-voice-agents',
  },
  {
    icon: Bot,
    title: 'Custom AI Agent Development',
    description: 'Bespoke agents scoped to your exact problem. You own the IP. We build against your workflows, data, and systems — then keep it running.',
    path: '/services/custom-ai-agent-development',
  },
  {
    icon: Network,
    title: 'AI Integration Services',
    description: 'Connect AI to your CRM, ERP, helpdesk, or internal tools. We handle auth, error handling, and ongoing maintenance so your integrations stay live.',
    path: '/services/ai-integration-services',
  },
  {
    icon: FileText,
    title: 'Document & Knowledge Intelligence',
    description: 'Enterprise RAG systems that let your teams query internal knowledge, contracts, manuals, and reports — hosted in your own cloud, GDPR-compliant.',
    path: '/services/document-knowledge-intelligence',
  },
  {
    icon: TrendingUp,
    title: 'Sales Intelligence & Outreach',
    description: 'AI-driven prospecting and personalised outreach at scale. We identify intent signals, build the sequences, and run the campaigns — done-for-you.',
    path: '/services/sales-intelligence-outreach',
  },
]

const industries = [
  'E-commerce', 'EdTech', 'Real Estate', 'Insurance',
  'Logistics', 'Travel', 'Banking', 'Healthcare',
  'Hospitality', 'Automotive', 'SaaS'
]

export default function Index() {
  return (
    <>
      <Helmet>
        <title>AI Agents Built &amp; Run For Your Business | ConverseAI</title>
        <meta
          name="description"
          content="ConverseAI builds and runs custom AI agents — voice, WhatsApp, agentic workflows — for mid-market &amp; SMB teams. Book a free AI Opportunity Audit."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://www.theconverseai.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ConverseAI" />
        <meta property="og:url" content="https://www.theconverseai.com/" />
        <meta property="og:title" content="AI Agents Built &amp; Run For Your Business | ConverseAI" />
        <meta property="og:description" content="We scope the problem, build the AI agent, and run it in production — voice, WhatsApp, agentic workflows. No AI team required on your end." />
        <meta property="og:image" content="https://www.theconverseai.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ConverseAI — AI Agents Built &amp; Run For Your Business" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Agents Built &amp; Run For Your Business | ConverseAI" />
        <meta name="twitter:description" content="We scope the problem, build the AI agent, and run it in production. Voice, WhatsApp, agentic workflows. Book a free AI Opportunity Audit." />
        <meta name="twitter:image" content="https://www.theconverseai.com/og-image.png" />
        <meta name="geo.region" content="IN-RJ" />
        <meta name="geo.placename" content="Jaipur" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ConverseAI",
          "alternateName": "Converse AI",
          "url": "https://www.theconverseai.com",
          "logo": "https://www.theconverseai.com/logo.png",
          "foundingDate": "2021",
          "description": "ConverseAI builds custom AI agents — voice, WhatsApp, and agentic workflows — and runs them in production for mid-market and SMB teams. A product by Revti Digital.",
          "contactPoint": { "@type": "ContactPoint", "email": "contact@theconverseai.com", "contactType": "customer service", "availableLanguage": ["English", "Hindi"] },
          "address": { "@type": "PostalAddress", "addressLocality": "Jaipur", "addressRegion": "Rajasthan", "addressCountry": "IN" },
          "sameAs": ["https://linkedin.com/company/theconverseai", "https://youtube.com/@theconverseai", "https://instagram.com/theconverseai/", "https://facebook.com/61564130560658/"],
          "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 5 }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ConverseAI",
          "url": "https://www.theconverseai.com",
          "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://www.theconverseai.com/?s={search_term_string}" }, "query-input": "required name=search_term_string" }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">

        {/* ── Hero ── */}
        <section
          className="relative min-h-screen pt-8 pb-16 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" aria-hidden="true" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet/10 rounded-full blur-3xl" aria-hidden="true" />

          <div className="container-tight relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">

              {/* Left — text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center lg:text-left"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" aria-hidden="true" />
                  AI-Powered Customer Engagement
                </span>
                <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  AI Conversations<br />
                  <span className="gradient-text">That Feel Human</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Automate, connect, and grow through intelligent conversations across every digital channel. One platform for chatbots, live chat, and WhatsApp automation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="https://theconverseai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: 'hero', size: 'xl' })}
                  >
                    Start Free Trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <Link to="/contact-us" className={buttonVariants({ variant: 'hero-outline', size: 'xl' })}>
                    Request a Demo
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-4">14-day free trial. No credit card required.</p>
              </motion.div>

              {/* Right — ChatbotMockup */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative lg:pl-8"
              >
                <ChatbotMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-16 bg-secondary/30 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Products ── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Products"
              title="Everything You Need to Engage Customers"
              description="From AI chatbots to WhatsApp commerce, we provide a complete suite of conversational tools for modern businesses."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <Link key={product.path} to={product.path} className="no-underline">
                  <FeatureCard {...product} index={i} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI & Agentic Services ── */}
        <section className="py-24 bg-secondary/30 border-y border-border relative overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet/5 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="AI & Agentic AI Services"
              title="We Build the Agent. We Run It Too."
              description="Tell us the problem — we scope it, build the AI agent, deploy it, and keep it working in production. No platform to babysit. No AI team required on your end."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((service, i) => (
                <motion.a
                  key={service.path}
                  href={`https://www.theconverseai.com${service.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group glass-card p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline block"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all">
                    <service.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                </motion.a>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-6 text-base">
                Not sure where to start? A free AI Opportunity Audit maps the right workflow, channel, and build approach for your business.
              </p>
              <a
                href="https://www.theconverseai.com/book-demo"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'hero', size: 'xl' })}
              >
                Book a Free AI Opportunity Audit <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Why ConverseAI ── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <SectionHeading
              label="Why ConverseAI"
              title="Built for Businesses That Care About Their Customers"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {[
                  { icon: Zap, title: 'Context-Aware AI', text: 'Our chatbot understands intent, context, and sentiment — not just keywords.' },
                  { icon: Shield, title: 'Enterprise Security', text: 'GDPR, HIPAA, and SOC 2 compliant. Your data is always secure.' },
                  { icon: Globe, title: 'Multi-Language', text: 'Real-time translation across 100+ languages. Serve global customers natively.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8"
              >
                <div className="flex items-center gap-2 mb-4" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-4 italic">
                  "Our response times dropped by 60% after implementing ConverseAI. The AI chatbot handles most queries automatically, and the handover to our team is seamless."
                </p>
                <div>
                  <p className="font-semibold text-foreground">Sarah Kumar</p>
                  <p className="text-sm text-muted-foreground">Head of Customer Success, TechFlow Inc.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Industries ── */}
        <section className="py-24 bg-secondary/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Industries"
              title="Trusted Across Industries"
              description="From e-commerce to healthcare, ConverseAI powers customer engagement for businesses of all sizes."
            />
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((industry) => (
                <motion.span
                  key={industry}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="px-5 py-2.5 bg-white border border-border rounded-full text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors cursor-default"
                >
                  {industry}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Clients ── (hidden for now)
        <UserSection /> */}

        {/* ── Final CTA ── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg" aria-hidden="true" />
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Customer Engagement?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join 1000+ businesses already using ConverseAI to deliver exceptional customer experiences.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://theconverseai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary font-semibold px-8 py-3.5 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all no-underline inline-flex items-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <Link
                  to="/contact-us"
                  className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all no-underline"
                >
                  Talk to Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
