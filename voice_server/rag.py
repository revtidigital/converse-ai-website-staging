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

# ------------------------------------------------------------------
# Embedding Strategy (3-tier priority)
# ------------------------------------------------------------------
# 1. sentence-transformers (all-MiniLM-L6-v2) — 384-dim dense, fully local, no Ollama needed
# 2. Ollama embedding model (e.g. nomic-embed-text)
# 3. Improved TF-IDF fallback (512-dim normalized, much better than old 64-dim)
# ------------------------------------------------------------------

_sentence_transformer_model = None
_sentence_transformer_available = False


def _try_load_sentence_transformer():
    """
    Attempt to load sentence-transformers all-MiniLM-L6-v2 at startup.
    This is a lightweight (80MB), highly accurate local embedding model.
    pip install sentence-transformers>=2.7.0
    """
    global _sentence_transformer_model, _sentence_transformer_available
    try:
        from sentence_transformers import SentenceTransformer
        model_name = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
        _sentence_transformer_model = SentenceTransformer(model_name)
        _sentence_transformer_available = True
        logger.info(f"✅ sentence-transformers '{model_name}' loaded — 384-dim semantic RAG embeddings active.")
    except ImportError:
        logger.warning(
            "sentence-transformers not installed. "
            "Install with: pip install sentence-transformers>=2.7.0 "
            "for high-quality offline RAG embeddings."
        )
    except Exception as e:
        logger.warning(f"sentence-transformers load error: {e}. Will try Ollama embeddings.")


import os
_try_load_sentence_transformer()


def _sentence_transformer_embed(text: str) -> List[float]:
    """Generate embeddings using sentence-transformers (384-dim, fully local)."""
    embedding = _sentence_transformer_model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


async def generate_ollama_embedding(text: str) -> List[float]:
    """Generate dense vector embeddings using local Ollama model (e.g. nomic-embed-text / all-MiniLM)."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.post(
                f"{config.OLLAMA_BASE_URL}/api/embeddings",
                json={"model": config.EMBEDDING_MODEL, "prompt": text}
            )
            if res.status_code == 200:
                vec = res.json().get("embedding", [])
                if vec:
                    return vec
    except Exception:
        pass

    return []


def _improved_tfidf_fallback(text: str, vocab_size: int = 512) -> List[float]:
    """
    Improved TF-IDF fallback embedding (512-dim, L2-normalized).
    Much better than the old 64-dim sparse approach.
    Used only when both sentence-transformers and Ollama are unavailable.
    """
    import re
    import hashlib

    words = re.findall(r'\b[a-z0-9]+\b', text.lower())
    if not words:
        return [0.0] * vocab_size

    # TF (term frequency)
    tf: Dict[str, float] = {}
    for w in words:
        if len(w) > 2:
            tf[w] = tf.get(w, 0.0) + 1.0
    total = len(words) or 1.0
    for k in tf:
        tf[k] /= total

    # Hash each word into a deterministic bucket in the vocab
    vec = [0.0] * vocab_size
    for word, freq in tf.items():
        bucket = int(hashlib.md5(word.encode()).hexdigest(), 16) % vocab_size
        vec[bucket] += freq

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    vec = [v / norm for v in vec]
    return vec


async def get_embedding(text: str) -> List[float]:
    """
    Get the best available embedding for a text string.

    Priority:
      1. sentence-transformers all-MiniLM-L6-v2 (local, 384-dim, best quality)
      2. Ollama embedding model (requires Ollama running with embedding model pulled)
      3. Improved TF-IDF fallback (512-dim, L2-normalized, much better than old 64-dim)
    """
    # 1. sentence-transformers (best local option, no Ollama needed)
    if _sentence_transformer_available and _sentence_transformer_model is not None:
        try:
            loop = asyncio.get_event_loop()
            vec = await loop.run_in_executor(None, _sentence_transformer_embed, text)
            if vec:
                return vec
        except Exception as e:
            logger.warning(f"sentence-transformers embedding error: {e}")

    # 2. Ollama embedding model
    vec = await generate_ollama_embedding(text)
    if vec:
        return vec

    # 3. Improved TF-IDF fallback (512-dim, last resort)
    logger.warning("Using improved TF-IDF fallback embedding (sentence-transformers + Ollama both unavailable).")
    return _improved_tfidf_fallback(text, vocab_size=512)


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
    if _sentence_transformer_available:
        engine = "sentence-transformers"
    else:
        engine = f"ollama:{config.EMBEDDING_MODEL} / tfidf-512-fallback"
    logger.info(f"Building local vector embedding index using '{engine}'...")
    new_cache = []
    for chunk in SITEMAP_CHUNKS:
        vec = await get_embedding(chunk["title"] + " " + chunk["content"])
        new_cache.append({**chunk, "vec": vec})
    VECTOR_CACHE = new_cache
    logger.info(f"Successfully indexed {len(VECTOR_CACHE)} sitemap chunks into local vector store.")


async def query_semantic_vector_rag(query: str, threshold: float = 0.35) -> Optional[Dict[str, str]]:
    """Query local semantic vector embeddings RAG index."""
    if not VECTOR_CACHE:
        await build_vector_embeddings_index()

    q_vec = await get_embedding(query)
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
    embedding_engine = "sentence-transformers" if _sentence_transformer_available else f"ollama:{config.EMBEDDING_MODEL}"
    return {
        "status": "success",
        "job_progress": "100% completed",
        "total_chunks_indexed": len(VECTOR_CACHE),
        "embedding_engine": embedding_engine,
    }
