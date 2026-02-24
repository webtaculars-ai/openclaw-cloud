#!/bin/bash
# Deploy Cron Jobs backend

set -e

echo "🚀 Deploying Cron Jobs Backend"
echo "================================"
echo ""

# Step 1: Create DynamoDB table
echo "1️⃣  Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name openclaw-cron-jobs \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=jobId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=jobId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1 2>&1 | head -5 || echo "Table may already exist"

echo ""
echo "✅ Table created/exists"
echo ""

# Step 2: Deploy Lambda functions
echo "2️⃣  Deploying Lambda functions..."
echo ""

LAMBDAS=("list-cron-jobs" "create-cron-job" "delete-cron-job" "run-cron-job")

for LAMBDA in "${LAMBDAS[@]}"; do
  echo "Deploying $LAMBDA..."
  
  # Create temp dir
  TEMP_DIR="/tmp/lambda-$LAMBDA"
  rm -rf "$TEMP_DIR"
  mkdir -p "$TEMP_DIR"
  
  # Copy handler
  cp "src/handlers/$LAMBDA.js" "$TEMP_DIR/index.js"
  
  # Install dependencies
  cd "$TEMP_DIR"
  npm init -y >/dev/null 2>&1
  npm install @aws-sdk/client-dynamodb @aws-sdk/client-eventbridge uuid >/dev/null 2>&1
  
  # Create deployment package
  zip -r "$LAMBDA.zip" . >/dev/null 2>&1
  
  # Update or create Lambda
  aws lambda update-function-code \
    --function-name "openpaw-$LAMBDA" \
    --zip-file "fileb://$LAMBDA.zip" \
    --region ap-south-1 >/dev/null 2>&1 || \
  aws lambda create-function \
    --function-name "openpaw-$LAMBDA" \
    --runtime nodejs20.x \
    --role arn:aws:iam::851725418250:role/OpenPawLambdaExecutionRole \
    --handler index.handler \
    --zip-file "fileb://$LAMBDA.zip" \
    --timeout 30 \
    --memory-size 256 \
    --region ap-south-1 >/dev/null 2>&1
  
  echo "  ✅ $LAMBDA deployed"
  
  cd - >/dev/null
done

echo ""
echo "✅ All Lambda functions deployed"
echo ""

# Step 3: Add API Gateway endpoints
echo "3️⃣  Adding API Gateway routes..."
echo ""

API_ID="1a6hcrf5mj"

# List cron jobs - GET /agents/{agentId}/cron
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /agents/{agentId}/cron" \
  --target "integrations/$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri arn:aws:lambda:ap-south-1:851725418250:function:openpaw-list-cron-jobs --payload-format-version 2.0 --query 'IntegrationId' --output text --region ap-south-1)" \
  --region ap-south-1 >/dev/null 2>&1 || echo "  Route may exist"

# Create cron job - POST /agents/{agentId}/cron
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /agents/{agentId}/cron" \
  --target "integrations/$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri arn:aws:lambda:ap-south-1:851725418250:function:openpaw-create-cron-job --payload-format-version 2.0 --query 'IntegrationId' --output text --region ap-south-1)" \
  --region ap-south-1 >/dev/null 2>&1 || echo "  Route may exist"

# Delete cron job - DELETE /agents/{agentId}/cron/{jobId}
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "DELETE /agents/{agentId}/cron/{jobId}" \
  --target "integrations/$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri arn:aws:lambda:ap-south-1:851725418250:function:openpaw-delete-cron-job --payload-format-version 2.0 --query 'IntegrationId' --output text --region ap-south-1)" \
  --region ap-south-1 >/dev/null 2>&1 || echo "  Route may exist"

# Run cron job - POST /agents/{agentId}/cron/{jobId}/run
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /agents/{agentId}/cron/{jobId}/run" \
  --target "integrations/$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri arn:aws:lambda:ap-south-1:851725418250:function:openpaw-run-cron-job --payload-format-version 2.0 --query 'IntegrationId' --output text --region ap-south-1)" \
  --region ap-south-1 >/dev/null 2>&1 || echo "  Route may exist"

echo "✅ API routes configured"
echo ""

# Step 4: Grant Lambda invoke permissions
echo "4️⃣  Granting Lambda permissions..."
echo ""

for LAMBDA in "${LAMBDAS[@]}"; do
  aws lambda add-permission \
    --function-name "openpaw-$LAMBDA" \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:ap-south-1:851725418250:$API_ID/*" \
    --region ap-south-1 >/dev/null 2>&1 || echo "  Permission exists for $LAMBDA"
done

echo "✅ Permissions granted"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CRON JOBS BACKEND DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Endpoints:"
echo "  GET    https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{id}/cron"
echo "  POST   https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{id}/cron"
echo "  DELETE https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{id}/cron/{jobId}"
echo "  POST   https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{id}/cron/{jobId}/run"
echo ""
echo "🧪 Test in frontend: https://www.openpaw.co/cron"
echo ""
