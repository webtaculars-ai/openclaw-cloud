#!/bin/bash
set -e

echo "Starting OpenClaw agent container..."
echo "Agent ID: ${AGENT_ID}"
echo "User ID: ${USER_ID}"
echo "Model: ${MODEL}"

# Generate a per-container gateway token if not provided
export GATEWAY_TOKEN="${GATEWAY_TOKEN:-$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")}"

# Substitute environment variables in config template
envsubst < /app/config/openclaw.json.template > /home/node/.openclaw/openclaw.json

echo "Generated OpenClaw config:"
cat /home/node/.openclaw/openclaw.json

# Ensure workspace directory exists
mkdir -p /home/node/.openclaw/workspace

# Start metering proxy in background
echo "Starting metering proxy..."
node /app/proxy/dist/index.js &
PROXY_PID=$!

# Wait for proxy to be healthy (up to 30 seconds)
echo "Waiting for proxy health check..."
for i in {1..30}; do
  if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo "Proxy is healthy!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "ERROR: Proxy failed to start within 30 seconds"
    exit 1
  fi
  sleep 1
done

# Start OpenClaw gateway (exec replaces shell, so it becomes PID 1)
echo "Starting OpenClaw gateway..."
exec openclaw gateway --port 18789
