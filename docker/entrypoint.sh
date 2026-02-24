#!/bin/bash
set -e

echo "🚀 Starting OpenPaw Agent"
echo "Agent ID: $AGENT_ID"
echo "User ID: $USER_ID"

if [ "$TELEGRAM_ENABLED" = "true" ]; then
  echo "Telegram: ${TELEGRAM_BOT_TOKEN:0:10}..."
fi
if [ "$WHATSAPP_ENABLED" = "true" ]; then
  echo "WhatsApp: ENABLED"
fi

# Create workspace with git
cd /app/workspace
if [ ! -d ".git" ]; then
  echo "📁 Initializing workspace..."
  git init
  git config user.email "agent@openpaw.co"
  git config user.name "Agent-$AGENT_ID"
  
  cat > SOUL.md << 'EOF'
# Agent Soul

You are a personal AI assistant powered by OpenPaw.

Your mission: Help your user accomplish tasks efficiently and intelligently.

Be helpful, concise, and proactive.
EOF
  
  git add .
  git commit -m "Initial workspace"
  echo "✅ Workspace initialized"
fi

# Create OpenClaw configuration
mkdir -p /root/.openclaw

# Build channels configuration
CHANNELS_CONFIG=""

# Add Telegram if enabled
if [ "$TELEGRAM_ENABLED" = "true" ]; then
  CHANNELS_CONFIG="$CHANNELS_CONFIG
    \"telegram\": {
      \"enabled\": true,
      \"botToken\": \"$TELEGRAM_BOT_TOKEN\",
      \"dmPolicy\": \"open\",
      \"allowFrom\": [\"*\"]
    }"
fi

# Add WhatsApp if enabled
if [ "$WHATSAPP_ENABLED" = "true" ]; then
  # Add comma if Telegram config exists
  if [ -n "$CHANNELS_CONFIG" ]; then
    CHANNELS_CONFIG="$CHANNELS_CONFIG,"
  fi
  
  CHANNELS_CONFIG="$CHANNELS_CONFIG
    \"whatsapp\": {
      \"enabled\": true,
      \"dmPolicy\": \"open\",
      \"allowFrom\": [\"*\"],
      \"sendReadReceipts\": true,
      \"textChunkLimit\": 4000,
      \"chunkMode\": \"newline\"
    }"
fi

# Ensure at least one channel is configured
if [ -z "$CHANNELS_CONFIG" ]; then
  echo "❌ ERROR: No channels enabled!"
  exit 1
fi

cat > /root/.openclaw/config.json << EOF
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "agent-token"
    }
  },
  "channels": {
    $CHANNELS_CONFIG
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "amazon-bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0"
      }
    }
  },
  "browser": {
    "enabled": true,
    "headless": true,
    "defaultProfile": "openclaw",
    "noSandbox": true,
    "executablePath": "/usr/bin/chromium"
  }
}
EOF

export AWS_REGION=ap-south-1
echo "✅ Configuration created"

echo "🎯 Starting OpenClaw gateway..."

export OPENCLAW_CONFIG_PATH=/root/.openclaw/config.json
exec openclaw gateway run
