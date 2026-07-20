import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { validateContactForm } from "@/lib/validations/contact";
import { submitContactForm } from "@/lib/submitContactForm";
import { usePartialLeadCapture } from "@/lib/usePartialLeadCapture";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { trackFormError, trackFormStart, trackFormSubmitClick, trackFormSuccess, trackFormView } from "@/lib/tracking";

interface ContactFormDialogProps {
  children: React.ReactNode;
}

const ContactFormDialog = ({ children }: ContactFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryName: "",
    product: "",
    subject: "",
    message: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const capturePartialLead = usePartialLeadCapture("Partial Lead – Popup Form");
  const hasStartedForm = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const trackContactFormStart = () => {
    if (hasStartedForm.current) return;

    hasStartedForm.current = true;
    trackFormStart("contact_form", { form_location: "popup_dialog" });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      hasStartedForm.current = false;
      trackFormView("contact_form", { form_location: "popup_dialog" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmitClick("contact_form", { form_location: "popup_dialog" });
    setErrors({});

    const validation = validateContactForm(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      trackFormError("contact_form", Object.values(validation.errors)[0] || "validation_error", {
        form_location: "popup_dialog",
      });
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
        product: formData.product || "Not specified",
        subject: formData.subject,
        message: formData.message,
        form_source: "Popup Form Enquiry",
      });

      trackFormSuccess("contact_form", { form_location: "popup_dialog" });

      setFormData({
        name: "",
        email: "",
        phone: "",
        countryName: "",
        product: "",
        subject: "",
        message: "",
        agreeToTerms: false,
      });
      setErrors({});
      setOpen(false);
      navigate("/thank-you");
    } catch {
      trackFormError("contact_form", "submission_failed", { form_location: "popup_dialog" });
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Contact Us
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} onFocus={trackContactFormStart} className="px-6 pb-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="contact-name" className="sr-only">Your Name (required)</label>
              <Input
                id="contact-name"
                placeholder="Your Name*"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`rounded-lg border focus-visible:ring-1 focus-visible:ring-primary ${errors.name ? "border-destructive" : "border-input"}`}
              />
              {errors.name && <p id="name-error" className="text-xs text-destructive" role="alert">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="contact-email" className="sr-only">Your Email (required)</label>
              <Input
                id="contact-email"
                type="email"
                placeholder="Your Email*"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() =>
                  capturePartialLead(formData.email, {
                    fullName: formData.name,
                    phone: formData.phone,
                    countryName: formData.countryName,
                    product: formData.product,
                  })
                }
                maxLength={255}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`rounded-lg border focus-visible:ring-1 focus-visible:ring-primary ${errors.email ? "border-destructive" : "border-input"}`}
              />
              {errors.email && <p id="email-error" className="text-xs text-destructive" role="alert">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
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
              <label htmlFor="contact-looking-for" className="sr-only">What are you looking for?</label>
              <Select
                value={formData.product}
                onValueChange={(value) => setFormData({ ...formData, product: value })}
              >
                <SelectTrigger
                  id="contact-looking-for"
                  title="Select the product or service you are interested in"
                  className={`rounded-lg border focus:ring-1 focus:ring-primary text-foreground data-[state=open]:ring-1 data-[state=open]:ring-primary ${errors.lookingFor ? "border-destructive" : "border-input"}`}
                  aria-label="Select what you're looking for"
                >
                  <SelectValue placeholder="What are you looking for?" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="ai-agent">AI Agent</SelectItem>
                  <SelectItem value="services">Agentic AI</SelectItem>
                  <SelectItem value="conversational-ai-chatbot">Conversational AI Chatbot</SelectItem>
                  <SelectItem value="whatsapp-ai-chatbot">WhatsApp AI Chatbot</SelectItem>
                  <SelectItem value="live-chat">Live Chat</SelectItem>
                  <SelectItem value="omni-channel">Omni Channel</SelectItem>
                  <SelectItem value="pre-chat-forms">Pre-Chat Forms</SelectItem>
                  <SelectItem value="whatsapp-marketing">WhatsApp Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-subject" className="sr-only">Subject (required)</label>
            <Input
              id="contact-subject"
              title="Enter the subject of your message"
              placeholder="Subject*"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={200}
              aria-required="true"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              className={`rounded-lg border focus-visible:ring-1 focus-visible:ring-primary ${errors.subject ? "border-destructive" : "border-input"}`}
            />
            {errors.subject && <p id="subject-error" className="text-xs text-destructive" role="alert">{errors.subject}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-message" className="sr-only">Tell us about your project</label>
            <Textarea
              id="contact-message"
              title="Describe your project or requirement"
              placeholder="Tell us about your project"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              maxLength={2000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={`min-h-[100px] border border-muted rounded-lg resize-y focus-visible:ring-1 focus-visible:ring-primary ${errors.message ? "border-destructive" : ""}`}
            />
            {errors.message && <p id="message-error" className="text-xs text-destructive" role="alert">{errors.message}</p>}
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-1">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="dialog-terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeToTerms: checked as boolean })
                }
                className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                aria-describedby="dialog-terms-description"
              />
              <label
                htmlFor="dialog-terms"
                id="dialog-terms-description"
                className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <Link to="/terms-and-conditions" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                *
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-xs text-destructive" role="alert">{errors.agreeToTerms}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              title="Send your message to ConverseAI team"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-lg"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
