export type XaiVoiceDiagnosticEvent =
  | { type: "feature_flag"; enabled: boolean; route?: string }
  | { type: "orb_mounted"; route: string }
  | { type: "token_request_started" }
  | { type: "token_request_finished"; durationMs: number; status: number; ok: boolean }
  | { type: "token_request_failed"; durationMs?: number; category: string }
  | { type: "websocket_connecting"; url: string }
  | { type: "websocket_open" }
  | { type: "websocket_close"; code: number; category: string }
  | { type: "session_created" }
  | { type: "session_updated" }
  | { type: "conversation_created" }
  | { type: "reconnect_attempt"; attempt: number }
  | { type: "microphone_started"; inputSampleRate: number; outputSampleRate: number; chunkSize: number; settings?: MediaTrackSettings }
  | { type: "microphone_first_chunk"; elapsedMs: number }
  | { type: "microphone_chunk_sent"; chunksSent: number; bufferedAmount: number; chunkSize: number }
  | { type: "speech_started"; elapsedMs: number }
  | { type: "speech_stopped"; elapsedMs: number }
  | { type: "response_created"; responseId?: string }
  | { type: "audio_delta"; responseId?: string; chunksReceived: number; samplesReceived: number; estimatedDurationMs: number; firstDeltaMs?: number }
  | { type: "audio_scheduled"; chunksScheduled: number; estimatedPlayedMs: number; queueLength: number }
  | { type: "response_done"; responseId?: string; elapsedMs: number }
  | { type: "playback_drained"; elapsedMs: number; reason: string }
  | { type: "cleanup_complete"; reason: string }
  | { type: "tool_finished"; toolName: string; durationMs: number; success: boolean; routeGeneration: number; resultSize: number }
  | { type: "tool_failed"; toolName: string; durationMs: number; category: string; routeGeneration: number };

export function logXaiVoiceDiagnostic(event: XaiVoiceDiagnosticEvent) {
  if (!import.meta.env.DEV) return;
  console.info("[xai-voice]", event);
}

export function categorizeClose(code: number): string {
  if (code === 1000) return "normal";
  if (code === 1006) return "abnormal";
  if (code >= 4000) return "provider";
  return "transport";
}
