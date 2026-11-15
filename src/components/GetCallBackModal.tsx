import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { submitContactForm } from "@/lib/submitContactForm";
import { trackWhatsAppClick } from "@/lib/tracking";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, PhoneCall, Loader2, Sparkles, Clock, MessageSquare } from "lucide-react";

export interface GetCallBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: "banner_click" | "scroll";
}

const PRODUCTS_LIST = [
  "AI Chatbot for Website",
  "WhatsApp Shop & Commerce",
  "WhatsApp Marketing & Broadcast",
  "Live Chat & Unified Inbox",
  "AI Voice Agent",
] as const;

const SERVICES_LIST = [
  "Custom AI Agent Development",
  "Agentic Process Automation",
  "AI Integration Services",
  "Document & Knowledge Intelligence",
  "AI Strategy & Audit",
] as const;

const CALL_TIMES = [
  "As soon as possible (Within 15 mins)",
  "Morning (10 AM - 1 PM)",
  "Afternoon (1 PM - 5 PM)",
  "Evening (5 PM - 8 PM)",
] as const;

const WHATSAPP_NUMBER = "78913 31221";
const WHATSAPP_INTL = "917891331221";

const CALLBACK_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypv77s8_X0fl6xIjT0oKpmuK_eWA58r2e1dZxs2hbp0UsYtuFkL0Vakplporh7uH8q/exec";

export default function GetCallBackModal({
  isOpen,
  onClose,
  triggerSource = "banner_click",
}: GetCallBackModalProps) {
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryName, setCountryName] = useState("India");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [interestedIn, setInterestedIn] = useState<string>("");
  const [callTime, setCallTime] = useState<string>("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const lastCapturedSignatureRef = useRef<string>("");
  const isSubmittedRef = useRef(false);

  // Keep isSubmittedRef in sync
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  // Capture partial lead even if user closes or abandons without submitting
  const capturePartialLead = useCallback(() => {
    if (isSubmittedRef.current || isSubmitting) return;

    const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    const cleanEmail = (workEmail || "").trim();
    const cleanName = (fullName || "").trim();

    // Must have at least a phone number (>= 6 digits) or a typed email or name to be meaningful
    if (cleanPhone.length < 6 && !cleanEmail.includes("@") && !cleanName) {
      return;
    }

    const signature = `${cleanPhone}_${cleanEmail}_${cleanName}_${interestedIn}`;
    if (lastCapturedSignatureRef.current === signature) {
      return;
    }
    lastCapturedSignatureRef.current = signature;

    const formattedMessage = [
      `⚠️ PARTIAL LEAD / ABANDONED (User filled details but did not click submit)`,
      `📞 Preferred Call Time: ${callTime || "Not Specified"}`,
      companyName.trim() ? `🏢 Company: ${companyName.trim()}` : null,
      message.trim() ? `💬 Requirement: ${message.trim()}` : null,
      `🎯 Trigger Source: ${triggerSource}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    submitContactForm({
      fullName: cleanName || "Prospect (Partial Lead)",
      email: cleanEmail || `${cleanPhone || "visitor"}@partial.theconverseai.com`,
      phone: phone.trim(),
      countryName: countryName || "India",
      company: companyName.trim(),
      product: interestedIn || "Not Selected (Partial Lead)",
      subject: `⚠️ [Partial Lead - Abandoned] ${cleanName || phone.trim()} - Did Not Submit`,
      message: formattedMessage,
      form_source: `Get a Call Back (Partial - Abandoned)`,
      customScriptUrl: CALLBACK_SHEET_SCRIPT_URL,
      extraFields: {
        partial_lead: "true",
        send_user_email: "false",
        lead_type: "Partial Abandoned Lead",
        interested_in: interestedIn || "Not Selected (Partial)",
        preferred_call_time: callTime || "Not Specified",
        company_name: companyName.trim(),
        requirement: message.trim() || "User abandoned before submitting",
        trigger_source: triggerSource,
        target_google_sheet: "https://docs.google.com/spreadsheets/d/1ysfvoUo2pnQ_LNtTzayIyAtBAFgFD4fgXHNtt6JOuR8/edit?gid=0#gid=0",
      },
    }).catch((err) => {
      console.warn("Partial lead capture note:", err);
    });
  }, [phone, workEmail, fullName, interestedIn, callTime, companyName, message, triggerSource, countryName, isSubmitting]);

  // Capture partial lead if user closes modal or unloads page
  const handleModalClose = () => {
    if (!isSubmittedRef.current) {
      capturePartialLead();
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = () => {
      if (!isSubmittedRef.current) {
        capturePartialLead();
      }
    };

    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isOpen, capturePartialLead]);

  // Reset errors and submitted state when opened
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setErrors({});
    }
  }, [isOpen]);

  const handlePhoneChange = (val: string, country: string) => {
    setPhone(val || "");
    if (country) setCountryName(country);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = "Please enter your full name.";
    }

    if (!phone || phone.trim().length < 6) {
      errs.phone = "Please enter a valid phone number with country code.";
    }

    if (!interestedIn) {
      errs.interestedIn = "Please select what you are interested in.";
    }

    if (workEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
      errs.workEmail = "Please enter a valid email address.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedMessage = [
        `📞 Preferred Call Time: ${callTime || "As soon as possible"}`,
        companyName ? `🏢 Company: ${companyName}` : null,
        message.trim() ? `💬 Requirement: ${message.trim()}` : null,
        `🎯 Trigger Source: ${triggerSource === "scroll" ? "Auto Scroll past Hero Banner" : "Hero Banner CTA Click"}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      await submitContactForm({
        fullName: fullName.trim(),
        email: workEmail.trim() || `${phone.replace(/[^0-9]/g, "")}@callback.theconverseai.com`,
        phone: phone.trim(),
        countryName: countryName || "India",
        company: companyName.trim(),
        product: interestedIn,
        subject: `[Call Back Request] ${fullName.trim()} - ${interestedIn}`,
        message: formattedMessage,
        form_source: `Get a Call Back (${triggerSource})`,
        customScriptUrl: CALLBACK_SHEET_SCRIPT_URL,
        extraFields: {
          lead_type: "Call Back Request",
          interested_in: interestedIn,
          preferred_call_time: callTime || "As soon as possible",
          company_name: companyName.trim(),
          requirement: message.trim(),
          trigger_source: triggerSource,
          target_google_sheet: "https://docs.google.com/spreadsheets/d/1ysfvoUo2pnQ_LNtTzayIyAtBAFgFD4fgXHNtt6JOuR8/edit?gid=0#gid=0",
        },
      });

      setIsSubmitted(true);
      toast({
        title: "Call Back Request Received!",
        description: "Our AI solutions team will get in touch with you shortly.",
      });
    } catch (err) {
      console.error("Call back form submission error:", err);
      toast({
        title: "Submission Failed",
        description: "Please reach out to us directly on WhatsApp or try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && handleModalClose()}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border border-border shadow-2xl bg-card">
        {/* Top Gradient Header */}
        <div className="relative bg-gradient-to-r from-violet-600 via-primary to-fuchsia-600 p-6 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <DialogHeader className="text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold w-fit mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" /> Fast AI Consultation
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> Get a Call Back
            </DialogTitle>
            <DialogDescription className="text-white/90 text-sm mt-1">
              Connect directly with our AI specialists. We'll walk you through solutions built for your exact use case.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Request Received!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you, <strong>{fullName}</strong>. An AI consultant is reviewing your requirement and will call you at your preferred time.
            </p>
            <div className="pt-2">
              <Button onClick={onClose} className="rounded-xl px-6">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                onBlur={capturePartialLead}
                placeholder="e.g. Rahul Sharma"
                className={`rounded-xl h-10 ${errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* 2. Phone Number */}
            <div onBlur={capturePartialLead}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneInputField
                value={phone}
                onChange={handlePhoneChange}
                error={errors.phone}
                className="w-full"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* 3. Work Email & 4. Company Name (Grid 2 cols on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Work Email <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  type="email"
                  value={workEmail}
                  onChange={(e) => {
                    setWorkEmail(e.target.value);
                    if (errors.workEmail) setErrors((prev) => ({ ...prev, workEmail: "" }));
                  }}
                  onBlur={capturePartialLead}
                  placeholder="name@company.com"
                  className={`rounded-xl h-10 ${errors.workEmail ? "border-red-500" : ""}`}
                />
                {errors.workEmail && <p className="text-xs text-red-500 mt-1">{errors.workEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Company Name <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onBlur={capturePartialLead}
                  placeholder="e.g. TechNova"
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            {/* 5. Interested In (Products & Services - Grouped Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Interested In (Products & Services) <span className="text-red-500">*</span>
              </label>
              <Select
                value={interestedIn}
                onValueChange={(val) => {
                  setInterestedIn(val);
                  if (errors.interestedIn) setErrors((prev) => ({ ...prev, interestedIn: "" }));
                }}
              >
                <SelectTrigger className={`rounded-xl h-10 ${errors.interestedIn ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select product or service" />
                </SelectTrigger>
                <SelectContent className="max-h-64 z-[200] bg-white text-gray-900 border border-gray-200 shadow-2xl">
                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-primary uppercase tracking-wider">
                      📦 Products
                    </SelectLabel>
                    {PRODUCTS_LIST.map((prod) => (
                      <SelectItem key={prod} value={prod} className="text-sm cursor-pointer hover:bg-violet-50">
                        {prod}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-primary uppercase tracking-wider mt-2">
                      ⚙️ Agentic AI Services
                    </SelectLabel>
                    {SERVICES_LIST.map((serv) => (
                      <SelectItem key={serv} value={serv} className="text-sm cursor-pointer hover:bg-violet-50">
                        {serv}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.interestedIn && <p className="text-xs text-red-500 mt-1">{errors.interestedIn}</p>}
            </div>

            {/* 6. Preferred Call Time */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Preferred Call Time <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Select value={callTime} onValueChange={(val) => setCallTime(val)}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Select best time for a call" />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-white text-gray-900 border border-gray-200 shadow-2xl">
                  {CALL_TIMES.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption} className="text-sm cursor-pointer hover:bg-violet-50">
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 7. Message / Requirement */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                Your Message / Requirement <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={capturePartialLead}
                placeholder="Tell us a bit about your requirement, timeline, or current challenges..."
                className="rounded-xl min-h-[75px] text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-primary hover:from-violet-700 hover:to-primary/90 text-white font-semibold py-2.5 h-11 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" /> Request a Call Back
                </>
              )}
            </Button>

            {/* Direct WhatsApp Chat Strip */}
            <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Need an instant reply?
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Chat with us on WhatsApp: <strong className="font-semibold">+{WHATSAPP_NUMBER}</strong>
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent("Hi, I would like to request a call back regarding ConverseAI solutions.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs shrink-0 self-end sm:self-auto no-underline"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
