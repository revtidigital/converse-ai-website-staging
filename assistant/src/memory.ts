// Conversation memory behind an interface. Bounded turns, char cap, TTL,
// reset, session isolation, topic switching. Stores only what's needed —
// never raw audio, secrets, or unnecessary PII.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "./config.js";
import type { Language, Source } from "./types.js";

export interface Turn {
  query: string;
  answer: string;
  topic?: string;
  at: number;
}

export interface SessionMemory {
  topic?: string;
  prevQuery?: string;
  prevAnswer?: string;
  prevSources?: Source[];
  selectedService?: string;
  selectedProduct?: string;
  route?: string;
  language?: Language;
  pendingClarification?: string;
  turns: Turn[];
}

const MAX_TURNS = 6;
const MAX_CHARS = 6000;

export function emptyMemory(): SessionMemory {
  return { turns: [] };
}

function trim(mem: SessionMemory): SessionMemory {
  mem.turns = mem.turns.slice(-MAX_TURNS);
  let total = mem.turns.reduce((n, t) => n + t.query.length + t.answer.length, 0);
  while (total > MAX_CHARS && mem.turns.length > 1) {
    const t = mem.turns.shift()!;
    total -= t.query.length + t.answer.length;
  }
  return mem;
}

export interface MemoryStore {
  get(sessionId: string): Promise<SessionMemory>;
  save(sessionId: string, mem: SessionMemory): Promise<void>;
  reset(sessionId: string): Promise<void>;
}

/** In-memory store with TTL — the default when no memory backend is configured. */
export class InMemoryStore implements MemoryStore {
  private map = new Map<string, { mem: SessionMemory; exp: number }>();
  constructor(private ttlMs = CONFIG.sessionTtlSeconds * 1000) {}
  async get(id: string): Promise<SessionMemory> {
    const e = this.map.get(id);
    if (!e || e.exp < Date.now()) {
      this.map.delete(id);
      return emptyMemory();
    }
    return e.mem;
  }
  async save(id: string, mem: SessionMemory): Promise<void> {
    this.map.set(id, { mem: trim(mem), exp: Date.now() + this.ttlMs });
  }
  async reset(id: string): Promise<void> {
    this.map.delete(id);
  }
}

/** Supabase-backed store (assistant_session_memory) — service-role only. */
export class SupabaseMemoryStore implements MemoryStore {
  private client: SupabaseClient;
  constructor(client?: SupabaseClient) {
    this.client =
      client ??
      createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey, {
        auth: { persistSession: false },
      });
  }
  async get(id: string): Promise<SessionMemory> {
    const { data } = await this.client
      .from("assistant_session_memory")
      .select("data, expires_at")
      .eq("session_id", id)
      .maybeSingle();
    if (!data || new Date(data.expires_at).getTime() < Date.now()) return emptyMemory();
    return { ...emptyMemory(), ...(data.data as SessionMemory) };
  }
  async save(id: string, mem: SessionMemory): Promise<void> {
    const exp = new Date(Date.now() + CONFIG.sessionTtlSeconds * 1000).toISOString();
    await this.client.from("assistant_session_memory").upsert({
      session_id: id,
      data: trim(mem),
      updated_at: new Date().toISOString(),
      expires_at: exp,
    });
  }
  async reset(id: string): Promise<void> {
    await this.client.from("assistant_session_memory").delete().eq("session_id", id);
  }
}

export function recordTurn(mem: SessionMemory, query: string, answer: string, topic?: string): SessionMemory {
  mem.turns.push({ query, answer, topic, at: Date.now() });
  mem.prevQuery = query;
  mem.prevAnswer = answer;
  if (topic) mem.topic = topic;
  return trim(mem);
}
