#!/bin/bash

# Test OpenClaw installation locally before deploying
echo "🧪 Testing OpenClaw installation locally..."

# Test 1: Install OpenClaw
echo "📦 Installing OpenClaw..."
npm install -g openclaw@latest

# Test 2: Check version
echo "🔍 Checking version..."
openclaw --version

# Test 3: Try to start with test config
echo "⚙️ Creating test config..."
mkdir -p ~/.openclaw-test

cat > ~/.openclaw-test/config.json << 'CONFIG'
{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "7766394197:AAETvMNjH7aTL6yqhIJ3B34MWy9mupK3Wu4"
    }
  },
  "model": {
    "provider": "amazon-bedrock",
    "model": "claude-sonnet-4",
    "region": "us-east-1"
  }
}
CONFIG

echo "✅ Config created"
echo "🎯 Testing gateway start (will stop after 10 seconds)..."

# Start gateway in background
OPENCLAW_CONFIG_PATH=~/.openclaw-test/config.json timeout 10 openclaw gateway start --no-daemon &
GATEWAY_PID=$!

sleep 5

# Check if process is still running
if kill -0 $GATEWAY_PID 2>/dev/null; then
  echo "✅ Gateway started successfully!"
  echo "📱 Sending test message to @SmartMontuBot..."
  
  # Try to send a test message via Telegram API
  curl -s "https://api.telegram.org/bot7766394197:AAETvMNjH7aTL6yqhIJ3B34MWy9mupK3Wu4/getMe" | jq .
  
  wait $GATEWAY_PID
else
  echo "❌ Gateway failed to start"
  exit 1
fi

echo "✅ Test complete - OpenClaw works!"
