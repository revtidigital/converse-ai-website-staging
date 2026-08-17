import numpy as np
import logging

logger = logging.getLogger("voice_server.vad")

# Silero VAD model cache (loaded once at startup if available)
_silero_model = None
_silero_utils = None
_silero_available = False


def _try_load_silero():
    """
    Attempt to load the real Silero VAD PyTorch model at startup.
    Silero VAD is a lightweight ML-based speech detector (~1MB), much more
    accurate than simple RMS energy thresholding.
    Requires: torch>=2.0.0 (already in requirements.txt for CosyVoice2).
    """
    global _silero_model, _silero_utils, _silero_available
    try:
        import torch
        model, utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
            onnx=False,
            trust_repo=True,
        )
        _silero_model = model
        _silero_utils = utils
        _silero_available = True
        logger.info("✅ Silero VAD (ML-based) loaded successfully — accurate speech detection active.")
    except Exception as e:
        logger.warning(
            f"Silero VAD unavailable ({e}). "
            "Falling back to RMS energy-based speech detection. "
            "To enable Silero VAD, ensure torch is installed: pip install torch>=2.0.0"
        )


# Attempt to load Silero VAD at module import
_try_load_silero()

# Silero VAD internal chunk size requirement (512 samples @ 16kHz)
_SILERO_CHUNK_SAMPLES = 512


class SileroVADDetector:
    """
    Speech Activity Detector with two-tier strategy:

    PRIMARY  : Real Silero VAD (ML-based, ~1MB model, snakers4/silero-vad)
               — Highly accurate, noise-robust, low-latency.
    FALLBACK : RMS Energy Threshold
               — Simple amplitude-based detection when torch is unavailable.

    Audio input: 16-bit PCM, 16kHz, mono.
    """

    def __init__(
        self,
        threshold: float = 0.5,
        sample_rate: int = 16000,
        max_duration_sec: int = 30,
    ):
        self.threshold = threshold
        self.sample_rate = sample_rate
        self.max_duration_sec = max_duration_sec
        self.is_speech_active = False
        self.total_pcm_bytes_processed = 0

        # Silero VAD rolling sample buffer (accumulate until we have 512 samples)
        self._silero_buffer = np.array([], dtype=np.float32)

    def reset(self):
        self.is_speech_active = False
        self.total_pcm_bytes_processed = 0
        self._silero_buffer = np.array([], dtype=np.float32)
        # Reset Silero hidden states to clear any cross-utterance state leakage
        if _silero_available and _silero_model is not None:
            try:
                _silero_model.reset_states()
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Silero VAD — Primary ML-based detection
    # ------------------------------------------------------------------

    def _silero_detect(self, audio_float32: np.ndarray) -> bool:
        """
        Run Silero VAD inference on accumulated 512-sample chunks.
        Returns True if any chunk in the buffer contains speech.
        """
        import torch

        # Append new samples to the rolling buffer
        self._silero_buffer = np.concatenate([self._silero_buffer, audio_float32])

        speech_detected = False
        # Process complete 512-sample chunks
        while len(self._silero_buffer) >= _SILERO_CHUNK_SAMPLES:
            chunk = self._silero_buffer[:_SILERO_CHUNK_SAMPLES]
            self._silero_buffer = self._silero_buffer[_SILERO_CHUNK_SAMPLES:]

            tensor = torch.from_numpy(chunk).unsqueeze(0)  # [1, 512]
            with torch.no_grad():
                speech_prob = _silero_model(tensor, self.sample_rate).item()
            if speech_prob >= self.threshold:
                speech_detected = True

        return speech_detected

    # ------------------------------------------------------------------
    # RMS Fallback — Simple energy-based detection
    # ------------------------------------------------------------------

    def _rms_detect(self, audio_float32: np.ndarray) -> bool:
        """
        Fallback: RMS energy threshold-based speech detection.
        Threshold: rms > 0.015 (empirically tuned for 16kHz microphone input).
        """
        if len(audio_float32) == 0:
            return False
        rms = float(np.sqrt(np.mean(np.square(audio_float32))))
        # threshold * 0.03 keeps the same tuning as before (default threshold=0.5 → 0.015)
        return rms > (self.threshold * 0.03)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_audio_chunk(self, pcm_bytes: bytes) -> dict:
        """
        Process incoming 16-bit 16kHz PCM audio bytes.

        Returns:
            {
                "is_speaking"         : bool   — Speech detected in this chunk
                "exceeded_max_duration": bool   — Utterance exceeded max seconds
                "duration_sec"        : float  — Current utterance duration in seconds
                "rms"                 : float  — Current RMS amplitude (always computed)
                "vad_engine"          : str    — "silero" | "rms_fallback"
            }
        """
        if not pcm_bytes:
            return {
                "is_speaking": False,
                "exceeded_max_duration": False,
                "duration_sec": 0.0,
                "rms": 0.0,
                "vad_engine": "none",
            }

        self.total_pcm_bytes_processed += len(pcm_bytes)

        # Duration check: 16kHz 16-bit mono = 32,000 bytes/sec
        current_duration_sec = self.total_pcm_bytes_processed / 32_000.0
        exceeded_max_duration = current_duration_sec > self.max_duration_sec

        try:
            audio_float32 = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            rms = float(np.sqrt(np.mean(np.square(audio_float32))))

            # Primary: Silero VAD (ML-based)
            if _silero_available and _silero_model is not None:
                is_speaking = self._silero_detect(audio_float32)
                vad_engine = "silero"
            else:
                # Fallback: RMS energy threshold
                is_speaking = self._rms_detect(audio_float32)
                vad_engine = "rms_fallback"

            self.is_speech_active = is_speaking

            return {
                "is_speaking": is_speaking,
                "exceeded_max_duration": exceeded_max_duration,
                "duration_sec": current_duration_sec,
                "rms": rms,
                "vad_engine": vad_engine,
            }

        except Exception as e:
            logger.error(f"VAD processing error: {e}")
            return {
                "is_speaking": False,
                "exceeded_max_duration": exceeded_max_duration,
                "duration_sec": current_duration_sec,
                "rms": 0.0,
                "vad_engine": "error",
            }
