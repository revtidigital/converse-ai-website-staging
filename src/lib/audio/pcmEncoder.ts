export function encodePcmS16Le(samples: Float32Array): ArrayBuffer {
  if (samples.length === 0) throw new Error("empty_audio_frame");
  const output = new ArrayBuffer(samples.length * 2);
  const view = new DataView(output);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return output;
}

export function mixToMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) throw new Error("no_channels");
  if (channels.length === 1) return channels[0] ?? new Float32Array();
  const length = Math.min(...channels.map((channel) => channel.length));
  const mono = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    mono[index] = channels.reduce((sum, channel) => sum + (channel[index] ?? 0), 0) / channels.length;
  }
  return mono;
}
