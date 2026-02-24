#!/bin/bash
# Simplest possible fix: Delete and recreate CodeBuild project

set -e

echo "🗑️  Deleting old CodeBuild project..."
aws codebuild delete-project --name openpaw-agent-build --region ap-south-1 2>/dev/null || echo "Already deleted"

echo ""
echo "🏗️  Creating new CodeBuild project with working buildspec..."

aws codebuild create-project \
  --name openpaw-agent-build \
  --description "Build OpenPaw agent with Chromium" \
  --source '{
    "type": "NO_SOURCE",
    "buildspec": "version: 0.2\nphases:\n  pre_build:\n    commands:\n      - echo Logging into ECR\n      - aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 851725418250.dkr.ecr.ap-south-1.amazonaws.com\n  build:\n    commands:\n      - echo Creating Dockerfile\n      - |\n        cat > Dockerfile <<DOCKEREND\n        FROM node:22-slim\n        RUN apt-get update && apt-get install -y bash git curl chromium chromium-sandbox fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libwayland-client0 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 xdg-utils && rm -rf /var/lib/apt/lists/*\n        ENV CHROME_BIN=/usr/bin/chromium\n        RUN npm install -g openclaw@latest\n        RUN mkdir -p /app/workspace\n        WORKDIR /app\n        DOCKEREND\n      - docker build -t openpaw-agent:latest .\n      - docker tag openpaw-agent:latest 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest\n  post_build:\n    commands:\n      - docker push 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest\n      - echo Build complete"
  }' \
  --artifacts type=NO_ARTIFACTS \
  --environment '{
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true
  }' \
  --service-role arn:aws:iam::851725418250:role/CodeBuildDockerRole \
  --region ap-south-1

echo ""
echo "✅ Project created!"
echo ""
echo "🚀 Starting build..."
aws codebuild start-build --project-name openpaw-agent-build --region ap-south-1 --query 'build.id' --output text
