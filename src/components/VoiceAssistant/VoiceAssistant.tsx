import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Send,
  Calendar,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  Square,
} from "lucide-react";
import { AiraEngine } from "./airaEngine";

const ACTIVATION_DELAY_MS = 1_500;
const CHANNEL_NAME = "converseai-voice-assistant";
const SESSION_MSG_KEY = "aira_session_messages";
const SESSION_OPEN_KEY = "aira_session_open";
const POST_SPEECH_COOLDOWN_MS = 600;

type Phase = "idle" | "greeting" | "listening" | "answering" | "paused";

interface ChatMessage {
  id: string;
  sender: "user" | "aira";
  text: string;
  timestamp: string;
}

function useSingleTabLock() {
  const [allowed, setAllowed] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const idRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, id } = event.data ?? {};
      if (id === idRef.current) return;
      if (type === "active") setAllowed(false);
      if (type === "released") setAllowed(true);
    };

    return () => {
      channel.postMessage({ type: "released", id: idRef.current });
      channel.close();
    };
  }, []);

  const announceActive = useCallback(() => {
    channelRef.current?.postMessage({ type: "active", id: idRef.current });
  }, []);

  const announceReleased = useCallback(() => {
    channelRef.current?.postMessage({ type: "released", id: idRef.current });
  }, []);

  return { allowed, announceActive, announceReleased };
}

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allowed, announceActive, announceReleased } = useSingleTabLock();

  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [rvLoaded, setRvLoaded] = useState(false);

  const airaEngineRef = useRef<AiraEngine>(new AiraEngine());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseRef = useRef<Phase>("idle");
  const openRef = useRef(false);
  const isMutedRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    openRef.current = open;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_OPEN_KEY, open ? "true" : "false");
    }
  }, [open]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted && typeof window !== "undefined") {
      if ((window as any).responsiveVoice) {
        (window as any).responsiveVoice.cancel();
      }
      window.speechSynthesis?.cancel();
    }
  }, [isMuted]);

  // Dynamically load ResponsiveVoice HD Engine script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).responsiveVoice) {
      setRvLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://code.responsivevoice.org/responsivevoice.js?key=FREE_KEY";
    script.async = true;
    script.onload = () => {
      setRvLoaded(true);
    };
    script.onerror = () => {
      setRvLoaded(false);
    };
    document.head.appendChild(script);
  }, []);

  // Restore chat from sessionStorage ONLY on soft navigation (Clear history on F5 / Hard Refresh)
  useEffect(() => {
    if (isInitializedRef.current || typeof window === "undefined") return;
    isInitializedRef.current = true;

    try {
      const navEntries = performance.getEntriesByType("navigation");
      const isReload =
        navEntries.length > 0 &&
        (navEntries[0] as PerformanceNavigationTiming).type === "reload";

      if (isReload) {
        sessionStorage.removeItem(SESSION_MSG_KEY);
        sessionStorage.removeItem(SESSION_OPEN_KEY);
      } else {
        const savedMessages = sessionStorage.getItem(SESSION_MSG_KEY);
        const savedOpen = sessionStorage.getItem(SESSION_OPEN_KEY);

        if (savedMessages) {
          const parsed: ChatMessage[] = JSON.parse(savedMessages);
          if (parsed.length > 0) {
            setMessages(parsed);
            if (savedOpen === "true") {
              setOpen(true);
              openRef.current = true;
              announceActive();
              setPhase("listening");
            }
          }
        }
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => setVisible(true), ACTIVATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [announceActive]);

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      sessionStorage.setItem(SESSION_MSG_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Tab Focus & Visibility Handler (Pause background tab mic/speech)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        if ((window as any).responsiveVoice) {
          (window as any).responsiveVoice.cancel();
        }
        window.speechSynthesis?.cancel();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
          recognitionRef.current = null;
        }
      } else {
        if (openRef.current) {
          announceActive();
          setPhase("listening");
          startListeningRef.current();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [announceActive]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const getBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();

    const preferredVoices = [
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Ana Online (Natural) - English (United States)",
      "Google US English",
      "Google UK English Female",
      "Ava (Premium)",
      "Samantha (Enhanced)",
      "Samantha",
      "Victoria",
    ];

    for (const name of preferredVoices) {
      const match = voices.find((v) => v.name.includes(name) || v.name === name);
      if (match) return match;
    }

    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          /natural|online|neural|female|google|aria|jenny|samantha/i.test(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setInterimText("");
  }, []);

  const startListening = useCallback(() => {
    if (!openRef.current || document.hidden) return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    stopListening();

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    setPhase("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          currentInterim += transcriptChunk;
        }
      }

      setInterimText(currentInterim);

      if (finalTranscript.trim()) {
        const query = finalTranscript.trim();
        stopListening();
        answerQuestionRef.current(query);
      }
    };

    recognition.onerror = () => {
      if (openRef.current && phaseRef.current === "listening" && !document.hidden) {
        setTimeout(() => {
          if (openRef.current && phaseRef.current === "listening" && !recognitionRef.current && !document.hidden) {
            try {
              recognition.start();
            } catch {
              // ignore
            }
          }
        }, 400);
      }
    };

    recognition.onend = () => {
      if (openRef.current && !document.hidden && phaseRef.current === "listening") {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    try {
      recognition.start();
    } catch {
      // ignore
    }
  }, [stopListening]);

  const startListeningRef = useRef(startListening);
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      stopListening();

      if (isMutedRef.current || document.hidden || typeof window === "undefined") {
        onDone?.();
        return;
      }

      const rv = (window as any).responsiveVoice;

      // 1. Try ResponsiveVoice HD Cloud Synthesizer (Human Voice)
      if (rv && typeof rv.speak === "function") {
        try {
          rv.cancel();
          window.speechSynthesis?.cancel();

          rv.speak(text, "UK English Female", {
            pitch: 1.0,
            rate: 0.95,
            onend: () => onDone?.(),
            onerror: () => {
              // Fallback to Web Speech API
              fallbackSpeak(text, onDone);
            },
          });
          return;
        } catch {
          // fallback
        }
      }

      // 2. Fallback to Web Speech API Neural Voice Selector
      fallbackSpeak(text, onDone);
    },
    [getBestVoice, stopListening]
  );

  const fallbackSpeak = (text: string, onDone?: () => void) => {
    if (!window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => onDone?.();
    utterance.onerror = () => onDone?.();

    window.speechSynthesis.speak(utterance);
  };

  const answerQuestion = useCallback(
    async (transcript: string) => {
      setInterimText("");
      stopListening();
      if ((window as any).responsiveVoice) {
        (window as any).responsiveVoice.cancel();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        sender: "user",
        text: transcript,
        timestamp: userTime,
      };

      setMessages((prev) => [...prev, userMsg]);
      setPhase("answering");

      const response = airaEngineRef.current.processMessage(transcript);
      const airaTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const airaMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        sender: "aira",
        text: response.reply,
        timestamp: airaTime,
      };

      setMessages((prev) => [...prev, airaMsg]);

      if (response.navigateTo && response.navigateTo !== location.pathname) {
        navigate(response.navigateTo);
      }

      if (response.triggerDemoPopup) {
        window.dispatchEvent(new CustomEvent("open-demo-popup"));
      }

      speak(response.reply, () => {
        if (phaseRef.current === "answering" || phaseRef.current === "greeting") {
          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            if (openRef.current && !document.hidden) {
              setPhase("listening");
              startListening();
            }
          }, POST_SPEECH_COOLDOWN_MS);
        }
      });
    },
    [location.pathname, navigate, speak, stopListening, startListening]
  );

  const answerQuestionRef = useRef(answerQuestion);
  useEffect(() => {
    answerQuestionRef.current = answerQuestion;
  }, [answerQuestion]);

  const handleOpen = useCallback(() => {
    announceActive();
    setOpen(true);
    openRef.current = true;

    if (messages.length > 0) {
      setPhase("listening");
      startListening();
      return;
    }

    airaEngineRef.current.resetState();
    const initial = airaEngineRef.current.getGreeting();
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages([
      {
        id: "greeting",
        sender: "aira",
        text: initial.reply,
        timestamp: initialTime,
      },
    ]);
    setPhase("greeting");

    speak(initial.reply, () => {
      if (phaseRef.current === "greeting" || phaseRef.current === "answering") {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
          if (openRef.current && !document.hidden) {
            setPhase("listening");
            startListening();
          }
        }, POST_SPEECH_COOLDOWN_MS);
      }
    });
  }, [announceActive, messages.length, speak, startListening]);

  const handleStopSpeech = () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    if ((window as any).responsiveVoice) {
      (window as any).responsiveVoice.cancel();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPhase("listening");
    startListening();
  };

  const handleClose = useCallback(() => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    stopListening();
    if ((window as any).responsiveVoice) {
      (window as any).responsiveVoice.cancel();
    }
    window.speechSynthesis?.cancel();
    announceReleased();
    setOpen(false);
    openRef.current = false;
    setPhase("idle");
  }, [announceReleased, stopListening]);

  const handleResetChat = () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    stopListening();
    if ((window as any).responsiveVoice) {
      (window as any).responsiveVoice.cancel();
    }
    window.speechSynthesis?.cancel();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_MSG_KEY);
      sessionStorage.removeItem(SESSION_OPEN_KEY);
    }
    airaEngineRef.current.resetState();
    const initial = airaEngineRef.current.getGreeting();
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: "greeting-" + Date.now(),
        sender: "aira",
        text: initial.reply,
        timestamp: initialTime,
      },
    ]);
    setPhase("greeting");

    speak(initial.reply, () => {
      if (phaseRef.current === "greeting" || phaseRef.current === "answering") {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
          if (openRef.current && !document.hidden) {
            setPhase("listening");
            startListening();
          }
        }, POST_SPEECH_COOLDOWN_MS);
      }
    });
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput("");
    answerQuestion(query);
  };

  const handleChipClick = (query: string) => {
    answerQuestion(query);
  };

  useEffect(() => {
    if (!allowed && open) handleClose();
  }, [allowed, open, handleClose]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      stopListening();
      if ((window as any).responsiveVoice) {
        (window as any).responsiveVoice.cancel();
      }
      window.speechSynthesis?.cancel();
    };
  }, [stopListening]);

  if (!allowed || !visible) return null;

  return createPortal(
    <AnimatePresence>
      {!open ? (
        <motion.button
          key="launcher"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={handleOpen}
          aria-label="Open Aira AI Chatbot"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-indigo-600 text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background" />
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 flex h-[540px] max-h-[85vh] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950 to-primary p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Bot className="h-6 w-6 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">Aira</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase text-emerald-300 border border-emerald-500/30">
                    AI HD Voice
                  </span>
                </div>
                <span className="text-[11px] text-white/80">AI Consultant • Converse AI</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute voice" : "Mute voice"}
                title={isMuted ? "Voice muted (Click to unmute)" : "Voice active (Click to mute)"}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleResetChat}
                aria-label="Restart chat"
                title="Restart chat"
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                aria-label="Close chat"
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between bg-muted/40 px-4 py-2 border-b border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  phase === "listening"
                    ? "animate-ping bg-rose-500"
                    : phase === "greeting" || phase === "answering"
                    ? "animate-pulse bg-primary"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {phase === "listening" && "Listening to your voice..."}
                {(phase === "greeting" || phase === "answering") && "Aira is speaking..."}
                {phase === "paused" && "Voice paused"}
                {phase === "idle" && "Ready to chat"}
              </span>
            </div>

            {(phase === "greeting" || phase === "answering") && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopSpeech}
                  className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
                  title="Stop speaking"
                >
                  <Square className="h-3 w-3 fill-rose-500" /> Stop
                </button>
                <div className="flex items-center gap-0.5">
                  <span className="h-3 w-0.5 animate-pulse bg-primary [animation-delay:-0.3s]" />
                  <span className="h-4 w-0.5 animate-pulse bg-primary [animation-delay:-0.15s]" />
                  <span className="h-2 w-0.5 animate-pulse bg-primary" />
                  <span className="h-3.5 w-0.5 animate-pulse bg-primary [animation-delay:-0.2s]" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[90%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-tr from-primary to-purple-600 text-white"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-card text-card-foreground border border-border/60 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] text-muted-foreground mt-1 px-1 ${
                      msg.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {interimText && (
              <div className="flex gap-2.5 max-w-[90%] ml-auto flex-row-reverse opacity-70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/70 text-white text-xs font-semibold">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl px-3.5 py-2 text-xs bg-primary/20 text-foreground italic">
                  {interimText}...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-t border-border/40 bg-background scrollbar-none">
            <button
              onClick={() => handleChipClick("Tell me about AI Voice Agents")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              🎙️ Voice Agents
            </button>
            <button
              onClick={() => handleChipClick("Tell me about WhatsApp AI Chatbot")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              💬 WhatsApp Bot
            </button>
            <button
              onClick={() => handleChipClick("How does Custom AI Automation work?")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              ⚡ Custom AI
            </button>
            <button
              onClick={() => handleChipClick("I want to book a consultation call")}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              📅 Book Call
            </button>
          </div>

          {/* Chat Footer / Input Form */}
          <div className="p-3 bg-background border-t border-border/60">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (phase === "greeting" || phase === "answering") {
                    handleStopSpeech();
                  } else if (phase === "listening") {
                    stopListening();
                    setPhase("idle");
                  } else {
                    startListening();
                  }
                }}
                title={
                  phase === "greeting" || phase === "answering"
                    ? "Click to stop Aira speaking"
                    : phase === "listening"
                    ? "Click to pause microphone"
                    : "Click to start speaking"
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                  phase === "greeting" || phase === "answering"
                    ? "bg-amber-500 text-white animate-pulse shadow-md"
                    : phase === "listening"
                    ? "bg-rose-500 text-white animate-ping shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {phase === "greeting" || phase === "answering" ? (
                  <Square className="h-4 w-4 fill-white" />
                ) : phase === "listening" ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask Aira anything..."
                className="flex-1 rounded-xl border bg-muted/30 px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
              />

              <button
                type="submit"
                disabled={!textInput.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-all shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="text-[9px] text-muted-foreground">
                Powered by <strong className="font-semibold text-foreground/80">Converse AI</strong>
              </span>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-demo-popup"));
                }}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" /> Book Call
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VoiceAssistant;
