import type { VercelRequest, VercelResponse } from "@vercel/node";

const ZOHO_CLIENT_ID     = process.env.ZOHO_CLIENT_ID     || "1000.7R2UOJIZTS2UDP81TCPR60A3M90YQC";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "69f919727cfcaadbb9e7824920079501dbfc2ca09f";
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || "1000.aa8c68797e55eae39eb7e588cee02975.f759505beaec5ef15040408c7e04726b";
const ZOHO_ACCOUNTS_URL  = process.env.ZOHO_ACCOUNTS_URL  || "https://accounts.zoho.in";
const ZOHO_API_URL       = process.env.ZOHO_API_URL       || "https://www.zohoapis.in";

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  if (!ZOHO_REFRESH_TOKEN) {
    throw new Error("Zoho refresh token is not configured");
  }

  const tokenParams = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id:     ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type:    "refresh_token",
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    tokenParams.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`Failed to refresh Zoho access token: ${data.error || response.statusText}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt    = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken!;
}

// ─── Helper: derive Zoho Lead_Source picklist value from channel/utm ───────
function deriveZohoLeadSource(
  channel: string,
  utm_source: string,
  utm_medium: string,
  form_source: string,
): string {
  const c = (channel || "").toLowerCase();
  const s = (utm_source || "").toLowerCase();
  const m = (utm_medium || "").toLowerCase();

  if (c.includes("whatsapp") || s === "whatsapp" || m === "chat") return "Chat";
  if (c.includes("facebook ads") || (s === "facebook" && m === "cpc")) return "Facebook";
  if (c.includes("instagram ads")) return "Facebook"; // Zoho doesn't have Instagram natively — use Facebook
  if (c.includes("google ads") || m === "cpc") return "Google AdWords"; // Zoho picklist label
  if (c.includes("linkedin")) return "External Referral";
  if (c.includes("email") || s === "brevo" || s === "newsletter") return "Email";
  if (c.includes("event") || s.includes("event") || s.includes("jjs")) return "Internal Seminar";
  if (c.includes("real estate") || s.includes("real-estate")) return "External Referral";
  if (c.includes("organic") || m === "organic") return "Web";
  if (c.includes("direct")) return "Web";
  if (form_source?.toLowerCase().includes("pricing")) return "Web";
  return "Web"; // default
}

// ─── Helper: map campaign/source to Segment ───────────────────────────────
function deriveSegment(
  region_hint: string,
  utm_source: string,
  utm_campaign: string,
  form_source: string,
): string {
  const haystack = `${region_hint} ${utm_source} ${utm_campaign} ${form_source}`.toLowerCase();
  if (haystack.includes("event") || haystack.includes("jjs")) return "Event Organizer";
  if (haystack.includes("real-estate") || haystack.includes("realestate")) return "Real Estate";
  if (haystack.includes("saas") || haystack.includes("tech")) return "SaaS / Tech";
  if (haystack.includes("enterprise")) return "Enterprise";
  return "";
}

// ─── Handler ──────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const {
      fullName      = "",
      email         = "",
      phone         = "",
      countryName   = "",
      plan          = "",
      addon         = "",
      message       = "",
      demo_date     = "",
      demo_time     = "",
      timezone      = "",
      thoughts      = "",
      form_source   = "Pricing Page - Book Demo Popup",
      partial_lead  = "false",
      // Attribution fields from utmTracker
      utm_source    = "",
      utm_medium    = "",
      utm_campaign  = "",
      utm_term      = "",
      utm_content   = "",
      utm_id        = "",
      gclid         = "",
      fbclid        = "",
      channel       = "",
      region_hint   = "",
      referrer      = "",
      landing_page  = "",
      page_url      = "",
    } = body;

    if (!ZOHO_REFRESH_TOKEN) {
      console.warn("Zoho CRM is pending refresh token configuration.");
      return res.status(200).json({ status: "pending_config", message: "Zoho CRM refresh token not yet active." });
    }

    const isPartialLead = partial_lead === "true";

    const accessToken = await getAccessToken();

    // ── Name parsing (Zoho strictly requires Last_Name) ──────────────────
    const cleanName = fullName.replace(/\(partial lead\)/gi, "").trim();
    let firstName = "";
    let lastName  = "Lead";

    if (cleanName && !["unknown", "unknown (partial lead)"].includes(cleanName.toLowerCase())) {
      const parts = cleanName.split(/\s+/);
      if (parts.length > 1) {
        firstName = parts.slice(0, -1).join(" ");
        lastName  = parts[parts.length - 1];
      } else {
        lastName = cleanName;
      }
    } else {
      lastName = isPartialLead ? "Partial Lead (Abandoned)" : "Lead";
    }

    // ── Plan / Addon display labels ────────────────────────────────────
    const PLAN_MAP: Record<string, string> = {
      Engage: "Engage Plan",
      Grow:   "Grow Plan (Most Popular)",
      Scale:  "Scale Plan",
      Unsure: "Not sure / Need sizing assistance",
    };

    const planDisplay = PLAN_MAP[plan]
      || (plan ? (plan.includes("Plan") ? plan : `${plan} Plan`) : "Grow Plan (Most Popular)");
    const addonDisplay = addon && addon !== "none" ? addon : "No add-on (Core plan only)";

    // ── Attribution / Channel derivation ──────────────────────────────
    const zohoLeadSource = deriveZohoLeadSource(channel, utm_source, utm_medium, form_source);
    const segment        = deriveSegment(region_hint, utm_source, utm_campaign, form_source);
    const region         = region_hint || (countryName?.toLowerCase() === "india" ? "India"
                           : countryName?.toLowerCase().includes("united states") ? "US" : "");

    // Lead_Source_Detail — custom field (picklist) if created in Zoho
    const leadSourceDetail = channel
      || (utm_source ? `${utm_source} / ${utm_medium}`.replace(/^\/|\/$/g, "") : form_source)
      || "Website Direct";

    // ── Description assembly ─────────────────────────────────────────
    const scheduleLine = demo_date
      ? `📅 Preferred Demo: ${demo_date} at ${demo_time || "Flexible"} (${timezone || "Local Time"})`
      : null;

    const partialNotice = isPartialLead
      ? `⚠️ [PARTIAL LEAD / ABANDONED DROP-OFF]\nThis visitor entered their email on "${form_source}" but did not complete submission. Follow up promptly!\n----------------------------------------`
      : null;

    const sections = [
      partialNotice,
      scheduleLine,
      thoughts.trim()  ? `💭 Share your thoughts: ${thoughts.trim()}` : null,
      message.trim() && !message.includes("Visitor entered their email")
                       ? `🛠️ Workflows / CRM: ${message.trim()}` : null,
      `📋 Interested Plan: ${planDisplay}`,
      `🧩 Selected Add-on: ${addonDisplay}`,
      channel          ? `📡 Channel: ${channel}` : null,
      countryName      ? `📍 Country: ${countryName}` : null,
      region           ? `🌍 Region: ${region}` : null,
      segment          ? `🏷️ Segment: ${segment}` : null,
      landing_page || page_url ? `🔗 Landing: ${landing_page || page_url}` : null,
      utm_source       ? `UTM Source: ${utm_source}` : null,
      utm_medium       ? `UTM Medium: ${utm_medium}` : null,
      utm_campaign     ? `UTM Campaign: ${utm_campaign}` : null,
      utm_term         ? `UTM Term: ${utm_term}` : null,
      utm_content      ? `UTM Content: ${utm_content}` : null,
      gclid            ? `Google Click ID: ${gclid}` : null,
      fbclid           ? `Facebook Click ID: ${fbclid}` : null,
      referrer         ? `Referrer: ${referrer}` : null,
    ].filter(Boolean);

    const description = sections.join("\n\n");

    // ── Safe field values ─────────────────────────────────────────────
    // Website: Zoho enforces valid URL syntax
    const formattedWebsite = demo_date
      ? `https://converseai.com/demo?slot=${demo_date}_${encodeURIComponent(demo_time || "flexible")}`
      : (landing_page && landing_page.startsWith("http") ? landing_page : undefined);

    // Fax: max 30 characters in Zoho standard field
    const formattedFax = thoughts.trim()
      ? thoughts.trim().substring(0, 30)
      : undefined;

    // Lead_Source_Detail for custom Zoho field (first 255 chars)
    const leadSourceDetailTrimmed = leadSourceDetail.substring(0, 255);

    // In user's Zoho CRM layout:
    // - Field "Interested Plan" is mapped to Industry (Product Interest)
    // - Field "Select Add-on" is mapped to Lead_Source (Service Interest)
    // - Field "Lead Source Detail" is mapped to Skype_ID (Traffic Channel)
    // - Field "Rating" is mapped to Rating (Hot Lead / Warm Lead / Partial Lead)
    // - Field "Role or challenge" is mapped to Designation (Product & Service Summary)
    const serviceInterest = addon && addon !== "none" ? addon : "Core Plan / Standard Service";

    // ── Derive Rating (Clean text without emojis so Zoho CRM never renders ?) ───
    const leadRating = isPartialLead
      ? "Partial Lead"
      : (demo_date || form_source.toLowerCase().includes("pricing") ? "Hot Lead" : "Warm Lead");

    // ── Generate Native Tags ──────────────────────────────────────────
    const leadTags: { name: string }[] = [];
    if (isPartialLead) {
      leadTags.push({ name: "Partial Lead" });
    } else if (demo_date || form_source.toLowerCase().includes("pricing")) {
      leadTags.push({ name: "Hot Lead" });
    }
    if (channel && channel !== "Direct / Organic") {
      leadTags.push({ name: channel.replace(/[^a-zA-Z0-9 ]/g, "").trim().substring(0, 25) });
    }
    if (serviceInterest && serviceInterest !== "Core Plan / Standard Service") {
      leadTags.push({ name: serviceInterest.substring(0, 25) });
    }

    // ── Compose Zoho lead payload ─────────────────────────────────────
    const leadData: Record<string, any> = {
      First_Name:  firstName,
      Last_Name:   lastName,
      Email:       email,
      Phone:       phone,

      // Standard Zoho CRM fields repurposed for Free Edition
      Industry:    planDisplay,          // Product: "Interested Plan" (e.g. Grow Plan)
      Lead_Source: serviceInterest,      // Service: "Select Add-on" (e.g. AI voice agents)
      Designation: `Product: ${planDisplay} | Service: ${serviceInterest}`, // "Role or challenge"
      Description: description,
      Country:     countryName || undefined,
      Website:     formattedWebsite,
      Fax:         formattedFax,         // "Share your thoughts" (first 30 chars)

      // Repurposed standard fields (mapped in Phase 2 for Free Edition)
      Rating:      leadRating,           // "Rating" (Hot Lead / Warm Lead / Partial Lead)
      Skype_ID:    leadSourceDetailTrimmed || undefined, // "Lead Source Detail" (WhatsApp Chat, FB Ads, etc.)
      Tag:         leadTags.length > 0 ? leadTags : undefined,

      // ── Custom Fields (if upgraded or custom) ────────────────────────
      Lead_Source_Detail:    leadSourceDetailTrimmed || undefined,
      Requirement_Interest:  addonDisplay !== "No add-on (Core plan only)" ? addonDisplay : undefined,
      Lead_Category:         leadRating,
      Segment:               segment || undefined,
      Region:                region || undefined,
      UTM_Source:            utm_source || undefined,
      UTM_Medium:            utm_medium || undefined,
      UTM_Campaign:          utm_campaign || undefined,
      Landing_Page_URL:      (landing_page || page_url) || undefined,

      // Demo scheduling (custom fields)
      Date_and_Time:         scheduleLine || undefined,
      Date_Time:             scheduleLine || undefined,
      Preferred_Date_Time:   scheduleLine || undefined,
      Preferred_Date:        demo_date || undefined,
      Preferred_Time:        demo_time || undefined,

      // Share your thoughts (custom multi-line field)
      Share_your_thoughts:   thoughts.trim() || undefined,
      Share_Your_Thoughts:   thoughts.trim() || undefined,
      Thoughts:              thoughts.trim() || undefined,
    };

    // Remove undefined keys so Zoho doesn't reject with type errors
    Object.keys(leadData).forEach(k => leadData[k] === undefined && delete leadData[k]);

    const leadPayload = {
      data:    [leadData],
      trigger: ["approval", "workflow", "blueprint"],
    };

    // ── First attempt: full payload ───────────────────────────────────
    let crmResponse = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
      method:  "POST",
      headers: {
        Authorization:  `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });

    let crmData = await crmResponse.json();

    // ── Fallback: if custom fields cause rejection, retry with safe standard-only payload ─
    if (!crmResponse.ok || crmData?.data?.[0]?.status === "error") {
      console.warn("Zoho CRM full payload failed, retrying with safe standard fields only:", JSON.stringify(crmData));

      const fallbackData: Record<string, any> = {
        First_Name:  firstName,
        Last_Name:   lastName,
        Email:       email,
        Phone:       phone,
        Industry:    planDisplay,
        Lead_Source: serviceInterest,
        Rating:      leadRating,
        Skype_ID:    leadSourceDetailTrimmed || undefined,
        Designation: `Product: ${planDisplay} | Service: ${serviceInterest}`,
        Description: description,
        Country:     countryName || undefined,
        Website:     formattedWebsite,
        Fax:         formattedFax,
      };
      Object.keys(fallbackData).forEach(k => fallbackData[k] === undefined && delete fallbackData[k]);

      const fallbackResponse = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
        method:  "POST",
        headers: {
          Authorization:  `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [fallbackData], trigger: ["approval", "workflow", "blueprint"] }),
      });

      const fallbackResult = await fallbackResponse.json();
      if (fallbackResponse.ok && fallbackResult?.data?.[0]?.status !== "error") {
        return res.status(200).json({ success: true, data: fallbackResult, fallback: true });
      }

      // Both attempts failed
      console.error("Zoho CRM fallback also failed:", fallbackResult);
      return res.status(500).json({ error: "Failed to create lead in Zoho CRM", details: fallbackResult });
    }

    return res.status(200).json({ success: true, data: crmData });

  } catch (error: any) {
    console.error("Zoho lead creation error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
