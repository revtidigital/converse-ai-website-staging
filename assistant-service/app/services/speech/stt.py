import asyncio
from dataclasses import dataclass
from typing import Protocol

from app.core.errors import AssistantError, ErrorCode


@dataclass(frozen=True)
class AudioFormat:
    encoding: str = "pcm_s16le"
    sample_rate: int = 16000
    channels: int = 1


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    language: str | None = None


class SpeechToTextSession(Protocol):
    async def push_audio(self, chunk: bytes) -> None: ...
    async def finish(self) -> TranscriptionResult: ...
    async def cancel(self) -> None: ...


class SpeechToTextProvider(Protocol):
    async def start_session(self, *, audio_format: AudioFormat, cancellation_event: asyncio.Event | None = None) -> SpeechToTextSession: ...


class NoopSpeechToTextSession:
    def __init__(self, transcript: str = "") -> None:
        self._chunks: list[bytes] = []
        self._transcript = transcript
        self.cancelled = False

    async def push_audio(self, chunk: bytes) -> None:
        if self.cancelled:
            raise AssistantError(ErrorCode.RETRIEVAL_CANCELLED)
        self._chunks.append(bytes(chunk))

    async def finish(self) -> TranscriptionResult:
        text = self._transcript or ("simulated voice transcript" if self._chunks else "")
        return TranscriptionResult(text=text)

    async def cancel(self) -> None:
        self.cancelled = True
        self._chunks.clear()


class NoopSpeechToTextProvider:
    async def start_session(self, *, audio_format: AudioFormat, cancellation_event: asyncio.Event | None = None) -> SpeechToTextSession:
        validate_audio_format(audio_format)
        return NoopSpeechToTextSession()


def validate_audio_format(audio_format: AudioFormat) -> None:
    if audio_format.encoding != "pcm_s16le" or audio_format.sample_rate != 16000 or audio_format.channels != 1:
        raise AssistantError(ErrorCode.KNOWLEDGE_INVALID_CONTENT)
