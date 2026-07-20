import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  MessageSquare,
  Radio,
  Reply,
  Filter,
  Bot,
  MessageCircle,
  Users,
  BarChart2,
  FileText,
  CheckCircle2,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";
import { useCaseStudy, useCaseStudies } from "@/hooks/useCaseStudies";
import { DEFAULT_OG_IMAGE_URL } from "@/lib/seo";

/* ─── Feature → icon mapping ─────────────────────────────── */
const featureIcons: Record<string, React.ReactNode> = {
  "WhatsApp AI Chatbot": <Bot className="w-5 h-5" />,
  "Conversational AI Chatbot": <Bot className="w-5 h-5" />,
  "WhatsApp Marketing": <Radio className="w-5 h-5" />,
  "WhatsApp Broadcast": <Radio className="w-5 h-5" />,
  "Live Chat": <MessageCircle className="w-5 h-5" />,
  "Omni-Channel": <MessageSquare className="w-5 h-5" />,
  "Shared Team Inbox": <MessageSquare className="w-5 h-5" />,
  "CSAT Report": <BarChart2 className="w-5 h-5" />,
  "Agent Reports": <BarChart2 className="w-5 h-5" />,
  "Team Reports": <Users className="w-5 h-5" />,
  "Pre-Chat Forms": <FileText className="w-5 h-5" />,
  "Basic Automations": <Zap className="w-5 h-5" />,
  "Quick Replies": <Reply className="w-5 h-5" />,
  Segmentation: <Filter className="w-5 h-5" />,
};

/* ─── Social share helpers ────────────────────────────────── */
const shareLinks = (url: string, title: string) => ({
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
});

/* ─── Component ───────────────────────────────────────────── */
const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: caseStudy, loading, error } = useCaseStudy(slug);
  const { data: allCaseStudies } = useCaseStudies();

  useEffect(() => {
    if (!loading && !error && !caseStudy) {
      navigate("/case-studies", { replace: true });
    }
  }, [caseStudy, loading, error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!caseStudy) return null;

  const otherStudies = allCaseStudies.filter((cs) => cs.slug !== slug).slice(0, 2);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://theconverseai.com/case-studies/${caseStudy.slug}`;

  const links = shareLinks(pageUrl, caseStudy.tagline);

  /* Table of Contents entries */
  const tocEntries = [
    { label: "The Challenge", id: "cs-challenge" },
    { label: "The Solution", id: "cs-solution" },
    ...caseStudy.sections.map((s, i) => ({ label: s.title, id: `cs-section-${i}` })),
    { label: "Business Impact & Results", id: "cs-outcome" },
  ];

  return (
    <>
      <Helmet>
        <title>{`${caseStudy.company} Case Study | ConverseAI`}</title>
        <meta name="description" content={caseStudy.excerpt} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${caseStudy.company} | ConverseAI Case Study`} />
        <meta property="og:description" content={caseStudy.excerpt} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
        <link
          rel="canonical"
          href={`https://theconverseai.com/case-studies/${caseStudy.slug}`}
        />
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">

          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="gradient-cta text-white py-14 md:py-24">
            <div className="container-tight text-center">
              <Link
                to="/case-studies"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
                aria-label="Back to all case studies"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                All Case Studies
              </Link>

              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-4">
                Case Study
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-4xl mx-auto">
                {caseStudy.tagline}
              </h1>

              <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
                <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  {caseStudy.industry}
                </span>
                <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  {caseStudy.category}
                </span>
                <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  {caseStudy.readTime} · {caseStudy.publishedDate}
                </span>
              </div>
            </div>
          </section>

          {/* ── Use Case + Winning Features Card ──────────────── */}
          <AnimatedSection>
            <div className="container-tight py-8 md:py-10">
              <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-sm">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-primary/20">

                  {/* Use Case */}
                  <div className="bg-secondary p-8 text-center">
                    <h2 className="text-base font-bold text-primary mb-5 uppercase tracking-wide">
                      Use Case
                    </h2>
                    <ul className="space-y-2" aria-label="Use cases">
                      {caseStudy.useCase.map((uc) => (
                        <li key={uc} className="text-sm font-semibold text-gray-800">
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Winning Features */}
                  <div className="bg-secondary p-8">
                    <h2 className="text-base font-bold text-primary mb-5 uppercase tracking-wide text-center">
                      Winning Features
                    </h2>
                    <ul
                      className="flex flex-wrap gap-x-6 gap-y-4 justify-center"
                      aria-label="Features used"
                    >
                      {caseStudy.featuresUsed.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                        >
                          <span className="text-primary" aria-hidden="true">
                            {featureIcons[feature] ?? <CheckCircle2 className="w-5 h-5" />}
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Testimonial + Social Share ─────────────────────── */}
          <AnimatedSection delay={0.05}>
            <div className="container-tight pb-10 md:pb-12">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Testimonial */}
                <div className="bg-secondary rounded-2xl p-7 flex flex-col justify-between">
                  <p className="text-base leading-relaxed text-gray-800 mb-6">
                    &ldquo;{caseStudy.testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    {caseStudy.testimonial.avatarUrl ? (
                      <img
                        src={caseStudy.testimonial.avatarUrl}
                        alt={caseStudy.testimonial.author}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                        aria-label={caseStudy.testimonial.author}
                        role="img"
                      >
                        {caseStudy.testimonial.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {caseStudy.testimonial.author}
                      </p>
                      <p className="text-xs text-gray-500">{caseStudy.testimonial.role}</p>
                    </div>
                  </div>
                </div>

                {/* Social Share */}
                <div className="bg-secondary rounded-2xl p-7 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">
                    Like what you see? Share it with a friend
                  </h3>
                  <ul className="flex gap-3" aria-label="Share on social media">
                    <li>
                      <a
                        href={links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on LinkedIn"
                        className="w-11 h-11 rounded-lg bg-[#0a66c2] hover:bg-[#004182] flex items-center justify-center text-white transition-colors"
                      >
                        <Linkedin className="w-5 h-5" aria-hidden="true" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Twitter / X"
                        className="w-11 h-11 rounded-lg bg-[#1d9bf0] hover:bg-[#0b7ecb] flex items-center justify-center text-white transition-colors"
                      >
                        <Twitter className="w-5 h-5" aria-hidden="true" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Facebook"
                        className="w-11 h-11 rounded-lg bg-[#1877f2] hover:bg-[#0a5bbd] flex items-center justify-center text-white transition-colors"
                      >
                        <Facebook className="w-5 h-5" aria-hidden="true" />
                      </a>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </AnimatedSection>

          {/* ── Table of Contents + Article ───────────────────── */}
          <div className="container-tight pb-16 md:pb-20">
            <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-14 items-start">

              {/* Table of Contents */}
              <aside aria-label="Table of contents">
                <div className="sticky top-28 rounded-2xl border border-border/60 overflow-hidden">
                  <div className="bg-muted/50 px-6 py-4 border-b border-border/60">
                    <h3 className="font-bold text-base text-foreground">Table of Contents</h3>
                  </div>
                  <nav>
                    <ul className="divide-y divide-border/40">
                      {tocEntries.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="block px-6 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors leading-snug"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>

              {/* Article Body */}
              <article className="space-y-10 min-w-0">

                {/* Excerpt / Intro */}
                <AnimatedSection>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {caseStudy.excerpt}
                  </p>
                </AnimatedSection>

                {/* Challenge */}
                <AnimatedSection>
                  <section id="cs-challenge" aria-labelledby="cs-challenge-heading">
                    <h2
                      id="cs-challenge-heading"
                      className="text-2xl font-bold text-foreground mb-4"
                    >
                      The Challenge
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{caseStudy.challenge}</p>
                  </section>
                </AnimatedSection>

                {/* Solution */}
                <AnimatedSection delay={0.05}>
                  <section id="cs-solution" aria-labelledby="cs-solution-heading">
                    <h2
                      id="cs-solution-heading"
                      className="text-2xl font-bold text-foreground mb-4"
                    >
                      The Solution
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{caseStudy.solution}</p>
                  </section>
                </AnimatedSection>

                {/* Detailed Sections */}
                {caseStudy.sections.map((section, i) => (
                  <AnimatedSection key={section.title} delay={i * 0.06}>
                    <section id={`cs-section-${i}`} aria-labelledby={`cs-section-${i}-heading`}>
                      <h3
                        id={`cs-section-${i}-heading`}
                        className="text-xl font-semibold text-foreground mb-3"
                      >
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </section>
                  </AnimatedSection>
                ))}

                {/* Outcome + Metrics */}
                <AnimatedSection>
                  <section id="cs-outcome" aria-labelledby="cs-outcome-heading">
                    <h2
                      id="cs-outcome-heading"
                      className="text-2xl font-bold text-foreground mb-4"
                    >
                      Business Impact & Results
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                      {caseStudy.outcome}
                    </p>

                    {/* Metrics Grid */}
                    <div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                      role="list"
                      aria-label="Key results"
                    >
                      {caseStudy.metrics.map((m) => (
                        <div
                          key={m.label}
                          role="listitem"
                          className="bg-primary/5 rounded-xl p-5 text-center border border-primary/10"
                        >
                          <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                            {m.value}
                          </div>
                          <div className="text-xs font-semibold text-foreground">{m.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 leading-snug">
                            {m.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </AnimatedSection>

              </article>
            </div>
          </div>

          {/* ── CTA Banner ────────────────────────────────────── */}
          <AnimatedSection>
            <div className="container-tight pb-16 md:pb-20">
              <div className="rounded-2xl gradient-cta p-8 md:p-10 text-white text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Ready to achieve similar results?
                </h2>
                <p className="text-white/80 text-sm md:text-base mb-6 max-w-xl mx-auto leading-relaxed">
                  Talk to our team and discover how ConverseAI can transform your customer
                  engagement.
                </p>
                <ContactFormDialog>
                  <Button
                    className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                    aria-label="Start your free trial"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Button>
                </ContactFormDialog>
              </div>
            </div>
          </AnimatedSection>

          {/* ── More Case Studies ──────────────────────────────── */}
          {otherStudies.length > 0 && (
            <section
              className="border-t border-border/40 py-16 md:py-20 bg-secondary/30"
              aria-labelledby="more-stories-heading"
            >
              <div className="container-tight">
                <AnimatedSection>
                  <h2
                    id="more-stories-heading"
                    className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center"
                  >
                    More Success Stories
                  </h2>
                </AnimatedSection>

                <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                  {otherStudies.map((cs, i) => (
                    <AnimatedSection key={cs.id} delay={i * 0.1}>
                      <article className="group glass-card-hover rounded-2xl overflow-hidden border border-border/50">
                        <div className="relative overflow-hidden h-44">
                          <img
                            src={cs.heroImage}
                            alt={`${cs.company} case study`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                            aria-hidden="true"
                          />
                          <div className="absolute bottom-3 left-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                              {cs.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground text-base mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {cs.tagline}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {cs.metrics.slice(0, 2).map((m) => (
                              <span
                                key={m.label}
                                className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                              >
                                {m.value} {m.label}
                              </span>
                            ))}
                          </div>
                          <Link
                            to={`/case-studies/${cs.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                            aria-label={`Read full case study: ${cs.company}`}
                          >
                            Read Story
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </article>
                    </AnimatedSection>
                  ))}
                </div>

                <AnimatedSection delay={0.2}>
                  <div className="text-center mt-10">
                    <Link to="/case-studies">
                      <Button variant="hero-outline" size="lg">
                        View All Case Studies
                        <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </AnimatedSection>
              </div>
            </section>
          )}

        </main>

        <Footer />
      </div>
    </>
  );
};

export default CaseStudyDetail;
