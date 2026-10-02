import type { VercelRequest, VercelResponse } from "@vercel/node";

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || "1000.7R2UOJIZTS2UDP81TCPR60A3M90YQC";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "69f919727cfcaadbb9e7824920079501dbfc2ca09f";
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || "1000.aa8c68797e55eae39eb7e588cee02975.f759505beaec5ef15040408c7e04726b";
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.in";

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
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`Failed to refresh Zoho access token: ${data.error || response.statusText}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken!;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const {
      fullName = "",
      email = "",
      phone = "",
      countryName = "",
      plan = "",
      addon = "",
      message = "",
      form_source = "Pricing Page - Book Demo Popup",
      utm_source = "",
      utm_medium = "",
      utm_campaign = "",
      page_url = "",
    } = body;

    if (!ZOHO_REFRESH_TOKEN) {
      console.warn("Zoho CRM is pending refresh token configuration.");
      return res.status(200).json({ status: "pending_config", message: "Zoho CRM refresh token not yet active." });
    }

    const accessToken = await getAccessToken();

    // Split name into First Name & Last Name (Zoho CRM requires Last_Name)
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : (fullName.trim() || "Lead");

    const description = [
      `Interested Plan: ${plan || "N/A"}`,
      `Selected Add-on: ${addon || "None"}`,
      `Country: ${countryName || "N/A"}`,
      `Message / Workflow: ${message || "N/A"}`,
      `Page: ${page_url || "Pricing"}`,
      utm_source ? `UTM Source: ${utm_source}` : null,
      utm_campaign ? `UTM Campaign: ${utm_campaign}` : null,
      utm_medium ? `UTM Medium: ${utm_medium}` : null,
    ].filter(Boolean).join("\n");

    const addonDisplay = addon && addon !== "none" ? addon : "No add-on (Core plan only)";
    const planDisplay = plan ? (plan.includes("Plan") ? plan : `${plan} Plan`) : "Grow Plan";

    const leadPayload = {
      data: [
        {
          First_Name: firstName,
          Last_Name: lastName,
          Email: email,
          Phone: phone,
          Lead_Source: addonDisplay,
          Select_Add_on: addonDisplay,
          Interested_Plan: planDisplay,
          Plan: planDisplay,
          Description: description,
          Country: countryName || undefined,
        },
      ],
      trigger: ["approval", "workflow", "blueprint"],
    };

    const crmResponse = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });

    const crmData = await crmResponse.json();

    if (!crmResponse.ok) {
      console.error("Zoho CRM error response:", crmData);
      return res.status(500).json({ error: "Failed to create lead in Zoho CRM", details: crmData });
    }

    return res.status(200).json({ success: true, data: crmData });
  } catch (error: any) {
    console.error("Zoho lead creation error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
