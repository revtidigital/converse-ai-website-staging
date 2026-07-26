// assistant-service — HTTP text endpoint backed by the shared WebsiteBrainService.
// This service loads the embedding model ONCE and talks to Supabase pgvector.
// The realtime gateway calls this over HTTP with an internal token.
//
// Endpoints:
//   GET  /health
//   POST /v1/assistant/respond   (optionally x-internal-token protected)

import express, { type Request, type Response } from "express";
import {
  WebsiteBrainService, SupabaseKnowledgeStore, InMemoryStore,
  SupabaseMemoryStore, buildStaticMemoryStore, getEmbedder, CONFIG,
  type KnowledgeStore,
} from "@converseai/assistant";

const PORT = Number(process.env.PORT ?? 8787);
const INTERNAL_TOKEN = process.env.ASSISTANT_INTERNAL_GATEWAY_TOKEN ?? "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
// ASSISTANT_STORE=memory → in-memory vector index from static docs (local E2E,
// no Supabase). Default = Supabase pgvector.
const STORE_MODE = process.env.ASSISTANT_STORE ?? "supabase";

const memory = CONFIG.supabaseServiceRoleKey && process.env.ASSISTANT_MEMORY_STORE === "supabase"
  ? new SupabaseMemoryStore()
  : new InMemoryStore();

let brain: WebsiteBrainService;
async function initBrain() {
  const store: KnowledgeStore = STORE_MODE === "memory"
    ? await buildStaticMemoryStore()
    : new SupabaseKnowledgeStore();
  brain = new WebsiteBrainService(store, memory);
}

const app = express();
app.use(express.json({ limit: "16kb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.length && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "content-type,x-internal-token");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok", model: CONFIG.embeddingModel }));

app.post("/v1/assistant/respond", async (req: Request, res: Response) => {
  if (INTERNAL_TOKEN && req.header("x-internal-token") !== INTERNAL_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { message, sessionId, language, pageContext, concise } = req.body ?? {};
  if (typeof message !== "string" || !message.trim() || typeof sessionId !== "string") {
    return res.status(400).json({ error: "invalid_request" });
  }
  if (message.length > 2000) return res.status(413).json({ error: "message_too_long" });
  if (!brain) return res.status(503).json({ error: "warming_up" });
  try {
    const result = await brain.respond({
      message: message.trim(), sessionId,
      language: typeof language === "string" ? language : "auto",
      pageContext: pageContext && typeof pageContext === "object" ? pageContext : undefined,
      concise: !!concise,
    });
    console.log(`[respond] intent=${result.intent} conf=${result.confidenceCategory} action=${result.action.type}`);
    res.json(result);
  } catch (err) {
    console.error("[respond] error_category=synthesis");
    res.status(200).json({
      text: "Our assistant is temporarily unavailable. Please try again shortly.",
      language: "en", confidence: 0, confidenceCategory: "low",
      intent: "unsupported_general", sources: [], action: { type: "none", target: null },
    });
  }
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`[assistant-service] listening on 0.0.0.0:${PORT} store=${STORE_MODE}`);
  try { await getEmbedder(); await initBrain(); console.log("[assistant-service] brain ready"); }
  catch (e) { console.warn("[assistant-service] warmup failed:", (e as Error).message); }
});
