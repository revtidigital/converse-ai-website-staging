import type { SpeechRecognitionLike } from "./types";

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface CapabilityState {
  available: boolean;
  reasons: string[];
}

export interface NativeSpeechRecognitionCapability extends CapabilityState {
  constructorName: "SpeechRecognition" | "webkitSpeechRecognition" | null;
}

export interface MicrophoneCapability extends CapabilityState {
  mediaDevices: boolean;
  getUserMedia: boolean;
}

export interface AudioCapability extends CapabilityState {
  audioContext: boolean;
  webkitAudioContext: boolean;
  audioWorklet: boolean;
}

export interface DeviceCapabilityInfo {
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export interface SpeechRuntimeCapabilityReport {
  environment: "browser" | "ssr";
  nativeSpeechRecognition: NativeSpeechRecognitionCapability;
  microphone: MicrophoneCapability;
  webGpu: CapabilityState;
  wasm: CapabilityState;
  worker: CapabilityState;
  audio: AudioCapability;
  indexedDb: CapabilityState;
  secureContext: CapabilityState;
  device: DeviceCapabilityInfo;
}

interface SpeechCapabilityWindowLike {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  AudioContext?: new (...args: never[]) => unknown;
  webkitAudioContext?: new (...args: never[]) => unknown;
  AudioWorklet?: unknown;
  AudioWorkletNode?: unknown;
  isSecureContext?: boolean;
  indexedDB?: IDBFactory;
}

interface SpeechCapabilityNavigatorLike {
  mediaDevices?: {
    getUserMedia?: (...args: never[]) => unknown;
  };
  gpu?: unknown;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export interface SpeechCapabilityRuntime {
  window?: SpeechCapabilityWindowLike;
  navigator?: SpeechCapabilityNavigatorLike;
  worker?: typeof Worker;
  webAssembly?: typeof WebAssembly;
  audioWorkletAvailable?: boolean;
}

function unavailable(reason: string): CapabilityState {
  return { available: false, reasons: [reason] };
}

function available(): CapabilityState {
  return { available: true, reasons: [] };
}

function getDefaultRuntime(): SpeechCapabilityRuntime {
  const win = typeof window === "undefined" ? undefined : (window as SpeechCapabilityWindowLike);
  const nav = typeof navigator === "undefined" ? undefined : (navigator as SpeechCapabilityNavigatorLike);
  const audioContextCtor = win?.AudioContext || win?.webkitAudioContext;

  return {
    window: win,
    navigator: nav,
    worker: typeof Worker === "undefined" ? undefined : Worker,
    webAssembly: typeof WebAssembly === "undefined" ? undefined : WebAssembly,
    audioWorkletAvailable:
      !!win &&
      ((!!audioContextCtor && "audioWorklet" in audioContextCtor.prototype) ||
        "AudioWorklet" in win ||
        "AudioWorkletNode" in win),
  };
}

export function getNativeSpeechRecognitionConstructor(
  runtime: SpeechCapabilityRuntime = getDefaultRuntime(),
): { ctor: SpeechRecognitionConstructor | null; constructorName: NativeSpeechRecognitionCapability["constructorName"] } {
  const win = runtime.window;
  if (!win) return { ctor: null, constructorName: null };
  if (win.SpeechRecognition) return { ctor: win.SpeechRecognition, constructorName: "SpeechRecognition" };
  if (win.webkitSpeechRecognition) return { ctor: win.webkitSpeechRecognition, constructorName: "webkitSpeechRecognition" };
  return { ctor: null, constructorName: null };
}

export function detectSpeechCapabilities(runtime: SpeechCapabilityRuntime = getDefaultRuntime()): SpeechRuntimeCapabilityReport {
  const hasWindow = !!runtime.window;
  const hasNavigator = !!runtime.navigator;
  const environment: SpeechRuntimeCapabilityReport["environment"] = hasWindow ? "browser" : "ssr";

  const nativeCtor = getNativeSpeechRecognitionConstructor(runtime);
  const nativeSpeechRecognition: NativeSpeechRecognitionCapability = nativeCtor.ctor
    ? { ...available(), constructorName: nativeCtor.constructorName }
    : {
        ...unavailable(hasWindow ? "SpeechRecognition and webkitSpeechRecognition are unavailable." : "Window is unavailable during SSR."),
        constructorName: null,
      };

  const mediaDevices = !!runtime.navigator?.mediaDevices;
  const getUserMedia = typeof runtime.navigator?.mediaDevices?.getUserMedia === "function";
  const microphone: MicrophoneCapability = {
    available: mediaDevices && getUserMedia,
    mediaDevices,
    getUserMedia,
    reasons: [
      ...(hasNavigator ? [] : ["Navigator is unavailable during SSR."]),
      ...(mediaDevices ? [] : ["navigator.mediaDevices is unavailable."]),
      ...(getUserMedia ? [] : ["navigator.mediaDevices.getUserMedia is unavailable."]),
    ],
  };

  const webGpu = runtime.navigator?.gpu ? available() : unavailable(hasNavigator ? "navigator.gpu is unavailable." : "Navigator is unavailable during SSR.");
  const wasm = runtime.webAssembly ? available() : unavailable("WebAssembly is unavailable.");
  const worker = runtime.worker ? available() : unavailable("Worker is unavailable.");

  const audioContext = !!runtime.window?.AudioContext;
  const webkitAudioContext = !!runtime.window?.webkitAudioContext;
  const audioWorklet = !!runtime.audioWorkletAvailable;
  const audio: AudioCapability = {
    available: (audioContext || webkitAudioContext) && audioWorklet,
    audioContext,
    webkitAudioContext,
    audioWorklet,
    reasons: [
      ...(audioContext || webkitAudioContext ? [] : ["AudioContext and webkitAudioContext are unavailable."]),
      ...(audioWorklet ? [] : ["AudioWorklet is unavailable."]),
    ],
  };

  const indexedDb = runtime.window?.indexedDB ? available() : unavailable(hasWindow ? "IndexedDB is unavailable." : "Window is unavailable during SSR.");
  const secureContext = runtime.window?.isSecureContext ? available() : unavailable(hasWindow ? "Current context is not secure." : "Window is unavailable during SSR.");

  return {
    environment,
    nativeSpeechRecognition,
    microphone,
    webGpu,
    wasm,
    worker,
    audio,
    indexedDb,
    secureContext,
    device: {
      deviceMemory: runtime.navigator?.deviceMemory,
      hardwareConcurrency: runtime.navigator?.hardwareConcurrency,
    },
  };
}
