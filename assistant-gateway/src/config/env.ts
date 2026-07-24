export interface GatewayConfig {
  nodeEnv: "development" | "test" | "production";
  port: number;
  pythonAssistantBaseUrl: string;
  allowedOrigins: string[];
  maxConnectionsPerIp: number;
  maxTextLength: number;
  requestTimeoutMs: number;
  idleTimeoutMs: number;
  maxJsonPayloadBytes: number;
  maxBinaryPayloadBytes: number;
  maxAudioFrameBytes: number;
  maxAudioRequestBytes: number;
  maxAudioDurationMs: number;
  pythonVoiceBaseUrl: string;
  internalGatewayToken?: string;
}

function readInt(env: NodeJS.ProcessEnv, key: string, fallback: number): number {
  const raw = env[key];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} must be a positive integer`);
  return value;
}

function assertHttpUrl(value: string, label: string): void {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${label} must use http or https`);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const nodeEnv = (env.NODE_ENV ?? "development") as GatewayConfig["nodeEnv"];
  if (!["development", "test", "production"].includes(nodeEnv)) throw new Error("NODE_ENV is invalid");
  const pythonAssistantBaseUrl = env.PYTHON_ASSISTANT_BASE_URL ?? "http://127.0.0.1:8787";
  assertHttpUrl(pythonAssistantBaseUrl, "PYTHON_ASSISTANT_BASE_URL");
  const pythonVoiceBaseUrl = env.PYTHON_VOICE_BASE_URL ?? pythonAssistantBaseUrl;
  assertHttpUrl(pythonVoiceBaseUrl, "PYTHON_VOICE_BASE_URL");
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",").map((origin) => origin.trim()).filter(Boolean);
  if (nodeEnv === "production" && allowedOrigins.includes("*")) throw new Error("Wildcard origins are not allowed in production");
  for (const origin of allowedOrigins) if (origin !== "*") assertHttpUrl(origin, "ALLOWED_ORIGINS");
  return {
    nodeEnv,
    port: readInt(env, "PORT", 8790),
    pythonAssistantBaseUrl: pythonAssistantBaseUrl.replace(/\/+$/, ""),
    allowedOrigins,
    maxConnectionsPerIp: readInt(env, "MAX_CONNECTIONS_PER_IP", 5),
    maxTextLength: readInt(env, "MAX_TEXT_LENGTH", 4000),
    requestTimeoutMs: readInt(env, "REQUEST_TIMEOUT_MS", 120000),
    idleTimeoutMs: readInt(env, "IDLE_TIMEOUT_MS", 300000),
    maxJsonPayloadBytes: readInt(env, "MAX_JSON_PAYLOAD_BYTES", 16384),
    maxBinaryPayloadBytes: readInt(env, "MAX_BINARY_PAYLOAD_BYTES", 262144),
    maxAudioFrameBytes: readInt(env, "MAX_AUDIO_FRAME_BYTES", 65536),
    maxAudioRequestBytes: readInt(env, "MAX_AUDIO_REQUEST_BYTES", 16000000),
    maxAudioDurationMs: readInt(env, "MAX_AUDIO_DURATION_MS", 120000),
    pythonVoiceBaseUrl: pythonVoiceBaseUrl.replace(/\/+$/, ""),
    internalGatewayToken: env.INTERNAL_GATEWAY_TOKEN?.trim() || undefined
  };
}
