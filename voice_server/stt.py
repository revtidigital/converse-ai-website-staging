import os
import tempfile
import logging

logger = logging.getLogger("voice_server.stt")

class WhisperSTTProcessor:
    """
    Faster-Whisper / Multilingual Speech-to-Text Processor supporting English, Hindi & Hinglish.
    """
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
        self._init_model()

    def _init_model(self):
        try:
            from faster_whisper import WhisperModel
            # Attempt loading Faster-Whisper model
            self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
            logger.info(f"Loaded Faster-Whisper model '{self.model_size}' successfully.")
        except Exception as e:
            logger.warning(f"Could not load faster_whisper ({e}). Fallback to speech_recognition / wave processor.")

    def transcribe(self, pcm_bytes: bytes, language: str = None) -> dict:
        """
        Transcribe PCM 16-bit 16kHz audio bytes to text with detected language.
        """
        if not pcm_bytes:
            return {"text": "", "language": "en"}

        # Write PCM bytes to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            import wave
            with wave.open(tmp_path, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2) # 16-bit
                wf.setframerate(16000)
                wf.writeframes(pcm_bytes)

            if self.model:
                segments, info = self.model.transcribe(tmp_path, beam_size=5, language=language)
                text = " ".join([segment.text for segment in segments]).strip()
                detected_lang = info.language if hasattr(info, 'language') else "en"
                return {"text": text, "language": detected_lang}
            else:
                # Basic SpeechRecognition fallback if installed
                import speech_recognition as sr
                r = sr.Recognizer()
                with sr.AudioFile(tmp_path) as source:
                    audio = r.record(source)
                    text = r.recognize_google(audio, language="en-IN")
                    return {"text": text, "language": "hi" if any('\u0900' <= c <= '\u097F' for c in text) else "en"}
        except Exception as e:
            logger.error(f"STT transcription error: {e}")
            return {"text": "", "language": "en"}
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
