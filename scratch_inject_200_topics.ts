import fs from "fs";

const all200Topics = [
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
    keywords: ["transfer a call to a human", "transfer call to manager", "human manager transfer", "transfer a call"],
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
    keywords: ["twilio and exotel", "exotel integration", "twilio integration", "telephony system support"],
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
  },

  // ── 2. WhatsApp Automation & Commerce ──
  {
    id: "w1_automated_payment_links",
    keywords: ["automated payment links", "payment links to customers", "send payment links"],
    title: "WhatsApp Payment Link Integration",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! ConverseAI WhatsApp bots integrate with Razorpay, Stripe, and UPI gateways to send one-click automated payment links directly inside WhatsApp chat windows.",
    details: "Customers can complete transactions instantly without leaving the messaging application.",
    followUp: "Shall I demonstrate a live WhatsApp payment link checkout flow?"
  },
  {
    id: "w2_open_rate_broadcast",
    keywords: ["open rate for whatsapp broadcast", "open rate for whatsapp", "broadcast open rate"],
    title: "WhatsApp Broadcast Open Rates",
    path: "/whatsapp-marketing",
    benefits: "WhatsApp broadcast marketing campaigns consistently achieve 90%+ open rates and 35%+ click-through rates, vastly outperforming email marketing.",
    details: "High engagement leads to faster conversions and direct customer dialogues for promotional offers and product launches.",
    followUp: "Would you like to see our WhatsApp broadcast analytics performance dashboard?"
  },
  {
    id: "w3_click_to_whatsapp_ads",
    keywords: ["click-to-whatsapp facebook ads", "click to whatsapp", "facebook ads capture"],
    title: "Click-to-WhatsApp Ad Conversions",
    path: "/whatsapp-marketing",
    benefits: "Click-to-WhatsApp Meta & Instagram ads direct ad clickers straight into a live WhatsApp chat conversation with our AI lead qualification bot.",
    details: "This eliminates high website bounce rates and captures verified customer phone numbers instantly upon first interaction.",
    followUp: "Shall I explain how to configure click-to-WhatsApp ad funnels for your products?"
  },
  {
    id: "w4_checkout_inside_whatsapp",
    keywords: ["checkout directly inside whatsapp", "complete checkout directly", "whatsapp checkout"],
    title: "Native WhatsApp In-Chat Checkout",
    path: "/whatsapp-shop",
    benefits: "Yes! Customers can browse multi-product catalogs, select items, enter delivery addresses, and complete checkout without ever opening an external browser window.",
    details: "Native WhatsApp Flows create a frictionless e-commerce shopping experience directly inside the chat.",
    followUp: "Would you like to see a demo of our native WhatsApp checkout flow?"
  },
  {
    id: "w5_shopify_store_catalogs",
    keywords: ["shopify store catalogs", "integrate with shopify", "shopify catalog"],
    title: "Shopify & ERP Catalog Sync",
    path: "/whatsapp-shop",
    benefits: "ConverseAI features native real-time synchronization with Shopify, WooCommerce, Magento, and custom ERP product catalogs.",
    details: "Item availability, pricing updates, image galleries, and inventory levels are updated automatically across chat conversations.",
    followUp: "Which e-commerce platform powers your online store?"
  },
  {
    id: "w6_abandoned_cart_recovery",
    keywords: ["abandoned cart recovery work", "abandoned cart recovery", "cart recovery"],
    title: "WhatsApp Abandoned Cart Recovery",
    path: "/case-studies/retail-brand-whatsapp-automation",
    benefits: "Our automated WhatsApp abandoned cart bot triggers personalized reminder messages 15 minutes after cart abandonment with dynamic discount codes.",
    details: "For clients like StyleMart India, this recovered lost cart sales with a 38% conversion rate and 3x repeat revenue.",
    followUp: "Would you like to calculate how much abandoned cart revenue you could recover?"
  },
  {
    id: "w7_multi_product_list_messages",
    keywords: ["multi-product list messages", "multi product list", "product list messages"],
    title: "Multi-Product Catalog Lists",
    path: "/whatsapp-shop",
    benefits: "Yes! WhatsApp bots can send interactive Multi-Product List messages displaying up to 30 catalog items organized by categories with thumbnail images and prices.",
    details: "Customers can add items to a shopping cart with single-tap button clicks.",
    followUp: "Shall I send a sample Multi-Product list preview to your screen?"
  },
  {
    id: "w8_official_whatsapp_api_approval",
    keywords: ["official whatsapp business api approval", "whatsapp api approval", "green tick approval"],
    title: "Official Meta WhatsApp API Setup",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! Our team manages 100% of the Meta Cloud API onboarding, phone number verification, and Green Tick official badge application process for your brand.",
    details: "We ensure full compliance with Meta Commerce policies to secure official API access quickly.",
    followUp: "Do you already have an active Facebook Business Manager account for Meta approval?"
  },
  {
    id: "w9_broadcast_messages_limit",
    keywords: ["how many broadcast messages", "broadcast messages per day", "broadcast limit"],
    title: "WhatsApp Broadcast Limits & Tiering",
    path: "/whatsapp-marketing",
    benefits: "Meta provides tiered broadcast messaging limits starting at 1,000 unique users per day, scaling quickly to 10,000, 100,000, and unlimited daily messaging tiers as quality ratings remain high.",
    details: "Our compliance management keeps your account in Tier 1 health to ensure maximum throughput.",
    followUp: "What is your target customer database size for promotional broadcasts?"
  },
  {
    id: "w10_customer_return_requests",
    keywords: ["customer return requests", "handle return requests", "whatsapp returns"],
    title: "Automated Returns & Refunds",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! The WhatsApp bot guides customers through self-service return and exchange requests by capturing product photos, validating order IDs, and generating reverse pickup shipping labels automatically.",
    details: "This automates 80% of routine return support queries without human agent workload.",
    followUp: "Would you like to review our automated customer return workflow?"
  },
  {
    id: "w11_buttons_quick_replies",
    keywords: ["interactive buttons and quick replies", "buttons and quick replies", "whatsapp buttons"],
    title: "Interactive WhatsApp Buttons",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! Our WhatsApp chatbots use Meta interactive CTA buttons, Quick Reply chips, and dropdown menus to guide customer choices effortlessly without typing.",
    details: "Button-driven flows increase user response speed and prevent spelling errors during lead qualification.",
    followUp: "Would you like to test interactive WhatsApp button flows on a live demo?"
  },
  {
    id: "w12_human_agent_handoff_chat",
    keywords: ["human agent handoff work inside", "human agent handoff", "agent handoff whatsapp"],
    title: "Seamless Human Agent Handoff",
    path: "/whatsapp-ai-chatbot",
    benefits: "When a customer requests human support or asks a complex question, the bot seamlessly transfers the conversation to a shared multi-agent inbox (Zendesk, Freshchat, or ConverseAI Inbox).",
    details: "Human agents view complete conversation history and AI sentiment tags before taking over the chat.",
    followUp: "Which customer support inbox software does your team currently use?"
  },
  {
    id: "w13_pdf_invoices_attachments",
    keywords: ["pdf invoices and receipt", "send pdf invoices", "invoices and receipt attachments"],
    title: "Document & Media Attachments",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! WhatsApp bots can dynamically generate and send PDF tax invoices, warranty cards, receipt documents, audio notes, and video guides directly to customers.",
    details: "Documents are generated on-the-fly from CRM/ERP transaction data and sent instantly upon order completion.",
    followUp: "Would you like to see automated PDF invoice dispatch in action?"
  },
  {
    id: "w14_chat_history_saved_crm",
    keywords: ["customer chat history saved", "chat history saved in our crm", "saved in crm"],
    title: "CRM Conversation Sync",
    path: "/services/ai-integration",
    benefits: "Yes! 100% of WhatsApp conversation history, user preferences, lead scores, and transaction transcripts are synchronized automatically to contact records in Salesforce, HubSpot, or Zoho.",
    details: "Your sales and support representatives have full visibility into every past bot interaction.",
    followUp: "Shall I show you how WhatsApp transcripts map into CRM contact records?"
  },
  {
    id: "w15_automated_order_tracking",
    keywords: ["automated order tracking updates", "order tracking updates", "tracking updates"],
    title: "Proactive Order Tracking Updates",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! Integrated with shipping carriers (Delhivery, Shiprocket, BlueDart, FedEx), the bot automatically sends proactive WhatsApp status updates when orders are shipped, out for delivery, or delivered.",
    details: "Proactive notifications cut 'Where is my order?' support tickets by up to 75%.",
    followUp: "Which shipping or logistics carriers do you use for order delivery?"
  },
  {
    id: "w16_whatsapp_pricing_vs_email",
    keywords: ["whatsapp chatbot pricing compare", "pricing compare to email", "whatsapp vs email cost"],
    title: "WhatsApp vs Email Marketing ROI",
    path: "/whatsapp-marketing",
    benefits: "While email marketing is cheap, it suffers from low 15% open rates. WhatsApp messaging delivers 90%+ open rates and 5x higher revenue conversions, yielding a significantly higher net ROI.",
    details: "Meta charges per-conversation fees (marketing vs utility categories), making targeted high-intent campaigns highly profitable.",
    followUp: "Would you like a cost-benefit calculation comparing your email vs WhatsApp campaigns?"
  },
  {
    id: "w17_qualify_b2b_saas_leads",
    keywords: ["qualify b2b saas leads", "qualify b2b leads", "b2b saas lead qualification"],
    title: "B2B SaaS Lead Qualification",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! WhatsApp bots ask targeted B2B qualification questions (company size, budget, timeline, software stack) to score intent before routing qualified leads to sales AEs.",
    details: "Unqualified leads receive automated resource links, saving sales team bandwidth for high-value prospects.",
    followUp: "What are your team's top 3 lead qualification criteria?"
  },
  {
    id: "w18_multi_language_whatsapp",
    keywords: ["multi-language whatsapp conversations", "multi language whatsapp", "multilingual whatsapp"],
    title: "Multilingual Regional Support",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! Our WhatsApp bot detects customer language preferences automatically (English, Hindi, Tamil, Telugu, Marathi, Gujarati, Spanish, Arabic) and responds in their native language.",
    details: "Language switching happens dynamically without disrupting conversation context or lead flow.",
    followUp: "Which regional languages are most important for your customer base?"
  },
  {
    id: "w19_prevent_spam_blocks_whatsapp",
    keywords: ["prevent spam blocks on whatsapp", "spam blocks", "prevent spam blocks"],
    title: "Meta Anti-Spam Compliance",
    path: "/whatsapp-marketing",
    benefits: "We prevent spam blocks by enforcing strict opt-in consent verification, message frequency capping, template categorization compliance, and automated unsubscribe management.",
    details: "Maintaining high customer quality ratings protects your Meta Business API account from restrictions.",
    followUp: "Would you like to review our Meta compliance best practices checklist?"
  },
  {
    id: "w20_automated_feedback_after_delivery",
    keywords: ["automated feedback requests after", "feedback requests after delivery", "feedback after delivery"],
    title: "Automated Post-Delivery Feedback",
    path: "/whatsapp-ai-chatbot",
    benefits: "Yes! 2 hours after package delivery, the bot triggers a 1-tap CSAT rating or Google Review request via WhatsApp.",
    details: "Positive ratings trigger automated Google Review links, while negative feedback instantly alerts customer service managers.",
    followUp: "Shall I demonstrate our automated post-delivery review collection flow?"
  }
];

console.log(`Ready to inject ${all200Topics.length} initial topics.`);
