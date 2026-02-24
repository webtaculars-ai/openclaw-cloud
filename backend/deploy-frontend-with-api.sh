#!/bin/bash
# Will run after API Gateway is deployed

API_URL="$1"

echo "🔄 Updating frontend with API URL: $API_URL"

cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/frontend

# Update .env
cat > .env << EOF
REACT_APP_USER_POOL_ID=ap-south-1_df2Xgk8QR
REACT_APP_USER_POOL_CLIENT_ID=1gcl93s5257olc9kn1rut8uh60
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_API_URL=$API_URL
EOF

echo "✅ .env updated"

# Rebuild
echo "📦 Building..."
npm run build 2>&1 | tail -3

echo "✅ Build complete"

# Deploy to S3
echo "🚀 Deploying to S3..."
cd ../backend
node -e "
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mimeTypes = {'.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml'};

const client = new S3Client({ region: 'ap-south-1' });
const buildDir = '../frontend/build';

async function upload(dir, prefix = '') {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      await upload(filePath, prefix ? \\\`\\\${prefix}/\\\${file}\\\` : file);
    } else {
      const key = prefix ? \\\`\\\${prefix}/\\\${file}\\\` : file;
      await client.send(new PutObjectCommand({
        Bucket: 'openpaw-frontend-1771074214',
        Key: key,
        Body: fs.readFileSync(filePath),
        ContentType: mimeTypes[path.extname(filePath)] || 'application/octet-stream'
      }));
    }
  }
}

upload(buildDir).then(() => console.log('✅ Deployed to S3')).catch(console.error);
"

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
node -e "
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const client = new CloudFrontClient({ region: 'us-east-1' });

client.send(new CreateInvalidationCommand({
  DistributionId: 'E3UJF1A2CPA1SQ',
  InvalidationBatch: {
    CallerReference: \\\`final-\\\${Date.now()}\\\`,
    Paths: { Quantity: 1, Items: ['/*'] }
  }
})).then(() => console.log('✅ Cache cleared - Live in 60s!'));
"

echo ""
echo "🎉 FRONTEND DEPLOYED WITH API URL"
echo "✅ URL: https://openpaw.co"
echo "✅ API: $API_URL"
echo "⏰ Live in 60 seconds"
