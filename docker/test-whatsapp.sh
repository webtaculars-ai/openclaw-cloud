#!/bin/bash
# Test script to verify OpenClaw WhatsApp support

echo "🧪 Testing OpenClaw WhatsApp support..."

# Check if openclaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found"
    exit 1
fi

echo "✅ OpenClaw installed: $(openclaw --version)"

# Check if Baileys is available
if npm list -g @whiskeysockets/baileys &> /dev/null; then
    echo "✅ Baileys package found"
else
    echo "❌ Baileys package missing"
    exit 1
fi

# Try to get help for channels command
if openclaw channels --help &> /dev/null; then
    echo "✅ channels command exists"
else
    echo "⚠️ channels command not found"
fi

# Try to check if WhatsApp channel is supported
# Create a minimal config and try to validate it
mkdir -p /tmp/test-openclaw
cat > /tmp/test-openclaw/config.json << 'EOF'
{
  "channels": {
    "whatsapp": {
      "enabled": true
    }
  }
}
EOF

export OPENCLAW_CONFIG_PATH=/tmp/test-openclaw/config.json

# Try doctor command which should validate config
if timeout 5s openclaw doctor 2>&1 | grep -q "whatsapp"; then
    echo "✅ WhatsApp channel recognized by OpenClaw"
    exit 0
else
    echo "❌ WhatsApp channel NOT recognized"
    echo "Available output:"
    timeout 5s openclaw doctor 2>&1 || true
    exit 1
fi
