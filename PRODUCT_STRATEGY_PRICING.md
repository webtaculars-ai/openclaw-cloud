# OpenPaw Product Strategy & Pricing Discussion

**Created:** 2026-02-14 15:45 UTC  
**Purpose:** Define product strategy, pricing model, and credits system before finalizing implementation  
**Status:** DRAFT - For Discussion  

---

## 🎯 Product Overview

### What is OpenPaw?

**OpenPaw Cloud** is a managed AI agent hosting platform that allows users to deploy their own OpenClaw AI agents without managing infrastructure.

**Core Value Proposition:**
- Deploy AI agents in seconds (not hours)
- No infrastructure management required
- Pay only for what you use (LLM credits)
- Connect to Telegram, Discord, WhatsApp, etc.
- Managed ECS Fargate runtime
- Auto-scaling and auto-stop (idle detection)

**Target Audience:**
1. Individual developers wanting personal AI assistants
2. Small teams needing custom agents
3. Businesses wanting branded AI support bots
4. Non-technical users (via simple UI)

---

## 🏗️ Current Technical Architecture

### Infrastructure
- **Frontend:** React app (Amplify hosting)
- **Backend:** Lambda + API Gateway + DynamoDB
- **Runtime:** ECS Fargate (on-demand containers)
- **LLM Provider:** AWS Bedrock (Claude models)
- **Metering:** Custom proxy intercepts all LLM calls

### How It Works
1. User signs up (Cognito)
2. User purchases credits
3. User creates agent (provides Telegram bot token, etc.)
4. System provisions ECS task with OpenClaw container
5. Agent starts, connects to Telegram
6. Every LLM call is metered via proxy
7. Credits deducted in real-time from DynamoDB
8. Agent auto-stops after 15 min idle (cost optimization)

### Cost Structure
**For us (per agent running 24/7):**
- ECS Fargate: ~$13/month
- Infrastructure: ~$0.50/month
- LLM costs: Variable (depends on usage)

**For users:**
- We charge 2x markup on Anthropic credits
- Example: Anthropic charges $3/1M input tokens
- We charge user $6/1M input tokens
- Profit: $3/1M tokens

---

## 💰 Pricing Models Under Consideration

### Option 1: Subscriptions Only (Standard SaaS)

**Tiers:**
```
Starter    - $5/month   → 10 credits/month (2x bonus)
Builder    - $10/month  → 10 credits/month  
Pro        - $20/month  → 20 credits/month
Enterprise - $100/month → 100 credits/month
```

**Pros:**
- ✅ Predictable recurring revenue
- ✅ Standard SaaS model
- ✅ Users never run out unexpectedly
- ✅ Credits auto-reload monthly
- ✅ Better retention (subscriptions reduce churn)
- ✅ Easier to forecast

**Cons:**
- ❌ Higher commitment barrier (monthly charge)
- ❌ Users might not use all credits (waste)
- ❌ Less flexible than pay-as-you-go

**How credits work:**
- Credits reset/reload every month on billing date
- Unused credits expire (don't roll over)
- Can upgrade/downgrade anytime

---

### Option 2: One-Time Purchases Only (Current Implementation)

**Tiers:**
```
Starter    - $5    → $10 credits (2x bonus, first purchase only)
Builder    - $10   → $10 credits
Pro        - $20   → $20 credits
Enterprise - $100  → $100 credits
```

**Pros:**
- ✅ No commitment (lower barrier to entry)
- ✅ Pay only for what you need
- ✅ Credits never expire
- ✅ Good for infrequent users
- ✅ Simpler implementation (already done!)

**Cons:**
- ❌ Users have to manually recharge
- ❌ Friction when credits run out
- ❌ Unpredictable revenue
- ❌ Higher churn (forgot to reload → quit)
- ❌ Not typical for SaaS

**How credits work:**
- Buy once, use forever (until depleted)
- No expiration
- User manually tops up when low

---

### Option 3: Hybrid (One-Time + Subscriptions)

**Primary: Subscriptions**
```
Starter    - $5/month   → 10 credits/month
Builder    - $10/month  → 10 credits/month
Pro        - $20/month  → 20 credits/month
Enterprise - $100/month → 100 credits/month
```

**Secondary: One-Time Top-Ups**
```
Small  - $5   → $5 credits (no bonus)
Medium - $20  → $20 credits
Large  - $100 → $100 credits
```

**Pros:**
- ✅ Best of both worlds
- ✅ Recurring revenue from serious users
- ✅ Flexibility for occasional users
- ✅ Can top up mid-month if needed
- ✅ Lower barrier (try subscription, top up if needed)

**Cons:**
- ❌ More complex to implement
- ❌ Requires handling both payment types
- ❌ More confusing for users (two options)

**How credits work:**
- Subscription: Credits reload monthly, unused expire
- Top-ups: Never expire, stacks with subscription

---

### Option 4: Pay-As-You-Go with Auto-Reload

**No tiers, just auto-reload:**
```
User sets threshold: "When balance < $5, auto-charge $20"
```

**Pros:**
- ✅ Most flexible
- ✅ Never run out unexpectedly
- ✅ Pay only for actual usage
- ✅ Like AWS/Stripe billing model

**Cons:**
- ❌ Most complex to implement
- ❌ Unpredictable charges (users might complain)
- ❌ Need to handle payment failures gracefully
- ❌ Requires stored payment methods

---

## 💳 Credit Value & LLM Cost Mapping

### What is $1 in credits worth?

**Current cost structure:**

**Anthropic Pricing (via Bedrock):**
- Claude Sonnet 4.5: $3 per 1M input tokens, $15 per 1M output tokens
- Average message: ~500 input tokens, ~200 output tokens
- Cost per message: ~$0.0045

**Our pricing (2x markup):**
- Claude Sonnet 4.5: $6 per 1M input tokens, $30 per 1M output tokens
- Cost per message: ~$0.009
- **$1 in credits ≈ 111 messages** (~110 back-and-forth conversations)

**Tier value:**
```
$5 → $10 credits  → ~1,110 messages
$10 → $10 credits → ~1,110 messages
$20 → $20 credits → ~2,220 messages
$100 → $100 credits → ~11,100 messages
```

**Usage patterns:**
- Casual user: 100-500 messages/month → $5-10/month
- Regular user: 1,000-2,000 messages/month → $10-20/month
- Power user: 5,000+ messages/month → $50-100/month

---

## 🎯 Recommended Pricing Strategy

### My Recommendation: **Option 3 (Hybrid)**

**Why:**
1. **Subscriptions for retention** - Serious users subscribe, predictable revenue
2. **One-time for flexibility** - Users can top up when needed
3. **Standard SaaS model** - Most successful SaaS products use subscriptions
4. **Lower churn** - Auto-reload prevents "forgot to recharge" abandonment

**Implementation:**
```
PRIMARY (Subscriptions):
├─ Starter    - $5/month   → 10 credits/month (2x bonus)
├─ Builder    - $10/month  → 10 credits/month
├─ Pro        - $20/month  → 20 credits/month
└─ Enterprise - $100/month → 100 credits/month

SECONDARY (Top-Ups):
├─ Small  - $5   → $5 credits
├─ Medium - $20  → $20 credits
└─ Large  - $100 → $100 credits
```

**User Flow:**
1. User signs up → prompted to choose subscription (with 7-day free trial?)
2. User can cancel subscription anytime
3. If user cancels → still can buy one-time top-ups
4. If user runs low mid-month → can top up instantly

---

## 🤔 Questions for Discussion

### 1. Pricing Model
- [ ] Subscriptions only? (Option 1)
- [ ] One-time only? (Option 2 - current)
- [ ] Hybrid? (Option 3 - recommended)
- [ ] Pay-as-you-go? (Option 4)

### 2. Credit Expiration
- [ ] Subscription credits expire monthly?
- [ ] One-time credits never expire?
- [ ] All credits expire after X months?
- [ ] Roll over unused subscription credits (limited)?

### 3. Free Tier
- [ ] Offer free tier with limited credits? (e.g., $1 free)
- [ ] Free trial for X days? (e.g., 7 days)
- [ ] No free tier (credit card required)?

### 4. Pricing Tiers
- [ ] Keep 2x bonus for first purchase?
- [ ] Remove 2x bonus (simplify)?
- [ ] Offer bulk discounts? (e.g., $100 → $110 credits)

### 5. Agent Limits
- [ ] Limit number of agents per tier? (e.g., Starter = 1 agent, Pro = 5 agents)
- [ ] Unlimited agents (only pay for usage)?

### 6. Cost Transparency
- [ ] Show real-time credit balance in UI?
- [ ] Show estimated cost before sending messages?
- [ ] Alert when balance low?
- [ ] Email notifications for charges?

---

## 📊 Competitor Analysis

### Similar Products

**Zapier:**
- Subscriptions only
- Tiers based on "tasks" (similar to our credits)
- Free tier: 100 tasks/month
- Paid tiers: $20-$600/month

**Twilio:**
- Pay-as-you-go
- Charges per API call
- No subscriptions
- Minimum $20 balance

**OpenAI API:**
- Pay-as-you-go
- Credits purchased upfront
- No expiration
- Auto-reload available

**Most SaaS products:** Use subscriptions with tiered pricing

---

## 💡 Additional Considerations

### 1. Infrastructure Costs
**Current cost (zero users):** ~$0.50/month  
**Cost per 24/7 agent:** ~$13/month (Fargate)  
**Break-even:** ~3 active users at $5/month

**Important:** Agents auto-stop after 15 min idle, so actual costs will be lower!

### 2. Profit Margins
**2x markup on LLM costs** means:
- If user spends $10 in credits
- ~$5 goes to Anthropic
- ~$5 is our gross profit
- Infrastructure costs: ~$0.50-$13/month per user

**Healthy margins** if users are active!

### 3. Competitive Pricing
**We're cheaper than:**
- Hiring a developer ($3,000+/month)
- Managing your own infrastructure ($50-200/month)
- Enterprise AI solutions ($500-5,000/month)

**We're similar to:**
- OpenAI API (pay-as-you-go)
- Other SaaS tools ($5-100/month)

---

## ✅ Next Steps

1. **Discuss this doc with another agent** (product-manager or business advisor)
2. **Decide on pricing model** (Option 1, 2, 3, or 4)
3. **Finalize credit system** (expiration, bonuses, etc.)
4. **Update implementation:**
   - LemonSqueezy setup guide
   - Webhook handlers
   - Frontend UI
   - Database schema (if needed)
5. **Test pricing flow** end-to-end
6. **Launch!** 🚀

---

## 📝 Notes & Ideas

### Other Revenue Streams (Future)
- Enterprise plans with dedicated support
- White-label versions for agencies
- API access for developers
- Pre-built agent templates (marketplace?)

### Marketing Positioning
- **For individuals:** "Your personal AI assistant for $5/month"
- **For teams:** "Deploy custom AI agents without DevOps"
- **For businesses:** "AI-powered customer support, instantly"

### Differentiation
- No infrastructure management (vs self-hosting)
- Simple pricing (vs complex AWS bills)
- Multi-channel support (Telegram, Discord, etc.)
- Managed updates (we update OpenClaw for you)

---

**End of Document**

**Status:** Ready for discussion  
**Owner:** Orchestrator + Product Manager  
**Next:** Review with product-manager agent and finalize strategy
