import type { VercelRequest, VercelResponse } from "@vercel/node";

const XAI_CLIENT_SECRET_URL = "https://api.x.ai/v1/realtime/client_secrets";
const TOKEN_TTL_SECONDS = 300;
const UPSTREAM_TIMEOUT_MS = 8000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0].split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}

function originAllowed(req: VercelRequest): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers.host;
  if (!host) return true;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host || /(^|\.)theconverseai\.com$/i.test(originUrl.hostname) || originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!originAllowed(req)) return res.status(403).json({ error: "Origin not allowed" });

  const ip = clientIp(req);
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many requests" });

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Voice service is not configured" });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(XAI_CLIENT_SECRET_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expires_after: { seconds: TOKEN_TTL_SECONDS } }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Voice service token request failed" });
    }

    const data = await upstream.json() as { value?: string; expires_at?: number; client_secret?: { value?: string; expires_at?: number } };
    const token = data.value ?? data.client_secret?.value;
    const expiresAt = data.expires_at ?? data.client_secret?.expires_at;
    if (!token || !expiresAt) return res.status(502).json({ error: "Voice service returned an invalid token" });

    return res.status(200).json({ token, expiresAt, expiresInSeconds: Math.max(0, expiresAt - Math.floor(Date.now() / 1000)) });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return res.status(aborted ? 504 : 502).json({ error: aborted ? "Voice service token request timed out" : "Voice service token request failed" });
  } finally {
    clearTimeout(timeout);
  }
}
