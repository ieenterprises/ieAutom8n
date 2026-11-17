# Production Dockerfile for deploying ieAutom8n to Render.com
FROM ghcr.io/ieenterprises/ieautom8n:main

USER node

# Default port
ENV PORT=5678
ENV N8N_PORT=5678
ENV NODE_OPTIONS="--max-old-space-size=1536"

EXPOSE 5678
