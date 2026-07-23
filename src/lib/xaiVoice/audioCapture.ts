import { XAI_AUDIO_RATE } from "./types";
import { arrayBufferToBase64, floatToPcm16LittleEndian, resampleLinear } from "./pcm";

const CHUNK_SAMPLES = 2048;

export type AudioCaptureOptions = { onChunk: (base64Pcm16: string) => void; onError: (message: string) => void; onSampleRate?: (rate: number) => void };

export class AudioCapture {
  private stream: MediaStream | null = null;
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stopped = true;

  constructor(private options: AudioCaptureOptions) {}

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone is unavailable in this browser.");
    if (this.stream || this.context) throw new Error("Microphone is already active.");
    this.stopped = false;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    this.context = new AudioContext();
    this.options.onSampleRate?.(this.context.sampleRate);
    this.source = this.context.createMediaStreamSource(this.stream);
    // ScriptProcessor is retained as a compatibility fallback; AudioWorklet setup requires a separate served module.
    this.processor = this.context.createScriptProcessor(CHUNK_SAMPLES, 1, 1);
    this.processor.onaudioprocess = (event) => {
      if (this.stopped || !this.context) return;
      const mono = event.inputBuffer.getChannelData(0);
      const resampled = resampleLinear(mono, this.context.sampleRate, XAI_AUDIO_RATE);
      this.options.onChunk(arrayBufferToBase64(floatToPcm16LittleEndian(resampled)));
    };
    this.source.connect(this.processor);
    this.processor.connect(this.context.destination);
  }

  async stop() {
    this.stopped = true;
    if (this.processor) this.processor.onaudioprocess = null;
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.context && this.context.state !== "closed") await this.context.close().catch(() => undefined);
    this.stream = null; this.context = null; this.source = null; this.processor = null;
  }
}
