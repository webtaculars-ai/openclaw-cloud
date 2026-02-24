#!/bin/bash
# Build and deploy Docker image with browser support

set -e

echo "🔨 Building OpenPaw Agent with Browser Support"
echo "================================================"
echo ""

cd "$(dirname "$0")"

# Configuration
AWS_REGION="ap-south-1"
AWS_ACCOUNT="851725418250"
ECR_REPO="openpaw-agent"
IMAGE_TAG="browser-$(date +%Y%m%d-%H%M%S)"

echo "📦 Configuration:"
echo "  Region: $AWS_REGION"
echo "  Account: $AWS_ACCOUNT"
echo "  Repository: $ECR_REPO"
echo "  Tag: $IMAGE_TAG"
echo ""

# Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

echo ""
echo "🏗️  Building Docker image..."
docker build -t $ECR_REPO:$IMAGE_TAG -t $ECR_REPO:latest .

echo ""
echo "📤 Pushing to ECR..."
docker tag $ECR_REPO:$IMAGE_TAG \
  $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

docker tag $ECR_REPO:latest \
  $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

docker push $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
docker push $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

echo ""
echo "✅ Image pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Stop old agent (via UI or API)"
echo "  2. Provision new agent (will pull latest image)"
echo "  3. Test browser commands"
echo ""
echo "Image URIs:"
echo "  $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG"
echo "  $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"
