# 🏗️ CODEBUILD SETUP - COMPLETE GUIDE

**Goal:** Build Docker image with OpenClaw pre-installed, push to ECR

---

## ✅ STEP 1: ECR Repository (DONE)

```
Repository: openpaw-agent
URI: 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent
Region: ap-south-1
```

✅ Already created

---

## ✅ STEP 2: IAM Role (DONE)

```
Role: CodeBuildOpenPawRole
Permissions:
  - AmazonEC2ContainerRegistryPowerUser
  - CloudWatch Logs (custom policy)
```

✅ Already created

---

## 🚀 STEP 3: Create CodeBuild Project

### Option A: AWS Console (5 minutes)

1. **Go to CodeBuild Console:**
   https://console.aws.amazon.com/codesuite/codebuild/projects

2. **Create Project:**
   - Project name: `openpaw-agent-build`
   - Description: `Build OpenPaw agent Docker image`

3. **Source:**
   - Source provider: **No source**
   - Buildspec: **Insert build commands** → **Switch to editor**
   - Paste this:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 851725418250.dkr.ecr.ap-south-1.amazonaws.com
      - REPOSITORY_URI=851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent
      - IMAGE_TAG=latest
      
  build:
    commands:
      - echo Build started on date
      - echo Creating Dockerfile...
      - |
        cat > Dockerfile << 'DOCKERFILE'
        FROM node:22-alpine
        RUN apk add --no-cache bash git
        RUN npm install -g openclaw@latest
        RUN mkdir -p /app/workspace
        WORKDIR /app
        COPY entrypoint.sh /app/entrypoint.sh
        RUN chmod +x /app/entrypoint.sh
        ENTRYPOINT ["/app/entrypoint.sh"]
        DOCKERFILE
      
      - echo Creating entrypoint.sh...
      - |
        cat > entrypoint.sh << 'ENTRYPOINT'
        #!/bin/bash
        set -e
        echo "🚀 Starting OpenPaw Agent $AGENT_ID"
        cd /app/workspace
        if [ ! -d ".git" ]; then
          git init
          git config user.email "agent@openpaw.co"
          git config user.name "Agent-$AGENT_ID"
          cat > SOUL.md << EOF
        # Agent Soul
        Personal AI assistant for user $USER_ID
        Agent ID: $AGENT_ID
        Model: $MODEL
        EOF
          git add . && git commit -m "Initial workspace"
        fi
        mkdir -p /root/.openclaw
        cat > /root/.openclaw/config.json << EOF
        {
          "gateway": {
            "mode": "local",
            "bind": "loopback",
            "port": 18789,
            "auth": {"mode": "token", "token": "agent-token"}
          },
          "channels": {
            "telegram": {
              "enabled": true,
              "botToken": "$TELEGRAM_BOT_TOKEN",
              "dmPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        }
        EOF
        exec openclaw gateway run
        ENTRYPOINT
      
      - echo Building Docker image...
      - docker build -t openpaw-agent:latest .
      - docker tag openpaw-agent:latest $REPOSITORY_URI:$IMAGE_TAG
      
  post_build:
    commands:
      - echo Pushing to ECR...
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Build complete!
```

4. **Environment:**
   - Environment image: **Managed image**
   - Operating system: **Amazon Linux 2**
   - Runtime: **Standard**
   - Image: **aws/codebuild/standard:7.0**
   - Image version: **Always use the latest**
   - Privileged: **✓ Enable** (Required for Docker)
   - Service role: **Existing service role**
   - Role name: **CodeBuildOpenPawRole**

5. **Buildspec:**
   - Use the buildspec above

6. **Artifacts:**
   - Type: **No artifacts**

7. **Logs:**
   - CloudWatch logs: **Enabled** (default)

8. **Create project**

### Option B: AWS CLI (2 minutes)

If you have AWS CLI configured with proper permissions:

```bash
aws codebuild create-project \
  --name openpaw-agent-build \
  --description "Build OpenPaw agent Docker image" \
  --source type=NO_SOURCE,buildspec="$(cat buildspec.yml)" \
  --artifacts type=NO_ARTIFACTS \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true \
  --service-role arn:aws:iam::851725418250:role/CodeBuildOpenPawRole \
  --region ap-south-1
```

---

## 🚀 STEP 4: Start Build

### In Console:
1. Go to project: `openpaw-agent-build`
2. Click **Start build**
3. Leave defaults
4. Click **Start build**

### Via CLI:
```bash
aws codebuild start-build \
  --project-name openpaw-agent-build \
  --region ap-south-1
```

---

## ⏰ STEP 5: Monitor Build (2-3 minutes)

**Build phases:**
1. **SUBMITTED** (0-5 sec) - Queued
2. **PROVISIONING** (10-20 sec) - Creating build environment
3. **PRE_BUILD** (5 sec) - ECR login
4. **BUILD** (90 sec) - npm install openclaw, docker build
5. **POST_BUILD** (10 sec) - docker push to ECR
6. **COMPLETED** - Done!

**Watch logs in console or:**
```bash
aws codebuild batch-get-builds \
  --ids <build-id> \
  --region ap-south-1
```

---

## ✅ STEP 6: Verify Image in ECR

```bash
aws ecr list-images \
  --repository-name openpaw-agent \
  --region ap-south-1
```

Should show:
```json
{
  "imageIds": [
    {
      "imageTag": "latest"
    }
  ]
}
```

---

## 🎯 STEP 7: Update ECS Task Definition

Once image is built, I'll run this:

```javascript
const taskDef = await ecs.send(new RegisterTaskDefinitionCommand({
  family: 'openclaw-agent-task',
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  cpu: '512',
  memory: '1024',
  executionRoleArn: 'arn:aws:iam::851725418250:role/ecsTaskExecutionRole',
  taskRoleArn: 'arn:aws:iam::851725418250:role/ecsTaskRole',
  containerDefinitions: [{
    name: 'openclaw-agent',
    image: '851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest',
    essential: true,
    environment: [
      // Will be overridden per agent
    ],
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': '/ecs/openclaw-agent',
        'awslogs-region': 'ap-south-1',
        'awslogs-stream-prefix': 'agent'
      }
    }
  }]
}));
```

---

## 🧪 STEP 8: Test Provision

```javascript
// Lambda will call:
await ecs.send(new RunTaskCommand({
  cluster: 'openclaw-cluster',
  taskDefinition: 'openclaw-agent-task:7', // New revision
  launchType: 'FARGATE',
  networkConfiguration: {...},
  overrides: {
    containerOverrides: [{
      name: 'openclaw-agent',
      environment: [
        { name: 'AGENT_ID', value: 'agent-123' },
        { name: 'USER_ID', value: 'user-456' },
        { name: 'TELEGRAM_BOT_TOKEN', value: '7766394197:AAE...' },
        { name: 'MODEL', value: 'claude-sonnet-4' }
      ]
    }]
  }
}));
```

---

## ⏰ TIMELINE:

**If you start now:**
- 06:10 - Create CodeBuild project (2 min)
- 06:12 - Start build (1 min)
- 06:15 - Build completes (3 min)
- 06:16 - I update task definition (1 min)
- 06:17 - Provision test agent (1 min)
- 06:18 - **Message @SmartMontuBot and get response!**

**Total: 8 minutes from now**

---

## 🚨 IF BUILD FAILS:

**Common issues:**
1. **npm install fails** - Network timeout (retry)
2. **Docker push fails** - ECR permissions (check role)
3. **Timeout** - Increase timeout to 15 minutes

**Check logs:**
- Console: CodeBuild → Build History → Click build → Phase details
- Look for red errors

---

## 📝 READY TO START?

**Tell me when you've:**
1. Created the CodeBuild project (via console or CLI)
2. Started the build
3. Build status (IN_PROGRESS / SUCCEEDED / FAILED)

**Then I'll:**
- Update ECS task definition
- Provision your agent
- You test with @SmartMontuBot!

**Let's do this! 🚀**
