FROM public.ecr.aws/docker/library/node:22-slim

# Install dependencies including Chromium and SSM Session Manager for ECS Exec
RUN apt-get update && apt-get install -y \
    bash \
    git \
    curl \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install AWS SSM Session Manager plugin for ECS Exec
RUN curl -sL "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o /tmp/session-manager-plugin.deb && \
    dpkg -i /tmp/session-manager-plugin.deb && \
    rm /tmp/session-manager-plugin.deb

# Set Chromium executable path for Playwright/Puppeteer
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install OpenClaw globally with all dependencies AND Baileys peer dependencies
RUN npm install -g openclaw@latest \
    @napi-rs/canvas@^0.1.89 \
    node-llama-cpp@3.15.1 \
    audio-decode@^2.1.3 \
    jimp@^1.6.0 \
    link-preview-js@^3.0.0 \
    sharp \
    --loglevel=error

# Patch WhatsApp schema to fix "Unsupported channel" bug
# Fix for: https://github.com/openclaw/openclaw/issues/24931
COPY patch-whatsapp.sh /tmp/patch-whatsapp.sh
RUN chmod +x /tmp/patch-whatsapp.sh && /tmp/patch-whatsapp.sh && rm /tmp/patch-whatsapp.sh

# Verify installation
RUN openclaw --version

# Create workspace directory
RUN mkdir -p /app/workspace

WORKDIR /app

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
