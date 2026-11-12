# Production Dockerfile for deploying n8n to Render.com
FROM n8nio/n8n:latest

USER root

# Install optional system tools and Python for n8n Execute Command / Python nodes
RUN apk add --no-cache curl bash python3 py3-pip

USER node

# Default port
ENV PORT=5678
ENV N8N_PORT=5678

EXPOSE 5678
