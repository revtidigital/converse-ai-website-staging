import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/submitContactForm";
import { usePartialLeadCapture } from "@/lib/usePartialLeadCapture";
import { generateAuditReportPdf, uint8ToBase64, downloadPdf, type AuditInput } from "@/lib/auditReport";
import { trackFormError, trackFormStart, trackFormSubmitClick, trackFormSuccess, trackFormView } from "@/lib/tracking";

const industries = [
  "D2C & E-commerce",
  "B2B SaaS",
  "BFSI / Fintech",
  "Healthcare",
  "Real Estate",
  "Manufacturing",
  "Education / EdTech",
  "Professional Services",
  "Other",
];

const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"];
const revenueBands = ["< $1M", "$1M–$5M", "$5M–$50M", "$50M+", "Prefer not to say"];
const regions = ["India", "United States", "Middle East", "Europe", "Global / Other"];

const painPoints = [
  "Missing calls / leads",
  "Slow or overloaded support",
  "Repetitive back-office work",
  "Weak sales pipeline",
  "Slow onboarding / messy SOPs",
  "Document & knowledge overload",
  "Manual reporting / data entry",
];

const departments = ["Sales", "Customer Support", "Operations", "Finance", "HR", "Marketing"];

const aiMaturityOptions = [
  "Nothing yet — exploring",
  "Casual use (ChatGPT / Copilot)",
  "A few AI tools in use",
  "Ran pilots but no clear ROI",
];

const dataReadinessOptions = [
  "Scattered across tools & spreadsheets",
  "Partly organized",
  "Well-organized (CRM / database)",
];

const timelines = ["ASAP", "Next 3 months", "6–12 months", "Just researching"];
const budgetBands = ["Not sure yet", "Under $5K", "$5K–$25K", "$25K–$100K", "$100K+"];
const complianceOptions = ["DPDP (India)", "GDPR", "HIPAA", "SOC 2", "None / Not sure"];

const trustPoints = [
  { icon: Clock, text: "Tailored proposal within 48 hours" },
  { icon: ShieldCheck, text: "No obligation — audit fee credited to your first build" },
  { icon: CheckCircle, text: "Reviewed by engineers who ship AI, not junior analysts" },
];

const FORM_ID = "ai_readiness_audit_intake";
const FORM_LOC = "ai_strategy_audit_intake_page";

const toggle = (arr: string[], value: string) =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

const AIAuditIntake = () => {
  const { toast } = useToast();

  // contact
  const capturePartialLead = usePartialLeadCapture("Partial Lead – AI Audit Intake");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  // company profile
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [revenue, setRevenue] = useState("");
  const [region, setRegion] = useState("");

  // current state
  const [pains, setPains] = useState<string[]>([]);
  const [depts, setDepts] = useState<string[]>([]);
  const [aiMaturity, setAiMaturity] = useState("");

  // readiness
  const [dataReadiness, setDataReadiness] = useState("");
  const [tools, setTools] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [compliance, setCompliance] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackFormView(FORM_ID, { form_location: FORM_LOC });
  }, []);

  const startedRef = useState(false);
  const handleFirstInput = () => {
    if (!startedRef[0]) {
      startedRef[1](true);
      trackFormStart(FORM_ID, { form_location: FORM_LOC });
    }
  };

  const buildMessage = () =>
    [
      `— AI Readiness Audit intake —`,
      `Company: ${company || "N/A"}`,
      `Role: ${role || "N/A"}`,
      `Industry: ${industry || "N/A"}`,
      `Team size: ${teamSize || "N/A"}`,
      `Revenue: ${revenue || "N/A"}`,
      `Region: ${region || "N/A"}`,
      `Pain points: ${pains.length ? pains.join(", ") : "N/A"}`,
      `Departments affected: ${depts.length ? depts.join(", ") : "N/A"}`,
      `Current AI use: ${aiMaturity || "N/A"}`,
      `Data readiness: ${dataReadiness || "N/A"}`,
      `Current tools/stack: ${tools || "N/A"}`,
      `Budget: ${budget || "N/A"}`,
      `Timeline: ${timeline || "N/A"}`,
      `Compliance: ${compliance.length ? compliance.join(", ") : "N/A"}`,
      `Notes: ${notes || "N/A"}`,
    ].join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmitClick(FORM_ID, { form_location: FORM_LOC });

    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      trackFormError(FORM_ID, "invalid_email", { form_location: FORM_LOC });
      toast({ title: "Valid work email required", description: "Enter a valid email so we can send your proposal.", variant: "destructive" });
      return;
    }
    if (!company.trim()) {
      toast({ title: "Company required", description: "Please enter your company name.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const auditInput: AuditInput = {
      fullName: fullName.trim(),
      email: email.trim(),
      company: company.trim(),
      role,
      industry,
      teamSize,
      revenue,
      region,
      pains,
      depts,
      aiMaturity,
      dataReadiness,
      tools,
      budget,
      timeline,
      compliance,
      notes,
    };

    // Build the branded PDF report. Never block lead capture if this fails.
    const extraFields: Record<string, string> = {};
    try {
      const bytes = await generateAuditReportPdf(auditInput);
      const filename = `AI-Readiness-Report-${company.trim().replace(/[^a-z0-9]+/gi, "-") || "ConverseAI"}.pdf`;
      downloadPdf(bytes, filename); // instant copy for the visitor
      extraFields.pdf_base64 = uint8ToBase64(bytes);
      extraFields.pdf_filename = filename;
      extraFields.report_recipient = email.trim();
    } catch {
      // PDF generation failed — continue so the lead is still captured.
    }

    try {
      await submitContactForm({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        countryName: region,
        product: "AI Readiness Audit",
        subject: `AI Readiness Audit request — ${company.trim()}`,
        message: buildMessage(),
        form_source: "AI Readiness Audit Intake",
        extraFields,
      });
      trackFormSuccess(FORM_ID, { form_location: FORM_LOC });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      trackFormError(FORM_ID, "submission_failed", { form_location: FORM_LOC });
      toast({ title: "Submission failed", description: "Please try again or book a discovery call instead.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    "h-12 w-full rounded-md border border-input bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-semibold text-foreground mb-2";

  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
        active ? "bg-primary text-white border-primary" : "bg-white/70 text-muted-foreground border-border hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <Helmet>
        <title>Start Your AI Readiness Audit | ConverseAI</title>
        <meta
          name="description"
          content="Tell us about your business and get a tailored AI Readiness Audit proposal within 48 hours. Fixed-fee, credited toward your first build."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://theconverseai.com/services/ai-strategy-audit/start" />
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative pt-16 pb-10 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="container-tight relative z-10 py-8">
              <AnimatedSection>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">AI Strategy &amp; Readiness Audit</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 max-w-3xl">
                  Start your audit — get a proposal in 48 hours
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  Answer a few questions about your business. We&apos;ll review it and send a tailored audit proposal within two
                  business days. Takes about 3 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  {trustPoints.map((t) => (
                    <div key={t.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <t.icon className="w-4 h-4 text-primary" />
                      {t.text}
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight max-w-3xl">
              {submitted ? (
                <AnimatedSection>
                  <div className="glass-card rounded-3xl p-10 text-center border border-primary/10">
                    <CheckCircle className="w-14 h-14 text-primary mx-auto mb-5" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Your AI Readiness Report is ready.</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                      Thanks{fullName ? `, ${fullName.split(" ")[0]}` : ""} — your personalized report just downloaded, and a copy
                      is on its way to <span className="font-semibold text-foreground">{email}</span>. Our team will follow up
                      with a tailored proposal within 48 hours.
                    </p>
                    <Link to="/services/ai-strategy-audit">
                      <Button variant="hero-outline" size="lg">
                        Back to audit overview <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </AnimatedSection>
              ) : (
                <AnimatedSection>
                  <form onSubmit={handleSubmit} onChange={handleFirstInput} className="space-y-10">
                    {/* About you */}
                    <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/60 bg-white/80">
                      <h2 className="text-xl font-semibold mb-5">About you</h2>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Full name *</label>
                          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="h-12 bg-white/80" />
                        </div>
                        <div>
                          <label className={labelClass}>Work email *</label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => capturePartialLead(email, { fullName, phone })} placeholder="you@company.com" className="h-12 bg-white/80" />
                        </div>
                        <div>
                          <label className={labelClass}>Company name *</label>
                          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="h-12 bg-white/80" />
                        </div>
                        <div>
                          <label className={labelClass}>Phone (optional)</label>
                          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 / +1 …" className="h-12 bg-white/80" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Your role (optional)</label>
                          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder, COO, Head of CX" className="h-12 bg-white/80" />
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/60 bg-white/80">
                      <h2 className="text-xl font-semibold mb-5">Your company</h2>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Industry</label>
                          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Team size</label>
                          <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {teamSizes.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Annual revenue</label>
                          <select value={revenue} onChange={(e) => setRevenue(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {revenueBands.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Region</label>
                          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {regions.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Where you are today */}
                    <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/60 bg-white/80">
                      <h2 className="text-xl font-semibold mb-5">Where you are today</h2>
                      <div className="mb-6">
                        <label className={labelClass}>Biggest pain points (pick any)</label>
                        <div className="flex flex-wrap gap-2">
                          {painPoints.map((p) => (
                            <Pill key={p} active={pains.includes(p)} onClick={() => setPains(toggle(pains, p))}>{p}</Pill>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className={labelClass}>Which teams are affected?</label>
                        <div className="flex flex-wrap gap-2">
                          {departments.map((d) => (
                            <Pill key={d} active={depts.includes(d)} onClick={() => setDepts(toggle(depts, d))}>{d}</Pill>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>How much AI do you use today?</label>
                        <select value={aiMaturity} onChange={(e) => setAiMaturity(e.target.value)} className={selectClass}>
                          <option value="">Select…</option>
                          {aiMaturityOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Readiness */}
                    <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/60 bg-white/80">
                      <h2 className="text-xl font-semibold mb-5">Readiness &amp; scope</h2>
                      <div className="grid sm:grid-cols-2 gap-5 mb-6">
                        <div>
                          <label className={labelClass}>How organized is your data?</label>
                          <select value={dataReadiness} onChange={(e) => setDataReadiness(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {dataReadinessOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Timeline</label>
                          <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {timelines.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Budget range (optional)</label>
                          <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectClass}>
                            <option value="">Select…</option>
                            {budgetBands.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Main tools / systems (optional)</label>
                          <Input value={tools} onChange={(e) => setTools(e.target.value)} placeholder="e.g. HubSpot, Zoho, Freshdesk" className="h-12 bg-white/80" />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className={labelClass}>Compliance needs (pick any)</label>
                        <div className="flex flex-wrap gap-2">
                          {complianceOptions.map((c) => (
                            <Pill key={c} active={compliance.includes(c)} onClick={() => setCompliance(toggle(compliance, c))}>{c}</Pill>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Anything else we should know? (optional)</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          placeholder="Context, goals, specific workflows you want to fix…"
                          className="w-full rounded-md border border-input bg-white/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3">
                      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting}>
                        {isSubmitting ? "Sending…" : "Submit — get my proposal in 48 hours"}
                        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        By submitting you agree to be contacted about your audit. We never share your details.
                      </p>
                    </div>
                  </form>
                </AnimatedSection>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AIAuditIntake;
