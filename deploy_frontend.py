#!/usr/bin/env python3
import boto3
import os
import mimetypes
from pathlib import Path

# Configuration
BUCKET_NAME = "openpaw-frontend-1771074214"
REGION = "ap-south-1"
BUILD_DIR = "frontend/build"

print("🚀 Deploying OpenPaw Frontend with Rebrand Updates\n")

# Initialize S3 client
s3 = boto3.client('s3', region_name=REGION)

# Walk through build directory and upload files
build_path = Path(BUILD_DIR)
if not build_path.exists():
    print(f"❌ Build directory not found: {BUILD_DIR}")
    exit(1)

uploaded_count = 0

for file_path in build_path.rglob('*'):
    if file_path.is_file():
        relative_path = file_path.relative_to(build_path)
        s3_key = str(relative_path).replace('\\', '/')
        
        # Determine content type
        content_type, _ = mimetypes.guess_type(str(file_path))
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Set cache control based on file type
        if s3_key in ['index.html', 'asset-manifest.json']:
            cache_control = 'public, max-age=0, must-revalidate'
        else:
            cache_control = 'public, max-age=31536000, immutable'
        
        # Upload file
        try:
            with open(file_path, 'rb') as f:
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key=s3_key,
                    Body=f,
                    ContentType=content_type,
                    CacheControl=cache_control
                )
            print(f"✅ Uploaded: {s3_key}")
            uploaded_count += 1
        except Exception as e:
            print(f"❌ Failed to upload {s3_key}: {e}")

print(f"\n🎉 Deployment complete! Uploaded {uploaded_count} files.")
print(f"\n📍 Frontend URLs:")
print(f"   S3: http://{BUCKET_NAME}.s3-website.{REGION}.amazonaws.com")
print(f"   Domain: https://openpaw.co (if DNS configured)")
print(f"\n🐾 Your rebranded OpenPaw frontend is now live!")
