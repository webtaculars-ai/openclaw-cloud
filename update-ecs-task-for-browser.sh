#!/bin/bash
# Update ECS task definition for browser automation support

set -e

echo "🔧 Updating ECS task definition for browser automation..."
echo ""

# Get current task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition openclaw-agent-task \
  --region ap-south-1\
  --query 'taskDefinition' \
  --output json)

# Extract key fields
FAMILY=$(echo $TASK_DEF | jq -r '.family')
TASK_ROLE_ARN=$(echo $TASK_DEF | jq -r '.taskRoleArn')
EXECUTION_ROLE_ARN=$(echo $TASK_DEF | jq -r '.executionRoleArn')
NETWORK_MODE=$(echo $TASK_DEF | jq -r '.networkMode')
REQUIRES_COMPAT=$(echo $TASK_DEF | jq -r '.requiresCompatibilities[]')
CONTAINER_DEFS=$(echo $TASK_DEF | jq -c '.containerDefinitions')

echo "Current task:"
echo "  CPU: 512 (0.5 vCPU)"
echo "  Memory: 1024 MB"
echo ""
echo "New task (for browser automation):"
echo "  CPU: 1024 (1 vCPU)"
echo "  Memory: 2048 MB"
echo ""

# Register new task definition with increased resources
aws ecs register-task-definition \
  --family $FAMILY \
  --task-role-arn $TASK_ROLE_ARN \
  --execution-role-arn $EXECUTION_ROLE_ARN \
  --network-mode $NETWORK_MODE \
  --requires-compatibilities FARGATE \
  --cpu 1024 \
  --memory 2048 \
  --container-definitions "$CONTAINER_DEFS" \
  --region ap-south-1 \
  --output json > /tmp/new-task-def.json

NEW_REVISION=$(cat /tmp/new-task-def.json | jq -r '.taskDefinition.revision')

echo ""
echo "✅ New task definition registered: $FAMILY:$NEW_REVISION"
echo ""
echo "📊 Cost impact:"
echo "  Old: \$0.04/hour per agent"
echo "  New: \$0.08/hour per agent (+\$0.04/hour)"
echo "  Monthly: +\$2.88 per agent"
echo ""
echo "🎯 Ready for browser automation!"
echo ""
echo "Note: New agents will use the updated definition automatically."
echo "Existing agents need to be restarted to use new resources."
