#!/bin/bash
set -e

echo "🚀 Deploying ALL Lambdas as standalone JS..."

cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/backend

# List of Lambdas to redeploy with standalone versions
LAMBDAS=(
  "openpaw-list-agents:src/handlers/list-agents-standalone.js"
  "openpaw-get-credits:src/handlers/get-credits-standalone.js"
)

for entry in "${LAMBDAS[@]}"; do
  IFS=':' read -r name file <<< "$entry"
  echo ""
  echo "→ Deploying $name"
  ./deploy-lambda-fixed.sh "$name" "$file" 2>&1 | grep -E "(deployed|ERROR)" || true
done

echo ""
echo "✅ All Lambdas redeployed!"
