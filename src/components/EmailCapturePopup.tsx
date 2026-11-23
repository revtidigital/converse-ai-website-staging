import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/submitContactForm";
import {
  EMAIL_POPUP_GOOGLE_SHEET_URL,
  EMAIL_POPUP_GOOGLE_SHEET_ID,
  getEmailPopupSheetScriptUrl,
} from "@/lib/sheetsConfig";

// LocalStorage Keys
const POPUP_SUBMITTED_KEY = "converse_popup_email_submitted";
const POPUP_LAST_SHOWN_KEY = "converse_popup_last_shown_time";

// Configuration
const POPUP_DELAY_MS = 10 * 1000; // 10 seconds
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const EmailCapturePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check eligibility and schedule 10-second timer
  useEffect(() => {
    // Disable on server-side rendering or admin/thank-you routes
    if (typeof window === "undefined") return;
    if (location.pathname.startsWith("/admin") || location.pathname === "/thank-you") {
      return;
    }

    // 1. If user already submitted their email, NEVER show the popup again
    const isSubmitted = localStorage.getItem(POPUP_SUBMITTED_KEY);
    if (isSubmitted === "true") {
      return;
    }

    // 2. Frequency Capping: Check if 7 days have passed since last shown
    const lastShown = localStorage.getItem(POPUP_LAST_SHOWN_KEY);
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown, 10);
      if (elapsed < SEVEN_DAYS_MS) {
        // Less than 7 days have passed; do not trigger
        return;
      }
    }

    // 3. Set 10-second delay timer
    timerRef.current = setTimeout(() => {
      // Re-verify submission status before opening
      if (localStorage.getItem(POPUP_SUBMITTED_KEY) === "true") return;

      setIsOpen(true);
      // Record timestamp when the popup is shown to enforce the 7-day frequency capping
      localStorage.setItem(POPUP_LAST_SHOWN_KEY, Date.now().toString());
    }, POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    setIsOpen(false);
    setError("");
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid work email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // 1. Submit lead to dedicated Google Sheet & CRM
      await submitContactForm({
        fullName: "Website Subscriber",
        email: cleanEmail,
        phone: "N/A",
        countryName: "N/A",
        product: "AI Strategy & Voice Automation",
        subject: `[Email Popup Subscriber] ${cleanEmail}`,
        message: `Subscriber captured from 10s delay popup on page: ${window.location.href}`,
        form_source: "Email Capture Popup (10s Delay)",
        customScriptUrl: getEmailPopupSheetScriptUrl() || undefined,
        extraFields: {
          lead_type: "Email Popup Subscription",
          target_google_sheet: EMAIL_POPUP_GOOGLE_SHEET_URL,
          sheet_id: EMAIL_POPUP_GOOGLE_SHEET_ID,
          page_url: window.location.href,
        },
      });

      // 2. Mark as permanently submitted so it NEVER shows up again for this user
      localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
      setIsSuccess(true);

      toast({
        title: "Successfully Subscribed! 🎉",
        description: "Thank you for joining. We'll send actionable AI updates directly to your inbox.",
      });

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } catch (err) {
      console.error("Popup submission error:", err);
      // Still set submitted flag to avoid frustrating the user repeatedly
      localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={!isSubmitting ? handleClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-primary/25 shadow-2xl bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-950 overflow-hidden text-foreground z-10"
          >
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -left-24 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              /* Success State */
              <div className="py-8 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    You're On The List! 🎉
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you for subscribing. We will keep you updated with the latest AI voice breakthroughs and exclusive enterprise playbooks.
                  </p>
                </div>
              </div>
            ) : (
              /* Email Input Form State */
              <div className="space-y-6">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Exclusive AI Insights</span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2.5">
                  <h3
                    id="popup-modal-title"
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug"
                  >
                    Supercharge Your Business With AI
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Get actionable AI automation breakdowns, voice agent case studies, and enterprise frameworks delivered directly to your inbox.
                  </p>
                </div>

                {/* Single Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label htmlFor="popup-email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input
                        id="popup-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Enter your work email..."
                        disabled={isSubmitting}
                        autoFocus
                        className="pl-11 pr-4 py-6 text-base rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 focus-visible:ring-primary focus-visible:border-primary shadow-xs transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-xs font-medium text-rose-500 pl-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary via-violet-600 to-indigo-600 hover:opacity-95 text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Free Insights</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Privacy Assurance */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>No spam, ever. Unsubscribe at any time with 1-click.</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmailCapturePopup;
