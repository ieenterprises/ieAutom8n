# Production Dockerfile for deploying ieAutom8n to Render.com
FROM n8nio/n8n:latest

USER node

# Default port
ENV PORT=5678
ENV N8N_PORT=5678

EXPOSE 5678
