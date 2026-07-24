import asyncio
import json
import secrets

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status

from app.api.dependencies import settings_dependency, speech_to_text_provider_dependency
from app.config import Settings
from app.services.speech.stt import AudioFormat, SpeechToTextProvider

router = APIRouter(prefix="/v1/assistant")


def _safe_error(request_id: str | None, code: str, message: str) -> dict[str, object]:
    payload: dict[str, object] = {"type": "response.error", "code": code, "message": message}
    if request_id:
        payload["requestId"] = request_id
    return payload


async def _send(websocket: WebSocket, payload: dict[str, object]) -> None:
    await websocket.send_text(json.dumps(payload, separators=(",", ":")))


@router.websocket("/voice")
async def voice_input(websocket: WebSocket, settings: Settings = Depends(settings_dependency), stt_provider: SpeechToTextProvider = Depends(speech_to_text_provider_dependency)) -> None:
    token = websocket.headers.get("x-internal-gateway-token") or websocket.headers.get("sec-websocket-protocol")
    expected = settings.assistant_internal_gateway_token_value()
    if expected and not secrets.compare_digest(token or "", expected):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    await websocket.accept()
    request_id: str | None = None
    stt_session = None
    audio_bytes = 0
    cancellation_event = asyncio.Event()
    try:
        start_message = await websocket.receive_text()
        data = json.loads(start_message)
        if data.get("type") != "audio.start" or not isinstance(data.get("requestId"), str):
            await _send(websocket, _safe_error(None, "INVALID_AUDIO_START", "Invalid audio start message."))
            return
        request_id = data["requestId"]
        fmt = data.get("format") if isinstance(data.get("format"), dict) else {}
        audio_format = AudioFormat(encoding=str(fmt.get("encoding", "")), sample_rate=int(fmt.get("sampleRate", 0)), channels=int(fmt.get("channels", 0)))
        stt_session = await stt_provider.start_session(audio_format=audio_format, cancellation_event=cancellation_event)
        await _send(websocket, {"type": "transcription.started", "requestId": request_id})
        while True:
            message = await websocket.receive()
            if "bytes" in message and message["bytes"] is not None:
                chunk = message["bytes"]
                audio_bytes += len(chunk)
                if audio_bytes > settings.assistant_max_audio_bytes:
                    await stt_session.cancel()
                    await _send(websocket, _safe_error(request_id, "AUDIO_LIMIT_EXCEEDED", "Audio request is too large."))
                    return
                await stt_session.push_audio(chunk)
            elif "text" in message and message["text"] is not None:
                control = json.loads(message["text"])
                if control.get("type") == "audio.cancel":
                    cancellation_event.set()
                    await stt_session.cancel()
                    await _send(websocket, {"type": "transcription.cancelled", "requestId": request_id})
                    return
                if control.get("type") == "audio.end":
                    result = await asyncio.wait_for(stt_session.finish(), timeout=settings.assistant_stt_timeout_seconds)
                    transcript = result.text.strip()
                    if not transcript:
                        await _send(websocket, _safe_error(request_id, "EMPTY_TRANSCRIPT", "No speech was detected."))
                        return
                    await _send(websocket, {"type": "transcript.final", "requestId": request_id, "text": transcript, "language": result.language})
                    await _send(websocket, {"type": "transcription.completed", "requestId": request_id})
                    return
    except (WebSocketDisconnect, asyncio.CancelledError):
        cancellation_event.set()
        if stt_session is not None:
            await stt_session.cancel()
    except Exception:
        if request_id:
            await _send(websocket, _safe_error(request_id, "TRANSCRIPTION_FAILED", "Speech transcription failed."))
