import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  initUTMCapture,
  getUTMData,
  getUTMPayload,
  fireLeadConversionEvent,
} from "../lib/utmTracker";

class StorageMock implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("utmTracker — Universal Attribution & Tracking Engine", () => {
  const originalLocation = window.location;
  let mockSessionStorage: StorageMock;
  let mockLocalStorage: StorageMock;

  beforeEach(() => {
    mockSessionStorage = new StorageMock();
    mockLocalStorage = new StorageMock();

    // Attach mock storage to window and globalThis (ensures bare localStorage works in Node 22)
    Object.defineProperty(window, "sessionStorage", {
      value: mockSessionStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      value: mockSessionStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // Reset document.referrer
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
      writable: true,
    });

    // Clean up analytics globals
    delete (window as any).gtag;
    delete (window as any).fbq;
    delete (window as any).clarity;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  function setWindowLocation(urlStr: string) {
    const parsed = new URL(urlStr);
    delete (window as any).location;
    window.location = {
      href: parsed.href,
      search: parsed.search,
      pathname: parsed.pathname,
      hostname: parsed.hostname,
    } as any;
  }

  // ── 1. First-Touch Capture & Persistence Across Navigation ──────────────

  describe("First-touch capture and session persistence", () => {
    it("captures UTM parameters from initial landing URL", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=rei-outreach&utm_medium=cold-outreach&utm_campaign=rei-oct-2026&utm_content=v1");

      initUTMCapture();

      const data = getUTMData();
      expect(data.utm_source).toBe("rei-outreach");
      expect(data.utm_medium).toBe("cold-outreach");
      expect(data.utm_campaign).toBe("rei-oct-2026");
      expect(data.utm_content).toBe("v1");
      expect(data.channel).toBe("Event / Conference Outreach");
      expect(data.landing_page).toContain("utm_source=rei-outreach");
    });

    it("preserves first-touch attribution when visitor navigates internally without UTMs", () => {
      // First touch: visitor arrives from an event outreach email
      setWindowLocation("https://theconverseai.com/?utm_source=rei-outreach&utm_medium=cold-outreach&utm_campaign=rei-oct-2026");
      initUTMCapture();

      // Second touch: visitor navigates internally to /pricing (no UTMs in query)
      setWindowLocation("https://theconverseai.com/pricing");
      initUTMCapture();

      // First-touch attribution MUST remain intact
      const data = getUTMData();
      expect(data.utm_source).toBe("rei-outreach");
      expect(data.utm_medium).toBe("cold-outreach");
      expect(data.utm_campaign).toBe("rei-oct-2026");
      expect(data.channel).toBe("Event / Conference Outreach");
    });
  });

  // ── 2. Missing UTM Parameters & Direct/Organic Fallback ──────────────────

  describe("Missing UTMs and Direct / Organic fallbacks", () => {
    it("classifies direct visitor with empty query and empty referrer as Direct / Organic", () => {
      setWindowLocation("https://theconverseai.com/");
      initUTMCapture();

      const data = getUTMData();
      expect(data.utm_source).toBe("");
      expect(data.utm_medium).toBe("");
      expect(data.channel).toBe("Direct / Organic");

      const payload = getUTMPayload();
      expect(payload.utm_source).toBe("Direct");
      expect(payload.utm_medium).toBe("N/A");
      expect(payload.utm_campaign).toBe("N/A");
      expect(payload.channel).toBe("Direct / Organic");
    });

    it("detects Google Organic when referrer is google.com and no UTMs exist", () => {
      Object.defineProperty(document, "referrer", {
        value: "https://www.google.com/",
        configurable: true,
      });
      setWindowLocation("https://theconverseai.com/");
      initUTMCapture();

      const data = getUTMData();
      expect(data.channel).toBe("Google Organic");
    });

    it("detects LinkedIn Organic when referrer is linkedin.com and no UTMs exist", () => {
      Object.defineProperty(document, "referrer", {
        value: "https://www.linkedin.com/",
        configurable: true,
      });
      setWindowLocation("https://theconverseai.com/");
      initUTMCapture();

      const data = getUTMData();
      expect(data.channel).toBe("LinkedIn Organic");
    });
  });

  // ── 3. Supported Channel & Source Mappings ───────────────────────────────

  describe("Channel mapping rules", () => {
    it("maps WhatsApp chat links correctly", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=whatsapp&utm_medium=chat");
      initUTMCapture();
      expect(getUTMData().channel).toBe("WhatsApp Chat");
    });

    it("maps Meta ads click id (fbclid) to Facebook Ads", () => {
      setWindowLocation("https://theconverseai.com/?fbclid=IwAR0xyz123456789");
      initUTMCapture();
      const data = getUTMData();
      expect(data.channel).toBe("Facebook Ads");
      expect(data.fbclid).toBe("IwAR0xyz123456789");
      expect(data.utm_source).toBe("facebook");
      expect(data.utm_medium).toBe("cpc");
    });

    it("maps Google Ads click id (gclid) to Google Ads", () => {
      setWindowLocation("https://theconverseai.com/?gclid=Cj0KCQjwxsmzBhC4ARIs");
      initUTMCapture();
      const data = getUTMData();
      expect(data.channel).toBe("Google Ads");
      expect(data.gclid).toBe("Cj0KCQjwxsmzBhC4ARIs");
      expect(data.utm_source).toBe("google");
      expect(data.utm_medium).toBe("cpc");
    });

    it("maps Brevo email campaigns to Email / Brevo", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=brevo&utm_medium=email&utm_campaign=newsletter-w1");
      initUTMCapture();
      expect(getUTMData().channel).toBe("Email / Brevo");
    });

    it("maps US Real Estate outreach correctly", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=real-estate&utm_medium=outreach&utm_campaign=fl-brokerages");
      initUTMCapture();
      const data = getUTMData();
      expect(data.channel).toBe("US Real Estate Outreach");
      expect(data.region_hint).toBe("US");
    });

    it("infers India region hint for JJS campaign", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=jjs-outreach&utm_medium=cold-outreach&utm_campaign=jjs-dec-2026");
      initUTMCapture();
      const data = getUTMData();
      expect(data.channel).toBe("Event / Conference Outreach");
      expect(data.region_hint).toBe("India");
    });
  });

  // ── 4. Error Handling & Malformed Stored Data Resilience ─────────────────

  describe("Storage error handling and resilience", () => {
    it("recovers gracefully from malformed JSON in sessionStorage", () => {
      mockSessionStorage.setItem("cai_utm", "{ not-valid-json ]");

      // Should not throw, should fall back to safe defaults
      const data = getUTMData();
      expect(data).toBeDefined();
      expect(data.channel).toBe("Direct / Organic");
    });

    it("returns safe defaults when storage throws an exception", () => {
      vi.spyOn(mockSessionStorage, "getItem").mockImplementation(() => {
        throw new Error("QuotaExceededError or SecurityError");
      });

      const data = getUTMData();
      expect(data).toBeDefined();
      expect(data.channel).toBe("Direct / Organic");
    });

    it("formats getUTMPayload with required fallback strings", () => {
      setWindowLocation("https://theconverseai.com/");
      initUTMCapture();

      const payload = getUTMPayload();
      expect(payload).toHaveProperty("utm_source", "Direct");
      expect(payload).toHaveProperty("utm_medium", "N/A");
      expect(payload).toHaveProperty("utm_campaign", "N/A");
      expect(payload).toHaveProperty("utm_term", "N/A");
      expect(payload).toHaveProperty("utm_content", "N/A");
      expect(payload).toHaveProperty("utm_id", "N/A");
      expect(payload).toHaveProperty("channel", "Direct / Organic");
      expect(payload).toHaveProperty("landing_page");
    });
  });

  // ── 5. Analytics Conversion Event Payloads (GA4, Meta, Clarity) ─────────

  describe("fireLeadConversionEvent payload construction", () => {
    it("dispatches enriched lead events to GA4 gtag, Meta fbq, and Clarity", () => {
      setWindowLocation("https://theconverseai.com/?utm_source=whatsapp&utm_medium=chat&utm_campaign=oct-support");
      initUTMCapture();

      const gtagMock = vi.fn();
      const fbqMock = vi.fn();
      const clarityMock = vi.fn();

      (window as any).gtag = gtagMock;
      (window as any).fbq = fbqMock;
      (window as any).clarity = clarityMock;

      fireLeadConversionEvent({
        form_name: "Book Demo Modal",
        plan: "Grow Plan",
        addon: "AI voice agents",
      });

      // Verify GA4 generate_lead call
      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "generate_lead",
        expect.objectContaining({
          form_name: "Book Demo Modal",
          lead_source: "WhatsApp Chat",
          plan: "Grow Plan",
          addon: "AI voice agents",
          channel: "WhatsApp Chat",
          utm_campaign: "oct-support",
          utm_medium: "chat",
        })
      );

      // Verify GA4 form_submit call
      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "form_submit",
        expect.objectContaining({
          form_name: "Book Demo Modal",
        })
      );

      // Verify Meta Pixel Lead call
      expect(fbqMock).toHaveBeenCalledWith("track", "Lead", {
        content_name: "Book Demo Modal",
        content_category: "Grow Plan",
        lead_source: "WhatsApp Chat",
      });

      // Verify Microsoft Clarity set tags
      expect(clarityMock).toHaveBeenCalledWith("set", "lead_source", "WhatsApp Chat");
      expect(clarityMock).toHaveBeenCalledWith("set", "lead_plan", "Grow Plan");
      expect(clarityMock).toHaveBeenCalledWith("set", "lead_form", "Book Demo Modal");
    });

    it("handles absence of analytics globals without throwing", () => {
      // No window.gtag, window.fbq, or window.clarity
      expect(() => {
        fireLeadConversionEvent({
          form_name: "Contact Us Form",
        });
      }).not.toThrow();
    });

    it("catches errors thrown by third-party analytics scripts gracefully", () => {
      (window as any).gtag = vi.fn().mockImplementation(() => {
        throw new Error("AdBlocker blocked gtag");
      });
      (window as any).fbq = vi.fn().mockImplementation(() => {
        throw new Error("Pixel script error");
      });
      (window as any).clarity = vi.fn().mockImplementation(() => {
        throw new Error("Clarity script error");
      });

      expect(() => {
        fireLeadConversionEvent({
          form_name: "Book Demo Modal",
        });
      }).not.toThrow();
    });
  });
});
