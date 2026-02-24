#!/bin/bash
set -e

echo "🏗️ Setting up CodeBuild for OpenPaw Agent"
echo ""

# Create CodeBuild project using AWS CLI
echo "📝 Creating CodeBuild project..."

cat > /tmp/codebuild-project.json << 'EOF'
{
  "name": "openpaw-agent-build",
  "description": "Build OpenPaw agent Docker image",
  "source": {
    "type": "NO_SOURCE",
    "buildspec": "version: 0.2\nphases:\n  pre_build:\n    commands:\n      - echo Logging in to Amazon ECR...\n      - aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 851725418250.dkr.ecr.ap-south-1.amazonaws.com\n      - REPOSITORY_URI=851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent\n      - IMAGE_TAG=latest\n  build:\n    commands:\n      - echo Build started on date\n      - echo Building the Docker image...\n      - echo 'FROM node:22-alpine' > Dockerfile\n      - echo 'RUN apk add --no-cache bash git' >> Dockerfile\n      - echo 'RUN npm install -g openclaw@latest' >> Dockerfile\n      - echo 'RUN mkdir -p /app/workspace' >> Dockerfile\n      - echo 'WORKDIR /app' >> Dockerfile\n      - echo 'COPY entrypoint.sh /app/entrypoint.sh' >> Dockerfile\n      - echo 'RUN chmod +x /app/entrypoint.sh' >> Dockerfile\n      - echo 'ENTRYPOINT [\"/app/entrypoint.sh\"]' >> Dockerfile\n      - cat > entrypoint.sh << 'ENTRY'\n      - '#!/bin/bash'\n      - 'set -e'\n      - 'echo \"Starting OpenPaw Agent\"'\n      - 'cd /app/workspace'\n      - 'if [ ! -d \".git\" ]; then'\n      - '  git init'\n      - '  git config user.email \"agent@openpaw.co\"'\n      - '  git config user.name \"Agent-$AGENT_ID\"'\n      - '  cat > SOUL.md << EOF2'\n      - '# Agent Soul'\n      - 'You are a personal AI assistant.'\n      - 'Agent ID: $AGENT_ID'\n      - 'User ID: $USER_ID'\n      - 'Model: $MODEL'\n      - 'EOF2'\n      - '  git add . && git commit -m \"Initial workspace\"'\n      - 'fi'\n      - 'mkdir -p /root/.openclaw'\n      - 'cat > /root/.openclaw/config.json << EOF3'\n      - '{'\n      - '  \"gateway\": {\"mode\": \"local\", \"bind\": \"loopback\", \"port\": 18789, \"auth\": {\"mode\": \"token\", \"token\": \"agent-token\"}},'\n      - '  \"channels\": {\"telegram\": {\"enabled\": true, \"botToken\": \"$TELEGRAM_BOT_TOKEN\", \"dmPolicy\": \"open\", \"allowFrom\": [\"*\"]}}'\n      - '}'\n      - 'EOF3'\n      - 'exec openclaw gateway run'\n      - 'ENTRY'\n      - docker build -t openpaw-agent:latest .\n      - docker tag openpaw-agent:latest $REPOSITORY_URI:$IMAGE_TAG\n  post_build:\n    commands:\n      - echo Build completed\n      - docker push $REPOSITORY_URI:$IMAGE_TAG\n"
  },
  "artifacts": {
    "type": "NO_ARTIFACTS"
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true
  },
  "serviceRole": "arn:aws:iam::851725418250:role/CodeBuildOpenPawRole",
  "timeoutInMinutes": 10
}
EOF

# This will fail due to permissions, but we'll document the command
echo ""
echo "⚠️  Cannot create via this EC2 instance (missing permissions)"
echo ""
echo "📋 Please run this command manually with proper AWS credentials:"
echo ""
echo "aws codebuild create-project --cli-input-json file:///tmp/codebuild-project.json --region ap-south-1"
echo ""
echo "Or use the AWS Console:"
echo "1. Go to AWS CodeBuild console"
echo "2. Create new project"
echo "3. Use the configuration in /tmp/codebuild-project.json"
