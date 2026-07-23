// Voice-only AI agent UI. No chat window / no text history — just a mic orb,
// a listening/speaking indicator, a waveform, and an end button.
// Ambient voice orb with native browser and realtime-service fallback modes.

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, X } from "lucide-react";
import { useVoiceAgent, type AgentState } from "@/hooks/useVoiceAgent";
import { isXaiRealtimeEnabled, useXaiVoiceAgent } from "@/hooks/useXaiVoiceAgent";
import "./VoiceAgent.css";

const STATUS_LABEL: Record<AgentState, string> = {
  idle: "Ready",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  paused: "Paused",
  recovering: "Recovering…",
  error: "Needs attention",
};

export default function VoiceAgent() {
  // Ref indirection so the hook can trigger blog read-aloud (dispatched as an
  // event the BlogReadAloud player listens for) without a hard import cycle.
  const onReadAloud = useCallback(() => {
    window.dispatchEvent(new CustomEvent("voice-agent:read-aloud"));
  }, []);

  const legacy = useVoiceAgent({ onReadAloud });
  const xai = useXaiVoiceAgent({ enabled: isXaiRealtimeEnabled() });
  const [useRealtime, setUseRealtime] = useState(isXaiRealtimeEnabled());
  const active = useRealtime ? xai.voiceState !== "closed" : legacy.active;
  const state = useRealtime ? (xai.voiceState === "connecting" ? "recovering" : xai.voiceState === "ready" ? "idle" : xai.voiceState === "permission" ? "recovering" : xai.voiceState === "closed" ? "idle" : xai.voiceState) as AgentState : legacy.state;
  const caption = useRealtime ? (xai.error || xai.responseTranscript || xai.transcript) : legacy.caption;
  const statusText = useRealtime
    ? xai.voiceState === "connecting" ? "Connecting…"
    : xai.voiceState === "permission" ? "Microphone permission required"
    : xai.voiceState === "recovering" ? "Reconnecting…"
    : xai.voiceState === "error" ? "Voice service unavailable"
    : STATUS_LABEL[state]
    : STATUS_LABEL[state];
  const supported = legacy.supported || useRealtime;
  const neuralReady = legacy.neuralReady;
  const [dismissed] = useState(false);

  const toggle = useCallback(() => {
    if (!useRealtime) {
      legacy.toggle();
      return;
    }
    if (xai.voiceState === "closed" || xai.voiceState === "error") {
      void xai.startSession().then((started) => {
        if (!started) setUseRealtime(false);
      });
      return;
    }
    if (xai.voiceState === "speaking") {
      xai.interrupt();
      return;
    }
    void xai.stopSession();
  }, [legacy, useRealtime, xai]);

  const stop = useCallback(() => {
    if (useRealtime) void xai.stopSession();
    else legacy.stop();
  }, [legacy, useRealtime, xai]);

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);

  // Scroll the (now scrollable) caption box back to the top whenever a new
  // line is spoken, so the reader starts from the beginning of the reply.
  useEffect(() => {
    if (captionRef.current) captionRef.current.scrollTop = 0;
  }, [caption]);



  if (!supported || dismissed) return null;

  const bars = [0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9];

  return (
    <div className="va-root" data-voice-agent aria-live="polite">
      {active && (
        <div className="va-panel" role="dialog" aria-label="Voice assistant">
          <button className="va-close" onClick={stop} aria-label="End conversation">
            <X size={18} />
          </button>

          <div className={`va-orb va-orb--${state}`} onClick={toggle} role="button" tabIndex={0}
               aria-label={STATUS_LABEL[state]}
               onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}>
            <span className="va-orb-core" />
            <span className="va-orb-ring va-orb-ring--1" />
            <span className="va-orb-ring va-orb-ring--2" />
            <div className="va-wave" aria-hidden="true">
              {bars.map((h, i) => (
                <span key={i} style={{ ["--h" as string]: h, ["--i" as string]: i }} />
              ))}
            </div>
          </div>

          <div className="va-status">{statusText}</div>
          {((useRealtime && active) || (!useRealtime && !neuralReady)) && (
            <div className="va-voicenote" aria-live="polite">{useRealtime ? "Audio streams to xAI while realtime is active. This website does not store recordings, and the permanent xAI API key never reaches your browser." : "Preparing natural voice…"}</div>
          )}
          {caption && <p className="va-caption" ref={captionRef}>{caption}</p>}

          <div className="va-hint">
            {useRealtime
              ? "Realtime voice mode. Tap to interrupt or stop; the existing fallback remains available if xAI is unavailable."
              : state === "speaking"
              ? "Tap to interrupt. Press ✕ to close."
              : "Hands-free session is active. Say “pause”, “continue”, “repeat”, or “stop”."}
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        className={`va-launcher ${active ? "va-launcher--active" : ""}`}
        onClick={toggle}
        aria-label={active ? STATUS_LABEL[state] : "Start voice assistant"}
        title="Talk to ConverseAI"
      >
        <Mic size={22} />
        {active && state === "listening" && <span className="va-pulse" />}
      </button>
    </div>
  );
}
