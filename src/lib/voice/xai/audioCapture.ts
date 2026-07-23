import { floatToBase64Pcm16, rms } from "./pcm";
import { XAI_INPUT_SAMPLE_RATE, type AudioCaptureController, type AudioCaptureOptions } from "./types";

const WORKLET_NAME = "xai-pcm-capture";
const WORKLET_SOURCE = `
class XaiPcmCapture extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (input && input.length) this.port.postMessage(input.slice(0));
    return true;
  }
}
registerProcessor('${WORKLET_NAME}', XaiPcmCapture);
`;

let activeController: AudioCaptureController | null = null;

function getAudioContext(factory?: () => AudioContext): AudioContext {
  if (factory) return factory();
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio is unavailable");
  return new Ctor();
}

async function createWorkletNode(ctx: AudioContext): Promise<AudioWorkletNode | null> {
  if (!ctx.audioWorklet || typeof AudioWorkletNode === "undefined") return null;
  const blob = new Blob([WORKLET_SOURCE], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  try {
    await ctx.audioWorklet.addModule(url);
    return new AudioWorkletNode(ctx, WORKLET_NAME);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function startXaiAudioCapture(options: AudioCaptureOptions): Promise<AudioCaptureController> {
  if (activeController) return activeController;
  const mediaDevices = options.mediaDevices ?? navigator.mediaDevices;
  if (!mediaDevices?.getUserMedia) throw new Error("Microphone capture is unavailable");

  const stream = await mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  const ctx = getAudioContext(options.audioContextFactory);
  await ctx.resume().catch(() => undefined);
  const source = ctx.createMediaStreamSource(stream);
  const targetRate = options.sampleRate ?? XAI_INPUT_SAMPLE_RATE;
  const silenceThreshold = options.silenceThreshold ?? 0.006;
  const chunkSamples = Math.max(256, Math.round(ctx.sampleRate * ((options.chunkMs ?? 40) / 1000)));
  let buffer = new Float32Array(0);
  let stopped = false;
  let workletNode: AudioWorkletNode | null = null;
  let scriptNode: ScriptProcessorNode | null = null;

  const flush = (samples: Float32Array) => {
    if (stopped || !samples.length || rms(samples) < silenceThreshold) return;
    options.onChunk(floatToBase64Pcm16(samples, ctx.sampleRate, targetRate));
  };

  const append = (samples: Float32Array) => {
    const next = new Float32Array(buffer.length + samples.length);
    next.set(buffer);
    next.set(samples, buffer.length);
    buffer = next;
    while (buffer.length >= chunkSamples) {
      flush(buffer.slice(0, chunkSamples));
      buffer = buffer.slice(chunkSamples);
    }
  };

  workletNode = await createWorkletNode(ctx);
  if (workletNode) {
    workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => append(event.data);
    source.connect(workletNode);
    workletNode.connect(ctx.destination);
  } else {
    scriptNode = ctx.createScriptProcessor(2048, 1, 1);
    scriptNode.onaudioprocess = (event) => append(event.inputBuffer.getChannelData(0).slice(0));
    source.connect(scriptNode);
    scriptNode.connect(ctx.destination);
  }

  activeController = {
    async stop() {
      if (stopped) return;
      stopped = true;
      if (buffer.length) flush(buffer);
      buffer = new Float32Array(0);
      workletNode?.port.close();
      workletNode?.disconnect();
      scriptNode?.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      if (ctx.state !== "closed") await ctx.close().catch(() => undefined);
      activeController = null;
    },
  };
  return activeController;
}
