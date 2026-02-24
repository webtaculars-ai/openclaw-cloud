# Browser Automation Deployment Guide

## Changes Made

### 1. Dockerfile Updates
**File**: `docker/Dockerfile`

Added Chromium browser and all required dependencies:
- Chromium browser (`chromium`, `chromium-sandbox`)
- Graphics libraries (`libgbm1`, `libdrm2`, `libxcomposite1`, etc.)
- Font rendering (`fonts-liberation`)
- Audio support (`libasound2`)
- GTK/Wayland support for UI rendering

Environment variables set:
- `CHROME_BIN=/usr/bin/chromium`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`

### 2. OpenClaw Configuration
**File**: `docker/entrypoint.sh`

Added browser configuration block:
```json
{
  "browser": {
    "enabled": true,
    "headless": true,
    "defaultProfile": "openclaw",
    "noSandbox": true,
    "executablePath": "/usr/bin/chromium",
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu"
    ]
  }
}
```

Key settings:
- `headless: true` - No GUI in ECS environment
- `noSandbox: true` - Required for containerized environments
- `defaultProfile: "openclaw"` - Use OpenClaw-managed browser (not Chrome extension)
- `--disable-dev-shm-usage` - Prevents shared memory issues in containers

### 3. ECS Task Resources
**File**: `infra/lib/agent-runtime-stack.ts`

Increased Fargate task resources:
- **CPU**: 256 → 1024 (0.25 vCPU → 1 vCPU)
- **Memory**: 512 MB → 2048 MB (2 GB)

Browser automation requires significantly more resources than text-only agents.

## Deployment Steps

### Step 1: Build and Push Docker Image

```bash
cd openclaw-cloud

# Authenticate with ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t openclaw-agent:browser ./docker

# Tag and push
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name OpenClawAgentRuntimeStack \
  --query 'Stacks[0].Outputs[?ExportName==`OpenClawRepositoryUri`].OutputValue' \
  --output text)

docker tag openclaw-agent:browser $ECR_URI:latest
docker tag openclaw-agent:browser $ECR_URI:browser-v1

docker push $ECR_URI:latest
docker push $ECR_URI:browser-v1
```

**Build time**: ~5-10 minutes (larger image with Chromium dependencies)
**Image size**: ~800 MB (up from ~200 MB)

### Step 2: Deploy Updated Infrastructure

```bash
cd infra

# Compile TypeScript changes
npm run build

# Deploy (updates task definition with new resources)
cdk deploy OpenClawAgentRuntimeStack --require-approval never

# Verify new task definition
aws ecs describe-task-definition \
  --task-definition openclaw-agent \
  --query 'taskDefinition.{cpu:cpu,memory:memory}' \
  --output table
```

Expected output:
```
-------------------------------
|  DescribeTaskDefinition     |
+--------+--------------------+
|  cpu   |  memory            |
+--------+--------------------+
|  1024  |  2048              |
+--------+--------------------+
```

### Step 3: Test Browser Automation

#### Option A: Manual Test
1. Log in to OpenPaw dashboard
2. Create a test agent
3. Send message: "Open google.com and take a screenshot"
4. Agent should respond with screenshot image

#### Option B: Local Docker Test
```bash
cd docker

# Run test script in local container
docker run --rm openclaw-agent:browser bash /app/test-browser.sh
```

Expected output:
```
🧪 Testing Browser Automation
================================

✓ Test 1: Chromium installed
Chromium 120.x.x.x

✓ Test 2: Checking required libraries
  ✓ libgbm.so.1 found
  ✓ libnss3.so found
  ✓ libatk-1.0.so.0 found
  ✓ libcups.so.2 found

✓ Test 3: Testing headless Chromium
  ✓ Chromium headless mode works

✅ All browser automation tests passed!
```

## Cost Impact

### Before (Text-only agents)
- Task size: 0.25 vCPU, 0.5 GB
- Cost per hour: ~$0.006/hour
- Monthly cost (1 agent, 24/7): ~$4.32/month

### After (Browser-enabled agents)
- Task size: 1 vCPU, 2 GB
- Cost per hour: ~$0.048/hour
- Monthly cost (1 agent, 24/7): ~$34.56/month

**Cost increase**: 8x for browser capability

### Optimization Strategies
1. **On-demand browser**: Only start browser-enabled agents when needed
2. **Auto-scaling**: Scale down during low-usage periods
3. **Spot instances**: Use Fargate Spot for 70% cost savings
4. **Resource tuning**: Monitor actual usage, may be able to reduce to 0.5 vCPU / 1.5 GB

## Troubleshooting

### Issue: "Chromium failed to launch"
**Solution**: Check that `noSandbox: true` is set in config. Sandboxing doesn't work in containers without privileged mode.

### Issue: "Failed to load shared library"
**Solution**: Ensure all dependencies are installed in Dockerfile. Run `ldd /usr/bin/chromium` to check.

### Issue: "Browser timeout"
**Solution**: Increase task memory. Browser may be OOM killed with insufficient RAM.

### Issue: "Screenshot is blank"
**Solution**: Add `--disable-gpu` flag (already included). Software rendering required in containerized environments.

## Verification Checklist

- [ ] Docker image builds successfully
- [ ] Image pushed to ECR
- [ ] CDK deploy completes without errors
- [ ] New task definition uses 1 vCPU / 2 GB
- [ ] Test agent starts successfully
- [ ] Browser commands work (open URL)
- [ ] Screenshots are generated
- [ ] CloudWatch logs show browser initialization
- [ ] No Chromium error logs

## Next Steps

1. **Add browser commands to agent prompts**: Update SOUL.md templates to mention browser capabilities
2. **Create browser skill library**: Pre-built workflows for common tasks (form filling, data extraction)
3. **Add browser usage tracking**: Track browser sessions for billing/analytics
4. **Implement browser pooling**: Share browser instances across multiple agents for efficiency
5. **Add screenshot storage**: Upload screenshots to S3 instead of inline images

## Marketing Angle

> **"AI That Acts, Not Just Chats"**
> 
> OpenPaw agents can now browse the web, fill forms, extract data, and interact with websites — all through natural conversation.
> 
> - Book appointments
> - Research competitors
> - Monitor prices
> - Fill out applications
> - Extract structured data
> - Test web applications
> 
> **The killer feature ChatGPT doesn't have.**

---

**Deployment Date**: 2026-02-19
**Updated By**: Backend Dev (Agent)
**Status**: Ready for deployment
