export function resampleLinear(input: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (inputRate === outputRate) return input;
  if (!input.length) return new Float32Array();
  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const before = Math.floor(srcIndex);
    const after = Math.min(input.length - 1, before + 1);
    const weight = srcIndex - before;
    output[i] = input[before] * (1 - weight) + input[after] * weight;
  }
  return output;
}

export function rms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  return Math.sqrt(sum / samples.length);
}

export function floatToPcm16(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  });
  return buffer;
}

export function pcm16ToFloat32(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const output = new Float32Array(buffer.byteLength / 2);
  for (let i = 0; i < output.length; i++) output[i] = view.getInt16(i * 2, true) / 0x8000;
  return output;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function floatToBase64Pcm16(samples: Float32Array, inputRate: number, outputRate: number): string {
  return arrayBufferToBase64(floatToPcm16(resampleLinear(samples, inputRate, outputRate)));
}
