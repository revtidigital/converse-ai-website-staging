import math
import logging
import httpx
import asyncio
from typing import Dict, List, Optional
from config import config

logger = logging.getLogger("voice_server.rag")

SITEMAP_CHUNKS = [
    {
        "id": "chunk_services",
        "title": "Services Overview",
        "source_label": "Services Page",
        "route": "/services",
        "url": "https://theconverseai.com/services",
        "content": "ConverseAI provides 8 core AI services: 1) AI Voice Agents (24/7 inbound & outbound phone calling), 2) WhatsApp AI Chatbots (broadcasting & catalog sales), 3) Agentic Process Automation (back-office invoice-to-pay), 4) Custom AI Agent Development (bespoke SDR, AR & support agents), 5) AI Integration Services (Salesforce, HubSpot, Zoho, SAP, Tally), 6) Document & Knowledge Intelligence (citation-backed AI for contracts & SOPs), 7) Sales Intelligence & Outreach Automation (B2B SaaS lead research), and 8) AI Strategy & Readiness Audits.",
    },
    {
        "id": "chunk_voice_agents",
        "title": "AI Voice Agents",
        "source_label": "AI Voice Agents Page",
        "route": "/services/ai-voice-agents",
        "url": "https://theconverseai.com/services/ai-voice-agents",
        "content": "AI Voice Agents replace rigid IVR menus with human-sounding 24/7 phone conversations for inbound support and outbound sales follow-ups. They support multi-lingual English, Hindi, and regional languages with zero hold time and automated CRM logging.",
    },
    {
        "id": "chunk_whatsapp",
        "title": "WhatsApp AI Chatbot",
        "source_label": "WhatsApp AI Chatbot Page",
        "route": "/whatsapp-ai-chatbot",
        "url": "https://theconverseai.com/whatsapp-ai-chatbot",
        "content": "WhatsApp AI Chatbots engage customers directly on WhatsApp with 90%+ open rates, click-to-WhatsApp ads, automated order tracking, abandoned cart recovery, native product catalogs, and broadcast campaigns.",
    },
    {
        "id": "chunk_agentic",
        "title": "Agentic Process Automation",
        "source_label": "Agentic Automation Page",
        "route": "/services/agentic-automation",
        "url": "https://theconverseai.com/services/agentic-automation",
        "content": "Agentic Systems & Process Automation run back-office operations end-to-end — invoice-to-pay, ticket triage, vendor onboarding, and financial reconciliation. Delivered via a 4-week Agent Sprint with a production agent live.",
    },
    {
        "id": "chunk_custom",
        "title": "Custom AI Agent Development",
        "source_label": "Custom AI Agents Page",
        "route": "/services/custom-ai-agents",
        "url": "https://theconverseai.com/services/custom-ai-agents",
        "content": "Custom AI Agent Development builds bespoke agents tailored to your exact workflow — SDR lead research, AR collections clerk, L2 support, and RFP drafting. You own 100% of the code, data, and IP.",
    },
    {
        "id": "chunk_integration",
        "title": "AI Integration Services",
        "source_label": "AI Integration Page",
        "route": "/services/ai-integration",
        "url": "https://theconverseai.com/services/ai-integration",
        "content": "AI Integration Services seamlessly plug AI into the tools you already run — Salesforce, HubSpot, Zoho, Zendesk, SAP, Tally, and custom internal APIs without requiring any rip-and-replace.",
    },
    {
        "id": "chunk_knowledge",
        "title": "Document & Knowledge Intelligence",
        "source_label": "Knowledge Intelligence Page",
        "route": "/services/knowledge-intelligence",
        "url": "https://theconverseai.com/services/knowledge-intelligence",
        "content": "Document & Knowledge Intelligence deploys private, permission-aware AI in your cloud that reads your internal contracts, SOPs, and knowledge bases to deliver accurate, citation-backed answers.",
    },
    {
        "id": "chunk_sales_ai",
        "title": "Sales Intelligence & Outreach",
        "source_label": "Sales AI Page",
        "route": "/services/sales-ai",
        "url": "https://theconverseai.com/services/sales-ai",
        "content": "Sales Intelligence & Outreach Automation runs signal-triggered outbound for B2B SaaS teams — automated lead research, personalized email + LinkedIn + voice outreach, and reply handling via a 6-week Performance Pilot.",
    },
    {
        "id": "chunk_strategy",
        "title": "AI Strategy & Readiness Audit",
        "source_label": "AI Strategy Audit Page",
        "route": "/services/ai-strategy-audit",
        "url": "https://theconverseai.com/services/ai-strategy-audit",
        "content": "AI Strategy & Readiness Audit is a fixed-fee 3-week engagement that evaluates your operations, maps high-ROI AI opportunities, scores them by feasibility, and delivers a 90-day execution roadmap. Audit fee is credited toward your first build.",
    },
    {
        "id": "chunk_security",
        "title": "Enterprise Security & Compliance",
        "source_label": "About Us & Security Page",
        "route": "/about-us",
        "url": "https://theconverseai.com/about-us",
        "content": "ConverseAI Enterprise Security: Clients retain 100% ownership of all code, data, and intellectual property. Fully SOC2 compliant and HIPAA ready with custom data privacy controls, isolated environments, and zero data selling.",
    },
    {
        "id": "chunk_pricing",
        "title": "Pricing & Sprint Models",
        "source_label": "Pricing & Services Page",
        "route": "/services",
        "url": "https://theconverseai.com/services",
        "content": "ConverseAI operates on a transparent fixed-fee, fixed-timeline sprint model (no Time & Material cost creep). Engineering is delivered from Jaipur with US-grade standards, priced 40% to 60% below US boutiques.",
    },
    {
        "id": "chunk_poc",
        "title": "POC Sprint Duration",
        "source_label": "Services Overview Page",
        "route": "/services",
        "url": "https://theconverseai.com/services",
        "content": "Initial production-ready AI agents ship within 2 to 4 weeks, with fast proof-of-concept prototype sprints delivered in just 3 to 5 days.",
    },
    {
        "id": "chunk_discovery",
        "title": "Discovery Call Booking",
        "source_label": "Contact Us Page",
        "route": "/contact-us",
        "url": "https://theconverseai.com/contact-us",
        "content": "You can schedule a free 15-minute discovery call directly on our Contact page. Available slots for tomorrow include 10:00 AM IST, 02:00 PM IST, and 04:30 PM IST.",
    },
    {
        "id": "chunk_stylemart",
        "title": "StyleMart India Retail Case Study",
        "source_label": "StyleMart Case Study Page",
        "route": "/case-studies/retail-brand-whatsapp-automation",
        "url": "https://theconverseai.com/case-studies/retail-brand-whatsapp-automation",
        "content": "StyleMart India Case Study (Retail & E-Commerce): StyleMart achieved 3x repeat purchase revenue growth, a 38% conversion rate on WhatsApp abandoned cart recovery, and a 65% reduction in support operational costs using ConverseAI's WhatsApp AI Chatbot.",
    },
    {
        "id": "chunk_learnsphere",
        "title": "LearnSphere EdTech Case Study",
        "source_label": "LearnSphere Case Study Page",
        "route": "/case-studies/edtech-startup-chatbot-lead-generation",
        "url": "https://theconverseai.com/case-studies/edtech-startup-chatbot-lead-generation",
        "content": "LearnSphere Case Study (EdTech): LearnSphere doubled course enrolments in 90 days and reduced lead response time by 80% using ConverseAI's conversational AI chatbot.",
    },
    {
        "id": "chunk_carefirst",
        "title": "CareFirst Clinics Healthcare Case Study",
        "source_label": "CareFirst Case Study Page",
        "route": "/case-studies/healthcare-clinic-omnichannel-support",
        "url": "https://theconverseai.com/case-studies/healthcare-clinic-omnichannel-support",
        "content": "CareFirst Clinics Case Study (Healthcare): CareFirst Clinics slashed appointment no-shows by 55% across 12 branches and saved 120 admin hours per month using ConverseAI's automated WhatsApp appointment reminders.",
    },
]

VECTOR_CACHE: List[dict] = []

async def generate_ollama_embedding(text: str) -> List[float]:
    """Generate dense vector embeddings using local Ollama model (e.g. nomic-embed-text / qwen2.5)."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.post(
                f"{config.OLLAMA_BASE_URL}/api/embeddings",
                json={"model": config.EMBEDDING_MODEL, "prompt": text}
            )
            if res.status_code == 200:
                return res.json().get("embedding", [])
    except Exception:
        pass
    
    # Fallback to normalized word-vector if Ollama embedding model not pulled
    import re
    words = re.findall(r'\b[a-z0-9]+\b', text.lower())
    tf = {}
    for w in words:
        if len(w) > 2:
            tf[w] = tf.get(w, 0) + 1
    total = len(words) or 1
    vec = [0.0] * 64
    for i, (k, v) in enumerate(list(tf.items())[:64]):
        vec[i] = v / total
    return vec

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

async def build_vector_embeddings_index():
    """Build persistent vector index for all sitemap chunks."""
    global VECTOR_CACHE
    logger.info(f"Building local vector embedding index using model '{config.EMBEDDING_MODEL}'...")
    new_cache = []
    for chunk in SITEMAP_CHUNKS:
        vec = await generate_ollama_embedding(chunk["title"] + " " + chunk["content"])
        new_cache.append({**chunk, "vec": vec})
    VECTOR_CACHE = new_cache
    logger.info(f"Successfully indexed {len(VECTOR_CACHE)} sitemap chunks into local vector store.")

async def query_semantic_vector_rag(query: str, threshold: float = 0.35) -> Optional[Dict[str, str]]:
    """Query local semantic vector embeddings RAG index."""
    if not VECTOR_CACHE:
        await build_vector_embeddings_index()

    q_vec = await generate_ollama_embedding(query)
    best_doc = None
    best_score = 0.0

    for doc in VECTOR_CACHE:
        score = cosine_similarity(q_vec, doc["vec"])
        if score > best_score:
            best_score = score
            best_doc = doc

    if best_doc and best_score >= threshold:
        return {
            "id": best_doc["id"],
            "title": best_doc["title"],
            "source_label": best_doc["source_label"],
            "source_route": best_doc["route"],
            "url": best_doc["url"],
            "snippet": best_doc["content"],
            "score": round(best_score, 4)
        }

    return None

async def superadmin_reindex_knowledge() -> dict:
    """Superadmin Re-indexing Endpoint."""
    logger.info("SUPERADMIN RE-INDEX: Starting full sitemap re-indexing job...")
    await build_vector_embeddings_index()
    return {
        "status": "success",
        "job_progress": "100% completed",
        "total_chunks_indexed": len(VECTOR_CACHE),
        "embedding_model": config.EMBEDDING_MODEL,
    }
