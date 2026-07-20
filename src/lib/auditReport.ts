import { PDFDocument, StandardFonts, PDFName, PDFString, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

export interface AuditInput {
  fullName: string;
  email: string;
  company: string;
  role?: string;
  industry?: string;
  teamSize?: string;
  revenue?: string;
  region?: string;
  pains: string[];
  depts: string[];
  aiMaturity?: string;
  dataReadiness?: string;
  tools?: string;
  budget?: string;
  timeline?: string;
  compliance: string[];
  notes?: string;
}

/* ---------- Brand tokens ---------- */
const BRAND = {
  primary: rgb(0.49, 0.23, 0.93), // ConverseAI purple
  primaryDark: rgb(0.35, 0.13, 0.7),
  primaryLite: rgb(0.6, 0.33, 0.95),
  numberFaint: rgb(0.72, 0.66, 0.92),
  mint: rgb(0.08, 0.86, 0.7),
  mintDark: rgb(0.03, 0.55, 0.42),
  ink: rgb(0.1, 0.11, 0.16),
  muted: rgb(0.45, 0.47, 0.53),
  line: rgb(0.9, 0.9, 0.93),
  track: rgb(0.91, 0.91, 0.94),
  softWhite: rgb(0.85, 0.82, 0.98),
  white: rgb(1, 1, 1),
};

/* ---------- Rule-based scoring ---------- */
const dataScoreMap: Record<string, number> = {
  "Scattered across tools & spreadsheets": 10,
  "Partly organized": 20,
  "Well-organized (CRM / database)": 30,
};
const aiScoreMap: Record<string, number> = {
  "Nothing yet — exploring": 6,
  "Casual use (ChatGPT / Copilot)": 13,
  "A few AI tools in use": 22,
  "Ran pilots but no clear ROI": 17,
};
const teamScoreMap: Record<string, number> = {
  "1–10": 6,
  "11–50": 11,
  "51–200": 16,
  "201–500": 18,
  "500+": 20,
};

export interface Readiness {
  score: number;
  band: string;
  blurb: string;
  dims: { label: string; value: number; max: number }[];
}

export const computeReadiness = (input: AuditInput): Readiness => {
  const data = dataScoreMap[input.dataReadiness || ""] ?? 12;
  const ai = aiScoreMap[input.aiMaturity || ""] ?? 8;
  const team = teamScoreMap[input.teamSize || ""] ?? 8;
  const toolsBonus = input.tools && input.tools.trim() ? 10 : 4;
  const clarity = Math.min(15, input.pains.length * 4); // knowing the problem = readiness

  const raw = data + ai + team + toolsBonus + clarity; // out of ~ 95
  const score = Math.max(18, Math.min(96, Math.round(raw + 4)));

  let band = "Early stage";
  let blurb = "Strong upside, but foundations come first. A focused audit will de-risk your first build.";
  if (score >= 70) {
    band = "AI-ready";
    blurb = "You have the data, tools, and clarity to ship a high-ROI use case fast.";
  } else if (score >= 45) {
    band = "Developing";
    blurb = "Good momentum. A prioritized roadmap will turn scattered effort into measurable ROI.";
  }

  return {
    score,
    band,
    blurb,
    dims: [
      { label: "Data readiness", value: data, max: 30 },
      { label: "AI maturity", value: ai, max: 22 },
      { label: "Team & scale", value: team, max: 20 },
      { label: "Problem clarity", value: clarity, max: 15 },
    ],
  };
};

/* ---------- Use-case mapping ---------- */
interface UseCase {
  title: string;
  why: string;
  impact: "High" | "Medium";
  feasibility: "High" | "Medium";
}
const painToUseCase: Record<string, UseCase> = {
  "Missing calls / leads": {
    title: "AI Voice Agents",
    why: "Answer 100% of inbound calls 24/7, qualify leads, and auto-book meetings — recover missed-call revenue.",
    impact: "High",
    feasibility: "High",
  },
  "Slow or overloaded support": {
    title: "AI Support Agent",
    why: "Deflect 30–60% of Tier-1 tickets with accurate, cited answers and clean human handoff.",
    impact: "High",
    feasibility: "High",
  },
  "Repetitive back-office work": {
    title: "Agentic Automation (Agent Sprint)",
    why: "Ship one production agent for a back-office workflow (invoices, triage, onboarding) in ~4 weeks.",
    impact: "High",
    feasibility: "Medium",
  },
  "Weak sales pipeline": {
    title: "Sales Intelligence & Outreach",
    why: "Signal-triggered outbound that books qualified meetings without SDR overhead.",
    impact: "Medium",
    feasibility: "Medium",
  },
  "Slow onboarding / messy SOPs": {
    title: "Knowledge Assistant",
    why: "Private assistant over your SOPs and docs — cuts ramp time and 'where do I find…' questions.",
    impact: "Medium",
    feasibility: "High",
  },
  "Document & knowledge overload": {
    title: "Document & Knowledge Intelligence",
    why: "Answer questions across your documents with citations; extract and structure key data.",
    impact: "High",
    feasibility: "Medium",
  },
  "Manual reporting / data entry": {
    title: "Custom AI Agent + Integration",
    why: "Automate manual data entry and reporting by wiring AI into your existing CRM/helpdesk.",
    impact: "Medium",
    feasibility: "Medium",
  },
};

export const recommendUseCases = (input: AuditInput): UseCase[] => {
  const picked = input.pains.map((p) => painToUseCase[p]).filter(Boolean);
  if (picked.length === 0) {
    return [painToUseCase["Missing calls / leads"], painToUseCase["Repetitive back-office work"]];
  }
  return picked.slice(0, 5);
};

/* ---------- PDF helpers ---------- */
const wrap = (text: string, font: PDFFont, size: number, maxW: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- PDF generation ---------- */
export const generateAuditReportPdf = async (input: AuditInput): Promise<Uint8Array> => {
  const readiness = computeReadiness(input);
  const useCases = recommendUseCases(input);

  const doc = await PDFDocument.create();
  doc.setTitle(`AI Readiness Report — ${input.company}`);
  doc.setAuthor("ConverseAI");
  doc.setCreator("ConverseAI — theconverseai.com");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // logo (best-effort — falls back to wordmark)
  let logo: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  try {
    const res = await fetch("/logo-white.png");
    if (res.ok) {
      const buf = await res.arrayBuffer();
      logo = await doc.embedPng(buf);
    }
  } catch {
    logo = null;
  }

  const W = 595.28; // A4
  const H = 841.89;
  const M = 48;
  const contentW = W - M * 2;
  const headerH = 96;

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  /* ----- low-level drawing helpers ----- */

  // Horizontal left→right gradient, faked with thin vertical slices.
  const gradient = (page: PDFPage, x: number, y: number, w: number, h: number, cL: RGB, cR: RGB) => {
    const slices = 120;
    const sw = w / slices;
    for (let i = 0; i < slices; i++) {
      const t = i / (slices - 1);
      page.drawRectangle({
        x: x + i * sw,
        y,
        width: sw + 0.6,
        height: h,
        color: rgb(lerp(cL.red, cR.red, t), lerp(cL.green, cR.green, t), lerp(cL.blue, cR.blue, t)),
      });
    }
  };

  // Full-width light separator rule.
  const rule = (page: PDFPage, y: number) =>
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.75, color: BRAND.line });

  // Stadium (fully rounded) bar.
  const roundedBar = (page: PDFPage, x: number, y: number, w: number, h: number, color: RGB) => {
    const r = h / 2;
    if (w <= h) {
      page.drawCircle({ x: x + r, y: y + r, size: r, color });
      return;
    }
    page.drawRectangle({ x: x + r, y, width: w - h, height: h, color });
    page.drawCircle({ x: x + r, y: y + r, size: r, color });
    page.drawCircle({ x: x + w - r, y: y + r, size: r, color });
  };

  // Progress arc (ring gauge), clockwise from the top.
  const drawArc = (page: PDFPage, cx: number, cy: number, R: number, T: number, fraction: number, color: RGB) => {
    const steps = Math.max(2, Math.round(fraction * 96));
    const sweep = fraction * 2 * Math.PI;
    let prev: { x: number; y: number } | null = null;
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI / 2 - (sweep * i) / steps; // start at top, go clockwise
      const p = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      if (prev) page.drawLine({ start: prev, end: p, thickness: T, color });
      prev = p;
    }
    // rounded caps
    page.drawCircle({ x: cx, y: cy + R, size: T / 2, color });
    if (prev) page.drawCircle({ x: prev.x, y: prev.y, size: T / 2, color });
  };

  // Teal checkmark drawn from two strokes.
  const drawCheck = (page: PDFPage, x: number, y: number, s: number, color: RGB) => {
    page.drawLine({ start: { x, y: y + s * 0.35 }, end: { x: x + s * 0.35, y }, thickness: 1.6, color });
    page.drawLine({ start: { x: x + s * 0.35, y }, end: { x: x + s, y: y + s * 0.85 }, thickness: 1.6, color });
  };

  // Clickable URI link annotation over a rectangular area.
  const addLink = (page: PDFPage, x: number, y: number, w: number, h: number, uri: string) => {
    const context = page.doc.context;
    const annot = context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + w, y + h],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(uri) },
    });
    const ref = context.register(annot);
    const existing = page.node.Annots();
    if (existing) existing.push(ref);
    else page.node.set(PDFName.of("Annots"), context.obj([ref]));
  };

  const linkText = (page: PDFPage, label: string, x: number, y: number, size: number, uri: string, color: RGB) => {
    const w = font.widthOfTextAtSize(label, size);
    page.drawText(label, { x, y, size, font, color });
    addLink(page, x, y - 2, w, size + 2, uri);
    return w;
  };

  const drawHeader = (page: PDFPage) => {
    gradient(page, 0, H - headerH, W, headerH, BRAND.primaryDark, BRAND.primaryLite);
    page.drawRectangle({ x: 0, y: H - headerH - 5, width: W, height: 5, color: BRAND.mint });
    if (logo) {
      const lw = 128;
      const lh = (logo.height / logo.width) * lw;
      page.drawImage(logo, { x: M, y: H - headerH / 2 - lh / 2, width: lw, height: lh });
    } else {
      page.drawText("ConverseAI", { x: M, y: H - 56, size: 22, font: bold, color: BRAND.white });
    }
    page.drawText("AI READINESS REPORT", {
      x: W - M - bold.widthOfTextAtSize("AI READINESS REPORT", 11),
      y: H - 46,
      size: 11,
      font: bold,
      color: BRAND.white,
    });
    page.drawText("theconverseai.com", {
      x: W - M - font.widthOfTextAtSize("theconverseai.com", 9),
      y: H - 60,
      size: 9,
      font,
      color: BRAND.softWhite,
    });
  };

  const drawFooter = (page: PDFPage, n: number) => {
    rule(page, 58);
    const fy = 43;
    const sep = "   ·   ";
    let x = M;
    x += linkText(page, "theconverseai.com", x, fy, 8, "https://theconverseai.com", BRAND.primary);
    page.drawText(sep, { x, y: fy, size: 8, font, color: BRAND.muted });
    x += font.widthOfTextAtSize(sep, 8);
    x += linkText(page, "contact@theconverseai.com", x, fy, 8, "mailto:contact@theconverseai.com", BRAND.primary);
    page.drawText(sep, { x, y: fy, size: 8, font, color: BRAND.muted });
    x += font.widthOfTextAtSize(sep, 8);
    linkText(page, "+91 99823 23333", x, fy, 8, "tel:+919982323333", BRAND.primary);
    page.drawText(`Page ${n}`, { x: W - M - 34, y: fy, size: 8, font, color: BRAND.muted });
  };

  /* ===== PAGE 1 ===== */
  const p1 = doc.addPage([W, H]);
  drawHeader(p1);
  let y = H - headerH - 42;

  p1.drawText("AI Readiness Report", { x: M, y, size: 26, font: bold, color: BRAND.ink });
  y -= 24;
  p1.drawText(`Prepared for ${input.company || "your business"}${input.fullName ? `  ·  ${input.fullName}` : ""}`, {
    x: M, y, size: 12, font, color: BRAND.muted,
  });
  y -= 15;
  p1.drawText(dateStr, { x: M, y, size: 10, font, color: BRAND.muted });
  y -= 40;

  // Score gauge (ring) — no card
  const R = 44;
  const T = 11;
  const cx = M + R + 4;
  const cy = y - R;
  p1.drawCircle({ x: cx, y: cy, size: R, borderWidth: T, borderColor: BRAND.track, color: BRAND.white });
  drawArc(p1, cx, cy, R, T, Math.min(1, readiness.score / 100), BRAND.primary);
  const scoreTxt = String(readiness.score);
  p1.drawText(scoreTxt, { x: cx - bold.widthOfTextAtSize(scoreTxt, 30) / 2, y: cy - 4, size: 30, font: bold, color: BRAND.ink });
  p1.drawText("/ 100", { x: cx - font.widthOfTextAtSize("/ 100", 9) / 2, y: cy - 22, size: 9, font, color: BRAND.muted });

  const tx = M + R * 2 + 40;
  p1.drawText("READINESS SCORE", { x: tx, y: cy + 20, size: 9, font: bold, color: BRAND.mintDark });
  p1.drawText(readiness.band, { x: tx, y: cy - 4, size: 22, font: bold, color: BRAND.primary });
  for (const [i, ln] of wrap(readiness.blurb, font, 10.5, W - M - tx).entries()) {
    p1.drawText(ln, { x: tx, y: cy - 26 - i * 14, size: 10.5, font, color: BRAND.ink });
  }
  y = cy - R - 26;

  // Snapshot
  rule(p1, y);
  y -= 22;
  p1.drawText("Snapshot", { x: M, y, size: 14, font: bold, color: BRAND.ink });
  y -= 22;
  const snap: [string, string][] = [
    ["Industry", input.industry || "—"],
    ["Team size", input.teamSize || "—"],
    ["Region", input.region || "—"],
    ["Timeline", input.timeline || "—"],
  ];
  const colW = contentW / 4;
  let snapRows = 1;
  snap.forEach(([k, v], i) => {
    const x = M + i * colW;
    p1.drawText(k.toUpperCase(), { x, y, size: 8, font: bold, color: BRAND.muted });
    const lines = wrap(v, bold, 11, colW - 12);
    snapRows = Math.max(snapRows, lines.length);
    lines.forEach((ln, j) => p1.drawText(ln, { x, y: y - 15 - j * 13, size: 11, font: bold, color: BRAND.ink }));
  });
  y -= 15 + snapRows * 13 + 16;

  // Readiness breakdown bars
  rule(p1, y);
  y -= 22;
  p1.drawText("Where you stand today", { x: M, y, size: 14, font: bold, color: BRAND.ink });
  y -= 26;
  const barW = contentW - 200;
  const barX = M + 150;
  for (const d of readiness.dims) {
    const pct = Math.round((d.value / d.max) * 100);
    p1.drawText(d.label, { x: M, y: y - 2, size: 10, font, color: BRAND.ink });
    roundedBar(p1, barX, y - 4, barW, 9, BRAND.track);
    roundedBar(p1, barX, y - 4, Math.max(9, (pct / 100) * barW), 9, BRAND.mint);
    p1.drawText(`${pct}%`, { x: barX + barW + 12, y: y - 3, size: 9, font: bold, color: BRAND.muted });
    y -= 24;
  }
  y -= 8;

  // Recommended first build — clean, no box
  const top = useCases[0];
  if (top) {
    rule(p1, y);
    y -= 22;
    p1.drawText("RECOMMENDED FIRST BUILD", { x: M, y, size: 9, font: bold, color: BRAND.mintDark });
    y -= 20;
    p1.drawText(top.title, { x: M, y, size: 15, font: bold, color: BRAND.ink });
    y -= 18;
    for (const ln of wrap(top.why, font, 10.5, contentW)) {
      p1.drawText(ln, { x: M, y, size: 10.5, font, color: BRAND.muted });
      y -= 14;
    }
    y -= 12;
  }

  // What the audit delivers
  rule(p1, y);
  y -= 22;
  p1.drawText("What your ROI-First Audit delivers", { x: M, y, size: 14, font: bold, color: BRAND.ink });
  y -= 24;
  const delivers = [
    "5–10 high-ROI use cases, scored & ranked",
    "A 90-day roadmap with owners & milestones",
    "Board-ready executive readout",
    "Clear recommendation for the first build",
  ];
  delivers.forEach((d, i) => {
    const x = M + (i % 2) * (contentW / 2);
    const yy = y - Math.floor(i / 2) * 24;
    drawCheck(p1, x, yy - 6, 9, BRAND.mintDark);
    p1.drawText(d, { x: x + 20, y: yy - 5, size: 10, font, color: BRAND.ink });
  });

  drawFooter(p1, 1);

  /* ===== PAGE 2 ===== */
  const p2 = doc.addPage([W, H]);
  drawHeader(p2);
  let y2 = H - headerH - 42;

  p2.drawText("Recommended AI use cases", { x: M, y: y2, size: 18, font: bold, color: BRAND.ink });
  y2 -= 18;
  p2.drawText("Prioritized from your inputs — scored on business impact and feasibility.", {
    x: M, y: y2, size: 10, font, color: BRAND.muted,
  });
  y2 -= 26;

  useCases.forEach((uc, i) => {
    rule(p2, y2);
    y2 -= 24;
    p2.drawText(String(i + 1), { x: M, y: y2 - 6, size: 22, font: bold, color: BRAND.numberFaint });
    const cxo = M + 34;
    p2.drawText(uc.title, { x: cxo, y: y2, size: 13, font: bold, color: BRAND.ink });
    y2 -= 16;
    for (const ln of wrap(uc.why, font, 10, W - M - cxo)) {
      p2.drawText(ln, { x: cxo, y: y2, size: 10, font, color: BRAND.muted });
      y2 -= 13;
    }
    y2 -= 4;
    // impact / feasibility as plain colored text
    const impLabel = `${uc.impact} impact`;
    p2.drawText(impLabel, { x: cxo, y: y2, size: 9, font: bold, color: BRAND.mintDark });
    let mx = cxo + bold.widthOfTextAtSize(impLabel, 9);
    p2.drawText("   ·   ", { x: mx, y: y2, size: 9, font, color: BRAND.muted });
    mx += font.widthOfTextAtSize("   ·   ", 9);
    p2.drawText(`${uc.feasibility} feasibility`, { x: mx, y: y2, size: 9, font: bold, color: BRAND.primary });
    y2 -= 22;
  });

  // Roadmap
  rule(p2, y2);
  y2 -= 24;
  p2.drawText("Your 90-day roadmap", { x: M, y: y2, size: 14, font: bold, color: BRAND.ink });
  y2 -= 26;
  const phases: [string, string][] = [
    ["Weeks 1–3", "ROI-First Audit: score use cases, confirm the first build, lock success metrics."],
    ["Weeks 4–8", `Build the first system${useCases[0] ? ` — ${useCases[0].title}` : ""}. Ship to production with an eval harness.`],
    ["Weeks 9–12", "Measure impact, tune, and expand to the second workflow."],
  ];
  // measure heights first so we can draw the connector line
  const phaseLines = phases.map(([, desc]) => wrap(desc, font, 10, W - M - 96 - 4));
  const phaseGap = (idx: number) => 6 + phaseLines[idx].length * 13 + 8;
  const roadTop = y2;
  let roadCursor = y2;
  const dotYs: number[] = [];
  phases.forEach((_, idx) => {
    dotYs.push(roadCursor - 3);
    roadCursor -= phaseGap(idx);
  });
  // vertical connector
  p2.drawLine({ start: { x: M + 5, y: dotYs[0] }, end: { x: M + 5, y: dotYs[dotYs.length - 1] }, thickness: 1.4, color: BRAND.track });
  phases.forEach(([wk], idx) => {
    const dy = dotYs[idx];
    p2.drawCircle({ x: M + 5, y: dy, size: 5, color: BRAND.mint });
    p2.drawCircle({ x: M + 5, y: dy, size: 2, color: BRAND.white });
    p2.drawText(wk, { x: M + 18, y: dy - 3, size: 10.5, font: bold, color: BRAND.primary });
    phaseLines[idx].forEach((ln, j) => p2.drawText(ln, { x: M + 96, y: dy - 3 - j * 13, size: 10, font, color: BRAND.ink }));
  });
  y2 = roadCursor - 6;

  // Compliance
  if (input.compliance.length && !input.compliance.includes("None / Not sure")) {
    rule(p2, y2);
    y2 -= 22;
    p2.drawText("Compliance to address", { x: M, y: y2, size: 14, font: bold, color: BRAND.ink });
    y2 -= 20;
    p2.drawText(input.compliance.join("    ·    "), { x: M, y: y2, size: 11, font: bold, color: BRAND.ink });
  }

  // CTA band — gradient
  const ctaH = 84;
  const ctaY = 84;
  gradient(p2, M, ctaY, contentW, ctaH, BRAND.primaryDark, BRAND.primaryLite);
  p2.drawText("Ready to build the first one?", { x: M + 22, y: ctaY + ctaH - 30, size: 15, font: bold, color: BRAND.white });
  p2.drawText("Book a free 20-min fit call — your audit fee is credited toward the first build.", {
    x: M + 22, y: ctaY + ctaH - 52, size: 10, font, color: BRAND.white,
  });
  const ctaLinkLabel = "theconverseai.com/services/ai-strategy-audit";
  p2.drawText(ctaLinkLabel, { x: M + 22, y: ctaY + 18, size: 10, font: bold, color: BRAND.mint });
  addLink(p2, M + 22, ctaY + 16, bold.widthOfTextAtSize(ctaLinkLabel, 10), 12, "https://theconverseai.com/services/ai-strategy-audit");

  drawFooter(p2, 2);

  return doc.save();
};

/* ---------- helpers for the page ---------- */
export const uint8ToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

export const downloadPdf = (bytes: Uint8Array, filename: string) => {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};
