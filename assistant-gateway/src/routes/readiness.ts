import type { ServerResponse } from "node:http";
import type { GatewayConfig } from "../config/env.js";
import { writeJson } from "./health.js";

export async function handleReadiness(response: ServerResponse, config: GatewayConfig): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(config.requestTimeoutMs, 3000));
    const result = await fetch(`${config.pythonAssistantBaseUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!result.ok) {
      writeJson(response, 503, { status: "not_ready", dependencies: { pythonAssistant: "unavailable", websocket: "ready" } });
      return;
    }
    writeJson(response, 200, { status: "ready", dependencies: { pythonAssistant: "ready", websocket: "ready" } });
  } catch {
    writeJson(response, 503, { status: "not_ready", dependencies: { pythonAssistant: "unavailable", websocket: "ready" } });
  }
}
