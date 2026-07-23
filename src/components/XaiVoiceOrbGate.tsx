import XaiVoiceOrb from "./XaiVoiceOrb";

const XaiVoiceOrbGate = () => (import.meta.env.VITE_XAI_VOICE_ENABLED === "true" ? <XaiVoiceOrb /> : null);

export default XaiVoiceOrbGate;
