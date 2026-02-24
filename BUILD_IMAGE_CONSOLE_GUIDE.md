# 🚀 BUILD DOCKER IMAGE - AWS Console Method

**Since I don't have CodeBuild permissions, here's how YOU can trigger the build via AWS Console:**

---

## METHOD 1: AWS CloudShell (FASTEST - 2 minutes)

1. **Open AWS Console** → Click CloudShell icon (top right, looks like >_)

2. **Clone repo** (or upload files):
```bash
# Upload the docker/ folder to CloudShell
# OR if you have GitHub repo:
git clone https://github.com/yourusername/openclaw-cloud.git
cd openclaw-cloud/docker
```

3. **Run build**:
```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t openpaw-agent:latest .

# Tag for ECR
docker tag openpaw-agent:latest \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest

# Push
docker push 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest
```

4. **Done!** New image is in ECR

---

## METHOD 2: Create CodeBuild Project via Console

### Step 1: Create CodeBuild Project

1. Go to **AWS Console** → **CodeBuild** → **Create project**

2. **Project configuration:**
   - Project name: `openpaw-docker-build`
   - Description: "Build OpenPaw agent with browser support"

3. **Source:**
   - Source provider: **Amazon S3** or **No source** (we'll provide buildspec inline)
   - If "No source", paste this buildspec:

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 851725418250.dkr.ecr.ap-south-1.amazonaws.com
  build:
    commands:
      - echo Build started
      - cd docker
      - docker build -t openpaw-agent:latest .
      - docker tag openpaw-agent:latest 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest
  post_build:
    commands:
      - docker push 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest
      - echo Build complete
```

4. **Environment:**
   - Environment image: **Managed image**
   - Operating system: **Ubuntu**
   - Runtime: **Standard**
   - Image: `aws/codebuild/standard:7.0`
   - **Enable "Privileged" flag** ✅ (REQUIRED for Docker)
   - Compute: `3 GB memory, 2 vCPUs` (small)

5. **Service role:**
   - Choose: **New service role** (auto-creates with permissions)
   - Or use existing: `CodeBuildServiceRole`

6. **Click "Create build project"**

### Step 2: Start Build

1. Click **"Start build"**
2. Leave defaults
3. Click **"Start build"** again

### Step 3: Monitor

- Build takes ~3-5 minutes
- Watch the logs in real-time
- Should see "Build complete" at end

---

## METHOD 3: Use Existing Build Infrastructure

Do you already have CodeBuild/CodePipeline set up?

If yes, just point me to the project name and I can trigger it via CLI.

---

## METHOD 4: I Give You Exact CLI Commands

If you have AWS CLI configured locally:

```bash
# 1. Create service role (if doesn't exist)
aws iam create-role \
  --role-name CodeBuildServiceRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "codebuild.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --region ap-south-1

# 2. Attach policies
aws iam attach-role-policy \
  --role-name CodeBuildServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser \
  --region ap-south-1

aws iam attach-role-policy \
  --role-name CodeBuildServiceRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess \
  --region ap-south-1

# 3. Create project
aws codebuild create-project --cli-input-json '{
  "name": "openpaw-docker-build",
  "source": {"type": "NO_SOURCE"},
  "artifacts": {"type": "NO_ARTIFACTS"},
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true
  },
  "serviceRole": "arn:aws:iam::851725418250:role/CodeBuildServiceRole"
}' --region ap-south-1

# 4. Start build
aws codebuild start-build \
  --project-name openpaw-docker-build \
  --region ap-south-1
```

---

## WHAT HAPPENS AFTER BUILD

Once image is in ECR:

1. **Stop old agent**:
   - Go to dashboard
   - Stop agent `8fb89955-6c31-49a0-84e3-ddd505cfc0ae`

2. **Provision new agent**:
   - Same bot token: `8108353665:AAHqBwv8RAZlUG6b-OZv9TFCMny-YBb-w7Y`
   - Will automatically pull latest image

3. **Test browser**:
   - Send: "Open google.com"
   - Send: "Take a screenshot"
   - Should work! ✅

---

## MY RECOMMENDATION

**Fastest:** Use **CloudShell** (Method 1) - literally 2 minutes

**Most Automated:** Create **CodeBuild project** (Method 2) - can reuse forever

**Your call!** Which method works best for you?

Once image is built, we're 30 seconds away from testing browser automation! 🚀
