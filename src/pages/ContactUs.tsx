import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
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
import { MapPin, Phone, Mail, Shield, Clock, Users, Send } from "lucide-react";
import { validateContactForm } from "@/lib/validations/contact";
import { submitContactForm } from "@/lib/submitContactForm";
import { usePartialLeadCapture } from "@/lib/usePartialLeadCapture";
import PhoneInputField from "@/components/ui/PhoneInputField";
import { trackFormError, trackFormStart, trackFormSubmitClick, trackFormSuccess, trackFormView } from "@/lib/tracking";

const ContactUs = () => {
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
  const capturePartialLead = usePartialLeadCapture("Partial Lead – Contact Page");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasStartedForm = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const voiceSubmitPendingRef = useRef(false);
  const voiceSubmitRequestedRef = useRef(false);

  useEffect(() => {
    trackFormView("contact_page_form", { form_location: "contact_page" });
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ field: string; value: string | boolean }>).detail;
      if (!detail?.field) return;
      setFormData((current) => ({ ...current, [detail.field]: detail.value }));
      handleFormStart();
    };
    window.addEventListener("voice-agent:contact-field", handler);
    return () => window.removeEventListener("voice-agent:contact-field", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (voiceSubmitPendingRef.current || isSubmitting) return;
      voiceSubmitPendingRef.current = true;
      voiceSubmitRequestedRef.current = false;
      setFormData((current) => ({ ...current, agreeToTerms: true }));
      handleFormStart();
    };
    window.addEventListener("voice-agent:contact-submit-request", handler);
    return () => window.removeEventListener("voice-agent:contact-submit-request", handler);
  }, [isSubmitting]);

  useEffect(() => {
    if (!voiceSubmitPendingRef.current || voiceSubmitRequestedRef.current || !formData.agreeToTerms) return;
    voiceSubmitRequestedRef.current = true;
    formRef.current?.requestSubmit();
  }, [formData.agreeToTerms]);


  const handleFormStart = () => {
    if (hasStartedForm.current) return;
    hasStartedForm.current = true;
    trackFormStart("contact_page_form", { form_location: "contact_page" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmitClick("contact_page_form", { form_location: "contact_page" });
    setErrors({});
    
    const validation = validateContactForm(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      trackFormError("contact_page_form", Object.values(validation.errors)[0] || "validation_error", {
        form_location: "contact_page",
      });
      toast({
        title: "Please fix the errors",
        description: Object.values(validation.errors)[0],
        variant: "destructive",
      });
      voiceSubmitPendingRef.current = false;
      voiceSubmitRequestedRef.current = false;
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
        subject: formData.subject,
        message: formData.message,
        form_source: "Contact Page Form",
      });
      
      trackFormSuccess("contact_page_form", { form_location: "contact_page" });
      
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
      navigate("/thank-you");
    } catch {
      trackFormError("contact_page_form", "submission_failed", { form_location: "contact_page" });
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      voiceSubmitPendingRef.current = false;
      voiceSubmitRequestedRef.current = false;
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: "Free consultation with AI experts",
      description: "Get personalized advice from our team of specialists",
    },
    {
      icon: Clock,
      title: "Fast response time",
      description: "We respond to all inquiries within 24 hours",
    },
    {
      icon: Shield,
      title: "Enterprise-grade data security",
      description: "Your data is protected with industry-leading security",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <Helmet>
        <title>Contact Us | Get in Touch with ConverseAI Team</title>
        <meta name="description" content="Contact the ConverseAI team to explore AI chatbot and WhatsApp solutions for your business. We respond within 24 hours." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Contact Us | ConverseAI" />
        <meta property="og:description" content="Contact the ConverseAI team to explore AI chatbot and WhatsApp solutions for your business. We respond within 24 hours." />
        <link rel="canonical" href="https://theconverseai.com/contact-us" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet/15 to-background" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container-tight relative z-10 text-center py-16 md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              Let's Connect
            </span>
          </div>
          
          <h1 className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Get in Touch with{" "}
            <span className="gradient-text">ConverseAI Team</span>
          </h1>
          
          <p className="animate-fade-up-delayed text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with our team to explore how AI chatbot and WhatsApp automation 
            can grow your business.
          </p>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="relative pb-20 -mt-8">
        <div className="container-tight">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-3 animate-fade-up">
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/50 bg-white/80 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Send us a message
                </h2>
                
                <form ref={formRef} onSubmit={handleSubmit} onFocus={handleFormStart} className="space-y-5" noValidate>
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
                        onBlur={() =>
                          capturePartialLead(formData.email, {
                            fullName: formData.name,
                            phone: formData.phone,
                            countryName: formData.countryName,
                            product: formData.product,
                          })
                        }
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
                      Subject
                    </label>
                    <Input
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      maxLength={200}
                      className={`h-12 bg-white/50 border-muted focus:border-primary focus:ring-primary ${errors.subject ? "border-destructive" : ""}`}
                    />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
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
                      className={`min-h-[140px] bg-white/50 border-muted focus:border-primary focus:ring-primary resize-none ${errors.message ? "border-destructive" : ""}`}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, agreeToTerms: checked as boolean })
                      }
                      className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      aria-describedby="terms-description"
                    />
                    <label
                      htmlFor="terms"
                      id="terms-description"
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
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>

        <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
              {/* Contact Info Card */}
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/50 bg-white/80 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Office Location</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        F-21, Madhuban Colony, Barkat Nagar, Tonk Phatak, Jaipur, Rajasthan 302015
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                      <div className="flex flex-col gap-1">
                        <a 
                          href="tel:+919982323333" 
                          title="Call ConverseAI at +91 99823 23333"
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          +91-9982323333
                        </a>
                        <a 
                          href="tel:+917023084065" 
                          title="Call ConverseAI at +91 70230 84065"
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          +91-7023084065
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Email</h4>
                      <a 
                        href="mailto:himanshu@theconverseai.com" 
                        title="Email ConverseAI at himanshu@theconverseai.com"
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      >
                        himanshu@theconverseai.com
                      </a> <br/>
                      <a 
                        href="mailto:contact@theconverseai.com" 
                        title="Email ConverseAI at contact@theconverseai.com"
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      >
                        contact@theconverseai.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social/Quick Links Card */}
              <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-violet/5">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Business Hours:</span>
                  <br />
                  Monday - Saturday: 10:00 AM - 7:00 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Reach Out Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container-tight">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why reach out to{" "}
              <span className="gradient-text">ConverseAI?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join hundreds of businesses that trust us for their AI automation needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div
                title={`${benefit.title} - ${benefit.description}`}
                key={benefit.title}
                className="glass-card-hover rounded-2xl p-6 text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl gradient-cta flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
