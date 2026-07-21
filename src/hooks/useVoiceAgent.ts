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

// The single opening line used both when the user starts the agent and when
// the agent proactively engages after the idle timeout.
const WELCOME = "Hi! Welcome to ConverseAI. What would you like to know?";

interface Options {
  /** ms of inactivity on a page before the agent proactively offers help. */
  idleMs?: number;
  /** Called when the agent wants to start blog read-aloud. */
  onReadAloud?: () => void;
  /** Whether proactive engagement is enabled. */
  proactive?: boolean;
}

export function useVoiceAgent(opts: Options = {}) {
  const { idleMs = 30000, onReadAloud, proactive = true } = opts;
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
    // Slightly slower than default for clearer, more natural pronunciation.
    await speak(text, { rate: 0.98 });
    if (!activeRef.current) return;
    if (thenListen) startListening();
    else setStateBoth("idle");
  }, []);

  // ── Handle an utterance (from speech OR the text box) ─────────────────────────
  const handleTranscript = useCallback(
    async (text: string, viaText = false) => {
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
      // Always answer with speech. After a TYPED question, don't grab the mic —
      // the user chose to type, so keep the text box focused instead.
      await say(result.speech, !viaText);
    },
    [location.pathname, navigate, onReadAloud, say]
  );

  /** Answer a typed question (text fallback) with a spoken reply. */
  const submitText = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
      }
      cancelSpeech();
      handleTranscript(text, true);
    },
    [handleTranscript]
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
    say(WELCOME, true);
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
  // ~30s after landing on a page, greet the visitor and offer help. We do NOT
  // reset this on every mouse move (that would keep it from ever firing during
  // normal reading); we only defer briefly if the user is mid-scroll, so we
  // don't speak over an active interaction.
  useEffect(() => {
    if (!proactive || !supported) return;
    const key = location.pathname;
    if (proactiveDone.current.has(key)) return;

    let lastScroll = 0;
    const onScroll = () => { lastScroll = Date.now(); };
    window.addEventListener("scroll", onScroll, { passive: true });

    const clearIdle = () => idleTimer.current && clearTimeout(idleTimer.current);
    const fire = () => {
      if (activeRef.current || proactiveDone.current.has(key)) return;
      // If the user scrolled within the last 3s, wait a bit and try again.
      if (Date.now() - lastScroll < 3000) {
        idleTimer.current = setTimeout(fire, 3000);
        return;
      }
      proactiveDone.current.add(key);
      activeRef.current = true;
      setActive(true);
      say(WELCOME, true);
    };
    idleTimer.current = setTimeout(fire, idleMs);

    return () => {
      clearIdle();
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname, idleMs, proactive, supported, say]);

  // Reset per-route conversational context on navigation.
  useEffect(() => {
    contextRef.current = {};
  }, [location.pathname]);

  useEffect(() => () => stop(), [stop]);

  return { active, state, caption, supported, start, stop, toggle, submitText };
}
