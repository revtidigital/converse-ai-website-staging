import time
import logging
from pydantic import BaseModel, Field
from typing import Optional, Dict

logger = logging.getLogger("voice_server.tools")

class LeadFormFields(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=8)
    email: Optional[str] = None
    service_interest: Optional[str] = "ai_voice_agents"
    budget_range: Optional[str] = "not_specified"
    user_confirmed: bool = Field(default=False, description="Requires explicit user confirmation before final submission")

def map_service_synonym(input_service: str) -> str:
    s_lower = input_service.lower()
    if any(k in s_lower for k in ["voice", "call", "phone", "ivr", "telephony"]):
        return "ai_voice_agents"
    if any(k in s_lower for k in ["whatsapp", "chat", "message"]):
        return "whatsapp_ai_chatbot"
    if any(k in s_lower for k in ["audit", "strategy", "roadmap"]):
        return "ai_strategy_audit"
    if any(k in s_lower for k in ["custom", "agent", "sdr", "ar"]):
        return "custom_ai_agents"
    if any(k in s_lower for k in ["integration", "crm", "erp", "salesforce"]):
        return "ai_integration"
    if any(k in s_lower for k in ["document", "knowledge", "sop", "pdf"]):
        return "knowledge_intelligence"
    if any(k in s_lower for k in ["sales", "outreach", "b2b"]):
        return "sales_ai"
    return "ai_voice_agents"

def detect_navigation_action(text: str) -> Optional[Dict[str, str]]:
    """Low-risk tool: Page navigation intent matching"""
    t_lower = text.lower()
    if any(k in t_lower for k in ["stylemart", "retail case"]):
        return {"type": "navigate", "route": "/case-studies/retail-brand-whatsapp-automation", "risk": "low"}
    if any(k in t_lower for k in ["learnsphere", "edtech case"]):
        return {"type": "navigate", "route": "/case-studies/edtech-startup-chatbot-lead-generation", "risk": "low"}
    if any(k in t_lower for k in ["carefirst", "healthcare case"]):
        return {"type": "navigate", "route": "/case-studies/healthcare-clinic-omnichannel-support", "risk": "low"}
    if any(k in t_lower for k in ["case studies index", "all case studies"]):
        return {"type": "navigate", "route": "/case-studies", "risk": "low"}
    if any(k in t_lower for k in ["contact us page", "book demo page", "book call page"]):
        return {"type": "navigate", "route": "/contact-us", "risk": "low"}
    if any(k in t_lower for k in ["services page", "all services page"]):
        return {"type": "navigate", "route": "/services", "risk": "low"}
    return None

def process_high_risk_form_action(form_data: dict) -> Dict[str, any]:
    """
    High-risk tool: Form submission & Booking.
    Enforces user confirmation requirement before writing to database.
    """
    is_confirmed = form_data.get("user_confirmed", False)
    if not is_confirmed:
        return {
            "status": "requires_confirmation",
            "message": "Please confirm if you would like me to submit your contact details and book the 15-minute discovery call.",
            "form_summary": {
                "name": form_data.get("full_name"),
                "phone": form_data.get("phone"),
                "service": map_service_synonym(form_data.get("service_interest", "ai_voice_agents"))
            }
        }

    # Audit Logging for high-risk action
    logger.info(f"AUDIT_LOG [{time.strftime('%Y-%m-%d %H:%M:%S')}]: High-risk Form Submission APPROVED for service '{form_data.get('service_interest')}'")
    return {
        "status": "submitted",
        "message": "Your discovery call has been successfully scheduled!",
        "booking_id": f"BOOK-{int(time.time())}"
    }
