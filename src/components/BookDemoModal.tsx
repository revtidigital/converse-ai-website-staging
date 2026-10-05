import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { CheckCircle2, Loader2, Sparkles, Send, Calendar, Clock, Globe, MessageSquare } from "lucide-react";

export interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

const PRICING_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4x6CxCI6qPiecvIYoHC7hmZh6lx_tdv2H5oieyY3hlZ8QtBeYPqeGEIYsVGBuK0phGA/exec";

const getTimezoneInfo = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzAbbr = parts.find((p) => p.type === "timeZoneName")?.value || "";

    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMin);
    const hrs = String(Math.floor(absMin / 60)).padStart(2, "0");
    const mins = String(absMin % 60).padStart(2, "0");
    const gmt = `GMT${sign}${hrs}:${mins}`;

    return {
      tz,
      abbr: tzAbbr,
      gmt,
      label: `${tz} (${tzAbbr || gmt})`,
    };
  } catch {
    return { tz: "UTC", abbr: "UTC", gmt: "GMT+00:00", label: "UTC" };
  }
};

const getMinDate = () => {
  const d = new Date();
  if (d.getHours() >= 18) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split("T")[0];
};

const getMaxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toISOString().split("T")[0];
};

const TIME_SLOTS = [
  "09:00 AM - 09:30 AM",
  "10:00 AM - 10:30 AM",
  "11:00 AM - 11:30 AM",
  "12:00 PM - 12:30 PM",
  "02:00 PM - 02:30 PM",
  "03:00 PM - 03:30 PM",
  "04:00 PM - 04:30 PM",
  "05:00 PM - 05:30 PM",
  "06:00 PM - 06:30 PM",
  "07:00 PM - 07:30 PM",
  "08:00 PM - 08:30 PM",
];

const ADDON_OPTIONS = [
  { value: "none", label: "No add-on (Core plan only)" },
  { value: "ai-voice-agents", label: "AI voice agents" },
  { value: "agentic-automation", label: "Agentic systems and automation" },
  { value: "custom-ai-agents", label: "Custom AI agent development" },
  { value: "api-integrations", label: "API integrations" },
  { value: "knowledge-intelligence", label: "Document and knowledge intelligence" },
  { value: "sales-ai", label: "Sales intelligence and outreach" },
  { value: "ai-strategy-audit", label: "AI strategy and readiness audit" },
  { value: "support-expansion", label: "Support and expansion" },
  { value: "multiple", label: "Multiple add-ons" },
];

const PLAN_OPTIONS = [
  { value: "Engage", label: "Engage Plan" },
  { value: "Grow", label: "Grow Plan (Most Popular)" },
  { value: "Scale", label: "Scale Plan" },
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
  const [demoDate, setDemoDate] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [userTz, setUserTz] = useState({ tz: "UTC", abbr: "UTC", gmt: "GMT+00:00", label: "UTC" });

  useEffect(() => {
    setUserTz(getTimezoneInfo());
  }, []);

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
    setTimeout(() => {
      setIsSubmitted(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setDemoDate("");
      setDemoTime("");
      setThoughts("");
      setErrors({});
      setSelectedAddon("none");
    }, 200);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.name = "Please enter your name";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid work email";
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

      const scheduleLabel = demoDate
        ? `${demoDate} at ${demoTime || "Flexible time"} (${userTz.label})`
        : "";

      const formattedMessage = [
        demoDate ? `📅 Preferred Demo: ${scheduleLabel}` : null,
        thoughts.trim() ? `💭 Share your thoughts: ${thoughts.trim()}` : null,
        message.trim() ? `🛠️ Workflows to demo / CRM: ${message.trim()}` : null,
      ].filter(Boolean).join("\n\n") || "Requested live demo via Pricing page popup modal.";

      await submitContactForm({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        countryName: countryName || "N/A",
        product: `Pricing Demo: ${selectedPlan} Plan (Add-on: ${addonLabel})`,
        subject: `Pricing Live Demo - ${selectedPlan} Plan`,
        message: formattedMessage,
        form_source: "Pricing Page - Book Demo Popup",
        customScriptUrl: PRICING_SHEET_SCRIPT_URL,
        extraFields: {
          plan: selectedPlan,
          addon: addonLabel,
          demo_date: demoDate,
          demo_time: demoTime,
          timezone: userTz.label,
          thoughts: thoughts.trim(),
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
      <DialogContent className="max-w-xl w-[94vw] sm:w-full p-5 sm:p-6 rounded-2xl bg-white border border-gray-150 shadow-2xl max-h-[90vh] overflow-y-auto z-[150]">
        {!isSubmitted ? (
          <>
            <DialogHeader className="space-y-1 text-left pb-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9d00ff]/10 text-[#9d00ff] text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  Live Interactive Demo
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                Book a Live Demo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 font-normal">
                See our conversational and agentic AI agents live in action on your workflows. No commitment.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1" noValidate>
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-gray-800">
                    Full Name <span className="text-[#9d00ff]">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs text-gray-900 ${
                      errors.name ? "border-destructive ring-1 ring-destructive" : ""
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-gray-800">
                    Business Email <span className="text-[#9d00ff]">*</span>
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
                    className={`h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs text-gray-900 ${
                      errors.email ? "border-destructive ring-1 ring-destructive" : ""
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-gray-800">
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

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-gray-800">Interested Plan</label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50/70 border-gray-200 text-xs text-gray-900 font-medium focus:ring-[#9d00ff] focus:border-[#9d00ff]">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[200]">
                      {PLAN_OPTIONS.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value} className="text-xs py-1.5">
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Add-on Dropdown */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-800">
                  Select Add-on <span className="text-[#9d00ff]">*</span>
                </label>
                <Select value={selectedAddon} onValueChange={setSelectedAddon}>
                  <SelectTrigger className="h-10 rounded-xl bg-gray-50/70 border-gray-200 text-xs text-gray-900 font-medium focus:ring-[#9d00ff] focus:border-[#9d00ff]">
                    <SelectValue placeholder="Choose an add-on" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[200] max-h-56">
                    {ADDON_OPTIONS.map((addon) => (
                      <SelectItem key={addon.value} value={addon.value} className="text-xs py-1.5">
                        {addon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4: Preferred Date & Time Slot with Timezone */}
              <div className="pt-1.5 border-t border-gray-150 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#9d00ff]" />
                    Preferred Date & Time <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] text-gray-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full font-medium"
                    title="Auto-detected from your IP / system clock"
                  >
                    <Globe className="w-3 h-3 text-[#9d00ff]" />
                    {userTz.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <Input
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs text-gray-900 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <Select value={demoTime} onValueChange={setDemoTime}>
                      <SelectTrigger className="h-10 rounded-xl bg-gray-50/70 border-gray-200 text-xs text-gray-900 font-medium focus:ring-[#9d00ff] focus:border-[#9d00ff]">
                        <SelectValue placeholder="Select preferred time slot" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[200] max-h-56">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot} className="text-xs py-1.5">
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Row 5: Workflows to demo or existing CRM/ERP (Optional) */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-800">
                  Workflows to demo or existing CRM/ERP (Optional)
                </label>
                <Input
                  placeholder="e.g. Inbound voice agent with CRM, WhatsApp sales bot..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs text-gray-900"
                />
              </div>

              {/* Row 6: Share your thoughts (Optional) */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#9d00ff]" />
                  Share your thoughts <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  placeholder="Any questions, team size, specific goals or requirements..."
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  className="h-10 rounded-xl bg-gray-50/70 border-gray-200 focus:border-[#9d00ff] focus:ring-[#9d00ff] text-xs text-gray-900"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#9d00ff] hover:bg-[#8800e0] text-white font-bold h-11 rounded-xl shadow-md shadow-[#9d00ff]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_10px_30px_-6px_rgba(157,0,255,0.45)] active:scale-100 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking your demo...</span>
                  </>
                ) : (
                  <>
                    <span>Book Your Live Demo</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-gray-400 text-center font-normal pt-0.5">
                🔒 Enterprise data isolation (GDPR & CCPA compliant). No spam.
              </p>
            </form>
          </>
        ) : (
          /* ─── Success Confirmation Screen ─── */
          <div className="py-5 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-full bg-[#9d00ff]/10 text-[#9d00ff] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-gray-950 tracking-tight">
                Demo Request Confirmed!
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-gray-900">{fullName}</span>. Our AI solution architects will contact you shortly to conduct your personalized live demo.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-150 text-xs text-gray-600 max-w-sm mx-auto text-left space-y-1">
              <p>
                <span className="font-bold text-gray-800">Email:</span> {email}
              </p>
              <p>
                <span className="font-bold text-gray-800">Phone:</span> {phone}
              </p>
              <p>
                <span className="font-bold text-gray-800">Selected Plan:</span> {selectedPlan}
              </p>
              <p>
                <span className="font-bold text-gray-800">Add-on:</span>{" "}
                {ADDON_OPTIONS.find((o) => o.value === selectedAddon)?.label}
              </p>
              {demoDate && (
                <p>
                  <span className="font-bold text-gray-800">Preferred Slot:</span>{" "}
                  {demoDate} {demoTime ? `at ${demoTime}` : ""} ({userTz.abbr || userTz.gmt})
                </p>
              )}
            </div>

            <Button
              onClick={handleClose}
              className="bg-[#9d00ff] hover:bg-[#8800e0] text-white font-bold px-7 h-10 rounded-xl shadow-md transition-all cursor-pointer"
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
