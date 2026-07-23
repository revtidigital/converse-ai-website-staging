// Orchestrates the voice agent: speech recognition (STT), speaking (TTS),
// the conversation state machine, multi-turn context, barge-in, and the
// proactive idle prompt. All browser-native and free.

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { respond, type AgentResult } from "@/lib/voice/brain";
import { speak, cancelSpeech, pauseSpeech, resumeSpeech, primeVoices, warmNeuralVoice, unlockAudio, onKokoroReady, isTTSSupported } from "@/lib/voice/tts";
import { detectSpeechCapabilities } from "@/lib/voice/speech/capability";
import { NativeSpeechRecognitionAdapter } from "@/lib/voice/speech/nativeSpeechRecognition";
import type { AgentState } from "@/lib/voice/session/types";
import { handleContactWorkflow, resetContactWorkflow } from "@/lib/voice/contactWorkflow";
import { schedulingService } from "@/lib/voice/schedulingService";
import { VoiceTiming } from "@/lib/voice/performance";

export type { AgentState };

export function isVoiceSupported(): boolean {
  return detectSpeechCapabilities().nativeSpeechRecognition.available && isTTSSupported();
}

// The single opening line used both when the user starts the agent and when
// the agent proactively engages after the idle timeout.
const WELCOME = "Hi! Welcome to ConverseAI. What would you like to know?";

// Voice control commands handled directly (before the brain) so start / stop /
// repeat behave exactly on command.
// NOTE: a bare "stop" is deliberately NOT here — the user wants "stop" to fully
// end the agent (handled by the brain's STOP intent). QUIET only PAUSES the
// current speech while keeping the mic open, so the user can barge in by voice.
const QUIET_RE = /^\s*(be quiet|quiet|hush|pause|wait|hold on|one (sec|second|moment)|stop (talking|speaking|reading))\s*[.!]?\s*$/i;
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
  const playbackCooldownMs = 350;
  const inactivityMs = 120000;
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false); // conversation open
  const [state, setState] = useState<AgentState>("idle");
  const [caption, setCaption] = useState(""); // last spoken line (accessibility only)
  const [supported] = useState(isVoiceSupported());
  const [neuralReady, setNeuralReady] = useState(false); // human voice loaded?

  const recognitionRef = useRef<NativeSpeechRecognitionAdapter | null>(null);
  const startListeningRef = useRef<() => void>(() => undefined);
  const handleTranscriptRef = useRef<(text: string) => void>(() => undefined);
  const sayRef = useRef<(text: string, thenListen?: boolean) => Promise<void>>(async () => undefined);
  const stopRef = useRef<() => void>(() => undefined);
  const contextRef = useRef<{ lastTopic?: string; lastFollowUp?: string; lastEntity?: string; lastQuestion?: string }>({});
  const activeRef = useRef(false);
  const stateRef = useRef<AgentState>("idle");
  const lastAnswerRef = useRef<string>(""); // for the "repeat" command
  const pausedSpeakingRef = useRef(false); // an answer was paused mid-sentence
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proactiveDone = useRef<Set<string>>(new Set());
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnAbortRef = useRef<AbortController | null>(null);
  const turnIdRef = useRef(0);
  const lastTranscriptRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const rateRef = useRef(0.98);

  const setStateBoth = (s: AgentState) => {
    stateRef.current = s;
    setState(s);
  };

  useEffect(() => {
    primeVoices();
    if (!supported) return;
    // Start downloading the human neural voice as soon as the visitor interacts
    // with the page at all (scroll / tap / key), so it's ready by the time they
    // open the agent — instead of them hearing the robotic fallback while it
    // loads. Fires once, then removes itself.
    const warmOnce = () => {
      warmNeuralVoice();
      window.removeEventListener("pointerdown", warmOnce);
      window.removeEventListener("keydown", warmOnce);
      window.removeEventListener("scroll", warmOnce);
    };
    window.addEventListener("pointerdown", warmOnce, { once: true, passive: true });
    window.addEventListener("keydown", warmOnce, { once: true, passive: true });
    window.addEventListener("scroll", warmOnce, { once: true, passive: true });
    onKokoroReady(() => setNeuralReady(true));
    return () => {
      window.removeEventListener("pointerdown", warmOnce);
      window.removeEventListener("keydown", warmOnce);
      window.removeEventListener("scroll", warmOnce);
    };
  }, [supported]);

  // ── Speaking ───────────────────────────────────────────────────────────────
  const say = useCallback(async (text: string, thenListen = true) => {
    if (!text) return;
    setCaption(text);
    setStateBoth("speaking");
    // Slightly slower than default for clearer, more natural pronunciation.
    await speak(text, { rate: rateRef.current });
    if (!activeRef.current) return;
    if (thenListen) setTimeout(() => { if (activeRef.current) startListeningRef.current(); }, playbackCooldownMs);
    else setStateBoth("idle");
  }, []);

  // ── Handle an utterance (from speech OR the text box) ─────────────────────────
  const handleTranscript = useCallback(
    async (text: string, viaText = false) => {
      if (!text.trim() || !activeRef.current) return;
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
      sessionTimer.current = setTimeout(() => { if (activeRef.current) sayRef.current("I’ll pause here for now. Tap the mic when you want to continue.", false).then?.(() => stopRef.current()); }, inactivityMs);
      const timing = new VoiceTiming();
      timing.mark("transcript-received");
      const normalizedTranscript = text.trim().toLowerCase();
      if (!viaText && normalizedTranscript === lastTranscriptRef.current.text && Date.now() - lastTranscriptRef.current.at < 2500) return;
      lastTranscriptRef.current = { text: normalizedTranscript, at: Date.now() };
      // Ignore anything that arrives while we're already handling a turn (e.g. a
      // late STT result echoing in) so one question is answered cleanly before
      // the next is taken. Typed input always goes through.
      if (!viaText && stateRef.current === "thinking") return;
      if (!viaText && stateRef.current === "speaking") {
        cancelSpeech();
        turnAbortRef.current?.abort();
      }
      // Turn off the mic for the rest of this turn so the agent never hears its
      // own spoken answer. say() re-opens it once it finishes speaking.
      if (!viaText) {
        try {
          recognitionRef.current?.abort();
        } catch {
          /* ignore */
        }
      }

      // ── Direct voice controls (handled before the brain) ──────────────────
      // "stop" → stop speaking immediately but keep the session open & listening.
      if (QUIET_RE.test(text)) {
        cancelSpeech();
        if (viaText) setStateBoth("idle");
        else startListeningRef.current();
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
      if (/^\s*(slower|slow down)\s*[.!]?\s*$/i.test(text)) { rateRef.current = Math.max(0.75, rateRef.current - 0.12); await say("Sure, I’ll slow down.", !viaText); return; }
      if (/^\s*(faster|speed up)\s*[.!]?\s*$/i.test(text)) { rateRef.current = Math.min(1.25, rateRef.current + 0.12); await say("Sure, I’ll speak a bit faster.", !viaText); return; }
      if (/^\s*(continue|resume)\s*[.!]?\s*$/i.test(text)) { startListeningRef.current(); return; }

      const contact = handleContactWorkflow(text, location.pathname);
      if (contact.handled) { await say(contact.speech, !viaText); return; }
      if (/\b(schedule|book).*(call|demo|meeting)|talk to sales\b/i.test(text)) {
        if (!schedulingService.hasRealAvailability()) {
          navigate(schedulingService.getSchedulingUrl());
          await say("I can take you to the demo request page, but a live calendar scheduling API is not configured, so I won’t claim a slot is booked until the backend confirms it.", !viaText);
          return;
        }
      }

      setStateBoth("thinking");
      timing.mark("thinking-state");
      const turnId = ++turnIdRef.current;
      turnAbortRef.current?.abort();
      turnAbortRef.current = new AbortController();
      let result: AgentResult;
      try {
        result = await respond(text, {
          pathname: location.pathname,
          lastTopic: contextRef.current.lastTopic,
          lastFollowUp: contextRef.current.lastFollowUp,
          lastEntity: contextRef.current.lastEntity,
        });
        if (turnId !== turnIdRef.current) return;
        timing.mark("brain-complete");
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
        stopRef.current();
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
      timing.mark("speech-start-requested");
      await say(result.speech, !viaText);
      timing.mark("speech-complete");
      timing.flush();
    },
    [location.pathname, navigate, onReadAloud, say]
  );

  /** Answer a typed question (text fallback) with a spoken reply. */
  const submitText = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      unlockAudio(); // typing+send is a gesture — unlock audio so the reply plays
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
    if (!recognitionRef.current) recognitionRef.current = new NativeSpeechRecognitionAdapter();
    const recognition = recognitionRef.current;
    if (!recognition.isSupported() || !activeRef.current) return;
    cancelSpeech();
    setStateBoth("listening");
    recognition.start();
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => { if (activeRef.current && stateRef.current === "listening") sayRef.current("I’ll pause here for now. Tap the mic when you want to continue.", false).then?.(() => stopRef.current()); }, inactivityMs);
  }, []);


  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // ── Public controls ──────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!supported) return;
    activeRef.current = true;
    setActive(true);
    unlockAudio(); // must run on this tap so neural audio can actually play
    warmNeuralVoice(); // begin the human-voice download now the user has engaged
    say(WELCOME, true);
  }, [say, supported]);

  // The ✕ button truly ENDS the session: closes the panel and forgets the
  // conversation, so the next time the agent opens it starts fresh.
  const stop = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    turnAbortRef.current?.abort();
    cancelSpeech();
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    setStateBoth("idle");
    setCaption("");
    pausedSpeakingRef.current = false;
    contextRef.current = {};
    resetContactWorkflow();
  }, []);


  useEffect(() => {
    handleTranscriptRef.current = handleTranscript;
  }, [handleTranscript]);

  useEffect(() => {
    sayRef.current = say;
  }, [say]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    if (!recognitionRef.current) recognitionRef.current = new NativeSpeechRecognitionAdapter();
    const recognition = recognitionRef.current;
    return recognition.onEvent((event) => {
      if (event.type === "transcript") {
        handleTranscriptRef.current(event.transcript);
        return;
      }
      if (event.type === "permission-denied") {
        sayRef.current("I need microphone access to talk with you. Please allow it in your browser.", false);
        stopRef.current();
        return;
      }
      if (event.type === "end") {
        // Keep listening continuously so the agent doesn't stop on its own after
        // a pause. It only stops when the user says "stop"/"close" or taps close.
        if (activeRef.current && stateRef.current === "listening") {
          setTimeout(() => {
            if (activeRef.current && stateRef.current === "listening") startListeningRef.current();
          }, 250);
        }
      }
    });
  }, []);

  // Tapping the orb/mic just PAUSES — the agent stays open and the conversation
  // is remembered. If it's mid-answer, the answer is paused IN PLACE (not
  // cancelled) so the next tap resumes it from exactly where it stopped. If it's
  // listening, the mic is closed. Neither ends the session.
  const pauseListening = useCallback(() => {
    if (stateRef.current === "speaking") {
      pauseSpeech();
      pausedSpeakingRef.current = true;
      setStateBoth("idle");
      return;
    }
    turnAbortRef.current?.abort();
    cancelSpeech();
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    pausedSpeakingRef.current = false;
    setStateBoth("idle");
  }, []);

  // Tap behaviour: closed → open (greet). Open & speaking/listening → pause.
  // Open & paused → resume: continue the same answer if one was paused
  // mid-sentence, otherwise start listening again. Only the ✕ ends the session.
  const toggle = useCallback(() => {
    unlockAudio(); // every tap keeps the audio context alive so playback works
    if (!activeRef.current) {
      start();
      return;
    }
    if (stateRef.current === "idle") {
      if (pausedSpeakingRef.current) {
        pausedSpeakingRef.current = false;
        setStateBoth("speaking");
        resumeSpeech(); // the pending say() resolves when it finishes, then listens
      } else {
        startListening();
      }
      return;
    }
    pauseListening();
  }, [start, startListening, pauseListening]);

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
    resetContactWorkflow();
  }, [location.pathname]);

  // Page-specific proactive help during an active session.
  useEffect(() => {
    if (!activeRef.current || !proactive) return;
    const path = location.pathname;
    const key = `active:${path}`;
    if (proactiveDone.current.has(key)) return;
    const lower = path.toLowerCase();
    let prompt = "";
    if (lower.includes("contact")) prompt = "Would you like me to help you contact the team or schedule a call?";
    else if (lower.includes("blog")) prompt = "Would you like me to read this article or answer a question about it?";
    else if (lower.includes("pricing") || lower.includes("services")) prompt = "Would you like help choosing the right option?";
    else if (lower.includes("compare")) prompt = "Would you like a quick comparison of these options?";
    if (!prompt) return;
    const t = setTimeout(() => {
      if (activeRef.current && stateRef.current !== "speaking" && stateRef.current !== "thinking" && !proactiveDone.current.has(key)) {
        proactiveDone.current.add(key);
        void say(prompt, true);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [location.pathname, proactive, say]);


  useEffect(() => () => stop(), [stop]);

  return { active, state, caption, supported, neuralReady, start, stop, toggle, submitText };
}
