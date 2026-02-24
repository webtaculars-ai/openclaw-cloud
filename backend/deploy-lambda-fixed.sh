#!/bin/bash
set -e

FUNCTION_NAME=$1
HANDLER_FILE=$2

if [ -z "$FUNCTION_NAME" ] || [ -z "$HANDLER_FILE" ]; then
  echo "Usage: ./deploy-lambda-fixed.sh <function-name> <handler-file>"
  echo "Example: ./deploy-lambda-fixed.sh openpaw-redeem-promo src/handlers/redeem-promo.js"
  exit 1
fi

echo "🚀 Deploying Lambda: $FUNCTION_NAME"
echo "📦 Handler: $HANDLER_FILE"

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "📁 Temp directory: $TEMP_DIR"

# Copy handler
cp "$HANDLER_FILE" "$TEMP_DIR/index.js"

# Create package.json
cat > "$TEMP_DIR/package.json" << EOF
{
  "name": "lambda-function",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0"
  }
}
EOF

# Install dependencies
echo "📥 Installing dependencies..."
cd "$TEMP_DIR"
npm install --production --silent

# Create zip
echo "📦 Creating deployment package..."
zip -r lambda.zip . -q

# Get file size
SIZE=$(du -h lambda.zip | cut -f1)
echo "✅ Package size: $SIZE"

# Upload to Lambda
echo "☁️  Uploading to AWS..."
aws lambda update-function-code \
  --region ap-south-1 \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://lambda.zip" \
  --no-cli-pager

echo "✅ Lambda deployed successfully!"

# Cleanup
rm -rf "$TEMP_DIR"
