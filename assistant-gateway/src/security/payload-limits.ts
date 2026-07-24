export function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

export function assertPayloadLimit(value: string, maxBytes: number): void {
  if (byteLength(value) > maxBytes) {
    throw new Error("payload_too_large");
  }
}
