export function resampleLinear(input: Float32Array, inputSampleRate: number, outputSampleRate = 16000): Float32Array {
  if (input.length === 0) throw new Error("empty_audio_frame");
  if (inputSampleRate <= 0 || outputSampleRate <= 0) throw new Error("invalid_sample_rate");
  if (inputSampleRate === outputSampleRate) return input;
  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.max(1, Math.floor(input.length / ratio));
  const output = new Float32Array(outputLength);
  for (let index = 0; index < outputLength; index += 1) {
    const sourceIndex = index * ratio;
    const left = Math.floor(sourceIndex);
    const right = Math.min(input.length - 1, left + 1);
    const fraction = sourceIndex - left;
    output[index] = (input[left] ?? 0) * (1 - fraction) + (input[right] ?? 0) * fraction;
  }
  return output;
}
