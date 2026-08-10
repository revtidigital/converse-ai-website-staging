import { AiraEngine } from "./src/components/VoiceAssistant/airaEngine.ts";
import fs from "fs";

const engine = new AiraEngine();

const domains = [
  {
    name: "Voice Telephony & IVR",
    questions: [
      "How does your AI voice agent handle caller accents in India?",
      "Can AI voice agents operate on toll-free 1800 numbers?",
      "What is the SIP trunk integration process for voice bots?",
      "How many simultaneous phone calls can one voice agent handle?",
      "Does the voice bot support call recording for compliance?",
      "Can the voice agent transfer a call to a human manager?",
      "What happens when a caller speaks both Hindi and English in one sentence?",
      "Can voice agents make automated outbound debt collection calls?",
      "Is there any latency delay when the voice agent answers a question?",
      "Does your telephony system support Twilio and Exotel integration?",
      "How does the voice bot recognize background noise vs human voice?",
      "Can we customize the voice agent tone and gender?",
      "What is the cost per minute for AI voice calls?",
      "Does the AI agent send SMS follow-ups after a call ends?",
      "Can voice agents book clinic appointments automatically?",
      "How does Silero VAD detect caller speech activity?",
      "Does the voice agent handle missed call campaigns?",
      "Can voice agents conduct customer satisfaction CSAT surveys?",
      "What is the maximum duration for a single voice call?",
      "How does the voice agent handle heavy IVR call volume spikes?"
    ]
  },
  {
    name: "WhatsApp Automation & Commerce",
    questions: [
      "Can WhatsApp bots send automated payment links to customers?",
      "What is the open rate for WhatsApp broadcast marketing campaigns?",
      "How do click-to-WhatsApp Facebook ads capture qualified leads?",
      "Can customers complete checkout directly inside WhatsApp?",
      "Does the WhatsApp bot integrate with Shopify store catalogs?",
      "How does abandoned cart recovery work on WhatsApp?",
      "Can WhatsApp bots handle multi-product list messages?",
      "Is official WhatsApp Business API approval included in the service?",
      "How many broadcast messages can we send per day on WhatsApp?",
      "Can WhatsApp chatbots handle customer return requests?",
      "Does the WhatsApp bot support interactive buttons and quick replies?",
      "How does human agent handoff work inside the WhatsApp chat window?",
      "Can WhatsApp bots send PDF invoices and receipt attachments?",
      "Is customer chat history saved in our CRM from WhatsApp?",
      "Can WhatsApp bots send automated order tracking updates?",
      "How does WhatsApp chatbot pricing compare to email marketing?",
      "Can WhatsApp bots qualify B2B SaaS leads automatically?",
      "Does the bot support multi-language WhatsApp conversations?",
      "How does the bot prevent spam blocks on WhatsApp Business API?",
      "Can WhatsApp bots trigger automated feedback requests after delivery?"
    ]
  },
  {
    name: "Back-Office Agentic Automation",
    questions: [
      "How does agentic process automation process PDF invoices?",
      "What is an Agentic 4-week sprint delivery process?",
      "Can AI agents handle accounts payable reconciliation automatically?",
      "How does vendor onboarding work with agentic workflows?",
      "Can AI agents triage IT support tickets automatically?",
      "How do agentic systems integrate with legacy SAP ERP systems?",
      "Can AI agents read unstructured contract documents?",
      "What is the error rate for automated financial reconciliation?",
      "Does agentic automation require human approval before payments?",
      "How much back-office operational cost can agentic bots save?",
      "Can AI agents automate monthly payroll processing?",
      "How do agentic bots handle exceptions in invoice workflows?",
      "Can AI agents extract data from scanned physical documents?",
      "What software tools can agentic bots interact with?",
      "Does agentic process automation replace traditional RPA tools?",
      "How fast can an agentic invoice bot be deployed live?",
      "Can agentic bots generate daily financial summary reports?",
      "How does security control user access in agentic workflows?",
      "Can agentic bots execute multi-step cross-platform tasks?",
      "What happens if an invoice has missing vendor details?"
    ]
  },
  {
    name: "Custom SDR & Sales AI Outreach",
    questions: [
      "How do custom SDR AI agents research prospect leads on LinkedIn?",
      "Can SDR agents send personalized cold emails automatically?",
      "How does the SDR agent score lead intent before booking a call?",
      "Can custom SDR agents integrate with Outreach and Salesloft?",
      "How does the SDR agent handle prospect negative replies?",
      "Can SDR agents book meetings directly into Google Calendar?",
      "What lead qualification frameworks do SDR agents use?",
      "Can custom SDR agents generate personalized video openers?",
      "How many prospect leads can an SDR AI agent research per hour?",
      "Does the SDR agent check for duplicate contacts in Salesforce?",
      "Can SDR agents handle multi-touch omni-channel campaigns?",
      "How does the SDR agent craft personalized value propositions?",
      "Can SDR agents research company news and funding rounds?",
      "What is the average reply rate for AI SDR outreach?",
      "Can we customize the tone and persona of our SDR AI agent?",
      "Does the SDR agent hand off hot leads to human AEs?",
      "How does the SDR agent avoid spam filter triggers on email?",
      "Can SDR agents draft tailored RFP response proposals?",
      "What data sources does the SDR agent use for lead enrichment?",
      "How long does it take to train a custom SDR AI agent?"
    ]
  },
  {
    name: "Document & Knowledge Intelligence",
    questions: [
      "How does private document AI read internal company SOPs?",
      "Can Knowledge Intelligence search legal contracts for specific clauses?",
      "Does the AI provide exact page citations for its answers?",
      "Can Knowledge Intelligence be hosted on private AWS servers?",
      "How does permission-aware AI restrict confidential HR data?",
      "Can the document AI parse 500-page technical PDF manuals?",
      "How fast does Knowledge Intelligence return answers from documents?",
      "Does the AI update its vector database when SOPs change?",
      "Can Knowledge Intelligence answer employee onboarding queries?",
      "Is client contract data kept 100% private in isolated clouds?",
      "Can Knowledge Intelligence integrate with Notion and Confluence?",
      "How does the vector RAG engine prevent AI hallucinations?",
      "Can Document AI compare two version revisions of a contract?",
      "What document formats are supported by Knowledge Intelligence?",
      "Does Knowledge Intelligence support multi-lingual document translation?",
      "How does Superadmin re-index knowledge after website updates?",
      "Can Document AI extract structured JSON tables from PDFs?",
      "Is there a file size limit for internal SOP uploads?",
      "How does Knowledge Intelligence enforce tenant data isolation?",
      "Can employees chat with company knowledge bases via Slack?"
    ]
  },
  {
    name: "CRM & Software Integrations",
    questions: [
      "How does ConverseAI integrate with Salesforce CRM?",
      "Can AI agents update contact deal stages in HubSpot automatically?",
      "Does ConverseAI support Zoho CRM and LeadSquared integration?",
      "How do AI agents connect with Zendesk for support tickets?",
      "Can AI agents sync data with internal REST API webhooks?",
      "Is Tally accounting software integration supported?",
      "How does real-time bi-directional CRM sync work?",
      "Can AI agents log call audio recordings into HubSpot contacts?",
      "What authentication protocols are used for API integrations?",
      "Does ConverseAI require replacing existing enterprise software?",
      "Can AI agents trigger automated Zapier or Make workflows?",
      "How does ConverseAI handle CRM API rate limits?",
      "Can AI agents create new leads in Pipedrive automatically?",
      "Is ServiceNow integration available for enterprise IT?",
      "How fast can a custom CRM API integration be built?",
      "Does ConverseAI provide custom webhook endpoints for callbacks?",
      "Can AI agents update inventory status in SAP ERP?",
      "How are integration errors logged and retried?",
      "Can AI agents read custom fields from Salesforce objects?",
      "Is multi-CRM sync supported for enterprise holding companies?"
    ]
  },
  {
    name: "Enterprise Security & Compliance",
    questions: [
      "Is ConverseAI fully SOC2 Type II compliant?",
      "How does ConverseAI satisfy HIPAA compliance requirements?",
      "Who owns 100% of the custom code, data, and IP assets?",
      "Do clients get isolated tenant cloud environments?",
      "Is client conversation data ever sold or used for training?",
      "What encryption standards are used for data in transit?",
      "How does ConverseAI handle GDPR data privacy requests?",
      "Are penetration testing reports available for enterprise clients?",
      "What physical and cloud security controls protect server data?",
      "Can AI models be deployed on-premise inside private data centers?",
      "Does ConverseAI sign Business Associate Agreements for healthcare?",
      "How are API keys and secret tokens managed securely?",
      "What is the system uptime SLA for enterprise deployments?",
      "How does disaster recovery failover work in cloud regions?",
      "Are administrative actions logged in audit security trails?",
      "How does role-based access control restrict admin permissions?",
      "What security headers protect ConverseAI web endpoints?",
      "Can enterprise security teams conduct vulnerability scans?",
      "How is PII data masked in voice and text transcripts?",
      "What compliance standards govern financial transaction bots?"
    ]
  },
  {
    name: "Pricing, Sprints & Engagement Model",
    questions: [
      "How much cheaper are ConverseAI solutions compared to US agencies?",
      "What is included in a 4-week fixed-fee Agent Sprint?",
      "Is the AI Strategy Audit fee credited toward the first build?",
      "Do you offer fixed-fee proposals with zero cost overruns?",
      "How long does a 3-week AI Strategy Audit engagement take?",
      "What is the proof-of-concept prototype delivery timeline?",
      "Are there any recurring hidden software licensing fees?",
      "How does ConverseAI structure client payment milestones?",
      "What is the cost of ongoing maintenance and agent tuning?",
      "Can companies upgrade their sprint scope during development?",
      "What ROI metrics can clients expect within 90 days?",
      "Do you offer dedicated account managers for enterprise clients?",
      "How does fixed-fee sprint pricing prevent budget creep?",
      "What happens after the initial 4-week agent deployment?",
      "Can SMB startups afford ConverseAI custom AI development?",
      "What is the cost comparison between AI agents and human staff?",
      "Are there discounts for annual enterprise service contracts?",
      "How do we request a custom project proposal?",
      "What is the refund policy if project milestones are delayed?",
      "Why choose ConverseAI over offshore contract developers?"
    ]
  },
  {
    name: "Case Studies & Verified Results",
    questions: [
      "How did StyleMart India achieve 3x repeat purchase revenue?",
      "What reduction in support costs did StyleMart report on WhatsApp?",
      "How did LearnSphere double student enrolments in 90 days?",
      "By how much did LearnSphere cut lead response time?",
      "How did CareFirst Clinics cut appointment no-shows by 55%?",
      "How many admin hours per month did CareFirst Clinics save?",
      "What results did B2B SaaS clients achieve with sales AI?",
      "Where can I read full client case studies on your website?",
      "Can ConverseAI share client references for healthcare AI?",
      "What retail fashion brands use ConverseAI WhatsApp bots?",
      "What edtech platforms use ConverseAI lead qualification?",
      "What healthcare networks use ConverseAI appointment voice bots?",
      "What back-office invoice savings did financial clients see?",
      "How did ConverseAI help a logistics company streamline support?",
      "What CSAT score improvement did real estate clients achieve?",
      "Can I view video walkthroughs of client case studies?",
      "What conversion rates do WhatsApp abandoned cart bots deliver?",
      "How fast did StyleMart see positive ROI after launch?",
      "What lead volume increase did edtech clients experience?",
      "Are case study metrics verified by independent clients?"
    ]
  },
  {
    name: "Jaipur Engineering Hub & Contact",
    questions: [
      "Where is ConverseAI core engineering team headquartered?",
      "Why is ConverseAI engineering hub located in Jaipur?",
      "How does Jaipur engineering deliver US-grade AI standards?",
      "Can international clients visit the Jaipur engineering office?",
      "What timezone does the Jaipur engineering team operate in?",
      "How do I schedule a 15-minute discovery call with the team?",
      "What time slots are available for demo calls tomorrow?",
      "How fast does the ConverseAI team respond to contact inquiries?",
      "Can I request a custom live demo for my business?",
      "What details are needed to book a consultation session?",
      "Can I speak directly with an AI solution architect?",
      "Where can I find ConverseAI office address and contact info?",
      "How do I submit a project inquiry on the Contact page?",
      "Does ConverseAI offer remote video call consultations?",
      "What happens after I submit the Contact Us form?",
      "Can I book a discovery call for AI Voice Agents specifically?",
      "Can I book a discovery call for WhatsApp AI Chatbot?",
      "Can I book a discovery call for Agentic Automation?",
      "Can I book a discovery call for Custom AI Agent Development?",
      "How do I reach ConverseAI customer support directly?"
    ]
  }
];

const results: { id: number; domain: string; question: string; answer: string }[] = [];
let id = 1;

for (const group of domains) {
  for (const q of group.questions) {
    const res = engine.processMessage(q);
    results.push({
      id: id++,
      domain: group.name,
      question: q,
      answer: res.reply
    });
  }
}

fs.writeFileSync("scratch_200_results.json", JSON.stringify(results, null, 2));
console.log(`✅ Successfully processed ${results.length} questions!`);
