/**
 * PCM Audio Worklet Processor
 * Replaces the deprecated ScriptProcessorNode for low-latency,
 * off-main-thread microphone audio capture and PCM streaming.
 *
 * File location: /public/pcm-processor.js
 * Loaded via: audioContext.audioWorklet.addModule('/pcm-processor.js')
 *
 * Audio format output: 16-bit signed integer PCM (Int16Array as ArrayBuffer)
 * Compatible with: voice_server STT pipeline (Faster-Whisper, 16kHz mono)
 */

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Buffer to accumulate samples before sending (matches old ScriptProcessor 4096-frame behavior)
    this._buffer = [];
    this._bufferSize = 4096;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const float32 = input[0]; // Float32Array of audio samples [-1.0, 1.0]

    // Accumulate samples into buffer
    for (let i = 0; i < float32.length; i++) {
      this._buffer.push(float32[i]);
    }

    // When buffer is full, convert to Int16 and send to main thread
    while (this._buffer.length >= this._bufferSize) {
      const chunk = this._buffer.splice(0, this._bufferSize);
      const int16 = new Int16Array(this._bufferSize);
      for (let i = 0; i < this._bufferSize; i++) {
        // Clamp and convert Float32 [-1, 1] → Int16 [-32768, 32767]
        const clamped = Math.max(-1.0, Math.min(1.0, chunk[i]));
        int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
      }
      // Transfer ownership of the buffer (zero-copy)
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }

    return true; // Keep processor alive
  }
}

registerProcessor("pcm-processor", PCMProcessor);
