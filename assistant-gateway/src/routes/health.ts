import type { ServerResponse } from "node:http";

export function writeJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

export function handleHealth(response: ServerResponse): void {
  writeJson(response, 200, { status: "ok", service: "converse-assistant-gateway", version: "0.1.0" });
}
