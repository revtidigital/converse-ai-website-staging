import { useCallback, useEffect, useRef, useState } from "react";
import { XaiAudioPlayback } from "@/lib/voice/xai/audioPlayback";
import { startXaiAudioCapture } from "@/lib/voice/xai/audioCapture";
import { XaiRealtimeClient } from "@/lib/voice/xai/XaiRealtimeClient";
import type { AudioCaptureController, XaiConnectionState, XaiMicrophoneState, XaiRealtimeClientEvent, XaiVoiceState } from "@/lib/voice/xai/types";

export interface UseXaiVoiceAgentOptions {
  enabled?: boolean;
}

export function isXaiRealtimeEnabled(): boolean {
  return import.meta.env.VITE_XAI_REALTIME_ENABLED === "true";
}

export function useXaiVoiceAgent(options: UseXaiVoiceAgentOptions = {}) {
  const enabled = options.enabled ?? isXaiRealtimeEnabled();
  const [connectionState, setConnectionState] = useState<XaiConnectionState>("closed");
  const [voiceState, setVoiceState] = useState<XaiVoiceState>("closed");
  const [microphoneState, setMicrophoneState] = useState<XaiMicrophoneState>("idle");
  const [transcript, setTranscript] = useState("");
  const [responseTranscript, setResponseTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<XaiRealtimeClient | null>(null);
  const captureRef = useRef<AudioCaptureController | null>(null);
  const playbackRef = useRef<XaiAudioPlayback | null>(null);
  const sessionActiveRef = useRef(false);
  const explicitStopRef = useRef(false);

  const cleanup = useCallback(async () => {
    sessionActiveRef.current = false;
    await captureRef.current?.stop();
    captureRef.current = null;
    await playbackRef.current?.close();
    playbackRef.current = null;
    clientRef.current?.cleanup();
    clientRef.current = null;
    setMicrophoneState("idle");
  }, []);

  const handleClientEvent = useCallback((event: XaiRealtimeClientEvent) => {
    if (!sessionActiveRef.current && event.type !== "status") return;
    if (event.type === "status") {
      setConnectionState(event.state);
      if (event.state === "reconnecting") setVoiceState("recovering");
      if (event.state === "open") setVoiceState((current) => current === "connecting" || current === "recovering" ? "ready" : current);
      if (event.state === "error") setVoiceState("error");
      return;
    }
    if (event.type === "error") {
      setError(event.error);
      setVoiceState("error");
      return;
    }
    if (event.type === "input_transcript") {
      setTranscript(event.transcript);
      setVoiceState("thinking");
      return;
    }
    if (event.type === "response_transcript_delta") {
      setResponseTranscript((current) => current + event.delta);
      setVoiceState("speaking");
      return;
    }
    if (event.type === "output_audio_delta") {
      playbackRef.current?.enqueueBase64Pcm16(event.audio);
      setVoiceState("speaking");
      return;
    }
    if (event.type === "response_done") {
      setVoiceState("listening");
    }
  }, []);

  const startSession = useCallback(async () => {
    if (!enabled) return false;
    if (sessionActiveRef.current) return true;
    explicitStopRef.current = false;
    sessionActiveRef.current = true;
    setError(null);
    setTranscript("");
    setResponseTranscript("");
    setVoiceState("connecting");
    setConnectionState("connecting");

    const client = new XaiRealtimeClient();
    const playback = new XaiAudioPlayback();
    clientRef.current = client;
    playbackRef.current = playback;
    client.on(handleClientEvent);
    playback.on((event) => {
      if (event === "started") setVoiceState("speaking");
      if (event === "ended" && sessionActiveRef.current) setVoiceState("listening");
      if (event === "interrupted" && sessionActiveRef.current) setVoiceState("listening");
    });

    try {
      await client.connect();
      if (!sessionActiveRef.current) return false;
      setVoiceState("permission");
      setMicrophoneState("requesting");
      captureRef.current = await startXaiAudioCapture({ onChunk: (chunk) => client.sendAudio(chunk) });
      if (!sessionActiveRef.current) {
        await cleanup();
        return false;
      }
      setMicrophoneState("active");
      setVoiceState("listening");
      return true;
    } catch (err) {
      if (!explicitStopRef.current) {
        setError(err instanceof Error ? err.message : "Voice service unavailable");
        setVoiceState("error");
        setConnectionState("error");
      }
      await cleanup();
      return false;
    }
  }, [cleanup, enabled, handleClientEvent]);

  const stopSession = useCallback(async () => {
    explicitStopRef.current = true;
    await cleanup();
    setConnectionState("closed");
    setVoiceState("closed");
    setError(null);
  }, [cleanup]);

  const interrupt = useCallback(() => {
    clientRef.current?.cancelResponse();
    playbackRef.current?.interrupt();
    setVoiceState(sessionActiveRef.current ? "listening" : "closed");
  }, []);

  const retry = useCallback(async () => {
    await cleanup();
    return startSession();
  }, [cleanup, startSession]);

  useEffect(() => () => { void cleanup(); }, [cleanup]);

  return {
    connectionState,
    voiceState,
    transcript,
    responseTranscript,
    error,
    microphoneState,
    startSession,
    stopSession,
    interrupt,
    retry,
  };
}
