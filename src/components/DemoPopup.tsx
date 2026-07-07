import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Send } from "lucide-react";
import { validateContactForm } from "@/lib/validations/contact";
import { submitContactForm } from "@/lib/submitContactForm";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { trackFormSuccess } from "@/lib/tracking";

/** Shown once per browser session. */
const SESSION_KEY = "demoPopupShown";
/** Fires automatically after this many ms if the user hasn't reached the trigger section. */
const AUTO_OPEN_DELAY = 5000;

/** Product options — `value` is stored/selected, `label` is human-readable for the lead email. */
const PRODUCT_OPTIONS = [
  { value: "ai-agent", label: "AI Agent" },
  { value: "services", label: "Agentic AI" },
  { value: "conversational-ai-chatbot", label: "Conversational AI Chatbot" },
  { value: "whatsapp-ai-chatbot", label: "WhatsApp AI Chatbot" },
  { value: "live-chat", label: "Live Chat" },
  { value: "omni-channel", label: "Omni Channel" },
  { value: "pre-chat-forms", label: "Pre-Chat Forms" },
  { value: "whatsapp-marketing", label: "WhatsApp Marketing" },
  { value: "other", label: "Other" },
] as const;

interface DemoPopupProps {
  /** CSS selector for the section that should also trigger the popup on scroll. */
  triggerSelector?: string;
}

const DemoPopup = ({ triggerSelector = "#build-run-section" }: DemoPopupProps) => {
  const [open, setOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryName: "",
    product: "",
    website: "",
    message: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Guard so neither trigger can fire twice (and not at all once shown this session).
  const hasTriggeredRef = useRef(false);

  const triggerOpen = useCallback(() => {
    if (hasTriggeredRef.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    hasTriggeredRef.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, []);

  // Trigger 1 — automatically after 5 seconds.
  useEffect(() => {
    const timer = window.setTimeout(triggerOpen, AUTO_OPEN_DELAY);
    return () => window.clearTimeout(timer);
  }, [triggerOpen]);

  // Trigger 2 — when the user scrolls to the "We Build the Agent. We Run It Too." section.
  useEffect(() => {
    const section = document.querySelector(triggerSelector);
    if (!section || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          triggerOpen();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [triggerSelector, triggerOpen]);

  // Trigger 3 — exit intent on tab close: when the user tries to close the tab
  // (or navigate away), show the native confirm prompt and re-open the popup so
  // the lead form is visible if they choose to stay.
  useEffect(() => {
    if (formSubmitted) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((window as any).__converseBypassExitIntent) return;
      hasTriggeredRef.current = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [formSubmitted]);

  // Let the browser Back button close the popup instead of leaving the page.
  useEffect(() => {
    if (!open) return;

    window.history.pushState({ converseDemoPopup: true }, "");
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed via the X / overlay / Escape — remove the history entry we pushed.
      if (window.history.state?.converseDemoPopup) {
        window.history.back();
      }
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateContactForm(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      toast({
        title: "Please fix the errors",
        description: Object.values(validation.errors)[0],
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        countryName: formData.countryName,
        product:
          PRODUCT_OPTIONS.find((o) => o.value === formData.product)?.label ??
          formData.product,
        website: formData.website,
        subject: "",
        message: formData.message,
        form_source: "Demo Popup Form",
      });

      trackFormSuccess("demo_popup_form");

      setFormSubmitted(true);
    } catch {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        {!formSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Book Your Free Demo
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in your details and our team will get in touch to show you
                ConverseAI in action.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Name *
                </label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className={`h-11 bg-white/50 border-muted focus:border-primary focus:ring-primary ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Phone Number *
                  </label>
                  <PhoneInputField
                    value={formData.phone}
                    onChange={(phone, countryName) =>
                      setFormData({ ...formData, phone, countryName })
                    }
                    error={errors.phone}
                    variant="bordered"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                    className={`h-11 bg-white/50 border-muted focus:border-primary focus:ring-primary ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Product *
                  </label>
                  <Select
                    value={formData.product}
                    onValueChange={(value) => setFormData({ ...formData, product: value })}
                  >
                    <SelectTrigger className={`h-11 bg-white/50 border-muted focus:ring-primary data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary ${errors.product ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[130]">
                      {PRODUCT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.product && <p className="text-xs text-destructive">{errors.product}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Website
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    maxLength={255}
                    className="h-11 bg-white/50 border-muted focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  placeholder="Tell us about your project and requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  maxLength={2000}
                  className={`min-h-[90px] bg-white/50 border-muted focus:border-primary focus:ring-primary resize-none ${errors.message ? "border-destructive" : ""}`}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="popup-demo-terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                  className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  aria-describedby="popup-demo-terms-description"
                />
                <label
                  htmlFor="popup-demo-terms"
                  id="popup-demo-terms-description"
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  I agree to the{" "}
                  <Link to="/terms-and-conditions" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  *
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-xs text-destructive">{errors.agreeToTerms}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 gradient-cta text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Book My Demo
                  </span>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Thank you!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                We&apos;ve received your details. Our team will reach out shortly to
                schedule your personalized ConverseAI demo.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => setOpen(false)}
              className="gradient-cta text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DemoPopup;
