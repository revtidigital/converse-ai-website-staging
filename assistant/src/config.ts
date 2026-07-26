// Central config. All secrets come from the backend environment only —
// never a VITE_ variable, never shipped to the browser.

export const CONFIG = {
  embeddingModel:
    process.env.ASSISTANT_EMBEDDING_MODEL ??
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
  embeddingDimension: Number(process.env.ASSISTANT_EMBEDDING_DIMENSION ?? 384),
  embeddingVersion: Number(process.env.ASSISTANT_EMBEDDING_VERSION ?? 1),

  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  // Service-role key is REQUIRED for ingestion + session-memory writes.
  // The anon key can only read published chunks via the match RPC.
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",

  retrievalThreshold: Number(process.env.ASSISTANT_RETRIEVAL_THRESHOLD ?? 0.65),
  retrievalCount: Number(process.env.ASSISTANT_RETRIEVAL_COUNT ?? 5),
  sessionTtlSeconds: Number(process.env.ASSISTANT_SESSION_TTL_SECONDS ?? 1800),

  // Synthesis provider. Default "extractive" = the self-hosted, zero-cost
  // grounded engine (no external LLM key needed). "openai_compatible" is
  // optional/pluggable and only used if a key is explicitly configured.
  llmProvider: process.env.ASSISTANT_LLM_PROVIDER ?? "extractive",
  llmModel: process.env.ASSISTANT_LLM_MODEL ?? "",
  llmBaseUrl: process.env.ASSISTANT_LLM_BASE_URL ?? "",
  llmApiKey: process.env.ASSISTANT_LLM_API_KEY ?? "",
} as const;
