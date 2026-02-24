#!/bin/bash
REGION="ap-south-1"
ROLE="arn:aws:iam::851725418250:role/OpenPawLambdaExecutionRole"

for func in provision-agent list-agents get-agent start-agent stop-agent get-credits recharge-credits lemonsqueezy-webhook; do
  echo "Deploying openpaw-$func..."
  aws lambda create-function \
    --function-name openpaw-$func \
    --runtime nodejs20.x \
    --handler handlers/$func.handler \
    --role $ROLE \
    --zip-file fileb://lambda-stubs.zip \
    --timeout 30 \
    --memory-size 512 \
    --region $REGION 2>&1 | grep -E "(FunctionArn|already exists)" || echo "  ✅ Created"
done
