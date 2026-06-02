import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function formatDateTime(): string {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
}

function buildUserEmailHTML(data: Record<string, string>): string {
  const rows = [
    ['Name', data.fullName],
    ['Mobile Number', data.phone],
    ['Email', data.email],
    ['Enquiry For', data.product || 'N/A'],
    ['Subject', data.subject || 'N/A'],
    ['Message', data.message || 'N/A'],
    ['Date & Time', formatDateTime()],
  ];

  const rowsHTML = rows.map((r, i) => `
    <tr style="background-color:${i % 2 === 0 ? '#f3f0ff' : '#ffffff'}">
      <td style="padding:12px 16px;border:1px solid #e5e0f0;font-weight:600;color:#4a3880;width:40%;font-size:14px">${r[0]}</td>
      <td style="padding:12px 16px;border:1px solid #e5e0f0;color:#333;font-size:14px">${r[1]}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:28px 24px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:22px">Thank You for Contacting Us!</h1>
    <p style="margin:8px 0 0;color:#e9e0ff;font-size:13px">${data.form_source || 'Enquiry Form'}</p>
  </td></tr>
  <tr><td style="padding:24px">
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">Hi <strong>${data.fullName}</strong>,</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 20px">Thank you for reaching out to theconverseAI. We have received your enquiry and our team will get back to you shortly.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden">${rowsHTML}</table>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:20px 0 0">If you have any urgent queries, feel free to call us at <strong>+91-9982323333</strong>.</p>
  </td></tr>
  <tr><td style="background:#f9f7ff;padding:20px 24px;text-align:center;border-top:1px solid #e5e0f0">
    <p style="margin:0;color:#7c3aed;font-weight:700;font-size:14px">Team theconverseAI</p>
    <p style="margin:4px 0 0;color:#999;font-size:12px">www.theconverseai.com</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

function buildAdminEmailHTML(data: Record<string, string>): string {
  const basicRows = [
    ['Name', data.fullName],
    ['Mobile Number', data.phone],
    ['Email', data.email],
    ['Enquiry For', data.product || 'N/A'],
    ['Subject', data.subject || 'N/A'],
    ['Message', data.message || 'N/A'],
    ['Date & Time', formatDateTime()],
  ];

  const trackingRows = [
    ['UTM Source', data.utm_source || 'N/A'],
    ['UTM Medium', data.utm_medium || 'N/A'],
    ['UTM Campaign', data.utm_campaign || 'N/A'],
    ['UTM Term', data.utm_term || 'N/A'],
    ['UTM Content', data.utm_content || 'N/A'],
    ['UTM ID', data.utm_id || 'N/A'],
    ['Page URL', data.page_url || 'N/A'],
    ['IP Address', data.ip_address || 'N/A'],
    ['Device Info', data.device_info || 'N/A'],
  ];

  const makeRows = (rows: string[][], startIndex = 0) => rows.map((r, i) => `
    <tr style="background-color:${(i + startIndex) % 2 === 0 ? '#f3f0ff' : '#ffffff'}">
      <td style="padding:10px 14px;border:1px solid #e5e0f0;font-weight:600;color:#4a3880;width:40%;font-size:13px">${r[0]}</td>
      <td style="padding:10px 14px;border:1px solid #e5e0f0;color:#333;font-size:13px">${r[1]}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:28px 24px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:22px">New Enquiry Received</h1>
    <p style="margin:8px 0 0;color:#e9e0ff;font-size:13px">${data.form_source || 'Enquiry Form'}</p>
  </td></tr>
  <tr><td style="padding:24px">
    <h3 style="color:#4a3880;font-size:15px;margin:0 0 12px">📋 Basic Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden">${makeRows(basicRows)}</table>
    <h3 style="color:#4a3880;font-size:15px;margin:24px 0 12px">📊 Tracking Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden">${makeRows(trackingRows)}</table>
  </td></tr>
  <tr><td style="background:#f9f7ff;padding:16px 24px;text-align:center;border-top:1px solid #e5e0f0">
    <p style="margin:0;color:#999;font-size:12px">theconverseAI Admin Notification</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured');
    }

    const body = await req.json();
    const { fullName, email, phone, product, subject, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
      form_source, page_url, device_info } = body;
    const normalizedSubject = subject?.trim() || form_source?.trim() || 'Website Enquiry';

    // Get IP from request headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'Unknown';

    const data: Record<string, string> = {
      fullName, email, phone, product, subject: normalizedSubject, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
      form_source, page_url, device_info, ip_address,
    };

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: SMTP_USER, password: SMTP_PASS},
      },
    });

    const adminEmails = ['maheshvar.revti@gmail.com','meghansh.cbetter@gmail.com','himanshu@revtidigital.com'];

    // Send user confirmation email
    await client.send({
      from: SMTP_USER,
      to: [email],
      subject: `Thank you for contacting theconverseAI - ${data.subject || 'Website Enquiry'}`,
      content: buildUserEmailHTML(data),
      html: buildUserEmailHTML(data),
    });

    // Send admin notification emails
    for (const adminEmail of adminEmails) {
      await client.send({
        from: SMTP_USER,
        to: [adminEmail],
        subject: `New Enquiry - ${data.subject || form_source || 'Website Form'}`,
        content: buildAdminEmailHTML(data),
        html: buildAdminEmailHTML(data),
      });
    }

    await client.close();

    // Also send data to Google Sheet via Apps Script
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, val]) => params.append(key, val || ''));

      await fetch(
        'https://script.google.com/macros/s/AKfycbwdCbkPiV2qeJdXSgipi5UIH9RO0kPthZdCZyN_CpXs38LS1NwPUNeRAXOZVkg4wq1C/exec',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
          redirect: 'follow',
        }
      );
    } catch (sheetError) {
      console.error('Google Sheet submission failed:', sheetError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
