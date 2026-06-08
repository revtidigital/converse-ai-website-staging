import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
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
import Footer from "@/components/Footer";
import { Send } from "lucide-react";
import { validateContactForm } from "@/lib/validations/contact";
import { submitContactForm } from "@/lib/submitContactForm";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { trackFormSuccess } from "@/lib/tracking";

const BookDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryName: "",
    product: "",
    message: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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
        product: formData.product,
        subject: "",
        message: formData.message,
        form_source: "Book Demo Page Form",
      });

      trackFormSuccess("book_demo_page_form");

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
    <>
      <Helmet>
        <title>Book a Demo | ConverseAI - See Our Platform in Action</title>
        <meta
          name="description"
          content="Schedule a personalized demo of ConverseAI. See how our AI-powered chatbot and live chat platform can transform your customer engagement."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.theconverseai.com/book-demo" />
      </Helmet>

      <main id="main-content" className="min-h-screen bg-background pt-24">
        {/* Hero section */}
        <section className="py-12 md:py-16 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {formSubmitted ? "Schedule Your Demo" : "Get a Demo"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {formSubmitted
                ? "Choose a convenient time below. Our team will walk you through how ConverseAI can help grow your business."
                : "Fill in your details and our team will get in touch to show you ConverseAI in action."}
            </p>
          </div>
        </section>

        {!formSubmitted ? (
          /* ── Contact Form ── */
          <section className="pb-16 md:pb-24 px-4">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      className={`h-12 bg-white/50 border-muted focus:border-primary focus:ring-primary ${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
                      className={`h-12 bg-white/50 border-muted focus:border-primary focus:ring-primary ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
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
                      Select Product *
                    </label>
                    <Select
                      value={formData.product}
                      onValueChange={(value) => setFormData({ ...formData, product: value })}
                    >
                      <SelectTrigger className={`h-12 bg-white/50 border-muted focus:ring-primary data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary ${errors.product ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
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
                    {errors.product && <p className="text-xs text-destructive">{errors.product}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us about your project and requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    maxLength={2000}
                    className={`min-h-[120px] bg-white/50 border-muted focus:border-primary focus:ring-primary resize-none ${errors.message ? "border-destructive" : ""}`}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="demo-terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreeToTerms: checked as boolean })
                    }
                    className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    aria-describedby="demo-terms-description"
                  />
                  <label
                    htmlFor="demo-terms"
                    id="demo-terms-description"
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
                      Continue to Schedule
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </section>
        ) : (
          /* ── Google Calendar Scheduler ── */
          <section className="pb-16 md:pb-24 px-4">
            <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card z-10">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Loading scheduler...
                  </p>
                </div>
              )}
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3A-sR86Lvn6njkZNbhagQa-tC8b_y5SNTLfMxDlllCvpaYLtv9ycg4jyW3Y8iPKoE_l-5XX3O4?gv=true"
                title="Schedule via Google Calendar"
                className="w-full border-0"
                style={{ height: "800px", minHeight: "600px" }}
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
};

export default BookDemo;
