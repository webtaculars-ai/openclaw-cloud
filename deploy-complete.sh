#!/bin/bash

# OpenClaw Cloud - Complete Deployment Script
# Run this on a machine with AWS credentials and Docker

set -e

echo "🚀 OpenClaw Cloud - Complete Deployment"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="ap-south-1"
ECR_REPO="851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent"
API_STACK="OpenClawCloudApi"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $SCRIPT_DIR"
echo ""

# Step 1: Push to GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1/5: Push commits to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

UNPUSHED=$(git log origin/master..HEAD --oneline 2>/dev/null || echo "")

if [ -z "$UNPUSHED" ]; then
    echo "${GREEN}✅ No unpushed commits. Already up to date!${NC}"
else
    echo "Unpushed commits:"
    echo "$UNPUSHED"
    echo ""
    echo "Pushing..."
    
    if git push origin master; then
        echo "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    else
        echo "${RED}❌ Failed to push. Please check GitHub credentials.${NC}"
        echo ""
        echo "Fix:"
        echo "  1. Use SSH: git remote set-url origin git@github.com:webtaculars-ai/openclaw-cloud.git"
        echo "  2. Or authenticate: gh auth login"
        exit 1
    fi
fi
echo ""

# Step 2: Rebuild backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Step 2/5: Rebuild backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building TypeScript..."
npm run build

if [ -d "dist" ] && [ -f "dist/handlers/provision-agent.js" ]; then
    echo "${GREEN}✅ Backend built successfully!${NC}"
    echo "   Handlers: $(ls dist/handlers/*.js | wc -l) files"
else
    echo "${RED}❌ Build failed or handlers not found!${NC}"
    exit 1
fi
echo ""

# Step 3: Redeploy API stack
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "☁️  Step 3/5: Redeploy API to AWS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ../infra

# Check AWS credentials
if ! aws sts get-caller-identity --region $REGION > /dev/null 2>&1; then
    echo "${RED}❌ AWS credentials not configured!${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $ACCOUNT_ID"
echo "Region: $REGION"
echo ""

echo "Deploying $API_STACK stack..."
echo "(This may take 3-5 minutes)"
echo ""

if npx cdk deploy $API_STACK --require-approval never --region $REGION; then
    echo ""
    echo "${GREEN}✅ API stack deployed successfully!${NC}"
else
    echo ""
    echo "${RED}❌ CDK deployment failed!${NC}"
    exit 1
fi
echo ""

# Get API URL
API_URL=$(aws cloudformation describe-stacks \
    --region $REGION \
    --stack-name $API_STACK \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
    echo "API URL: $API_URL"
fi
echo ""

# Step 4: Build & push Docker image
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Step 4/5: Build & push Docker image"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ../agent

# Check Docker
if ! docker --version > /dev/null 2>&1; then
    echo "${RED}❌ Docker not installed or not running!${NC}"
    exit 1
fi

echo "Building Docker image..."
if docker build -t openclaw-agent .; then
    echo "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo "${RED}❌ Docker build failed!${NC}"
    exit 1
fi
echo ""

echo "Logging into ECR..."
if aws ecr get-login-password --region $REGION | \
   docker login --username AWS --password-stdin $ECR_REPO; then
    echo "${GREEN}✅ Logged into ECR${NC}"
else
    echo "${RED}❌ ECR login failed!${NC}"
    exit 1
fi
echo ""

echo "Tagging image..."
docker tag openclaw-agent:latest $ECR_REPO:latest

echo "Pushing to ECR..."
if docker push $ECR_REPO:latest; then
    echo "${GREEN}✅ Image pushed to ECR successfully!${NC}"
else
    echo "${RED}❌ Push to ECR failed!${NC}"
    exit 1
fi
echo ""

# Verify image
IMAGE_DIGEST=$(aws ecr describe-images \
    --repository-name openclaw-agent \
    --region $REGION \
    --query 'imageDetails[0].imageDigest' \
    --output text 2>/dev/null || echo "")

if [ -n "$IMAGE_DIGEST" ]; then
    echo "Image digest: $IMAGE_DIGEST"
fi
echo ""

# Step 5: Test deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 5/5: Test deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$API_URL" ]; then
    echo "Testing API endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}agents" || echo "000")
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo "${GREEN}✅ API is responding (401 = needs auth, expected)${NC}"
    elif [ "$HTTP_CODE" = "200" ]; then
        echo "${GREEN}✅ API is responding (200 OK)${NC}"
    else
        echo "${YELLOW}⚠️  API returned HTTP $HTTP_CODE${NC}"
    fi
else
    echo "${YELLOW}⚠️  Could not determine API URL${NC}"
fi
echo ""

# Check ECR image
ECR_IMAGE_COUNT=$(aws ecr describe-images \
    --repository-name openclaw-agent \
    --region $REGION \
    --query 'length(imageDetails)' \
    --output text 2>/dev/null || echo "0")

if [ "$ECR_IMAGE_COUNT" -gt 0 ]; then
    echo "${GREEN}✅ Docker image in ECR: $ECR_IMAGE_COUNT image(s)${NC}"
else
    echo "${YELLOW}⚠️  No images found in ECR${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Code pushed to GitHub"
echo "✅ Backend rebuilt"
echo "✅ API stack deployed"
echo "✅ Docker image built & pushed"
echo "✅ Deployment tested"
echo ""

if [ -n "$API_URL" ]; then
    echo "🔗 API URL: $API_URL"
fi
echo "🔗 GitHub: https://github.com/webtaculars-ai/openclaw-cloud"
echo "🔗 Amplify: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Next Steps (Manual)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Configure Lemon Squeezy:"
echo "   - Create account: https://www.lemonsqueezy.com/"
echo "   - Run: ./configure-lemonsqueezy.sh"
echo "   - See: LEMONSQUEEZY_SETUP.md"
echo ""
echo "2. Deploy frontend:"
echo "   - Connect GitHub to Amplify"
echo "   - Or deploy to Vercel"
echo ""
echo "3. (Optional) Connect domain:"
echo "   - See: GODADDY_DOMAIN_SETUP.md"
echo ""
echo "${GREEN}🎉 Core deployment complete!${NC}"
echo ""
