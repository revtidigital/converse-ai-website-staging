import pytest

from app.core.errors import AssistantError
from app.services.speech.stt import AudioFormat, NoopSpeechToTextProvider, validate_audio_format


@pytest.mark.asyncio
async def test_noop_stt_accepts_pcm_and_returns_final_transcript() -> None:
    provider = NoopSpeechToTextProvider()
    session = await provider.start_session(audio_format=AudioFormat())
    await session.push_audio(b"\x00\x00" * 160)
    result = await session.finish()
    assert result.text


def test_invalid_audio_format_rejected() -> None:
    with pytest.raises(AssistantError):
        validate_audio_format(AudioFormat(encoding="opus", sample_rate=48000, channels=2))
