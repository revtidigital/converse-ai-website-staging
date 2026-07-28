import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";
import { matchTopic, FALLBACK_ANSWER } from "./topics";

const ACTIVATION_DELAY_MS = 5_000;
const CHANNEL_NAME = "converseai-voice-assistant";

type Phase = "idle" | "greeting" | "listening" | "answering";

// Only one tab may run the assistant at a time. Every tab announces
// itself when it activates; any tab that hears another tab's
// announcement backs off and stays hidden until that tab closes.
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
  const { allowed, announceActive, announceReleased } = useSingleTabLock();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastAnswer, setLastAnswer] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), ACTIVATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => onDone?.();
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setLastAnswer("Voice input isn't supported in this browser. Please try Chrome or Edge.");
      setPhase("answering");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setPhase("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const topic = matchTopic(transcript);
      const answer = topic ? topic.answer : FALLBACK_ANSWER;
      setLastAnswer(answer);
      setPhase("answering");
      speak(answer, () => {
        if (topic) navigate(topic.path);
      });
    };

    recognition.onerror = () => {
      setLastAnswer("I couldn't hear that clearly. Please try again.");
      setPhase("answering");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognition.start();
  }, [navigate, speak]);

  const handleOpen = useCallback(() => {
    announceActive();
    setOpen(true);
    setPhase("greeting");
    setLastAnswer("");
    speak(
      "Hi, I'm your assistant. What would you like to know? For example, our services, pricing, or WhatsApp marketing.",
      () => startListening()
    );
  }, [announceActive, speak, startListening]);

  const handleClose = useCallback(() => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    announceReleased();
    setOpen(false);
    setPhase("idle");
  }, [announceReleased]);

  useEffect(() => {
    if (!allowed && open) handleClose();
  }, [allowed, open, handleClose]);

  if (!allowed || !visible) return null;

  return createPortal(
    <AnimatePresence>
      {!open ? (
        <motion.button
          key="launcher"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={handleOpen}
          aria-label="Open voice assistant"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 rounded-l-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:pr-6 transition-all"
        >
          <Mic className="h-5 w-5" />
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 rounded-2xl border bg-background p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Assistant</span>
            <button onClick={handleClose} aria-label="Close voice assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-[64px] text-sm text-muted-foreground">
            {phase === "greeting" && "Speaking..."}
            {phase === "listening" && "Listening — go ahead and ask."}
            {phase === "answering" && lastAnswer}
          </div>

          {phase === "answering" && (
            <button
              onClick={startListening}
              className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
            >
              Ask another question
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VoiceAssistant;
