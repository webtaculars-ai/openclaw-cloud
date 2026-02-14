#!/bin/bash
set -e

echo "🚀 Deploying OpenPaw Frontend to S3 + CloudFront"

BUCKET_NAME="openpaw-frontend-$(date +%s)"
REGION="ap-south-1"

# Create S3 bucket
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure for static website hosting
echo "🌐 Configuring static website hosting"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload build files
echo "📤 Uploading build files"
cd frontend/build
aws s3 sync . s3://$BUCKET_NAME --region $REGION

# Make bucket public
echo "🔓 Making bucket public"
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadGetObject\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
  }]
}"

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"

echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 Website URL: $WEBSITE_URL"
echo "📦 Bucket: $BUCKET_NAME"
echo ""
echo "Next: Set up CloudFront distribution for HTTPS and custom domain"

