# ==============================================================================
# SAKEC DevSecOps Lab - SafeCampus Emergency Response System
# Multi-Stage Secure Dockerfile (Hardened for Trivy & SonarQube Compliance)
# Aligned with SDG 9: Industry, Innovation and Infrastructure
# ==============================================================================

# ----------------- STAGE 1: Dependency & Build Stage -----------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install security updates
RUN apk update && apk upgrade --no-cache

# Copy package descriptors first to maximize Docker layer cache
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --only=production --ignore-scripts

# ----------------- STAGE 2: Minimal Hardened Production Runtime -----------------
FROM node:20-alpine AS runner

LABEL maintainer="SAKEC DevSecOps Team" \
      project="SafeCampus" \
      course="CSCOR1PC302" \
      version="1.0.0" \
      description="Smart Campus Emergency Response System Container"

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /usr/src/app

# Upgrade OS packages to remediate base image vulnerabilities (Zero Criticals for Trivy)
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache curl tzdata && \
    rm -rf /var/cache/apk/*

# Copy production node_modules from builder
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

# Security Hardening: Switch from root to unprivileged 'node' user (UID 1000)
USER node

# Expose internal service port
EXPOSE 3000

# Container Healthcheck (polled by Docker engine & AWS ALB/ECS)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start SafeCampus API & Web Dashboard
CMD ["node", "src/server.js"]
