// Orchestrates the voice agent: speech recognition (STT), speaking (TTS),
// the conversation state machine, multi-turn context, barge-in, and the
// proactive idle prompt. All browser-native and free.

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { respond, type AgentResult } from "@/lib/voice/brain";
import { speak, cancelSpeech, primeVoices, isTTSSupported } from "@/lib/voice/tts";

export type AgentState = "idle" | "listening" | "thinking" | "speaking";

// Minimal typing for the Web Speech API (not in TS DOM lib by default).
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported(): boolean {
  return !!getRecognitionCtor() && isTTSSupported();
}

const IDLE_PROMPTS = [
  "Would you like a quick summary of this page?",
  "Can I explain the main points for you?",
  "Would you like to know the key takeaways?",
  "Need help understanding this topic? Just tap the mic.",
];

interface Options {
  /** ms of inactivity on a page before the agent proactively offers help. */
  idleMs?: number;
  /** Called when the agent wants to start blog read-aloud. */
  onReadAloud?: () => void;
  /** Whether proactive engagement is enabled. */
  proactive?: boolean;
}

export function useVoiceAgent(opts: Options = {}) {
  const { idleMs = 45000, onReadAloud, proactive = true } = opts;
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false); // conversation open
  const [state, setState] = useState<AgentState>("idle");
  const [caption, setCaption] = useState(""); // last spoken line (accessibility only)
  const [supported] = useState(isVoiceSupported());

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const contextRef = useRef<{ lastTopic?: string; lastFollowUp?: string }>({});
  const activeRef = useRef(false);
  const stateRef = useRef<AgentState>("idle");
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proactiveDone = useRef<Set<string>>(new Set());

  const setStateBoth = (s: AgentState) => {
    stateRef.current = s;
    setState(s);
  };

  useEffect(() => {
    primeVoices();
  }, []);

  // ── Speaking ───────────────────────────────────────────────────────────────
  const say = useCallback(async (text: string, thenListen = true) => {
    if (!text) return;
    setCaption(text);
    setStateBoth("speaking");
    await speak(text, { rate: 1.02 });
    if (!activeRef.current) return;
    if (thenListen) startListening();
    else setStateBoth("idle");
  }, []);

  // ── Handle a recognized utterance ────────────────────────────────────────────
  const handleTranscript = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeRef.current) return;
      setStateBoth("thinking");
      let result: AgentResult;
      try {
        result = await respond(text, {
          pathname: location.pathname,
          lastTopic: contextRef.current.lastTopic,
          lastFollowUp: contextRef.current.lastFollowUp,
        });
      } catch {
        result = { speech: "Sorry, I didn't catch that. Could you say it again?" };
      }
      if (result.topic) contextRef.current.lastTopic = result.topic;
      // Remember the follow-up we just offered so "yes" can accept it.
      const fu = result.speech.match(/Would you like[^?]*\?/i);
      contextRef.current.lastFollowUp = fu ? fu[0] : undefined;

      if (result.navigateTo) navigate(result.navigateTo);
      if (result.startReadAloud) onReadAloud?.();

      if (result.stop) {
        await say(result.speech, false);
        stop();
        return;
      }
      await say(result.speech, true);
    },
    [location.pathname, navigate, onReadAloud, say]
  );

  // ── Listening ────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !activeRef.current) return;
    cancelSpeech();
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ")
        .trim();
      if (transcript) handleTranscript(transcript);
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        say("I need microphone access to talk with you. Please allow it in your browser.", false);
        stop();
      } else if (stateRef.current === "listening") {
        setStateBoth("idle");
      }
    };
    rec.onend = () => {
      if (activeRef.current && stateRef.current === "listening") {
        // No speech captured; drop back to idle-but-open.
        setStateBoth("idle");
      }
    };
    recRef.current = rec;
    setStateBoth("listening");
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }, [handleTranscript, say]);

  // ── Barge-in: user taps mic while agent is speaking ──────────────────────────
  const interrupt = useCallback(() => {
    cancelSpeech();
    startListening();
  }, [startListening]);

  // ── Public controls ──────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!supported) return;
    activeRef.current = true;
    setActive(true);
    say(
      "Hi! I'm your ConverseAI voice guide. You can ask me about this page, say 'summarize this page', or ask me to open any page. What would you like to know?",
      true
    );
  }, [say, supported]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    cancelSpeech();
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    setStateBoth("idle");
    setCaption("");
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) {
      if (stateRef.current === "speaking") interrupt();
      else startListening();
    } else {
      start();
    }
  }, [interrupt, start, startListening]);

  // ── Proactive idle engagement ────────────────────────────────────────────────
  useEffect(() => {
    if (!proactive || !supported) return;
    const clearIdle = () => idleTimer.current && clearTimeout(idleTimer.current);

    const arm = () => {
      clearIdle();
      const key = location.pathname;
      if (proactiveDone.current.has(key)) return;
      idleTimer.current = setTimeout(() => {
        // Never interrupt an ongoing conversation or active scrolling.
        if (activeRef.current) return;
        proactiveDone.current.add(key);
        activeRef.current = true;
        setActive(true);
        const prompt = IDLE_PROMPTS[Math.floor(Math.random() * IDLE_PROMPTS.length)];
        say(prompt, true);
      }, idleMs);
    };

    const onActivity = () => arm();
    arm();
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("mousemove", onActivity, { passive: true });
    return () => {
      clearIdle();
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("mousemove", onActivity);
    };
    // Re-arm per route.
  }, [location.pathname, idleMs, proactive, supported, say]);

  // Reset per-route conversational context on navigation.
  useEffect(() => {
    contextRef.current = {};
  }, [location.pathname]);

  useEffect(() => () => stop(), [stop]);

  return { active, state, caption, supported, start, stop, toggle };
}
