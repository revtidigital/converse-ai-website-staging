import type { IncomingMessage } from "node:http";
import type { Socket } from "node:net";
import type { GatewayConfig } from "../config/env.js";
import { PythonAssistantClient } from "../clients/python-assistant-client.js";
import { PythonVoiceClient } from "../clients/python-voice-client.js";
import { parseClientEvent } from "../contracts/client-events.js";
import { isOriginAllowed } from "../security/origin-policy.js";
import { assertAudioFrame } from "../security/audio-limits.js";
import { assertPayloadLimit } from "../security/payload-limits.js";
import { ConnectionRateLimiter } from "../security/rate-limit.js";
import { routeClientEvent } from "./message-router.js";
import { SessionState } from "./session-manager.js";
import { acceptWebSocket, closeSocket, decodeFrames, writeUpgradeRejection } from "./ws-protocol.js";

export class AssistantWebSocketGateway {
  private readonly limiter: ConnectionRateLimiter;
  private readonly pythonClient: PythonAssistantClient;

  constructor(private readonly config: GatewayConfig) {
    this.limiter = new ConnectionRateLimiter(config.maxConnectionsPerIp);
    this.pythonClient = new PythonAssistantClient(config.pythonAssistantBaseUrl, config.requestTimeoutMs);
  }

  handleUpgrade(request: IncomingMessage, socket: Socket): void {
    const origin = request.headers.origin;
    const ip = request.socket.remoteAddress ?? "unknown";
    if (!isOriginAllowed(origin, this.config.allowedOrigins)) {
      writeUpgradeRejection(socket, 403, "Forbidden");
      return;
    }
    if (!this.limiter.tryAcquire(ip)) {
      writeUpgradeRejection(socket, 429, "Too Many Requests");
      return;
    }
    if (!acceptWebSocket(request, socket)) {
      this.limiter.release(ip);
      writeUpgradeRejection(socket, 400, "Bad Request");
      return;
    }
    const session = new SessionState(socket);
    const heartbeat = setInterval(() => {
      if (Date.now() - session.lastSeen > this.config.idleTimeoutMs) closeSocket(socket, 1000, "idle_timeout");
    }, Math.min(this.config.idleTimeoutMs, 30000));
    const cleanup = (): void => {
      clearInterval(heartbeat);
      if (session.abortController) session.abortController.abort();
      session.cleanupAudio();
      this.limiter.release(ip);
    };
    socket.on("data", (chunk: Buffer) => {
      for (const frame of decodeFrames(chunk)) {
        if (frame.opcode === "text") void this.handleRawMessage(frame.payload, session);
        if (frame.opcode === "binary") this.handleBinaryFrame(frame.payload, session);
        if (frame.opcode === "close") socket.end();
      }
    });
    socket.on("close", cleanup);
    socket.on("error", cleanup);
  }

  private handleBinaryFrame(frame: Buffer, session: SessionState): void {
    try {
      assertAudioFrame(frame, this.config);
      session.audio.addBytes(frame.length, this.config);
      session.voiceClient?.sendAudio(frame);
    } catch (error) {
      const requestId = session.audio.requestId ?? undefined;
      session.cleanupAudio();
      session.send({ type: "response.error", requestId, code: "AUDIO_LIMIT_EXCEEDED", message: "Audio frame rejected." });
    }
  }

  private async forwardTranscriptToAssistant(requestId: string, transcript: string, session: SessionState): Promise<void> {
    let controller: AbortController;
    try {
      controller = session.startRequest(requestId);
    } catch {
      session.send({ type: "response.error", requestId, code: "CONFLICT", message: "A response is already in progress." });
      return;
    }
    try {
      for await (const backendEvent of this.pythonClient.streamTurn({ conversationId: session.sessionId, requestId, message: transcript, inputMode: "voice", routeContext: session.audioRouteContext }, controller.signal)) {
        if (backendEvent.type === "response.started") session.send({ type: "response.started", requestId });
        if (backendEvent.type === "response.delta") session.send({ type: "response.delta", requestId, text: backendEvent.delta });
        if (backendEvent.type === "response.completed") session.send({ type: "response.completed", requestId, sources: backendEvent.sources });
        if (backendEvent.type === "response.error") session.send({ type: "response.error", requestId, code: "BACKEND_UNAVAILABLE", message: backendEvent.error.message });
      }
    } catch {
      if (controller.signal.aborted) session.send({ type: "response.cancelled", requestId });
      else session.send({ type: "response.error", requestId, code: "BACKEND_UNAVAILABLE", message: "The assistant is temporarily unavailable." });
    } finally {
      session.finishRequest(requestId);
    }
  }

  private async handleRawMessage(payload: string, session: SessionState): Promise<void> {
    try {
      assertPayloadLimit(payload, this.config.maxJsonPayloadBytes);
      const json = JSON.parse(payload) as unknown;
      const event = parseClientEvent(json, this.config.maxTextLength);
      await routeClientEvent(event, session, this.pythonClient, (requestId, format, routeContext) => {
        const client = new PythonVoiceClient(this.config.pythonVoiceBaseUrl, this.config.internalGatewayToken, this.config.requestTimeoutMs);
        client.on("event", (voiceEvent) => {
          session.send(voiceEvent);
          if (voiceEvent.type === "transcript.final") void this.forwardTranscriptToAssistant(voiceEvent.requestId, voiceEvent.text, session);
        });
        session.attachVoiceClient(client);
        void client.connect(requestId, format, routeContext);
        return client;
      }, this.config);
    } catch {
      session.send({ type: "response.error", code: "VALIDATION_ERROR", message: "Invalid assistant gateway message." });
    }
  }
}
