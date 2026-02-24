# 🧠 PROJECT MEMORY - OpenPaw

**Last Updated:** 2026-02-17 20:27  
**Purpose:** Track critical facts to prevent mistakes

---

## ⚠️ CRITICAL: DO NOT FORGET

### Payment Provider
**❌ NOT Stripe**  
**✅ LemonSqueezy**
- SDK: `@lemonsqueezy/lemonsqueezy.js`
- Webhook handler: `backend/src/handlers/lemonsqueezy-webhook.ts`
- Service: `backend/src/services/lemonsqueezy.ts`
- Status: Integrated but needs variant IDs configured

### User Information
**Primary User:** Abhishek Gupta  
- Email: `ag251994@gmail.com`
- User ID: `c153fdca-10b1-7086-0f03-b2c01bb3626a`
- Credits: $20.00 (manually added to DynamoDB)
- Promo used: `LAUNCH2026-72D1E9CE`

### AWS Resources
- **Region:** ap-south-1 (Mumbai)
- **S3 Bucket:** openpaw-frontend-1771074214
- **CloudFront:** E3UJF1A2CPA1SQ (dhg14bstxijsi.cloudfront.net)
- **Domain:** openpaw.co
- **Cognito Pool:** ap-south-1_df2Xgk8QR
- **Cognito Client:** 1gcl93s5257olc9kn1rut8uh60

### DynamoDB Tables
- openclaw-users
- openclaw-agents
- openclaw-credits ✅ HAS DATA ($20 for user)
- openclaw-transactions ✅ HAS DATA (promo redemption logged)
- openclaw-promo-codes ✅ HAS DATA (5 launch codes)

### Lambda Functions
- ✅ **openpaw-redeem-promo** - DEPLOYED (ap-south-1)
  - Handler: handlers/redeem-promo.handler
  - Role: OpenPawLambdaExecutionRole
  - Status: Ready but NOT exposed via API Gateway

### Deployment Status
- ✅ Frontend: Deployed to S3 + CloudFront
- ✅ Backend Lambda: Deployed
- ❌ API Gateway: NOT YET CREATED
- ❌ LemonSqueezy: Needs variant IDs

---

## 🔒 Security Lessons Learned

### What Went Wrong
1. **localStorage for credits** - User caught this! Financial data MUST be server-side
2. **Race conditions** - Fixed with DynamoDB conditional expressions
3. **No input validation** - Added regex + type checks
4. **CORS too open** - Restricted to openpaw.co
5. **Forgot payment provider** - Keep saying "Stripe" when it's LemonSqueezy

### Security Fixes Applied
- ✅ Conditional expressions prevent double-redemption
- ✅ Input validation & sanitization
- ✅ CORS restricted
- ✅ Rate limiting (100 req/s)
- ✅ S3 versioning
- ✅ DynamoDB PITR
- ⏳ Security headers (script created, pending CloudFront)

---

## 🎯 Current Task

### PRIORITY SHIFT: CTO → CEO Mode

**Old Focus:** Infrastructure, security, code  
**New Focus:** Strategy, sales, growth, revenue

**Key Insight from User:**
- "You seem like a CTO" ✅ Accurate
- Need CEO thinking for business success
- Should deploy own OpenClaw instance for strategic work
- Should verify customers can actually deploy

**Files Created:**
- `DEPLOYMENT_GUIDE_V2.md` - Customer deployment docs
- `CEO_MODE_PROPOSAL.md` - Strategic action plan

**Decision Pending:**
- Should I deploy my own OpenClaw instance?
- Purpose: CEO work (market research, content, sales)
- Not for: Technical work (already have that)

---

## 📋 Current Task (Technical Blocker)

### BLOCKED: API Gateway Creation
**Why:** Lambda is deployed but not accessible from frontend

**What's Needed:**
1. Create API Gateway REST API
2. Add resource: /credits
3. Add resource: /credits/redeem-promo
4. Add method: POST
5. Integration: Lambda (openpaw-redeem-promo)
6. Authorizer: Cognito (ap-south-1_df2Xgk8QR)
7. Deploy stage: prod
8. Get invoke URL
9. Update frontend .env: REACT_APP_API_URL
10. Rebuild & redeploy frontend

**Estimated Time:** 20-30 minutes  
**But:** Should I be doing this or CEO work?

---

## 🎯 Brand Positioning

**Core Message:** "Helping Paw" not "Claw"
- Warm, friendly, approachable
- Friend, not tool
- Companion, not agent
- "Like having a smart friend in your pocket 🐾"

**Anti-Patterns:**
- ❌ Technical jargon
- ❌ "Agent", "Deploy", "DevOps"
- ❌ Cold, enterprise vibes
- ❌ Power/control messaging

---

## 📂 Key Files

### Documentation
- `1HR_SPRINT_REPORT.md` - What was shipped
- `SECURITY_AUDIT.md` - Security review
- `SECURITY_FIXES_APPLIED.md` - What was fixed
- `SECURITY_CHECKLIST.md` - Launch readiness
- `CRITICAL_LOCALSTORAGE_FIX.md` - localStorage removal
- `COMPETITIVE_ANALYSIS.md` - Market positioning
- `GROWTH_STRATEGY.md` - 90-day plan
- `TECHNICAL_ROADMAP.md` - Dev priorities
- `PRODUCT_HUNT_PLAN.md` - Launch playbook
- `FEATURE_ROADMAP.md` - Product evolution

### Code Locations
- **Frontend:** `openclaw-cloud/frontend/`
- **Backend:** `openclaw-cloud/backend/`
- **Infra:** `openclaw-cloud/infra/`
- **Lambda Handler:** `backend/src/handlers/redeem-promo.ts`
- **LemonSqueezy:** `backend/src/services/lemonsqueezy.ts`

---

## 🚫 NEVER DO AGAIN

1. **Store financial data in localStorage**
2. **Say "Stripe" when it's LemonSqueezy**
3. **Ship without backend validation**
4. **Allow CORS from all origins**
5. **Skip input validation**
6. **Forget race conditions**
7. **Make security assumptions**

---

## ✅ NEXT ACTIONS (Priority)

1. **Deploy updated frontend** (clearing localStorage)
2. **Create API Gateway** (expose Lambda)
3. **Test end-to-end** (promo redemption)
4. **Configure LemonSqueezy** (variant IDs)
5. **Test payment flow** (LemonSqueezy checkout)
6. **Security headers** (CloudFront function)

---

**Read this file before making any changes.**  
**Update this file when context changes.**  
**Never forget: It's LemonSqueezy, not Stripe.**

🐾
