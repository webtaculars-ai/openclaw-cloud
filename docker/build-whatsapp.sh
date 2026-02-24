#!/bin/bash
# Build and push Docker image with WhatsApp support

set -e

echo "🐳 Building Docker image with WhatsApp support..."
echo ""

cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/docker

# Build image
docker build -t openpaw-agent:whatsapp . 2>&1 | tail -20 &
BUILD_PID=$!

echo "Building... (this takes ~3 minutes)"
wait $BUILD_PID

echo ""
echo "✅ Image built!"
echo ""

# Tag for ECR
ECR_URI="851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent"
docker tag openpaw-agent:whatsapp $ECR_URI:whatsapp
docker tag openpaw-agent:whatsapp $ECR_URI:latest

echo "📤 Pushing to ECR..."
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $ECR_URI
docker push $ECR_URI:whatsapp
docker push $ECR_URI:latest

echo ""
echo "✅ Image pushed to ECR!"
echo ""
echo "URI: $ECR_URI:whatsapp"
echo ""
