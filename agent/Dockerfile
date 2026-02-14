# Stage 1: Build proxy
FROM node:20-slim AS proxy-builder

WORKDIR /build

COPY proxy/package*.json ./
RUN npm ci

COPY proxy/tsconfig.json ./
COPY proxy/src ./src

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Runtime
FROM node:20-slim

# Install curl (for health checks) and gettext-base (for envsubst)
RUN apt-get update && \
    apt-get install -y curl gettext-base && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy proxy built artifacts
COPY --from=proxy-builder /build/dist ./proxy/dist
COPY --from=proxy-builder /build/node_modules ./proxy/node_modules

# Copy agent config template
COPY config/openclaw.json.template ./config/

# Copy entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Placeholder for OpenClaw binary
# In real deployment, this would be replaced by CI:
# RUN wget -O /usr/local/bin/openclaw https://releases.openclaw.ai/latest/openclaw-linux-x64 && chmod +x /usr/local/bin/openclaw
RUN echo '#!/bin/bash\necho "OpenClaw binary placeholder - replace in CI"\nsleep infinity' > /usr/local/bin/openclaw && chmod +x /usr/local/bin/openclaw

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -sf http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]
