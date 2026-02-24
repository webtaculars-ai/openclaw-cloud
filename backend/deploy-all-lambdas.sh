#!/bin/bash
set -e

echo "🚀 DEPLOYING OPENCLAW-CLOUD BACKEND - OPTION 2"
echo "=============================================="
echo ""

# Configuration
REGION="ap-south-1"
ACCOUNT_ID="851725418250"
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/OpenPawLambdaExecutionRole"

# Lambda function names
FUNCTIONS=(
  "openpaw-provision-agent"
  "openpaw-list-agents"
  "openpaw-get-agent"
  "openpaw-start-agent"
  "openpaw-stop-agent"
  "openpaw-get-credits"
  "openpaw-recharge-credits"
  "openpaw-lemonsqueezy-webhook"
  "openpaw-update-channels"
)

# Handler mappings
declare -A HANDLERS
HANDLERS["openpaw-provision-agent"]="handlers/provision-agent.handler"
HANDLERS["openpaw-list-agents"]="handlers/list-agents.handler"
HANDLERS["openpaw-get-agent"]="handlers/get-agent.handler"
HANDLERS["openpaw-start-agent"]="handlers/start-agent.handler"
HANDLERS["openpaw-stop-agent"]="handlers/stop-agent.handler"
HANDLERS["openpaw-get-credits"]="handlers/get-credits.handler"
HANDLERS["openpaw-recharge-credits"]="handlers/recharge-credits.handler"
HANDLERS["openpaw-lemonsqueezy-webhook"]="handlers/lemonsqueezy-webhook.handler"
HANDLERS["openpaw-update-channels"]="handlers/update-channels.handler"

# Environment variables
ENV_VARS="{
  AGENTS_TABLE=openclaw-agents,
  CREDITS_TABLE=openclaw-credits,
  TRANSACTIONS_TABLE=openclaw-transactions,
  PROMO_CODES_TABLE=openclaw-promo-codes,
  USERS_TABLE=openclaw-users,
  AWS_REGION=$REGION
}"

echo "Step 1: Cleaning old build..."
npm run clean || rm -rf dist

echo "Step 2: Installing dependencies..."
npm install

echo "Step 3: Compiling TypeScript..."
npm run build

echo "Step 4: Packaging for Lambda..."
cd dist
zip -r ../lambda-package.zip . > /dev/null
cd ..
echo "✅ Package created: lambda-package.zip ($(du -h lambda-package.zip | cut -f1))"

echo ""
echo "Step 5: Deploying Lambda functions..."
echo ""

for FUNCTION_NAME in "${FUNCTIONS[@]}"; do
  HANDLER="${HANDLERS[$FUNCTION_NAME]}"
  
  echo "📦 Deploying $FUNCTION_NAME..."
  
  # Check if function exists
  if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION > /dev/null 2>&1; then
    echo "  ↻ Updating existing function..."
    aws lambda update-function-code \
      --function-name $FUNCTION_NAME \
      --zip-file fileb://lambda-package.zip \
      --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
      --function-name $FUNCTION_NAME \
      --handler $HANDLER \
      --runtime nodejs20.x \
      --timeout 30 \
      --memory-size 512 \
      --environment Variables="$ENV_VARS" \
      --region $REGION > /dev/null
    
    echo "  ✅ Updated"
  else
    echo "  ↻ Creating new function..."
    aws lambda create-function \
      --function-name $FUNCTION_NAME \
      --runtime nodejs20.x \
      --handler $HANDLER \
      --role $ROLE_ARN \
      --zip-file fileb://lambda-package.zip \
      --environment Variables="$ENV_VARS" \
      --timeout 30 \
      --memory-size 512 \
      --region $REGION > /dev/null
    
    echo "  ✅ Created"
  fi
done

echo ""
echo "=============================================="
echo "✅ ALL LAMBDA FUNCTIONS DEPLOYED!"
echo "=============================================="
echo ""
echo "Deployed functions:"
for FUNCTION_NAME in "${FUNCTIONS[@]}"; do
  echo "  ✓ $FUNCTION_NAME"
done
echo ""
echo "Next: Deploy API Gateway to connect these functions"
echo "Run: cd ../infra && npx cdk deploy OpenClawCloudApi"
