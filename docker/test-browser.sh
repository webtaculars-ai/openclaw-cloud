#!/bin/bash
# Test script for browser automation in OpenPaw agents

set -e

echo "🧪 Testing Browser Automation"
echo "================================"

# Test 1: Check Chromium installation
echo ""
echo "✓ Test 1: Chromium installed"
if command -v chromium &> /dev/null; then
    chromium --version
else
    echo "❌ FAILED: Chromium not found"
    exit 1
fi

# Test 2: Check required libraries
echo ""
echo "✓ Test 2: Checking required libraries"
REQUIRED_LIBS=(
    "libgbm.so.1"
    "libnss3.so"
    "libatk-1.0.so.0"
    "libcups.so.2"
)

for lib in "${REQUIRED_LIBS[@]}"; do
    if ldconfig -p | grep -q "$lib"; then
        echo "  ✓ $lib found"
    else
        echo "  ❌ $lib missing"
        exit 1
    fi
done

# Test 3: Test Chromium headless mode
echo ""
echo "✓ Test 3: Testing headless Chromium"
chromium --headless --disable-gpu --no-sandbox --dump-dom https://example.com > /tmp/test-output.html 2>&1
if grep -q "Example Domain" /tmp/test-output.html; then
    echo "  ✓ Chromium headless mode works"
else
    echo "  ❌ Chromium headless test failed"
    exit 1
fi

echo ""
echo "✅ All browser automation tests passed!"
echo ""
echo "Next steps:"
echo "1. Build and push Docker image to ECR"
echo "2. Deploy updated ECS task definition (1 vCPU, 2GB RAM)"
echo "3. Start a test agent via OpenPaw dashboard"
echo "4. Send agent: 'Open google.com and take a screenshot'"
