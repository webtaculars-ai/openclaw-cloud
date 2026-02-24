#!/bin/bash
# Quick deployment script for browser-enabled OpenPaw agents

set -e

REGION="ap-south-1"
STACK_NAME="OpenClawAgentRuntimeStack"

echo "🚀 OpenPaw Browser Automation Deployment"
echo "========================================"
echo ""

# Step 1: Get ECR repository URI
echo "📦 Step 1/4: Getting ECR repository URI..."
ECR_URI=$(aws cloudformation describe-stacks \
  --region $REGION \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?ExportName==`OpenClawRepositoryUri`].OutputValue' \
  --output text)

if [ -z "$ECR_URI" ]; then
    echo "❌ Failed to get ECR repository URI"
    exit 1
fi

echo "✅ ECR URI: $ECR_URI"
echo ""

# Step 2: Build Docker image
echo "🔨 Step 2/4: Building Docker image with Chromium..."
cd docker
docker build -t openclaw-agent:browser . --platform linux/amd64

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker build complete"
echo ""

# Step 3: Push to ECR
echo "📤 Step 3/4: Pushing to ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_URI

docker tag openclaw-agent:browser $ECR_URI:latest
docker tag openclaw-agent:browser $ECR_URI:browser-$(date +%Y%m%d-%H%M%S)

docker push $ECR_URI:latest
docker push $ECR_URI:browser-$(date +%Y%m%d-%H%M%S)

echo "✅ Push complete"
echo ""

# Step 4: Deploy infrastructure
echo "🏗️  Step 4/4: Deploying updated ECS task definition..."
cd ../infra
npm run build
cdk deploy $STACK_NAME --require-approval never

if [ $? -ne 0 ]; then
    echo "❌ CDK deploy failed"
    exit 1
fi

echo "✅ Deployment complete"
echo ""

# Verify
echo "🔍 Verifying task definition..."
aws ecs describe-task-definition \
  --region $REGION \
  --task-definition openclaw-agent \
  --query 'taskDefinition.{CPU:cpu,Memory:memory,Image:containerDefinitions[0].image}' \
  --output table

echo ""
echo "✅ Browser automation is now enabled!"
echo ""
echo "Test by creating an agent and sending:"
echo "  'Open google.com and take a screenshot'"
echo ""
echo "Cost: ~$0.048/hour per agent (~$35/month 24/7)"
echo "Savings tip: Use auto-scaling or on-demand agent spawning"
