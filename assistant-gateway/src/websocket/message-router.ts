import type { ClientEvent } from "../contracts/client-events.js";
import type { PythonAssistantClient } from "../clients/python-assistant-client.js";
import type { SessionState } from "./session-manager.js";

export async function routeClientEvent(event: ClientEvent, session: SessionState, pythonClient: PythonAssistantClient): Promise<void> {
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
      session.close(1000, "session_end");
      return;
    case "response.cancel":
      if (session.cancel(event.requestId)) {
        session.send({ type: "response.cancelled", requestId: event.requestId });
      }
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
    if (!terminal && !controller.signal.aborted) {
      session.send({ type: "response.error", requestId: event.requestId, code: "STREAM_ERROR", message: "The assistant stream ended unexpectedly." });
    }
  } catch (error) {
    if (controller.signal.aborted) session.send({ type: "response.cancelled", requestId: event.requestId });
    else session.send({ type: "response.error", requestId: event.requestId, code: "BACKEND_UNAVAILABLE", message: "The assistant is temporarily unavailable." });
  } finally {
    session.finishRequest(event.requestId);
  }
}
