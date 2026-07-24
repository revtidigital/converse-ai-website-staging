import { useCallback, useMemo, useState } from "react";
import type { GatewayRouteContext } from "../lib/assistant-gateway/types";
import { WebSocketAssistantTransport } from "../lib/assistant-gateway/client";
import { isVoiceEnabled } from "../lib/audio/audioValidation";
import { useAudioCapture } from "./useAudioCapture";
import { useMicrophonePermission } from "./useMicrophonePermission";

export function useVoiceAssistant(gatewayUrl: string, onFinalTranscript: (text: string) => void, routeContext?: GatewayRouteContext) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const { error, requestMicrophone } = useMicrophonePermission();
  const transport = useMemo(() => new WebSocketAssistantTransport(gatewayUrl, "voice"), [gatewayUrl]);
  const capture = useAudioCapture((frame) => transport.sendAudioFrame?.(frame));

  const start = useCallback(async () => {
    if (!isVoiceEnabled()) return;
    const stream = await requestMicrophone();
    if (!stream) return;
    const id = crypto.randomUUID();
    setRequestId(id);
    await transport.connect();
    transport.subscribe((event) => {
      if (event.type === "transcript.final" && event.requestId === id) {
        setTranscript(event.text);
        onFinalTranscript(event.text);
      }
    });
    transport.sendAudioStart?.(id, routeContext);
    await capture.start(stream);
  }, [capture, onFinalTranscript, requestMicrophone, routeContext, transport]);

  const stop = useCallback(async () => {
    if (requestId) transport.sendAudioEnd?.(requestId);
    await capture.stop();
  }, [capture, requestId, transport]);

  const cancel = useCallback(async () => {
    if (requestId) transport.cancelAudio(requestId);
    await capture.cancel();
  }, [capture, requestId, transport]);

  return { start, stop, cancel, state: capture.state, error, transcript };
}
