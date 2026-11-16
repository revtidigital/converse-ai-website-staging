import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, ChevronDown, ChevronUp, Sparkles, CheckCircle2, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pixel art bot icon resembling Sarvam AI's retro mascot
function PixelBotIcon({ theme }: { theme: "blue" | "green" | "orange" }) {
  const colorMap = {
    blue: {
      primary: "#2563eb",
      secondary: "#60a5fa",
      accent: "#1d4ed8",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-900/50",
    },
    green: {
      primary: "#16a34a",
      secondary: "#4ade80",
      accent: "#15803d",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-900/50",
    },
    orange: {
      primary: "#ea580c",
      secondary: "#fb923c",
      accent: "#c2410c",
      bg: "bg-orange-50 dark:bg-orange-950/40",
      border: "border-orange-200 dark:border-orange-900/50",
    },
  }[theme];

  return (
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 border ${colorMap.bg} ${colorMap.border} shadow-xs shrink-0`}
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pixel Bot Head */}
        <rect x="6" y="5" width="12" height="11" fill={colorMap.primary} rx="1" />
        {/* Antennas */}
        <rect x="11" y="2" width="2" height="3" fill={colorMap.accent} />
        <rect x="10" y="1" width="4" height="1.5" fill={colorMap.secondary} />
        {/* Eyes (Pixel) */}
        <rect x="8" y="8" width="2.5" height="2.5" fill="#ffffff" />
        <rect x="8.5" y="8.5" width="1.5" height="1.5" fill="#0f172a" />
        <rect x="13.5" y="8" width="2.5" height="2.5" fill="#ffffff" />
        <rect x="14" y="8.5" width="1.5" height="1.5" fill="#0f172a" />
        {/* Friendly smile */}
        <rect x="9" y="13" width="6" height="1.5" fill="#ffffff" />
        {/* Telephone Handset next to ear */}
        <path
          d="M 18.5 7.5 C 19.5 8.5 20.5 10 20.5 12 C 20.5 14 19.5 15.5 18.5 16.5 L 17 15.5 C 17.8 14.5 18.5 13.5 18.5 12 C 18.5 10.5 17.8 9.5 17 8.5 Z"
          fill={colorMap.accent}
        />
        <rect x="17.5" y="6.5" width="3" height="3" rx="1" fill={colorMap.secondary} />
        <rect x="17.5" y="14.5" width="3" height="3" rx="1" fill={colorMap.secondary} />
      </svg>
    </div>
  );
}

interface VoiceVariant {
  id: string;
  label: string;
  flag: string;
  lang: string;
  audioUrl: string;
  script: string;
  context: string;
  durationSec: number;
}

interface VoiceAgentCardData {
  id: string;
  title: string;
  description: string;
  theme: "blue" | "green" | "orange";
  defaultVariant: string;
  variants: VoiceVariant[];
}

const VOICE_AGENTS_DATA: VoiceAgentCardData[] = [
  {
    id: "appointment-management",
    title: "Appointment management",
    description:
      "Turn customer calls into instant bookings, reschedules, and confirmations with an AI voice agent.",
    theme: "blue",
    defaultVariant: "hindi",
    variants: [
      {
        id: "hindi",
        label: "Hindi",
        flag: "🇮🇳",
        lang: "hi-IN",
        audioUrl: "/audio/voice-demos/appointment-hindi.mp3",
        durationSec: 20,
        context: "Clinic appointment booking, slot selection, and instant confirmation in natural Hindi.",
        script:
          "नमस्ते, मैं HealthCare Clinic की तरफ से बोल रही हूं। क्या मैं आपसे दो मिनट बात कर सकती हूं? आपने हमारी वेबसाइट पर appointment request भेजी थी। आप किस doctor से मिलना चाहते हैं? General physician के लिए हमारे पास गुरुवार दोपहर 3 बजे और शुक्रवार सुबह 11 बजे का slot available है। कौन सा आपके लिए सुविधाजनक रहेगा? बहुत अच्छा, मैं गुरुवार 3 बजे आपका appointment confirm कर देती हूं। आपके registered number पर confirmation SMS आ जाएगा।",
      },
      {
        id: "english",
        label: "English",
        flag: "🌐",
        lang: "en-US",
        audioUrl: "/audio/voice-demos/appointment-english.mp3",
        durationSec: 18,
        context: "Medical appointment scheduling and slot confirmation in neutral English.",
        script:
          "Hello, this is Sarah calling from HealthCare Clinic regarding your online consultation request. We have available slots with Doctor Sharma this Thursday at 3 PM or Friday at 11 AM. Which one works best for your schedule? Wonderful, I have locked in Thursday at 3 PM for you. A confirmation SMS and calendar invite has been sent to your phone.",
      },
      {
        id: "uk",
        label: "UK English",
        flag: "🇬🇧",
        lang: "en-GB",
        audioUrl: "/audio/voice-demos/appointment-uk.mp3",
        durationSec: 18,
        context: "Private healthcare consultation booking in natural British English.",
        script:
          "Good morning, this is Emma from the Harley Street Wellness Practice. I am following up on your consultation enquiry. We currently have availability with our senior specialist this Thursday at 2 PM, or Friday morning at 10:30. Would either of those suit your diary? Brilliant, I shall book that in for Thursday at 2 PM. A confirmation email has been dispatched to you.",
      },
      {
        id: "french",
        label: "French",
        flag: "🇫🇷",
        lang: "fr-FR",
        audioUrl: "/audio/voice-demos/appointment-french.mp3",
        durationSec: 17,
        context: "Medical clinic slot confirmation and scheduling in French.",
        script:
          "Bonjour, ici l'assistante virtuelle de la Clinique Santé. Vous avez sollicité un rendez-vous pour une consultation médicale. Nous avons un créneau disponible jeudi à 15 heures ou vendredi à 11 heures. Quelle option vous convient le mieux ? Parfait, votre rendez-vous de jeudi à 15 heures est confirmé. Vous recevrez un SMS de rappel.",
      },
    ],
  },
  {
    id: "sales-discovery",
    title: "Sales discovery",
    description:
      "Meet Aria: the AI voice agent that turns inbound warm leads into qualified, booked sales meetings.",
    theme: "green",
    defaultVariant: "english",
    variants: [
      {
        id: "english",
        label: "English",
        flag: "🌐",
        lang: "en-US",
        audioUrl: "/audio/voice-demos/sales-english.mp3",
        durationSec: 24,
        context: "B2B SaaS inbound qualification, budget fit, and solutions engineer demo booking.",
        script:
          "Hi there, this is Aria from ConverseAI. I can see you recently filled out our contact form — thanks for reaching out! Are you looking to automate customer support conversations, or is the priority more on the sales outreach side? Great. And roughly how many interactions does your team handle per month? Perfect, that puts you right in our sweet spot. I'd love to set up a 20-minute demo with one of our solutions engineers this Thursday at 2 PM. Does that work for you?",
      },
      {
        id: "uk",
        label: "UK English",
        flag: "🇬🇧",
        lang: "en-GB",
        audioUrl: "/audio/voice-demos/sales-uk.mp3",
        durationSec: 21,
        context: "Enterprise B2B qualification and product walkthrough booking in British English.",
        script:
          "Hello there, this is Oliver calling from ConverseAI. Thanks for registering your interest on our website. I see you're exploring enterprise AI workflows for your sales operations. Roughly how many customer enquiries does your team field each week? Excellent. We would be delighted to walk you through a tailored 15-minute product walkthrough. Would Thursday at 3 PM GMT work well with your diary?",
      },
      {
        id: "hinglish",
        label: "Hinglish",
        flag: "🇮🇳",
        lang: "en-IN",
        audioUrl: "/audio/voice-demos/sales-hinglish.mp3",
        durationSec: 22,
        context: "Natural conversational Hinglish code-switching for Indian B2B sales discovery.",
        script:
          "Hello! Main ConverseAI ki taraf se Aria baat kar rahi hoon. Aapne hamari website par inquiry form fill kiya tha. Main jaanna chahti thi ki aap customer support automate karna chahte hain ya sales outreach? Hamare AI agents CRM aur WhatsApp ke saath directly integrate hote hain. Kya hum kal afternoon mein ek short 15-minute quick walkthrough schedule karein?",
      },
      {
        id: "german",
        label: "German",
        flag: "🇩🇪",
        lang: "de-DE",
        audioUrl: "/audio/voice-demos/sales-german.mp3",
        durationSec: 21,
        context: "German B2B lead qualification and demo meeting booking.",
        script:
          "Guten Tag, hier ist der digitale Assistent von ConverseAI. Vielen Dank für Ihr Interesse an unserer Automatisierungsplattform. Möchten Sie Ihren Kundenservice automatisieren oder suchen Sie nach einer Lösung für den Vertrieb? Ausgezeichnet. Gerne vereinbaren wir eine 20-minütige Live-Demo mit unseren Spezialisten am Donnerstag um 14 Uhr. Passt Ihnen dieser Termin?",
      },
    ],
  },
  {
    id: "emi-collection",
    title: "EMI Collection & Support",
    description:
      "An AI voice agent that manages EMI reminders, simplifies customer payments, and handles support escalations.",
    theme: "orange",
    defaultVariant: "hindi",
    variants: [
      {
        id: "hindi",
        label: "Hindi",
        flag: "🇮🇳",
        lang: "hi-IN",
        audioUrl: "/audio/voice-demos/emi-hindi.mp3",
        durationSec: 23,
        context: "TRAI/DLT-compliant early bucket EMI reminder & secure payment link in Hindi.",
        script:
          "नमस्ते, मैं FinCare की तरफ से Priya बात कर रही हूं। आपके loan account पर इस महीने की EMI ₹4,500 अभी pending है। क्या आप आज UPI या net banking से payment कर सकते हैं? मैं आपके WhatsApp पर direct secure payment link भेज देती हूं। क्या मैं अभी link send कर दूं? धन्यवाद, कृपया 24 घंटे के अंदर भुगतान पूरा करें।",
      },
      {
        id: "tamil",
        label: "Tamil",
        flag: "🇮🇳",
        lang: "ta-IN",
        audioUrl: "/audio/voice-demos/emi-tamil.mp3",
        durationSec: 17,
        context: "DLT-compliant non-aggressive loan reminder in Tamil with payment link.",
        script:
          "வணக்கம், நான் FinCare-ஐ சார்ந்த Priya பேசுகிறேன். உங்கள் loan account-ல் இந்த மாதத்தின் EMI payment இன்னும் pending-ஆக இருக்கிறது. தொகை 4,500 ரூபாய். நீங்கள் இன்று payment செய்ய முடியுமா? நாங்கள் UPI மற்றும் payment link மூலம் ஏற்றுக்கொள்கிறோம். உங்கள் WhatsApp-க்கு link அனுப்பவா? நன்றி.",
      },
      {
        id: "spanish",
        label: "Spanish",
        flag: "🇪🇸",
        lang: "es-ES",
        audioUrl: "/audio/voice-demos/emi-spanish.mp3",
        durationSec: 20,
        context: "Courteous customer account notification and payment arrangement in Spanish.",
        script:
          "Hola, buenos días. Soy Sofía, agente virtual de atención al cliente. Me comunico respecto a su cuenta pendiente de este mes por un importe de 150 euros. Disponemos de pago seguro inmediato mediante enlace digital o tarjeta. ¿Desea que le envíe el enlace de pago directo a su móvil ahora mismo? Perfecto, se lo envío por mensaje. Muchas gracias por su colaboración.",
      },
      {
        id: "uk",
        label: "UK English",
        flag: "🇬🇧",
        lang: "en-GB",
        audioUrl: "/audio/voice-demos/emi-uk.mp3",
        durationSec: 17,
        context: "FCA-compliant polite account instalment reminder in British English.",
        script:
          "Good morning, this is James calling on behalf of FinCare Accounts. I'm reaching out regarding your monthly instalment of forty-five pounds which is currently due. We can facilitate payment via our secure payment portal or debit card over the phone. May I send a direct payment link to your registered mobile number? Thank you very much, you will receive that immediately.",
      },
    ],
  },
];

export default function SarvamVoiceDemoSection() {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    "appointment-management": "hindi",
    "sales-discovery": "english",
    "emi-collection": "hindi",
  });

  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop and clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingCardId(null);
    setCurrentTime(0);
    setTotalDuration(0);
  };

  const handleVariantChange = (cardId: string, variantId: string) => {
    if (playingCardId === cardId) {
      stopCurrentAudio();
    }
    setSelectedVariants((prev) => ({ ...prev, [cardId]: variantId }));
  };

  const playAudio = (card: VoiceAgentCardData) => {
    const variantId = selectedVariants[card.id] || card.defaultVariant;
    const variant = card.variants.find((v) => v.id === variantId) || card.variants[0];

    // If currently playing this card, pause it
    if (playingCardId === card.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingCardId(null);
      return;
    }

    // If was paused on this same card, resume
    if (playingCardId === card.id && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setPlayingCardId(card.id);
      return;
    }

    // Stop anything else currently playing
    stopCurrentAudio();

    const audio = new Audio(variant.audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setTotalDuration(audio.duration || variant.durationSec);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    audio.onended = () => {
      setPlayingCardId(null);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      console.warn("Audio file failed to load, falling back to speech synthesis:", variant.audioUrl);
      // Fallback to speech synthesis if audio file cannot be loaded
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(variant.script);
        utterance.lang = variant.lang;
        utterance.rate = 0.92;
        utterance.onend = () => setPlayingCardId(null);
        window.speechSynthesis.speak(utterance);
      }
    };

    setPlayingCardId(card.id);
    audio.play().catch((e) => {
      console.warn("Audio autoplay prevented:", e);
    });
  };

  const toggleTranscript = (cardId: string) => {
    setExpandedTranscripts((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Studio Neural Voice Demos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Hear Our AI Voice Agents <span className="gradient-text">in Action</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Authentic, human-grade conversational voice agents with native accents and sub-second latency across Indian, UK, and European languages. Choose a language and hit play.
          </p>
        </div>

        {/* 3 Voice Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {VOICE_AGENTS_DATA.map((card) => {
            const currentVariantId = selectedVariants[card.id] || card.defaultVariant;
            const currentVariant = card.variants.find((v) => v.id === currentVariantId) || card.variants[0];
            const isPlaying = playingCardId === card.id;
            const isTranscriptOpen = !!expandedTranscripts[card.id];
            const duration = isPlaying && totalDuration > 0 ? totalDuration : currentVariant.durationSec;
            const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-border/80 bg-white/95 dark:bg-card/90 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden p-6"
              >
                <div>
                  {/* Top Header: Pixel Bot Icon + Call badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <PixelBotIcon theme={card.theme} />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                      <Volume2 className="w-3 h-3 text-primary" />
                      Neural Audio Clip
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {card.description}
                  </p>

                  {/* Language / Accent Switcher Pills */}
                  <div className="mb-6">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Select Accent &amp; Language:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {card.variants.map((v) => {
                        const isSelected = v.id === currentVariantId;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleVariantChange(card.id, v.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-primary text-white shadow-xs scale-102 font-semibold"
                                : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
                            }`}
                          >
                            <span>{v.flag}</span>
                            <span>{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Audio Player & Controls Bar */}
                <div className="pt-4 border-t border-border/60">
                  <div className="bg-secondary/40 rounded-xl p-3 mb-3 border border-border/50">
                    <div className="flex items-center justify-between gap-3">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={() => playAudio(card)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
                          isPlaying
                            ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                            : "bg-primary hover:bg-primary/90 text-white hover:scale-105"
                        }`}
                        title={isPlaying ? "Pause audio" : "Play sample call"}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Animated Waveform Visualizer */}
                      <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden">
                        {[40, 70, 95, 60, 85, 45, 100, 65, 80, 50, 90, 75, 40, 85, 60, 95].map((height, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              isPlaying
                                ? "bg-primary animate-pulse"
                                : "bg-muted-foreground/30"
                            }`}
                            style={{
                              height: isPlaying
                                ? `${Math.max(20, (height * (Math.sin(currentTime * 3 + i) + 1.2)) / 2)}%`
                                : "25%",
                              transitionDelay: `${i * 20}ms`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Duration Display */}
                      <div className="text-xs font-mono font-medium text-muted-foreground shrink-0 tabular-nums">
                        {isPlaying ? formatTime(currentTime) : "0:00"} / {formatTime(duration)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isPlaying && (
                      <div className="w-full bg-border/50 h-1 rounded-full overflow-hidden mt-2.5">
                        <div
                          className="bg-primary h-full transition-all duration-200"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}

                    {/* Context info line */}
                    <div className="text-[11px] text-muted-foreground mt-2 line-clamp-1 italic">
                      🎯 {currentVariant.context}
                    </div>
                  </div>

                  {/* Transcript Accordion Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleTranscript(card.id)}
                      className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <span>{isTranscriptOpen ? "Hide Call Transcript" : "View Call Transcript"}</span>
                      {isTranscriptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                      {isTranscriptOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-3 bg-secondary/50 rounded-xl text-xs text-foreground/90 leading-relaxed border border-border/40 space-y-1.5">
                            <div className="font-semibold text-primary flex items-center gap-1.5">
                              <PhoneCall className="w-3 h-3" />
                              AI Voice Agent Call Script ({currentVariant.label}):
                            </div>
                            <p className="italic text-muted-foreground font-serif">
                              "{currentVariant.script}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Guarantee Strip */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>&lt;800ms Sub-Second Voice Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>TRAI DLT, RBI &amp; TCPA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Real-time Calendar &amp; CRM Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}
