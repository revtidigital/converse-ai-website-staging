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

// Voice control commands handled directly (before the brain) so start / stop /
// repeat behave exactly on command.
const QUIET_RE = /^\s*(stop|be quiet|quiet|shut up|pause|stop (talking|speaking|reading)|silence)\s*[.!]?\s*$/i;
const START_RE = /^\s*(start|begin|start listening|wake up|are you (there|awake)|hello again|let'?s (start|begin|talk))\s*[.!]?\s*$/i;
const REPEAT_RE = /^\s*(repeat|repeat that|say (that|it) again|come again|what did you say|pardon|again)\s*[.!]?\s*$/i;

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
  const contextRef = useRef<{ lastTopic?: string; lastFollowUp?: string; lastEntity?: string; lastQuestion?: string }>({});
  const activeRef = useRef(false);
  const stateRef = useRef<AgentState>("idle");
  const lastAnswerRef = useRef<string>(""); // for the "repeat" command
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

      // ── Direct voice controls (handled before the brain) ──────────────────
      // "stop" → stop speaking immediately but keep the session open & listening.
      if (QUIET_RE.test(text)) {
        cancelSpeech();
        if (viaText) setStateBoth("idle");
        else startListening();
        return;
      }
      // "start" → greet again, like a fresh opening.
      if (START_RE.test(text)) {
        await say(WELCOME, !viaText);
        return;
      }
      // "repeat" → say the last answer again.
      if (REPEAT_RE.test(text)) {
        await say(lastAnswerRef.current || WELCOME, !viaText);
        return;
      }

      setStateBoth("thinking");
      let result: AgentResult;
      try {
        result = await respond(text, {
          pathname: location.pathname,
          lastTopic: contextRef.current.lastTopic,
          lastFollowUp: contextRef.current.lastFollowUp,
          lastEntity: contextRef.current.lastEntity,
        });
      } catch {
        result = { speech: "Sorry, I didn't catch that. Could you say it again?" };
      }
      contextRef.current.lastQuestion = text;
      if (result.topic) contextRef.current.lastTopic = result.topic;
      // Remember the named entity ("Sierra AI") so a follow-up "…better than it?"
      // resolves the referent. Only overwrite when a new entity was discussed.
      if (result.entity) contextRef.current.lastEntity = result.entity;
      // Remember the follow-up we just offered so "yes" can accept it.
      const fu = result.speech.match(/Would you like[^?]*\?/i);
      contextRef.current.lastFollowUp = fu ? fu[0] : undefined;

      // Remember the substantive answer so "repeat" can replay it.
      if (result.speech && result.speech.length > 12) lastAnswerRef.current = result.speech;

      if (result.externalNavigateTo && typeof window !== "undefined") {
        // Cross-origin (e.g. main site → blog host): speak first, then go.
        await say(result.speech, false);
        window.location.href = result.externalNavigateTo;
        return;
      }
      if (result.navigateTo) navigate(result.navigateTo);

      if (result.stop) {
        await say(result.speech, false);
        stop();
        return;
      }
      // Read-aloud: speak the short confirmation FIRST, then hand off to the
      // blog player. Triggering it before `say()` would be pointless — `say()`
      // calls cancelSpeech() and would immediately kill the narration. We also
      // don't grab the mic, so the article can play uninterrupted.
      if (result.startReadAloud) {
        await say(result.speech, false);
        onReadAloud?.();
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
    // Continuous keeps the mic open across pauses (fewer restart gaps); interim
    // results stay OFF so we only ever act on the FINAL, stable transcript and
    // never fire on an unstable partial.
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      // Only take results the engine marked final. Concatenate just the final
      // segments of this event so a half-heard partial can't trigger an action.
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) transcript += r[0].transcript + " ";
      }
      transcript = transcript.trim();
      // Ignore empty/noise blips; require a real word before acting.
      if (transcript.length < 2 || !/[a-z0-9]/i.test(transcript)) return;
      handleTranscript(transcript);
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        say("I need microphone access to talk with you. Please allow it in your browser.", false);
        stop();
        return;
      }
      // Any other error ("no-speech", "network", "aborted") is non-fatal — we
      // silently keep the mic alive via onend's auto-restart. No error is shown.
    };
    rec.onend = () => {
      // Keep listening continuously so the agent doesn't stop on its own after
      // a pause. It only stops when the user says "stop"/"close" or taps close.
      if (activeRef.current && stateRef.current === "listening") {
        setTimeout(() => {
          if (activeRef.current && stateRef.current === "listening") startListening();
        }, 250);
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
