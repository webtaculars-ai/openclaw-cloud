#!/bin/bash
set -e

echo "Starting OpenClaw agent container..."
echo "Agent ID: ${AGENT_ID}"
echo "User ID: ${USER_ID}"
echo "Model: ${MODEL}"

# Substitute environment variables in config template
envsubst < /app/config/openclaw.json.template > /app/config/openclaw.json

echo "Generated OpenClaw config:"
cat /app/config/openclaw.json

# Start proxy in background
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

# Start OpenClaw (exec replaces shell, so it becomes PID 1)
echo "Starting OpenClaw..."
exec openclaw gateway start --config /app/config/openclaw.json
