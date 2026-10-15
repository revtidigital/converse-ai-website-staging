/**
 * utmTracker.ts — Universal UTM & Attribution Capture
 * =====================================================
 * Captures UTM parameters, referrer info, WhatsApp tracking, and gclid/fbclid
 * from the landing URL, persists them in sessionStorage (survives page navigations
 * within a session, cleared when tab closes), and exposes helpers used by all
 * form submit flows to enrich Zoho CRM and Google Sheets payloads.
 *
 * Called once at app boot (main.tsx) via `initUTMCapture()`.
 */

export interface UTMData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  utm_id: string;
  gclid: string;
  fbclid: string;
  referrer: string;
  landing_page: string;
  /** Derived human-readable channel (e.g. "WhatsApp Chat", "Facebook Ads", "LinkedIn Organic") */
  channel: string;
  /** Derived region hint from UTM campaign / content keywords */
  region_hint: string;
}

const SESSION_KEY = "cai_utm";

// ─── Helpers ───────────────────────────────────────────────────────────────

function getParam(name: string, search?: string): string {
  try {
    const params = new URLSearchParams(search ?? window.location.search);
    return params.get(name)?.trim() ?? "";
  } catch {
    return "";
  }
}

/** Map utm_source / utm_medium to a clean channel label for Zoho */
function deriveChannel(source: string, medium: string, referrer: string, fbclid: string, gclid: string): string {
  const s = source.toLowerCase();
  const m = medium.toLowerCase();

  if (s === "whatsapp" || m === "chat" || m === "whatsapp") return "WhatsApp Chat";
  if (s === "instagram" || s === "ig") return m === "cpc" ? "Instagram Ads" : "Instagram Organic";
  if (s === "linkedin" || s === "li") return m === "cpc" ? "LinkedIn Ads" : "LinkedIn Organic";
  if (s === "facebook" || s === "fb" || fbclid) return m === "cpc" || fbclid ? "Facebook Ads" : "Facebook Organic";
  if (s === "google" || gclid) return m === "cpc" || gclid ? "Google Ads" : "Google Organic";
  if (m === "email" || s === "brevo" || s === "newsletter" || s === "mailchimp") return "Email / Brevo";
  if (s === "event" || m === "event" || s === "jjs" || s.includes("event")) return "Event / Conference Outreach";
  if (s === "real-estate" || s === "realestate" || m === "outreach") return "US Real Estate Outreach";
  if (referrer.includes("google")) return "Google Organic";
  if (referrer.includes("linkedin")) return "LinkedIn Organic";
  if (referrer.includes("instagram") || referrer.includes("fb.com") || referrer.includes("facebook")) return "Social Organic";
  if (s || m) return `${source} / ${medium}`.replace(/^\/|\/$/g, "").trim() || "Other";
  if (referrer && !referrer.includes(window.location.hostname)) return "Referral / Direct";
  return "Direct / Organic";
}

/** Infer region from campaign/content/source string keywords */
function deriveRegion(source: string, campaign: string, content: string): string {
  const haystack = `${source} ${campaign} ${content}`.toLowerCase();
  if (haystack.includes("us") || haystack.includes("usa") || haystack.includes("united-states") || haystack.includes("real-estate") || haystack.includes("realestate")) return "US";
  if (haystack.includes("india") || haystack.includes("in") || haystack.includes("jjs")) return "India";
  return "";
}

// ─── Core ──────────────────────────────────────────────────────────────────

/** Run once at page load. Captures UTM params and stores in sessionStorage. */
export function initUTMCapture(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite if already captured for this session
  const existing = sessionStorage.getItem(SESSION_KEY);
  const hasNewUtm = window.location.search.includes("utm_") ||
                    window.location.search.includes("gclid") ||
                    window.location.search.includes("fbclid");

  if (existing && !hasNewUtm) return; // preserve first-touch attribution

  const utm_source   = getParam("utm_source");
  const utm_medium   = getParam("utm_medium");
  const utm_campaign = getParam("utm_campaign");
  const utm_term     = getParam("utm_term");
  const utm_content  = getParam("utm_content");
  const utm_id       = getParam("utm_id");
  const gclid        = getParam("gclid");
  const fbclid       = getParam("fbclid");
  const referrer     = document.referrer || "";
  const landing_page = window.location.href;

  const channel     = deriveChannel(utm_source, utm_medium, referrer, fbclid, gclid);
  const region_hint = deriveRegion(utm_source, utm_campaign, utm_content);

  const data: UTMData = {
    utm_source:   utm_source  || (gclid ? "google"   : fbclid ? "facebook" : ""),
    utm_medium:   utm_medium  || (gclid ? "cpc"      : fbclid ? "cpc"      : ""),
    utm_campaign, utm_term, utm_content, utm_id,
    gclid, fbclid,
    referrer, landing_page,
    channel, region_hint,
  };

  // Also keep localStorage for legacy compatibility (submitContactForm still reads it)
  const legacyKeys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id"] as const;
  legacyKeys.forEach(k => { if (data[k]) localStorage.setItem(k, data[k]); });

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

/** Read captured UTM data. Returns safe empty defaults if nothing was captured. */
export function getUTMData(): UTMData {
  if (typeof window === "undefined") {
    return {
      utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "",
      utm_content: "", utm_id: "", gclid: "", fbclid: "",
      referrer: "", landing_page: "", channel: "Direct / Organic", region_hint: "",
    };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as UTMData;
  } catch { /* ignore parse errors */ }

  // Fallback: re-derive from localStorage (legacy)
  const utm_source   = localStorage.getItem("utm_source")   || "";
  const utm_medium   = localStorage.getItem("utm_medium")   || "";
  const utm_campaign = localStorage.getItem("utm_campaign") || "";
  const utm_term     = localStorage.getItem("utm_term")     || "";
  const utm_content  = localStorage.getItem("utm_content")  || "";
  const utm_id       = localStorage.getItem("utm_id")       || "";
  const channel      = deriveChannel(utm_source, utm_medium, document.referrer || "", "", "");

  return {
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
    gclid: "", fbclid: "", referrer: document.referrer || "",
    landing_page: window.location.href, channel, region_hint: "",
  };
}

/**
 * Returns a flat object ready to merge into any Zoho CRM or Sheets payload.
 * Keys match the Zoho custom field API names defined in Phase 2.
 */
export function getUTMPayload(): Record<string, string> {
  const d = getUTMData();
  return {
    utm_source:    d.utm_source    || "Direct",
    utm_medium:    d.utm_medium    || "N/A",
    utm_campaign:  d.utm_campaign  || "N/A",
    utm_term:      d.utm_term      || "N/A",
    utm_content:   d.utm_content   || "N/A",
    utm_id:        d.utm_id        || "N/A",
    gclid:         d.gclid,
    fbclid:        d.fbclid,
    referrer:      d.referrer,
    landing_page:  d.landing_page  || "",
    channel:       d.channel       || "Direct / Organic",
    region_hint:   d.region_hint   || "",
  };
}

/**
 * Fire GA4 + Meta Pixel + Clarity enriched Lead conversion event.
 * Call this immediately after a successful form submission.
 */
export function fireLeadConversionEvent(params: {
  form_name: string;
  lead_source?: string;
  plan?: string;
  addon?: string;
  channel?: string;
  region?: string;
}): void {
  if (typeof window === "undefined") return;
  const utm = getUTMData();

  const enriched = {
    lead_source:  params.lead_source ?? utm.channel ?? "Direct",
    form_name:    params.form_name,
    plan:         params.plan ?? "",
    addon:        params.addon ?? "",
    channel:      params.channel ?? utm.channel,
    region:       params.region ?? utm.region_hint,
    utm_campaign: utm.utm_campaign,
    utm_medium:   utm.utm_medium,
    currency:     "INR",
    value:        1,
  };

  // GA4 — primary lead conversion event
  try {
    if ((window as any).gtag) {
      (window as any).gtag("event", "generate_lead", enriched);
      (window as any).gtag("event", "form_submit", enriched);
    }
  } catch (e) { console.warn("[UTMTracker] GA4 error:", e); }

  // Meta Pixel — standard Lead event
  try {
    if ((window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: params.form_name,
        content_category: params.plan ?? "Demo",
        lead_source: params.lead_source ?? utm.channel,
      });
    }
  } catch (e) { console.warn("[UTMTracker] Meta Pixel error:", e); }

  // Microsoft Clarity — custom tags (visible in session recordings)
  try {
    if ((window as any).clarity) {
      (window as any).clarity("set", "lead_source", utm.channel);
      (window as any).clarity("set", "lead_plan", params.plan ?? "");
      (window as any).clarity("set", "lead_form", params.form_name);
      if (utm.region_hint) (window as any).clarity("set", "region", utm.region_hint);
    }
  } catch (e) { console.warn("[UTMTracker] Clarity error:", e); }
}
