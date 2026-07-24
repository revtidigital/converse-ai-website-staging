import { useCallback, useRef, useState } from "react";
import { encodePcmS16Le, mixToMono } from "../lib/audio/pcmEncoder";
import { resampleLinear } from "../lib/audio/resampler";
import { assertFrameSize } from "../lib/audio/audioValidation";
import { loadAssistantAudioWorklet } from "../lib/audio/audioWorklet";
import type { VoiceCaptureState } from "../lib/audio/audioTypes";

export function useAudioCapture(onFrame: (frame: ArrayBuffer) => void) {
  const [state, setState] = useState<VoiceCaptureState>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const stopTracks = useCallback(async () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    await contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
  }, []);

  const start = useCallback(async (stream: MediaStream) => {
    setState("listening");
    streamRef.current = stream;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error("audio_context_unavailable");
    const context = new AudioContextClass();
    contextRef.current = context;
    const source = context.createMediaStreamSource(stream);
    const worklet = await loadAssistantAudioWorklet(context);
    worklet.port.onmessage = (event: MessageEvent<Float32Array[]>) => {
      const mono = mixToMono(event.data);
      const pcm = encodePcmS16Le(resampleLinear(mono, context.sampleRate, 16000));
      assertFrameSize(pcm);
      onFrame(pcm);
    };
    source.connect(worklet);
  }, [onFrame]);

  const stop = useCallback(async () => { setState("processing"); await stopTracks(); }, [stopTracks]);
  const cancel = useCallback(async () => { setState("cancelled"); await stopTracks(); }, [stopTracks]);
  return { state, start, stop, cancel };
}
