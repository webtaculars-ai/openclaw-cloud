#!/bin/bash
# Provision new agent with fresh Docker image

set -e

AGENT_ID="browser-test-$(date +%s)"
USER_ID="c153fdca-10b1-7086-0f03-b2c01bb3626a"
BOT_TOKEN="8108353665:AAHqBwv8RAZlUG6b-OZv9TFCMny-YBb-w7Y"

echo "🤖 Provisioning new agent with browser support..."
echo ""
echo "Agent ID: $AGENT_ID"
echo "User ID: $USER_ID"
echo "Bot Token: ${BOT_TOKEN:0:15}..."
echo ""

# Create agent record in DynamoDB
echo "1️⃣  Creating agent record..."
aws dynamodb put-item \
  --table-name openclaw-agents \
  --item "{
    \"userId\": {\"S\": \"$USER_ID\"},
    \"agentId\": {\"S\": \"$AGENT_ID\"},
    \"telegramBotToken\": {\"S\": \"$BOT_TOKEN\"},
    \"status\": {\"S\": \"provisioning\"},
    \"createdAt\": {\"N\": \"$(date +%s)\"}
  }" \
  --region ap-south-1

echo "   ✅ Agent record created"
echo ""

# Start ECS task
echo "2️⃣  Starting ECS task..."
TASK_ARN=$(aws ecs run-task \
  --cluster openclaw-cluster \
  --task-definition openclaw-agent-task:8 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-0c2a0a08183d6f1ba,subnet-05438a80236a5fbbc],
    securityGroups=[sg-0de636f62dbbec8f3],
    assignPublicIp=ENABLED
  }" \
  --overrides "{
    \"containerOverrides\": [{
      \"name\": \"openclaw-agent\",
      \"environment\": [
        {\"name\": \"AGENT_ID\", \"value\": \"$AGENT_ID\"},
        {\"name\": \"USER_ID\", \"value\": \"$USER_ID\"},
        {\"name\": \"TELEGRAM_BOT_TOKEN\", \"value\": \"$BOT_TOKEN\"}
      ]
    }]
  }" \
  --region ap-south-1 \
  --query 'tasks[0].taskArn' \
  --output text)

echo "   ✅ ECS task started: $(basename $TASK_ARN)"
echo ""

# Update agent record with task ARN
echo "3️⃣  Updating agent with task info..."
aws dynamodb update-item \
  --table-name openclaw-agents \
  --key "{\"userId\": {\"S\": \"$USER_ID\"}, \"agentId\": {\"S\": \"$AGENT_ID\"}}" \
  --update-expression "SET ecsTaskArn = :taskArn, #status = :status" \
  --expression-attribute-names '{"#status": "status"}' \
  --expression-attribute-values "{
    \":taskArn\": {\"S\": \"$TASK_ARN\"},
    \":status\": {\"S\": \"running\"}
  }" \
  --region ap-south-1

echo "   ✅ Agent updated"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AGENT PROVISIONED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Details:"
echo "   Agent ID: $AGENT_ID"
echo "   Task: $(basename $TASK_ARN)"
echo "   Bot: @smarttest1234bot"
echo ""
echo "⏳ Bot will come online in 30-60 seconds..."
echo ""
echo "🧪 Test commands:"
echo "   1. 'Open google.com'"
echo "   2. 'Take a screenshot'"
echo "   3. 'Search for flights from SFO to NYC'"
echo ""
