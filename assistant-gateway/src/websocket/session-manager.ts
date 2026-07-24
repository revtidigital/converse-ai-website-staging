import { randomUUID } from "node:crypto";
import type { Socket } from "node:net";
import type { GatewayEvent } from "../contracts/python-events.js";
import type { SafeRouteContext } from "../contracts/client-events.js";
import { PythonVoiceClient } from "../clients/python-voice-client.js";
import { AudioSessionState } from "./audio-session.js";
import { closeSocket, sendTextFrame } from "./ws-protocol.js";

export class SessionState {
  readonly sessionId = randomUUID();
  inputMode: "text" | "voice" = "text";
  activeRequestId: string | null = null;
  abortController: AbortController | null = null;
  readonly audio = new AudioSessionState();
  voiceClient: PythonVoiceClient | null = null;
  audioRouteContext: SafeRouteContext | undefined;
  lastSeen = Date.now();

  constructor(readonly socket: Socket) {}

  send(event: GatewayEvent): void {
    sendTextFrame(this.socket, JSON.stringify(event));
  }

  close(code?: number, reason?: string): void {
    closeSocket(this.socket, code, reason);
  }

  startRequest(requestId: string): AbortController {
    if (this.activeRequestId) throw new Error("duplicate_active_request");
    this.activeRequestId = requestId;
    this.abortController = new AbortController();
    return this.abortController;
  }

  finishRequest(requestId: string): void {
    if (this.activeRequestId === requestId) {
      this.activeRequestId = null;
      this.abortController = null;
    }
  }

  attachVoiceClient(client: PythonVoiceClient): void {
    this.voiceClient?.close();
    this.voiceClient = client;
  }

  cleanupAudio(): void {
    this.voiceClient?.close();
    this.voiceClient = null;
    this.audioRouteContext = undefined;
    this.audio.clear();
  }

  cancel(requestId: string): boolean {
    if (this.activeRequestId !== requestId || !this.abortController) return false;
    this.abortController.abort();
    this.voiceClient?.cancel(requestId);
    this.finishRequest(requestId);
    return true;
  }
}
