#!/bin/bash
# OpenClaw Cloud Deployment Script
# Run this from your local machine with AWS credentials configured

set -e  # Exit on error

echo "🚀 OpenClaw Cloud - Full Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS credentials
echo -e "${BLUE}Step 1: Verifying AWS credentials...${NC}"
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}"
echo ""

# Check if CDK is bootstrapped
echo -e "${BLUE}Step 2: Checking CDK bootstrap...${NC}"
REGION=${AWS_REGION:-us-east-1}
echo "Region: $REGION"

# Bootstrap CDK (safe to run multiple times)
echo "Running CDK bootstrap..."
cd infra
npx cdk bootstrap aws://$ACCOUNT_ID/$REGION
echo -e "${GREEN}✅ CDK bootstrapped${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Synth stacks (verify before deploy)
echo -e "${BLUE}Step 4: Synthesizing CloudFormation templates...${NC}"
npx cdk synth --quiet > /dev/null
echo -e "${GREEN}✅ All stacks synthesized successfully${NC}"
echo ""

# Deploy all stacks
echo -e "${BLUE}Step 5: Deploying all stacks (this takes ~30 minutes)...${NC}"
echo -e "${YELLOW}⏳ Deploying 6 stacks: Network, Auth, Database, AgentRuntime, API, Frontend${NC}"
echo ""

npx cdk deploy --all --require-approval never

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Show outputs
echo -e "${BLUE}📋 Important Outputs:${NC}"
echo ""
echo "Run this command to see all outputs:"
echo "  cd infra && npx cdk output --all"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Build and push Docker image to ECR"
echo "2. Update Lambda environment variables (Stripe keys)"
echo "3. Configure Stripe webhook URL"
echo "4. Connect Amplify to Git repository"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
