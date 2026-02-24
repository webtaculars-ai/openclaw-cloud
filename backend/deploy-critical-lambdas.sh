#!/bin/bash
set -e

echo "🚀 Deploying ALL critical Lambdas..."

cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/backend

# Deploy each Lambda
for lambda in provision-agent get-agent start-agent stop-agent; do
  echo ""
  echo "→ Deploying openpaw-$lambda"
  ./deploy-lambda-fixed.sh "openpaw-$lambda" "src/handlers/${lambda}-standalone.js" 2>&1 | tail -1
done

echo ""
echo "✅ All Lambdas deployed!"
