import { XAI_INPUT_SAMPLE_RATE, XAI_OUTPUT_SAMPLE_RATE, type XaiRealtimeSessionConfig } from "./types";
import type { XaiToolDefinition } from "./tools/types";

export const XAI_WEBSITE_KEY_TERMS = [
  "ConverseAI",
  "Converse AI",
  "AI Strategy Audit",
  "Agentic Automation",
  "AI Integration",
  "AI Voice Agents",
  "Custom AI Agents",
  "Knowledge Intelligence",
  "Sales AI",
  "Live Chat",
  "WhatsApp AI Chatbot",
  "WhatsApp Shop",
  "WhatsApp Marketing",
  "Omni-channel",
  "Tidio",
  "Intercom",
  "Zendesk",
  "HubSpot",
  "Supabase",
  "Vercel",
];

export const XAI_WEBSITE_OPERATING_INSTRUCTIONS = [
  "You are the ConverseAI website voice assistant. Keep the deployed voice agent's base persona and voice style, but follow these website operating rules.",
  "Answer naturally and grammatically. Give a direct answer first, then explain important details clearly.",
  "Do not read raw DOM content verbatim. Summarize visible website content in plain conversational language.",
  "Do not invent website facts. For current-page factual questions, call get_current_page_context before answering. When the answer may be on another website page, call search_site_knowledge. Mention when information cannot be found.",
  "Use navigate_to_page only when the user explicitly asks to open, go to, or navigate to a page. Do not navigate merely because the user asks an informational question.",
  "Do not read raw tool JSON aloud. Summarize tool results naturally and conversationally.",
  "Ask a concise clarification question when a request is ambiguous.",
  "Maintain conversational references such as tell me more, what about the second one, compare those, take me there, contact them, and continue from where you stopped.",
  "Never claim that a contact form submission or scheduling request succeeded unless a confirmed website tool result says it succeeded.",
  `Important website terms to recognize: ${XAI_WEBSITE_KEY_TERMS.join(", ")}.`,
].join("\n");

export function createXaiRealtimeSessionConfig(language = "en", tools: XaiToolDefinition[] = []): XaiRealtimeSessionConfig {
  return {
    resumption: { enabled: true },
    instructions: XAI_WEBSITE_OPERATING_INSTRUCTIONS,
    ...(tools.length ? { tools, tool_choice: "auto" as const } : {}),
    audio: {
      input: {
        format: { type: "audio/pcm", rate: XAI_INPUT_SAMPLE_RATE },
        transcription: {
          model: "grok-transcribe",
          language,
          prompt: `Prefer these website and product terms when transcribing: ${XAI_WEBSITE_KEY_TERMS.join(", ")}.`,
        },
        turn_detection: {
          type: "server_vad",
          prefix_padding_ms: 300,
          silence_duration_ms: 550,
          idle_timeout_ms: 45_000,
        },
      },
      output: {
        format: { type: "audio/pcm", rate: XAI_OUTPUT_SAMPLE_RATE },
      },
    },
  };
}
