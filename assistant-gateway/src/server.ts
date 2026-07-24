import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import type { GatewayConfig } from "./config/env.js";
import { handleHealth, writeJson } from "./routes/health.js";
import { handleReadiness } from "./routes/readiness.js";
import { AssistantWebSocketGateway } from "./websocket/connection-handler.js";

export function buildServer(config: GatewayConfig) {
  const gateway = new AssistantWebSocketGateway(config);
  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (request.method === "GET" && url.pathname === "/health") {
      handleHealth(response); return;
    }
    if (request.method === "GET" && url.pathname === "/health/ready") {
      void handleReadiness(response, config); return;
    }
    writeJson(response, 404, { status: "not_found" });
  });
  server.on("upgrade", (request, socket) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname !== "/v1/realtime") {
      socket.destroy(); return;
    }
    gateway.handleUpgrade(request, socket as Socket);
  });
  return server;
}
