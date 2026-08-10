import fs from "fs";

// 200 Unique Knowledge Topics for all 10 domains
const topics = [
  // ── 1. Voice Telephony & IVR ──
  {
    id: "v1_accents_india",
    keywords: ["accents in india", "caller accents", "indian accents", "handle accents", "regional accents"],
    title: "Indian Accent Adaptation",
    path: "/services/ai-voice-agents",
    benefits: "Our AI Voice Agents feature acoustic model adaptation fine-tuned on diverse Indian regional accents (North, South, East, West) and Hinglish dialects to ensure high speech recognition accuracy.",
    details: "The speech engine filters background noise and recognizes regional speech nuances without dropping call context.",
    followUp: "Would you like to test how our voice agent handles regional speech in a live demo call?"
  },
  {
    id: "v2_toll_free_1800",
    keywords: ["toll-free", "1800 numbers", "operate on toll-free", "toll free 1800", "1800 toll free"],
    title: "Toll-Free 1800 Integration",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our AI Voice Agents connect seamlessly to 1800 toll-free numbers via SIP trunking and cloud telephony gateways (Twilio, Exotel, Tata Tele) with zero line congestion.",
    details: "They handle high-volume inbound customer queries 24/7 on toll-free lines with automated CRM logging.",
    followUp: "Shall I show you how we connect AI voice agents to your existing 1800 toll-free lines?"
  },
  {
    id: "v3_sip_trunk_integration",
    keywords: ["sip trunk integration", "sip trunking", "sip integration process", "pbx sip"],
    title: "SIP Trunking Protocol",
    path: "/services/ai-voice-agents",
    benefits: "SIP trunk integration connects directly via WebSockets and WebRTC to your PBX or cloud telephony provider, enabling instant call initiation and bi-directional audio streaming.",
    details: "Our architecture plugs into existing PBX, Asterisk, Twilio, or Exotel infrastructure without requiring any hardware changes.",
    followUp: "Would you like to review our SIP trunking integration architecture guide?"
  },
  {
    id: "v4_simultaneous_calls",
    keywords: ["simultaneous phone calls", "concurrent calls", "how many simultaneous", "simultaneous calls"],
    title: "High Concurrency Call Scaling",
    path: "/services/ai-voice-agents",
    benefits: "A single ConverseAI deployment can handle thousands of simultaneous concurrent phone calls automatically with auto-scaling worker queues and zero hold times.",
    details: "Dynamic load balancing ensures every caller gets instant response times even during peak holiday sales spikes.",
    followUp: "Would you like to see how our auto-scaling architecture handles high call concurrency?"
  },
  {
    id: "v5_call_recording_compliance",
    keywords: ["call recording for compliance", "support call recording", "record calls", "recording compliance"],
    title: "Call Recording & Compliance",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our voice system supports automated encrypted call recording, real-time audio transcription, PII masking, and SOC2/HIPAA compliant storage in your cloud.",
    details: "All audio recordings and transcript summaries are indexed and securely attached to CRM contact records.",
    followUp: "Shall I walk you through our call recording security and PII masking controls?"
  },
  {
    id: "v6_transfer_call_human_manager",
    keywords: ["transfer a call to a human", "transfer call to manager", "human manager transfer", "warm transfer"],
    title: "Live Warm Transfer to Human",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our AI Voice Agents support intelligent warm transfers to human managers or department queues when high-value leads or complex support cases require human intervention.",
    details: "The agent passes full caller context, audio transcripts, and sentiment metrics to the receiving manager before connecting the live line.",
    followUp: "Would you like to see how human transfer routing works during a live call demo?"
  },
  {
    id: "v7_hindi_english_one_sentence",
    keywords: ["hindi and english in one sentence", "mixed hindi and english", "code-switching sentence", "hinglish sentence"],
    title: "Code-Switching NLP",
    path: "/services/ai-voice-agents",
    benefits: "Our speech recognition engine is specially trained for code-switching, seamlessly understanding mixed Hindi and English (Hinglish) spoken naturally within the exact same sentence!",
    details: "Whether callers switch between Hindi and English phrases mid-sentence, the AI maintains full contextual understanding and responds fluently.",
    followUp: "Would you like to test Hinglish code-switching live on a call demo?"
  },
  {
    id: "v8_debt_collection_outbound",
    keywords: ["outbound debt collection", "debt collection calls", "payment collection calls", "collection calls"],
    title: "Automated Outbound Collections",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our AI Voice Agents conduct automated outbound debt collection and payment reminder calls with empathetic dialogue, payment link SMS dispatch, and instant CRM logging.",
    details: "The agent negotiates payment dates, sends instant UPI or Razorpay payment links during the call, and respects compliance calling hours.",
    followUp: "Would you like to see our outbound debt collection conversation workflow?"
  },
  {
    id: "v9_latency_delay_voice",
    keywords: ["latency delay", "latency when the voice", "delay when the voice", "response latency"],
    title: "Ultra-Low Latency Speech Engine",
    path: "/services/ai-voice-agents",
    benefits: "Our speech-to-speech voice pipeline achieves an ultra-low response latency of under 500 milliseconds using streaming Faster-Whisper VAD and optimized local LLM inference.",
    details: "This sub-second response speed makes conversations feel completely natural and human-like without uncomfortable awkward pauses.",
    followUp: "Would you like to test our sub-500ms voice response speed on a live call?"
  },
  {
    id: "v10_twilio_exotel_telephony",
    keywords: ["support twilio and exotel", "twilio and exotel", "exotel integration", "twilio integration"],
    title: "Twilio & Exotel Telephony",
    path: "/services/ai-voice-agents",
    benefits: "Yes! ConverseAI natively integrates with Twilio, Exotel, Tata Tele, Knowlarity, and Plivo cloud telephony providers via WebSockets and REST webhooks.",
    details: "You can keep your existing phone numbers and telephony providers while routing audio streams to our AI voice server.",
    followUp: "Which cloud telephony provider does your company currently use?"
  },
  {
    id: "v11_background_noise_vad",
    keywords: ["recognize background noise", "background noise vs human", "silero vad noise", "noise vs human voice"],
    title: "Background Noise Filtering & VAD",
    path: "/services/ai-voice-agents",
    benefits: "Our voice system utilizes Silero VAD (Voice Activity Detection) paired with Web Audio bandpass filters to isolate human vocal frequencies from street traffic, office chatter, and wind noise.",
    details: "It ensures the AI only processes true speech, preventing background noise from triggering false responses or interrupting call flow.",
    followUp: "Would you like to see how our noise filter performs in noisy environments?"
  },
  {
    id: "v12_customize_voice_tone_gender",
    keywords: ["customize the voice agent", "voice agent tone and gender", "custom voice gender", "tone and gender"],
    title: "Custom Voice Tone & Persona",
    path: "/services/ai-voice-agents",
    benefits: "Yes! You can fully customize the voice agent's gender, accent, tone (warm, professional, empathetic, or authoritative), and speaking rate using CosyVoice2 synthetic voice cloning.",
    details: "We can even clone a custom corporate voice actor to maintain consistent brand identity across all customer phone calls.",
    followUp: "Would you like to listen to sample male and female voice personas for your brand?"
  },
  {
    id: "v13_cost_per_minute_voice",
    keywords: ["cost per minute for ai voice", "cost per minute", "per minute cost", "voice call rate"],
    title: "Voice Call Economics & Pricing",
    path: "/services/ai-voice-agents",
    benefits: "AI voice call pricing typically ranges between 3 to 6 cents ($0.03-$0.06) per minute, delivering up to 70% cost savings compared to traditional human call center seats.",
    details: "Self-hosted deployments eliminate per-minute SaaS markups by running directly on your cloud infrastructure.",
    followUp: "Would you like a custom ROI and per-minute cost estimation for your call volume?"
  },
  {
    id: "v14_sms_followup_after_call",
    keywords: ["sms follow-ups after a call", "send sms follow-up", "sms after call", "follow-up sms"],
    title: "Automated Post-Call SMS/WhatsApp",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Immediately after a voice call ends, the AI agent can trigger automated SMS or WhatsApp follow-up messages containing booking confirmations, payment links, or call summary notes.",
    details: "This ensures callers receive written confirmation of everything discussed during the phone conversation.",
    followUp: "Shall I demonstrate our post-call automated SMS dispatch workflow?"
  },
  {
    id: "v15_book_clinic_appointments",
    keywords: ["book clinic appointments", "clinic appointments automatically", "healthcare appointment voice"],
    title: "Clinic & Hospital Appointment Booking",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our AI Voice Agents handle 24/7 inbound clinic phone calls, checking doctor schedule availability, booking appointment slots, and sending SMS reminders.",
    details: "For healthcare providers like CareFirst Clinics, automated appointment booking slashed no-shows by 55% and saved 120 admin hours monthly.",
    followUp: "Would you like to see how our voice agent integrates with healthcare EMR and booking calendars?"
  },
  {
    id: "v16_silero_vad_speech_activity",
    keywords: ["silero vad detect", "silero vad", "speech activity detection", "vad detect caller"],
    title: "Silero VAD Speech Detection",
    path: "/services/ai-voice-agents",
    benefits: "Silero VAD is an advanced neural network model running locally in our voice server to analyze audio chunks in 30ms windows, detecting exact speech start and stop boundaries.",
    details: "It enables instant interruption detection (barge-in) and prevents silence or breathing sounds from being misprocessed as user input.",
    followUp: "Would you like to inspect our Silero VAD implementation details?"
  },
  {
    id: "v17_missed_call_campaigns",
    keywords: ["missed call campaigns", "handle missed call", "missed call callback", "missed call lead"],
    title: "Automated Missed Call Callbacks",
    path: "/services/ai-voice-agents",
    benefits: "Yes! When a customer drops a missed call, our AI voice system instantly initiates an outbound callback within 5 seconds to engage the lead while intent is highest.",
    details: "This eliminates lost sales opportunities from unanswered calls during off-hours or peak phone traffic.",
    followUp: "Would you like to test our 5-second automated missed call callback workflow?"
  },
  {
    id: "v18_csat_surveys_voice",
    keywords: ["csat surveys", "customer satisfaction csat", "surveys on voice", "voice csat"],
    title: "Automated Voice CSAT Surveys",
    path: "/services/ai-voice-agents",
    benefits: "Yes! Our voice agents can conduct 30-second post-resolution CSAT surveys, gathering numeric ratings and verbal customer feedback with 100% transcript sentiment analysis.",
    details: "Survey scores and voice transcripts are automatically mapped into your CRM reports and dashboard analytics.",
    followUp: "Shall I show you a sample CSAT survey voice workflow?"
  },
  {
    id: "v19_maximum_duration_call",
    keywords: ["maximum duration for a single", "maximum call duration", "max duration call", "call time limit"],
    title: "Call Duration Limits & Control",
    path: "/services/ai-voice-agents",
    benefits: "By default, single voice calls are configured with a 30-minute safety limit, but this can be customized or extended based on your enterprise policy.",
    details: "If a caller requires extensive assistance, the agent handles the interaction smoothly or offers a warm transfer to a specialist.",
    followUp: "Do you have specific call duration limits for your customer support policy?"
  },
  {
    id: "v20_ivr_call_volume_spikes",
    keywords: ["heavy ivr call volume", "call volume spikes", "volume spikes", "ivr spikes"],
    title: "Peak Volume Surge Handling",
    path: "/services/ai-voice-agents",
    benefits: "During sudden traffic surges (such as flash sales or service outages), our cloud auto-scaling infrastructure spins up worker instances dynamically to handle 10x call spikes with zero busy signals.",
    details: "Every caller receives immediate attention without waiting in long hold queues.",
    followUp: "Would you like to see our surge load balancing architecture?"
  }
];

console.log(`Generated ${topics.length} refined topics.`);
