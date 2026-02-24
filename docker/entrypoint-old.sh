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
  
  cat > SOUL.md << EOF
# Agent Soul

You are a personal AI assistant for user $USER_ID.

## Context
- Agent ID: $AGENT_ID  
- Platform: OpenPaw

## Your Role
Privacy-first, helpful, conversational assistant.
Build context over time with this user.
EOF

  git add .
  git commit -m "Initial workspace"
  echo "✅ Workspace initialized"
fi

# Create OpenClaw config with EXPLICIT BEDROCK MODEL
echo "⚙️ Creating OpenClaw configuration..."
mkdir -p /root/.openclaw

# Build channels config dynamically
CHANNELS_CONFIG=""

# Add Telegram if enabled
if [ "$TELEGRAM_ENABLED" = "true" ] && [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  CHANNELS_CONFIG='"telegram": {
      "enabled": true,
      "botToken": "$TELEGRAM_BOT_TOKEN",
      "dmPolicy": "open",
      "allowFrom": ["*"]
    }'
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
  echo "❌ ERROR: No channels enabled! At least one channel (Telegram or WhatsApp) must be enabled."
  exit 1
fi

# CRITICAL: Use agents.defaults.model to set default model
# This tells OpenClaw to use Bedrock, not Anthropic direct
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

echo "✅ Configuration created"

# Debug: Show the generated config (sanitize tokens)
echo "📋 Generated config:"
cat /root/.openclaw/config.json | head -30

# Set AWS region for Bedrock
export AWS_REGION=ap-south-1

echo "🌍 AWS Region: ap-south-1"
echo "🤖 Model: amazon-bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0"

# WhatsApp QR Generation (before gateway starts)
if [ "$WHATSAPP_ENABLED" = "true" ]; then
  echo "📱 Generating WhatsApp QR code..."
  echo "This may take 10-30 seconds..."
  
  # Run channels login with timeout, capture BOTH stdout and stderr
  timeout 120s openclaw channels login --channel whatsapp 2>&1 | tee /tmp/whatsapp-login.txt
  EXIT_CODE=$?
  
  echo "Command exited with code: $EXIT_CODE"
  echo "Output length: $(wc -l < /tmp/whatsapp-login.txt) lines"
  
  # Show first 50 lines of output for debugging
  echo "First 50 lines of output:"
  head -50 /tmp/whatsapp-login.txt
  
  # Check if QR was generated
  if grep -q "████" /tmp/whatsapp-login.txt; then
    echo "✅ WhatsApp QR code generated!"
    
    # Extract QR code (the QR plus some context)
    grep -B 2 -A 25 "████" /tmp/whatsapp-login.txt > /tmp/qr-code.txt
    
    # Upload to S3
    if aws s3 cp /tmp/qr-code.txt \
      s3://openpaw-whatsapp-qr/${AGENT_ID}/qr.txt \
      --region ap-south-1 2>&1; then
      
      echo "✅ QR code uploaded to S3"
      
      # Create timestamp
      date -u +%s > /tmp/qr-timestamp.txt
      aws s3 cp /tmp/qr-timestamp.txt \
        s3://openpaw-whatsapp-qr/${AGENT_ID}/timestamp.txt \
        --region ap-south-1 2>&1
      
      echo "📱 QR code is ready! User can now scan it from the UI."
      echo "⏳ Waiting up to 10 minutes for WhatsApp to be linked..."
      
      # Wait for credentials file to appear (means user scanned QR)
      for i in {1..60}; do
        if [ -f /root/.openclaw/credentials/whatsapp/default/creds.json ]; then
          echo "✅ WhatsApp linked successfully!"
          break
        fi
        
        # Show progress every 30 seconds
        if [ $((i % 3)) -eq 0 ]; then
          echo "⏳ Still waiting for QR scan... ($((i * 10)) seconds elapsed)"
        fi
        
        sleep 10
      done
      
      # Check final status
      if [ -f /root/.openclaw/credentials/whatsapp/default/creds.json ]; then
        echo "🎉 WhatsApp is now linked and ready!"
      else
        echo "⚠️ QR scan timeout. Gateway will start anyway."
        echo "⚠️ User can re-provision agent to try again."
      fi
      
    else
      echo "⚠️ Failed to upload QR to S3"
    fi
  else
    echo "⚠️ WhatsApp QR generation failed or timed out"
    echo "Debug output:"
    cat /tmp/whatsapp-login.txt | head -20
  fi
fi

echo "🎯 Starting OpenClaw gateway..."

export OPENCLAW_CONFIG_PATH=/root/.openclaw/config.json
exec openclaw gateway run
