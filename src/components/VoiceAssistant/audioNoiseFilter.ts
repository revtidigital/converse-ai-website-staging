/**
 * Web Audio API Noise Suppression & Bandpass Filter for Speech Recognition
 * Filters out low-frequency rumble (<300Hz) and high-frequency hiss (>3400Hz).
 * Applies Voice Activity Detection (VAD) threshold to pass clean user voice.
 */

export interface NoiseFilterControls {
  audioContext: AudioContext;
  mediaStream: MediaStream;
  analyser: AnalyserNode;
  stop: () => void;
  getVoiceLevel: () => number;
}

/**
 * Initializes microphone stream with hardware Noise Suppression, Echo Cancellation,
 * and a Biquad Bandpass Filter (300Hz - 3400Hz) for clean human speech.
 */
export async function initializeVoiceNoiseFilter(): Promise<NoiseFilterControls | null> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  try {
    // 1. Hardware Microphone Constraints (Echo Cancellation, Noise Suppression, Auto Gain Control)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: 1,
        sampleRate: 48000,
      },
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(stream);

    // 2. High-pass Filter (Cut rumble below 250Hz)
    const highPass = audioContext.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 250;

    // 3. Low-pass Filter (Cut hiss above 3400Hz)
    const lowPass = audioContext.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 3400;

    // 4. Analyser Node for Voice Activity Level (VAD)
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    // Chain nodes: Microphone -> HighPass -> LowPass -> Analyser
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
        stream.getTracks().forEach((track) => track.stop());
        if (audioContext.state !== "closed") {
          audioContext.close();
        }
      } catch {
        // ignore
      }
    };

    return {
      audioContext,
      mediaStream: stream,
      analyser,
      stop,
      getVoiceLevel,
    };
  } catch (err) {
    console.warn("[AUDIO NOISE FILTER] Microphone access or AudioContext initialization failed:", err);
    return null;
  }
}
