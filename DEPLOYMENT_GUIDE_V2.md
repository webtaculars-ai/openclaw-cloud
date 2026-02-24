# 🚀 OpenPaw Deployment Guide

**For:** Self-hosted or white-label deployments  
**Status:** Work in Progress  
**Last Updated:** 2026-02-17

---

## 🎯 What You're Deploying

OpenPaw is a **friendly AI companion SaaS** with:
- Frontend (React + CloudFront + S3)
- Backend API (Lambda + API Gateway + DynamoDB)
- Authentication (AWS Cognito)
- Payments (LemonSqueezy)
- Infrastructure (AWS CDK)

**NOT included:** OpenClaw agent runtime (different product)

---

## ⚠️ CURRENT STATUS: PARTIALLY COMPLETE

### ✅ What Works
- Frontend (deployed to S3 + CloudFront)
- Authentication (Cognito configured)
- Database (DynamoDB tables exist)
- Lambda functions (compiled, one deployed)
- Brand assets (complete "helping paw" redesign)
- Security (input validation, rate limiting, PITR)

### ❌ What's Missing
- **API Gateway** (Lambda not exposed to frontend)
- **CDK deployment** (infra code ready but not deployed)
- **LemonSqueezy config** (needs variant IDs)
- **Monitoring** (CloudWatch alarms)
- **Docs** (this file!)

### 🔧 What Needs Fixing
- Backend API must be deployed via CDK
- Frontend must connect to real API (not mock)
- LemonSqueezy products must be created
- Security headers need CloudFront function

---

## 📋 Prerequisites

### AWS Account
- Admin access or PowerUser + IAM permissions
- Credit card on file (free tier covers most)
- AWS CLI configured: `aws configure`

### Required Tools
```bash
# Check versions
node --version  # v18+ required
npm --version   # v9+ required
git --version

# Install AWS CDK
npm install -g aws-cdk
cdk --version

# Bootstrap CDK (first time)
cdk bootstrap aws://ACCOUNT_ID/ap-south-1
```

### Domain Name
- Purchase domain (e.g., `yourcompany.com`)
- **Option A:** Route53 (easier integration)
- **Option B:** External registrar (manual DNS)

### LemonSqueezy Account
- Sign up: lemonsqueezy.com
- Create store
- Get API key
- Create 3 products (Starter, Builder, Pro)
- Note variant IDs

---

## 🏗️ Deployment Steps

### Step 1: Clone & Configure

```bash
# Clone repository
git clone https://github.com/yourusername/openpaw.git
cd openpaw

# Install dependencies
cd infra && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 2: Environment Configuration

#### `backend/.env`
```bash
# LemonSqueezy
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_STARTER=variant_id_1
LEMONSQUEEZY_VARIANT_BUILDER=variant_id_2
LEMONSQUEEZY_VARIANT_PRO=variant_id_3

# Frontend URL (update after Amplify deploy)
FRONTEND_URL=https://yourapp.com
```

#### `frontend/.env`
```bash
# Cognito (get from CDK outputs)
REACT_APP_USER_POOL_ID=ap-south-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx

# API (get from CDK outputs)
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod

# Region
REACT_APP_AWS_REGION=ap-south-1
```

### Step 3: Deploy Infrastructure

```bash
cd infra

# Build CDK app
npm run build

# Preview changes
cdk synth

# Deploy all stacks
cdk deploy --all

# Note the outputs:
# - ApiUrl
# - UserPoolId
# - UserPoolClientId
# - FrontendBucket
```

**Expected time:** 15-20 minutes

**What gets created:**
- VPC with subnets (if agent runtime included)
- Cognito User Pool
- 5 DynamoDB tables
- 8+ Lambda functions
- API Gateway REST API
- S3 bucket for frontend
- CloudFront distribution
- IAM roles

### Step 4: Configure LemonSqueezy

1. **Create Products:**
   - Starter: $5
   - Builder: $15
   - Pro: $50

2. **Get Variant IDs:**
   - Each product → Settings → Copy variant ID

3. **Set Webhook:**
   - URL: `https://YOUR_API_URL/webhooks/lemonsqueezy`
   - Events: `order_created`
   - Secret: Generate and save

4. **Update Lambda:**
```bash
aws lambda update-function-configuration \
  --function-name RechargeCreditsFn \
  --environment Variables={...}
```

### Step 5: Deploy Frontend

```bash
cd frontend

# Update .env with CDK outputs
nano .env

# Build
npm run build

# Deploy to S3
aws s3 sync build/ s3://YOUR_BUCKET_NAME

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Step 6: Configure Domain

#### Option A: Route53
```bash
# Create hosted zone
aws route53 create-hosted-zone --name yourapp.com

# Update nameservers at registrar

# Add A record pointing to CloudFront
# (CDK can automate this)
```

#### Option B: External DNS
1. Get CloudFront distribution domain
2. Create CNAME: `www.yourapp.com` → `xxx.cloudfront.net`
3. For apex (`yourapp.com`), use ALIAS or redirect

### Step 7: SSL Certificate

```bash
# Request certificate (us-east-1 for CloudFront)
aws acm request-certificate \
  --region us-east-1 \
  --domain-name yourapp.com \
  --domain-name www.yourapp.com \
  --validation-method DNS

# Add DNS validation records
# Wait for validation (~5-10 minutes)

# Associate with CloudFront
# (Update CDK or manual in console)
```

### Step 8: Test Everything

**Authentication:**
- Sign up new user
- Verify email
- Log in
- Log out

**Promo Codes:**
- Create test promo in DynamoDB
- Apply on billing page
- Verify credits added
- Check transaction log

**Payments:** (Sandbox mode)
- Click purchase
- Complete LemonSqueezy checkout (test mode)
- Verify webhook received
- Check credits added

---

## 🔐 Security Hardening (Production)

### 1. API Gateway
- [ ] Add usage plans & API keys
- [ ] Configure WAF rules
- [ ] Enable access logging
- [ ] Set up custom domain

### 2. CloudFront
- [ ] Enable access logging
- [ ] Add security headers (CSP, HSTS, etc.)
- [ ] Configure geo-restrictions (if needed)
- [ ] Enable Origin Shield

### 3. Lambda
- [ ] Move secrets to AWS Secrets Manager
- [ ] Enable X-Ray tracing
- [ ] Configure dead-letter queues
- [ ] Set up CloudWatch alarms

### 4. DynamoDB
- [ ] Enable point-in-time recovery
- [ ] Configure backup schedule
- [ ] Add read/write alarms
- [ ] Review access patterns

### 5. Cognito
- [ ] Configure password policy (12+ chars)
- [ ] Enable MFA (optional for users)
- [ ] Set session timeout
- [ ] Configure account recovery

### 6. Monitoring
```bash
# Create CloudWatch dashboard
# Add metrics: API latency, error rate, DynamoDB throttles

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name api-5xx-errors \
  --metric-name 5XXError \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- Lambda: 1M requests/month
- DynamoDB: 25 GB storage
- Cognito: 50K MAU
- CloudFront: 1 TB data transfer

### After Free Tier
| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Lambda | $5-10 | Depends on traffic |
| DynamoDB | $5-15 | On-demand billing |
| CloudFront | $10-50 | Data transfer |
| API Gateway | $3-10 | Request count |
| Route53 | $0.50 | Per hosted zone |
| **Total** | **$25-85/mo** | 100-1000 users |

**Break-even:** ~5 paying customers ($25 revenue covers costs)

---

## 🧪 Testing Checklist

### Pre-Launch
- [ ] Sign up flow works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works (if implemented)
- [ ] Dashboard loads
- [ ] Credits display correctly
- [ ] Promo codes validate
- [ ] Promo codes redeem
- [ ] Payment checkout works
- [ ] Webhook processes payments
- [ ] Credits added after payment
- [ ] Transaction history shows

### Load Testing
```bash
# Use Apache Bench or Artillery
ab -n 1000 -c 10 https://api.yourapp.com/credits

# Check CloudWatch for throttling
# Review DynamoDB metrics
```

### Security Testing
- [ ] HTTPS enforced
- [ ] CORS restricted to your domain
- [ ] Rate limiting works
- [ ] Auth required on protected routes
- [ ] Input validation prevents injection
- [ ] Promo codes can't be double-redeemed

---

## 🚨 Troubleshooting

### "API Gateway not found"
- Check CDK deployed successfully
- Verify region matches
- Check IAM permissions

### "Cognito user can't sign up"
- Check email delivery (SES)
- Verify user pool settings
- Check password policy

### "Promo code fails"
- Check Lambda logs (CloudWatch)
- Verify DynamoDB table exists
- Check IAM permissions on Lambda role

### "Payment webhook not received"
- Check LemonSqueezy webhook URL
- Verify signature secret matches
- Check Lambda logs for errors
- Test with LemonSqueezy webhook tester

### "Frontend shows 403 errors"
- Check S3 bucket policy
- Verify CloudFront origin settings
- Check if using website endpoint vs REST API

---

## 📞 Support

**For deployment issues:**
- Check CloudWatch logs first
- Review CDK synth output
- Verify all environment variables set

**For business questions:**
- Email: support@openpaw.co

---

## 🔄 Updating

### Frontend Updates
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR_BUCKET
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

### Backend Updates
```bash
cd backend
npm run build
cd ../infra
cdk deploy ApiStack  # Redeploys Lambda functions
```

### Database Migrations
- DynamoDB is schemaless
- Add new attributes as needed
- Use UpdateExpression for schema changes
- No downtime required

---

## ⚠️ CURRENT BLOCKER: API Gateway Not Deployed

**This guide is aspirational - infrastructure is ready but:**
1. CDK stacks exist but not all deployed
2. API Gateway needs to be created
3. Lambda needs to be connected
4. Frontend needs real API URL

**Estimated time to complete:** 2-3 hours

**Next:** I should deploy my own instance to test this guide!

---

## 📝 White Label Deployment

Want to brand this as your own product?

1. **Fork repository**
2. **Update branding:**
   - Change "OpenPaw" to your name
   - Replace logo/colors
   - Update meta tags
3. **Configure domain**
4. **Deploy infrastructure**
5. **Launch!**

**License:** Check repository for terms

---

**Last verified:** Never (guide written but not tested end-to-end)  
**Maintainer:** Need to assign  
**Status:** 🚧 Work in Progress
