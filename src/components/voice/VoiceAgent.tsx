// Voice-only AI agent UI. No chat window / no text history — just a mic orb,
// a listening/speaking indicator, a waveform, and an end button.
// SpaceX/Grok-style ambient orb. Powered entirely by free browser APIs.

import { useCallback, useRef, useState } from "react";
import { Mic, X, Send } from "lucide-react";
import { useVoiceAgent, type AgentState } from "@/hooks/useVoiceAgent";
import "./VoiceAgent.css";

const STATUS_LABEL: Record<AgentState, string> = {
  idle: "Tap to speak",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

export default function VoiceAgent() {
  // Ref indirection so the hook can trigger blog read-aloud (dispatched as an
  // event the BlogReadAloud player listens for) without a hard import cycle.
  const onReadAloud = useCallback(() => {
    window.dispatchEvent(new CustomEvent("voice-agent:read-aloud"));
  }, []);

  const { active, state, caption, supported, toggle, stop, submitText } = useVoiceAgent({ onReadAloud });
  const [dismissed, setDismissed] = useState(false);
  const [typed, setTyped] = useState("");
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      submitText(t);
      setTyped("");
    },
    [submitText]
  );

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

          <div className="va-status">{STATUS_LABEL[state]}</div>
          {caption && <p className="va-caption">{caption}</p>}

          <div className="va-hint">
            {state === "speaking"
              ? "Tap the orb to interrupt"
              : "Speak, or type below if you'd rather not talk"}
          </div>

          {/* Text fallback: type a question or answer Yes/No — the agent
              always replies with voice. */}
          <div className="va-quick">
            <button onClick={() => send("yes")}>Yes</button>
            <button onClick={() => send("no")}>No</button>
            <button onClick={() => send("summarize this page")}>Summarize</button>
          </div>
          <form
            className="va-textrow"
            onSubmit={(e) => {
              e.preventDefault();
              send(typed);
            }}
          >
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your question…"
              aria-label="Type your question"
            />
            <button type="submit" aria-label="Send" disabled={!typed.trim()}>
              <Send size={16} />
            </button>
          </form>
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
