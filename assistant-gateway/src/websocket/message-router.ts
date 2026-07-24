import type { GatewayConfig } from "../config/env.js";
import type { PythonVoiceClient } from "../clients/python-voice-client.js";
import type { AudioFormat } from "../contracts/audio-events.js";
import type { ClientEvent } from "../contracts/client-events.js";
import type { PythonAssistantClient } from "../clients/python-assistant-client.js";
import type { SessionState } from "./session-manager.js";

type VoiceClientFactory = (requestId: string, format: AudioFormat, routeContext?: unknown) => PythonVoiceClient;

export async function routeClientEvent(event: ClientEvent, session: SessionState, pythonClient: PythonAssistantClient, voiceFactory?: VoiceClientFactory, config?: GatewayConfig): Promise<void> {
  session.lastSeen = Date.now();
  switch (event.type) {
    case "session.start":
      session.inputMode = event.inputMode;
      session.send({ type: "session.ready", sessionId: session.sessionId });
      return;
    case "ping":
      session.send({ type: "pong", timestamp: event.timestamp });
      return;
    case "session.end":
      session.cleanupAudio();
      session.close(1000, "session_end");
      return;
    case "response.cancel":
      if (session.cancel(event.requestId)) session.send({ type: "response.cancelled", requestId: event.requestId });
      return;
    case "audio.start":
      if (!voiceFactory || !config) {
        session.send({ type: "response.error", requestId: event.requestId, code: "AUDIO_NOT_ENABLED", message: "Audio transport is unavailable." });
        return;
      }
      try {
        session.audio.start(event.requestId, event.format);
        session.audioRouteContext = event.routeContext as typeof session.audioRouteContext;
        voiceFactory(event.requestId, event.format, event.routeContext);
        session.send({ type: "audio.accepted", requestId: event.requestId });
      } catch {
        session.send({ type: "response.error", requestId: event.requestId, code: "CONFLICT", message: "Another audio request is active." });
      }
      return;
    case "audio.end":
      try {
        session.audio.end(event.requestId);
        session.voiceClient?.end(event.requestId);
      } catch {
        session.send({ type: "response.error", requestId: event.requestId, code: "VALIDATION_ERROR", message: "No active audio request." });
      }
      return;
    case "audio.cancel":
      session.voiceClient?.cancel(event.requestId);
      session.cleanupAudio();
      session.send({ type: "transcription.cancelled", requestId: event.requestId });
      return;
    case "text.submit":
      await forwardText(event, session, pythonClient);
      return;
    default:
      session.send({ type: "response.error", code: "VALIDATION_ERROR", message: "Unsupported event." });
  }
}

async function forwardText(event: Extract<ClientEvent, { type: "text.submit" }>, session: SessionState, pythonClient: PythonAssistantClient): Promise<void> {
  let controller: AbortController;
  try {
    controller = session.startRequest(event.requestId);
  } catch {
    session.send({ type: "response.error", requestId: event.requestId, code: "CONFLICT", message: "A response is already in progress." });
    return;
  }
  let terminal = false;
  try {
    for await (const backendEvent of pythonClient.streamTurn({
      conversationId: session.sessionId,
      requestId: event.requestId,
      message: event.message,
      inputMode: session.inputMode,
      routeContext: event.routeContext
    }, controller.signal)) {
      if (backendEvent.type === "response.started") session.send({ type: "response.started", requestId: event.requestId });
      if (backendEvent.type === "response.delta") session.send({ type: "response.delta", requestId: event.requestId, text: backendEvent.delta });
      if (backendEvent.type === "response.completed") {
        terminal = true;
        session.send({ type: "response.completed", requestId: event.requestId, sources: backendEvent.sources });
      }
      if (backendEvent.type === "response.error") {
        terminal = true;
        session.send({ type: "response.error", requestId: event.requestId, code: "BACKEND_UNAVAILABLE", message: backendEvent.error.message });
      }
    }
    if (!terminal && !controller.signal.aborted) session.send({ type: "response.error", requestId: event.requestId, code: "STREAM_ERROR", message: "The assistant stream ended unexpectedly." });
  } catch {
    if (controller.signal.aborted) session.send({ type: "response.cancelled", requestId: event.requestId });
    else session.send({ type: "response.error", requestId: event.requestId, code: "BACKEND_UNAVAILABLE", message: "The assistant is temporarily unavailable." });
  } finally {
    session.finishRequest(event.requestId);
  }
}
