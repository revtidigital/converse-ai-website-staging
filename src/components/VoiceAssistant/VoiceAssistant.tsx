import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  ChevronDown,
  Calendar,
  ExternalLink,
  Paperclip,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { AiraEngine, type AiraResponse, type BookingDetails } from "./airaEngine";
import { submitContactForm } from "@/lib/submitContactForm";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  navigateTo?: string;
  triggerDemo?: boolean;
  imageUrl?: string;
  isBookingSuccess?: boolean;
  bookingDetails?: BookingDetails;
}

const QUICK_SUGGESTIONS = [
  "What services do you offer?",
  "Tell me about AI Voice Agents",
  "How does WhatsApp Automation work?",
  "Show me Case Studies & ROI",
  "How can I book a free demo?",
  "What is the pricing & timeline?",
];

const getActionLabel = (path?: string) => {
  if (!path) return "Explore Page";
  const p = path.toLowerCase();
  if (p.startsWith("/case-studies")) return "View Case Studies";
  if (p.startsWith("/book-demo")) return "Book Free Demo";
  if (p.startsWith("/contact-us")) return "Contact Sales & Support";
  if (p.startsWith("/services/ai-voice-agents") || p.startsWith("/voice-agents")) return "Explore AI Voice Agents";
  if (p.startsWith("/services/ai-integration")) return "Explore AI Integration";
  if (p.startsWith("/services/agentic-process-automation") || p.startsWith("/services/agentic-automation")) return "Explore Agentic Automation";
  if (p.startsWith("/services/custom-ai-agents")) return "Explore Custom AI Agents";
  if (p.startsWith("/services/ai-strategy-audit")) return "Explore AI Strategy Audit";
  if (p.startsWith("/services/document-knowledge-intelligence") || p.startsWith("/services/knowledge-intelligence")) return "Explore Knowledge Intelligence";
  if (p.startsWith("/whatsapp-ai-chatbot") || p.startsWith("/whatsapp-shop") || p.startsWith("/whatsapp-marketing")) return "Explore WhatsApp Chatbot";
  if (p.startsWith("/services")) return "Explore All Services";
  if (p.startsWith("/about-us") || p.startsWith("/about")) return "About Converse AI";
  if (p.startsWith("/pricing")) return "View Pricing Plans";
  return "Explore Page";
};

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const engineRef = useRef<AiraEngine | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Screenshot / Image attachment state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize engine & welcome message
  useEffect(() => {
    engineRef.current = new AiraEngine();
    const initialGreeting = engineRef.current.getGreeting();

    const welcomeMsg: ChatMessage = {
      id: "welcome-1",
      sender: "bot",
      text: initialGreeting.reply,
      timestamp: formatTime(new Date()),
      navigateTo: "/services",
    };

    setMessages([welcomeMsg]);

    // Hide initial tooltip after 8 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);

    return () => clearTimeout(tooltipTimer);
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
      // Focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages, isTyping]);

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Handle file/screenshot upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image or screenshot file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
      setAttachedImageName(file.name);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected if needed
    e.target.value = "";
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setAttachedImageName(null);
  };

  // Handle sending a message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text && !attachedImage) return;
    if (isTyping) return;

    const currentImg = attachedImage;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text || "Please check this screenshot / workflow:",
      timestamp: formatTime(new Date()),
      imageUrl: currentImg || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    removeAttachedImage();
    setIsTyping(true);

    // Natural 280ms delay for smooth typing feel
    setTimeout(async () => {
      if (!engineRef.current) {
        engineRef.current = new AiraEngine();
      }

      let response: AiraResponse;

      // If user uploaded a screenshot, use screenshot processor
      if (currentImg) {
        response = engineRef.current.processScreenshot(text);
      } else {
        response = engineRef.current.processMessage(text);
      }

      // If lead was confirmed/booked in this turn, submit to Google Apps Script / CRM
      let isBookingSuccess = false;
      if (response.bookingDetails?.contact && response.triggerDemoPopup) {
        isBookingSuccess = true;
        try {
          await submitContactForm({
            fullName: response.bookingDetails.name || "AI Chatbot Visitor",
            email: response.bookingDetails.contact.includes("@")
              ? response.bookingDetails.contact
              : "lead@theconverseai.com",
            phone: !response.bookingDetails.contact.includes("@")
              ? response.bookingDetails.contact
              : "N/A",
            product: response.bookingDetails.topic || "AI Voice Agents & Automation",
            subject: "New Demo Booking from AI Chatbot Assistant",
            message: `Booking created via Website Chatbot. Contact: ${response.bookingDetails.contact}. Name: ${response.bookingDetails.name || 'N/A'}.`,
            form_source: "AI Chatbot Assistant",
          });
        } catch {
          // Fallback silently if offline or blocked
        }
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        timestamp: formatTime(new Date()),
        navigateTo: response.navigateTo,
        triggerDemo: response.triggerDemoPopup,
        isBookingSuccess,
        bookingDetails: response.bookingDetails,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      // Auto-redirect if user explicitly asked to go to/be taken to a page
      const isExplicitNav = /\b(take me|go to|navigate to|navigate|redirect|open|kholo|le jao|leke jao|le jaye|leke jaye|jana hai|show me|dikhao)\b/i.test(text);
      if (response.navigateTo && isExplicitNav) {
        setTimeout(() => {
          handleActionClick(response.navigateTo!);
        }, 900);
      }
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    if (engineRef.current) {
      engineRef.current.resetState();
    }
    removeAttachedImage();
    const resetGreeting: ChatMessage = {
      id: `reset-${Date.now()}`,
      sender: "bot",
      text: "Conversation reset! How can I help you explore ConverseAI's voice agents, automation, or custom AI solutions today?",
      timestamp: formatTime(new Date()),
      navigateTo: "/services",
    };
    setMessages([resetGreeting]);
  };

  // Action button click inside message
  const handleActionClick = (path: string) => {
    if (!path) return;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }

    // Keep chatbot open when redirecting to a page
    setIsOpen(true);

    // Navigate to target route
    navigate(path);

    // Smoothly scroll to the top of the destination page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON & CALLOUT BADGE */}
      <div className="fixed bottom-20 right-6 z-50 flex items-center justify-end select-none">
        {/* Callout tooltip (visible on first load when chat is closed) */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(true)}
              className="mr-3 cursor-pointer hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/60 shadow-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-violet-400 transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
              <span>Questions? Chat with AI</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-1"
                aria-label="Dismiss tooltip"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Icon */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Chatbot" : "Open AI Chatbot"}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
            isOpen
              ? "bg-zinc-800 text-white hover:bg-zinc-900 shadow-zinc-800/30"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-600/30 hover:shadow-violet-600/50"
          }`}
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6" />
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              {/* Pulsing online badge */}
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* CHATBOT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[94vw] sm:w-[400px] max-w-[415px] h-[510px] max-h-[calc(100dvh-110px)] flex flex-col rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans"
          >
            {/* CHAT HEADER */}
            <div className="relative px-4 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-violet-700 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm tracking-wide text-white">
                      Aira
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-medium text-violet-100">
                      ConverseAI
                    </span>
                  </div>
                  <p className="text-[11px] text-violet-100/90 leading-none mt-0.5">
                    Instant Answers • Form Filling • Screenshots
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                  className="p-1.5 rounded-lg text-violet-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  aria-label="Close Chat"
                  className="p-1.5 rounded-lg text-violet-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES THREAD */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[85%] ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1 ${
                        msg.sender === "user"
                          ? "bg-violet-600 text-white"
                          : "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none"
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-none"
                      }`}
                    >
                      {/* Attached Screenshot display */}
                      {msg.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={msg.imageUrl}
                            alt="Attached workflow screenshot"
                            className="max-w-full max-h-48 rounded-lg object-cover border border-white/20 shadow-sm"
                          />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Consultation Booking Summary Card */}
                      {((msg.bookingDetails && msg.bookingDetails.contact) || msg.isBookingSuccess) && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/60 dark:from-violet-950/50 dark:to-indigo-950/40 border border-violet-200 dark:border-violet-800/60 shadow-xs text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-violet-950 dark:text-violet-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Consultation Booking Summary</span>
                          </div>
                          <div className="space-y-1 text-zinc-700 dark:text-zinc-300 pt-1.5 border-t border-violet-200/60 dark:border-violet-800/40">
                            {msg.bookingDetails?.name && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-500 dark:text-zinc-400">Name:</span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{msg.bookingDetails.name}</span>
                              </div>
                            )}
                            {msg.bookingDetails?.contact && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-500 dark:text-zinc-400">Contact:</span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{msg.bookingDetails.contact}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-zinc-500 dark:text-zinc-400">Service:</span>
                              <span className="font-semibold text-violet-700 dark:text-violet-300">
                                {msg.bookingDetails?.topic || "AI Voice Agents & Automation"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Confirmed & Synced to CRM
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Navigation Button (if provided by engine) */}
                      {msg.navigateTo && msg.sender === "bot" && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleActionClick(msg.navigateTo!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-semibold transition-all duration-150 border border-violet-200/70 dark:border-violet-800/40 cursor-pointer shadow-xs active:scale-95"
                          >
                            <span>{getActionLabel(msg.navigateTo)}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Extra button if demo booking trigger */}
                          {!msg.navigateTo.startsWith("/book-demo") &&
                            (msg.triggerDemo || msg.text.toLowerCase().includes("book a quick call") || msg.text.toLowerCase().includes("schedule a call")) && (
                              <button
                                onClick={() => handleActionClick("/book-demo")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Book Demo</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-8">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK SUGGESTION CHIPS */}
            <div className="px-3 py-2 bg-white dark:bg-zinc-950 border-t border-zinc-200/70 dark:border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    disabled={isTyping}
                    onClick={() => handleSendMessage(suggestion)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-violet-50 dark:bg-zinc-900 dark:hover:bg-violet-950/50 text-zinc-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700/60 transition-all duration-150 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* ATTACHED SCREENSHOT PREVIEW CHIP (if attached) */}
            {attachedImage && (
              <div className="px-3 py-1.5 bg-violet-50/80 dark:bg-zinc-900 border-t border-violet-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="w-6 h-6 rounded object-cover border border-violet-300 dark:border-zinc-700 shrink-0"
                  />
                  <span className="truncate text-[11px] font-medium text-violet-900 dark:text-violet-200">
                    {attachedImageName || "Attached screenshot"}
                  </span>
                </div>
                <button
                  onClick={removeAttachedImage}
                  className="p-1 hover:bg-violet-200/50 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* INPUT BAR */}
            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200/70 dark:border-zinc-800/80 shrink-0">
              <div className="relative flex items-center gap-1.5">
                {/* File input (Hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Screenshot / File attachment button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  title="Attach screenshot or workflow image"
                  className="p-2 rounded-xl text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    attachedImage
                      ? "Add a note or hit Send..."
                      : "Ask anything about ConverseAI..."
                  }
                  disabled={isTyping}
                  className="w-full pl-3 pr-11 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[13.5px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-150"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !attachedImage) || isTyping}
                  aria-label="Send message"
                  className="absolute right-1.5 p-2 rounded-lg bg-violet-600 text-white disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-violet-500 transition-colors duration-150 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                <span>ConverseAI Intelligent Engine</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
