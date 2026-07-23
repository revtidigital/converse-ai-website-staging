import { useCallback, useEffect, useReducer, useRef } from "react";
import { AudioCapture } from "@/lib/xaiVoice/audioCapture";
import { AudioPlayback } from "@/lib/xaiVoice/audioPlayback";
import { logXaiVoiceDiagnostic } from "@/lib/xaiVoice/diagnostics";
import { XaiRealtimeClient } from "@/lib/xaiVoice/XaiRealtimeClient";
import { XAI_AUDIO_RATE, type VoiceState, type XaiRealtimeEvent } from "@/lib/xaiVoice/types";

export type UseXaiVoiceResult = { state: VoiceState; error: string | null; isActive: boolean; start: () => Promise<void>; stop: () => Promise<void>; interrupt: () => void; retry: () => Promise<void> };
type Model = { state: VoiceState; error: string | null };
type Action = { type: "state"; state: VoiceState; error?: string | null };
const reducer = (_: Model, action: Action): Model => ({ state: action.state, error: action.error ?? null });
const activeStates = new Set<VoiceState>(["requesting-permission", "connecting", "configuring", "listening", "user-speaking", "thinking", "speaking", "interrupted", "reconnecting"]);

export function useXaiVoice(): UseXaiVoiceResult {
  const [model, dispatch] = useReducer(reducer, { state: "closed", error: null });
  const stateRef = useRef<VoiceState>("closed");
  const mounted = useRef(true); const explicitStop = useRef(false); const responseDone = useRef(false); const activeResponse = useRef<string>(); const playbackGen = useRef(0);
  const client = useRef<XaiRealtimeClient>(); const capture = useRef<AudioCapture>(); const playback = useRef<AudioPlayback>();
  const turnStartedAt = useRef(0); const responseStartedAt = useRef(0); const chunksSent = useRef(0); const chunksReceived = useRef(0); const samplesReceived = useRef(0); const interruptedResponses = useRef(new Set<string>());
  const setState = useCallback((state: VoiceState, error: string | null = null) => { if (mounted.current && !explicitStop.current) { stateRef.current = state; dispatch({ type: "state", state, error }); } }, []);

  const maybeListening = useCallback((generation = playbackGen.current, reason = "response-and-playback-complete") => {
    if (generation === playbackGen.current && responseDone.current && playback.current?.queueLength === 0) {
      logXaiVoiceDiagnostic({ type: "playback_drained", elapsedMs: Math.round(performance.now() - responseStartedAt.current), reason });
      setState("listening");
    }
  }, [setState]);

  const interrupt = useCallback(() => {
    const responseId = activeResponse.current;
    setState("interrupted"); playback.current?.interrupt(); playbackGen.current = playback.current?.currentGeneration ?? playbackGen.current + 1;
    if (responseId) interruptedResponses.current.add(responseId);
    client.current?.cancelResponse(responseId); activeResponse.current = undefined; responseDone.current = true; setState("user-speaking");
  }, [setState]);

  const handleEvent = useCallback((event: XaiRealtimeEvent) => {
    const type = event.type;
    if (type === "input_audio_buffer.speech_started") {
      turnStartedAt.current = performance.now();
      logXaiVoiceDiagnostic({ type: "speech_started", elapsedMs: 0 });
      if (stateRef.current === "speaking") interrupt(); else setState("user-speaking");
      return;
    }
    if (type === "input_audio_buffer.speech_stopped") { logXaiVoiceDiagnostic({ type: "speech_stopped", elapsedMs: Math.round(performance.now() - turnStartedAt.current) }); setState("thinking"); return; }
    if (type === "response.created") { activeResponse.current = event.response?.id ?? event.response_id; responseDone.current = false; responseStartedAt.current = performance.now(); chunksReceived.current = 0; samplesReceived.current = 0; playbackGen.current = playback.current?.newGeneration() ?? playbackGen.current + 1; logXaiVoiceDiagnostic({ type: "response_created", responseId: activeResponse.current }); setState("thinking"); return; }
    if (type === "response.output_audio.delta" || type === "response.audio.delta") {
      const audio = typeof event.delta === "string" ? event.delta : typeof event.audio === "string" ? event.audio : null;
      const responseId = event.response_id ?? event.response?.id;
      if (!audio || (responseId && interruptedResponses.current.has(responseId)) || (activeResponse.current && responseId && responseId !== activeResponse.current)) return;
      chunksReceived.current += 1;
      const samples = Math.floor((atob(audio).length) / 2);
      samplesReceived.current += samples;
      logXaiVoiceDiagnostic({ type: "audio_delta", responseId, chunksReceived: chunksReceived.current, samplesReceived: samplesReceived.current, estimatedDurationMs: Math.round((samplesReceived.current / XAI_AUDIO_RATE) * 1000), firstDeltaMs: chunksReceived.current === 1 ? Math.round(performance.now() - responseStartedAt.current) : undefined });
      setState("speaking"); void playback.current?.enqueue(audio, playbackGen.current).catch(() => setState("error", "Audio playback failed.")); return;
    }
    if (type === "response.done") {
      const responseId = event.response_id ?? event.response?.id;
      if (responseId && interruptedResponses.current.has(responseId)) return;
      responseDone.current = true; logXaiVoiceDiagnostic({ type: "response_done", responseId, elapsedMs: Math.round(performance.now() - responseStartedAt.current) }); maybeListening(); return;
    }
    if (type === "error") setState("error", "The voice provider returned an error.");
  }, [interrupt, maybeListening, setState]);

  const stop = useCallback(async () => {
    explicitStop.current = true; stateRef.current = "closed"; dispatch({ type: "state", state: "closed", error: null });
    await Promise.all([capture.current?.stop(), playback.current?.close(), client.current?.stop()]);
    capture.current = undefined; playback.current = undefined; client.current = undefined; activeResponse.current = undefined; responseDone.current = false; interruptedResponses.current.clear(); chunksSent.current = 0;
    logXaiVoiceDiagnostic({ type: "cleanup_complete", reason: "explicit-stop" });
  }, []);

  const start = useCallback(async () => {
    if (client.current || capture.current || activeStates.has(stateRef.current)) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof WebSocket === "undefined" || typeof AudioContext === "undefined") { stateRef.current = "unavailable"; dispatch({ type: "state", state: "unavailable", error: "Voice is unavailable in this browser." }); return; }
    explicitStop.current = false; stateRef.current = "requesting-permission"; dispatch({ type: "state", state: "requesting-permission", error: null });
    try {
      playback.current = new AudioPlayback(); playback.current.onDrained((generation, reason) => maybeListening(generation, reason));
      client.current = new XaiRealtimeClient({ onEvent: handleEvent, onState: (state) => setState(state === "open" ? "listening" : state), onError: (message) => setState("error", message) });
      capture.current = new AudioCapture({ onChunk: (audio, meta) => { if (client.current?.isReady && client.current.bufferedAmount < 1_000_000) { chunksSent.current += 1; client.current.sendJson({ type: "input_audio_buffer.append", audio }); logXaiVoiceDiagnostic({ type: "microphone_chunk_sent", chunksSent: chunksSent.current, bufferedAmount: client.current.bufferedAmount, chunkSize: meta.chunkSize }); } }, onError: (message) => setState("error", message) });
      await capture.current.start(); stateRef.current = "connecting"; dispatch({ type: "state", state: "connecting", error: null }); await client.current.connect();
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      await stop(); stateRef.current = denied ? "permission-denied" : "error"; dispatch({ type: "state", state: denied ? "permission-denied" : "error", error: denied ? "Microphone permission is required." : "Voice could not be started." });
    }
  }, [handleEvent, maybeListening, setState, stop]);

  const retry = useCallback(async () => { await stop(); await start(); }, [start, stop]);
  useEffect(() => () => { mounted.current = false; void stop(); }, [stop]);
  return { state: model.state, error: model.error, isActive: activeStates.has(model.state), start, stop, interrupt, retry };
}
