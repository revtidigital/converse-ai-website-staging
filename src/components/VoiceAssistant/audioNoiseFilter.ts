/**
 * Web Audio API Voice Level Meter
 *
 * FIXED (Bug #6): Previously opened a separate microphone stream which was
 * NOT connected to the Web SpeechRecognition API — making the noise filter
 * completely ineffective. Now accepts the already-open MediaStream from the
 * caller, eliminating the double-stream problem and wasted microphone resource.
 *
 * What this module does NOW:
 *   - Takes the EXISTING mic stream (opened by the caller for SpeechRecognition)
 *   - Applies a Biquad Bandpass filter (250Hz – 3400Hz) for analysis purposes
 *   - Provides a live voice level meter (0.0 – 1.0) for UI animations
 *   - Does NOT open a new MediaStream
 *
 * Note: Hardware noise suppression / echo cancellation is already applied when
 * the MediaStream is captured via getUserMedia constraints (echoCancellation: true,
 * noiseSuppression: true), so software filtering is supplementary.
 */

export interface NoiseFilterControls {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  stop: () => void;
  getVoiceLevel: () => number;
}

/**
 * Attaches a voice level analyser to an existing MediaStream.
 * Does NOT open a new microphone stream — uses the one provided by the caller.
 *
 * @param stream - An already-open MediaStream from getUserMedia (e.g. from SpeechRecognition setup)
 * @returns NoiseFilterControls with a getVoiceLevel() function for UI animations, or null on failure.
 */
export async function initializeVoiceNoiseFilter(
  stream?: MediaStream
): Promise<NoiseFilterControls | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let micStream: MediaStream;

    if (stream) {
      // Use the provided existing stream — no new getUserMedia call needed
      micStream = stream;
    } else {
      // Fallback: request a minimal stream for voice level UI only
      // (only used if called without an existing stream, e.g. for standalone use)
      if (!navigator.mediaDevices?.getUserMedia) return null;
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: 1,
          sampleRate: 48000,
        },
      });
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(micStream);

    // High-pass Filter — cut low-frequency rumble below 250Hz
    const highPass = audioContext.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 250;

    // Low-pass Filter — cut high-frequency hiss above 3400Hz
    const lowPass = audioContext.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 3400;

    // Analyser Node — for voice level metering (UI waveform / pulse animations)
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    // Chain: Mic source → HighPass → LowPass → Analyser (for level metering only)
    // NOTE: We deliberately do NOT connect to audioContext.destination —
    // this is a monitoring chain only, not meant to re-route audio.
    source.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const getVoiceLevel = (): number => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      return sum / (bufferLength * 255); // Returns 0.0 to 1.0
    };

    const stop = () => {
      try {
        source.disconnect();
        highPass.disconnect();
        lowPass.disconnect();
        analyser.disconnect();
        if (audioContext.state !== "closed") {
          audioContext.close();
        }
        // NOTE: Do NOT stop micStream tracks here — the caller owns the stream
        // and is responsible for stopping it (via stopListening()).
        // Only stop tracks if we opened the stream ourselves (no stream passed in).
        if (!stream) {
          micStream.getTracks().forEach((track) => track.stop());
        }
      } catch {
        // ignore cleanup errors
      }
    };

    return {
      audioContext,
      analyser,
      stop,
      getVoiceLevel,
    };
  } catch (err) {
    console.warn("[VOICE LEVEL METER] AudioContext initialization failed:", err);
    return null;
  }
}
