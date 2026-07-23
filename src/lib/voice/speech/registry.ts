import { detectSpeechCapabilities, type SpeechRuntimeCapabilityReport } from "./capability";

export type SpeechEngineKind = "native-speech-recognition" | "typed-input";

export interface RegisteredSpeechEngine {
  kind: SpeechEngineKind;
  label: string;
  available: boolean;
  reasons: string[];
  requiresMicrophone: boolean;
}

export interface UnavailableSpeechEngine {
  kind: SpeechEngineKind;
  reasons: string[];
}

export interface SpeechEngineSelectionResult {
  recommendedEngine: SpeechEngineKind;
  fallbackOrder: SpeechEngineKind[];
  availableEngines: SpeechEngineKind[];
  unavailableEngines: UnavailableSpeechEngine[];
}

export function getSpeechEngineRegistry(
  report: SpeechRuntimeCapabilityReport = detectSpeechCapabilities(),
): RegisteredSpeechEngine[] {
  return [
    {
      kind: "native-speech-recognition",
      label: "Native SpeechRecognition",
      available: report.nativeSpeechRecognition.available,
      reasons: report.nativeSpeechRecognition.reasons,
      requiresMicrophone: true,
    },
    {
      kind: "typed-input",
      label: "Typed input",
      available: true,
      reasons: [],
      requiresMicrophone: false,
    },
  ];
}

export function selectSpeechEngine(
  report: SpeechRuntimeCapabilityReport = detectSpeechCapabilities(),
): SpeechEngineSelectionResult {
  const registry = getSpeechEngineRegistry(report);
  const availableEngines = registry.filter((engine) => engine.available).map((engine) => engine.kind);
  const unavailableEngines = registry
    .filter((engine) => !engine.available)
    .map(({ kind, reasons }) => ({ kind, reasons }));
  const nativeAvailable = availableEngines.includes("native-speech-recognition");
  const fallbackOrder: SpeechEngineKind[] = nativeAvailable
    ? ["native-speech-recognition", "typed-input"]
    : ["typed-input"];

  return {
    recommendedEngine: nativeAvailable ? "native-speech-recognition" : "typed-input",
    fallbackOrder,
    availableEngines,
    unavailableEngines,
  };
}
