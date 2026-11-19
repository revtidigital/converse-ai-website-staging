import type { VercelRequest, VercelResponse } from "@vercel/node";

const ZOHO_CLIENT_ID     = process.env.ZOHO_CLIENT_ID     || "1000.7R2UOJIZTS2UDP81TCPR60A3M90YQC";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "69f919727cfcaadbb9e7824920079501dbfc2ca09f";
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || "1000.aa8c68797e55eae39eb7e588cee02975.f759505beaec5ef15040408c7e04726b";
const ZOHO_ACCOUNTS_URL  = process.env.ZOHO_ACCOUNTS_URL  || "https://accounts.zoho.in";
const ZOHO_API_URL       = process.env.ZOHO_API_URL       || "https://www.zohoapis.in";

// ─── Brevo Configuration ───────────────────────────────────────────────────
const BREVO_API_KEY      = process.env.BREVO_API_KEY      || "";
const LEAD_ALERT_EMAIL   = process.env.LEAD_ALERT_EMAIL   || "himanshu@theconverseai.com,contact@theconverseai.com";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@theconverseai.com";
const BREVO_SENDER_NAME  = process.env.BREVO_SENDER_NAME  || "Converse AI";

// ─── Google Sheets Real-Time Sync (Looker Studio Live Data Feed) ─────────────
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.VITE_STAGING_SHEET_SCRIPT_URL || "";

async function syncGoogleSheetLead(payload: {
  timestamp?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  plan?: string;
  source?: string;
  rating?: string;
  leadStatus?: string;
  landingPage?: string;
  utmCampaign?: string;
  referrer?: string;
  touchpointHistory?: string;
}) {
  if (!GOOGLE_SHEET_WEBHOOK_URL) return;
  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[GoogleSheet] Auto-sync webhook non-blocking error:", err);
  }
}

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

// ─── Brevo: Synchronize Contact into Brevo Contacts Database ──────────────
async function syncBrevoContact(info: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  plan?: string;
  channel?: string;
  rating?: string;
}) {
  if (!BREVO_API_KEY || !info.email) return;

  try {
    const payload = {
      email: info.email,
      attributes: {
        FIRSTNAME: info.firstName || "",
        LASTNAME:  info.lastName || "",
        SMS:       info.phone || "",
        COMPANY:   info.company || "",
        SERVICE_INTEREST: info.serviceInterest || "",
        PLAN:      info.plan || "",
        CHANNEL:   info.channel || "",
        RATING:    info.rating || "",
      },
      updateEnabled: true,
    };

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 204) {
      console.log(`[Brevo] Contact upserted successfully: ${info.email}`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn("[Brevo] Contact sync note:", res.status, err);
    }
  } catch (err) {
    console.warn("[Brevo] Contact sync network error:", err);
  }
}

// ─── Brevo: Luxury Responsive Email Renderer (Service-Specific) ───────────
interface LuxuryEmailConfig {
  recipientName: string;
  demoSlot?: string;
  preheader: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaUrl: string;
  simulation: {
    channelLabel: string;
    incomingMessage: string;
    agentLabel: string;
    checklist: string[];
    caption: string;
  };
  stats: Array<{ num: string; label: string }>;
  comparison: {
    sectionTitle: string;
    sectionSubtitle: string;
    leftTitle: string;
    leftPoints: string[];
    rightTitle: string;
    rightPoints: string[];
  };
  whyNow: {
    title: string;
    quoteBold: string;
    quoteNormal: string;
    takeaway: string;
    linkText: string;
    linkUrl: string;
  };
  whatWeBuild: {
    title: string;
    subtitle: string;
    pillars: Array<{
      title: string;
      desc: string;
      linkText: string;
      linkUrl: string;
    }>;
  };
  familiar: {
    title: string;
    bullets: string[];
    closingText: string;
    ctaText: string;
    ctaUrl: string;
  };
}

function renderLuxuryServiceEmail(config: LuxuryEmailConfig): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${config.heroHeadline}</title>
<style>
  body { margin:0; padding:0; background:#F5F3FF; -webkit-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  a { color:#7C3AED; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:22px !important; padding-right:22px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box !important; }
    .stack1 { margin-bottom:12px !important; }
    .gap { display:none !important; }
    .h1 { font-size:28px !important; line-height:34px !important; }
    .btn a { display:block !important; text-align:center !important; }
    .statnum { font-size:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F5F3FF;">

<!-- Preheader (hidden inbox preview text) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5F3FF;font-size:1px;line-height:1px;">
  ${config.preheader}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F3FF">
<tr><td align="center" style="padding:20px 10px;">

  <table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;">

    <!-- Top bar -->
    <tr>
      <td class="pad" style="padding:0 4px 14px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:21px;font-weight:bold;color:#7C3AED;">ConverseAI</td>
            <td align="right" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#6B6890;"><a href="https://theconverseai.com" style="color:#6B6890;text-decoration:underline;">View website</a></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO (violet gradient) -->
    <tr>
      <td bgcolor="#5B21B6" class="pad" style="background-color:#5B21B6;background-image:linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%);padding:44px 40px 36px 40px;border-radius:12px 12px 0 0;">
        <p style="margin:0 0 14px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#DDD6FE;">Hi ${config.recipientName},</p>
        <h1 class="h1" style="margin:0 0 16px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:34px;line-height:40px;font-weight:bold;color:#FFFFFF;letter-spacing:-0.5px;">${config.heroHeadline}</h1>
        <p style="margin:0 0 26px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#EDE9FE;">${config.heroSubheadline}</p>

        <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 34px auto;">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:8px;text-align:center;">
              <a href="${config.heroCtaUrl}" style="display:inline-block;padding:15px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;color:#5B21B6;text-decoration:none;text-align:center;">${config.heroCtaText}</a>
            </td>
          </tr>
        </table>

        <!-- Visual simulation card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#C4B5FD;padding:0 0 6px 0;">${config.simulation.channelLabel}</td>
          </tr>
          <tr>
            <td align="left" style="padding:0 0 16px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;">
                <tr>
                  <td bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:4px 14px 14px 14px;padding:12px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#2E1065;">${config.simulation.incomingMessage}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#C4B5FD;padding:0 0 6px 0;">${config.simulation.agentLabel}</td>
          </tr>
          <tr>
            <td bgcolor="#3B1580" style="background:#3B1580;border-radius:10px;padding:16px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${config.simulation.checklist.map(item => `
                  <tr>
                    <td width="24" valign="top" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#86EFAC;font-weight:bold;">&#10003;</td>
                    <td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:26px;color:#FFFFFF;">${item}</td>
                  </tr>
                `).join("")}
              </table>
            </td>
          </tr>
          <tr>
            <td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#C4B5FD;padding:8px 0 0 0;">${config.simulation.caption}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- STATS STRIP -->
    <tr>
      <td bgcolor="#4C1D95" style="background-color:#4C1D95;background-image:linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%);padding:20px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${config.stats.map(s => `
              <td align="center" width="25%" valign="top">
                <p class="statnum" style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:25px;line-height:30px;font-weight:bold;color:#FFFFFF;">${s.num}</p>
                <p style="margin:2px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#DDD6FE;">${s.label}</p>
              </td>
            `).join("")}
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td bgcolor="#FFFFFF" class="pad" style="background:#FFFFFF;padding:40px 40px 8px 40px;">

        <!-- Section: the difference -->
        <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#2E1065;">${config.comparison.sectionTitle}</h2>
        <p style="margin:0 0 20px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#3F3B5C;">${config.comparison.sectionSubtitle}</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 34px 0;">
          <tr>
            <td class="stack stack1" width="46%" valign="top" bgcolor="#F5F3FF" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:20px 20px;">
              <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;color:#6B6890;font-weight:bold;">${config.comparison.leftTitle}</p>
              ${config.comparison.leftPoints.map(p => `
                <p style="margin:0 0 8px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#6B6890;">${p}</p>
              `).join("")}
            </td>
            <td class="gap" width="8%" style="font-size:1px;line-height:1px;">&nbsp;</td>
            <td class="stack" width="46%" valign="top" bgcolor="#6D28D9" style="background-color:#6D28D9;background-image:linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%);border-radius:10px;padding:20px 20px;">
              <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;color:#FFFFFF;font-weight:bold;">${config.comparison.rightTitle}</p>
              ${config.comparison.rightPoints.map(p => `
                <p style="margin:0 0 8px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#FFFFFF;">${p}</p>
              `).join("")}
            </td>
          </tr>
        </table>

        <!-- Section: why now -->
        <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#2E1065;">${config.whyNow.title}</h2>
        <p style="margin:0 0 14px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#3F3B5C;"><strong style="color:#2E1065;">${config.whyNow.quoteBold}</strong> ${config.whyNow.quoteNormal}</p>
        <p style="margin:0 0 34px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#3F3B5C;">${config.whyNow.takeaway} <a href="${config.whyNow.linkUrl}" style="color:#7C3AED;font-weight:600;">${config.whyNow.linkText} &rarr;</a></p>

        <!-- Section: what we build -->
        <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#2E1065;">${config.whatWeBuild.title}</h2>
        <p style="margin:0 0 20px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#3F3B5C;">${config.whatWeBuild.subtitle}</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px 0;">
          ${config.whatWeBuild.pillars.map(pillar => `
            <tr>
              <td style="border-left:4px solid #7C3AED;padding:4px 0 4px 16px;">
                <p style="margin:0 0 4px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:23px;font-weight:bold;color:#2E1065;">${pillar.title}</p>
                <p style="margin:0 0 6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#3F3B5C;">${pillar.desc}</p>
                <a href="${pillar.linkUrl}" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:#7C3AED;text-decoration:none;">${pillar.linkText} &rarr;</a>
              </td>
            </tr>
            <tr><td style="font-size:1px;line-height:16px;">&nbsp;</td></tr>
          `).join("")}
        </table>

        <p style="margin:22px 0 34px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#6B6890;">Trusted by teams including Tata Motors, Zapp Loans, Mapsor and Readiprint.</p>
      </td>
    </tr>

    <!-- CLOSING PANEL (violet gradient) -->
    <tr>
      <td bgcolor="#5B21B6" class="pad" style="background-color:#5B21B6;background-image:linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%);padding:38px 40px 36px 40px;">
        <h2 style="margin:0 0 14px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#FFFFFF;">${config.familiar.title}</h2>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
          ${config.familiar.bullets.map(b => `
            <tr><td style="padding:10px 0;border-bottom:1px solid #7B52D6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#FFFFFF;">${b}</td></tr>
          `).join("")}
        </table>

        <p style="margin:0 0 22px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#EDE9FE;">${config.familiar.closingText}</p>

        <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px auto;">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:8px;text-align:center;">
              <a href="${config.familiar.ctaUrl}" style="display:inline-block;padding:16px 30px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;color:#5B21B6;text-decoration:none;text-align:center;">${config.familiar.ctaText}</a>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 18px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:#FFFFFF;">Team ConverseAI</p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="pad" style="padding:24px 12px 12px 12px;">
        <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;"><a href="mailto:contact@theconverseai.com" style="color:#6B6890;">contact@theconverseai.com</a>&nbsp;&nbsp;|&nbsp;&nbsp;+91-9982323333</p>
        <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;">
          <a href="https://www.linkedin.com/company/theconverseai" style="color:#7C3AED;">LinkedIn</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://www.instagram.com/theconverseai/" style="color:#7C3AED;">Instagram</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://www.facebook.com/61564130560658/" style="color:#7C3AED;">Facebook</a>
        </p>
        <p style="margin:0 0 6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;">You're receiving this because you connected with ConverseAI.</p>
        <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;"><a href="https://theconverseai.com/privacy-policy" style="color:#6B6890;text-decoration:underline;">Privacy Policy</a></p>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── Brevo: Service-Specific Email Template Generator ─────────────────────
export function getServiceEmailTemplate(
  service: string,
  plan: string,
  firstName: string,
  demoSlot?: string,
  demoUrl?: string
): { subject: string; preheader: string; bodyHtml: string; fullHtml: string } {
  const s = (service || "").toLowerCase();
  const name = firstName || "there";

  // Category 1: WhatsApp AI & Marketing
  if (s.includes("whatsapp") || s.includes("wa") || s.includes("chat") || s.includes("messaging")) {
    const subject = `WhatsApp AI agents for your business`;
    const preheader = `Transform customer conversations with official WhatsApp Business AI agents.`;
    const bodyHtml = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Supercharge Your Business on WhatsApp</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for your interest in <strong>ConverseAI WhatsApp AI Solutions</strong>. WhatsApp is where your customers already spend their time—and we help you convert that attention into revenue 24/7.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">What you get with ConverseAI WhatsApp AI:</h3>
        <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li><strong>Official WhatsApp Business Cloud API:</strong> Verified green tick eligibility & high throughput messaging.</li>
          <li><strong>Automated Lead Qualification & Booking:</strong> AI qualifies prospects, captures details, and books demos.</li>
          <li><strong>Interactive Catalog & Checkout:</strong> Send rich product carousels, payment links, and instant quotes.</li>
          <li><strong>Smart Human Handoff:</strong> Unified team inbox with live agent takeover whenever needed.</li>
        </ul>
      </div>
    `;

    const fullHtml = renderLuxuryServiceEmail({
      recipientName: name,
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: `Enhanced Conversations with WhatsApp AI Chatbots`,
      heroSubheadline: `Simplify customer queries with AI-driven WhatsApp automation, deliver personalized replies, and convert leads at scale 24/7.`,
      heroCtaText: `Explore WhatsApp AI`,
      heroCtaUrl: `https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=hero-cta`,
      simulation: {
        channelLabel: `Customer, on WhatsApp (10:15 PM)`,
        incomingMessage: `Hi, can you share the brochure for your premium plan and confirm pricing?`,
        agentLabel: `ConverseAI WhatsApp Agent, in 3 seconds`,
        checklist: [
          `Recognized customer query & verified contact profile`,
          `Dispatched interactive brochure PDF & pricing tiers`,
          `Offered instant slot for solutions architect walkthrough`,
          `Logged qualified lead in Zoho CRM & alerted sales team`,
        ],
        caption: `An illustrative example: 98% open rate, instant conversion, four tasks finished.`,
      },
      stats: [
        { num: "98%", label: "WhatsApp open rate" },
        { num: "60%", label: "faster response times" },
        { num: "24/7", label: "always-on engagement" },
        { num: "50+", label: "growing businesses" },
      ],
      comparison: {
        sectionTitle: `The difference, in 20 seconds`,
        sectionSubtitle: `A broadcast talks at people. An AI agent converses and closes. Same WhatsApp app, very different result.`,
        leftTitle: `Static Bulk WhatsApp Blasts`,
        leftPoints: [
          `One-way broadcast blasts that get blocked or ignored`,
          `Clunky menu trees that break on free-text questions`,
          `Requires manual copy-pasting from chat to CRM`,
        ],
        rightTitle: `ConverseAI WhatsApp Agents`,
        rightPoints: [
          `Two-way intelligent conversations understanding context`,
          `Interactive product catalogs, carousels & payment links`,
          `2-way real-time sync with Zoho CRM & Shopify`,
        ],
      },
      whyNow: {
        title: `Why WhatsApp is where business gets done in 2026`,
        quoteBold: `45%+ response rates and 98% open rates make WhatsApp the highest-converting communication channel.`,
        quoteNormal: `Gartner projects over 80% of customer interactions will occur on messaging platforms by 2026.`,
        takeaway: `Businesses using ConverseAI WhatsApp bots see 4x higher lead conversions than passive website forms.`,
        linkText: `Explore WhatsApp AI features`,
        linkUrl: `https://theconverseai.com/whatsapp-ai-chatbot`,
      },
      whatWeBuild: {
        title: `We build your WhatsApp agent. We manage the Meta Cloud API.`,
        subtitle: `Official WhatsApp Cloud API verification, catalog integration, and custom AI prompt tuning—handled start to finish.`,
        pillars: [
          {
            title: "Official WhatsApp Cloud API & green tick",
            desc: "Build instant trust with verified WhatsApp Business account setup, high messaging limits, and official Meta compliance.",
            linkText: "See Cloud API setup",
            linkUrl: "https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=row-api",
          },
          {
            title: "Automated qualification & booking",
            desc: "Qualify inbound leads conversationally, collect essential details, and book demos into your team's calendar 24/7.",
            linkText: "See lead qualification",
            linkUrl: "https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=row-qualification",
          },
          {
            title: "Interactive catalogs & checkouts",
            desc: "Send dynamic product carousels, instant price quotes, payment links, and order tracking right inside WhatsApp chat.",
            linkText: "See catalog features",
            linkUrl: "https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=row-catalog",
          },
          {
            title: "Unified team inbox with live handoff",
            desc: "Monitor live conversations, jump in with one-click human takeover, and sync all chat histories directly into Zoho CRM.",
            linkText: "See team inbox",
            linkUrl: "https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=row-inbox",
          },
        ],
      },
      familiar: {
        title: `Does any of this sound familiar?`,
        bullets: [
          `Inbound WhatsApp inquiries sit unread for hours during peak traffic or after 7 PM.`,
          `Website visitors drop off instead of filling out long, boring contact forms.`,
          `Sales reps spend hours manually answering repetitive pricing and catalog inquiries.`,
        ],
        closingText: `Nodded at even one? That's a strong first use case. Our free AI Opportunity Audit maps the ideal WhatsApp workflow and conversion funnel for your business.`,
        ctaText: `Get my free WhatsApp AI Strategy Audit`,
        ctaUrl: `https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=whatsapp-followup&utm_content=audit-cta`,
      },
    });

    return { subject, preheader, bodyHtml, fullHtml };
  }

  // Category 2: AI Voice Agents & Calling
  if (s.includes("voice") || s.includes("call") || s.includes("phone")) {
    const subject = `AI voice agents for your team`;
    const preheader = `Sub-800ms natural conversational AI for inbound reception, appointment booking & qualification.`;
    const bodyHtml = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Autonomous AI Calling for Real Growth</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for exploring <strong>ConverseAI Voice Agents</strong>. Phone calls represent the highest-intent channel for sales and urgent support. Our autonomous voice agents handle both inbound queries and outbound campaigns without human fatigue.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">Key Capabilities of ConverseAI Voice AI:</h3>
        <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li><strong>Ultra-Low Latency (<800ms):</strong> Truly natural, interruption-resilient conversations in English, Hindi & regional accents.</li>
          <li><strong>Instant Meeting Scheduling:</strong> Connects live to your calendar to book qualified appointments on the spot.</li>
          <li><strong>Live CRM Sync & Sentiment:</strong> Transcribes every call, extracts key entities, and updates Zoho CRM automatically.</li>
          <li><strong>10x Call Center Cost Savings:</strong> Scales up to thousands of simultaneous calls with zero wait times.</li>
        </ul>
      </div>
    `;

    const fullHtml = renderLuxuryServiceEmail({
      recipientName: name,
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: `AI voice agents that sound human. Work 24/7. Cost a fraction of an SDR.`,
      heroSubheadline: `Inbound support, outbound qualification, appointment booking, and collections in 20+ languages including Hindi & regional Indian languages.`,
      heroCtaText: `Hear live voice samples`,
      heroCtaUrl: `https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=hero-cta`,
      simulation: {
        channelLabel: `Inbound Call via Phone — +91 98XXX XXXXX (11:02 AM)`,
        incomingMessage: `Hi, I saw your property listing on Golf Course Road. Is a 3BHK available for a visit this Saturday?`,
        agentLabel: `ConverseAI Voice Agent, in <800ms`,
        checklist: [
          `Answered on 1st ring with zero hold time`,
          `Qualified buyer intent, budget fit & preferred timing`,
          `Booked calendar showing for Saturday 11:00 AM`,
          `Sent WhatsApp confirmation & updated CRM lead status`,
        ],
        caption: `An illustrative example: 0-second hold, sub-800ms latency, four tasks finished.`,
      },
      stats: [
        { num: "<800ms", label: "human-grade latency" },
        { num: "1,000+", label: "concurrent calls" },
        { num: "70%", label: "cost cut vs human SDRs" },
        { num: "24/7", label: "multilingual calling" },
      ],
      comparison: {
        sectionTitle: `The difference, in 20 seconds`,
        sectionSubtitle: `An IVR forces keypad menus. A ConverseAI voice agent converses naturally, answers questions, and completes tasks.`,
        leftTitle: `Traditional IVRs & Call Centers`,
        leftPoints: [
          `Frustrating keypad menus ("press 1 for sales...")`,
          `Long hold times during peak hours and dropped calls`,
          `High per-seat payroll, agent turnover & manual CRM logging`,
        ],
        rightTitle: `ConverseAI Voice Agents`,
        rightPoints: [
          `Sub-800ms natural conversation & interruption handling`,
          `Answers 100% of calls on 1st ring with zero hold time`,
          `Books calendars, sends SMS/WhatsApp & updates CRM live`,
        ],
      },
      whyNow: {
        title: `Why phone calls are your highest-converting channel`,
        quoteBold: `Phone calls carry 5x higher purchase intent than passive web visits.`,
        quoteNormal: `Yet over 38% of inbound business calls go completely unanswered or abandon on hold.`,
        takeaway: `Businesses using ConverseAI voice agents qualify inbound callers in 90 seconds and never miss an after-hours opportunity.`,
        linkText: `Explore our voice agent capabilities`,
        linkUrl: `https://theconverseai.com/services/ai-voice-agents`,
      },
      whatWeBuild: {
        title: `We build your voice agent. We run your telephony.`,
        subtitle: `From script architecture and custom voice tuning to telephony integration and CRM sync—fully done for you.`,
        pillars: [
          {
            title: "Inbound 24/7 reception & qualification",
            desc: "Answer every incoming call in under 2 rings, answer FAQs, and book meetings directly into your calendar.",
            linkText: "See inbound voice",
            linkUrl: "https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=row-inbound",
          },
          {
            title: "Outbound qualification at scale",
            desc: "Qualify leads in 90 seconds (BANT/MEDDIC criteria), conduct surveys, and run compliant early-stage collections.",
            linkText: "See outbound voice",
            linkUrl: "https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=row-outbound",
          },
          {
            title: "Hindi & regional code-switching",
            desc: "Tuned for real conversations in Hindi, Tamil, Telugu, Marathi, and Hinglish. Handles accents and interruptions naturally.",
            linkText: "See language support",
            linkUrl: "https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=row-languages",
          },
          {
            title: "Universal telephony & CRM write-back",
            desc: "Connects to Twilio, Exotel, Plivo, or Knowlarity. Syncs full call transcripts and summaries into Zoho CRM automatically.",
            linkText: "See telephony integrations",
            linkUrl: "https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=row-telephony",
          },
        ],
      },
      familiar: {
        title: `Does any of this sound familiar?`,
        bullets: [
          `High-intent inbound calls go to voicemail after hours or during peak surges.`,
          `SDRs spend 80% of their day dialing unanswered numbers instead of closing deals.`,
          `Call center attrition is high and training replacement agents takes months.`,
        ],
        closingText: `Nodded at even one? That's a strong first use case. Our free AI Voice Opportunity Audit maps the right script, telephony, and CRM workflow for your business.`,
        ctaText: `Get my free AI Voice Opportunity Audit`,
        ctaUrl: `https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=voice-agent-followup&utm_content=audit-cta`,
      },
    });

    return { subject, preheader, bodyHtml, fullHtml };
  }

  // Category 3: Conversational Chatbots & Omnichannel Customer Support
  if (s.includes("bot") || s.includes("omni") || s.includes("live") || s.includes("support")) {
    const subject = `24/7 support automation for your team`;
    const preheader = `Deflect up to 80% of repetitive support tickets automatically across all channels.`;
    const bodyHtml = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Deliver Instant Support Across Every Channel</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for reaching out regarding <strong>ConverseAI Omnichannel Support</strong>. Modern customers expect answers in seconds, whether on your website, WhatsApp, Instagram DMs, or email.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">Why high-growth teams choose ConverseAI:</h3>
        <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li><strong>80%+ Instant Deflection:</strong> AI resolves order tracking, FAQs, and sizing questions with zero human intervention.</li>
          <li><strong>Single Unified Inbox:</strong> Manage WhatsApp, Instagram, Live Chat, and Web conversations in one dashboard.</li>
          <li><strong>Seamless E-commerce & CRM Integration:</strong> Connects directly with Shopify, WooCommerce, and Zoho CRM.</li>
        </ul>
      </div>
    `;

    const fullHtml = renderLuxuryServiceEmail({
      recipientName: name,
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: `Deliver Instant Support Across Every Single Channel`,
      heroSubheadline: `Manage website chat, WhatsApp, Instagram, email, and mobile apps in one unified inbox with 80%+ instant tier-1 deflection.`,
      heroCtaText: `See Omnichannel Platform`,
      heroCtaUrl: `https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=hero-cta`,
      simulation: {
        channelLabel: `Customer, on Website Live Chat (9:45 PM)`,
        incomingMessage: `Hey, can I switch my subscription plan and get an invoice for last quarter?`,
        agentLabel: `ConverseAI Support Agent, in 4 seconds`,
        checklist: [
          `Authenticated customer account & verified subscription status`,
          `Processed plan upgrade & generated GST invoice PDF`,
          `Sent invoice directly in chat + dispatched email copy`,
          `Updated Zoho CRM & Zendesk ticket resolution records`,
        ],
        caption: `An illustrative example: 80%+ instant deflection, unified context across all channels.`,
      },
      stats: [
        { num: "80%+", label: "instant ticket deflection" },
        { num: "<60s", label: "average resolution time" },
        { num: "5+", label: "unified channels" },
        { num: "24/7", label: "continuous coverage" },
      ],
      comparison: {
        sectionTitle: `The difference, in 20 seconds`,
        sectionSubtitle: `Disjointed chat apps create chaos. A unified omnichannel AI agent keeps complete customer context in one place.`,
        leftTitle: `Fragmented Support Tools`,
        leftPoints: [
          `Agents tab-switching between WhatsApp, email, and web chat`,
          `Customers forced to repeat their issue on every channel`,
          `Unanswered tickets accumulating overnight and on weekends`,
        ],
        rightTitle: `ConverseAI Unified Support Agent`,
        rightPoints: [
          `One centralized inbox for Web, WhatsApp, Instagram & Email`,
          `Complete customer context preserved when switching channels`,
          `80%+ routine queries resolved instantly with zero human touch`,
        ],
      },
      whyNow: {
        title: `Why unified support is the new baseline`,
        quoteBold: `Over 73% of customers will switch to a competitor after multiple poor customer service experiences.`,
        quoteNormal: `Modern buyers expect sub-60-second resolution across whichever messaging platform they choose.`,
        takeaway: `Teams deploying ConverseAI omnichannel support cut ticket resolution times by 90% while lowering support costs.`,
        linkText: `See our omnichannel support architecture`,
        linkUrl: `https://theconverseai.com/omni-channel`,
      },
      whatWeBuild: {
        title: `We build your omnichannel support system. We keep it running.`,
        subtitle: `Integrate your website, WhatsApp, social channels, and ticketing stack into one intelligent AI engine.`,
        pillars: [
          {
            title: "Unified inbox across all channels",
            desc: "Manage website live chat, WhatsApp, Instagram DMs, and support email in one central dashboard without switching apps.",
            linkText: "See unified inbox",
            linkUrl: "https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=row-inbox",
          },
          {
            title: "Intelligent AI routing & ticket triage",
            desc: "Smart algorithms classify ticket urgency, sentiment, and language to route complex issues to the right human specialist.",
            linkText: "See AI routing",
            linkUrl: "https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=row-routing",
          },
          {
            title: "Seamless channel switching",
            desc: "Customers can start a conversation on your website and continue on WhatsApp without ever losing context or history.",
            linkText: "See channel switching",
            linkUrl: "https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=row-switching",
          },
          {
            title: "E-commerce & CRM live synchronization",
            desc: "Direct integrations with Shopify, WooCommerce, Zoho CRM, Zendesk, and Freshdesk for real-time order lookups.",
            linkText: "See integrations",
            linkUrl: "https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=row-crm",
          },
        ],
      },
      familiar: {
        title: `Does any of this sound familiar?`,
        bullets: [
          `Support tickets pile up on weekends, leading to frustrated customer escalations.`,
          `Your support reps spend most of their day answering repetitive order and FAQ queries.`,
          `Conversations on WhatsApp and web chat are siloed with no shared customer history.`,
        ],
        closingText: `Nodded at even one? That's a strong first use case. Our free AI Opportunity Audit maps the exact deflection and omnichannel routing strategy for your support operations.`,
        ctaText: `Get my free Support Automation Audit`,
        ctaUrl: `https://theconverseai.com/omni-channel?utm_source=brevo-automated&utm_medium=email&utm_campaign=omnichannel-followup&utm_content=audit-cta`,
      },
    });

    return { subject, preheader, bodyHtml, fullHtml };
  }

  // Category 4: Agentic Process Automation (Multi-Step Workflows & Invoicing)
  if (s.includes("automation") || s.includes("agentic") || s.includes("process") || s.includes("workflow")) {
    const subject = `AI agents for your workflows`;
    const preheader = `Replace brittle RPA scripts with reasoning AI agents that execute complex workflows.`;
    const bodyHtml = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Autonomous Agentic Process Automation</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for exploring <strong>ConverseAI Agentic Process Automation</strong>. Brittle RPA scripts break whenever a layout shifts. We build autonomous agents that reason, adapt, and execute multi-step workflows inside your existing software stack.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">Key Capabilities of ConverseAI Agentic Automation:</h3>
        <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li><strong>Invoice-to-Pay Automation:</strong> Extract line items, 3-way match in SAP, and post ledger entries autonomously.</li>
          <li><strong>Cross-SaaS Multi-Step Orchestration:</strong> Connects ERP, bank feeds, Excel, Slack, and internal APIs.</li>
          <li><strong>Handles Messy Unstructured Data:</strong> Vision + LLM reasoning effortlessly parses PDFs, emails, and scans.</li>
          <li><strong>4-Week Production Sprint:</strong> Scoped, benchmarked against eval harness, and deployed in 4 weeks.</li>
        </ul>
      </div>
    `;

    const fullHtml = renderLuxuryServiceEmail({
      recipientName: name,
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: `Your chatbot answers. An AI agent gets it done.`,
      heroSubheadline: `Replace manual, multi-step workflows with autonomous agents that reason, decide, and act inside your existing software stack.`,
      heroCtaText: `See what we build`,
      heroCtaUrl: `https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=hero-cta`,
      simulation: {
        channelLabel: `Vendor Invoice Received via Accounts Email`,
        incomingMessage: `Please find attached Tax Invoice #INV-8891 for July IT consulting services ($14,200).`,
        agentLabel: `Agentic AI Workflow, executed in seconds`,
        checklist: [
          `Extracted 18 line items from PDF via vision reasoning`,
          `3-way matched against PO #4521 and Goods Receipt in SAP`,
          `Verified vendor bank details & routed manager Slack approval`,
          `Scheduled payment batch & closed open ledger entry`,
        ],
        caption: `An illustrative example: Zero manual copy-paste, autonomous end-to-end reconciliation.`,
      },
      stats: [
        { num: "4-Week", label: "production sprint" },
        { num: "10x", label: "faster workflow execution" },
        { num: "99.2%", label: "data extraction accuracy" },
        { num: "Zero", label: "manual copy-paste" },
      ],
      comparison: {
        sectionTitle: `The difference, in 20 seconds`,
        sectionSubtitle: `A chatbot talks. An agent works. Same chat window, very different result.`,
        leftTitle: `Brittle RPA & Manual Tasks`,
        leftPoints: [
          `Breaks whenever a PDF format or portal UI changes`,
          `Fails on messy unstructured data, emails, and receipts`,
          `40-60% of total automation cost spent fixing broken scripts`,
        ],
        rightTitle: `ConverseAI Agentic Systems`,
        rightPoints: [
          `LLM reasoning + deterministic tool execution`,
          `Natively understands messy PDFs, invoices, emails & scans`,
          `Adapts to UI/schema variations and escalates with context`,
        ],
      },
      whyNow: {
        title: `Why enterprise operations are shifting to agentic AI`,
        quoteBold: `40% of enterprise applications will feature task-specific AI agents by the end of 2026, up from under 5% in 2025.`,
        quoteNormal: `Gartner projects that agentic workflows will fundamentally automate operational back-offices.`,
        takeaway: `Operations leaders who deploy reasoning agents today cut back-office processing costs by 60%+ while eliminating bottlenecks.`,
        linkText: `Read about our agentic sprint methodology`,
        linkUrl: `https://theconverseai.com/services/agentic-automation`,
      },
      whatWeBuild: {
        title: `We build the agent. We run it too.`,
        subtitle: `You tell us the operational bottleneck. We scope it, build the agent, integrate with your stack, and guarantee accuracy.`,
        pillars: [
          {
            title: "Invoice-to-pay & finance automation",
            desc: "Automate invoice capture, 3-way matching, GL coding, approval routing, and direct ledger posting in SAP, Tally, or QuickBooks.",
            linkText: "See finance agents",
            linkUrl: "https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=row-finance",
          },
          {
            title: "Vendor onboarding & KYC verification",
            desc: "Extract data from messy vendor documents, run automated compliance checks, and provision accounts across your internal systems.",
            linkText: "See vendor onboarding",
            linkUrl: "https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=row-vendor",
          },
          {
            title: "Multi-system reconciliation & AR/AP",
            desc: "Reconcile payment gateways, bank feeds, ERP ledgers, and CRM records automatically, flagging discrepancies instantly.",
            linkText: "See reconciliation",
            linkUrl: "https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=row-reconciliation",
          },
          {
            title: "4-week fixed-timeline production sprint",
            desc: "One production-ready agent, complete eval harness, observability dashboard, and runbook delivered in 4 weeks.",
            linkText: "See sprint details",
            linkUrl: "https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=row-sprint",
          },
        ],
      },
      familiar: {
        title: `Does any of this sound familiar?`,
        bullets: [
          `Your operations team spends hours copying data between SAP, bank feeds, and Excel.`,
          `Approvals get buried in Slack and email threads, delaying vendor payments.`,
          `Fragile RPA bots break every time a supplier changes their invoice template.`,
        ],
        closingText: `Nodded at even one? That's a strong first use case. Our free AI Opportunity Audit maps the right workflow, channel, and build approach for your business.`,
        ctaText: `Get my free Agentic Opportunity Audit`,
        ctaUrl: `https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=agentic-followup&utm_content=audit-cta`,
      },
    });

    return { subject, preheader, bodyHtml, fullHtml };
  }

  // Category 5: AI Audit, Sales AI & Custom Architecture (Default)
  const isSalesOrAudit = s.includes("audit") || s.includes("custom") || s.includes("knowledge") || s.includes("rag") || s.includes("sales");

  const subject = isSalesOrAudit
    ? `Your AI opportunity audit`
    : `Your AI opportunity audit`;

  const preheader = isSalesOrAudit
    ? `Custom agentic systems and knowledge intelligence designed for your workflows.`
    : `We received your inquiry and are preparing your personalized AI walkthrough.`;

  const bodyHtml = isSalesOrAudit
    ? `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Enterprise-Grade Agentic Intelligence</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for your request for <strong>ConverseAI Custom Agent Architecture & AI Readiness</strong>. Off-the-shelf bots rarely solve deep business friction. We architect bespoke agentic systems tailored to your proprietary knowledge base and operational workflows.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #a855f7; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">What our tailored AI rollout includes:</h3>
        <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
          <li><strong>Full Tech & Workflow Audit:</strong> Pinpoint exact bottlenecks where AI delivers 3x-10x productivity gains.</li>
          <li><strong>Secure Knowledge Base (RAG):</strong> Ground AI agents strictly in your company documentation, PDFs, and databases.</li>
          <li><strong>Dedicated Engineering & SLA:</strong> Custom API integrations, SOC2-compliant hosting, and continuous accuracy tuning.</li>
        </ul>
      </div>
    `
    : `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Welcome to ConverseAI</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Hi ${name}, thank you for contacting us. We received your inquiry regarding the <strong>${plan || "ConverseAI Platform"}</strong> and are excited to assist your team in deploying autonomous AI systems.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">Next Steps:</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">
          Our AI solutions architects are reviewing your requirements and will reach out promptly with tailored recommendations and live demo options.
        </p>
      </div>
    `;

  const fullHtml = renderLuxuryServiceEmail({
    recipientName: name,
    demoSlot: demoSlot,
    preheader: preheader,
    heroHeadline: `Autonomous AI Systems Built for Measurable Revenue Growth`,
    heroSubheadline: `From intent-driven sales outreach to bespoke multi-agent workflows, deploy production-grade AI that drives real business results.`,
    heroCtaText: `See what we build`,
    heroCtaUrl: `https://theconverseai.com/services?utm_source=brevo-automated&utm_medium=email&utm_campaign=sales-audit-followup&utm_content=hero-cta`,
    simulation: {
      channelLabel: `Intent Signal Detected on LinkedIn & G2 (9:15 AM)`,
      incomingMessage: `Target VP of Ops downloaded alternative solution report after Series B funding ($15M).`,
      agentLabel: `ConverseAI Sales Agent, in 60 minutes`,
      checklist: [
        `Enriched target account data & mapped buying committee`,
        `Drafted hyper-personalized value proposition tailored to funding trigger`,
        `Dispatched multi-touch LinkedIn + Email outreach sequence`,
        `Scheduled qualified demo directly on Account Executive's calendar`,
      ],
      caption: `An illustrative example: Intent signal to booked meeting in under 2 hours.`,
    },
    stats: [
      { num: "50+", label: "growing businesses" },
      { num: "14-22%", label: "outbound reply rate" },
      { num: "60%", label: "faster response times" },
      { num: "24/7", label: "autonomous operations" },
    ],
    comparison: {
      sectionTitle: `The difference, in 20 seconds`,
      sectionSubtitle: `Generic bots spam everyone. ConverseAI agentic systems act on real buying intent and business logic.`,
      leftTitle: `Generic Bots & Cold Spam`,
      leftPoints: [
        `Mass generic email blasts that burn your domain reputation`,
        `Basic chatbots that give canned, useless answers`,
        `Disconnected point solutions that don't talk to each other`,
      ],
      rightTitle: `ConverseAI Agentic Architecture`,
      rightPoints: [
        `Intent-driven outreach triggered by real buyer behavior & funding`,
        `Multi-modal agents taking real actions across your CRM & tools`,
        `End-to-end done-for-you scoping, build, integration, and SLA`,
      ],
    },
    whyNow: {
      title: `Why high-growth businesses are switching to agentic AI`,
      quoteBold: `40% of enterprise applications will feature task-specific AI agents by end of 2026, up from less than 5% in 2025.`,
      quoteNormal: `Gartner predicts agentic AI will transform go-to-market and operational workflows.`,
      takeaway: `The businesses that put agents to work early won't just save money—they'll answer faster, qualify sooner, and miss fewer revenue opportunities.`,
      linkText: `Explore all ConverseAI services`,
      linkUrl: `https://theconverseai.com/services`,
    },
    whatWeBuild: {
      title: `We build the agent. We run it too.`,
      subtitle: `You tell us the goal. We scope it, build the agent, integrate with your stack, and keep it performing.`,
      pillars: [
        {
          title: "WhatsApp AI agents",
          desc: "Answer, qualify, and follow up with customers where they already message you with 98% open rates.",
          linkText: "See WhatsApp AI",
          linkUrl: "https://theconverseai.com/whatsapp-ai-chatbot?utm_source=brevo-automated&utm_medium=email&utm_campaign=spotlight&utm_content=row-whatsapp",
        },
        {
          title: "AI voice agents",
          desc: "Inbound and outbound calls for sales, support, and bookings, multilingual with sub-800ms natural latency.",
          linkText: "See voice agents",
          linkUrl: "https://theconverseai.com/services/ai-voice-agents?utm_source=brevo-automated&utm_medium=email&utm_campaign=spotlight&utm_content=row-voice",
        },
        {
          title: "Sales intelligence and outreach",
          desc: "Spot intent signals (funding rounds, executive moves, hiring), craft tailored copy, and run high-reply sequences.",
          linkText: "See sales intelligence",
          linkUrl: "https://theconverseai.com/services/sales-ai?utm_source=brevo-automated&utm_medium=email&utm_campaign=spotlight&utm_content=row-sales",
        },
        {
          title: "Agentic systems & process automation",
          desc: "Replace manual, multi-step workflows with agents that reason, decide, and act inside your existing software stack.",
          linkText: "See agentic systems",
          linkUrl: "https://theconverseai.com/services/agentic-automation?utm_source=brevo-automated&utm_medium=email&utm_campaign=spotlight&utm_content=row-agentic",
        },
      ],
    },
    familiar: {
      title: `Does any of this sound familiar?`,
      bullets: [
        `Your team answers the same repetitive customer questions every day.`,
        `Calls and messages go unanswered after hours and leads go cold.`,
        `Outreach response rates have dropped because generic email blasts no longer work.`,
      ],
      closingText: `Nodded at even one? That's a strong first use case. Our free AI Opportunity Audit maps the right workflow, channel, and build approach for your business.`,
      ctaText: `Get my free AI Opportunity Audit`,
      ctaUrl: `https://theconverseai.com/book-demo?utm_source=brevo-automated&utm_medium=email&utm_campaign=sales-audit-followup&utm_content=audit-cta`,
    },
  });

  return { subject, preheader, bodyHtml, fullHtml };
}

// ─── Brevo: Send Service-Specific Follow-Up to the Prospect ───────────────
async function sendBrevoServiceSequence(info: {
  email: string;
  firstName?: string;
  serviceInterest: string;
  plan: string;
  demoSlot?: string;
  demoUrl?: string;
}) {
  if (!BREVO_API_KEY || !info.email) return;

  const recipientName = info.firstName || "there";
  const template = getServiceEmailTemplate(
    info.serviceInterest,
    info.plan,
    recipientName,
    info.demoSlot,
    info.demoUrl
  );

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: info.email, name: recipientName }],
        subject: template.subject,
        htmlContent: template.fullHtml || template.bodyHtml,
      }),
    });

    if (res.ok) {
      console.log(`[Brevo] Service email sent to prospect ${info.email} (Subject: ${template.subject})`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn("[Brevo] Service email delivery note:", res.status, err);
    }
  } catch (err) {
    console.warn("[Brevo] Service email network error:", err);
  }
}

// ─── Brevo: Dedicated Service Demo Schedule Email Renderer ────────────────
interface LuxuryDemoEmailConfig {
  recipientName: string;
  serviceTitle: string;
  demoSlot?: string;
  preheader: string;
  heroHeadline: string;
  heroSubheadline: string;
  agendaItems: Array<{
    title: string;
    desc: string;
  }>;
  calendarUrl: string;
}

function renderLuxuryDemoEmail(config: LuxuryDemoEmailConfig): string {
  const calendarUrl = "https://theconverseai.com/book-demo";

  const slotCard = config.demoSlot
    ? `
      <div style="background:#3B1580;border:2px solid #86EFAC;border-radius:12px;padding:22px 20px;margin:24px 0 28px 0;text-align:center;">
        <p style="margin:0 0 8px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:bold;color:#86EFAC;text-transform:uppercase;letter-spacing:1px;">📅 Requested Demo Schedule</p>
        <h2 style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#FFFFFF;">${config.demoSlot}</h2>
        <p style="margin:0 0 16px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#EDE9FE;">Our team is reviewing your selected time slot and will send a calendar invite shortly with your private Google Meet link.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;text-align:center;">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:8px;text-align:center;">
              <a href="${calendarUrl}" style="display:inline-block;padding:12px 24px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:#5B21B6;text-decoration:none;text-align:center;">Reschedule or Change Slot &rarr;</a>
            </td>
          </tr>
        </table>
      </div>
    `
    : `
      <div style="background:#3B1580;border:2px solid #7C3AED;border-radius:12px;padding:22px 20px;margin:24px 0 28px 0;text-align:center;">
        <p style="margin:0 0 8px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:bold;color:#86EFAC;text-transform:uppercase;letter-spacing:1px;">📅 Pick Your 30-Minute Time Slot</p>
        <p style="margin:0 0 18px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#EDE9FE;">Select a convenient slot on our booking page so our solutions team can prepare your live walkthrough.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;text-align:center;">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:8px;text-align:center;">
              <a href="${calendarUrl}" style="display:inline-block;padding:14px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;color:#5B21B6;text-decoration:none;text-align:center;">Schedule Your 1-on-1 Demo &rarr;</a>
            </td>
          </tr>
        </table>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${config.heroHeadline}</title>
<style>
  body { margin:0; padding:0; background:#F5F3FF; -webkit-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  a { color:#7C3AED; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:22px !important; padding-right:22px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box !important; }
    .h1 { font-size:26px !important; line-height:32px !important; }
    .statnum { font-size:20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F5F3FF;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5F3FF;font-size:1px;line-height:1px;">
  ${config.preheader}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F3FF">
<tr><td align="center" style="padding:20px 10px;">

  <table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;">

    <!-- Top bar -->
    <tr>
      <td class="pad" style="padding:0 4px 14px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:21px;font-weight:bold;color:#7C3AED;">ConverseAI</td>
            <td align="right" style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#6B6890;"><a href="https://theconverseai.com" style="color:#6B6890;text-decoration:underline;">View website</a></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO (violet gradient) -->
    <tr>
      <td bgcolor="#5B21B6" class="pad" style="background-color:#5B21B6;background-image:linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%);padding:40px 40px 32px 40px;border-radius:12px 12px 0 0;">
        <p style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#DDD6FE;">Hi ${config.recipientName},</p>
        <h1 class="h1" style="margin:0 0 14px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:32px;line-height:38px;font-weight:bold;color:#FFFFFF;letter-spacing:-0.5px;">${config.heroHeadline}</h1>
        <p style="margin:0 0 20px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#EDE9FE;">${config.heroSubheadline}</p>

        ${slotCard}
      </td>
    </tr>

    <!-- HIGHLIGHTS STRIP -->
    <tr>
      <td bgcolor="#4C1D95" style="background-color:#4C1D95;background-image:linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%);padding:18px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" width="25%" valign="top">
              <p class="statnum" style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:26px;font-weight:bold;color:#FFFFFF;">30 Min</p>
              <p style="margin:2px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#DDD6FE;">private walkthrough</p>
            </td>
            <td align="center" width="25%" valign="top">
              <p class="statnum" style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:26px;font-weight:bold;color:#FFFFFF;">1-on-1</p>
              <p style="margin:2px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#DDD6FE;">solutions architect</p>
            </td>
            <td align="center" width="25%" valign="top">
              <p class="statnum" style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:26px;font-weight:bold;color:#FFFFFF;">Live Demo</p>
              <p style="margin:2px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#DDD6FE;">real-time test</p>
            </td>
            <td align="center" width="25%" valign="top">
              <p class="statnum" style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:26px;font-weight:bold;color:#FFFFFF;">₹0</p>
              <p style="margin:2px 0 0 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#DDD6FE;">no obligation</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY AGENDA -->
    <tr>
      <td bgcolor="#FFFFFF" class="pad" style="background:#FFFFFF;padding:36px 40px 16px 40px;">
        <h2 style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:23px;line-height:29px;font-weight:bold;color:#2E1065;">What we'll cover in your 30-minute demo:</h2>
        <p style="margin:0 0 24px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#3F3B5C;">No canned pitch decks. We map the entire session around your exact operational use cases and tech stack.</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
          ${config.agendaItems.map((item, idx) => `
            <tr>
              <td width="36" valign="top" style="padding:4px 0;">
                <div style="background:#EDE9FE;color:#5B21B6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;">${idx + 1}</div>
              </td>
              <td valign="top" style="padding:4px 0 16px 12px;">
                <p style="margin:0 0 4px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:bold;color:#2E1065;">${item.title}</p>
                <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#4B4869;">${item.desc}</p>
              </td>
            </tr>
          `).join("")}
        </table>

        <!-- Preparation box -->
        <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:20px;margin:0 0 24px 0;">
          <p style="margin:0 0 8px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:#2E1065;">💡 How to get the most from our call:</p>
          <ul style="margin:0;padding-left:20px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#4B4869;">
            <li>Bring 1 or 2 repetitive tasks, FAQs, or workflows your team handles manually today.</li>
            <li>Note down your current CRM, helpdesk, or telephony stack (e.g. Zoho, Twilio, Shopify).</li>
            <li>Feel free to invite any teammates or decision-makers involved in the evaluation.</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- CLOSING PANEL (violet gradient) -->
    <tr>
      <td bgcolor="#5B21B6" class="pad" style="background-color:#5B21B6;background-image:linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%);padding:36px 40px 32px 40px;">
        <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:bold;color:#FFFFFF;">Have questions or need to reschedule?</h2>
        <p style="margin:0 0 20px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#EDE9FE;">Simply reply directly to this email (<a href="mailto:hello@theconverseai.com" style="color:#FFFFFF;text-decoration:underline;">hello@theconverseai.com</a>) or message us on WhatsApp at <strong style="color:#FFFFFF;">+91-9982323333</strong>.</p>

        <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px auto;text-align:center;">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:8px;text-align:center;">
              <a href="${calendarUrl}" style="display:inline-block;padding:14px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;color:#5B21B6;text-decoration:none;text-align:center;">Schedule Your 1-on-1 Demo &rarr;</a>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 18px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:#FFFFFF;">Team ConverseAI</p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="pad" style="padding:24px 12px 12px 12px;">
        <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;"><a href="mailto:contact@theconverseai.com" style="color:#6B6890;">contact@theconverseai.com</a>&nbsp;&nbsp;|&nbsp;&nbsp;+91-9982323333</p>
        <p style="margin:0 0 10px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;">
          <a href="https://www.linkedin.com/company/theconverseai" style="color:#7C3AED;">LinkedIn</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://www.instagram.com/theconverseai/" style="color:#7C3AED;">Instagram</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://www.facebook.com/61564130560658/" style="color:#7C3AED;">Facebook</a>
        </p>
        <p style="margin:0 0 6px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;">You're receiving this because you requested a demo with ConverseAI.</p>
        <p style="margin:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6890;text-align:center;"><a href="https://theconverseai.com/privacy-policy" style="color:#6B6890;text-decoration:underline;">Privacy Policy</a></p>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── Brevo: Dedicated Service Demo Email Generator ────────────────────────
export function getServiceDemoEmailTemplate(
  service: string,
  plan: string,
  firstName: string,
  demoSlot?: string,
  demoUrl?: string
): { subject: string; preheader: string; fullHtml: string } {
  const s = (service || "").toLowerCase();
  const name = firstName || "there";
  const calendarUrl = "https://theconverseai.com/book-demo";

  if (s.includes("voice") || s.includes("call") || s.includes("phone")) {
    const subject = demoSlot
      ? `Confirmed: Your AI voice demo`
      : `Your AI voice demo walkthrough`;
    const preheader = `Sub-800ms conversational AI calling walkthrough tailored for your business.`;
    const fullHtml = renderLuxuryDemoEmail({
      recipientName: name,
      serviceTitle: "AI Voice Agents",
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: demoSlot
        ? `Your AI Voice Agents Live Demo is Scheduled!`
        : `Schedule Your 1-on-1 AI Voice Agents Live Demo`,
      heroSubheadline: `In this private 30-minute walkthrough, our solutions team will demonstrate sub-800ms natural conversational AI calling tuned for your business.`,
      agendaItems: [
        {
          title: "Live Phone Call Simulation",
          desc: "We'll dial our voice agent live to test sub-800ms latency, interruptions, and natural Hindi/English code-switching.",
        },
        {
          title: "Custom Inbound & Outbound Flows",
          desc: "Mapping your specific call scripts, after-hours reception, or BANT/MEDDIC lead qualification criteria.",
        },
        {
          title: "Telephony Integration (Twilio/Exotel)",
          desc: "How the agent plugs into your existing numbers and telephony providers with zero lock-in.",
        },
        {
          title: "Live CRM Write-Back & Analytics",
          desc: "Real-time call recordings, transcript extraction, and automated lead sync into Zoho CRM.",
        },
      ],
      calendarUrl: calendarUrl,
    });
    return { subject, preheader, fullHtml };
  }

  if (s.includes("whatsapp") || s.includes("wa") || s.includes("chat") || s.includes("messaging")) {
    const subject = demoSlot
      ? `Confirmed: Your WhatsApp AI demo`
      : `Your WhatsApp AI demo walkthrough`;
    const preheader = `Experience official WhatsApp Business Cloud API automation and lead qualification.`;
    const fullHtml = renderLuxuryDemoEmail({
      recipientName: name,
      serviceTitle: "WhatsApp AI Chatbot",
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: demoSlot
        ? `Your WhatsApp AI Chatbot Demo is Scheduled!`
        : `Schedule Your 1-on-1 WhatsApp AI Chatbot Live Demo`,
      heroSubheadline: `See how official WhatsApp Business Cloud API automation personalizes customer conversations and qualifies leads 24/7.`,
      agendaItems: [
        {
          title: "Live Interactive WhatsApp Simulation",
          desc: "Experience interactive product carousels, dynamic quotes, and checkout right on your own phone.",
        },
        {
          title: "Meta Cloud API & Verified Green Tick",
          desc: "Step-by-step roadmap for official Meta business verification and high-throughput messaging.",
        },
        {
          title: "Unified Team Inbox & Live Takeover",
          desc: "How your team monitors active chats and seamlessly intervenes with one-click handoff.",
        },
        {
          title: "Shopify & Zoho CRM Integration",
          desc: "2-way live sync for catalog items, contact attributes, and purchase history.",
        },
      ],
      calendarUrl: calendarUrl,
    });
    return { subject, preheader, fullHtml };
  }

  if (s.includes("bot") || s.includes("omni") || s.includes("live") || s.includes("support")) {
    const subject = demoSlot
      ? `Confirmed: Your support automation demo`
      : `Your support automation demo walkthrough`;
    const preheader = `Discover how to deflect 80%+ of repetitive support tickets across all channels.`;
    const fullHtml = renderLuxuryDemoEmail({
      recipientName: name,
      serviceTitle: "Omnichannel Support",
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: demoSlot
        ? `Your Omnichannel Support Demo is Scheduled!`
        : `Schedule Your 1-on-1 Omnichannel Support Live Demo`,
      heroSubheadline: `Discover how to deflect 80%+ of repetitive support inquiries while managing Web, WhatsApp, Instagram, and Email in one unified inbox.`,
      agendaItems: [
        {
          title: "Unified Inbox Tour",
          desc: "Centralized management of website chat, WhatsApp, Instagram DMs, and email without switching tabs.",
        },
        {
          title: "80%+ Instant Deflection Architecture",
          desc: "How AI resolves FAQs, order lookups, and account requests with zero human intervention.",
        },
        {
          title: "Context-Preserving Channel Switching",
          desc: "Continuing on WhatsApp what started on your website without customer repetition.",
        },
        {
          title: "Helpdesk & CRM Integration",
          desc: "Live connection to Shopify, WooCommerce, Zoho CRM, Zendesk, or Freshdesk.",
        },
      ],
      calendarUrl: calendarUrl,
    });
    return { subject, preheader, fullHtml };
  }

  if (s.includes("automation") || s.includes("agentic") || s.includes("process") || s.includes("workflow")) {
    const subject = demoSlot
      ? `Confirmed: Your agentic automation demo`
      : `Your agentic automation demo walkthrough`;
    const preheader = `Learn how autonomous reasoning agents replace brittle RPA scripts.`;
    const fullHtml = renderLuxuryDemoEmail({
      recipientName: name,
      serviceTitle: "Agentic Process Automation",
      demoSlot: demoSlot,
      preheader: preheader,
      heroHeadline: demoSlot
        ? `Your Agentic Process Automation Demo is Scheduled!`
        : `Schedule Your 1-on-1 Agentic Automation Live Demo`,
      heroSubheadline: `Learn how autonomous reasoning agents replace brittle RPA scripts and manual copy-pasting across your enterprise software stack.`,
      agendaItems: [
        {
          title: "Workflow Discovery & Scoping",
          desc: "Analyzing your team's repetitive tasks (invoice-to-pay, AR/AP reconciliation, KYC verification).",
        },
        {
          title: "Reasoning vs RPA Live Test",
          desc: "How agents parse messy unstructured PDFs, receipts, and emails without failing on format changes.",
        },
        {
          title: "4-Week Production Sprint Plan",
          desc: "Exact milestone roadmap from eval harness benchmarking to production deployment.",
        },
        {
          title: "Security, SOC2 & ERP Write-Back",
          desc: "How agents run securely within SAP, Tally, bank feeds, and internal databases.",
        },
      ],
      calendarUrl: calendarUrl,
    });
    return { subject, preheader, fullHtml };
  }

  // Default / Sales AI / Platform Walkthrough
  const subject = demoSlot
    ? `Confirmed: Your ConverseAI demo`
    : `Your ConverseAI demo walkthrough`;
  const preheader = `Join our solutions team for a private 30-minute walkthrough tailored to your business.`;
  const fullHtml = renderLuxuryDemoEmail({
    recipientName: name,
    serviceTitle: "ConverseAI Platform",
    demoSlot: demoSlot,
    preheader: preheader,
    heroHeadline: demoSlot
      ? `Your ConverseAI Platform Demo is Scheduled!`
      : `Schedule Your 1-on-1 ConverseAI Platform Live Demo`,
    heroSubheadline: `In this private 30-minute session, we'll map how autonomous agentic systems can accelerate revenue and automate operations for your business.`,
    agendaItems: [
      {
        title: "Intent Signal Detection Walkthrough",
        desc: "Live demo of trigger-based prospecting (funding rounds, executive moves, hiring).",
      },
      {
        title: "Multi-Agent System Architecture",
        desc: "How voice, WhatsApp, and automation work together for your pipeline.",
      },
      {
        title: "Custom AI Opportunity Audit",
        desc: "Identifying the highest-ROI automation opportunities across your operations.",
      },
      {
        title: "Full-Stack Implementation Plan",
        desc: "Turnkey scoping, pricing tiers, and SLA guarantees tailored to your scale.",
      },
    ],
    calendarUrl: calendarUrl,
  });
  return { subject, preheader, fullHtml };
}

// ─── Brevo: Send Dedicated Demo Schedule Follow-Up to Prospect ────────────
export async function sendBrevoDemoScheduleEmail(info: {
  email: string;
  firstName?: string;
  serviceInterest: string;
  plan: string;
  demoSlot?: string;
  demoUrl?: string;
}) {
  if (!BREVO_API_KEY || !info.email) return;

  const recipientName = info.firstName || "there";
  const template = getServiceDemoEmailTemplate(
    info.serviceInterest,
    info.plan,
    recipientName,
    info.demoSlot,
    info.demoUrl
  );

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: info.email, name: recipientName }],
        subject: template.subject,
        htmlContent: template.fullHtml,
      }),
    });

    if (res.ok) {
      console.log(`[Brevo] Dedicated demo schedule email sent to prospect ${info.email} (Subject: ${template.subject})`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn("[Brevo] Demo schedule email delivery note:", res.status, err);
    }
  } catch (err) {
    console.warn("[Brevo] Demo schedule email network error:", err);
  }
}

// ─── Brevo: Transactional Alert Email to Team ─────────────────────────────
async function sendBrevoLeadAlert(info: {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  channel: string;
  rating: string;
  plan: string;
  addon: string;
  formSource: string;
  demoSlot?: string;
  thoughts?: string;
  message?: string;
  country?: string;
  region?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  zohoLeadId?: string;
  isUpdate?: boolean;
}) {
  if (!BREVO_API_KEY) {
    console.info("[Brevo] BREVO_API_KEY is not set. Skipping instant email notification.");
    return;
  }

  const icon = info.rating === "Hot Lead" ? "🔥" : info.rating === "Warm Lead" ? "⚡" : "⚠️";
  const actionText = info.isUpdate ? "🔄 Lead Updated (New Touchpoint)" : "🚀 New Lead Ingested";
  const subject = `${icon} [${info.rating}] ${info.fullName || "New Lead"} | Channel: ${info.channel || "Website"} | ConverseAI`;

  // Parse recipient list (supports comma-separated emails in LEAD_ALERT_EMAIL)
  const recipients = LEAD_ALERT_EMAIL.split(",")
    .map(e => e.trim())
    .filter(Boolean)
    .map(email => ({ email, name: "ConverseAI Team" }));

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; color: #ffffff;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${actionText}
                </span>
                <h1 style="margin: 10px 0 4px 0; font-size: 22px; font-weight: 700; color: #ffffff;">${info.fullName || "New Lead"}</h1>
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  Rating: <strong>${info.rating}</strong> &bull; Origin: <strong>${info.channel}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 24px;">
          <!-- Section 1: Contact Details -->
          <h2 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            👤 Contact Information
          </h2>
          <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td width="35%" style="color: #64748b; font-weight: 600;">Full Name:</td>
              <td style="color: #0f172a; font-weight: bold;">${info.fullName || "N/A"}</td>
            </tr>
            ${info.company ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Company:</td>
              <td style="color: #0f172a; font-weight: 600;">${info.company}</td>
            </tr>` : ""}
            <tr>
              <td style="color: #64748b; font-weight: 600;">Email:</td>
              <td><a href="mailto:${info.email}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${info.email}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Phone:</td>
              <td><a href="tel:${info.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${info.phone || "Not provided"}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Country / Region:</td>
              <td style="color: #0f172a;">${info.country || "India"} ${info.region ? `(${info.region})` : ""}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Form Source:</td>
              <td style="color: #0f172a;">${info.formSource}</td>
            </tr>
          </table>

          <!-- Section 2: Requirements & Scheduling -->
          <h2 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            🎯 Product Interest & Demo
          </h2>
          <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td width="35%" style="color: #64748b; font-weight: 600;">Interested Plan:</td>
              <td style="color: #0f172a; font-weight: bold;">${info.plan}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Service Add-on:</td>
              <td style="color: #0f172a; font-weight: bold;">${info.addon}</td>
            </tr>
            ${info.demoSlot ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Preferred Demo:</td>
              <td style="color: #dc2626; font-weight: bold;">${info.demoSlot}</td>
            </tr>` : ""}
            ${info.thoughts ? `
            <tr>
              <td style="color: #64748b; font-weight: 600; vertical-align: top;">Client Thoughts:</td>
              <td style="color: #0f172a; background: #f8fafc; padding: 8px; border-radius: 6px;">${info.thoughts}</td>
            </tr>` : ""}
            ${info.message ? `
            <tr>
              <td style="color: #64748b; font-weight: 600; vertical-align: top;">Workflows / CRM:</td>
              <td style="color: #0f172a; background: #f8fafc; padding: 8px; border-radius: 6px;">${info.message}</td>
            </tr>` : ""}
          </table>

          <!-- Section 3: Attribution & Origin (Kaha se aayi) -->
          <h2 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            📡 Marketing Origin & Traffic Source
          </h2>
          <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 13px; margin-bottom: 20px;">
            <tr>
              <td width="35%" style="color: #64748b; font-weight: 600;">Traffic Channel:</td>
              <td style="color: #4f46e5; font-weight: bold; font-size: 14px;">${info.channel}</td>
            </tr>
            ${info.utmSource ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">UTM Source:</td>
              <td style="color: #0f172a;">${info.utmSource}</td>
            </tr>` : ""}
            ${info.utmMedium ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">UTM Medium:</td>
              <td style="color: #0f172a;">${info.utmMedium}</td>
            </tr>` : ""}
            ${info.utmCampaign ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Campaign:</td>
              <td style="color: #0f172a;">${info.utmCampaign}</td>
            </tr>` : ""}
            ${info.gclid ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Google Click ID:</td>
              <td style="color: #0f172a; font-family: monospace; font-size: 11px;">${info.gclid}</td>
            </tr>` : ""}
            ${info.fbclid ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Facebook Click ID:</td>
              <td style="color: #0f172a; font-family: monospace; font-size: 11px;">${info.fbclid}</td>
            </tr>` : ""}
            ${info.referrer ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Referrer:</td>
              <td style="color: #0f172a; word-break: break-all;">${info.referrer}</td>
            </tr>` : ""}
            ${info.landingPage ? `
            <tr>
              <td style="color: #64748b; font-weight: 600;">Landing Page:</td>
              <td style="color: #4f46e5; word-break: break-all;">${info.landingPage}</td>
            </tr>` : ""}
          </table>

          <!-- CTA / Zoho Link -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: center; margin-top: 24px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">
              Synced to Zoho CRM Free Edition (Status: <strong>Recorded</strong>)
            </p>
            ${info.zohoLeadId ? `
            <a href="https://crm.zoho.in/crm/org1000/tab/Leads/${info.zohoLeadId}" target="_blank" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Open Lead in Zoho CRM &rarr;
            </a>` : ""}
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Sent automatically via Brevo Transactional API &bull; ConverseAI Growth Engine
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: recipients,
        subject,
        htmlContent,
      }),
    });

    if (brevoResponse.ok) {
      console.log(`[Brevo] Lead alert email sent successfully to ${LEAD_ALERT_EMAIL} (Subject: ${subject})`);
    } else {
      const errJson = await brevoResponse.json().catch(() => ({}));
      console.warn("[Brevo] Email alert delivery failed:", brevoResponse.status, errJson);
    }
  } catch (err) {
    console.warn("[Brevo] Email notification network error:", err);
  }
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
      company       = "",
      website       = "",
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

    // ── Duplicate Prevention: Search for existing lead by email ─────────
    let existingLead: any = null;
    const cleanEmail = (email || "").trim();
    if (cleanEmail) {
      try {
        const searchRes = await fetch(
          `${ZOHO_API_URL}/crm/v2/Leads/search?email=${encodeURIComponent(cleanEmail)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        // Note: Zoho CRM returns 204 No Content when no records match
        if (searchRes.ok && searchRes.status !== 204) {
          const searchJson = await searchRes.json();
          if (Array.isArray(searchJson?.data) && searchJson.data.length > 0) {
            existingLead = searchJson.data[0];
          }
        }
      } catch (searchErr) {
        console.warn("Zoho lead search error (proceeding with standard insert):", searchErr);
      }
    }

    // ── Name parsing (Zoho strictly requires Last_Name) ──────────────────
    const cleanName = fullName.replace(/\(partial lead\)/gi, "").trim();
    const hasIncomingRealName = Boolean(cleanName && !["unknown", "unknown (partial lead)", "lead"].includes(cleanName.toLowerCase()));

    let firstName = "";
    let lastName  = "Lead";

    if (hasIncomingRealName) {
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

    // If existing lead already has a valid name, do NOT overwrite with placeholder "Lead"
    const existingLastName = existingLead?.Last_Name || "";
    const existingHasRealName = Boolean(existingLastName && !["lead", "partial lead", "partial lead (abandoned)", "unknown"].includes(existingLastName.toLowerCase()));

    const finalFirstName = hasIncomingRealName ? firstName : (existingLead?.First_Name || firstName);
    const finalLastName  = hasIncomingRealName ? lastName : (existingHasRealName ? existingLastName : lastName);
    const finalPhone     = (phone && phone.trim()) ? phone : (existingLead?.Phone || undefined);

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

    // ── Derive Rating with Priority Upgrade ───────────────────────────
    const incomingRating = isPartialLead
      ? "Partial Lead"
      : (demo_date || form_source.toLowerCase().includes("pricing") ? "Hot Lead" : "Warm Lead");

    const RATING_PRIORITY: Record<string, number> = {
      "Hot Lead": 3,
      "Warm Lead": 2,
      "Partial Lead": 1,
    };

    const existingRating = existingLead?.Rating || "";
    const currentScore = RATING_PRIORITY[existingRating] || 0;
    const incomingScore = RATING_PRIORITY[incomingRating] || 0;
    const finalRating = incomingScore >= currentScore ? incomingRating : existingRating;

    // ── Search Tags for Zoho Free Edition Global Search Indexing ────────
    // Zoho Free does not support native Tag API (403), so tags are placed in Description & Designation
    const searchTagItems = [
      `#${finalRating.replace(/\s+/g, "")}`,
      plan ? `#${plan.replace(/[^a-zA-Z0-9]/g, "")}` : null,
      addon && addon !== "none" ? `#${addon.replace(/[^a-zA-Z0-9]/g, "")}` : null,
      channel ? `#${channel.replace(/[^a-zA-Z0-9]/g, "")}` : null,
      segment ? `#${segment.replace(/[^a-zA-Z0-9]/g, "")}` : null,
      isPartialLead ? "#AbandonedDropOff" : null,
      demo_date ? "#DemoBooked" : null,
    ].filter(Boolean);
    const searchTagsLine = `🏷️ Search Tags: ${searchTagItems.join(" ")}`;

    // ── Description assembly ─────────────────────────────────────────
    const scheduleLine = demo_date
      ? `📅 Preferred Demo: ${demo_date} at ${demo_time || "Flexible"} (${timezone || "Local Time"})`
      : null;

    const partialNotice = isPartialLead
      ? `⚠️ [PARTIAL LEAD / ABANDONED DROP-OFF]\nThis visitor entered their email on "${form_source}" but did not complete submission. Follow up promptly!\n----------------------------------------`
      : null;

    const sections = [
      searchTagsLine,
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

    const newTouchpointDesc = sections.join("\n\n");

    const istTimestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const finalDescription = existingLead?.Description
      ? `${existingLead.Description}\n\n════════════════════════════════════════\n🔄 [TOUCHPOINT: ${istTimestamp} IST] | Source: ${form_source}\n════════════════════════════════════════\n${newTouchpointDesc}`
      : newTouchpointDesc;

    // ── Safe field values ─────────────────────────────────────────────
    // Website: Zoho enforces valid URL syntax
    const formattedWebsite = demo_date
      ? `https://converseai.com/demo?slot=${demo_date}_${encodeURIComponent(demo_time || "flexible")}`
      : (landing_page && landing_page.startsWith("http") ? landing_page : (website && website.startsWith("http") ? website : (existingLead?.Website || undefined)));

    // Fax: max 30 characters in Zoho standard field
    const formattedFax = thoughts.trim()
      ? thoughts.trim().substring(0, 30)
      : (existingLead?.Fax || undefined);

    // Lead_Source_Detail for custom Zoho field (first 255 chars)
    const leadSourceDetailTrimmed = leadSourceDetail.substring(0, 255);

    // Standard field mappings for Free Edition
    const serviceInterest = addon && addon !== "none" ? addon : (existingLead?.Lead_Source || "Core Plan / Standard Service");
    const finalPlanDisplay = (plan && plan !== "Unsure") ? planDisplay : (existingLead?.Industry || planDisplay);
    const finalCompany = (company && company.trim()) ? company.trim() : (existingLead?.Company || "Direct Inbound");

    const isUpdate = Boolean(existingLead?.id);
    const computedLeadStatus = scheduleLine
      ? "Demo Scheduled"
      : (form_source && form_source.toLowerCase().includes("contact") ? "Contacted" : "New Lead");
    const timelineSummary = newTouchpointDesc || `[Touchpoint: ${istTimestamp}] Form: ${form_source} | Service: ${serviceInterest}`;

    // ── Compose Zoho lead payload ─────────────────────────────────────
    const leadData: Record<string, any> = {
      ...(isUpdate ? { id: existingLead.id } : {}),
      First_Name:  finalFirstName,
      Last_Name:   finalLastName,
      Email:       cleanEmail || email,
      Phone:       finalPhone,
      Company:     finalCompany,

      // Standard Zoho CRM fields repurposed for Free Edition
      Industry:    finalPlanDisplay,
      Lead_Source: serviceInterest,
      Designation: `Product: ${finalPlanDisplay} | Service: ${serviceInterest} | ${searchTagItems.slice(0, 2).join(" ")}`,
      Description: finalDescription,
      Country:     countryName || existingLead?.Country || undefined,
      Website:     formattedWebsite,
      Fax:         formattedFax,

      // Repurposed standard fields (mapped in Phase 2 for Free Edition)
      Rating:      finalRating,
      Skype_ID:    leadSourceDetailTrimmed || existingLead?.Skype_ID || undefined,

      // ── Custom Fields (if upgraded or custom) ────────────────────────
      Lead_Source_Detail:    leadSourceDetailTrimmed || undefined,
      Requirement_Interest:  addonDisplay !== "No add-on (Core plan only)" ? addonDisplay : undefined,
      Lead_Category:         finalRating,
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

    const httpMethod = isUpdate ? "PUT" : "POST";

    // ── First attempt: full payload ───────────────────────────────────
    let crmResponse = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
      method:  httpMethod,
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
        ...(isUpdate ? { id: existingLead.id } : {}),
        First_Name:  finalFirstName,
        Last_Name:   finalLastName,
        Email:       cleanEmail || email,
        Phone:       finalPhone,
        Company:     finalCompany,
        Industry:    finalPlanDisplay,
        Lead_Source: serviceInterest,
        Rating:      finalRating,
        Skype_ID:    leadSourceDetailTrimmed || existingLead?.Skype_ID || undefined,
        Designation: `Product: ${finalPlanDisplay} | Service: ${serviceInterest} | ${searchTagItems.slice(0, 2).join(" ")}`,
        Description: finalDescription,
        Country:     countryName || existingLead?.Country || undefined,
        Website:     formattedWebsite,
        Fax:         formattedFax,
      };
      Object.keys(fallbackData).forEach(k => fallbackData[k] === undefined && delete fallbackData[k]);

      const fallbackResponse = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
        method:  httpMethod,
        headers: {
          Authorization:  `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [fallbackData], trigger: ["approval", "workflow", "blueprint"] }),
      });

      const fallbackResult = await fallbackResponse.json();
      if (fallbackResponse.ok && fallbackResult?.data?.[0]?.status !== "error") {
        const leadId = existingLead?.id || fallbackResult?.data?.[0]?.details?.id;

        // 1. Trigger Brevo instant email alert to internal team
        sendBrevoLeadAlert({
          fullName:    finalFirstName && finalLastName ? `${finalFirstName} ${finalLastName}`.trim() : (cleanName || "New Prospect"),
          email:       cleanEmail || email,
          phone:       finalPhone || phone || "",
          company:     finalCompany !== "Direct Inbound" ? finalCompany : undefined,
          channel:     channel || "Direct / Website",
          rating:      finalRating,
          plan:        finalPlanDisplay,
          addon:       serviceInterest,
          formSource:  form_source,
          demoSlot:    scheduleLine || undefined,
          thoughts:    thoughts.trim() || undefined,
          message:     message.trim() || undefined,
          country:     countryName || undefined,
          region:      region || undefined,
          utmSource:   utm_source || undefined,
          utmMedium:   utm_medium || undefined,
          utmCampaign: utm_campaign || undefined,
          landingPage: landing_page || page_url || undefined,
          gclid:       gclid || undefined,
          fbclid:      fbclid || undefined,
          referrer:    referrer || undefined,
          zohoLeadId:  leadId,
          isUpdate:    isUpdate,
        }).catch(err => console.warn("Brevo lead alert error:", err));

        // 1.5 Real-Time Google Sheet Sync (Looker Studio Live Data Feed)
        syncGoogleSheetLead({
          timestamp:         istTimestamp,
          fullName:          finalFirstName && finalLastName ? `${finalFirstName} ${finalLastName}`.trim() : (cleanName || "New Prospect"),
          email:             cleanEmail || email,
          phone:             finalPhone || phone || "",
          company:           finalCompany !== "Direct Inbound" ? finalCompany : "",
          serviceInterest:   serviceInterest,
          plan:              finalPlanDisplay,
          source:            channel || leadSourceDetail || "Website Direct",
          rating:            finalRating,
          leadStatus:        computedLeadStatus,
          landingPage:       landing_page || page_url || "",
          utmCampaign:       utm_campaign || "",
          referrer:          referrer || "",
          touchpointHistory: timelineSummary,
        }).catch(err => console.warn("Google Sheet sync error:", err));

        // 2. Trigger Brevo follow-up email (Dedicated Demo Schedule vs Service Overview)
        const isDemoLead = 
          Boolean(scheduleLine) || 
          (form_source || "").toLowerCase().includes("demo") || 
          (serviceInterest || "").toLowerCase().includes("demo") ||
          (finalPlanDisplay || "").toLowerCase().includes("demo");

        if (!isPartialLead && cleanEmail) {
          if (isDemoLead) {
            sendBrevoDemoScheduleEmail({
              email:           cleanEmail,
              firstName:       finalFirstName,
              serviceInterest: serviceInterest,
              plan:            finalPlanDisplay,
              demoSlot:        scheduleLine || undefined,
              demoUrl:         formattedWebsite,
            }).catch(err => console.warn("Brevo demo schedule email error:", err));
          } else {
            sendBrevoServiceSequence({
              email:           cleanEmail,
              firstName:       finalFirstName,
              serviceInterest: serviceInterest,
              plan:            finalPlanDisplay,
              demoSlot:        undefined,
              demoUrl:         formattedWebsite,
            }).catch(err => console.warn("Brevo service sequence error:", err));
          }
        }

        // 3. Upsert contact in Brevo contacts list with attributes
        if (cleanEmail) {
          syncBrevoContact({
            email:           cleanEmail,
            firstName:       finalFirstName,
            lastName:        finalLastName,
            phone:           finalPhone,
            company:         finalCompany !== "Direct Inbound" ? finalCompany : undefined,
            serviceInterest: serviceInterest,
            plan:            finalPlanDisplay,
            channel:         channel || "Direct / Website",
            rating:          finalRating,
          }).catch(err => console.warn("Brevo contact sync error:", err));
        }

        return res.status(200).json({
          success: true,
          updated: isUpdate,
          id: leadId,
          data: fallbackResult,
          fallback: true,
        });
      }

      // Both attempts failed
      console.error("Zoho CRM fallback also failed:", fallbackResult);
      return res.status(500).json({ error: "Failed to persist lead in Zoho CRM", details: fallbackResult });
    }

    const leadId = existingLead?.id || crmData?.data?.[0]?.details?.id;

    // 1. Trigger Brevo instant email alert to internal team
    sendBrevoLeadAlert({
      fullName:    finalFirstName && finalLastName ? `${finalFirstName} ${finalLastName}`.trim() : (cleanName || "New Prospect"),
      email:       cleanEmail || email,
      phone:       finalPhone || phone || "",
      company:     finalCompany !== "Direct Inbound" ? finalCompany : undefined,
      channel:     channel || "Direct / Website",
      rating:      finalRating,
      plan:        finalPlanDisplay,
      addon:       serviceInterest,
      formSource:  form_source,
      demoSlot:    scheduleLine || undefined,
      thoughts:    thoughts.trim() || undefined,
      message:     message.trim() || undefined,
      country:     countryName || undefined,
      region:      region || undefined,
      utmSource:   utm_source || undefined,
      utmMedium:   utm_medium || undefined,
      utmCampaign: utm_campaign || undefined,
      landingPage: landing_page || page_url || undefined,
      gclid:       gclid || undefined,
      fbclid:      fbclid || undefined,
      referrer:    referrer || undefined,
      zohoLeadId:  leadId,
      isUpdate:    isUpdate,
    }).catch(err => console.warn("Brevo lead alert error:", err));

    // 1.5 Real-Time Google Sheet Sync (Looker Studio Live Data Feed)
    syncGoogleSheetLead({
      timestamp:         istTimestamp,
      fullName:          finalFirstName && finalLastName ? `${finalFirstName} ${finalLastName}`.trim() : (cleanName || "New Prospect"),
      email:             cleanEmail || email,
      phone:             finalPhone || phone || "",
      company:           finalCompany !== "Direct Inbound" ? finalCompany : "",
      serviceInterest:   serviceInterest,
      plan:              finalPlanDisplay,
      source:            channel || leadSourceDetail || "Website Direct",
      rating:            finalRating,
      leadStatus:        computedLeadStatus,
      landingPage:       landing_page || page_url || "",
      utmCampaign:       utm_campaign || "",
      referrer:          referrer || "",
      touchpointHistory: timelineSummary,
    }).catch(err => console.warn("Google Sheet sync error:", err));

    // 2. Trigger Brevo follow-up email (Dedicated Demo Schedule vs Service Overview)
    const isDemoLead = 
      Boolean(scheduleLine) || 
      (form_source || "").toLowerCase().includes("demo") || 
      (serviceInterest || "").toLowerCase().includes("demo") || 
      (finalPlanDisplay || "").toLowerCase().includes("demo");

    if (!isPartialLead && cleanEmail) {
      if (isDemoLead) {
        sendBrevoDemoScheduleEmail({
          email:           cleanEmail,
          firstName:       finalFirstName,
          serviceInterest: serviceInterest,
          plan:            finalPlanDisplay,
          demoSlot:        scheduleLine || undefined,
          demoUrl:         formattedWebsite,
        }).catch(err => console.warn("Brevo demo schedule email error:", err));
      } else {
        sendBrevoServiceSequence({
          email:           cleanEmail,
          firstName:       finalFirstName,
          serviceInterest: serviceInterest,
          plan:            finalPlanDisplay,
          demoSlot:        undefined,
          demoUrl:         formattedWebsite,
        }).catch(err => console.warn("Brevo service sequence error:", err));
      }
    }

    // 3. Upsert contact in Brevo contacts list with attributes
    if (cleanEmail) {
      syncBrevoContact({
        email:           cleanEmail,
        firstName:       finalFirstName,
        lastName:        finalLastName,
        phone:           finalPhone,
        company:         finalCompany !== "Direct Inbound" ? finalCompany : undefined,
        serviceInterest: serviceInterest,
        plan:            finalPlanDisplay,
        channel:         channel || "Direct / Website",
        rating:          finalRating,
      }).catch(err => console.warn("Brevo contact sync error:", err));
    }

    return res.status(200).json({
      success: true,
      updated: isUpdate,
      id: leadId,
      data: crmData,
    });

  } catch (error: any) {
    console.error("Zoho lead persistence error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
