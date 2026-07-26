// Multilingual sentence embeddings — self-hosted, zero-cost.
// Model: paraphrase-multilingual-MiniLM-L12-v2 (384-d), run locally via
// Transformers.js (ONNX). The SAME model + normalisation is used at ingest
// time and query time so cosine similarity is meaningful.

import { CONFIG } from "./config.js";

// Lazy singleton — the model loads exactly once per process.
let extractorPromise: Promise<(t: string) => Promise<number[]>> | null = null;

async function loadExtractor(): Promise<(t: string) => Promise<number[]>> {
  const { pipeline } = await import("@xenova/transformers");
  const pipe = await pipeline("feature-extraction", CONFIG.embeddingModel);
  return async (text: string) => {
    // mean pooling + L2 normalisation → unit vector, matches sentence-transformers.
    const out = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(out.data as Float32Array);
  };
}

export function getEmbedder() {
  if (!extractorPromise) extractorPromise = loadExtractor();
  return extractorPromise;
}

export async function embed(text: string): Promise<number[]> {
  const e = await getEmbedder();
  const v = await e(text.slice(0, 4000));
  if (v.length !== CONFIG.embeddingDimension) {
    throw new Error(
      `Embedding dim ${v.length} != expected ${CONFIG.embeddingDimension}`,
    );
  }
  return v;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) out.push(await embed(t)); // sequential: bounded memory
  return out;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both vectors are already L2-normalised
}
