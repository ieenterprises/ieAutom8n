#!/bin/sh
set -e

echo "=== Injecting ieAutom8n Branding ==="

node -e '
const fs = require("fs");
const path = require("path");

const LOGO_URL = "https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png";
const APP_NAME = "ieAutom8n";

function findDistDirs(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (item === "node_modules" && dir.includes(".pnpm")) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item === "dist" && (fullPath.includes("editor-ui") || fullPath.endsWith("n8n/dist") || fullPath.includes("cli/dist"))) {
          results.push(fullPath);
        } else {
          results = results.concat(findDistDirs(fullPath));
        }
      }
    }
  } catch (e) {}
  return results;
}

const distDirs = findDistDirs("/usr/local/lib/node_modules/n8n");
console.log("Discovered target UI directories:", distDirs);

for (const dir of distDirs) {
  const staticDir = path.join(dir, "static");
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Copy branding files to both dist and dist/static
  const filesToCopy = ["branding.css", "branding.js", "landing.html", "company-logo.png"];
  for (const f of filesToCopy) {
    const src = path.join("/tmp", f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(dir, f));
      fs.copyFileSync(src, path.join(staticDir, f));
    }
  }

  // Copy favicon
  const logoSrc = "/tmp/company-logo.png";
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, path.join(dir, "favicon.ico"));
    fs.copyFileSync(logoSrc, path.join(staticDir, "favicon.ico"));
    fs.copyFileSync(logoSrc, path.join(staticDir, "n8n-logo.png"));
  }

  // Patch index.html
  const indexPath = path.join(dir, "index.html");
  if (fs.existsSync(indexPath)) {
    console.log("Patching index.html at:", indexPath);
    let html = fs.readFileSync(indexPath, "utf8");

    // Title
    html = html.replace(/<title>.*?<\/title>/gi, `<title>${APP_NAME} - Workflow Automation</title>`);

    // Clean old icon tags and inject clean company favicon
    html = html.replace(/<link[^>]*rel=["'"]icon["'"][^>]*>/gi, "");
    html = html.replace("<head>", `<head>\n\t\t<link rel="icon" type="image/png" href="${LOGO_URL}" />`);

    // Inject stylesheet via /static/ path if not already present
    if (!html.includes("/static/branding.css")) {
      html = html.replace("</head>", `\t<link rel="stylesheet" href="/static/branding.css">\n</head>`);
    }

    fs.writeFileSync(indexPath, html, "utf8");
  }
}
'

echo "=== ieAutom8n Branding Successfully Injected ==="
