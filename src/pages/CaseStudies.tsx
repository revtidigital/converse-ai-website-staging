import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Building2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { useCaseStudies } from "@/hooks/useCaseStudies";

const categoryColors: Record<string, string> = {
  "WhatsApp Marketing": "bg-green-100 text-green-700",
  "AI Chatbot": "bg-primary/10 text-primary",
  "Omni-Channel": "bg-violet-100 text-violet-700",
};

const CaseStudies = () => {
  const { data: caseStudies, loading, error } = useCaseStudies();

  return (
    <>
      <Helmet>
        <title>Case Studies | Real Results with ConverseAI</title>
        <meta
          name="description"
          content="Explore how businesses across retail, edtech, and healthcare used ConverseAI to automate customer engagement, reduce costs, and drive measurable growth."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Case Studies | Real Results with ConverseAI" />
        <meta
          property="og:description"
          content="See how ConverseAI helped real businesses grow with AI chatbots, WhatsApp automation, and omnichannel support."
        />
        <link rel="canonical" href="https://theconverseai.com/case-studies" />
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          {/* Hero */}
          <section className="relative overflow-hidden py-20 md:py-28">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" aria-hidden="true" />
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet/10 rounded-full blur-3xl" aria-hidden="true" />

            <div className="container-tight relative z-10 text-center">
              <AnimatedSection>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" aria-hidden="true" />
                  Customer Success Stories
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Real businesses.{" "}
                  <span className="gradient-text">Real results.</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                  See how companies across industries use ConverseAI to automate
                  customer conversations, cut support costs, and drive growth.
                </p>

                {/* Aggregate stats */}
                <div
                  className="flex flex-wrap justify-center gap-8 md:gap-16"
                  role="list"
                  aria-label="Key statistics"
                >
                  {[
                    { value: "50M+", label: "Messages Automated" },
                    { value: "500+", label: "Businesses Served" },
                    { value: "94%", label: "Average CSAT Score" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center" role="listitem">
                      <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Case Study Cards */}
          <section className="pb-24">
            <div className="container-tight">
              {loading && (
                <div className="flex justify-center items-center py-24" aria-label="Loading case studies">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <p className="text-center text-muted-foreground py-24">
                  Unable to load case studies. Please try again later.
                </p>
              )}
              {!loading && !error && (
              <div className="grid gap-8 md:gap-10">
                {caseStudies.map((cs, index) => (
                  <AnimatedSection key={cs.id} delay={index * 0.1}>
                    <article className="group glass-card-hover rounded-2xl overflow-hidden border border-border/60 relative">
                      {/* Stretched link — makes the whole card clickable */}
                      <Link
                        to={`/case-studies/${cs.slug}`}
                        className="absolute inset-0 z-0 rounded-2xl"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <div className="md:flex">
                        {/* Image */}
                        <div className="md:w-2/5 relative overflow-hidden">
                          <img
                            src={cs.heroImage}
                            alt={`${cs.company} case study`}
                            className="w-full h-56 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:block hidden" aria-hidden="true" />
                        </div>

                        {/* Content */}
                        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                          <div>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[cs.category] ?? "bg-muted text-muted-foreground"}`}
                              >
                                <Tag className="w-3 h-3" aria-hidden="true" />
                                {cs.category}
                              </span>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                <Building2 className="w-3 h-3" aria-hidden="true" />
                                {cs.industry}
                              </span>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                              {cs.tagline}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                              {cs.excerpt}
                            </p>

                            {/* Metrics preview */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                              {cs.metrics.map((m) => (
                                <div
                                  key={m.label}
                                  className="bg-secondary/60 rounded-xl p-3 text-center"
                                  title={m.description}
                                >
                                  <div className="text-lg font-bold gradient-text leading-tight">{m.value}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                              {cs.readTime} · {cs.publishedDate}
                            </span>
                            <Link
                              to={`/case-studies/${cs.slug}`}
                              className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                              aria-label={`Read full case study: ${cs.company}`}
                            >
                              Read Case Study
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <AnimatedSection>
            <section className="py-20 md:py-24 bg-gradient-to-b from-background to-secondary/40">
              <div className="container-tight text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to be our next{" "}
                  <span className="gradient-text">success story?</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                  Join 500+ businesses that trust ConverseAI to power their
                  customer conversations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ContactFormDialog>
                    <Button variant="hero" size="xl" aria-label="Start your free trial">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </ContactFormDialog>
                  <Link to="/contact-us">
                    <Button variant="hero-outline" size="xl">
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </AnimatedSection>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CaseStudies;
