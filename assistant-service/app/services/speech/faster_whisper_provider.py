import asyncio
from functools import cached_property
from typing import Any

from app.core.errors import AssistantError, ErrorCode
from app.services.speech.stt import (
    AudioFormat,
    SpeechToTextSession,
    TranscriptionResult,
    validate_audio_format,
)


class FasterWhisperSpeechToTextSession:
    def __init__(self, provider: "FasterWhisperSpeechToTextProvider", audio_format: AudioFormat, cancellation_event: asyncio.Event | None) -> None:
        self.provider = provider
        self.audio_format = audio_format
        self.cancellation_event = cancellation_event
        self.audio = bytearray()
        self.cancelled = False

    async def push_audio(self, chunk: bytes) -> None:
        if self.cancelled or (self.cancellation_event and self.cancellation_event.is_set()):
            raise AssistantError(ErrorCode.RETRIEVAL_CANCELLED)
        self.audio.extend(chunk)

    async def finish(self) -> TranscriptionResult:
        if self.cancelled:
            raise AssistantError(ErrorCode.RETRIEVAL_CANCELLED)
        if not self.audio:
            return TranscriptionResult(text="")
        samples = self._pcm16_to_float32(bytes(self.audio))
        model = self.provider.model
        segments, info = await asyncio.to_thread(
            model.transcribe,
            samples,
            language=self.provider.language,
            beam_size=self.provider.beam_size,
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
        language = getattr(info, "language", None)
        return TranscriptionResult(text=text, language=language)

    async def cancel(self) -> None:
        self.cancelled = True
        self.audio.clear()

    @staticmethod
    def _pcm16_to_float32(audio: bytes) -> Any:
        import numpy as np

        if len(audio) % 2 != 0:
            audio = audio[:-1]
        return np.frombuffer(audio, dtype="<i2").astype("float32") / 32768.0


class FasterWhisperSpeechToTextProvider:
    def __init__(self, *, model_name: str, device: str, compute_type: str, language: str | None, beam_size: int) -> None:
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        self.language = language or None
        self.beam_size = beam_size

    @cached_property
    def model(self) -> Any:
        try:
            from faster_whisper import WhisperModel
        except Exception as exc:  # pragma: no cover - dependency optional in tests
            raise AssistantError(ErrorCode.EMBEDDING_UNAVAILABLE) from exc
        return WhisperModel(self.model_name, device=self.device, compute_type=self.compute_type)

    async def start_session(self, *, audio_format: AudioFormat, cancellation_event: asyncio.Event | None = None) -> SpeechToTextSession:
        validate_audio_format(audio_format)
        return FasterWhisperSpeechToTextSession(self, audio_format, cancellation_event)
