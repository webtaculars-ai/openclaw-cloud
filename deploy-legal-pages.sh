#!/bin/bash
set -e

echo "🚀 Deploying Legal Pages to OpenPaw Frontend"

# Use existing frontend bucket
BUCKET_NAME="openpaw-frontend-1771074214"
REGION="ap-south-1"

# Upload legal pages
echo "📤 Uploading legal pages..."

cd "$(dirname "$0")/legal-pages"

# Upload each legal page
aws s3 cp terms.html s3://$BUCKET_NAME/terms.html \
  --region $REGION \
  --content-type "text/html" \
  --cache-control "max-age=3600"

aws s3 cp refund-policy.html s3://$BUCKET_NAME/refund-policy.html \
  --region $REGION \
  --content-type "text/html" \
  --cache-control "max-age=3600"

aws s3 cp privacy.html s3://$BUCKET_NAME/privacy.html \
  --region $REGION \
  --content-type "text/html" \
  --cache-control "max-age=3600"

echo ""
echo "✅ Legal pages deployed successfully!"
echo ""
echo "📄 URLs:"
echo "   Terms: https://www.openpaw.co/terms.html"
echo "   Refund: https://www.openpaw.co/refund-policy.html"
echo "   Privacy: https://www.openpaw.co/privacy.html"
echo ""
echo "⚠️  Note: If using CloudFront, may need to invalidate cache:"
echo "   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/terms.html' '/refund-policy.html' '/privacy.html'"
