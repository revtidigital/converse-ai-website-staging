import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logXaiVoiceDiagnostic } from "@/lib/xaiVoice/diagnostics";
import { useXaiVoice } from "@/hooks/useXaiVoice";
import "./XaiVoiceOrb.css";

const labels = {
  closed: "Start voice", "requesting-permission": "Microphone permission required", connecting: "Connecting", configuring: "Connecting", listening: "Listening", "user-speaking": "You are speaking", thinking: "Thinking", speaking: "Speaking", interrupted: "You are speaking", reconnecting: "Reconnecting", "permission-denied": "Microphone permission required", unavailable: "Voice unavailable", error: "Voice unavailable",
} as const;

const XaiVoiceOrb = () => {
  const voice = useXaiVoice();
  const location = useLocation();
  const label = labels[voice.state];
  useEffect(() => {
    logXaiVoiceDiagnostic({ type: "orb_mounted", route: location.pathname });
    logXaiVoiceDiagnostic({ type: "feature_flag", enabled: import.meta.env.VITE_XAI_VOICE_ENABLED === "true", route: location.pathname });
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && voice.isActive) void voice.stop(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [voice]);
  const onClick = () => { if (voice.isActive) void voice.stop(); else if (voice.state === "error" || voice.state === "permission-denied" || voice.state === "unavailable") void voice.retry(); else void voice.start(); };
  return <div className="xai-voice-orb" data-state={voice.state}>
    <button type="button" className="xai-voice-orb__button" aria-label={`${label}. ${voice.isActive ? "Stop" : "Start"} xAI voice session`} onClick={onClick}>
      <span className="xai-voice-orb__pulse" aria-hidden="true" /><span className="xai-voice-orb__label">{voice.isActive ? `${label} · Stop` : label}</span>
    </button>
    {(voice.isActive || voice.error) && <div className="xai-voice-orb__panel" role="status" aria-live="polite">
      <p>{voice.error || label}</p>
      {voice.isActive && <small>Microphone audio is streamed to xAI while the voice session is active. This website does not store microphone recordings.</small>}
      {import.meta.env.DEV && <small className="xai-voice-orb__dev">Engine: xAI deployed agent</small>}
    </div>}
  </div>;
};
export default XaiVoiceOrb;
