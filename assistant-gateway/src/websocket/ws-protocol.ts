import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Socket } from "node:net";

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

export function acceptWebSocket(request: IncomingMessage, socket: Socket): boolean {
  const key = request.headers["sec-websocket-key"];
  if (typeof key !== "string") return false;
  const accept = createHash("sha1").update(key + GUID).digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n"));
  return true;
}

export function writeUpgradeRejection(socket: Socket, statusCode: number, reason: string): void {
  socket.write(`HTTP/1.1 ${statusCode} ${reason}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

export function sendTextFrame(socket: Socket, text: string): void {
  const payload = Buffer.from(text, "utf8");
  const header: number[] = [0x81];
  if (payload.length < 126) header.push(payload.length);
  else if (payload.length < 65536) header.push(126, payload.length >> 8, payload.length & 0xff);
  else header.push(127, 0, 0, 0, 0, (payload.length / 2 ** 24) & 0xff, (payload.length / 2 ** 16) & 0xff, (payload.length / 2 ** 8) & 0xff, payload.length & 0xff);
  socket.write(Buffer.concat([Buffer.from(header), payload]));
}

export function closeSocket(socket: Socket, code = 1000, reason = "normal"): void {
  const reasonBuffer = Buffer.from(reason, "utf8");
  const payload = Buffer.alloc(2 + reasonBuffer.length);
  payload.writeUInt16BE(code, 0);
  reasonBuffer.copy(payload, 2);
  socket.write(Buffer.concat([Buffer.from([0x88, payload.length]), payload]));
  socket.end();
}

export function decodeTextFrames(chunk: Buffer): string[] {
  const messages: string[] = [];
  let offset = 0;
  while (offset + 2 <= chunk.length) {
    const first = chunk[offset++];
    const second = chunk[offset++];
    if (first === undefined || second === undefined) break;
    const opcode = first & 0x0f;
    let length = second & 0x7f;
    if (length === 126) {
      if (offset + 2 > chunk.length) break;
      length = chunk.readUInt16BE(offset); offset += 2;
    } else if (length === 127) {
      if (offset + 8 > chunk.length) break;
      const high = chunk.readUInt32BE(offset); const low = chunk.readUInt32BE(offset + 4); offset += 8;
      length = high * 2 ** 32 + low;
    }
    const masked = (second & 0x80) !== 0;
    const mask = masked ? chunk.subarray(offset, offset + 4) : Buffer.alloc(0);
    if (masked) offset += 4;
    if (offset + length > chunk.length) break;
    const payload = Buffer.from(chunk.subarray(offset, offset + length));
    offset += length;
    if (masked) for (let index = 0; index < payload.length; index += 1) payload[index] = payload[index]! ^ mask[index % 4]!;
    if (opcode === 0x1) messages.push(payload.toString("utf8"));
  }
  return messages;
}
