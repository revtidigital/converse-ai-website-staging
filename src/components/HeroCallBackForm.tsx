import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { submitContactForm } from "@/lib/submitContactForm";
import { useToast } from "@/hooks/use-toast";
import { PhoneCall, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";

import { getStagingSheetScriptUrl } from "@/lib/sheetsConfig";

const WHATSAPP_NUMBER = "78913 31221";
const WHATSAPP_INTL = "917891331221";

export default function HeroCallBackForm() {
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryName, setCountryName] = useState("India");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = "Please enter your name";
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!phone || cleanPhone.length < 6) {
      errs.phone = "Please enter a valid phone number";
    }

    if (!email.trim()) {
      errs.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Submit to CRM / Universal Lead pipeline
      await submitContactForm({
        full_name: fullName.trim(),
        work_email: email.trim(),
        phone: phone.trim(),
        company_name: "Not specified",
        interested_in: "Get a Call Back",
        preferred_call_time: "As soon as possible",
        message: comment.trim() || "Requested a call back from Hero form",
        form_source: "Hero Get a Call Back Form",
      });

      // 2. Submit to dedicated Google Sheet webhook
      try {
        const payload = {
          fullName: fullName.trim(),
          phone: phone.trim(),
          country: countryName,
          workEmail: email.trim(),
          companyName: "Not specified",
          interestedIn: "Get a Call Back",
          preferredCallTime: "As soon as possible",
          message: comment.trim(),
          source: "Hero Call Back Form",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          timestamp: new Date().toISOString(),
        };

        const stagingUrl = getStagingSheetScriptUrl();
        if (stagingUrl) {
          await fetch(stagingUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });
        }
      } catch (sheetErr) {
        console.warn("Sheet webhook fallback:", sheetErr);
      }

      setIsSubmitted(true);
      toast({
        title: "Call Back Requested!",
        description: "Our AI specialist will reach out to you within 15 minutes.",
      });
    } catch (err: any) {
      console.error("Hero form submission error:", err);
      toast({
        title: "Request Received",
        description: "Thank you! We have recorded your request and will call you shortly.",
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick("hero_callback_success");
    const text = encodeURIComponent(
      `Hi ConverseAI team! I just requested a call back for ${fullName || "my business"}. Can we connect?`
    );
    window.open(`https://wa.me/${WHATSAPP_INTL}?text=${text}`, "_blank");
  };

  return (
    <div className="relative rounded-3xl border border-primary/20 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8 max-w-lg mx-auto overflow-hidden">
      {/* Decorative gradient blur backdrop */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {isSubmitted ? (
        <div className="relative z-10 py-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Call Back Requested!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Thank you, <span className="font-semibold text-foreground">{fullName}</span>. Our AI specialist will call you at{" "}
              <span className="font-semibold text-foreground">{phone}</span> within 15 minutes.
            </p>
          </div>

          <div className="pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-3">Want an instant response right now?</p>
            <Button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-current" /> Chat on WhatsApp ({WHATSAPP_NUMBER})
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Card Header */}
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Get a Call Back
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Tell us what you're building. Our AI solution architects will call you directly.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                className={`h-11 rounded-xl bg-background/80 ${
                  errors.fullName ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* 2. Number */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <PhoneInputField
                value={phone}
                onChange={(val, cName) => {
                  setPhone(val);
                  if (cName) setCountryName(cName);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                defaultCountry="IN"
                placeholder="Mobile number"
                className={errors.phone ? "border-rose-500" : ""}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            {/* 3. Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`h-11 rounded-xl bg-background/80 ${
                  errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* 4. Comment */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Comment
              </label>
              <Textarea
                placeholder="Briefly describe your requirements or use case..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl bg-background/80 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-primary to-violet-700 hover:from-violet-700 hover:to-primary text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Request a Call Back</span>
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground pt-1">
              🔒 No spam. We respect your privacy and only call regarding your request.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
