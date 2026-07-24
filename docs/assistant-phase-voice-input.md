# Assistant Voice Input and STT Foundation

This phase adds the first voice-input path only. It does **not** add TTS, audio playback, wake word, hands-free listening, barge-in, persistent audio, persistent history, or website action tools.

## Microphone permission flow

Microphone access is requested only after a direct user action on the voice control. The browser does not request permission on page load, when a panel opens, or in the background. Tracks and the `AudioContext` are released after stop, cancel, or error.

Voice controls are hidden unless both flags are enabled:

```env
VITE_ASSISTANT_V2_ENABLED=true
VITE_ASSISTANT_VOICE_ENABLED=true
```

The default example keeps `VITE_ASSISTANT_VOICE_ENABLED=false`.

## Audio format

Canonical internal audio format:

- mono
- PCM signed 16-bit little-endian
- 16 kHz sample rate
- binary WebSocket frames
- 40 ms browser frame target
- no base64 audio

Browser input may start at 44.1 kHz or 48 kHz. The browser audio utilities linearly resample to 16 kHz before PCM encoding.

## Browser lifecycle

1. User clicks the microphone control.
2. The UI requests microphone permission.
3. An `AudioContext` and `AudioWorklet` are created.
4. The client sends `audio.start` JSON over the gateway WebSocket.
5. PCM frames are sent as binary WebSocket frames.
6. Stop sends `audio.end`; cancel sends `audio.cancel`.
7. The final transcript is emitted as `transcript.final`.
8. The existing assistant text flow can consume the final transcript as `inputMode=voice`.

## Binary protocol

Control messages are JSON. Audio bytes are never embedded in JSON.

Browser to gateway:

- `audio.start`
- binary PCM frames
- `audio.end`
- `audio.cancel`

Gateway to browser:

- `audio.accepted`
- `transcription.started`
- `transcript.final`
- `transcription.completed`
- `transcription.cancelled`
- `response.error`

Partial transcript events are reserved, but Faster-Whisper is not treated as a token-streaming STT engine in this phase; final transcripts are the reliable path.

## Gateway lifecycle

The Node gateway validates origin, JSON payload size, audio format, frame size, total audio bytes, duration, and one active audio request per WebSocket session. Binary frames are associated with the active request created by `audio.start`; the request ID is never inferred from binary content.

## Python STT boundary

The FastAPI service exposes `WebSocket /v1/assistant/voice` for the trusted gateway. It accepts only PCM s16le mono 16 kHz, applies byte and timeout limits, avoids disk persistence, avoids audio/transcript logging, and returns safe events.

## Faster-Whisper configuration

```env
ASSISTANT_STT_PROVIDER=noop
ASSISTANT_STT_MODEL=small
ASSISTANT_STT_DEVICE=cpu
ASSISTANT_STT_COMPUTE_TYPE=int8
ASSISTANT_STT_LANGUAGE=
ASSISTANT_STT_BEAM_SIZE=1
ASSISTANT_MAX_AUDIO_DURATION_SECONDS=120
ASSISTANT_MAX_AUDIO_BYTES=16000000
ASSISTANT_INTERNAL_GATEWAY_TOKEN=
```

Use `ASSISTANT_STT_PROVIDER=faster_whisper` only where local model execution is intended. Model files are not committed and tests use the noop/fake provider.

## Transcript handoff

Final transcripts are trimmed and bounded before being passed into the existing shared assistant orchestrator with `inputMode=voice`. The voice path does not create a separate answer generator.

## Security

- No background microphone access.
- No audio disk writes.
- No audio logs.
- No raw transcript logs.
- No base64 audio protocol.
- No arbitrary codec acceptance.
- Internal gateway token placeholder is backend-only.
- Production should use WSS for browser-to-gateway transport.

## Testing

Automated tests use mocked browser/device behavior and noop STT. They do not require a real microphone, Faster-Whisper model, Qdrant, LLM, or internet access.

## Known limitations

- No voice output.
- No TTS.
- No wake word.
- No hands-free mode.
- No barge-in.
- Partial transcripts are deferred rather than faked.

## Next phase boundary

The next phase may add local TTS and safe audio playback. This phase stops at voice input and local STT foundation.
