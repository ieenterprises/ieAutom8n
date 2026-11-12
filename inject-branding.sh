#!/bin/sh
set -e

echo "=== Injecting ieAutom8n Branding ==="

LOGO_URL="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"

# Find all dist directories inside n8n
for dir in $(find /usr/local/lib/node_modules/n8n -type d -name "dist" 2>/dev/null); do
  echo "Injecting into dist directory: $dir"
  mkdir -p "$dir/static"

  # Copy to root of dist
  cp -f /tmp/branding.css "$dir/branding.css" || true
  cp -f /tmp/branding.js "$dir/branding.js" || true
  cp -f /tmp/landing.html "$dir/landing.html" || true
  cp -f /tmp/company-logo.png "$dir/company-logo.png" || true
  cp -f /tmp/company-logo.png "$dir/favicon.ico" || true

  # Copy to static/ inside dist so it bypasses historyApiHandler
  cp -f /tmp/branding.css "$dir/static/branding.css" || true
  cp -f /tmp/branding.js "$dir/static/branding.js" || true
  cp -f /tmp/landing.html "$dir/static/landing.html" || true
  cp -f /tmp/company-logo.png "$dir/static/company-logo.png" || true
  cp -f /tmp/company-logo.png "$dir/static/favicon.ico" || true
  cp -f /tmp/company-logo.png "$dir/static/n8n-logo.png" || true

  # Deep replace strings across all JS and JSON chunks in this dist
  echo "Deep string replacement in: $dir"
  find "$dir" -type f \( -name "*.js" -o -name "*.json" \) -exec sed -i \
    -e 's/n8n Assistant/ieAutom8n Assistant/g' \
    -e 's/n8n assistant/ieAutom8n assistant/g' \
    -e 's/about n8n/about ieAutom8n/g' \
    -e 's/with n8n/with ieAutom8n/g' \
    -e 's/for n8n/for ieAutom8n/g' \
    -e 's/in n8n/in ieAutom8n/g' \
    -e 's/to n8n/to ieAutom8n/g' \
    -e 's/from n8n/from ieAutom8n/g' \
    -e 's/tailor n8n to you/tailor ieAutom8n to you/g' \
    -e 's/Customize n8n to you/Customize ieAutom8n to you/g' \
    -e 's/Welcome to n8n/Welcome to ieAutom8n/g' \
    -e 's/Get ready for n8n/Get ready for ieAutom8n/g' \
    -e 's/Set up owner account/Create ieAutom8n Account/g' \
    {} + 2>/dev/null || true
done

# Patch all index.html files
for file in $(find /usr/local/lib/node_modules/n8n -type f -name "index.html" 2>/dev/null); do
  echo "Patching index.html: $file"
  
  # 1. Update Title
  sed -i 's/<title>.*<\/title>/<title>ieAutom8n - Workflow Automation<\/title>/g' "$file"

  # 2. Fix Favicon: remove any existing / broken icon tags and insert fresh clean tag
  sed -i 's/<link rel="icon".*\/>//g' "$file"
  sed -i 's/<link rel="icon".*>//g' "$file"
  sed -i 's/<head>/<head><link rel="icon" type="image\/png" href="'"$LOGO_URL"'" \/>/g' "$file"

  # 3. Inject branding.css via /static/ path so it bypasses historyApiHandler
  if ! grep -q "static/branding.css" "$file"; then
    sed -i 's|</head>|<link rel="stylesheet" href="/static/branding.css"></head>|g' "$file"
  fi
done

echo "=== ieAutom8n Rebranding Successfully Injected ==="
