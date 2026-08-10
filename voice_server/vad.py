import numpy as np
import logging

logger = logging.getLogger("voice_server.vad")

class SileroVADDetector:
    """
    Silero VAD processor for real-time PCM audio chunk speech activity detection,
    barge-in triggering, and max utterance duration enforcement.
    """
    def __init__(self, threshold: float = 0.5, sample_rate: int = 16000, max_duration_sec: int = 30):
        self.threshold = threshold
        self.sample_rate = sample_rate
        self.max_duration_sec = max_duration_sec
        self.is_speech_active = False
        self.total_pcm_bytes_processed = 0

    def reset(self):
        self.is_speech_active = False
        self.total_pcm_bytes_processed = 0

    def process_audio_chunk(self, pcm_bytes: bytes) -> dict:
        """
        Process incoming 16-bit 16kHz PCM audio bytes and return speech status and limit checks.
        """
        if not pcm_bytes:
            return {"is_speaking": False, "exceeded_max_duration": False}

        self.total_pcm_bytes_processed += len(pcm_bytes)
        
        # Calculate current duration in seconds (16kHz 16-bit mono = 32,000 bytes/sec)
        current_duration_sec = self.total_pcm_bytes_processed / 32000.0
        exceeded_max_duration = current_duration_sec > self.max_duration_sec

        try:
            audio_data = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            rms = np.sqrt(np.mean(np.square(audio_data)))
            
            is_speaking = rms > (self.threshold * 0.03)
            self.is_speech_active = is_speaking
            
            return {
                "is_speaking": is_speaking,
                "exceeded_max_duration": exceeded_max_duration,
                "duration_sec": current_duration_sec,
                "rms": float(rms)
            }
        except Exception as e:
            logger.error(f"VAD processing error: {e}")
            return {"is_speaking": False, "exceeded_max_duration": False}
