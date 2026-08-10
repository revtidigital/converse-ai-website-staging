import asyncio
import tempfile
import os
import logging
import io

logger = logging.getLogger("voice_server.tts")

# CosyVoice2 model cache (loaded once at startup)
_cosyvoice_model = None
_cosyvoice_available = False


def _try_load_cosyvoice():
    """
    Attempt to load CosyVoice2 (Qwen2.5-0.5B backbone) model at startup.
    CosyVoice2 must be installed via:
      git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git
      pip install -r CosyVoice/requirements.txt
    Model weights: FunAudioLLM/CosyVoice2-0.5B (HuggingFace / ModelScope)
    """
    global _cosyvoice_model, _cosyvoice_available
    try:
        import sys
        # If CosyVoice is cloned alongside voice_server or in PYTHONPATH
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
            logger.warning(
                f"CosyVoice2 model not found at '{model_dir}'. "
                "Download it with: "
                "python -c \"from huggingface_hub import snapshot_download; "
                "snapshot_download('FunAudioLLM/CosyVoice2-0.5B', local_dir='pretrained_models/CosyVoice2-0.5B')\""
            )
            return

        logger.info(f"Loading CosyVoice2 (Qwen2.5 backbone) from: {model_dir}")
        _cosyvoice_model = AutoModel(model_dir=model_dir, inference_mode="normal")
        _cosyvoice_available = True
        logger.info("✅ CosyVoice2 (Qwen2.5-0.5B) loaded successfully — Ultra-realistic human voice ready!")

    except ImportError:
        logger.warning(
            "CosyVoice2 not installed. Falling back to Edge-TTS (Microsoft Neural Voice). "
            "To enable CosyVoice2 (Qwen2.5 human voice), follow setup in README_VOICE_SERVER.md"
        )
    except Exception as e:
        logger.warning(f"CosyVoice2 load error: {e}. Falling back to Edge-TTS.")


# Load CosyVoice2 at module import (non-blocking warning on failure)
_try_load_cosyvoice()


class LocalTTSSynthesizer:
    """
    Ultra-Realistic Human Voice Synthesizer.

    PRIMARY  : CosyVoice2 (Qwen2.5-0.5B backbone) — local, GPU-accelerated,
               multilingual Hindi & English neural voice synthesis.
    FALLBACK : Microsoft Edge-TTS Neural Voices (hi-IN-SwaraNeural / en-US-AriaNeural)
               — internet-based, high quality, zero-setup.
    LAST RESORT: pyttsx3 — offline, robotic quality.
    """

    def __init__(self, engine: str = "cosyvoice2"):
        self.engine = engine

    # ------------------------------------------------------------------
    # Language → voice mapping helpers
    # ------------------------------------------------------------------

    COSYVOICE_SPEAKERS = {
        "hi": "中文女",          # CosyVoice2 best Hindi-compatible preset
        "en": "English Female",  # CosyVoice2 English preset
    }

    EDGE_TTS_VOICES = {
        "hi": "hi-IN-SwaraNeural",   # Microsoft Hindi Neural Voice
        "en": "en-US-AriaNeural",    # Microsoft English Neural Voice
    }

    def _get_language_tag(self, lang: str) -> str:
        """Return CosyVoice2 language tag for instruct mode."""
        return "<|zh|>" if lang == "hi" else "<|en|>"

    # ------------------------------------------------------------------
    # CosyVoice2 synthesis (Qwen2.5-0.5B powered)
    # ------------------------------------------------------------------

    def _synthesize_cosyvoice2(self, text: str, lang: str = "en") -> bytes:
        """
        Run CosyVoice2 inference synchronously.
        Uses 'inference_sft' (speaker preset) mode — no reference audio needed.
        Returns PCM WAV bytes.
        """
        import numpy as np
        import wave

        speaker = self.COSYVOICE_SPEAKERS.get(lang, "English Female")
        lang_tag = self._get_language_tag(lang)
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
    # Edge-TTS synthesis (Microsoft Neural fallback)
    # ------------------------------------------------------------------

    async def _synthesize_edge_tts(self, text: str, lang: str = "en") -> bytes:
        """Fallback: Microsoft Edge-TTS neural voice synthesis."""
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

    async def synthesize_text(self, text: str, voice: str = "hi-IN-SwaraNeural") -> bytes:
        """
        Synthesize text → high-fidelity human voice audio bytes.

        Priority:
          1. CosyVoice2 (Qwen2.5-0.5B) — best quality, fully local
          2. Edge-TTS (Microsoft Neural) — internet fallback
          3. pyttsx3                     — offline last resort
        """
        if not text.strip():
            return b""

        # Detect language from the voice hint passed by main.py
        lang = "hi" if "hi-IN" in voice or voice == "hi" else "en"

        # ── 1. Primary: CosyVoice2 (Qwen2.5-0.5B powered human voice) ──
        if _cosyvoice_available and self.engine in ("cosyvoice2", "qwen2"):
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

        # ── 2. Fallback: Edge-TTS (Microsoft Neural Voice) ──
        try:
            logger.info("Using Edge-TTS neural voice fallback...")
            audio_bytes = await self._synthesize_edge_tts(text, lang)
            if audio_bytes:
                return audio_bytes
        except Exception as e:
            logger.warning(f"Edge-TTS error: {e}. Trying pyttsx3 last resort.")

        # ── 3. Last Resort: pyttsx3 (offline, robotic) ──
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
