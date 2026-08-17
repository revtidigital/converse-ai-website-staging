export interface KnowledgeTopic {
  id: string;
  keywords: string[];
  title: string;
  path: string;
  benefits: string;
  details: string;
  followUp: string;
}

export const ALL_200_APPROVED_KNOWLEDGE: KnowledgeTopic[] = [
  {
    id: "v1",
    keywords: ["how does your ai voice agent handle caller accents in india","voice agent handle caller","caller accents india","voice","agent","handle","caller","accents","india"],
    title: "v1",
    path: "/services",
    benefits: "Our AI Voice Agents feature acoustic model adaptation fine-tuned on diverse Indian regional accents (North, South, East, West) and Hinglish dialects to ensure high speech recognition accuracy. The speech engine filters background noise and recognizes regional speech nuances without dropping call context.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v2",
    keywords: ["can ai voice agents operate on toll-free 1800 numbers","voice agents operate tollfree","tollfree 1800 numbers","voice","agents","operate","tollfree","1800","numbers"],
    title: "v2",
    path: "/services",
    benefits: "Yes! Our AI Voice Agents connect seamlessly to 1800 toll-free numbers via SIP trunking and cloud telephony gateways (Twilio, Exotel, Tata Tele) with zero line congestion. They handle high-volume inbound customer queries 24/7 on toll-free lines with automated CRM logging.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v3",
    keywords: ["what is the sip trunk integration process for voice bots","trunk integration process voice","process voice bots","trunk","integration","process","voice","bots"],
    title: "v3",
    path: "/services",
    benefits: "SIP trunk integration connects directly via WebSockets and WebRTC to your PBX or cloud telephony provider, enabling instant call initiation and bi-directional audio streaming. Our architecture plugs into existing PBX, Asterisk, Twilio, or Exotel infrastructure without requiring any hardware changes.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v4",
    keywords: ["how many simultaneous phone calls can one voice agent handle","many simultaneous phone calls","voice agent handle","many","simultaneous","phone","calls","voice","agent","handle"],
    title: "v4",
    path: "/services",
    benefits: "A single ConverseAI deployment can handle thousands of simultaneous concurrent phone calls automatically with auto-scaling worker queues and zero hold times. Dynamic load balancing ensures every caller gets instant response times even during peak holiday sales spikes.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v5",
    keywords: ["does the voice bot support call recording for compliance","voice support call recording","call recording compliance","voice","support","call","recording","compliance"],
    title: "v5",
    path: "/services",
    benefits: "Yes! Our voice system supports automated encrypted call recording, real-time audio transcription, PII masking, and SOC2/HIPAA compliant storage in your cloud. All audio recordings and transcript summaries are indexed and securely attached to CRM contact records.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v6",
    keywords: ["can the voice agent transfer a call to a human manager","voice agent transfer call","call human manager","voice","agent","transfer","call","human","manager"],
    title: "v6",
    path: "/services",
    benefits: "Yes! Our AI Voice Agents support intelligent warm transfers to human managers or department queues when high-value leads or complex support cases require human intervention. The agent passes full caller context, audio transcripts, and sentiment metrics to the receiving manager before connecting the live line.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v7",
    keywords: ["what happens when a caller speaks both hindi and english in one sentence","happens when caller speaks","hindi english sentence","happens","when","caller","speaks","both","hindi","english","sentence"],
    title: "v7",
    path: "/services",
    benefits: "Our speech recognition engine is specially trained for code-switching, seamlessly understanding mixed Hindi and English (Hinglish) spoken naturally within the exact same sentence! Whether callers switch between Hindi and English phrases mid-sentence, the AI maintains full contextual understanding and responds fluently.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v8",
    keywords: ["can voice agents make automated outbound debt collection calls","voice agents make automated","debt collection calls","voice","agents","make","automated","outbound","debt","collection","calls"],
    title: "v8",
    path: "/services",
    benefits: "Yes! Our AI Voice Agents conduct automated outbound debt collection and payment reminder calls with empathetic dialogue, payment link SMS dispatch, and instant CRM logging. The agent negotiates payment dates, sends instant UPI or Razorpay payment links during the call, and respects compliance calling hours.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v9",
    keywords: ["is there any latency delay when the voice agent answers a question","there latency delay when","agent answers question","there","latency","delay","when","voice","agent","answers","question"],
    title: "v9",
    path: "/services",
    benefits: "Our speech-to-speech voice pipeline achieves an ultra-low response latency of under 300 milliseconds using NVIDIA Parakeet STT/TTS and Google Gemma LLM inference. This sub-second response speed makes conversations feel completely natural and human-like without uncomfortable awkward pauses.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v10",
    keywords: ["does your telephony system support twilio and exotel integration","telephony system support twilio","twilio exotel integration","telephony","system","support","twilio","exotel","integration"],
    title: "v10",
    path: "/services",
    benefits: "Yes! ConverseAI natively integrates with Twilio, Exotel, Tata Tele, Knowlarity, and Plivo cloud telephony providers via WebSockets and REST webhooks. You can keep your existing phone numbers and telephony providers while routing audio streams to our AI voice server.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v11",
    keywords: ["how does the voice bot recognize background noise vs human voice","voice recognize background noise","noise human voice","voice","recognize","background","noise","human","voice"],
    title: "v11",
    path: "/services",
    benefits: "Our voice system utilizes Silero VAD (Voice Activity Detection) paired with Web Audio bandpass filters to isolate human vocal frequencies from street traffic, office chatter, and wind noise. It ensures the AI only processes true speech, preventing background noise from triggering false responses or interrupting call flow.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v12",
    keywords: ["can we customize the voice agent tone and gender","customize voice agent tone","agent tone gender","customize","voice","agent","tone","gender"],
    title: "v12",
    path: "/services",
    benefits: "Yes! You can fully customize the voice agent's gender, accent, tone (warm, professional, empathetic, or authoritative), and speaking rate using NVIDIA Parakeet human voice synthesis and Google Gemma LLM. We can even clone a custom corporate voice actor to maintain consistent brand identity across all customer phone calls.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v13",
    keywords: ["what is the cost per minute for ai voice calls","cost minute voice calls","minute voice calls","cost","minute","voice","calls"],
    title: "v13",
    path: "/services",
    benefits: "AI voice call pricing typically ranges between 3 to 6 cents ($0.03-$0.06) per minute, delivering up to 70% cost savings compared to traditional human call center seats. Self-hosted deployments eliminate per-minute SaaS markups by running directly on your cloud infrastructure.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v14",
    keywords: ["does the ai agent send sms follow-ups after a call ends","agent send followups after","after call ends","agent","send","followups","after","call","ends"],
    title: "v14",
    path: "/services",
    benefits: "Yes! Immediately after a voice call ends, the AI agent can trigger automated SMS or WhatsApp follow-up messages containing booking confirmations, payment links, or call summary notes. This ensures callers receive written confirmation of everything discussed during the phone conversation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v15",
    keywords: ["can voice agents book clinic appointments automatically","voice agents book clinic","clinic appointments automatically","voice","agents","book","clinic","appointments","automatically"],
    title: "v15",
    path: "/services",
    benefits: "Yes! Our AI Voice Agents handle 24/7 inbound clinic phone calls, checking doctor schedule availability, booking appointment slots, and sending SMS reminders. For healthcare providers like CareFirst Clinics, automated appointment booking slashed no-shows by 55% and saved 120 admin hours monthly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v16",
    keywords: ["how does silero vad detect caller speech activity","silero detect caller speech","caller speech activity","silero","detect","caller","speech","activity"],
    title: "v16",
    path: "/services",
    benefits: "Silero VAD is an advanced neural network model running locally in our voice server to analyze audio chunks in 30ms windows, detecting exact speech start and stop boundaries. It enables instant interruption detection (barge-in) and prevents silence or breathing sounds from being misprocessed as user input.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v17",
    keywords: ["does the voice agent handle missed call campaigns","voice agent handle missed","missed call campaigns","voice","agent","handle","missed","call","campaigns"],
    title: "v17",
    path: "/services",
    benefits: "Yes! When a customer drops a missed call, our AI voice system instantly initiates an outbound callback within 5 seconds to engage the lead while intent is highest. This eliminates lost sales opportunities from unanswered calls during off-hours or peak phone traffic.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v18",
    keywords: ["can voice agents conduct customer satisfaction csat surveys","voice agents conduct customer","satisfaction csat surveys","voice","agents","conduct","customer","satisfaction","csat","surveys"],
    title: "v18",
    path: "/services",
    benefits: "Yes! Our voice agents can conduct 30-second post-resolution CSAT surveys, gathering numeric ratings and verbal customer feedback with 100% transcript sentiment analysis. Survey scores and voice transcripts are automatically mapped into your CRM reports and dashboard analytics.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v19",
    keywords: ["what is the maximum duration for a single voice call","maximum duration single voice","single voice call","maximum","duration","single","voice","call"],
    title: "v19",
    path: "/services",
    benefits: "By default, single voice calls are configured with a 30-minute safety limit, but this can be customized or extended based on your enterprise policy. If a caller requires extensive assistance, the agent handles the interaction smoothly or offers a warm transfer to a specialist.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "v20",
    keywords: ["how does the voice agent handle heavy ivr call volume spikes","voice agent handle heavy","call volume spikes","voice","agent","handle","heavy","call","volume","spikes"],
    title: "v20",
    path: "/services",
    benefits: "During sudden traffic surges (such as flash sales or service outages), our cloud auto-scaling infrastructure spins up worker instances dynamically to handle 10x call spikes with zero busy signals. Every caller receives immediate attention without waiting in long hold queues.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w1",
    keywords: ["can whatsapp bots send automated payment links to customers","whatsapp bots send automated","payment links customers","whatsapp","bots","send","automated","payment","links","customers"],
    title: "w1",
    path: "/services",
    benefits: "Yes! ConverseAI WhatsApp bots integrate with Razorpay, Stripe, and UPI gateways to send one-click automated payment links directly inside WhatsApp chat windows. Customers can complete transactions instantly without leaving the messaging application.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w2",
    keywords: ["what is the open rate for whatsapp broadcast marketing campaigns","open rate whatsapp broadcast","broadcast marketing campaigns","open","rate","whatsapp","broadcast","marketing","campaigns"],
    title: "w2",
    path: "/services",
    benefits: "WhatsApp broadcast marketing campaigns consistently achieve 90%+ open rates and 35%+ click-through rates, vastly outperforming email marketing. High engagement leads to faster conversions and direct customer dialogues for promotional offers and product launches.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w3",
    keywords: ["how do click-to-whatsapp facebook ads capture qualified leads","clicktowhatsapp facebook capture qualified","capture qualified leads","clicktowhatsapp","facebook","capture","qualified","leads"],
    title: "w3",
    path: "/services",
    benefits: "Click-to-WhatsApp Meta & Instagram ads direct ad clickers straight into a live WhatsApp chat conversation with our AI lead qualification bot. This eliminates high website bounce rates and captures verified customer phone numbers instantly upon first interaction.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w4",
    keywords: ["can customers complete checkout directly inside whatsapp","customers complete checkout directly","directly inside whatsapp","customers","complete","checkout","directly","inside","whatsapp"],
    title: "w4",
    path: "/services",
    benefits: "Yes! Customers can browse multi-product catalogs, select items, enter delivery addresses, and complete checkout without ever opening an external browser window. Native WhatsApp Flows create a frictionless e-commerce shopping experience directly inside the chat.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w5",
    keywords: ["does the whatsapp bot integrate with shopify store catalogs","whatsapp integrate shopify store","shopify store catalogs","whatsapp","integrate","shopify","store","catalogs"],
    title: "w5",
    path: "/services",
    benefits: "ConverseAI features native real-time synchronization with Shopify, WooCommerce, Magento, and custom ERP product catalogs. Item availability, pricing updates, image galleries, and inventory levels are updated automatically across chat conversations.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w6",
    keywords: ["how does abandoned cart recovery work on whatsapp","abandoned cart recovery work","recovery work whatsapp","abandoned","cart","recovery","work","whatsapp"],
    title: "w6",
    path: "/services",
    benefits: "Our automated WhatsApp abandoned cart bot triggers personalized reminder messages 15 minutes after cart abandonment with dynamic discount codes. For clients like StyleMart India, this recovered lost cart sales with a 38% conversion rate and 3x repeat revenue.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w7",
    keywords: ["can whatsapp bots handle multi-product list messages","whatsapp bots handle multiproduct","multiproduct list messages","whatsapp","bots","handle","multiproduct","list","messages"],
    title: "w7",
    path: "/services",
    benefits: "Yes! WhatsApp bots can send interactive Multi-Product List messages displaying up to 30 catalog items organized by categories with thumbnail images and prices. Customers can add items to a shopping cart with single-tap button clicks.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w8",
    keywords: ["is official whatsapp business api approval included in the service","official whatsapp business approval","approval included service","official","whatsapp","business","approval","included","service"],
    title: "w8",
    path: "/services",
    benefits: "Yes! Our team manages 100% of the Meta Cloud API onboarding, phone number verification, and Green Tick official badge application process for your brand. We ensure full compliance with Meta Commerce policies to secure official API access quickly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w9",
    keywords: ["how many broadcast messages can we send per day on whatsapp","many broadcast messages send","messages send whatsapp","many","broadcast","messages","send","whatsapp"],
    title: "w9",
    path: "/services",
    benefits: "Meta provides tiered broadcast messaging limits starting at 1,000 unique users per day, scaling quickly to 10,000, 100,000, and unlimited daily messaging tiers as quality ratings remain high. Our compliance management keeps your account in Tier 1 health to ensure maximum throughput.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w10",
    keywords: ["can whatsapp chatbots handle customer return requests","whatsapp chatbots handle customer","customer return requests","whatsapp","chatbots","handle","customer","return","requests"],
    title: "w10",
    path: "/services",
    benefits: "Yes! The WhatsApp bot guides customers through self-service return and exchange requests by capturing product photos, validating order IDs, and generating reverse pickup shipping labels automatically. This automates 80% of routine return support queries without human agent workload.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w11",
    keywords: ["does the whatsapp bot support interactive buttons and quick replies","whatsapp support interactive buttons","buttons quick replies","whatsapp","support","interactive","buttons","quick","replies"],
    title: "w11",
    path: "/services",
    benefits: "Yes! Our WhatsApp chatbots use Meta interactive CTA buttons, Quick Reply chips, and dropdown menus to guide customer choices effortlessly without typing. Button-driven flows increase user response speed and prevent spelling errors during lead qualification.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w12",
    keywords: ["how does human agent handoff work inside the whatsapp chat window","human agent handoff work","whatsapp chat window","human","agent","handoff","work","inside","whatsapp","chat","window"],
    title: "w12",
    path: "/services",
    benefits: "When a customer requests human support or asks a complex question, the bot seamlessly transfers the conversation to a shared multi-agent inbox (Zendesk, Freshchat, or ConverseAI Inbox). Human agents view complete conversation history and AI sentiment tags before taking over the chat.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w13",
    keywords: ["can whatsapp bots send pdf invoices and receipt attachments","whatsapp bots send invoices","invoices receipt attachments","whatsapp","bots","send","invoices","receipt","attachments"],
    title: "w13",
    path: "/services",
    benefits: "Yes! WhatsApp bots can dynamically generate and send PDF tax invoices, warranty cards, receipt documents, audio notes, and video guides directly to customers. Documents are generated on-the-fly from CRM/ERP transaction data and sent instantly upon order completion.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w14",
    keywords: ["is customer chat history saved in our crm from whatsapp","customer chat history saved","saved from whatsapp","customer","chat","history","saved","from","whatsapp"],
    title: "w14",
    path: "/services",
    benefits: "Yes! 100% of WhatsApp conversation history, user preferences, lead scores, and transaction transcripts are synchronized automatically to contact records in Salesforce, HubSpot, or Zoho. Your sales and support representatives have full visibility into every past bot interaction.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w15",
    keywords: ["can whatsapp bots send automated order tracking updates","whatsapp bots send automated","order tracking updates","whatsapp","bots","send","automated","order","tracking","updates"],
    title: "w15",
    path: "/services",
    benefits: "Yes! Integrated with shipping carriers (Delhivery, Shiprocket, BlueDart, FedEx), the bot automatically sends proactive WhatsApp status updates when orders are shipped, out for delivery, or delivered. Proactive notifications cut 'Where is my order?' support tickets by up to 75%.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w16",
    keywords: ["how does whatsapp chatbot pricing compare to email marketing","whatsapp chatbot pricing compare","compare email marketing","whatsapp","chatbot","pricing","compare","email","marketing"],
    title: "w16",
    path: "/services",
    benefits: "While email marketing is cheap, it suffers from low 15% open rates. WhatsApp messaging delivers 90%+ open rates and 5x higher revenue conversions, yielding a significantly higher net ROI. Meta charges per-conversation fees (marketing vs utility categories), making targeted high-intent campaigns highly profitable.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w17",
    keywords: ["can whatsapp bots qualify b2b saas leads automatically","whatsapp bots qualify saas","saas leads automatically","whatsapp","bots","qualify","saas","leads","automatically"],
    title: "w17",
    path: "/services",
    benefits: "Yes! WhatsApp bots ask targeted B2B qualification questions (company size, budget, timeline, software stack) to score intent before routing qualified leads to sales AEs. Unqualified leads receive automated resource links, saving sales team bandwidth for high-value prospects.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w18",
    keywords: ["does the bot support multi-language whatsapp conversations","support multilanguage whatsapp conversations","multilanguage whatsapp conversations","support","multilanguage","whatsapp","conversations"],
    title: "w18",
    path: "/services",
    benefits: "Yes! Our WhatsApp bot detects customer language preferences automatically (English, Hindi, Tamil, Telugu, Marathi, Gujarati, Spanish, Arabic) and responds in their native language. Language switching happens dynamically without disrupting conversation context or lead flow.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w19",
    keywords: ["how does the bot prevent spam blocks on whatsapp business api","prevent spam blocks whatsapp","blocks whatsapp business","prevent","spam","blocks","whatsapp","business"],
    title: "w19",
    path: "/services",
    benefits: "We prevent spam blocks by enforcing strict opt-in consent verification, message frequency capping, template categorization compliance, and automated unsubscribe management. Maintaining high customer quality ratings protects your Meta Business API account from restrictions.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "w20",
    keywords: ["can whatsapp bots trigger automated feedback requests after delivery","whatsapp bots trigger automated","requests after delivery","whatsapp","bots","trigger","automated","feedback","requests","after","delivery"],
    title: "w20",
    path: "/services",
    benefits: "Yes! 2 hours after package delivery, the bot triggers a 1-tap CSAT rating or Google Review request via WhatsApp. Positive ratings trigger automated Google Review links, while negative feedback instantly alerts customer service managers.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a1",
    keywords: ["how does agentic process automation process pdf invoices","agentic process automation process","automation process invoices","agentic","process","automation","process","invoices"],
    title: "a1",
    path: "/services",
    benefits: "Agentic Process Automation uses multi-modal vision AI to parse unstructured PDF invoices, extract line items, cross-check 3-way PO matching, validate vendor tax IDs, and log entries directly into SAP or Tally with 99.4% extraction accuracy.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a2",
    keywords: ["what is an agentic 4-week sprint delivery process","agentic 4week sprint delivery","sprint delivery process","agentic","4week","sprint","delivery","process"],
    title: "a2",
    path: "/services",
    benefits: "Our fixed-fee 4-week Agentic Sprint follows: Week 1 Process Audit & Workflow Mapping, Week 2 Custom AI Agent Build & Model Tuning, Week 3 ERP/CRM Integration & Security Controls, Week 4 Live Production Deployment with full employee training.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a3",
    keywords: ["can ai agents handle accounts payable reconciliation automatically","agents handle accounts payable","payable reconciliation automatically","agents","handle","accounts","payable","reconciliation","automatically"],
    title: "a3",
    path: "/services",
    benefits: "Yes! AI agents cross-reference incoming vendor bills against bank statements, purchase orders, and receiving slips, identifying discrepancies and flagging duplicate invoices automatically before queuing approved payments.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a4",
    keywords: ["how does vendor onboarding work with agentic workflows","vendor onboarding work agentic","work agentic workflows","vendor","onboarding","work","agentic","workflows"],
    title: "a4",
    path: "/services",
    benefits: "Agentic workflows automate vendor registration by collecting tax certificates, banking details, and compliance documents via smart web portals, running automated background checks and updating ERP vendor master records.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a5",
    keywords: ["can ai agents triage it support tickets automatically","agents triage support tickets","support tickets automatically","agents","triage","support","tickets","automatically"],
    title: "a5",
    path: "/services",
    benefits: "Yes! AI agents read incoming IT tickets in ServiceNow or Jira, classify incident severity, resolve common password/access issues autonomously, and assign high-priority infrastructure tickets to on-call engineers.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a6",
    keywords: ["how do agentic systems integrate with legacy sap erp systems","agentic systems integrate legacy","integrate legacy systems","agentic","systems","integrate","legacy","systems"],
    title: "a6",
    path: "/services",
    benefits: "Agentic systems connect to SAP ECC, S/4HANA, and legacy ERPs using secure REST/SOAP APIs, RFC connectors, or headless RPA UI automation, enabling seamless read/write data operations without modifying legacy core code.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a7",
    keywords: ["can ai agents read unstructured contract documents","agents read unstructured contract","unstructured contract documents","agents","read","unstructured","contract","documents"],
    title: "a7",
    path: "/services",
    benefits: "Yes! Multi-modal LLM agents analyze complex multi-page legal contracts, identifying renewal dates, liability caps, termination clauses, and non-standard terms, outputting structured JSON summaries into your legal CRM.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a8",
    keywords: ["what is the error rate for automated financial reconciliation","error rate automated financial","automated financial reconciliation","error","rate","automated","financial","reconciliation"],
    title: "a8",
    path: "/services",
    benefits: "ConverseAI financial reconciliation agents achieve an error rate of under 0.1%. Any edge-case discrepancy exceeding confidence thresholds is automatically routed to human finance controllers for 1-click review.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a9",
    keywords: ["does agentic automation require human approval before payments","agentic automation require human","approval before payments","agentic","automation","require","human","approval","before","payments"],
    title: "a9",
    path: "/services",
    benefits: "Yes! We implement Human-in-the-Loop (HITL) approval gates for high-value financial transactions. AI agents prepare the complete reconciliation dossier, requiring explicit digital sign-off from authorized managers before funds transfer.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a10",
    keywords: ["how much back-office operational cost can agentic bots save","much backoffice operational cost","agentic bots save","much","backoffice","operational","cost","agentic","bots","save"],
    title: "a10",
    path: "/services",
    benefits: "Clients typically achieve a 60% to 80% reduction in back-office processing costs, eliminating manual data entry delays and accelerating invoice-to-pay cycles from days to minutes.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a11",
    keywords: ["can ai agents automate monthly payroll processing","agents automate monthly payroll","monthly payroll processing","agents","automate","monthly","payroll","processing"],
    title: "a11",
    path: "/services",
    benefits: "Yes! AI agents reconcile monthly timesheets, calculate attendance deductions, process tax withholdings, generate pay slips, and format bulk bank disbursement files with full audit trail logging.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a12",
    keywords: ["how do agentic bots handle exceptions in invoice workflows","agentic bots handle exceptions","exceptions invoice workflows","agentic","bots","handle","exceptions","invoice","workflows"],
    title: "a12",
    path: "/services",
    benefits: "When an exception occurs (e.g. price mismatch or missing PO), the AI agent flags the specific line item, notifies the responsible procurement officer via Slack/Teams with context, and holds that invoice until approved.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a13",
    keywords: ["can ai agents extract data from scanned physical documents","agents extract data from","scanned physical documents","agents","extract","data","from","scanned","physical","documents"],
    title: "a13",
    path: "/services",
    benefits: "Yes! Our OCR vision engine converts low-resolution scanned paper documents, physical receipts, and handwritten bills into clean digital data, correcting skewed scans and field alignment automatically.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a14",
    keywords: ["what software tools can agentic bots interact with","software tools agentic bots","agentic bots interact","software","tools","agentic","bots","interact"],
    title: "a14",
    path: "/services",
    benefits: "Agentic bots interact with enterprise software including SAP, Oracle, NetSuite, Tally, QuickBooks, Salesforce, HubSpot, Excel, Google Sheets, Gmail, Slack, Jira, and custom Web APIs.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a15",
    keywords: ["does agentic process automation replace traditional rpa tools","agentic process automation replace","replace traditional tools","agentic","process","automation","replace","traditional","tools"],
    title: "a15",
    path: "/services",
    benefits: "Agentic AI enhances traditional RPA by adding cognitive reasoning and LLM document understanding. Unlike rigid RPA scripts that break when UI layouts change, agentic bots adapt dynamically to varying document formats.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a16",
    keywords: ["how fast can an agentic invoice bot be deployed live","fast agentic invoice deployed","invoice deployed live","fast","agentic","invoice","deployed","live"],
    title: "a16",
    path: "/services",
    benefits: "A production-ready invoice processing bot is deployed live in just 4 weeks under our fixed-fee sprint model, with working prototypes delivered within the first 10 days.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a17",
    keywords: ["can agentic bots generate daily financial summary reports","agentic bots generate daily","financial summary reports","agentic","bots","generate","daily","financial","summary","reports"],
    title: "a17",
    path: "/services",
    benefits: "Yes! AI bots aggregate daily cash flow, open accounts receivable, pending vendor bills, and sales receipts across multiple bank accounts and ERPs, emailing executive PDF summaries every morning at 8 AM.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a18",
    keywords: ["how does security control user access in agentic workflows","security control user access","access agentic workflows","security","control","user","access","agentic","workflows"],
    title: "a18",
    path: "/services",
    benefits: "Agentic workflows enforce strict Role-Based Access Control (RBAC), OAuth 2.0 authentication, encrypted secret vault storage, and granular audit logs for every API call and document read operation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a19",
    keywords: ["can agentic bots execute multi-step cross-platform tasks","agentic bots execute multistep","multistep crossplatform tasks","agentic","bots","execute","multistep","crossplatform","tasks"],
    title: "a19",
    path: "/services",
    benefits: "Yes! Agentic bots execute multi-step workflows across systems — e.g. extracting a customer PO from email, checking stock in ERP, creating a shipping order in logistics portal, and emailing the invoice.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "a20",
    keywords: ["what happens if an invoice has missing vendor details","happens invoice missing vendor","missing vendor details","happens","invoice","missing","vendor","details"],
    title: "a20",
    path: "/services",
    benefits: "If vendor details are missing, the bot queries master CRM records using tax registration numbers. If still unverified, it automatically emails the vendor requesting updated W-9/GST documentation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s1",
    keywords: ["how do custom sdr ai agents research prospect leads on linkedin","custom agents research prospect","prospect leads linkedin","custom","agents","research","prospect","leads","linkedin"],
    title: "s1",
    path: "/services",
    benefits: "SDR AI agents analyze prospect LinkedIn profiles, recent company posts, job changes, funding announcements, and technology stacks to craft hyper-personalized outreach messages specific to their pain points.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s2",
    keywords: ["can sdr agents send personalized cold emails automatically","agents send personalized cold","cold emails automatically","agents","send","personalized","cold","emails","automatically"],
    title: "s2",
    path: "/services",
    benefits: "Yes! Custom SDR agents generate personalized 1-on-1 cold email campaigns, managing inbox warmup, domain reputation, automated follow-up sequences, and unsubscribe requests according to CAN-SPAM regulations.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s3",
    keywords: ["how does the sdr agent score lead intent before booking a call","agent score lead intent","before booking call","agent","score","lead","intent","before","booking","call"],
    title: "s3",
    path: "/services",
    benefits: "The SDR agent evaluates lead intent using BANT criteria (Budget, Authority, Need, Timeline), engagement tracking (email opens, link clicks, website visits), and conversational responses before offering demo slots.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s4",
    keywords: ["can custom sdr agents integrate with outreach and salesloft","custom agents integrate outreach","integrate outreach salesloft","custom","agents","integrate","outreach","salesloft"],
    title: "s4",
    path: "/services",
    benefits: "Yes! SDR agents integrate natively with Outreach.io, Salesloft, Apollo.io, and HubSpot Sales Hub, automatically enrolling qualified prospects into outreach cadences and logging email replies.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s5",
    keywords: ["how does the sdr agent handle prospect negative replies","agent handle prospect negative","prospect negative replies","agent","handle","prospect","negative","replies"],
    title: "s5",
    path: "/services",
    benefits: "When a prospect replies negatively ('not interested' or 'too expensive'), the AI categorizes the objection type, logs it in CRM, and politely marks the lead as nurtured or unsubscribed without sending aggressive pushback.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s6",
    keywords: ["can sdr agents book meetings directly into google calendar","agents book meetings directly","into google calendar","agents","book","meetings","directly","into","google","calendar"],
    title: "s6",
    path: "/services",
    benefits: "Yes! SDR agents sync bi-directionally with Google Calendar, Outlook 365, and Calendly, presenting available real-time time slots and sending calendar invites with video call links upon prospect confirmation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s7",
    keywords: ["what lead qualification frameworks do sdr agents use","lead qualification frameworks agents","qualification frameworks agents","lead","qualification","frameworks","agents"],
    title: "s7",
    path: "/services",
    benefits: "SDR agents can be configured with BANT, MEDDIC, or CHAMP qualification frameworks, asking natural conversational questions to verify budget range, authority level, and project timelines.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s8",
    keywords: ["can custom sdr agents generate personalized video openers","custom agents generate personalized","personalized video openers","custom","agents","generate","personalized","video","openers"],
    title: "s8",
    path: "/services",
    benefits: "Yes! SDR agents integrate with AI video generators (HeyGen, Synthesia) to produce personalized 30-second video introductions greeting prospects by name and showcasing tailored pitch decks.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s9",
    keywords: ["how many prospect leads can an sdr ai agent research per hour","many prospect leads agent","agent research hour","many","prospect","leads","agent","research","hour"],
    title: "s9",
    path: "/services",
    benefits: "An SDR AI agent can thoroughly research, enrich, and personalize outreach messaging for up to 500 prospect leads per hour — equivalent to the throughput of a 20-person human SDR team.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s10",
    keywords: ["does the sdr agent check for duplicate contacts in salesforce","agent check duplicate contacts","duplicate contacts salesforce","agent","check","duplicate","contacts","salesforce"],
    title: "s10",
    path: "/services",
    benefits: "Yes! Before initiating outreach, the agent queries Salesforce/HubSpot to ensure the contact is not an existing customer, open opportunity, or active account assigned to a human AE.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s11",
    keywords: ["can sdr agents handle multi-touch omni-channel campaigns","agents handle multitouch omnichannel","multitouch omnichannel campaigns","agents","handle","multitouch","omnichannel","campaigns"],
    title: "s11",
    path: "/services",
    benefits: "Yes! SDR agents orchestrate multi-touch campaigns across Email, LinkedIn InMail, WhatsApp, and automated Phone Calls, maintaining unified conversation context across all communication channels.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s12",
    keywords: ["how does the sdr agent craft personalized value propositions","agent craft personalized value","personalized value propositions","agent","craft","personalized","value","propositions"],
    title: "s12",
    path: "/services",
    benefits: "The SDR agent cross-references company industry, employee headcounts, and recent news against your case studies, selecting the exact ROI metrics (e.g. 3x revenue or 55% no-show drop) relevant to that prospect.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s13",
    keywords: ["can sdr agents research company news and funding rounds","agents research company news","news funding rounds","agents","research","company","news","funding","rounds"],
    title: "s13",
    path: "/services",
    benefits: "Yes! SDR agents ingest real-time news APIs, Crunchbase funding alerts, and SEC filings to trigger timely outreach when a target company raises capital or expands leadership.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s14",
    keywords: ["what is the average reply rate for ai sdr outreach","average reply rate outreach","reply rate outreach","average","reply","rate","outreach"],
    title: "s14",
    path: "/services",
    benefits: "Hyper-personalized AI SDR outreach typically achieves 8% to 14% positive reply rates — 3x higher than generic mass cold email templates.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s15",
    keywords: ["can we customize the tone and persona of our sdr ai agent","customize tone persona agent","tone persona agent","customize","tone","persona","agent"],
    title: "s15",
    path: "/services",
    benefits: "Yes! You can tailor the SDR agent's tone — from consultative enterprise advisor to energetic startup founder — aligning vocabulary and messaging style with your brand guidelines.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s16",
    keywords: ["does the sdr agent hand off hot leads to human aes","agent hand leads human","hand leads human","agent","hand","leads","human"],
    title: "s16",
    path: "/services",
    benefits: "Yes! As soon as a prospect demonstrates high intent or agrees to a meeting, the agent assigns the contact to the designated human AE, attaching complete research briefs and transcript history.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s17",
    keywords: ["how does the sdr agent avoid spam filter triggers on email","agent avoid spam filter","filter triggers email","agent","avoid","spam","filter","triggers","email"],
    title: "s17",
    path: "/services",
    benefits: "SDR agents enforce SPF/DKIM/DMARC authentication, dynamic sending volume throttle limits, variable phrasing syntax, and spam keyword avoidance to ensure 98%+ primary inbox deliverability.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s18",
    keywords: ["can sdr agents draft tailored rfp response proposals","agents draft tailored response","tailored response proposals","agents","draft","tailored","response","proposals"],
    title: "s18",
    path: "/services",
    benefits: "Yes! SDR agents parse incoming RFP specification PDFs, search your corporate Knowledge Intelligence repository for compliant answers, and draft complete proposal responses for sales team review.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s19",
    keywords: ["what data sources does the sdr agent use for lead enrichment","data sources agent lead","agent lead enrichment","data","sources","agent","lead","enrichment"],
    title: "s19",
    path: "/services",
    benefits: "SDR agents enrich lead records using data providers including Apollo, ZoomInfo, Clearbit, LinkedIn Sales Navigator, Crunchbase, and GitHub repositories.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "s20",
    keywords: ["how long does it take to train a custom sdr ai agent","long take train custom","train custom agent","long","take","train","custom","agent"],
    title: "s20",
    path: "/services",
    benefits: "A custom SDR AI agent is fully trained on your ICP (Ideal Customer Profile), case studies, and brand voice within 2 weeks, launching live campaigns by Week 3.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k1",
    keywords: ["how does private document ai read internal company sops","private document read internal","internal company sops","private","document","read","internal","company","sops"],
    title: "k1",
    path: "/services",
    benefits: "Document AI chunks internal company SOP PDFs/DOCX files, converts them into high-dimensional vector embeddings using all-MiniLM-L6-v2, and indexes them in a private vector database for instant citation-backed RAG search.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k2",
    keywords: ["can knowledge intelligence search legal contracts for specific clauses","knowledge intelligence search legal","contracts specific clauses","knowledge","intelligence","search","legal","contracts","specific","clauses"],
    title: "k2",
    path: "/services",
    benefits: "Yes! Knowledge Intelligence searches legal repositories to instantly surface specific indemnification, termination, IP rights, or liability cap clauses with exact section number citations.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k3",
    keywords: ["does the ai provide exact page citations for its answers","provide exact page citations","page citations answers","provide","exact","page","citations","answers"],
    title: "k3",
    path: "/services",
    benefits: "Yes! Every answer generated by Knowledge Intelligence includes exact document source titles, page numbers, and snippet quotes so employees can verify information instantly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k4",
    keywords: ["can knowledge intelligence be hosted on private aws servers","knowledge intelligence hosted private","hosted private servers","knowledge","intelligence","hosted","private","servers"],
    title: "k4",
    path: "/services",
    benefits: "Yes! Knowledge Intelligence can be deployed 100% on-premise or within your private AWS, Azure, or Google Cloud VPC, ensuring no document data ever touches external public LLM servers.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k5",
    keywords: ["how does permission-aware ai restrict confidential hr data","permissionaware restrict confidential data","restrict confidential data","permissionaware","restrict","confidential","data"],
    title: "k5",
    path: "/services",
    benefits: "Permission-aware RAG integrates with Active Directory/Okta RBAC, ensuring employees only receive search results and answers from documents their role is authorized to view.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k6",
    keywords: ["can the document ai parse 500-page technical pdf manuals","document parse 500page technical","500page technical manuals","document","parse","500page","technical","manuals"],
    title: "k6",
    path: "/services",
    benefits: "Yes! Our ingestion pipeline parses 500+ page technical manuals, extracting text, diagrams, tables, and nested chapter hierarchies with sub-second vector search performance.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k7",
    keywords: ["how fast does knowledge intelligence return answers from documents","fast knowledge intelligence return","answers from documents","fast","knowledge","intelligence","return","answers","from","documents"],
    title: "k7",
    path: "/services",
    benefits: "Semantic vector search returns citation-backed answers in under 300 milliseconds across repositories containing tens of thousands of documents.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k8",
    keywords: ["does the ai update its vector database when sops change","update vector database when","when sops change","update","vector","database","when","sops","change"],
    title: "k8",
    path: "/services",
    benefits: "Yes! Webhook listeners auto-detect file updates in Google Drive, Notion, or SharePoint, automatically re-indexing vector embeddings so answers always reflect the latest policy revisions.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k9",
    keywords: ["can knowledge intelligence answer employee onboarding queries","knowledge intelligence answer employee","employee onboarding queries","knowledge","intelligence","answer","employee","onboarding","queries"],
    title: "k9",
    path: "/services",
    benefits: "Yes! Internal HR AI bots answer new hire questions regarding benefits, leave policies, IT setup, and company guidelines 24/7, reducing HR admin tickets by 70%.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k10",
    keywords: ["is client contract data kept 100% private in isolated clouds","client contract data kept","private isolated clouds","client","contract","data","kept","private","isolated","clouds"],
    title: "k10",
    path: "/services",
    benefits: "Yes! All client documents, embeddings, and chat histories are isolated in single-tenant data stores with AES-256 encryption at rest and TLS 1.3 in transit.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k11",
    keywords: ["can knowledge intelligence integrate with notion and confluence","knowledge intelligence integrate notion","integrate notion confluence","knowledge","intelligence","integrate","notion","confluence"],
    title: "k11",
    path: "/services",
    benefits: "Yes! We support native API connectors for Notion, Confluence, SharePoint, Google Drive, Dropbox, Box, and Jira Knowledge Bases.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k12",
    keywords: ["how does the vector rag engine prevent ai hallucinations","vector engine prevent hallucinations","engine prevent hallucinations","vector","engine","prevent","hallucinations"],
    title: "k12",
    path: "/services",
    benefits: "The RAG engine enforces strict prompt grounding rules — forcing the LLM to answer exclusively using retrieved vector context snippets. If context is missing, it explicitly states information is unverified.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k13",
    keywords: ["can document ai compare two version revisions of a contract","document compare version revisions","version revisions contract","document","compare","version","revisions","contract"],
    title: "k13",
    path: "/services",
    benefits: "Yes! Document AI compares multi-page contract revisions side-by-side, highlighting added, deleted, or modified legal clauses and assessing risk level changes.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k14",
    keywords: ["what document formats are supported by knowledge intelligence","document formats supported knowledge","supported knowledge intelligence","document","formats","supported","knowledge","intelligence"],
    title: "k14",
    path: "/services",
    benefits: "We support PDF, DOCX, TXT, CSV, XLSX, PPTX, HTML, Markdown, scanned images (via OCR), and web URLs.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k15",
    keywords: ["does knowledge intelligence support multi-lingual document translation","knowledge intelligence support multilingual","multilingual document translation","knowledge","intelligence","support","multilingual","document","translation"],
    title: "k15",
    path: "/services",
    benefits: "Yes! Employees can upload a document in German or Hindi and ask questions in English (or vice versa), receiving accurate citation-backed answers in their preferred language.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k16",
    keywords: ["how does superadmin re-index knowledge after website updates","superadmin reindex knowledge after","after website updates","superadmin","reindex","knowledge","after","website","updates"],
    title: "k16",
    path: "/services",
    benefits: "Superadmins can trigger an immediate full re-index via the protected `/api/reindex` endpoint or Admin Dashboard button, re-crawling sitemaps and regenerating vector embeddings in minutes.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k17",
    keywords: ["can document ai extract structured json tables from pdfs","document extract structured json","tables from pdfs","document","extract","structured","json","tables","from","pdfs"],
    title: "k17",
    path: "/services",
    benefits: "Yes! Vision-LLM models parse complex multi-column PDF tables, financial balance sheets, and invoice line items, outputting clean structured JSON schemas.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k18",
    keywords: ["is there a file size limit for internal sop uploads","there file size limit","limit internal uploads","there","file","size","limit","internal","uploads"],
    title: "k18",
    path: "/services",
    benefits: "Standard file upload limit is 100MB per file, but larger technical manuals up to 1GB can be processed via stream chunking.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k19",
    keywords: ["how does knowledge intelligence enforce tenant data isolation","knowledge intelligence enforce tenant","tenant data isolation","knowledge","intelligence","enforce","tenant","data","isolation"],
    title: "k19",
    path: "/services",
    benefits: "Multi-tenant deployments isolate data using separate vector database namespaces and tenant ID query filters, ensuring zero cross-tenant data leakage.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "k20",
    keywords: ["can employees chat with company knowledge bases via slack","employees chat company knowledge","knowledge bases slack","employees","chat","company","knowledge","bases","slack"],
    title: "k20",
    path: "/services",
    benefits: "Yes! We build custom Slack and Microsoft Teams bots that allow employees to tag `@KnowledgeBot` in channels to receive instant citation-backed answers from company SOPs.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c1",
    keywords: ["how does converseai integrate with salesforce crm","converseai integrate salesforce","converseai integrate salesforce","converseai","integrate","salesforce"],
    title: "c1",
    path: "/services",
    benefits: "We integrate via Salesforce REST API & Apex Webhooks — creating Lead/Contact records, updating Opportunity stages, logging call audio transcripts, and triggering Salesforce Flows in real time.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c2",
    keywords: ["can ai agents update contact deal stages in hubspot automatically","agents update contact deal","stages hubspot automatically","agents","update","contact","deal","stages","hubspot","automatically"],
    title: "c2",
    path: "/services",
    benefits: "Yes! AI agents call HubSpot CRM APIs to advance pipeline deal stages, add engagement timeline notes, assign tasks to owners, and update custom contact properties automatically.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c3",
    keywords: ["does converseai support zoho crm and leadsquared integration","converseai support zoho leadsquared","zoho leadsquared integration","converseai","support","zoho","leadsquared","integration"],
    title: "c3",
    path: "/services",
    benefits: "Yes! We provide full native integration support for Zoho CRM, LeadSquared, Freshsales, and Pipedrive, ensuring multi-channel lead data syncs seamlessly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c4",
    keywords: ["how do ai agents connect with zendesk for support tickets","agents connect zendesk support","zendesk support tickets","agents","connect","zendesk","support","tickets"],
    title: "c4",
    path: "/services",
    benefits: "AI agents interface with Zendesk Support API — creating tickets, updating status, adding internal comments, and resolving routine inquiries automatically.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c5",
    keywords: ["can ai agents sync data with internal rest api webhooks","agents sync data internal","internal rest webhooks","agents","sync","data","internal","rest","webhooks"],
    title: "c5",
    path: "/services",
    benefits: "Yes! Custom webhooks allow AI agents to send and receive real-time JSON payloads to any internal REST/GraphQL API or microservice.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c6",
    keywords: ["is tally accounting software integration supported","tally accounting software integration","software integration supported","tally","accounting","software","integration","supported"],
    title: "c6",
    path: "/services",
    benefits: "Yes! We integrate with Tally Prime and Tally.ERP 9 via Tally XML API / ODBC connectors, automating sales voucher entry, receipt posting, and ledger reconciliation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c7",
    keywords: ["how does real-time bi-directional crm sync work","realtime bidirectional sync work","bidirectional sync work","realtime","bidirectional","sync","work"],
    title: "c7",
    path: "/services",
    benefits: "Bi-directional sync listens for webhooks from your CRM (e.g. status change) while pushed agent updates write back immediately, maintaining 100% data consistency.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c8",
    keywords: ["can ai agents log call audio recordings into hubspot contacts","agents call audio recordings","into hubspot contacts","agents","call","audio","recordings","into","hubspot","contacts"],
    title: "c8",
    path: "/services",
    benefits: "Yes! Upon call completion, the AI agent uploads encrypted audio MP3 recordings, text transcripts, and AI key points directly to the corresponding HubSpot contact timeline.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c9",
    keywords: ["what authentication protocols are used for api integrations","authentication protocols used integrations","protocols used integrations","authentication","protocols","used","integrations"],
    title: "c9",
    path: "/services",
    benefits: "We enforce enterprise security protocols including OAuth 2.0, mTLS, HMAC SHA-256 signature verification, and encrypted API key vaults.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c10",
    keywords: ["does converseai require replacing existing enterprise software","converseai require replacing existing","existing enterprise software","converseai","require","replacing","existing","enterprise","software"],
    title: "c10",
    path: "/services",
    benefits: "No! ConverseAI solutions overlay on top of your existing software stack (CRMs, ERPs, Telephony), enhancing workflows without requiring expensive rip-and-replace software migrations.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c11",
    keywords: ["can ai agents trigger automated zapier or make workflows","agents trigger automated zapier","zapier make workflows","agents","trigger","automated","zapier","make","workflows"],
    title: "c11",
    path: "/services",
    benefits: "Yes! AI agents trigger Zapier webhooks or Make.com scenarios to connect with over 5,000+ third-party cloud applications.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c12",
    keywords: ["how does converseai handle crm api rate limits","converseai handle rate limits","handle rate limits","converseai","handle","rate","limits"],
    title: "c12",
    path: "/services",
    benefits: "Our middleware implements exponential backoff retries, request throttling queues, and batch payload processing to remain strictly within CRM API quota limits.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c13",
    keywords: ["can ai agents create new leads in pipedrive automatically","agents create leads pipedrive","leads pipedrive automatically","agents","create","leads","pipedrive","automatically"],
    title: "c13",
    path: "/services",
    benefits: "Yes! When a new prospect engages on WhatsApp or Voice, the agent extracts contact details, qualifies buyer intent, and creates a formatted Lead in Pipedrive instantly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c14",
    keywords: ["is servicenow integration available for enterprise it","servicenow integration available enterprise","integration available enterprise","servicenow","integration","available","enterprise"],
    title: "c14",
    path: "/services",
    benefits: "Yes! We integrate with ServiceNow IT Service Management (ITSM), automating incident creation, CMDB configuration lookup, and user access provisioning.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c15",
    keywords: ["how fast can a custom crm api integration be built","fast custom integration built","custom integration built","fast","custom","integration","built"],
    title: "c15",
    path: "/services",
    benefits: "Custom REST API connectors are built and verified within 3 to 5 business days using our modular SDK integration framework.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c16",
    keywords: ["does converseai provide custom webhook endpoints for callbacks","converseai provide custom webhook","webhook endpoints callbacks","converseai","provide","custom","webhook","endpoints","callbacks"],
    title: "c16",
    path: "/services",
    benefits: "Yes! Every client deployment receives dedicated HTTPS webhook endpoints with signature validation for real-time event callbacks.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c17",
    keywords: ["can ai agents update inventory status in sap erp","agents update inventory status","update inventory status","agents","update","inventory","status"],
    title: "c17",
    path: "/services",
    benefits: "Yes! AI agents connect to SAP via BAPI/OData services, checking stock availability and updating inventory line items in real time as orders are confirmed.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c18",
    keywords: ["how are integration errors logged and retried","integration errors logged retried","errors logged retried","integration","errors","logged","retried"],
    title: "c18",
    path: "/services",
    benefits: "Failed API requests are logged in administrative audit trails with automatic dead-letter queue retries and instant alert notifications via Slack/email.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c19",
    keywords: ["can ai agents read custom fields from salesforce objects","agents read custom fields","from salesforce objects","agents","read","custom","fields","from","salesforce","objects"],
    title: "c19",
    path: "/services",
    benefits: "Yes! Our dynamic schema mapper reads standard and custom fields (`__c`) from Salesforce Lead, Contact, Account, and Opportunity objects.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "c20",
    keywords: ["is multi-crm sync supported for enterprise holding companies","multicrm sync supported enterprise","enterprise holding companies","multicrm","sync","supported","enterprise","holding","companies"],
    title: "c20",
    path: "/services",
    benefits: "Yes! Multi-tenant routing rules allow AI agents to sync leads and support cases to different CRMs based on subsidiary brand or geographic region.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se1",
    keywords: ["is converseai fully soc2 type ii compliant","converseai fully soc2 type","soc2 type compliant","converseai","fully","soc2","type","compliant"],
    title: "se1",
    path: "/services",
    benefits: "Yes! ConverseAI solution architectures are fully SOC2 Type II compliant and HIPAA ready, featuring stringent access controls, vulnerability scanning, and audit logging.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se2",
    keywords: ["how does converseai satisfy hipaa compliance requirements","converseai satisfy hipaa compliance","hipaa compliance requirements","converseai","satisfy","hipaa","compliance","requirements"],
    title: "se2",
    path: "/services",
    benefits: "We satisfy HIPAA compliance through business associate agreements (BAAs), PII/PHI redaction algorithms, AES-256 data encryption, and dedicated single-tenant VPC deployments.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se3",
    keywords: ["who owns 100% of the custom code, data, and ip assets","owns custom code data","code data assets","owns","custom","code","data","assets"],
    title: "se3",
    path: "/services",
    benefits: "You do! Clients retain 100% full ownership of all custom agent source code, fine-tuned model weights, proprietary data, and intellectual property.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se4",
    keywords: ["do clients get isolated tenant cloud environments","clients isolated tenant cloud","tenant cloud environments","clients","isolated","tenant","cloud","environments"],
    title: "se4",
    path: "/services",
    benefits: "Yes! Enterprise clients receive dedicated isolated cloud VPC environments (AWS/Azure/GCP) with private networking and dedicated compute resources.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se5",
    keywords: ["is client conversation data ever sold or used for training","client conversation data ever","sold used training","client","conversation","data","ever","sold","used","training"],
    title: "se5",
    path: "/services",
    benefits: "Never. Client conversation data, transcripts, and document knowledge are 100% private and NEVER sold, shared, or used to train public LLM models.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se6",
    keywords: ["what encryption standards are used for data in transit","encryption standards used data","used data transit","encryption","standards","used","data","transit"],
    title: "se6",
    path: "/services",
    benefits: "All network traffic is encrypted using TLS 1.3 / HTTPS / WSS protocols in transit, paired with AES-256 bit encryption for data at rest.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se7",
    keywords: ["how does converseai handle gdpr data privacy requests","converseai handle gdpr data","data privacy requests","converseai","handle","gdpr","data","privacy","requests"],
    title: "se7",
    path: "/services",
    benefits: "We support automated 'Right to be Forgotten' data deletion requests, exporting or purging user transcripts and PII records within 24 hours of request.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se8",
    keywords: ["are penetration testing reports available for enterprise clients","penetration testing reports available","available enterprise clients","penetration","testing","reports","available","enterprise","clients"],
    title: "se8",
    path: "/services",
    benefits: "Yes! Executive summaries of third-party annual penetration testing and vulnerability assessment reports are shared with enterprise security review teams under NDA.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se9",
    keywords: ["what physical and cloud security controls protect server data","physical cloud security controls","protect server data","physical","cloud","security","controls","protect","server","data"],
    title: "se9",
    path: "/services",
    benefits: "Cloud infrastructure is hosted in ISO 27001 / SOC2 certified data centers with 24/7 biometric physical security, DDoS protection, and automated failover backups.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se10",
    keywords: ["can ai models be deployed on-premise inside private data centers","models deployed onpremise inside","private data centers","models","deployed","onpremise","inside","private","data","centers"],
    title: "se10",
    path: "/services",
    benefits: "Yes! Self-hosted models (Google Gemma, NVIDIA Parakeet, Ollama) can be deployed 100% on-premise inside your private data center or air-gapped network.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se11",
    keywords: ["does converseai sign business associate agreements for healthcare","converseai sign business associate","associate agreements healthcare","converseai","sign","business","associate","agreements","healthcare"],
    title: "se11",
    path: "/services",
    benefits: "Yes! We execute standard HIPAA Business Associate Agreements (BAAs) for healthcare clinics, hospital networks, and healthtech providers.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se12",
    keywords: ["how are api keys and secret tokens managed securely","keys secret tokens managed","tokens managed securely","keys","secret","tokens","managed","securely"],
    title: "se12",
    path: "/services",
    benefits: "API keys and database credentials are stored in encrypted hardware security modules (AWS Secrets Manager / HashiCorp Vault) with automated secret rotation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se13",
    keywords: ["what is the system uptime sla for enterprise deployments","system uptime enterprise deployments","uptime enterprise deployments","system","uptime","enterprise","deployments"],
    title: "se13",
    path: "/services",
    benefits: "Enterprise service level agreements (SLAs) guarantee 99.9% uptime with 24/7 active-active multi-region cloud redundancy.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se14",
    keywords: ["how does disaster recovery failover work in cloud regions","disaster recovery failover work","work cloud regions","disaster","recovery","failover","work","cloud","regions"],
    title: "se14",
    path: "/services",
    benefits: "Automated multi-region failover redirects WebSocket and HTTP traffic to secondary hot-standby cloud regions within 30 seconds if a primary region degrades.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se15",
    keywords: ["are administrative actions logged in audit security trails","administrative actions logged audit","audit security trails","administrative","actions","logged","audit","security","trails"],
    title: "se15",
    path: "/services",
    benefits: "Yes! 100% of administrative login attempts, configuration updates, data exports, and re-indexing events are recorded in immutable audit logs.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se16",
    keywords: ["how does role-based access control restrict admin permissions","rolebased access control restrict","restrict admin permissions","rolebased","access","control","restrict","admin","permissions"],
    title: "se16",
    path: "/services",
    benefits: "RBAC policies restrict access based on user role — differentiating Superadmins, Content Editors, Support Agents, and Read-Only Auditors.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se17",
    keywords: ["what security headers protect converseai web endpoints","security headers protect converseai","protect converseai endpoints","security","headers","protect","converseai","endpoints"],
    title: "se17",
    path: "/services",
    benefits: "All web endpoints enforce strict HTTP security headers including Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options, and X-Content-Type-Options.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se18",
    keywords: ["can enterprise security teams conduct vulnerability scans","enterprise security teams conduct","conduct vulnerability scans","enterprise","security","teams","conduct","vulnerability","scans"],
    title: "se18",
    path: "/services",
    benefits: "Yes! We coordinate authorized penetration testing and automated vulnerability scans with client InfoSec teams prior to production launch.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se19",
    keywords: ["how is pii data masked in voice and text transcripts","data masked voice text","voice text transcripts","data","masked","voice","text","transcripts"],
    title: "se19",
    path: "/services",
    benefits: "Real-time regex and NER models detect credit card numbers, SSNs, and passwords in speech/text streams, redacting them to `[REDACTED]` before saving transcripts.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "se20",
    keywords: ["what compliance standards govern financial transaction bots","compliance standards govern financial","financial transaction bots","compliance","standards","govern","financial","transaction","bots"],
    title: "se20",
    path: "/services",
    benefits: "Financial transaction bots comply with PCI-DSS guidelines for payment tokenization, ensuring raw credit card details are never stored on bot servers.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p1",
    keywords: ["how much cheaper are converseai solutions compared to us agencies","much cheaper converseai solutions","solutions compared agencies","much","cheaper","converseai","solutions","compared","agencies"],
    title: "p1",
    path: "/services",
    benefits: "Powered by our core engineering hub in Jaipur, India, ConverseAI delivers US-grade AI engineering standards at 40% to 60% below US boutique agency pricing.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p2",
    keywords: ["what is included in a 4-week fixed-fee agent sprint","included 4week fixedfee agent","fixedfee agent sprint","included","4week","fixedfee","agent","sprint"],
    title: "p2",
    path: "/services",
    benefits: "A 4-week Agent Sprint includes workflow auditing, custom model fine-tuning, CRM integration, security setup, QA benchmark testing, and production deployment with zero budget overruns.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p3",
    keywords: ["is the ai strategy audit fee credited toward the first build","strategy audit credited toward","toward first build","strategy","audit","credited","toward","first","build"],
    title: "p3",
    path: "/services",
    benefits: "Yes! 100% of the 2-week AI Strategy & Readiness Audit fee is credited directly toward your first 4-week productized AI deployment.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p4",
    keywords: ["do you offer fixed-fee proposals with zero cost overruns","offer fixedfee proposals zero","zero cost overruns","offer","fixedfee","proposals","zero","cost","overruns"],
    title: "p4",
    path: "/services",
    benefits: "Yes! Every project engagement is structured under a transparent fixed-fee proposal, eliminating hourly billing surprises or unexpected scope creep.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p5",
    keywords: ["how long does a 3-week ai strategy audit engagement take","long 3week strategy audit","audit engagement take","long","3week","strategy","audit","engagement","take"],
    title: "p5",
    path: "/services",
    benefits: "The AI Strategy Audit spans 2 to 3 weeks, delivering a complete operational bottleneck evaluation, ROI calculation matrix, and technical roadmap.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p6",
    keywords: ["what is the proof-of-concept prototype delivery timeline","proofofconcept prototype delivery timeline","prototype delivery timeline","proofofconcept","prototype","delivery","timeline"],
    title: "p6",
    path: "/services",
    benefits: "Working proof-of-concept (POC) prototypes are delivered within 7 to 10 business days for early stakeholder evaluation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p7",
    keywords: ["are there any recurring hidden software licensing fees","there recurring hidden software","software licensing fees","there","recurring","hidden","software","licensing","fees"],
    title: "p7",
    path: "/services",
    benefits: "No! We provide transparent cost breakdowns. Self-hosted options eliminate per-seat SaaS licensing markups.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p8",
    keywords: ["how does converseai structure client payment milestones","converseai structure client payment","client payment milestones","converseai","structure","client","payment","milestones"],
    title: "p8",
    path: "/services",
    benefits: "Standard engagement milestones are structured as: 40% Deposit upon kickoff, 40% upon POC Milestone Sign-off, and 20% upon Final Production Launch.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p9",
    keywords: ["what is the cost of ongoing maintenance and agent tuning","cost ongoing maintenance agent","maintenance agent tuning","cost","ongoing","maintenance","agent","tuning"],
    title: "p9",
    path: "/services",
    benefits: "Ongoing monthly maintenance plans cover model re-tuning, API updates, performance monitoring, and SLA support at a low predictable retainer.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p10",
    keywords: ["can companies upgrade their sprint scope during development","companies upgrade their sprint","scope during development","companies","upgrade","their","sprint","scope","during","development"],
    title: "p10",
    path: "/services",
    benefits: "Yes! Sprints are managed agilely — scope additions can be incorporated into follow-on sprint cycles without disrupting current build timelines.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p11",
    keywords: ["what roi metrics can clients expect within 90 days","metrics clients expect within","expect within days","metrics","clients","expect","within","days"],
    title: "p11",
    path: "/services",
    benefits: "Clients typically report 3x higher lead conversion rates, 65% reduction in support costs, or 120+ admin hours saved per month within 90 days.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p12",
    keywords: ["do you offer dedicated account managers for enterprise clients","offer dedicated account managers","managers enterprise clients","offer","dedicated","account","managers","enterprise","clients"],
    title: "p12",
    path: "/services",
    benefits: "Yes! Enterprise clients receive a dedicated AI Solution Architect and Technical Account Manager for daily Slack/Teams communication.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p13",
    keywords: ["how does fixed-fee sprint pricing prevent budget creep","fixedfee sprint pricing prevent","prevent budget creep","fixedfee","sprint","pricing","prevent","budget","creep"],
    title: "p13",
    path: "/services",
    benefits: "Fixed-fee pricing locks deliverables, architecture specs, and timelines upfront, ensuring your project is completed on budget.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p14",
    keywords: ["what happens after the initial 4-week agent deployment","happens after initial 4week","4week agent deployment","happens","after","initial","4week","agent","deployment"],
    title: "p14",
    path: "/services",
    benefits: "After deployment, we provide 30 days of hyper-care support, followed by optional ongoing optimization retainer plans.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p15",
    keywords: ["can smb startups afford converseai custom ai development","startups afford converseai custom","converseai custom development","startups","afford","converseai","custom","development"],
    title: "p15",
    path: "/services",
    benefits: "Yes! Our productized sprint model makes custom enterprise-grade AI accessible and affordable for growing SMB startups.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p16",
    keywords: ["what is the cost comparison between ai agents and human staff","cost comparison between agents","agents human staff","cost","comparison","between","agents","human","staff"],
    title: "p16",
    path: "/services",
    benefits: "An AI agent costs up to 70% less than hiring equivalent full-time human staff, operating 24/7/365 with zero turnover or training overhead.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p17",
    keywords: ["are there discounts for annual enterprise service contracts","there discounts annual enterprise","enterprise service contracts","there","discounts","annual","enterprise","service","contracts"],
    title: "p17",
    path: "/services",
    benefits: "Yes! We offer 15% to 20% discounts on annual multi-sprint and maintenance retainer contracts.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p18",
    keywords: ["how do we request a custom project proposal","request custom project proposal","custom project proposal","request","custom","project","proposal"],
    title: "p18",
    path: "/services",
    benefits: "You can request a custom proposal by scheduling a 15-minute discovery call or submitting your project details on our Contact page.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p19",
    keywords: ["what is the refund policy if project milestones are delayed","refund policy project milestones","project milestones delayed","refund","policy","project","milestones","delayed"],
    title: "p19",
    path: "/services",
    benefits: "We stand behind our milestone delivery SLAs — if a core sprint milestone is missed due to our delay, milestone fees are adjusted or credited.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "p20",
    keywords: ["why choose converseai over offshore contract developers","choose converseai over offshore","offshore contract developers","choose","converseai","over","offshore","contract","developers"],
    title: "p20",
    path: "/services",
    benefits: "Unlike freelance contractors, ConverseAI delivers productized AI systems built by senior engineers in Jaipur with full IP ownership, SOC2 security, and guaranteed SLAs.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs1",
    keywords: ["how did stylemart india achieve 3x repeat purchase revenue","stylemart india achieve repeat","repeat purchase revenue","stylemart","india","achieve","repeat","purchase","revenue"],
    title: "cs1",
    path: "/services",
    benefits: "StyleMart India deployed ConverseAI WhatsApp AI Chatbot for automated post-purchase recommendations & abandoned cart recovery, driving 3x repeat purchase revenue & 65% support cost reduction.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs2",
    keywords: ["what reduction in support costs did stylemart report on whatsapp","reduction support costs stylemart","stylemart report whatsapp","reduction","support","costs","stylemart","report","whatsapp"],
    title: "cs2",
    path: "/services",
    benefits: "StyleMart India achieved a 65% reduction in customer support operational costs by automating routine order status and return queries.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs3",
    keywords: ["how did learnsphere double student enrolments in 90 days","learnsphere double student enrolments","student enrolments days","learnsphere","double","student","enrolments","days"],
    title: "cs3",
    path: "/services",
    benefits: "LearnSphere used ConverseAI interactive WhatsApp AI lead bot to qualify student inquiries in 30 seconds, doubling course enrolments in 90 days and cutting response time by 80%.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs4",
    keywords: ["by how much did learnsphere cut lead response time","much learnsphere lead response","lead response time","much","learnsphere","lead","response","time"],
    title: "cs4",
    path: "/services",
    benefits: "LearnSphere cut lead response time by 80% — responding to prospective students within 5 seconds of ad clicks.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs5",
    keywords: ["how did carefirst clinics cut appointment no-shows by 55%","carefirst clinics appointment noshows","clinics appointment noshows","carefirst","clinics","appointment","noshows"],
    title: "cs5",
    path: "/services",
    benefits: "CareFirst Clinics deployed automated WhatsApp reminder & voice call agents, reducing missed appointments by 55% across 12 clinic locations and saving 120 admin hours monthly.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs6",
    keywords: ["how many admin hours per month did carefirst clinics save","many admin hours month","carefirst clinics save","many","admin","hours","month","carefirst","clinics","save"],
    title: "cs6",
    path: "/services",
    benefits: "CareFirst Clinics saved 120 administrative staff hours per month through automated appointment scheduling and patient follow-up calls.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs7",
    keywords: ["what results did b2b saas clients achieve with sales ai","results saas clients achieve","clients achieve sales","results","saas","clients","achieve","sales"],
    title: "cs7",
    path: "/services",
    benefits: "B2B SaaS clients achieved a 3.5x increase in qualified demo bookings and a 45% reduction in customer acquisition cost using Custom SDR AI outreach.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs8",
    keywords: ["where can i read full client case studies on your website","where read full client","case studies website","where","read","full","client","case","studies","website"],
    title: "cs8",
    path: "/services",
    benefits: "You can read complete verified client case studies with metrics and walkthroughs at `/case-studies` on our website.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs9",
    keywords: ["can converseai share client references for healthcare ai","converseai share client references","client references healthcare","converseai","share","client","references","healthcare"],
    title: "cs9",
    path: "/services",
    benefits: "Yes! We provide verified client references and healthcare case study walkthroughs under NDA during executive discovery calls.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs10",
    keywords: ["what retail fashion brands use converseai whatsapp bots","retail fashion brands converseai","converseai whatsapp bots","retail","fashion","brands","converseai","whatsapp","bots"],
    title: "cs10",
    path: "/services",
    benefits: "Retail fashion brands like StyleMart India utilize ConverseAI WhatsApp bots for catalog sales, order tracking, and cart recovery.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs11",
    keywords: ["what edtech platforms use converseai lead qualification","edtech platforms converseai lead","converseai lead qualification","edtech","platforms","converseai","lead","qualification"],
    title: "cs11",
    path: "/services",
    benefits: "EdTech platforms like LearnSphere use ConverseAI to automate student lead qualification, course recommendations, and instant enrollment booking.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs12",
    keywords: ["what healthcare networks use converseai appointment voice bots","healthcare networks converseai appointment","appointment voice bots","healthcare","networks","converseai","appointment","voice","bots"],
    title: "cs12",
    path: "/services",
    benefits: "Multi-branch clinic networks like CareFirst Clinics use ConverseAI voice agents for 24/7 inbound patient scheduling.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs13",
    keywords: ["what back-office invoice savings did financial clients see","backoffice invoice savings financial","savings financial clients","backoffice","invoice","savings","financial","clients"],
    title: "cs13",
    path: "/services",
    benefits: "Financial and accounting clients achieved a 75% reduction in invoice processing time and zero data entry errors.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs14",
    keywords: ["how did converseai help a logistics company streamline support","converseai help logistics company","company streamline support","converseai","help","logistics","company","streamline","support"],
    title: "cs14",
    path: "/services",
    benefits: "ConverseAI automated 80% of shipment tracking, ETA queries, and delivery rescheduling for global logistics clients via WhatsApp & Voice.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs15",
    keywords: ["what csat score improvement did real estate clients achieve","csat score improvement real","estate clients achieve","csat","score","improvement","real","estate","clients","achieve"],
    title: "cs15",
    path: "/services",
    benefits: "Real estate clients improved CSAT scores from 3.8 to 4.8 out of 5 by offering instant 24/7 property inquiry responses.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs16",
    keywords: ["can i view video walkthroughs of client case studies","view video walkthroughs client","client case studies","view","video","walkthroughs","client","case","studies"],
    title: "cs16",
    path: "/services",
    benefits: "Yes! Interactive video walkthroughs and system architecture diagrams are available on each case study page.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs17",
    keywords: ["what conversion rates do whatsapp abandoned cart bots deliver","conversion rates whatsapp abandoned","cart bots deliver","conversion","rates","whatsapp","abandoned","cart","bots","deliver"],
    title: "cs17",
    path: "/services",
    benefits: "ConverseAI WhatsApp abandoned cart bots deliver a 38% conversion rate on recovered shopping carts.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs18",
    keywords: ["how fast did stylemart see positive roi after launch","fast stylemart positive after","positive after launch","fast","stylemart","positive","after","launch"],
    title: "cs18",
    path: "/services",
    benefits: "StyleMart India achieved full positive ROI within 30 days of deploying ConverseAI WhatsApp automation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs19",
    keywords: ["what lead volume increase did edtech clients experience","lead volume increase edtech","edtech clients experience","lead","volume","increase","edtech","clients","experience"],
    title: "cs19",
    path: "/services",
    benefits: "LearnSphere experienced a 2x increase in qualified student lead volume within 90 days of launch.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "cs20",
    keywords: ["are case study metrics verified by independent clients","case study metrics verified","verified independent clients","case","study","metrics","verified","independent","clients"],
    title: "cs20",
    path: "/services",
    benefits: "Yes! All published case study metrics, revenue growth numbers, and operational savings are independently verified by client stakeholders.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j1",
    keywords: [
      "where is converseai located",
      "where is converse ai located",
      "where is conversia located",
      "where is conversia",
      "where is converse ai",
      "where is your office located",
      "where are you located",
      "office location",
      "company location",
      "headquarters location",
      "where is your headquarters",
      "where is your office",
      "where is converseai core engineering team headquartered"
    ],
    title: "Company Location",
    path: "/about-us",
    benefits: "Converse AI's core engineering hub is headquartered in Jaipur, Rajasthan, India, powering productized AI solutions for global clients.",
    details: "Our office is located in Jaipur, India, and we serve enterprise clients worldwide.",
    followUp: "Would you like our office contact details or to schedule a discovery call with our team?"
  },
  {
    id: "j2",
    keywords: [
      "why is converseai engineering hub located in jaipur",
      "why jaipur",
      "why in jaipur"
    ],
    title: "Why Jaipur Hub",
    path: "/about-us",
    benefits: "Our Jaipur engineering hub combines elite AI engineering talent with a cost structure that delivers US-grade solutions at 40-60% below Western agency rates.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j3",
    keywords: ["how does jaipur engineering deliver us-grade ai standards","jaipur engineering deliver usgrade","deliver usgrade standards","jaipur","engineering","deliver","usgrade","standards"],
    title: "j3",
    path: "/services",
    benefits: "Our Jaipur team consists of senior AI architects trained in SOC2 compliance, vector RAG, voice models, and enterprise software integration.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j4",
    keywords: ["can international clients visit the jaipur engineering office","international clients visit jaipur","jaipur engineering office","international","clients","visit","jaipur","engineering","office"],
    title: "j4",
    path: "/services",
    benefits: "Yes! We welcome international clients to visit our Jaipur engineering headquarters for in-person strategy workshops and technical sprints.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j5",
    keywords: ["what timezone does the jaipur engineering team operate in","timezone jaipur engineering team","engineering team operate","timezone","jaipur","engineering","team","operate"],
    title: "j5",
    path: "/services",
    benefits: "Our Jaipur team operates on IST (Indian Standard Time) with dedicated overlapping coverage windows for US (EST/PST) and European (GMT/CET) business hours.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j6",
    keywords: ["how do i schedule a 15-minute discovery call with the team","schedule 15minute discovery call","discovery call team","schedule","15minute","discovery","call","team"],
    title: "j6",
    path: "/services",
    benefits: "You can schedule a 15-minute discovery call instantly by clicking 'Book Call' or submitting your details on our Contact Us page.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j7",
    keywords: ["what time slots are available for demo calls tomorrow","time slots available demo","demo calls tomorrow","time","slots","available","demo","calls","tomorrow"],
    title: "j7",
    path: "/services",
    benefits: "Discovery call slots are available daily between 9 AM and 8 PM IST (or equivalent US/EU times). Click 'Book Call' to pick your preferred slot.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j8",
    keywords: ["how fast does the converseai team respond to contact inquiries","fast converseai team respond","respond contact inquiries","fast","converseai","team","respond","contact","inquiries"],
    title: "j8",
    path: "/services",
    benefits: "Our team responds to all contact inquiries within 2 business hours (and under 15 minutes during active business hours).",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j9",
    keywords: ["can i request a custom live demo for my business","request custom live demo","live demo business","request","custom","live","demo","business"],
    title: "j9",
    path: "/services",
    benefits: "Yes! We provide tailored live demos showcasing AI Voice Agents or WhatsApp Chatbots customized specifically to your industry.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j10",
    keywords: ["what details are needed to book a consultation session","details needed book consultation","book consultation session","details","needed","book","consultation","session"],
    title: "j10",
    path: "/services",
    benefits: "Just your name, business email or phone number, and a brief note on the AI solution you are interested in exploring.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j11",
    keywords: ["can i speak directly with an ai solution architect","speak directly solution architect","directly solution architect","speak","directly","solution","architect"],
    title: "j11",
    path: "/services",
    benefits: "Yes! All discovery calls are conducted directly by a senior AI Solution Architect, not junior sales reps.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j12",
    keywords: ["where can i find converseai office address and contact info","where find converseai office","address contact info","where","find","converseai","office","address","contact","info"],
    title: "j12",
    path: "/services",
    benefits: "You can find complete office addresses, contact numbers, and email details at `/contact-us`.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j13",
    keywords: ["how do i submit a project inquiry on the contact page","submit project inquiry contact","inquiry contact page","submit","project","inquiry","contact","page"],
    title: "j13",
    path: "/services",
    benefits: "Navigate to `/contact-us`, fill in the simple form fields, and click Submit — our team will reach out within 2 hours.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j14",
    keywords: ["does converseai offer remote video call consultations","converseai offer remote video","video call consultations","converseai","offer","remote","video","call","consultations"],
    title: "j14",
    path: "/services",
    benefits: "Yes! We conduct remote video consultations via Google Meet or Zoom for clients worldwide.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j15",
    keywords: ["what happens after i submit the contact us form","happens after submit contact","submit contact form","happens","after","submit","contact","form"],
    title: "j15",
    path: "/services",
    benefits: "An AI Solution Architect reviews your requirements, prepares initial project thoughts, and emails you to confirm a 15-minute discovery call.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j16",
    keywords: ["can i book a discovery call for ai voice agents specifically","book discovery call voice","voice agents specifically","book","discovery","call","voice","agents","specifically"],
    title: "j16",
    path: "/services",
    benefits: "Yes! You can select 'AI Voice Agents' as your topic of interest when booking a discovery call.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j17",
    keywords: ["can i book a discovery call for whatsapp ai chatbot","book discovery call whatsapp","call whatsapp chatbot","book","discovery","call","whatsapp","chatbot"],
    title: "j17",
    path: "/services",
    benefits: "Yes! You can select 'WhatsApp AI Chatbot' when scheduling your consultation.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j18",
    keywords: ["can i book a discovery call for agentic automation","book discovery call agentic","call agentic automation","book","discovery","call","agentic","automation"],
    title: "j18",
    path: "/services",
    benefits: "Yes! Select 'Agentic Process Automation' during call booking to speak with an automation specialist.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j19",
    keywords: ["can i book a discovery call for custom ai agent development","book discovery call custom","custom agent development","book","discovery","call","custom","agent","development"],
    title: "j19",
    path: "/services",
    benefits: "Yes! Choose 'Custom AI Agents' to discuss bespoke SDR, AR, or support agent development.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
  {
    id: "j20",
    keywords: ["how do i reach converseai customer support directly","reach converseai customer support","customer support directly","reach","converseai","customer","support","directly"],
    title: "j20",
    path: "/services",
    benefits: "You can reach customer support 24/7 via the Aira Voice Assistant on our website or by emailing `support@theconverseai.com`.",
    details: "We build productized AI solutions shipped in weeks with zero framework lock-in.",
    followUp: "Would you like to explore how this AI solution fits your business requirements?"
  },
];
