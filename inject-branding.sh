#!/bin/sh
set -e

echo "=== Injecting ieAutom8n Branding ==="

LOGO_URL="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"

# Locate all dist directories inside n8n
DIST_DIRS=$(find /usr/local/lib/node_modules/n8n -type d -name "dist" 2>/dev/null)

for dir in $DIST_DIRS; do
  echo "Found dist dir: $dir"
  cp /tmp/branding.css "$dir/branding.css" 2>/dev/null || true
  cp /tmp/branding.js "$dir/branding.js" 2>/dev/null || true
  cp /tmp/landing.html "$dir/landing.html" 2>/dev/null || true
  cp /tmp/company-logo.png "$dir/company-logo.png" 2>/dev/null || true
  cp /tmp/company-logo.png "$dir/favicon.ico" 2>/dev/null || true

  # Also place in static subdirectory if exists
  if [ -d "$dir/static" ]; then
    cp /tmp/company-logo.png "$dir/static/n8n-logo.png" 2>/dev/null || true
    cp /tmp/company-logo.png "$dir/static/favicon.ico" 2>/dev/null || true
  fi
done

# Find all index.html files inside n8n
HTML_FILES=$(find /usr/local/lib/node_modules/n8n -type f -name "index.html" 2>/dev/null)

for file in $HTML_FILES; do
  echo "Patching index.html: $file"
  
  # 1. Update title
  sed -i 's/<title>.*<\/title>/<title>ieAutom8n - Workflow Automation<\/title>/g' "$file"

  # 2. Update favicon href
  sed -i "s|/favicon.ico|$LOGO_URL|g" "$file"

  # 3. Inject branding.css and branding.js before </head>
  INJECTION='<link rel="stylesheet" href="/branding.css"><script src="/branding.js" defer></script></head>'
  sed -i "s|</head>|$INJECTION|g" "$file"
done

echo "=== ieAutom8n Branding Injection Completed ==="
