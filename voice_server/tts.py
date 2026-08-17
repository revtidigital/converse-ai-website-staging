import asyncio
import tempfile
import os
import logging
import io

logger = logging.getLogger("voice_server.tts")

# CosyVoice2 model cache (loaded once at startup)
_cosyvoice_model = None
_cosyvoice_available = False

# NVIDIA Parakeet NeMo TTS model cache
_parakeet_model = None
_parakeet_available = False


def _try_load_parakeet():
    """
    Attempt to load NVIDIA NeMo / Parakeet TTS Model.
    NVIDIA Parakeet offers ultra-low latency, highly natural human-like voice synthesis.
    """
    global _parakeet_model, _parakeet_available
    try:
        import nemo.collections.tts as nemo_tts
        logger.info("Loading NVIDIA Parakeet Speech AI Engine...")
        _parakeet_model = nemo_tts.models.SpectrogramGenerator.from_pretrained(
            model_name="nvidia/parakeet-tdt-1.1b"
        )
        _parakeet_available = True
        logger.info("✅ NVIDIA Parakeet Speech Engine loaded successfully!")
    except Exception:
        logger.info("NVIDIA Parakeet NeMo engine not loaded — using Microsoft Edge-TTS / Neural Voice fallback.")


def _try_load_cosyvoice():
    """
    Attempt to load CosyVoice2 (Qwen2.5-0.5B backbone) model at startup.
    """
    global _cosyvoice_model, _cosyvoice_available
    try:
        import sys
        cosyvoice_path = os.getenv("COSYVOICE_PATH", os.path.join(os.path.dirname(__file__), "CosyVoice"))
        matcha_path = os.path.join(cosyvoice_path, "third_party", "Matcha-TTS")
        for p in [cosyvoice_path, matcha_path]:
            if p not in sys.path and os.path.exists(p):
                sys.path.insert(0, p)

        from cosyvoice.cli.cosyvoice import AutoModel

        model_dir = os.getenv(
            "COSYVOICE_MODEL_DIR",
            os.path.join(cosyvoice_path, "pretrained_models", "CosyVoice2-0.5B")
        )

        if not os.path.exists(model_dir):
            return

        logger.info(f"Loading CosyVoice2 (Qwen2.5 backbone) from: {model_dir}")
        _cosyvoice_model = AutoModel(model_dir=model_dir, inference_mode="normal")
        _cosyvoice_available = True
        logger.info("✅ CosyVoice2 (Qwen2.5-0.5B) loaded successfully — Ultra-realistic human voice ready!")

    except Exception as e:
        logger.warning(f"CosyVoice2 load error: {e}. Falling back to Edge-TTS.")


# Load models at module import (non-blocking warning on failure)
_try_load_parakeet()
_try_load_cosyvoice()


class LocalTTSSynthesizer:
    """
    Ultra-Realistic Human Voice Synthesizer.

    English:
      PRIMARY  : CosyVoice2 (Qwen2.5-0.5B backbone) — local, GPU-accelerated,
                 English neural voice synthesis.
      FALLBACK : Microsoft Edge-TTS Neural Voices (en-US-AriaNeural)
               — internet-based, high quality, zero-setup.
      LAST RESORT: pyttsx3 — offline, robotic quality.

    Hindi:
      PRIMARY  : Microsoft Edge-TTS (hi-IN-SwaraNeural)
               — CosyVoice2 does NOT natively support Hindi (only zh/en/ja/yue/ko).
               — Edge-TTS delivers natural Hindi neural voice with no model needed.
      FALLBACK : pyttsx3 — offline, robotic quality.
    """

    def __init__(self, engine: str = "cosyvoice2"):
        self.engine = engine

    # ------------------------------------------------------------------
    # Supported language → voice/speaker mapping
    # ------------------------------------------------------------------

    # CosyVoice2 only supports these languages (NOT Hindi)
    COSYVOICE_SUPPORTED_LANGS = {"en", "zh", "ja", "ko", "yue"}

    # CosyVoice2 SFT speaker presets (English only used here)
    COSYVOICE_SPEAKERS = {
        "en": "English Female",
    }

    # CosyVoice2 language tags for instruct mode
    COSYVOICE_LANG_TAGS = {
        "en": "<|en|>",
        "zh": "<|zh|>",
        "ja": "<|ja|>",
        "ko": "<|ko|>",
        "yue": "<|yue|>",
    }

    # Edge-TTS neural voice mapping
    EDGE_TTS_VOICES = {
        "hi": "hi-IN-SwaraNeural",   # Microsoft Hindi Neural Voice — high quality
        "en": "en-US-AriaNeural",    # Microsoft English Neural Voice
    }

    def _is_cosyvoice_supported(self, lang: str) -> bool:
        """Return True if CosyVoice2 natively supports this language."""
        return lang in self.COSYVOICE_SUPPORTED_LANGS

    # ------------------------------------------------------------------
    # CosyVoice2 synthesis (English only — Qwen2.5-0.5B powered)
    # ------------------------------------------------------------------

    def _synthesize_cosyvoice2(self, text: str, lang: str = "en") -> bytes:
        """
        Run CosyVoice2 inference synchronously for supported languages (en/zh/ja/ko/yue).
        Uses 'inference_sft' (speaker preset) mode — no reference audio needed.
        Returns PCM WAV bytes.
        """
        import numpy as np
        import wave

        speaker = self.COSYVOICE_SPEAKERS.get(lang, "English Female")
        lang_tag = self.COSYVOICE_LANG_TAGS.get(lang, "<|en|>")
        tagged_text = f"{lang_tag}{text}"

        logger.info(f"CosyVoice2 synthesis | lang={lang} | speaker={speaker} | text={text[:60]}...")

        audio_chunks = []
        for result in _cosyvoice_model.inference_sft(tagged_text, speaker, stream=False):
            audio_np = result["tts_speech"]
            # audio_np is a torch tensor or numpy array, shape: [1, samples]
            try:
                audio_np = audio_np.numpy()
            except AttributeError:
                pass  # already numpy
            audio_np = audio_np.squeeze()  # → [samples]
            audio_chunks.append(audio_np)

        if not audio_chunks:
            return b""

        full_audio = np.concatenate(audio_chunks)

        # Convert float32 [-1, 1] → int16 PCM
        pcm_int16 = (full_audio * 32767).astype(np.int16)

        # Write to WAV bytes buffer
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)       # 16-bit
            wf.setframerate(22050)   # CosyVoice2 default sample rate
            wf.writeframes(pcm_int16.tobytes())
        buf.seek(0)
        return buf.read()

    # ------------------------------------------------------------------
    # Edge-TTS synthesis (Microsoft Neural — primary for Hindi, fallback for English)
    # ------------------------------------------------------------------

    async def _synthesize_edge_tts(self, text: str, lang: str = "en") -> bytes:
        """
        Microsoft Edge-TTS neural voice synthesis.
        Primary for Hindi (hi-IN-SwaraNeural).
        Fallback for English when CosyVoice2 is unavailable (en-US-AriaNeural).
        """
        import edge_tts

        voice = self.EDGE_TTS_VOICES.get(lang, "en-US-AriaNeural")
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(tmp_path)
            with open(tmp_path, "rb") as f:
                return f.read()
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def synthesize_text(self, text: str, voice: str = "en-US-AriaNeural") -> bytes:
        """
        Synthesize text → high-fidelity human voice audio bytes.

        Language routing:
          Hindi (hi-IN-*): Edge-TTS hi-IN-SwaraNeural (CosyVoice2 skip — no Hindi support)
          English         : CosyVoice2 (if available) → Edge-TTS → pyttsx3

        Args:
            text  : Text to synthesize.
            voice : Voice hint from main.py (e.g. "hi-IN-SwaraNeural" or "en-US-AriaNeural").
                    Used to detect target language.
        """
        if not text.strip():
            return b""

        # Detect language from the voice hint passed by main.py
        lang = "hi" if ("hi-IN" in voice or voice == "hi") else "en"

        # ── Hindi: CosyVoice2 does NOT support Hindi → use Edge-TTS directly ──
        if lang == "hi":
            logger.info("Hindi detected → Using Edge-TTS hi-IN-SwaraNeural (CosyVoice2 does not support Hindi)")
            try:
                audio_bytes = await self._synthesize_edge_tts(text, lang="hi")
                if audio_bytes:
                    logger.info(f"✅ Edge-TTS Hindi synthesis OK — {len(audio_bytes)} bytes")
                    return audio_bytes
            except Exception as e:
                logger.warning(f"Edge-TTS Hindi error: {e}. Trying pyttsx3 last resort.")
            # Last resort for Hindi
            return await self._pyttsx3_fallback(text)

        # ── English: CosyVoice2 → Edge-TTS → pyttsx3 ──

        # 1. Primary: CosyVoice2 (Qwen2.5-0.5B powered human voice, English only)
        if _cosyvoice_available and self.engine in ("cosyvoice2", "qwen2") and self._is_cosyvoice_supported(lang):
            try:
                loop = asyncio.get_event_loop()
                audio_bytes = await loop.run_in_executor(
                    None, self._synthesize_cosyvoice2, text, lang
                )
                if audio_bytes:
                    logger.info(f"✅ CosyVoice2 (Qwen2.5) synthesis OK — {len(audio_bytes)} bytes")
                    return audio_bytes
            except Exception as e:
                logger.warning(f"CosyVoice2 synthesis error: {e}. Falling back to Edge-TTS.")

        # 2. Fallback: Edge-TTS (Microsoft Neural Voice)
        try:
            logger.info("Using Edge-TTS neural voice fallback (en-US-AriaNeural)...")
            audio_bytes = await self._synthesize_edge_tts(text, lang="en")
            if audio_bytes:
                return audio_bytes
        except Exception as e:
            logger.warning(f"Edge-TTS error: {e}. Trying pyttsx3 last resort.")

        # 3. Last Resort: pyttsx3 (offline, robotic)
        return await self._pyttsx3_fallback(text)

    async def _pyttsx3_fallback(self, text: str) -> bytes:
        """Last resort: pyttsx3 offline TTS."""
        try:
            import pyttsx3
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                wav_path = tmp.name
            engine = pyttsx3.init()
            engine.save_to_file(text, wav_path)
            engine.runAndWait()
            if os.path.exists(wav_path):
                with open(wav_path, "rb") as f:
                    audio_bytes = f.read()
                os.remove(wav_path)
                return audio_bytes
        except Exception as ex:
            logger.error(f"pyttsx3 fallback failed: {ex}")
        return b""
