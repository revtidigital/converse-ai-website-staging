import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Phone, Mic, Volume2, Play, Square } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sampleCalls = [
  {
    id: "english-sdr",
    title: "English — SDR qualifying an inbound lead for a B2B SaaS",
    description: "Qualification, budget fit, and next-step booking for a SaaS demo.",
    lang: "en-US",
    script:
      "Hi there, this is Aria from ConverseAI. I can see you recently filled out our contact form — thanks for reaching out! I just have a couple of quick questions so I can point you to the right team. Are you looking to automate customer support conversations, or is the priority more on the sales side? Great. And roughly how many support or sales interactions does your team handle per month? Perfect — that puts you right in our sweet spot. I'd love to set up a 20-minute demo with one of our solutions engineers. Do you have availability Thursday at 2 PM, or would Friday morning work better for you? Fantastic. I'll send a calendar invite to the email on file. Looking forward to showing you what we can do. Have a great rest of your day!",
    transcript:
      "Agent greets the caller, confirms product interest from the form submission, asks two qualification questions (use case and volume), then books a demo slot. Warm, conversational tone throughout.",
    languageSchema: "en",
  },
  {
    id: "hindi-appointment",
    title: "Hindi — Appointment booking for a clinic",
    description: "Collects symptoms, suggests slots, and confirms appointment details in Hindi.",
    lang: "hi-IN",
    script:
      "नमस्ते, मैं HealthCare Clinic की तरफ से बोल रही हूं। क्या मैं आपसे दो मिनट बात कर सकती हूं? आपने हमारी वेबसाइट पर appointment request भेजी थी। आप किस doctor से मिलना चाहते हैं? General physician के लिए हमारे पास गुरुवार दोपहर 3 बजे और शुक्रवार सुबह 11 बजे का slot available है। कौन सा आपके लिए सुविधाजनक रहेगा? बहुत अच्छा। मैं गुरुवार 3 बजे आपका appointment confirm कर देती हूं। आपका नाम और date of birth confirm कर सकती हूं? धन्यवाद। आपके registered number पर confirmation SMS आ जाएगा। कोई और सहायता चाहिए?",
    transcript:
      "Agent greets in Hindi, confirms appointment request, asks for doctor preference, offers two available slots, collects confirmation details, and sends SMS confirmation. Polite and efficient tone.",
    languageSchema: "hi",
  },
  {
    id: "tamil-collections",
    title: "Tamil — Loan collections (early bucket, DLT-compliant)",
    description: "Gentle reminder call with compliant language and payment-link follow-up.",
    lang: "ta-IN",
    script:
      "வணக்கம், நான் FinCare-ஐ சார்ந்த Priya பேசுகிறேன். நான் உங்களிடம் ஒரு முக்கியமான விஷயம் பற்றி பேச விரும்புகிறேன். உங்கள் loan account-ல் இந்த மாதத்தின் EMI payment இன்னும் pending-ஆக இருக்கிறது. தொகை 4,500 ரூபாய். நீங்கள் இன்று அல்லது நாளை payment செய்ய முடியுமா? நாங்கள் UPI, net banking அல்லது payment link மூலம் ஏற்றுக்கொள்கிறோம். உங்கள் registered mobile-க்கு payment link அனுப்பட்டுமா? நன்றி. Link-ஐ 24 மணி நேரத்திற்குள் use செய்யுங்கள். வேறு ஏதாவது உதவி வேண்டுமா?",
    transcript:
      "Agent identifies caller, states the pending EMI amount, offers payment options, and sends a payment link. Compliant, non-aggressive tone as required for early-bucket collections.",
    languageSchema: "ta",
  },
  {
    id: "hinglish-d2c",
    title: "Hinglish — D2C order status and escalation",
    description: "Natural code-switching for order tracking, ETA updates, and quick resolution.",
    lang: "en-IN",
    script:
      "Hello! Main ShopEase ki taraf se Riya bol rahi hoon. Aapne hamare helpline pe call kiya tha regarding your order. Order number DO-7742 ke baare mein pooch rahi hain aap? Let me check that for you. Okay, so aapka order kal, yaani Wednesday ko 10 AM se 2 PM ke beech deliver hoga. Delivery partner ka naam Rakesh hai, aur unka number aapke registered mobile pe message ho jayega. Koi aur problem hai? Return ya exchange chahiye toh I can raise a request right now. Great. Is there anything else I can help you with? Have a nice day!",
    transcript:
      "Agent seamlessly switches between Hindi and English, confirms order details, shares ETA, offers escalation options. Natural Hinglish tone matching how urban Indian customers actually speak.",
    languageSchema: "en-IN",
  },
  {
    id: "spanish-real-estate",
    title: "Spanish — Real estate viewing booking",
    description: "Qualifies intent, budget, and schedules a property viewing in Spanish.",
    lang: "es-ES",
    script:
      "Hola, buenos días. Soy Sofía, agente virtual de PropertyFinder. Gracias por su interés en nuestras propiedades. ¿Busca para compra o para alquiler? Perfecto. ¿Tiene alguna zona en mente, o está abierto a opciones en distintos barrios? ¿Y cuál sería su presupuesto aproximado? Entendido. Tengo tres propiedades que encajan perfectamente con lo que busca. ¿Le gustaría agendar una visita este fin de semana? Tenemos disponibilidad el sábado a las 11 de la mañana o el domingo a las 5 de la tarde. ¿Cuál le viene mejor? Perfecto, queda confirmada la visita del sábado. Le enviaré los detalles por WhatsApp. ¡Hasta pronto!",
    transcript:
      "Agent qualifies the lead (buy vs rent, zone, budget), matches to listings, and books a weekend viewing. Natural, friendly Spanish tone with a clear close.",
    languageSchema: "es",
  },
];

const inboundAgents = [
  "24/7 reception and call qualification",
  "Appointment booking into your calendar (Calendly, Google, Outlook, HubSpot, Chili Piper)",
  "Tier-1 support (FAQs, order status, billing, account questions)",
  "Warm transfer to humans with full transcript + context",
];

const outboundAgents = [
  "Lead qualification at scale (BANT, MEDDIC, custom criteria)",
  "Appointment setting for sales teams",
  "Survey and NPS callbacks",
  "Collections (early-stage buckets with regulatory guardrails)",
  "Event reminders and confirmations",
];

const verticalAgents = [
  "Real estate: property inquiry qualification, viewing bookings",
  "Healthcare: appointment scheduling, reminders, intake (HIPAA-aware)",
  "Lending / BFSI: collections, document collection, application status (DLT/TRAI compliant)",
  "EdTech: lead qualification, admission counseling",
  "D2C / e-commerce: order status, abandoned cart recovery calls",
  "Dealerships / auto: test drive bookings, service reminders",
];

const comparisonRows = [
  {
    label: "Voice quality",
    converse: "Premium (ElevenLabs, Cartesia)",
    retell: "Premium",
    vapi: "Premium",
    bland: "Premium",
    synthflow: "Mid–Premium",
    bpo: "Human (variable)",
  },
  {
    label: "Latency",
    converse: "<800ms",
    retell: "<700ms",
    vapi: "<600ms",
    bland: "<1s",
    synthflow: "<1s",
    bpo: "Instant",
  },
  {
    label: "India languages (Hindi + regional)",
    converse: "Yes, with code-switching",
    retell: "Partial (Hindi only)",
    vapi: "Partial",
    bland: "Partial",
    synthflow: "Partial",
    bpo: "Native",
  },
  {
    label: "Hinglish code-switching",
    converse: "Yes",
    retell: "Limited",
    vapi: "Limited",
    bland: "No",
    synthflow: "No",
    bpo: "Native",
  },
  {
    label: "Telephony flexibility",
    converse: "Twilio, Exotel, Plivo, Knowlarity, Ozonetel",
    retell: "Twilio",
    vapi: "BYO (Twilio/Telnyx)",
    bland: "BYO",
    synthflow: "Limited",
    bpo: "N/A",
  },
  {
    label: "Compliance templates",
    converse: "TCPA, TRAI DLT, HIPAA-aware",
    retell: "TCPA",
    vapi: "TCPA",
    bland: "TCPA",
    synthflow: "TCPA",
    bpo: "Variable",
  },
  {
    label: "Done-for-you setup",
    converse: "Yes",
    retell: "No (DIY)",
    vapi: "No (DIY)",
    bland: "Partial",
    synthflow: "Partial",
    bpo: "N/A",
  },
];

const languageMatrix = [
  {
    language: "English",
    dialects: "US, UK, India, Australia",
    latency: "<800ms",
    codeSwitching: "Yes",
    compliance: "TCPA, DLT, HIPAA",
  },
  {
    language: "Hindi",
    dialects: "North Indian, Mumbai",
    latency: "<900ms",
    codeSwitching: "Yes (Hinglish)",
    compliance: "TRAI DLT",
  },
  {
    language: "Tamil",
    dialects: "Chennai, Madurai",
    latency: "<900ms",
    codeSwitching: "Yes",
    compliance: "TRAI DLT",
  },
  {
    language: "Telugu",
    dialects: "Hyderabad, Vizag",
    latency: "<900ms",
    codeSwitching: "Yes",
    compliance: "TRAI DLT",
  },
  {
    language: "Marathi",
    dialects: "Pune, Mumbai",
    latency: "<900ms",
    codeSwitching: "Yes",
    compliance: "TRAI DLT",
  },
  {
    language: "Kannada",
    dialects: "Bangalore",
    latency: "<950ms",
    codeSwitching: "Yes",
    compliance: "TRAI DLT",
  },
  {
    language: "Bengali",
    dialects: "Kolkata, Dhaka",
    latency: "<900ms",
    codeSwitching: "Yes",
    compliance: "TRAI DLT",
  },
  {
    language: "Spanish",
    dialects: "LatAm, Castilian",
    latency: "<800ms",
    codeSwitching: "Yes (Spanglish)",
    compliance: "TCPA",
  },
  {
    language: "Plus 15+",
    dialects: "Arabic, Portuguese, French, German, Japanese, etc.",
    latency: "<900ms",
    codeSwitching: "Partial",
    compliance: "Varies",
  },
];

const capabilityGroups = [
  {
    title: "Integrations",
    items: [
      "Salesforce, HubSpot, Zoho CRM, LeadSquared, Freshsales, Pipedrive",
      "Calendly, Google Calendar, Outlook, Chili Piper",
      "Zendesk, Freshdesk, custom REST APIs",
    ],
  },
  {
    title: "Telephony",
    items: ["Twilio, Exotel, Plivo, Knowlarity, Ozonetel — picked on cost and compliance, not vendor kickbacks"],
  },
  {
    title: "Compliance",
    items: ["TCPA (US), TRAI DLT (India), HIPAA-aware, DNC handling, call recording consent flows"],
  },
  {
    title: "Observability",
    items: ["Full transcripts, call recordings, sentiment analysis, outcome tracking, weekly reports"],
  },
];

const howItWorks = [
  {
    title: "Week 0 — Scoping call.",
    description: "Use case, language mix, call volume, integrations.",
  },
  {
    title: "Weeks 1–2 — Build & tune.",
    description: "Voice selection, script design, CRM integration, guardrails.",
  },
  {
    title: "Week 3 — Pilot.",
    description: "Live traffic on a subset of calls. Weekly review.",
  },
  {
    title: "Week 4+ — Scale.",
    description: "Full rollout. Ongoing tuning on real-world edge cases.",
  },
];

const whyConverse = [
  "India-native multilingual. Hindi + regional languages + Hinglish code-switching.",
  "No telephony lock-in. Twilio, Exotel, Plivo, Knowlarity — picked on cost and compliance, not vendor kickbacks.",
  "Compliance-first. TCPA and DLT templates built in.",
  "One agent, all channels. Voice + chat + WhatsApp share the same brain via our omnichannel layer.",
  "Outcome-linked pricing available. Pay per qualified lead or booked appointment on select engagements.",
];

const outcomes = [
  "Answer 100% of inbound calls in under 2 rings, 24/7, in 3+ languages",
  "1,000+ concurrent calls with zero hold time",
  "Qualify leads in 90 seconds and auto-book into the calendar",
  "Cut cost-per-qualified-lead by 70% vs. human SDRs",
  "Recover 15–25% more on early-stage collections buckets",
];

const faqs = [
  {
    question: "How much does an AI voice agent cost?",
    answer:
      "A one-time setup plus per-minute usage. At typical SMB volume (5,000 minutes/month), all-in cost is 60–80% less than a human SDR or BPO agent. Book a call and we'll scope it to your use case.",
  },
  {
    question: "Can AI voice agents speak Hindi and regional languages?",
    answer:
      "Yes — Hindi, Tamil, Telugu, Marathi, Kannada, Bengali, plus code-switching (Hinglish). This is where most US-built platforms fail; we've tuned for real Indian phone conversations.",
  },
  {
    question: "Will callers know it's a bot?",
    answer:
      "Most don't flag it within the first 30 seconds. Where regulation requires disclosure (some US states, certain industries), we build that into the opening line.",
  },
  {
    question: "Are AI voice agents legal for outbound calls?",
    answer:
      "Yes, with proper compliance. TCPA in the US, TRAI DLT in India, DNC registry checks, and consent capture. Built into every outbound agent by default.",
  },
  {
    question: "How natural do AI voice agents sound?",
    answer:
      "Very. Natural voices (ElevenLabs, Cartesia, PlayHT, OpenAI voices), sub-800ms latency, handles interruptions. Most callers don't realize they're talking to AI until they ask directly — try the live demo above.",
  },
  {
    question: "What happens when the agent can't answer?",
    answer:
      "Warm transfer to a human with full conversation transcript, caller intent, and CRM context. No one re-explains themselves.",
  },
  {
    question: "Which CRMs do you integrate with?",
    answer:
      "Salesforce, HubSpot, Zoho, LeadSquared, Freshsales, Pipedrive, Zendesk, Freshdesk — plus custom APIs for anything in-house.",
  },
  {
    question: "Can we use our existing telephony?",
    answer:
      "Almost always yes. Twilio, Exotel, Plivo, Knowlarity, Ozonetel, Vonage — we plug in where you are.",
  },
  {
    question: "AI voice agent vs IVR — what's the difference?",
    answer:
      "IVRs route calls via keypad menus (press 1 for...). AI voice agents converse — understand intent, answer questions, complete tasks, book calendars. IVRs frustrate callers; modern voice agents resolve.",
  },
];

const VoicePlayer = ({ script, lang }: { script: string; lang: string }) => {
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = lang;
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    utteranceRef.current = utterance;
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [script, lang]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  return (
    <button
      onClick={playing ? stop : play}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
        playing
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
      }`}
    >
      {playing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
      {playing ? "Stop" : "Play sample"}
    </button>
  );
};

const AIVoiceAgents = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://theconverseai.com/services/ai-voice-agents#service",
        name: "AI Voice Agents",
        description:
          "Human-sounding AI voice agents for inbound support, outbound qualification, appointment booking, and collections. Multilingual with Hindi + regional Indian languages.",
        serviceType: "AI calling agent services",
        provider: {
          "@type": "Organization",
          name: "ConverseAI",
          url: "https://theconverseai.com",
        },
        areaServed: ["India", "United States", "Global"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://theconverseai.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://theconverseai.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "AI Voice Agents",
            item: "https://theconverseai.com/services/ai-voice-agents",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      ...sampleCalls.map((sample) => ({
        "@type": "AudioObject",
        "@id": `https://theconverseai.com/services/ai-voice-agents#${sample.id}`,
        name: sample.title,
        description: sample.description,
        duration: "PT45S",
        contentUrl: `https://theconverseai.com${sample.audioSrc}`,
        inLanguage: sample.languageSchema,
        isPartOf: {
          "@id": "https://theconverseai.com/services/ai-voice-agents#service",
        },
      })),
    ],
  };

  return (
    <>
      <Helmet>
        <title>AI Voice Agents — 24/7 Multilingual Calling Bots | ConverseAI</title>
        <meta
          name="description"
          content="Human-sounding AI voice agents for inbound, outbound, support, and bookings. 24/7 in Hindi, English & regional languages. Hear a live demo."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="AI Voice Agents — 24/7 Multilingual Calling Bots | ConverseAI" />
        <meta
          property="og:description"
          content="Human-sounding AI voice agents for inbound, outbound, support, and bookings. 24/7 in Hindi, English & regional languages. Hear a live demo."
        />
        <link rel="canonical" href="https://theconverseai.com/services/ai-voice-agents" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <main id="main-content">
          <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-primary/15 via-violet/10 to-background">
            <div className="absolute top-16 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet/15 rounded-full blur-3xl" />
            <div className="container-tight relative z-10 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimatedSection>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">AI Voice Agents</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      AI voice agents that sound human. Work 24/7. Cost a fraction of an SDR.
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                      AI voice agents for business — inbound support, outbound qualification, appointment booking, collections.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      Drop your number. We'll call your phone in 60 seconds with a live AI voice agent built for your use case.
                      Natural voice. Sub-800ms latency. 20+ languages including Hindi, English, and regional Indian languages.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="h-12 w-full sm:w-64 bg-white/80 border-primary/20 focus:ring-primary"
                          aria-label="Phone number"
                        />
                        <Button variant="hero" size="lg" type="button" title="Hear it call me in 60 seconds">
                          Hear it call me in 60 seconds
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <a href="#sample-calls" className="mt-4 text-primary font-semibold inline-flex items-center gap-2 hover:underline text-sm">
                      Listen to sample calls ↓
                    </a>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-2xl" />
                    <div className="relative glass-card rounded-3xl p-8">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">ConverseAI Voice Agent</p>
                          <p className="text-xs text-mint flex items-center gap-1">
                            <span className="w-2 h-2 bg-mint rounded-full animate-pulse inline-block" />
                            Active call · 0:42
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs">👤</span>
                          </div>
                          <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                            I'd like to reschedule my appointment to Friday.
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Mic className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="bg-primary/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm border border-primary/20">
                            Of course! I have Friday at 10 AM or 2 PM available. Which works better for you?
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs">👤</span>
                          </div>
                          <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                            2 PM please.
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-mint/10 rounded-xl border border-mint/20">
                          <Volume2 className="w-4 h-4 text-mint flex-shrink-0" />
                          <div className="flex gap-0.5 items-end h-4">
                            {[3, 5, 8, 4, 7, 5, 3, 6, 4, 8, 5, 3].map((h, i) => (
                              <div key={i} className="w-1 bg-mint rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                          <span className="text-xs text-mint font-medium">Confirming Friday 2 PM...</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50 text-center">
                        <div><p className="text-lg font-bold text-primary">&lt;800ms</p><p className="text-xs text-muted-foreground">Latency</p></div>
                        <div><p className="text-lg font-bold text-violet">20+</p><p className="text-xs text-muted-foreground">Languages</p></div>
                        <div><p className="text-lg font-bold text-mint">24/7</p><p className="text-xs text-muted-foreground">Always on</p></div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section id="sample-calls" className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Sample calls</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    5 × 45-second clips, playable inline, with transcript toggle.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-6">
                {sampleCalls.map((sample) => (
                  <AnimatedSection key={sample.id}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{sample.title}</h3>
                      <p className="text-muted-foreground mb-4">{sample.description}</p>
                      <div className="mb-4">
                        <VoicePlayer script={sample.script} lang={sample.lang} />
                      </div>
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`${sample.id}-transcript`}>
                          <AccordionTrigger>Transcript</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">{sample.transcript}</p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.1}>
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Recording kit provided on request.
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <AnimatedSection>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The problem</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">40% of calls to SMBs go unanswered.</span> That's not a
                      staffing problem anymore. Human call centers are expensive, slow to scale, and limited to business
                      hours. IVRs are hated. Traditional voice bots sound robotic and drop calls on anything unexpected.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                      <span className="font-semibold text-foreground">
                        Hold times are a solved problem. Your callers just don't know it yet.
                      </span>
                    </p>
                    <p className="text-lg text-muted-foreground">
                      What's changed in 2026: sub-800ms latency, voices callers don't flag as AI, interruption handling,
                      real-time CRM and calendar integration, and 1,000+ concurrent calls with zero hold time.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-white/80">
                    <h3 className="text-2xl font-semibold mb-4">What’s changed in 2026</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Sub-800ms latency — you stop noticing it's AI
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Voices most callers don't flag as AI until asked directly
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Handles interruptions, accents, Hinglish code-switching
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        Integrates with your CRM, calendar, and helpdesk in real time
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-1" />
                        1,000+ concurrent calls with zero hold time
                      </li>
                    </ul>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What we build</h2>
                </div>
              </AnimatedSection>
              <div className="grid lg:grid-cols-3 gap-6">
                <AnimatedSection>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                    <h3 className="text-lg font-semibold mb-3">Inbound voice agents</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {inboundAgents.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.1}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                    <h3 className="text-lg font-semibold mb-3">Outbound voice agents</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {outboundAgents.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.2}>
                  <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                    <h3 className="text-lg font-semibold mb-3">Vertical-specific agents</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {verticalAgents.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How we compare</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Retell, Vapi, Bland are great platforms for teams with engineering resources to self-build. We're a
                    done-for-you shop with India-native multilingual as the wedge.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead></TableHead>
                      <TableHead>ConverseAI</TableHead>
                      <TableHead>Retell AI</TableHead>
                      <TableHead>Vapi</TableHead>
                      <TableHead>Bland AI</TableHead>
                      <TableHead>Synthflow / Air.ai</TableHead>
                      <TableHead>India BPO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                        <TableCell>{row.converse}</TableCell>
                        <TableCell>{row.retell}</TableCell>
                        <TableCell>{row.vapi}</TableCell>
                        <TableCell>{row.bland}</TableCell>
                        <TableCell>{row.synthflow}</TableCell>
                        <TableCell>{row.bpo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/15">
            <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xl font-semibold text-foreground">Want to hear our AI voice agent on your use case?</p>
                <p className="text-muted-foreground mt-1">We'll build a working demo for your scenario before you commit to anything.</p>
              </div>
              <Link to="/contact-us" className="shrink-0">
                <Button variant="default" size="lg" title="Request a live demo">
                  Request a live demo <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Language coverage matrix</h2>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <Table className="rounded-2xl overflow-hidden border border-border/60 bg-white/90">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Language</TableHead>
                      <TableHead>Dialects / variants</TableHead>
                      <TableHead>Avg latency</TableHead>
                      <TableHead>Code-switching</TableHead>
                      <TableHead>Compliance templates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {languageMatrix.map((row) => (
                      <TableRow key={row.language}>
                        <TableCell className="font-semibold text-foreground">{row.language}</TableCell>
                        <TableCell>{row.dialects}</TableCell>
                        <TableCell>{row.latency}</TableCell>
                        <TableCell>{row.codeSwitching}</TableCell>
                        <TableCell>{row.compliance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-br from-background via-secondary/20 to-background">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Capabilities</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {capabilityGroups.map((group) => (
                  <AnimatedSection key={group.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-3">{group.title}</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">How it works</h2>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {howItWorks.map((step) => (
                  <AnimatedSection key={step.title}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ConverseAI</h2>
                </div>
              </AnimatedSection>
              <div className="max-w-4xl mx-auto space-y-3 text-muted-foreground text-lg">
                {whyConverse.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container-tight">
              <AnimatedSection>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Outcomes you can expect</h2>
                </div>
              </AnimatedSection>
              <div className="grid md:grid-cols-2 gap-6">
                {outcomes.map((item) => (
                  <AnimatedSection key={item}>
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-6 h-full flex gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-secondary/20">
            <div className="container-tight">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">FAQs</h2>
              </AnimatedSection>
              <div className="space-y-6 max-w-4xl mx-auto">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-border/60 bg-white/90 p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-violet/10 to-background">
            <div className="container-tight text-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Hear it for yourself.</h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Drop your phone number. Our AI agent will call you in 60 seconds with a working demo built for your use
                  case.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="h-12 w-full sm:w-72 bg-white/80 border-primary/20 focus:ring-primary"
                    aria-label="Phone number for AI voice demo"
                  />
                  <Button variant="hero" size="lg" type="button" title="Call me">
                    Call me →
                  </Button>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <Link to="/contact-us" className="text-primary font-semibold inline-flex items-center gap-2 mt-6">
                  Contact us for a tailored quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </AnimatedSection>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AIVoiceAgents;
