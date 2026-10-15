import { getCaptchaToken } from "./recaptcha";
import { getUTMPayload } from "./utmTracker";

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuCXLpkK2e8kC37As23AnW4aw-s0cs0irjmtEXHP9mN5QPMDjqNmnWbgYBcZWMKT4x/exec';

interface ContactPayload {
  fullName: string;
  email: string;
  phone: string;
  countryName?: string;
  product: string;
  subject: string;
  message: string;
  form_source: string;
  /** Optional dedicated Google Apps Script URL for this form */
  customScriptUrl?: string;
  /** Optional extra fields appended to the payload (e.g. PDF attachment for the audit report). */
  extraFields?: Record<string, string>;
}

const getDefaultSubject = (payload: ContactPayload) => {
  const submittedSubject = payload.subject?.trim();
  if (submittedSubject) return submittedSubject;
  if (payload.form_source?.trim()) return payload.form_source.trim();
  return "Website Enquiry";
};

export const submitContactForm = async (payload: ContactPayload): Promise<void> => {
  const token = await getCaptchaToken("contact_form") ?? "";

  // Use the rich UTM tracker (session-persistent, channel-derived, first-touch)
  const utm = getUTMPayload();

  const subject = getDefaultSubject(payload);

  const finalPayload: Record<string, string> = {
    fullName: payload.fullName || "",
    email: payload.email || "",
    phone: payload.phone || "",
    countryName: payload.countryName || "N/A",
    product: payload.product || "N/A",
    subject,
    message: payload.message || "N/A",
    form_source: payload.form_source || "Website",
    captcha_token: token,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
    utm_id: utm.utm_id,
    page_url: window.location.href,
    device_info: navigator.userAgent.substring(0, 200),
  };

  if (payload.extraFields) {
    Object.entries(payload.extraFields).forEach(([key, value]) => {
      finalPayload[key] = value ?? "";
    });
  }

  const params = new URLSearchParams();
  Object.entries(finalPayload).forEach(([key, value]) => {
    params.append(key, value);
  });

  // Send to Google Sheets
  const targetScriptUrl = payload.customScriptUrl || SCRIPT_URL;
  const sheetsPromise = fetch(targetScriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  }).catch((err) => console.warn("Google script submission error:", err));

  // If a custom script URL was used, also backup to central sheet
  if (payload.customScriptUrl && payload.customScriptUrl !== SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).catch(() => {});
  }

  // Sync to Zoho CRM (including partial leads) with full attribution data
  const isPartial = payload.extraFields?.partial_lead === "true";
  fetch('/api/zoho-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(payload.extraFields || {}),
      fullName:      payload.fullName,
      email:         payload.email,
      phone:         payload.phone,
      countryName:   payload.countryName,
      plan:          payload.extraFields?.plan || payload.product,
      addon:         payload.extraFields?.addon,
      message:       payload.message,
      form_source:   payload.form_source,
      partial_lead:  isPartial ? "true" : "false",
      // Full attribution enrichment
      utm_source:    utm.utm_source,
      utm_medium:    utm.utm_medium,
      utm_campaign:  utm.utm_campaign,
      utm_term:      utm.utm_term,
      utm_content:   utm.utm_content,
      utm_id:        utm.utm_id,
      gclid:         utm.gclid,
      fbclid:        utm.fbclid,
      channel:       utm.channel,
      region_hint:   utm.region_hint,
      referrer:      utm.referrer,
      landing_page:  utm.landing_page,
      page_url:      window.location.href,
    }),
  }).catch((err) => console.warn("Zoho CRM sync error:", err));


  await sheetsPromise;
};
