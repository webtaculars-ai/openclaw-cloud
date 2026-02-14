#!/bin/bash

# OpenClaw Cloud - Configure Stripe Keys
# Run this script after getting your Stripe API keys

set -e

echo "🔑 OpenClaw Cloud - Stripe Configuration"
echo "=========================================="
echo ""

# Check if keys are provided
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "❌ Error: Environment variables not set"
    echo ""
    echo "Please set your Stripe keys first:"
    echo ""
    echo "  export STRIPE_SECRET_KEY='sk_test_YOUR_KEY_HERE'"
    echo "  export STRIPE_WEBHOOK_SECRET='whsec_YOUR_SECRET_HERE'"
    echo ""
    echo "Then run this script again:"
    echo "  ./configure-stripe.sh"
    echo ""
    echo "📝 To get your keys:"
    echo "  1. Secret Key: https://dashboard.stripe.com/test/apikeys"
    echo "  2. Webhook Secret: https://dashboard.stripe.com/webhooks"
    echo "     - Add endpoint: https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/webhooks/stripe"
    echo "     - Select event: checkout.session.completed"
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
    "OpenClawCloudApi-StripeWebhookFn6F43F7B0-RC8evCWHhhrn"
    "OpenClawCloudApi-GetCreditsFnC43EF39F-9ph95Axbcqt2"
    "OpenClawCloudApi-StopAgentFn5D7B1B98-yhNAA1tOWiPB"
    "OpenClawCloudApi-ProvisionAgentFn94442990-rFjLtZxydqzE"
    "OpenClawCloudApi-StartAgentFn859F48FD-bpmO3LqjPro1"
)

echo "🔄 Updating Lambda functions with Stripe keys..."
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
            STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,
            STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET,
            FRONTEND_URL=$FRONTEND_URL
        }" > /dev/null
    
    echo "    ✅ Updated"
done

echo ""
echo "🎉 All Lambda functions configured!"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify webhook: https://dashboard.stripe.com/webhooks"
echo "  2. Test checkout: $FRONTEND_URL"
echo "  3. Monitor logs: aws logs tail /aws/lambda/OpenClawCloudApi-ProvisionAgent... --follow"
echo ""
