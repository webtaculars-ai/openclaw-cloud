#!/bin/bash

USER_ID="c153fdca-10b1-7086-0f03-b2c01bb3626a"

echo "🗑️ Deleting all agents..."

# Delete each agent
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386284845\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386426220\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386460546\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386532294\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386540138\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771386558896\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771392560478\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771392806402\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771392992584\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771393397413\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771393521171\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771395848452\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771396550675\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771397271399\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771399722596\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771401235063\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771402224453\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771402341346\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771405067102\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771407721712\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771473519434\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771476583337\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"agent-1771477184402\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"browser-final-1771526493\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"browser-test-1771520075\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"browser-working-1771527963\"}}" --region ap-south-1
aws dynamodb delete-item --table-name openclaw-agents --key "{\"userId\":{\"S\":\"$USER_ID\"},\"agentId\":{\"S\":\"final-fix-1771528852\"}}" --region ap-south-1

echo "✅ All 27 agents deleted!"
