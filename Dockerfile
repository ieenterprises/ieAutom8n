# Production Dockerfile for deploying ieAutom8n to Render.com
FROM n8nio/n8n:latest

USER root

# Copy branding assets and injector
COPY branding.css /tmp/branding.css
COPY branding.js /tmp/branding.js
COPY landing.html /tmp/landing.html
COPY company-logo.png /tmp/company-logo.png
COPY inject-branding.sh /tmp/inject-branding.sh

# Run injector to white-label the frontend
RUN chmod +x /tmp/inject-branding.sh && /tmp/inject-branding.sh

USER node

# Default port
ENV PORT=5678
ENV N8N_PORT=5678

EXPOSE 5678
