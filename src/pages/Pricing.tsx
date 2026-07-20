import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePricingPlans } from "@/hooks/usePricingPlans";

const Pricing = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { data: plans, loading, error } = usePricingPlans();

  return (
    <>
      <Helmet>
        <title>Simple Pricing | ConverseAI</title>
        <meta name="description" content="Choose the ConverseAI pricing plan that fits your business. Upgrade anytime." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://theconverseai.com/pricing" />
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-violet/5 to-background pt-16 pb-28 md:pt-20 md:pb-32">
            <div className="container-tight relative z-10 text-center">
              <AnimatedSection>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                  Simple <span className="gradient-text">Pricing</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                  Choose the plan that fits your business. Upgrade anytime.
                </p>
                <div className="inline-flex rounded-full border border-border/70 bg-white p-1 shadow-sm">
                  {(["monthly", "yearly"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBilling(option)}
                      className={cn(
                        "rounded-full px-6 py-2 text-sm font-semibold capitalize transition-colors",
                        billing === option ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="-mt-20 pb-24">
            <div className="container-tight">
              {loading && <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />}
              {error && <p className="text-center text-muted-foreground">Unable to load pricing from the database. Showing saved defaults.</p>}
              <div className="grid gap-8 md:grid-cols-3">
                {plans.map((plan, index) => {
                  const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                  return (
                    <AnimatedSection key={plan.id} delay={index * 0.08}>
                      <article
                        className={cn(
                          "relative flex h-full flex-col rounded-3xl border bg-white p-8 shadow-xl shadow-black/5",
                          plan.popular ? "border-primary ring-1 ring-primary" : "border-border/70",
                        )}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-5 py-1 text-sm font-semibold text-primary-foreground">
                            Most Popular
                          </span>
                        )}
                        <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                        <p className="mt-3 min-h-12 text-muted-foreground">{plan.description}</p>
                        <div className="mt-6 flex items-end gap-1">
                          <span className="text-4xl font-bold tracking-tight text-foreground">Custom</span>
                          <span className="pb-2 text-muted-foreground">bespoke to your scope</span>
                        </div>
                        <ul className="mt-8 flex-1 space-y-4">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex gap-3 text-foreground">
                              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="mt-8 h-12 rounded-xl text-base font-semibold" asChild>
                          <a href="/book-demo">Get Started</a>
                        </Button>
                      </article>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
