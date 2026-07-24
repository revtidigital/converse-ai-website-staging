class AssistantAudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length > 0) {
      this.port.postMessage(input.map((channel) => channel.slice()));
    }
    return true;
  }
}
registerProcessor('assistant-audio-processor', AssistantAudioProcessor);
