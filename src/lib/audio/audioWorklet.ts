export async function loadAssistantAudioWorklet(audioContext: AudioContext, processorUrl = "/assistant-audio-processor.js"): Promise<AudioWorkletNode> {
  await audioContext.audioWorklet.addModule(processorUrl);
  return new AudioWorkletNode(audioContext, "assistant-audio-processor", { numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1 });
}
