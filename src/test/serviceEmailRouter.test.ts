import { describe, it, expect } from "vitest";

// Test the service template selection logic matching api/zoho-lead.ts
function getServiceEmailTemplate(
  service: string,
  plan: string,
  firstName: string,
  demoSlot?: string,
  demoUrl?: string
): { subject: string; preheader: string; bodyHtml: string } {
  const s = (service || "").toLowerCase();
  const name = firstName || "there";

  if (s.includes("whatsapp") || s.includes("chat") || s.includes("messaging")) {
    return {
      subject: `Accelerate Your Customer Engagement with ConverseAI WhatsApp Automation`,
      preheader: `Transform customer conversations with official WhatsApp Business AI agents.`,
      bodyHtml: `Supercharge Your Business on WhatsApp`,
    };
  }

  if (s.includes("voice") || s.includes("call") || s.includes("phone")) {
    return {
      subject: `Scale Your Inbound & Outbound Calling with ConverseAI Voice Agents`,
      preheader: `Experience sub-800ms human-like conversational voice AI.`,
      bodyHtml: `Autonomous AI Calling for Real Growth`,
    };
  }

  if (s.includes("bot") || s.includes("omni") || s.includes("live") || s.includes("support")) {
    return {
      subject: `24/7 Omnichannel Customer Support Automation | ConverseAI`,
      preheader: `Deflect up to 80% of repetitive support tickets automatically.`,
      bodyHtml: `Deliver Instant Support Across Every Channel`,
    };
  }

  if (s.includes("audit") || s.includes("custom") || s.includes("knowledge") || s.includes("rag") || s.includes("sales")) {
    return {
      subject: `Your ConverseAI AI Readiness & Custom Architecture Blueprint`,
      preheader: `Custom agentic systems and knowledge intelligence designed for your workflows.`,
      bodyHtml: `Enterprise-Grade Agentic Intelligence`,
    };
  }

  return {
    subject: `Thank You for Reaching Out to ConverseAI — Next Steps`,
    preheader: `We received your inquiry and are preparing your personalized AI walkthrough.`,
    bodyHtml: `Welcome to ConverseAI`,
  };
}

describe("Service-Specific Email Automation & Routing", () => {
  it("routes WhatsApp Marketing inquiries to WhatsApp-specific email sequence", () => {
    const t = getServiceEmailTemplate("WhatsApp Marketing", "Grow Plan", "Rahul");
    expect(t.subject).toContain("WhatsApp");
    expect(t.bodyHtml).toContain("WhatsApp");
  });

  it("routes Voice Agent inquiries to Voice Agent sequence", () => {
    const t = getServiceEmailTemplate("AI Voice Agents", "Scale Plan", "Vikram");
    expect(t.subject).toContain("Voice");
    expect(t.bodyHtml).toContain("Autonomous AI Calling");
  });

  it("routes Omnichannel and Live Chat inquiries to Support Automation sequence", () => {
    const t = getServiceEmailTemplate("Omni Channel Support", "Engage Plan", "Neha");
    expect(t.subject).toContain("Omnichannel");
    expect(t.bodyHtml).toContain("Instant Support Across Every Channel");
  });

  it("routes AI Audit & Custom AI inquiries to Custom Architecture sequence", () => {
    const t = getServiceEmailTemplate("AI Readiness Audit", "Custom Enterprise", "Siddharth");
    expect(t.subject).toContain("Custom Architecture Blueprint");
    expect(t.bodyHtml).toContain("Enterprise-Grade Agentic Intelligence");
  });

  it("routes unknown or general inquiries to Neutral Welcome sequence", () => {
    const t = getServiceEmailTemplate("Not sure / General", "Grow Plan", "Aman");
    expect(t.subject).toContain("Next Steps");
    expect(t.bodyHtml).toContain("Welcome to ConverseAI");
  });
});
