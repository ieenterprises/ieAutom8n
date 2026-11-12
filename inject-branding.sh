#!/bin/sh
set -e

echo "=== Injecting ieAutom8n Branding ==="

LOGO_URL="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"

# Find all directories named dist inside n8n
for dir in $(find /usr/local/lib/node_modules/n8n -type d -name "dist" 2>/dev/null); do
  echo "Injecting into dist: $dir"
  cp -f /tmp/branding.css "$dir/branding.css" || true
  cp -f /tmp/branding.js "$dir/branding.js" || true
  cp -f /tmp/landing.html "$dir/landing.html" || true
  cp -f /tmp/company-logo.png "$dir/company-logo.png" || true
  cp -f /tmp/company-logo.png "$dir/favicon.ico" || true

  if [ -d "$dir/static" ]; then
    cp -f /tmp/company-logo.png "$dir/static/n8n-logo.png" || true
    cp -f /tmp/company-logo.png "$dir/static/favicon.ico" || true
  fi

  # Replace hardcoded strings in all compiled JS chunks
  echo "Replacing n8n text strings in: $dir"
  find "$dir" -maxdepth 2 -type f -name "*.js" -exec sed -i \
    -e 's/Customize n8n to you/Customize ieAutom8n to you/g' \
    -e 's/tailor n8n to you/tailor ieAutom8n to you/g' \
    -e 's/hear about n8n/hear about ieAutom8n/g' \
    -e 's/Welcome to n8n/Welcome to ieAutom8n/g' \
    -e 's/Set up owner account/Create ieAutom8n Account/g' \
    {} + 2>/dev/null || true
done

# Patch all index.html files
for file in $(find /usr/local/lib/node_modules/n8n -type f -name "index.html" 2>/dev/null); do
  echo "Patching index.html: $file"
  sed -i 's/<title>.*<\/title>/<title>ieAutom8n - Workflow Automation<\/title>/g' "$file"
  sed -i "s|/favicon.ico|$LOGO_URL|g" "$file"
  
  # Inject branding.css and custom favicon into head
  if ! grep -q "branding.css" "$file"; then
    sed -i 's|</head>|<link rel="icon" type="image/png" href="'"$LOGO_URL"'" /><link rel="stylesheet" href="/branding.css"></head>|g' "$file"
  fi
done

echo "=== ieAutom8n Branding Complete ==="
