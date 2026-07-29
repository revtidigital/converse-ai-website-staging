import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";
import { matchTopic, FALLBACK_ANSWER } from "./topics";
import { fetchPageAnswer } from "./pageContent";

const ACTIVATION_DELAY_MS = 5_000;
const CHANNEL_NAME = "converseai-voice-assistant";

type Phase = "idle" | "greeting" | "listening" | "answering" | "paused";

const STOP_WORDS = ["stop", "pause", "wait", "hold on"];
const CONTINUE_WORDS = ["continue", "resume", "go on", "carry on"];

function containsAny(transcript: string, words: string[]): boolean {
  const text = transcript.toLowerCase();
  return words.some((w) => text.includes(w));
}

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
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bargeRecognitionRef = useRef<SpeechRecognition | null>(null);
  const answerRequestIdRef = useRef(0);

  // Mirrors of state that async speech callbacks need to read without
  // capturing stale closures (they fire long after the render that created them).
  const phaseRef = useRef<Phase>("idle");
  const openRef = useRef(false);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), ACTIVATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
  }, []);

  const getBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const preferredNames = [
      "Google US English",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Samantha",
    ];
    for (const name of preferredNames) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }
    return (
      voices.find((v) => v.lang === "en-US" && /female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }, []);

  const stopBargeInListening = useCallback(() => {
    const recognition = bargeRecognitionRef.current;
    if (!recognition) return;
    recognition.onend = null;
    recognition.abort();
    bargeRecognitionRef.current = null;
  }, []);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onDone?.();
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 1.05;
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      // Chrome silently halts long utterances after ~15s and can replay
      // from the start unless kept alive with periodic pause/resume.
      // Suspended while genuinely paused (user said "stop") so it doesn't
      // fight the real pause.
      const keepAlive = window.setInterval(() => {
        if (!window.speechSynthesis.speaking || phaseRef.current === "paused") return;
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10_000);

      utterance.onend = () => {
        window.clearInterval(keepAlive);
        onDone?.();
      };
      utterance.onerror = () => {
        window.clearInterval(keepAlive);
        onDone?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [getBestVoice]
  );

  const startListening = useCallback(() => {
    if (!openRef.current) return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setLastAnswer("Voice input isn't supported in this browser. Please try Chrome or Edge.");
      setPhase("answering");
      return;
    }

    stopBargeInListening();
    recognitionRef.current?.abort();

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setPhase("listening");

    // A single session can fire onresult and then still fire a trailing
    // onerror (e.g. "aborted" once we move on to the next step) — this flag
    // stops that trailing error from overwriting the answer already shown.
    let handled = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      handled = true;
      const transcript = event.results[0][0].transcript;
      answerQuestionRef.current(transcript);
    };

    recognition.onerror = () => {
      if (handled || recognitionRef.current !== recognition) return;
      handled = true;
      setLastQuestion("");
      setLastAnswer("I couldn't hear that clearly. Please try again.");
      setPhase("answering");
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };

    recognition.start();
  }, [stopBargeInListening]);

  const startBargeInListening = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    bargeRecognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;

      if (phaseRef.current === "paused") {
        if (containsAny(transcript, CONTINUE_WORDS)) {
          window.speechSynthesis.resume();
          setPhase("answering");
          return;
        }
        // Anything else while paused is treated as a fresh question.
        window.speechSynthesis.cancel();
        stopBargeInListening();
        answerQuestionRef.current(transcript);
        return;
      }

      if (phaseRef.current === "answering") {
        if (containsAny(transcript, STOP_WORDS)) {
          window.speechSynthesis.pause();
          setPhase("paused");
          return;
        }
        // Barge-in: user asked something new while the assistant was
        // still talking. Cut it off and answer the new question instead.
        window.speechSynthesis.cancel();
        stopBargeInListening();
        answerQuestionRef.current(transcript);
      }
    };

    recognition.onerror = () => {
      // Mic hiccups shouldn't kill the pause/continue/barge-in channel;
      // onend below restarts it while still relevant.
    };

    recognition.onend = () => {
      if (bargeRecognitionRef.current !== recognition) return;
      bargeRecognitionRef.current = null;
      if (
        openRef.current &&
        (phaseRef.current === "answering" || phaseRef.current === "paused")
      ) {
        startBargeInListening();
      }
    };

    try {
      recognition.start();
    } catch {
      // start() throws if a recognition session is already active; safe to ignore.
    }
  }, [stopBargeInListening]);

  const answerQuestion = useCallback(
    async (transcript: string) => {
      setLastQuestion(transcript);
      const topic = matchTopic(transcript);

      if (!topic) {
        setLastAnswer(FALLBACK_ANSWER);
        setPhase("answering");
        startBargeInListening();
        speak(FALLBACK_ANSWER, () => {
          stopBargeInListening();
          if (phaseRef.current !== "answering") return;
          startListening();
        });
        return;
      }

      // Read the real, current content of the matched page instead of a
      // canned string — the assistant should always say what's actually
      // on the site right now, not a hardcoded blurb that can go stale.
      setLastAnswer("");
      setPhase("answering");
      startBargeInListening();
      const requestId = ++answerRequestIdRef.current;
      const extracted = await fetchPageAnswer(topic.path, transcript);
      if (requestId !== answerRequestIdRef.current) return; // superseded by a newer question

      const answer = extracted || `Let me show you our ${topic.label} page.`;
      setLastAnswer(answer);
      speak(answer, () => {
        stopBargeInListening();
        if (phaseRef.current !== "answering") return; // stopped mid-answer, don't auto-continue
        navigate(topic.path);
        startListening();
      });
    },
    [navigate, speak, startBargeInListening, stopBargeInListening, startListening]
  );

  // startListening/startBargeInListening are defined before answerQuestion but
  // need to call it (defined after, to avoid a circular useCallback dependency).
  const answerQuestionRef = useRef(answerQuestion);
  useEffect(() => {
    answerQuestionRef.current = answerQuestion;
  }, [answerQuestion]);

  const handleOpen = useCallback(() => {
    announceActive();
    setOpen(true);
    openRef.current = true;
    setPhase("greeting");
    setLastQuestion("");
    setLastAnswer("");
    speak(
      "Hi, I'm your assistant. What would you like to know? For example, our services, pricing, or WhatsApp marketing.",
      () => startListening()
    );
  }, [announceActive, speak, startListening]);

  const handleClose = useCallback(() => {
    recognitionRef.current?.abort();
    stopBargeInListening();
    window.speechSynthesis?.cancel();
    announceReleased();
    setOpen(false);
    openRef.current = false;
    setPhase("idle");
  }, [announceReleased, stopBargeInListening]);

  useEffect(() => {
    if (!allowed && open) handleClose();
  }, [allowed, open, handleClose]);

  // Navigating unmounts/remounts this component. Without this, the
  // in-flight recognition/speech objects kept running in the
  // background off old closures — talking over themselves and
  // re-triggering stale answers/navigations on the new page.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopBargeInListening();
      window.speechSynthesis?.cancel();
    };
  }, [stopBargeInListening]);

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

          <div className="mb-2 flex items-center justify-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                phase === "listening"
                  ? "animate-pulse bg-red-500"
                  : phase === "greeting" || phase === "answering"
                  ? "animate-pulse bg-primary"
                  : phase === "paused"
                  ? "bg-amber-500"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {phase === "listening" && "Listening…"}
              {phase === "greeting" && "Speaking…"}
              {phase === "answering" && "Speaking…"}
              {phase === "paused" && "Paused"}
              {phase === "idle" && "Idle"}
            </span>
          </div>

          <div className="flex min-h-[48px] items-center justify-center gap-2">
            {(phase === "greeting" || phase === "answering") && (
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </span>
            )}
            {phase === "listening" && (
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            )}
            {phase === "paused" && (
              <span className="h-3 w-3 rounded-full bg-amber-500" />
            )}
          </div>

          {(lastQuestion || lastAnswer) && (
            <div className="mt-1 max-h-48 space-y-2 overflow-y-auto text-sm">
              {lastQuestion && (
                <p className="rounded-lg bg-muted px-3 py-2 text-right text-foreground">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    You
                  </span>
                  {lastQuestion}
                </p>
              )}
              {lastAnswer && (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-foreground">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Assistant
                  </span>
                  {lastAnswer}
                </p>
              )}
            </div>
          )}

          {phase === "answering" && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Say "stop" to pause, or just ask another question.
            </p>
          )}
          {phase === "paused" && (
            <p className="mt-2 text-center text-xs font-medium text-amber-600">
              Paused. Say "continue" to resume.
            </p>
          )}

          {(phase === "answering" || phase === "paused") && (
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                stopBargeInListening();
                setLastQuestion("");
                setLastAnswer("");
                startListening();
              }}
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
