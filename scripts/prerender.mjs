import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const clientDir = path.join(root, "dist");
const serverEntry = path.join(root, "dist", "server", "entry-server.js");

const sitemapPath = path.join(root, "public", "sitemap.xml");
const additionalStaticRoutes = ["/thank-you"];

async function getSitemapRoutes() {
  const sitemap = await readFile(sitemapPath, "utf8");
  return [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
}

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

  const managedMetaNames = ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"];
  for (const name of managedMetaNames) {
    if (head.includes(`name=\"${name}\"`)) {
      stripped = removeTemplateTag(stripped, new RegExp(`\\n?\\s*<meta\\s+name=["']${name}["'][^>]*>`, "i"));
    }
  }

  const managedMetaProperties = ["og:title", "og:description", "og:type", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt", "og:site_name"];
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
const { render } = await import(pathToFileURL(serverEntry).href);
const routes = [...new Set([...(await getSitemapRoutes()), ...additionalStaticRoutes, ...(await getCaseStudyRoutes())])];

await rm(path.join(root, "dist", "server"), { recursive: true, force: true });

for (const route of routes) {
  const rendered = render(route);
  const file = routeToFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, injectRenderedHtml(template, rendered));
  console.log(`prerendered ${route}`);
}
