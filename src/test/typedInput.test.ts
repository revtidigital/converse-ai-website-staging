import { describe, expect, it } from "vitest";
import { getSpeechEngineRegistry } from "@/lib/voice/speech/registry";
import { TypedInputEngine } from "@/lib/voice/speech/typedInput";
import type { SpeechEngineEvent } from "@/lib/voice/speech/types";

function collectEvents(engine: TypedInputEngine): SpeechEngineEvent[] {
  const events: SpeechEngineEvent[] = [];
  engine.onEvent((event) => events.push(event));
  return events;
}

describe("TypedInputEngine", () => {
  it("is always available and requires no microphone or network", () => {
    const engine = new TypedInputEngine();

    expect(engine.kind).toBe("typed-input");
    expect(engine.capabilities.available).toBe(true);
    expect(engine.capabilities.requiresMicrophone).toBe(false);
    expect(engine.capabilities.requiresNetwork).toBe(false);
  });

  it("emits one final typed-input transcript for valid text", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.submit("  hello there  ");

    const transcripts = events.filter((event) => event.type === "transcript");
    expect(transcripts).toHaveLength(1);
    expect(transcripts[0]).toMatchObject({
      type: "transcript",
      transcript: {
        text: "hello there",
        isFinal: true,
        source: "typed-input",
      },
    });
  });

  it("emits nothing for whitespace input", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.submit("   \n\t  ");

    expect(events).toEqual([]);
  });

  it("supports prepare/start/stop/abort lifecycle events", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.prepare();
    engine.start();
    engine.stop();
    engine.abort();

    expect(events).toEqual([
      { type: "status", status: "ready" },
      { type: "status", status: "listening" },
      { type: "status", status: "stopped" },
      { type: "status", status: "aborted" },
    ]);
  });

  it("destroy removes listeners", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.destroy();
    engine.submit("hello");

    expect(events).toEqual([]);
  });

  it("submitting after destroy does not emit", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.destroy();
    engine.submit("hello");

    expect(events).toHaveLength(0);
  });

  it("repeated submissions emit exactly once each", () => {
    const engine = new TypedInputEngine();
    const events = collectEvents(engine);

    engine.submit("one");
    engine.submit("two");
    engine.submit("three");

    const transcripts = events.filter((event) => event.type === "transcript");
    expect(transcripts).toHaveLength(3);
    expect(transcripts.map((event) => event.type === "transcript" ? event.transcript.text : "")).toEqual(["one", "two", "three"]);
  });

  it("registry creates a real TypedInputEngine", () => {
    const typedEntry = getSpeechEngineRegistry().find((engine) => engine.kind === "typed-input");

    expect(typedEntry?.available).toBe(true);
    expect(typedEntry?.create()).toBeInstanceOf(TypedInputEngine);
  });
});
