import type { IncomingMessage } from "node:http";
import type { Socket } from "node:net";
import type { GatewayConfig } from "../config/env.js";
import { PythonAssistantClient } from "../clients/python-assistant-client.js";
import { parseClientEvent } from "../contracts/client-events.js";
import { isOriginAllowed } from "../security/origin-policy.js";
import { assertPayloadLimit } from "../security/payload-limits.js";
import { ConnectionRateLimiter } from "../security/rate-limit.js";
import { routeClientEvent } from "./message-router.js";
import { SessionState } from "./session-manager.js";
import { acceptWebSocket, closeSocket, decodeTextFrames, writeUpgradeRejection } from "./ws-protocol.js";

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
    socket.on("data", (chunk: Buffer) => {
      for (const message of decodeTextFrames(chunk)) void this.handleRawMessage(message, session);
    });
    socket.on("close", () => {
      clearInterval(heartbeat);
      if (session.abortController) session.abortController.abort();
      this.limiter.release(ip);
    });
    socket.on("error", () => {
      clearInterval(heartbeat);
      if (session.abortController) session.abortController.abort();
      this.limiter.release(ip);
    });
  }

  private async handleRawMessage(payload: string, session: SessionState): Promise<void> {
    try {
      assertPayloadLimit(payload, this.config.maxJsonPayloadBytes);
      const json = JSON.parse(payload) as unknown;
      const event = parseClientEvent(json, this.config.maxTextLength);
      await routeClientEvent(event, session, this.pythonClient);
    } catch (error) {
      const audio = error instanceof Error && error.message === "audio_not_enabled";
      session.send({ type: "response.error", code: audio ? "AUDIO_NOT_ENABLED" : "VALIDATION_ERROR", message: audio ? "Audio transport is reserved for a future phase." : "Invalid assistant gateway message." });
    }
  }
}
