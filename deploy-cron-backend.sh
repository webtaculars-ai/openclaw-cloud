#!/bin/bash
# Deploy Cron Jobs Backend

set -e

echo "🚀 Deploying Cron Jobs Backend"
echo "================================"
echo ""

# Step 1: Compile TypeScript
echo "📦 Step 1/3: Compiling TypeScript..."
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/backend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "✅ TypeScript compiled successfully"
echo ""

# Step 2: Deploy Database Stack
echo "🗄️  Step 2/3: Deploying Database Stack (new tables)..."
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/infra
npm run build
cdk deploy OpenClawCloudDatabase --require-approval never

if [ $? -ne 0 ]; then
    echo "❌ Database deployment failed"
    exit 1
fi

echo "✅ Database stack deployed"
echo ""

# Step 3: Deploy API Stack
echo "🔌 Step 3/3: Deploying API Stack (Lambda functions + routes)..."
cdk deploy OpenClawCloudApi --require-approval never

if [ $? -ne 0 ]; then
    echo "❌ API deployment failed"
    exit 1
fi

echo "✅ API stack deployed"
echo ""

# Verify
echo "🔍 Verifying deployment..."
echo ""

echo "📊 DynamoDB Tables:"
aws dynamodb list-tables | grep openclaw-cron

echo ""
echo "⚡ Lambda Functions:"
aws lambda list-functions --query 'Functions[?contains(FunctionName, `Cron`)].FunctionName' --output table

echo ""
echo "🎯 API Endpoints:"
echo "  GET    /agents/{agentId}/cron"
echo "  POST   /agents/{agentId}/cron"
echo "  PUT    /agents/{agentId}/cron/{jobId}"
echo "  DELETE /agents/{agentId}/cron/{jobId}"
echo "  POST   /agents/{agentId}/cron/{jobId}/run"

echo ""
echo "✅ Cron Jobs Backend Deployed!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Agent messaging NOT yet implemented"
echo "   - Jobs will be created but won't send messages to agents"
echo "   - See CRON_IMPLEMENTATION_SUMMARY.md for next steps"
echo ""
echo "📖 Test with frontend: https://openpaw.co/dashboard"
