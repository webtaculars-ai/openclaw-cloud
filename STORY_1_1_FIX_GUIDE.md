# 🔧 STORY 1.1 FIX: Deploy Browser-Enabled Image

**Problem:** Current agent running OLD Docker image without browser support  
**Solution:** Build and deploy NEW image, then restart agent

---

## WHAT HAPPENED

The test agent is running an image from BEFORE we added browser config.
Even though our Dockerfile HAS Chromium installed, the running container doesn't have the updated code.

**Current task:**
- Started: 2 hours ago (14:32 UTC)
- Image: Old version (before browser config)
- Task Definition: Revision 7 (old)

**What we need:**
- Fresh image build
- Updated task definition (revision 8 with 2GB RAM)
- New agent instance

---

## OPTION 1: Build Locally (If You Have Docker)

```bash
cd /path/to/openclaw-cloud/docker

# Make script executable
chmod +x build-and-push.sh

# Run build (takes ~5 minutes)
./build-and-push.sh
```

**Then:**
1. Stop old agent via UI
2. Provision new agent (gets latest image automatically)
3. Test browser commands

---

## OPTION 2: Use AWS CodeBuild (If Set Up)

If you have CodeBuild project configured:

```bash
aws codebuild start-build --project-name openpaw-image-build --region ap-south-1
```

Monitor build, then provision new agent.

---

## OPTION 3: I Build It (Need AWS CLI Access)

If you can give me:
- AWS CLI access with ECR push permissions
- Or run the build script yourself

---

## OPTION 4: Quick Test - Rebuild Image Manually

Since we can't build from this environment, here's what YOU should do:

### Step 1: Build Image (On Your Machine)

```bash
# Clone or navigate to project
cd openclaw-cloud/docker

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t openpaw-agent:latest .

# Tag for ECR
docker tag openpaw-agent:latest \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest

# Push to ECR
docker push 851725418250.dkr.ecr.ap-south-1.amazonaws.com/openpaw-agent:latest
```

### Step 2: Stop Old Agent

Via UI dashboard:
- Go to agents list
- Stop agent 8fb89955-6c31-49a0-84e3-ddd505cfc0ae

OR via API:
```bash
curl -X POST \
  'https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/8fb89955-6c31-49a0-84e3-ddd505cfc0ae/stop' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Step 3: Provision Fresh Agent

Via UI:
- Go to "New Agent" or dashboard
- Use same bot token: `8108353665:AAHqBwv8RAZlUG6b-OZv9TFCMny-YBb-w7Y`
- Click "Start Agent"
- Will automatically use latest image from ECR

### Step 4: Test Browser

Send to @smarttest1234bot:
1. "Open google.com"
2. "Take a screenshot"

---

## WHAT'S IN THE NEW IMAGE

✅ Node.js 22 (Debian slim)  
✅ Chromium + all dependencies  
✅ OpenClaw pre-installed  
✅ Browser config enabled  
✅ Git workspace setup  

**Config includes:**
```json
{
  "browser": {
    "enabled": true,
    "headless": true,
    "defaultProfile": "openclaw",
    "noSandbox": true,
    "executablePath": "/usr/bin/chromium"
  }
}
```

---

## TROUBLESHOOTING

### If browser still doesn't work after rebuild:

**Check 1: Chromium installed**
```bash
# In container (if you can exec)
which chromium
chromium --version
```

**Check 2: Config loaded**
```bash
# Check logs
aws logs tail /ecs/openclaw-agent --since 5m --region ap-south-1 | grep browser
```

**Check 3: Resources**
New task should have:
- CPU: 1024 (1 vCPU)
- Memory: 2048 MB (2 GB)

---

## EXPECTED RESULTS AFTER FIX

**Before (current):**
```
User: "Open google.com"
Bot: "browser isn't available... no Chrome/Brave/Edge found"
```

**After (fixed):**
```
User: "Open google.com"
Bot: "Opening google.com..." [returns success + optional screenshot]
```

---

## MY RECOMMENDATION

**Fastest path:**

1. **You build image** (5 minutes):
   ```bash
   cd openclaw-cloud/docker
   chmod +x build-and-push.sh
   ./build-and-push.sh
   ```

2. **Stop old agent** (via UI - 10 seconds)

3. **Provision new agent** (via UI - 30 seconds)

4. **Test browser** (send 3 messages - 1 minute)

**Total time: ~10 minutes to working browser automation**

---

## WHAT TO DO NOW

**Pick one:**

**A)** You build and push image now (I've provided script)  
**B)** Give me AWS access to build it  
**C)** We skip browser for now, move to cron jobs  

**I strongly recommend A** - you're 10 minutes away from working browser automation!

What do you want to do? 🚀
