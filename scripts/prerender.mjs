import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const clientDir = path.join(root, "dist");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");

const staticRoutes = [
  "/",
  "/about-us",
  "/contact-us",
  "/book-demo",
  "/blog",
  "/case-studies",
  "/solutions/ai-for-smb",
  "/services",
  "/services/ai-strategy-audit",
  "/services/agentic-automation",
  "/services/ai-integration",
  "/services/ai-voice-agents",
  "/services/custom-ai-agents",
  "/services/knowledge-intelligence",
  "/services/sales-ai",
  "/chatbot",
  "/live-chat",
  "/pre-chat-forms",
  "/omni-channel",
  "/whatsapp-ai-chatbot",
  "/whatsapp-shop",
  "/whatsapp-marketing",
  "/agent-capacity",
  "/private-notes",
  "/live-view",
  "/teams-2",
  "/agent-reports",
  "/csat-report",
  "/team-reports",
  "/inbox-reports",
  "/thank-you",
  "/terms-and-conditions",
  "/privacy-policy",
];

async function getCaseStudyRoutes() {
  const caseStudiesSource = await readFile(path.join(root, "src", "data", "caseStudies.ts"), "utf8");
  return [...caseStudiesSource.matchAll(/slug:\s*["']([^"']+)["']/g)].map(
    ([, slug]) => `/case-studies/${slug}`,
  );
}

function routeToFile(route) {
  return path.join(clientDir, route === "/" ? "index.html" : path.join(route.slice(1), "index.html"));
}

function removeTemplateTag(html, pattern) {
  return html.replace(pattern, "");
}

function stripDuplicateSeoDefaults(html, head) {
  let stripped = html;

  if (head.includes("<title")) {
    stripped = removeTemplateTag(stripped, /\n?\s*<title>.*?<\/title>/s);
  }

  const managedMetaNames = ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  for (const name of managedMetaNames) {
    if (head.includes(`name=\"${name}\"`)) {
      stripped = removeTemplateTag(stripped, new RegExp(`\\n?\\s*<meta\\s+name=["']${name}["'][^>]*>`, "i"));
    }
  }

  const managedMetaProperties = ["og:title", "og:description", "og:type", "og:url", "og:image", "og:site_name"];
  for (const property of managedMetaProperties) {
    if (head.includes(`property=\"${property}\"`)) {
      stripped = removeTemplateTag(stripped, new RegExp(`\\n?\\s*<meta\\s+property=["']${property}["'][^>]*>`, "i"));
    }
  }

  if (head.includes('rel=\"canonical\"')) {
    stripped = removeTemplateTag(stripped, /\n?\s*<link\s+rel=["']canonical["'][^>]*>/i);
  }

  return stripped;
}

function injectRenderedHtml(template, { appHtml, head }) {
  let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  if (head) {
    html = stripDuplicateSeoDefaults(html, head);
    html = html.replace("</head>", `<!-- Prerendered route metadata -->\n${head}\n</head>`);
  }

  return html;
}

const template = await readFile(path.join(clientDir, "index.html"), "utf8");
const { render } = await import(serverEntry);
const routes = [...new Set([...staticRoutes, ...(await getCaseStudyRoutes())])];

await rm(path.join(root, "dist", "server"), { recursive: true, force: true });

for (const route of routes) {
  const rendered = render(route);
  const file = routeToFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, injectRenderedHtml(template, rendered));
  console.log(`prerendered ${route}`);
}
