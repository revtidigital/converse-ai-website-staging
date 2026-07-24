import { z } from "zod";

export const audioFormatSchema = z.object({
  encoding: z.literal("pcm_s16le"),
  sampleRate: z.literal(16000),
  channels: z.literal(1)
});

export const audioStartSchema = z.object({
  type: z.literal("audio.start"),
  requestId: z.string().min(1).max(80),
  format: audioFormatSchema,
  routeContext: z.unknown().optional()
});
export const audioEndSchema = z.object({ type: z.literal("audio.end"), requestId: z.string().min(1).max(80) });
export const audioCancelSchema = z.object({ type: z.literal("audio.cancel"), requestId: z.string().min(1).max(80) });

export type AudioFormat = z.infer<typeof audioFormatSchema>;
export type AudioStartEvent = z.infer<typeof audioStartSchema>;
export type AudioEndEvent = z.infer<typeof audioEndSchema>;
export type AudioCancelEvent = z.infer<typeof audioCancelSchema>;

export type PythonVoiceEvent =
  | { type: "audio.accepted"; requestId: string }
  | { type: "transcription.started"; requestId: string }
  | { type: "transcript.partial"; requestId: string; text: string; stable: boolean }
  | { type: "transcript.final"; requestId: string; text: string; language?: string }
  | { type: "transcription.completed"; requestId: string }
  | { type: "transcription.cancelled"; requestId: string }
  | { type: "response.started"; requestId: string }
  | { type: "response.delta"; requestId: string; text: string }
  | { type: "response.completed"; requestId: string; sources?: unknown[] }
  | { type: "response.error"; requestId?: string; code: string; message: string };
