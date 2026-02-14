#!/bin/bash

# Quick Status Check - OpenClaw Cloud
# Shows what's deployed and what's pending

echo "🔍 OpenClaw Cloud - Deployment Status"
echo "======================================"
echo ""

# Check Git status
echo "📦 Git Status:"
UNPUSHED=$(git log origin/master..HEAD --oneline 2>/dev/null | wc -l)
echo "   Unpushed commits: $UNPUSHED"
if [ "$UNPUSHED" -gt 0 ]; then
    echo "   ⚠️  Need to push!"
    git log origin/master..HEAD --oneline
else
    echo "   ✅ All pushed"
fi
echo ""

# Check if backend is built
echo "🔨 Backend Status:"
if [ -f "backend/dist/handlers/provision-agent.js" ]; then
    HANDLER_COUNT=$(ls backend/dist/handlers/*.js 2>/dev/null | wc -l)
    echo "   ✅ Built ($HANDLER_COUNT handlers)"
else
    echo "   ❌ Not built"
    echo "   Run: cd backend && npm run build"
fi
echo ""

# Check AWS CLI
echo "☁️  AWS CLI:"
if command -v aws &> /dev/null; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "Not configured")
    echo "   ✅ Installed"
    echo "   Account: $AWS_ACCOUNT"
else
    echo "   ❌ Not installed"
fi
echo ""

# Check Docker
echo "🐳 Docker:"
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo "   ✅ Installed and running"
    else
        echo "   ⚠️  Installed but not running"
    fi
else
    echo "   ❌ Not installed"
fi
echo ""

# Check ECR image (if AWS available)
if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
    echo "📦 ECR Repository:"
    IMAGE_COUNT=$(aws ecr describe-images \
        --repository-name openclaw-agent \
        --region ap-south-1 \
        --query 'length(imageDetails)' \
        --output text 2>/dev/null || echo "0")
    
    if [ "$IMAGE_COUNT" -gt 0 ]; then
        LATEST_PUSH=$(aws ecr describe-images \
            --repository-name openclaw-agent \
            --region ap-south-1 \
            --query 'imageDetails[0].imagePushedAt' \
            --output text 2>/dev/null)
        echo "   ✅ $IMAGE_COUNT image(s) in ECR"
        echo "   Latest push: $LATEST_PUSH"
    else
        echo "   ❌ No images in ECR"
        echo "   Run: ./deploy-complete.sh (Step 4)"
    fi
    echo ""
fi

# Next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo ""

if [ "$UNPUSHED" -gt 0 ]; then
    echo "1. ⚠️  Push commits: git push origin master"
else
    echo "1. ✅ Code pushed"
fi

if [ ! -f "backend/dist/handlers/provision-agent.js" ]; then
    echo "2. ⚠️  Build backend: cd backend && npm run build"
else
    echo "2. ✅ Backend built"
fi

echo "3. Run complete deployment: ./deploy-complete.sh"
echo ""
echo "Or run individual steps manually (see PRE_LAUNCH_CHECKLIST.md)"
echo ""
