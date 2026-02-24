#!/bin/bash
# Add Cron Jobs API routes to existing REST API

set -e

API_ID="1a6hcrf5mj"
REGION="ap-south-1"
ACCOUNT_ID="851725418250"

echo "🔧 Adding Cron Jobs API Routes"
echo "=============================="
echo ""

# Get the /agents/{agentId} resource ID
AGENT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/agents/{agentId}`].id' --output text)

echo "1️⃣ Found /agents/{agentId} resource: $AGENT_RESOURCE_ID"
echo ""

# Create /agents/{agentId}/cron resource
echo "2️⃣ Creating /cron resource..."
CRON_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $AGENT_RESOURCE_ID \
  --path-part cron \
  --region $REGION \
  --query 'id' \
  --output text 2>&1) || CRON_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/agents/{agentId}/cron`].id' --output text)

echo "   Cron resource: $CRON_RESOURCE_ID"
echo ""

# GET /agents/{agentId}/cron - List jobs
echo "3️⃣ Adding GET method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $CRON_RESOURCE_ID \
  --http-method GET \
  --authorization-type COGNITO_USER_POOLS \
  --authorizer-id $(aws apigateway get-authorizers --rest-api-id $API_ID --region $REGION --query 'items[0].id' --output text) \
  --region $REGION >/dev/null 2>&1 || echo "   GET method exists"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $CRON_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:openpaw-list-cron-jobs/invocations" \
  --region $REGION >/dev/null 2>&1 || echo "   GET integration exists"

echo "   ✅ GET /agents/{agentId}/cron"

# POST /agents/{agentId}/cron - Create job
echo "4️⃣ Adding POST method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $CRON_RESOURCE_ID \
  --http-method POST \
  --authorization-type COGNITO_USER_POOLS \
  --authorizer-id $(aws apigateway get-authorizers --rest-api-id $API_ID --region $REGION --query 'items[0].id' --output text) \
  --region $REGION >/dev/null 2>&1 || echo "   POST method exists"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $CRON_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:openpaw-create-cron-job/invocations" \
  --region $REGION >/dev/null 2>&1 || echo "   POST integration exists"

echo "   ✅ POST /agents/{agentId}/cron"

# Create /agents/{agentId}/cron/{jobId} resource
echo "5️⃣ Creating /{jobId} resource..."
JOB_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $CRON_RESOURCE_ID \
  --path-part '{jobId}' \
  --region $REGION \
  --query 'id' \
  --output text 2>&1) || JOB_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/agents/{agentId}/cron/{jobId}`].id' --output text)

echo "   JobId resource: $JOB_RESOURCE_ID"

# DELETE /agents/{agentId}/cron/{jobId}
echo "6️⃣ Adding DELETE method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $JOB_RESOURCE_ID \
  --http-method DELETE \
  --authorization-type COGNITO_USER_POOLS \
  --authorizer-id $(aws apigateway get-authorizers --rest-api-id $API_ID --region $REGION --query 'items[0].id' --output text) \
  --region $REGION >/dev/null 2>&1 || echo "   DELETE method exists"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $JOB_RESOURCE_ID \
  --http-method DELETE \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:openpaw-delete-cron-job/invocations" \
  --region $REGION >/dev/null 2>&1 || echo "   DELETE integration exists"

echo "   ✅ DELETE /agents/{agentId}/cron/{jobId}"

# Create /agents/{agentId}/cron/{jobId}/run resource
echo "7️⃣ Creating /run resource..."
RUN_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $JOB_RESOURCE_ID \
  --path-part run \
  --region $REGION \
  --query 'id' \
  --output text 2>&1) || RUN_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/agents/{agentId}/cron/{jobId}/run`].id' --output text)

echo "   Run resource: $RUN_RESOURCE_ID"

# POST /agents/{agentId}/cron/{jobId}/run
echo "8️⃣ Adding POST /run method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RUN_RESOURCE_ID \
  --http-method POST \
  --authorization-type COGNITO_USER_POOLS \
  --authorizer-id $(aws apigateway get-authorizers --rest-api-id $API_ID --region $REGION --query 'items[0].id' --output text) \
  --region $REGION >/dev/null 2>&1 || echo "   POST method exists"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RUN_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:openpaw-run-cron-job/invocations" \
  --region $REGION >/dev/null 2>&1 || echo "   POST integration exists"

echo "   ✅ POST /agents/{agentId}/cron/{jobId}/run"

# Deploy API
echo ""
echo "9️⃣ Deploying API..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --description "Added cron job endpoints" \
  --region $REGION >/dev/null

echo "   ✅ Deployed to prod stage"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API ROUTES ADDED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Endpoints:"
echo "  GET    /agents/{agentId}/cron"
echo "  POST   /agents/{agentId}/cron"
echo "  DELETE /agents/{agentId}/cron/{jobId}"
echo "  POST   /agents/{agentId}/cron/{jobId}/run"
echo ""
echo "URL: https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod"
echo ""
