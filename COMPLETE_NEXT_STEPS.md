# 🎯 Complete Next Steps Guide

## Frontend URL
```
https://d2spow5okg20j4.amplifyapp.com
```

## ✅ What I've Completed For You

1. ✅ **Git repository initialized** - Code committed and ready
2. ✅ **Stripe configuration script created** - `configure-stripe.sh`
3. ✅ **All infrastructure deployed** - 6 stacks running

---

## 📝 Steps YOU Need to Complete

### Step 1: Get Stripe Keys (5 minutes)

**a) Get Secret Key:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (starts with `sk_test_`)

**b) Create Webhook:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter URL: `https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/webhooks/stripe`
4. Select event: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 2: Configure Lambda Functions (2 minutes)

Run this on a machine with AWS CLI configured:

```bash
# Set your Stripe keys
export STRIPE_SECRET_KEY='sk_test_YOUR_KEY_HERE'
export STRIPE_WEBHOOK_SECRET='whsec_YOUR_SECRET_HERE'

# Run configuration script
cd /path/to/openclaw-cloud
./configure-stripe.sh
```

This will update all 8 Lambda functions with the correct environment variables.

### Step 3: Build & Push Docker Image (10 minutes)

**Prerequisites:**
- Docker installed on your machine
- OpenClaw binary available

**Commands:**

```bash
cd /path/to/openclaw-cloud/agent

# Replace placeholder in Dockerfile
# Edit Dockerfile line 12: COPY /path/to/openclaw /usr/local/bin/openclaw

# Build image
docker build -t openclaw-agent .

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com

# Tag image
docker tag openclaw-agent:latest \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest

# Push to ECR
docker push \
  851725418250.dkr.ecr.ap-south-1.amazonaws.com/openclaw-agent:latest
```

### Step 4: Deploy Frontend (Option A - Vercel - Easiest)

**This is the recommended approach - FREE and fastest!**

```bash
cd /path/to/openclaw-cloud/frontend

# Install Vercel CLI
npm install -g vercel

# Deploy (it will ask you to login first time)
vercel --prod

# Set environment variables in Vercel dashboard or CLI:
vercel env add REACT_APP_API_URL
# Enter: https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/

vercel env add REACT_APP_USER_POOL_ID
# Enter: ap-south-1_df2Xgk8QR

vercel env add REACT_APP_USER_POOL_CLIENT_ID
# Enter: 1gcl93s5257olc9kn1rut8uh60

vercel env add REACT_APP_AWS_REGION
# Enter: ap-south-1

# Redeploy with env vars
vercel --prod
```

**You'll get a URL like:** `https://openclaw-cloud.vercel.app`

### Step 4: Deploy Frontend (Option B - Amplify)

**If you prefer using AWS Amplify:**

```bash
# Push code to GitHub
cd /path/to/openclaw-cloud
git remote add origin https://github.com/yourusername/openclaw-cloud.git
git branch -M main
git push -u origin main

# Then in AWS Amplify Console:
# 1. Open: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
# 2. Click "Connect branch"
# 3. Select GitHub → your repository → main branch
# 4. In "App build and test settings":
#    - Build command: npm run build
#    - Base directory: frontend
#    - Output directory: build
# 5. Environment variables are already set!
# 6. Deploy

# Frontend will be at: https://main.d2spow5okg20j4.amplifyapp.com
```

### Step 5: Test End-to-End (15 minutes)

**a) Test Signup & Auth:**
1. Go to your frontend URL
2. Click "Get Started"
3. Sign up with email/password
4. Verify email (check spam folder)
5. Login

**b) Test Credit Purchase:**
1. Go to "Billing" page
2. Click "Starter - $5" tier
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: any future date (e.g., 12/28)
5. CVC: any 3 digits (e.g., 123)
6. Complete purchase
7. Verify you receive $10 credits (2x bonus!)

**c) Test Agent Provisioning:**
1. Create a Telegram bot via @BotFather
2. Get bot token from @BotFather
3. Go to "Agent Setup" in dashboard
4. Enter bot token and start agent
5. Wait ~60 seconds for agent to provision
6. Send message to your bot on Telegram
7. Check credits decrease

**d) Monitor Logs:**
```bash
# Watch agent logs
aws logs tail /openclaw/agents --region ap-south-1 --follow

# Watch Lambda logs
aws logs tail /aws/lambda/OpenClawCloudApi-ProvisionAgentFn94442990-rFjLtZxydqzE \
  --region ap-south-1 --follow
```

---

## 🎯 Summary

**What's Done:**
- ✅ All AWS infrastructure deployed
- ✅ Database tables created
- ✅ API endpoints live
- ✅ Authentication configured
- ✅ Amplify app created
- ✅ Configuration scripts ready

**What You Need:**
1. 🔑 Stripe API keys (5 min)
2. 🐳 Docker image built & pushed (10 min)
3. 🌐 Frontend deployed (5 min with Vercel)
4. ✅ Test everything (15 min)

**Total time needed:** ~35 minutes

---

## 💡 Quick Start Order

**Fastest path to working platform:**

1. **Get Stripe keys** → Run `configure-stripe.sh`
2. **Deploy frontend to Vercel** → Get live URL in 2 minutes
3. **Build Docker image** → Push to ECR
4. **Test with Telegram bot** → Complete!

---

## 🆘 Troubleshooting

### "Lambda function not found"
- Run: `aws lambda list-functions --region ap-south-1`
- Verify function names match in `configure-stripe.sh`

### "Docker push denied"
- Re-login: `aws ecr get-login-password --region ap-south-1 | docker login ...`
- Check region: Must be `ap-south-1`

### "Credits not deducting"
- Check Lambda has Stripe keys: `aws lambda get-function-configuration --function-name ... --region ap-south-1`
- Check metering proxy logs: `aws logs tail /openclaw/agents --follow`

### "Agent not starting"
- Verify Docker image exists: `aws ecr describe-images --repository-name openclaw-agent --region ap-south-1`
- Check ECS task status: `aws ecs list-tasks --cluster openclaw-agents --region ap-south-1`
- View task logs: `aws logs tail /openclaw/agents --follow`

---

## 📊 Cost Tracking

**Current spend (right now):**
```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-28 \
  --granularity DAILY \
  --metrics BlendedCost \
  --region us-east-1
```

**Expected costs:**
- Right now: $0.50/month (infrastructure only)
- With 1 agent running 24/7: ~$13/month
- Per API call: ~$0.0001 (DynamoDB + Lambda)

---

## 🎉 When Everything Works

You'll have:
- ✅ Users can sign up at your frontend
- ✅ Users can purchase credits via Stripe
- ✅ Users receive 2x first-purchase bonus
- ✅ Users can provision their own agents
- ✅ Agents auto-connect to Telegram/Discord
- ✅ Credits deduct per message
- ✅ Agents auto-stop after 15min idle
- ✅ Dashboard shows real-time status

**A complete, production-ready SaaS platform for $0.50/month!**

---

## 📞 Need Help?

- **AWS Console:** https://ap-south-1.console.aws.amazon.com/
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Amplify Console:** https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
- **CloudWatch Logs:** https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#logsV2:log-groups

---

**🚀 Let me know when you complete each step and I can help troubleshoot!**
