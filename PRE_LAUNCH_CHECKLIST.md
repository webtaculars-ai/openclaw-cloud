# 🚀 Pre-Launch Checklist - OpenClaw Cloud

## Status: 5 Commits Ready to Push

---

## 📦 Unpushed Commits (Need to Push):

```bash
75e28b6 Add verification documentation for Docker fix
c54d7ba Add helper script to push commits to GitHub
6a8d1bd Add comprehensive documentation of all bugs fixed
a9b1c45 Fix issue #4: Add GET /agents endpoint for listing user agents
cd31eaf Fix critical bug: all Lambda handler paths were wrong
```

**Action Required:** Push these commits to GitHub!

---

## ✅ What's Done

### 1. Infrastructure (AWS)
- ✅ All 6 CDK stacks deployed
- ✅ DynamoDB tables created
- ✅ Cognito authentication configured
- ✅ VPC with public subnets
- ✅ ECS cluster + ECR repository
- ✅ API Gateway with endpoints
- ✅ Amplify app created

### 2. Code Fixes
- ✅ Streaming metering bug fixed (prevents free usage)
- ✅ Lambda handler paths fixed (prevents API failures)
- ✅ GET /agents endpoint added (fixes dashboard)
- ✅ Docker container fixed (OpenClaw from npm)

### 3. Payment Integration
- ✅ Switched to Lemon Squeezy
- ✅ Webhook handler created
- ✅ Configuration scripts ready

### 4. Documentation
- ✅ Complete deployment guide
- ✅ Lemon Squeezy setup guide
- ✅ GoDaddy domain guide
- ✅ Bug fixes documented
- ✅ Docker fix verified

---

## ❌ What's Remaining (Before Going Live)

### 1. **Push Code to GitHub** ⚠️ CRITICAL
```bash
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud
git push origin master
```

**Status:** 🔴 **NOT DONE**  
**Time:** 1 minute  
**Priority:** CRITICAL

---

### 2. **Rebuild & Redeploy Backend** ⚠️ CRITICAL

The Lambda handler paths are fixed in code but **not deployed yet**.

```bash
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/backend

# Install dependencies
npm install

# Rebuild
npm run build

# Redeploy API stack
cd ../infra
npx cdk deploy OpenClawCloudApi --require-approval never
```

**Status:** 🔴 **NOT DONE**  
**Time:** 5-10 minutes  
**Priority:** CRITICAL (all APIs will fail without this)

---

### 3. **Build & Push Docker Image** ⚠️ CRITICAL

```bash
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/agent

# Build
docker build -t openclaw-agent .

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com

# Tag
docker tag openclaw-agent:latest \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest

# Push
docker push \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest
```

**Status:** 🔴 **NOT DONE**  
**Time:** 5-10 minutes  
**Priority:** CRITICAL (agents can't run without this)

---

### 4. **Configure Lemon Squeezy** ⚠️ HIGH

**Steps:**
1. Create account: https://www.lemonsqueezy.com/
2. Get API key: https://app.lemonsqueezy.com/settings/api
3. Create 3 products:
   - Starter: $5 → gives $10 credits (2x bonus)
   - Pro: $20 → gives $20 credits
   - Enterprise: $100 → gives $100 credits
4. Configure webhook: https://app.lemonsqueezy.com/settings/webhooks
   - URL: `https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/webhooks/lemonsqueezy`
   - Event: `order_created`
5. Run configuration script:
   ```bash
   export LEMONSQUEEZY_API_KEY='your_key'
   export LEMONSQUEEZY_WEBHOOK_SECRET='your_secret'
   export LEMONSQUEEZY_STORE_ID='your_store_id'
   export LEMONSQUEEZY_VARIANT_STARTER='variant_id'
   export LEMONSQUEEZY_VARIANT_PRO='variant_id'
   export LEMONSQUEEZY_VARIANT_ENTERPRISE='variant_id'
   
   cd /path/to/openclaw-cloud
   ./configure-lemonsqueezy.sh
   ```

**Status:** 🟡 **NOT DONE**  
**Time:** 25 minutes  
**Priority:** HIGH (can't accept payments without this)

---

### 5. **Deploy Frontend** ⚠️ HIGH

**Option A: Connect GitHub to Amplify (Recommended)**

1. Go to: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
2. Click "Connect branch"
3. Select GitHub → webtaculars-ai/openclaw-cloud
4. Branch: master
5. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `build`
6. Environment variables are already set ✅
7. Deploy

**Option B: Deploy to Vercel**

```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Status:** 🟡 **NOT DONE**  
**Time:** 5 minutes  
**Priority:** HIGH (users can't access dashboard)

---

### 6. **Connect Domain (openpaw.co)** 🟢 OPTIONAL

**Steps:**
1. Add domain in Amplify Console
2. Get DNS records from Amplify
3. Update GoDaddy DNS or switch to Cloudflare/Route53
4. Wait for SSL certificate (15-30 min)

**Status:** 🟡 **NOT DONE**  
**Time:** 45 minutes  
**Priority:** OPTIONAL (can use amplifyapp.com domain initially)

**Guide:** `GODADDY_DOMAIN_SETUP.md`

---

## 📊 Launch Readiness Matrix

| Component | Status | Blocker? | Time | Action |
|-----------|--------|----------|------|--------|
| **Code pushed** | 🔴 No | YES | 1 min | `git push` |
| **Backend redeployed** | 🔴 No | YES | 10 min | `cdk deploy` |
| **Docker image** | 🔴 No | YES | 10 min | Build & push |
| **Lemon Squeezy** | 🟡 No | NO* | 25 min | Configure |
| **Frontend deployed** | 🟡 No | NO* | 5 min | Connect Amplify |
| **Domain connected** | 🟡 No | NO | 45 min | DNS setup |

*Can test without payments initially

---

## ⚠️ CRITICAL PATH (Must Do Before Launch)

**Minimum to go live:**

1. ✅ Push code (1 min)
2. ✅ Redeploy backend (10 min)
3. ✅ Build & push Docker (10 min)

**Total: 21 minutes**

**Recommended before launch:**

4. ✅ Configure Lemon Squeezy (25 min)
5. ✅ Deploy frontend (5 min)

**Total: 51 minutes**

---

## 🧪 Testing Checklist (After Deployment)

### 1. API Health Check
```bash
curl https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/agents \
  -H "Authorization: Bearer TOKEN"
```
Should return: `{"agents": []}`

### 2. Docker Image Check
```bash
aws ecr describe-images \
  --repository-name openclaw-agent \
  --region ap-south-1
```
Should show: Latest image with timestamp

### 3. Frontend Check
- Visit: https://d2spow5okg20j4.amplifyapp.com (or custom domain)
- Sign up
- Dashboard should load

### 4. End-to-End Flow
1. Sign up
2. Purchase credits (if Lemon Squeezy configured)
3. Create Telegram bot
4. Provision agent
5. Send message to bot
6. Verify credits decrease

---

## 📝 Quick Start Commands

```bash
# 1. Push code
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud
git push origin master

# 2. Rebuild backend
cd backend && npm install && npm run build

# 3. Redeploy API
cd ../infra
npx cdk deploy OpenClawCloudApi --require-approval never

# 4. Build Docker
cd ../agent
docker build -t openclaw-agent .

# 5. Push to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com

docker tag openclaw-agent:latest \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest

docker push \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest
```

---

## 💰 Current Costs

**Right now:** ~$0.50/month (infrastructure only)

**After first user:** ~$13/month (if 1 agent runs 24/7)

---

## 🎯 Summary

**What's done:** Infrastructure + Code fixes + Documentation  
**What's needed:** Push + Deploy + Configure payments  
**Time to launch:** 21 minutes (critical path) or 51 minutes (recommended)  

**Next command:** `git push origin master` 🚀

---

**Last Updated:** February 14, 2026  
**Status:** Ready for deployment sequence
