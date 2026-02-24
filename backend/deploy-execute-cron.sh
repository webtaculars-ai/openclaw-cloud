#!/bin/bash
# Deploy execute-cron-job Lambda and test it

set -e

echo "🚀 Deploying execute-cron-job Lambda"
echo "===================================="
echo ""

LAMBDA_NAME="openpaw-execute-cron-job"
REGION="ap-south-1"

# Create temp dir
TEMP_DIR="/tmp/lambda-execute-cron"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy handler
cp src/handlers/execute-cron-job.js "$TEMP_DIR/index.js"

# Install dependencies
cd "$TEMP_DIR"
npm init -y >/dev/null 2>&1
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb >/dev/null 2>&1

# Create deployment package
zip -r execute-cron-job.zip . >/dev/null 2>&1

echo "1️⃣ Created deployment package"

# Update or create Lambda
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file "fileb://execute-cron-job.zip" \
  --region $REGION >/dev/null 2>&1 && echo "2️⃣ Updated existing Lambda" || \
(
  echo "2️⃣ Creating new Lambda..."
  aws lambda create-function \
    --function-name "$LAMBDA_NAME" \
    --runtime nodejs20.x \
    --role arn:aws:iam::851725418250:role/OpenPawLambdaExecutionRole \
    --handler index.handler \
    --zip-file "fileb://execute-cron-job.zip" \
    --timeout 30 \
    --memory-size 256 \
    --region $REGION >/dev/null 2>&1
  echo "   Lambda created"
)

cd - >/dev/null

echo ""
echo "3️⃣ Testing Lambda with sample cron job..."
echo ""

# Get your agent ID (first one from the agents table)
AGENT_ID=$(aws dynamodb scan \
  --table-name openclaw-agents \
  --filter-expression "userId = :userId AND #status = :running" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{":userId":{"S":"c153fdca-10b1-7086-0f03-b2c01bb3626a"},":running":{"S":"running"}}' \
  --region $REGION \
  --query 'Items[0].agentId.S' \
  --output text 2>/dev/null)

if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "None" ]; then
  echo "⚠️  No running agent found, testing with dummy data"
  AGENT_ID="test-agent"
fi

# Test payload
TEST_PAYLOAD=$(cat <<EOF
{
  "jobId": "test-job-123",
  "agentId": "$AGENT_ID",
  "message": "🧪 **Test Cron Job Execution**\n\nThis is a test scheduled message from your OpenPaw cron system.\n\nTime: $(date -u +"%Y-%m-%d %H:%M:%S UTC")\n\nIf you see this, cron jobs are working! ✅"
}
EOF
)

echo "Test payload:"
echo "$TEST_PAYLOAD"
echo ""

# Invoke Lambda
RESULT=$(aws lambda invoke \
  --function-name "$LAMBDA_NAME" \
  --payload "$TEST_PAYLOAD" \
  --region $REGION \
  /tmp/cron-response.json 2>&1 | grep StatusCode)

echo "Lambda response:"
cat /tmp/cron-response.json
echo ""

if grep -q '"success":true' /tmp/cron-response.json; then
  echo "✅ Test execution successful!"
  echo ""
  echo "Check your Telegram - you should see the test message!"
else
  echo "⚠️  Test execution completed but check logs for details"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ execute-cron-job Lambda deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Lambda ARN: arn:aws:lambda:$REGION:851725418250:function:$LAMBDA_NAME"
echo ""
echo "Next: Update create-cron-job.js to use this Lambda as EventBridge target"
echo ""
