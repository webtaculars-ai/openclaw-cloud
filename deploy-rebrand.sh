#!/bin/bash
set -e

echo "🚀 Deploying OpenPaw Frontend with Rebrand Updates"
echo ""

BUCKET_NAME="openpaw-frontend-1771074214"
CLOUDFRONT_ID="E2UXAMPLE" # Need to find this
REGION="ap-south-1"

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found"
    exit 1
fi

# Upload build files to S3
echo "📤 Uploading updated frontend to S3..."
cd frontend/build

# Sync files with cache-control headers
aws s3 sync . s3://${BUCKET_NAME}/ \
  --region ${REGION} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "asset-manifest.json"

# Upload index.html with no-cache
aws s3 cp index.html s3://${BUCKET_NAME}/index.html \
  --region ${REGION} \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

aws s3 cp asset-manifest.json s3://${BUCKET_NAME}/asset-manifest.json \
  --region ${REGION} \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "application/json"

echo "✅ Files uploaded to S3!"
echo ""

# Get CloudFront distribution ID if available
echo "🔍 Looking for CloudFront distribution..."
DISTRIBUTIONS=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName==\`${BUCKET_NAME}.s3.${REGION}.amazonaws.com\`].Id" --output text 2>/dev/null || echo "")

if [ -n "$DISTRIBUTIONS" ]; then
    for DIST_ID in $DISTRIBUTIONS; do
        echo "♻️  Invalidating CloudFront cache: $DIST_ID"
        aws cloudfront create-invalidation \
          --distribution-id $DIST_ID \
          --paths "/*" \
          --no-cli-pager
    done
    echo "✅ CloudFront cache invalidated!"
else
    echo "⚠️  No CloudFront distribution found - skipping cache invalidation"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Frontend URLs:"
echo "   S3: http://${BUCKET_NAME}.s3-website.${REGION}.amazonaws.com"
echo "   Domain: https://openpaw.co (if DNS configured)"
echo ""
echo "🐾 Your rebranded OpenPaw frontend is now live!"

