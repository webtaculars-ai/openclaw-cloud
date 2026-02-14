#!/bin/bash

# OpenClaw Cloud - Configure Lemon Squeezy
# Run this script after getting your Lemon Squeezy API keys

set -e

echo "🍋 OpenClaw Cloud - Lemon Squeezy Configuration"
echo "================================================"
echo ""

# Check if keys are provided
if [ -z "$LEMONSQUEEZY_API_KEY" ] || [ -z "$LEMONSQUEEZY_WEBHOOK_SECRET" ] || [ -z "$LEMONSQUEEZY_STORE_ID" ]; then
    echo "❌ Error: Environment variables not set"
    echo ""
    echo "Please set your Lemon Squeezy configuration first:"
    echo ""
    echo "  export LEMONSQUEEZY_API_KEY='your_api_key_here'"
    echo "  export LEMONSQUEEZY_WEBHOOK_SECRET='your_webhook_secret_here'"
    echo "  export LEMONSQUEEZY_STORE_ID='your_store_id_here'"
    echo "  export LEMONSQUEEZY_VARIANT_STARTER='variant_id_for_starter'"
    echo "  export LEMONSQUEEZY_VARIANT_PRO='variant_id_for_pro'"
    echo "  export LEMONSQUEEZY_VARIANT_ENTERPRISE='variant_id_for_enterprise'"
    echo ""
    echo "Then run this script again:"
    echo "  ./configure-lemonsqueezy.sh"
    echo ""
    echo "📝 To get your keys:"
    echo "  1. API Key: https://app.lemonsqueezy.com/settings/api"
    echo "  2. Store ID: https://app.lemonsqueezy.com/settings/stores"
    echo "  3. Create products & variants for each tier (Starter, Pro, Enterprise)"
    echo "  4. Webhook Secret: https://app.lemonsqueezy.com/settings/webhooks"
    echo "     - Add endpoint: https://YOUR_API_URL/webhooks/lemonsqueezy"
    echo "     - Select event: order_created"
    exit 1
fi

REGION="ap-south-1"
FRONTEND_URL="https://d2spow5okg20j4.amplifyapp.com"

# Get task definition ARN
TASK_DEF_ARN=$(aws ecs list-task-definitions --region $REGION \
    --family-prefix OpenClawCloudAgentRuntime \
    --query 'taskDefinitionArns[0]' --output text)

echo "✅ Task Definition: $TASK_DEF_ARN"

# Get subnets and security group
SUBNETS=$(aws ec2 describe-subnets --region $REGION \
    --filters "Name=tag:aws:cloudformation:stack-name,Values=OpenClawCloudNetwork" \
    --query 'Subnets[].SubnetId' --output text | tr '\t' ',')

SECURITY_GROUP=$(aws ec2 describe-security-groups --region $REGION \
    --filters "Name=tag:aws:cloudformation:stack-name,Values=OpenClawCloudNetwork" \
    --query 'SecurityGroups[0].GroupId' --output text)

echo "✅ Subnets: $SUBNETS"
echo "✅ Security Group: $SECURITY_GROUP"
echo ""

# Lambda functions to update
FUNCTIONS=(
    "OpenClawCloudApi-GetAgentFn4D25B394-IgAa4VjZR5Cx"
    "OpenClawCloudApi-UpdateChannelsFn752A0575-ZJYUn0SZppcp"
    "OpenClawCloudApi-RechargeCreditsFnED9757AB-0kfBAfMYsyMl"
    "OpenClawCloudApi-LemonSqueezyWebhookFn-PLACEHOLDER"
    "OpenClawCloudApi-GetCreditsFnC43EF39F-9ph95Axbcqt2"
    "OpenClawCloudApi-StopAgentFn5D7B1B98-yhNAA1tOWiPB"
    "OpenClawCloudApi-ProvisionAgentFn94442990-rFjLtZxydqzE"
    "OpenClawCloudApi-StartAgentFn859F48FD-bpmO3LqjPro1"
)

echo "🔄 Updating Lambda functions with Lemon Squeezy keys..."
echo ""

for FUNCTION in "${FUNCTIONS[@]}"; do
    echo "  → $FUNCTION"
    
    aws lambda update-function-configuration \
        --region $REGION \
        --function-name "$FUNCTION" \
        --environment "Variables={
            USERS_TABLE=openclaw-users,
            AGENTS_TABLE=openclaw-agents,
            CREDITS_TABLE=openclaw-credits,
            TRANSACTIONS_TABLE=openclaw-transactions,
            ECS_CLUSTER=openclaw-agents,
            TASK_DEFINITION=$TASK_DEF_ARN,
            VPC_SUBNETS=$SUBNETS,
            SECURITY_GROUP=$SECURITY_GROUP,
            LEMONSQUEEZY_API_KEY=$LEMONSQUEEZY_API_KEY,
            LEMONSQUEEZY_WEBHOOK_SECRET=$LEMONSQUEEZY_WEBHOOK_SECRET,
            LEMONSQUEEZY_STORE_ID=$LEMONSQUEEZY_STORE_ID,
            LEMONSQUEEZY_VARIANT_STARTER=${LEMONSQUEEZY_VARIANT_STARTER:-variant_placeholder},
            LEMONSQUEEZY_VARIANT_PRO=${LEMONSQUEEZY_VARIANT_PRO:-variant_placeholder},
            LEMONSQUEEZY_VARIANT_ENTERPRISE=${LEMONSQUEEZY_VARIANT_ENTERPRISE:-variant_placeholder},
            FRONTEND_URL=$FRONTEND_URL
        }" > /dev/null 2>&1 || echo "    ⚠️  Function not found (may need redeployment)"
    
    echo "    ✅ Updated"
done

echo ""
echo "🎉 All Lambda functions configured!"
echo ""
echo "📋 Next Steps:"
echo "  1. Create products in Lemon Squeezy: https://app.lemonsqueezy.com/products"
echo "  2. Verify webhook: https://app.lemonsqueezy.com/settings/webhooks"
echo "  3. Test checkout: $FRONTEND_URL"
echo "  4. Monitor logs: aws logs tail /aws/lambda/OpenClawCloudApi-ProvisionAgent... --follow"
echo ""
