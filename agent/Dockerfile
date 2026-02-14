# Stage 1: Build proxy
FROM node:22-slim AS proxy-builder

WORKDIR /build

COPY proxy/package*.json ./
RUN npm ci

COPY proxy/tsconfig.json ./
COPY proxy/src ./src

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Runtime
FROM node:22-slim

# Install curl (for health checks) and gettext-base (for envsubst)
RUN apt-get update && \
    apt-get install -y curl git gettext-base && \
    rm -rf /var/lib/apt/lists/*

# Install OpenClaw from npm (requires Node >= 22)
RUN npm install -g openclaw@latest

WORKDIR /app

# Copy proxy built artifacts
COPY --from=proxy-builder /build/dist ./proxy/dist
COPY --from=proxy-builder /build/node_modules ./proxy/node_modules

# Copy agent config template
COPY config/openclaw.json.template ./config/

# Copy entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# OpenClaw home directory for config and session data
RUN mkdir -p /home/node/.openclaw && chown -R node:node /home/node

# Health check against the metering proxy
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -sf http://localhost:8080/health || exit 1

EXPOSE 8080 18789

ENTRYPOINT ["./entrypoint.sh"]
