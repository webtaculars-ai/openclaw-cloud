#!/bin/bash
set -e

FUNCTION_NAME=$1
HANDLER_FILE=$2

if [ -z "$FUNCTION_NAME" ] || [ -z "$HANDLER_FILE" ]; then
  echo "Usage: ./deploy-ts-lambda.sh <function-name> <handler-file.ts>"
  exit 1
fi

echo "🚀 Deploying TypeScript Lambda: $FUNCTION_NAME"

TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Copy TypeScript file
cp "$OLDPWD/$HANDLER_FILE" index.ts

# Create package.json
cat > package.json << 'EOF'
{
  "name": "lambda",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.119",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "esbuild": "^0.19.0"
  }
}
EOF

# Create tsconfig
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": false,
    "outDir": "dist"
  }
}
EOF

echo "📥 Installing dependencies..."
npm install --silent

# Bundle with esbuild (includes all dependencies)
echo "📦 Bundling with esbuild..."
npx esbuild index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=index.js --external:@aws-sdk/*

# Install AWS SDK
npm install --production --silent --no-save @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Create zip
zip -r lambda.zip index.js node_modules -q

SIZE=$(du -h lambda.zip | cut -f1)
echo "✅ Package: $SIZE"

# Upload
echo "☁️  Uploading..."
aws lambda update-function-code \
  --region ap-south-1 \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://lambda.zip" \
  --no-cli-pager > /dev/null

# Fix handler
aws lambda update-function-configuration \
  --region ap-south-1 \
  --function-name "$FUNCTION_NAME" \
  --handler index.handler \
  --no-cli-pager > /dev/null

echo "✅ Deployed!"

rm -rf "$TEMP_DIR"
