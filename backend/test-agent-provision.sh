#!/bin/bash
set -e

TOKEN=$1
USER_ID="c153fdca-10b1-7086-0f03-b2c01bb3626a"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test-agent-provision.sh <telegram-bot-token>"
  exit 1
fi

echo "🧪 Testing Agent Provisioning"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Call provision API
echo "1️⃣  Calling provision-agent Lambda..."
RESULT=$(aws lambda invoke \
  --function-name openpaw-provision-agent \
  --region ap-south-1 \
  --payload "{\"requestContext\":{\"authorizer\":{\"claims\":{\"sub\":\"$USER_ID\"}}},\"body\":\"{\\\"telegramBotToken\\\":\\\"$TOKEN\\\"}\"}" \
  --cli-binary-format raw-in-base64-out \
  response.json 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Lambda invocation failed:"
  echo "$RESULT"
  exit 1
fi

echo "✅ Lambda invoked"
echo ""

# Step 2: Check response
echo "2️⃣  Checking response..."
RESPONSE=$(cat response.json)
STATUS=$(echo $RESPONSE | grep -o '"statusCode":[0-9]*' | cut -d':' -f2)

if [ "$STATUS" = "200" ]; then
  echo "✅ Status: 200 OK"
  AGENT_ID=$(echo $RESPONSE | grep -o '"agentId":"[^"]*"' | cut -d'"' -f4)
  TASK_ARN=$(echo $RESPONSE | grep -o '"taskArn":"[^"]*"' | cut -d'"' -f4)
  echo "   Agent ID: $AGENT_ID"
  echo "   Task ARN: ${TASK_ARN##*/}"
else
  echo "❌ Status: $STATUS"
  echo "$RESPONSE" | grep -o '"error":"[^"]*"' || echo "$RESPONSE"
  exit 1
fi

echo ""

# Step 3: Wait for task to start
echo "3️⃣  Waiting for ECS task to start..."
for i in {1..12}; do
  TASK_STATUS=$(aws ecs describe-tasks \
    --cluster openclaw-cluster \
    --tasks "$TASK_ARN" \
    --region ap-south-1 \
    --no-cli-pager \
    --query 'tasks[0].lastStatus' \
    --output text 2>/dev/null || echo "UNKNOWN")
  
  echo "   Attempt $i/12: Task status = $TASK_STATUS"
  
  if [ "$TASK_STATUS" = "RUNNING" ]; then
    echo "✅ Task is running!"
    break
  elif [ "$TASK_STATUS" = "STOPPED" ] || [ "$TASK_STATUS" = "DEPROVISIONING" ]; then
    echo "❌ Task stopped unexpectedly"
    
    # Get stop reason
    STOP_REASON=$(aws ecs describe-tasks \
      --cluster openclaw-cluster \
      --tasks "$TASK_ARN" \
      --region ap-south-1 \
      --no-cli-pager \
      --query 'tasks[0].stoppedReason' \
      --output text)
    echo "   Reason: $STOP_REASON"
    exit 1
  fi
  
  sleep 10
done

if [ "$TASK_STATUS" != "RUNNING" ]; then
  echo "⏰ Task did not start within 2 minutes"
  exit 1
fi

echo ""

# Step 4: Check logs
echo "4️⃣  Checking CloudWatch logs..."
sleep 5  # Give logs time to appear

LOG_GROUP="/aws/ecs/openclaw-agent"
TASK_ID="${TASK_ARN##*/}"

LOGS=$(aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time $(($(date +%s) * 1000 - 60000)) \
  --region ap-south-1 \
  --no-cli-pager \
  --query 'events[*].message' \
  --output text 2>/dev/null || echo "")

if [ -n "$LOGS" ]; then
  echo "✅ Logs found:"
  echo "$LOGS" | tail -10
else
  echo "⚠️  No logs yet (may take a minute)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Provisioning Test Complete!"
echo ""
echo "📱 Next Steps:"
echo "1. Open Telegram"
echo "2. Search for your bot"
echo "3. Send: /start"
echo "4. Try chatting with it!"
echo ""
echo "To check if bot is responding:"
echo "  - Send a message"
echo "  - Wait 5-10 seconds"
echo "  - Check for reply"
echo ""
echo "To stop the agent:"
echo "  aws ecs stop-task --cluster openclaw-cluster --task $TASK_ARN --region ap-south-1"

rm response.json
