// React adapter over AssistantGatewayClient. Turns the streaming realtime
// protocol into a simple, turn-based `ask()` promise the voice hook can await,
// while exposing live connection status for the UI. When no gateway is
// configured (or it's unreachable) this stays inert and the caller falls back
// to the in-browser brain — the site keeps working either way.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGatewayClient,
  type AssistantGatewayClient,
  type ConnectionStatus,
  type GatewayAction,
  type GatewaySources,
  type PageContext,
} from "@/lib/voice/gatewayClient";

export interface GatewayAnswer {
  text: string;
  action: GatewayAction;
  sources: GatewaySources[];
  language: string;
  confidence: number;
  confidenceCategory: string;
  intent: string;
}

const ASK_TIMEOUT_MS = 15000;

export function useAssistantGateway() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const clientRef = useRef<AssistantGatewayClient | null>(null);
  const pendingRef = useRef<{
    resolve: (a: GatewayAnswer) => void;
    reject: (e: Error) => void;
    timer: ReturnType<typeof setTimeout>;
    partial: { action: GatewayAction; sources: GatewaySources[] };
  } | null>(null);

  useEffect(() => {
    const client = createGatewayClient({
      onStatus: setStatus,
      onSources: (sources) => { if (pendingRef.current) pendingRef.current.partial.sources = sources; },
      onAction: (action) => { if (pendingRef.current) pendingRef.current.partial.action = action; },
      onTextFinal: (text, meta) => {
        const p = pendingRef.current;
        if (!p) return;
        clearTimeout(p.timer);
        pendingRef.current = null;
        p.resolve({ text, action: p.partial.action, sources: p.partial.sources, ...meta });
      },
      onError: (category, message) => {
        const p = pendingRef.current;
        if (!p) return;
        clearTimeout(p.timer);
        pendingRef.current = null;
        p.reject(new Error(`${category}: ${message}`));
      },
      onCancelled: () => {
        const p = pendingRef.current;
        if (!p) return;
        clearTimeout(p.timer);
        pendingRef.current = null;
        p.reject(new Error("cancelled"));
      },
    });
    if (!client) { setStatus("unavailable"); return; }
    clientRef.current = client;
    client.connect();
    return () => { client.close(); clientRef.current = null; };
  }, []);

  const ask = useCallback((text: string, pageContext?: PageContext, language = "auto"): Promise<GatewayAnswer> => {
    return new Promise((resolve, reject) => {
      const client = clientRef.current;
      if (!client || client.getStatus() !== "open") { reject(new Error("gateway_not_open")); return; }
      // Only one turn in flight; supersede any previous.
      if (pendingRef.current) { clearTimeout(pendingRef.current.timer); pendingRef.current.reject(new Error("superseded")); }
      const timer = setTimeout(() => { pendingRef.current = null; reject(new Error("timeout")); }, ASK_TIMEOUT_MS);
      pendingRef.current = { resolve, reject, timer, partial: { action: { type: "none", target: null }, sources: [] } };
      client.query(text, pageContext, language);
    });
  }, []);

  const cancel = useCallback(() => { clientRef.current?.cancel(); }, []);
  const reset = useCallback(() => { clientRef.current?.reset(); }, []);
  const isReady = useCallback(() => clientRef.current?.getStatus() === "open", []);

  return { status, ask, cancel, reset, isReady };
}
