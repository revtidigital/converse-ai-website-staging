import type { SpeechEngine, SpeechEngineCapabilities, SpeechEngineEvent, SpeechEngineListener } from "./types";

export class TypedInputEngine implements SpeechEngine {
  readonly kind = "typed-input" as const;
  readonly capabilities: SpeechEngineCapabilities = {
    kind: this.kind,
    available: true,
    requiresMicrophone: false,
    requiresNetwork: false,
    reasons: [],
  };

  private listeners = new Set<SpeechEngineListener>();
  private destroyed = false;
  private prepared = false;
  private started = false;
  private transcriptSequence = 0;

  prepare(): void {
    if (this.destroyed) return;
    this.prepared = true;
    this.emit({ type: "status", status: "ready" });
  }

  start(): void {
    if (this.destroyed) return;
    if (!this.prepared) this.prepare();
    this.started = true;
    this.emit({ type: "status", status: "listening" });
  }

  stop(): void {
    if (this.destroyed) return;
    this.started = false;
    this.emit({ type: "status", status: "stopped" });
  }

  abort(): void {
    if (this.destroyed) return;
    this.started = false;
    this.emit({ type: "status", status: "aborted" });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.started = false;
    this.listeners.clear();
  }

  onEvent(listener: SpeechEngineListener): () => void {
    if (this.destroyed) return () => undefined;
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  submit(text: string): void {
    if (this.destroyed) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!this.started) this.start();
    this.emit({
      type: "transcript",
      transcript: {
        id: `typed-input-${++this.transcriptSequence}`,
        text: trimmed,
        isFinal: true,
        source: this.kind,
        createdAt: Date.now(),
      },
    });
  }

  private emit(event: SpeechEngineEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
