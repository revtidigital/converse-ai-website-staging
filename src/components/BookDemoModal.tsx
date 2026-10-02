import React, { useState, useEffect } from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { submitContactForm } from "@/lib/submitContactForm";
import { usePartialLeadCapture } from "@/lib/usePartialLeadCapture";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Sparkles, Send } from "lucide-react";

export interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

const ADDON_OPTIONS = [
  { value: "none", label: "No add-on (Core plan only)" },
  { value: "voice-agents", label: "AI Voice Agents (Inbound & Outbound)" },
  { value: "agentic-automation", label: "Agentic Systems & Process Automation" },
  { value: "custom-ai-agents", label: "Custom AI Agent Development" },
  { value: "api-integrations", label: "API Integrations (CRM, ERP, Helpdesk)" },
  { value: "knowledge-intelligence", label: "Document & Knowledge Intelligence (Private RAG)" },
  { value: "sales-ai", label: "Sales Intelligence & Outreach" },
  { value: "ai-strategy-audit", label: "AI Strategy & Readiness Audit" },
  { value: "support-expansion", label: "24/7 Support with SLA & Dedicated Onboarding" },
  { value: "multiple", label: "Multiple Add-ons / Custom Scope" },
];

const PLAN_OPTIONS = [
  { value: "Engage", label: "Engage Plan (Launch first AI agent)" },
  { value: "Grow", label: "Grow Plan (Most Popular)" },
  { value: "Scale", label: "Scale Plan (Full custom & ERP)" },
  { value: "Unsure", label: "Not sure / Need sizing assistance" },
];

export const BookDemoModal: React.FC<BookDemoModalProps> = ({
  isOpen,
  onClose,
  initialPlan = "Grow",
}) => {
  const { toast } = useToast();
  const capturePartialLead = usePartialLeadCapture("Partial Lead – Pricing Demo Popup");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryName, setCountryName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedAddon, setSelectedAddon] = useState("none");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleClose = () => {
    onClose();
    // Reset form after exit animation completes
    setTimeout(() => {
      setIsSubmitted(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setErrors({});
      setSelectedAddon("none");
    }, 250);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid business email";
    }
    if (!phone || phone.trim().length < 5) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Please complete required fields",
        description: Object.values(errors)[0] || "Check required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const addonLabel =
        ADDON_OPTIONS.find((opt) => opt.value === selectedAddon)?.label || selectedAddon;

      await submitContactForm({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        countryName: countryName || "N/A",
        product: `Live Demo: ${selectedPlan} Plan (Add-on: ${addonLabel})`,
        subject: `Live Demo Request - ${selectedPlan} Plan`,
        message: message.trim() || "Requested live demo from Pricing page popup.",
        form_source: "Pricing Page - Book Demo Popup",
        extraFields: {
          plan: selectedPlan,
          addon: addonLabel,
        },
      });

      setIsSubmitted(true);
      toast({
        title: "Demo Request Submitted!",
        description: "Our AI specialists will be in touch with you shortly.",
      });
    } catch {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please reach out via WhatsApp or email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full p-6 sm:p-7 rounded-2xl bg-white border border-gray-150 shadow-2xl max-h-[92vh] overflow-y-auto z-50">
        {!isSubmitted ? (
          <>
            <DialogHeader className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9d00ff]/10 text-[#9d00ff] text-xs font-bold w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Interactive Demo</span>
              </div>
              <DialogTitle className="text-2xl font-extrabold text-gray-950 tracking-tight">
                Book a Live Demo
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 font-normal">
                See our conversational and agentic AI agents live in action on your workflows. No commitment.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-3" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-800">
                  Full Name <span className="text-[#9d00ff]">*</span>
                </label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`h-11 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-sm text-gray-900 ${
                    errors.name ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
              </div>

              {/* Work Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-800">
                  Business / Work Email <span className="text-[#9d00ff]">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  onBlur={() => {
                    if (email.trim().includes("@")) {
                      capturePartialLead(email.trim(), {
                        fullName,
                        phone,
                        plan: selectedPlan,
                        addon: selectedAddon,
                      });
                    }
                  }}
                  className={`h-11 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-sm text-gray-900 ${
                    errors.email ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-800">
                  Phone Number <span className="text-[#9d00ff]">*</span>
                </label>
                <PhoneInputField
                  value={phone}
                  onChange={(val, country) => {
                    setPhone(val);
                    setCountryName(country);
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  error={errors.phone}
                  variant="bordered"
                  className="rounded-xl"
                />
              </div>

              {/* Grid: Plan & Add-ons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Plan Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-800">Interested Plan</label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50/70 border-gray-200 text-xs text-gray-900 font-medium focus:ring-[#9d00ff] focus:border-[#9d00ff]">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[60]">
                      {PLAN_OPTIONS.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value} className="text-xs py-2">
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add-ons Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-800">
                    Select Add-on <span className="text-[#9d00ff]">*</span>
                  </label>
                  <Select value={selectedAddon} onValueChange={setSelectedAddon}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50/70 border-gray-200 text-xs text-gray-900 font-medium focus:ring-[#9d00ff] focus:border-[#9d00ff]">
                      <SelectValue placeholder="Choose an add-on" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[60] max-h-60">
                      {ADDON_OPTIONS.map((addon) => (
                        <SelectItem key={addon.value} value={addon.value} className="text-xs py-2">
                          {addon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-800">
                  Project details or workflows to demo (Optional)
                </label>
                <Textarea
                  placeholder="e.g. Want to connect inbound voice calls with our HubSpot CRM, handle multilingual WhatsApp queries..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs resize-none"
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#9d00ff] hover:bg-[#8800e0] text-white font-bold h-12 rounded-xl shadow-md shadow-[#9d00ff]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_12px_35px_-8px_rgba(157,0,255,0.5)] active:scale-100 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking your demo...</span>
                  </>
                ) : (
                  <>
                    <span>Book Your Live Demo</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-gray-400 text-center font-normal pt-1">
                🔒 Enterprise data isolation (GDPR & CCPA compliant). No spam, guaranteed.
              </p>
            </form>
          </>
        ) : (
          /* ─── Success Confirmation Screen ─── */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#9d00ff]/10 text-[#9d00ff] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-gray-950 tracking-tight">
                Demo Request Confirmed!
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-gray-900">{fullName}</span>. Our AI solution architects will review your requirements for the{" "}
                <span className="font-semibold text-[#9d00ff]">{selectedPlan} plan</span> and contact you shortly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-150 text-xs text-gray-600 max-w-sm mx-auto text-left space-y-1">
              <p>
                <span className="font-bold text-gray-800">Email:</span> {email}
              </p>
              <p>
                <span className="font-bold text-gray-800">Phone:</span> {phone}
              </p>
              <p>
                <span className="font-bold text-gray-800">Add-on:</span>{" "}
                {ADDON_OPTIONS.find((o) => o.value === selectedAddon)?.label}
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="bg-[#9d00ff] hover:bg-[#8800e0] text-white font-bold px-8 h-11 rounded-xl shadow-md transition-all mt-2"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookDemoModal;
