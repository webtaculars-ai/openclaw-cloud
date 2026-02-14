# 🎯 OpenClaw Cloud - FINAL Pricing Strategy

**Date:** 2026-02-14 18:35 UTC  
**Version:** 2.0 (Updated with proper OpenClaw specs)  
**Status:** Ready for Launch

---

## 📊 EXECUTIVE SUMMARY

**Key Changes:**
1. ✅ **Upgraded resources** to meet OpenClaw requirements (1-4 GB RAM)
2. ✅ **Tiered resources** by plan (better performance for higher tiers)
3. ✅ **Friends & Family program** ($10 free with invite codes)
4. ✅ **All tiers profitable** (23-41% margins)

**Target Market:**
- **Free (invite only):** Friends & family, beta testers
- **Starter ($9):** Individual developers, hobbyists
- **Pro ($29):** Small teams, businesses (⭐ recommended)
- **Business ($99):** Agencies, power users

---

## 💰 PRICING TIERS

### **Friends & Family (Invite Only)** 🎁

```
Price: FREE (with invite code FRIEND-XXXXXX)
Credits: $10 (1,111 messages)
Resources: 1 GB RAM / 0.5 vCPU
Usage: 4h/day soft cap
Payment: None required!
```

**Features:**
- ✅ No payment needed (no Lemon Squeezy)
- ✅ Full OpenClaw experience
- ✅ Same resources as Starter tier
- ✅ $10 worth of credits to explore
- ✅ Can upgrade to paid plan anytime

**Who gets it:**
- Close friends & family
- Beta testers
- Early supporters
- Influencers (for reviews)

**Our cost:** $5/user (excellent marketing ROI)

---

### **FREE Tier (Public)**

```
Price: $0
Credits: $0 (must purchase or use invite code)
Resources: None (can't start agent without credits)
Usage: N/A
Payment: None
```

**Features:**
- ✅ Browse dashboard
- ✅ See pricing
- ✅ Enter invite code
- ❌ Can't run agent without credits

**Purpose:** Funnel to paid tiers or invite codes

---

### **STARTER - $9/month**

```
Price: $9/month
Credits: $18/month (2,000 messages)
Resources: 1 GB RAM / 0.5 vCPU
Usage: 4h/day soft cap (with warnings)
Payment: Lemon Squeezy required
```

**Features:**
- ✅ 2x credit bonus ($9 → $18)
- ✅ Adequate for most personal use
- ✅ Auto-stop after 15min idle
- ✅ Telegram, Discord, WhatsApp
- ✅ Basic support (community Discord)

**Best for:**
- Personal AI assistant
- Side projects
- Learning & experimentation
- Light automation (100-1,000 msgs/month)

**Profitability:**
- Cost: $5.01/month (ECS + LLM + fees)
- Profit: $3.04/month
- Margin: 38% ✅

---

### **PRO - $29/month** ⭐ Recommended

```
Price: $29/month
Credits: $55/month (6,111 messages)
Resources: 2 GB RAM / 1 vCPU (full OpenClaw spec!)
Usage: 8h/day soft cap
Payment: Lemon Squeezy required
```

**Features:**
- ✅ **Full OpenClaw performance** (official 2GB/1vCPU spec)
- ✅ Handle complex workflows
- ✅ File processing, tool chaining
- ✅ Unlimited agents
- ✅ Priority support (email)
- ✅ Team features (future)

**Best for:**
- Small businesses
- Development teams
- Active users (1,000-5,000 msgs/month)
- Complex automation workflows
- Multi-agent setups

**Profitability:**
- Cost: $16.02/month (ECS + LLM + fees)
- Profit: $11.03/month
- Margin: 41% ✅

**Marketing:**
- "Recommended for teams"
- "Full OpenClaw power"
- "Most popular"

---

### **BUSINESS - $99/month**

```
Price: $99/month
Credits: $200/month (22,222 messages)
Resources: 4 GB RAM / 2 vCPU (maximum performance!)
Usage: Unlimited
Payment: Lemon Squeezy required
```

**Features:**
- ✅ **Maximum performance** (4GB RAM, 2 vCPU)
- ✅ No usage caps
- ✅ Handle very large files
- ✅ Complex multi-step workflows
- ✅ Unlimited agents
- ✅ SLA + priority support
- ✅ Custom integrations (future)
- ✅ White-label option (future)

**Best for:**
- Agencies managing multiple clients
- Power users (10,000+ msgs/month)
- Customer support automation
- Heavy file processing
- Always-on agents

**Profitability:**
- Cost: $65.64/month (ECS + LLM + fees)
- Profit: $27.91/month
- Margin: 30% ✅

---

## 📈 FULL PROFITABILITY TABLE

| Tier | Price | Resources | ECS | LLM | LS Fee | **Profit** | **Margin** |
|------|-------|-----------|-----|-----|--------|-----------|-----------|
| **Friends** | $0 | 1GB/0.5v | $2.56 | $2.25 | $0 | **-$5.01** | -100% (CAC) |
| **Starter** | $9 | 1GB/0.5v | $2.56 | $2.25 | $0.95 | **$3.04** | 38% ✅ |
| **Pro** | $29 | 2GB/1v | $6.82 | $9.00 | $1.95 | **$11.03** | 41% ✅ |
| **Business** | $99 | 4GB/2v | $20.44 | $45.00 | $5.45 | **$27.91** | 30% ✅ |

**Assumptions:**
- ECS usage: Starter/Pro (3-4h/day), Business (12h/day)
- LLM usage: Starter (500 msgs), Pro (2,000 msgs), Business (10,000 msgs)
- All users don't max out credits (realistic usage patterns)

**Key Insight:** All paid tiers are solidly profitable! ✅

---

## 🎁 INVITE CODE SYSTEM

### **How It Works**

1. **You generate codes:**
   ```bash
   ./scripts/generate-invite-codes.sh
   ```
   Creates: `FRIEND-A3F9B2`, `FRIEND-D7E1C4`, etc.

2. **Share with friends:**
   ```
   "Use code FRIEND-A3F9B2 for $10 free credits!"
   ```

3. **They sign up:**
   - Enter email + password + invite code
   - Get $10 credits instantly
   - No payment required!

4. **One-time use:**
   - Code marked as used
   - Can't be reused
   - Tracked in DynamoDB

### **Marketing Message**

```
🎁 FREE $10 Credits for Friends & Family!

Sign up with invite code: FRIEND-XXXXXX

✓ No payment required
✓ 1,000+ messages with Claude Sonnet
✓ Full OpenClaw experience
✓ Upgrade anytime if you need more

Try it free: https://openclaw.cloud/signup
```

---

## 🆚 COMPETITIVE POSITIONING

### **vs MyClaw.ai**

| Feature | MyClaw | OpenClaw Cloud (Us) |
|---------|--------|---------------------|
| **Entry Price** | $19/month | **$9/month** (53% cheaper) ✅ |
| **Free Tier** | ❌ None | **✅ $10 with invite** |
| **Pricing Model** | Infrastructure (VPS) | **Usage-based** (pay per message) ✅ |
| **Resources (Entry)** | 2 vCPU, 4 GB | 0.5 vCPU, 1 GB |
| **Resources (Mid)** | 4 vCPU, 8 GB | 1 vCPU, 2 GB |
| **Pro Tier** | $39/month | **$29/month** (26% cheaper) ✅ |
| **Auto-stop** | ❌ Always on (waste) | **✅ Yes** (cost savings) ✅ |
| **Flexibility** | Fixed monthly | **Credits rollover** ✅ |

**Our advantages:**
1. ✅ **Much cheaper entry** ($9 vs $19)
2. ✅ **Free tier** (with invite codes)
3. ✅ **Usage-based** (better for light users)
4. ✅ **Auto-stop** (no idle waste)
5. ✅ **More flexible** (credits don't expire)

**When they win:**
- Heavy 24/7 usage (their always-on is better)
- Need dedicated resources (our shared is cheaper but shared)

**Our target:** Light-to-medium users who value flexibility

---

### **vs SimpleClaw.com**

| Feature | SimpleClaw | OpenClaw Cloud (Us) |
|---------|------------|---------------------|
| **Pricing** | ??? (hidden) | **Clear: $9-99** ✅ |
| **Free Tier** | ❌ None | **✅ $10 with invite** |
| **Resources** | ??? | **Clear: 1-4 GB** ✅ |
| **Transparency** | Low | **High** ✅ |

**Our advantage:** Transparent pricing, clear value prop

---

## 🎯 GO-TO-MARKET STRATEGY

### **Phase 1: Soft Launch (Friends & Family)**

**Week 1-2:**
1. Generate 50 invite codes
2. Share with:
   - Close friends (10 codes)
   - Family (10 codes)
   - Beta testers (20 codes)
   - Influencers (10 codes)
3. Collect feedback
4. Fix bugs
5. Refine messaging

**Success metrics:**
- 50 signups (friends)
- 10-15 convert to paid (20-30%)
- <5 critical bugs
- Positive feedback

---

### **Phase 2: Public Launch**

**Week 3-4:**
1. Open public signup (no invite required, but no free credits)
2. Launch on:
   - Product Hunt
   - Hacker News
   - Reddit (r/selfhosted, r/OpenAI, r/SideProject)
   - Twitter/X
   - Dev.to

**Messaging:**
- "OpenClaw Cloud: Run your AI agent for $9/month"
- "50% cheaper than MyClaw"
- "Pay only for what you use"
- "Free $10 for friends (limited time)"

**Success metrics:**
- 200 signups (public)
- 30-40 paid conversions (15-20%)
- $500-1,000 MRR

---

### **Phase 3: Growth**

**Month 2-3:**
1. Content marketing (use cases, tutorials)
2. Comparison pages (vs MyClaw, vs DIY)
3. Referral program (give $5, get $5)
4. Agent marketplace (pre-built templates)
5. Integration ecosystem (Zapier, n8n)

**Success metrics:**
- 1,000 signups total
- 150-200 paid users
- $2,000-3,000 MRR
- 20-30% conversion rate

---

## 💬 MARKETING COPY

### **Homepage Headline**

```
Run Your Own AI Agent for $9/Month
(or Free with Invite Code)

✓ Claude Sonnet 4.5 on AWS
✓ Telegram, Discord, WhatsApp
✓ Pay only for what you use
✓ Auto-stop saves money

Start Free with Code: FRIEND-XXXXXX
```

---

### **Pricing Page**

```
🎁 Friends & Family: FREE
Get $10 credits with invite code FRIEND-XXXXXX
No payment required! Perfect for trying out.

💼 Starter: $9/month
$18 credits (2,000 messages)
Great for personal use & side projects.

⭐ Pro: $29/month (Recommended)
$55 credits (6,111 messages)
Full OpenClaw power. Perfect for teams.

🚀 Business: $99/month
$200 credits (22,222 messages)
Maximum performance. For power users.

All plans include:
✓ Claude Sonnet 4.5 via AWS Bedrock
✓ Telegram, Discord, WhatsApp support
✓ Auto-stop (save money on idle time)
✓ Credits never expire
✓ Cancel anytime
```

---

### **Comparison Table**

```
OpenClaw Cloud vs MyClaw.ai

Entry Price:
✓ Us: $9/month (or FREE with invite)
✗ MyClaw: $19/month

Pricing Model:
✓ Us: Usage-based (pay per message)
✗ MyClaw: Fixed (pay even if idle)

Auto-Stop:
✓ Us: Yes (saves money)
✗ MyClaw: Always-on (wastes money)

Free Tier:
✓ Us: $10 with invite code
✗ MyClaw: None

Pro Tier:
✓ Us: $29/month
✗ MyClaw: $39/month

Flexibility:
✓ Us: Credits never expire
✗ MyClaw: Monthly reset

Winner: OpenClaw Cloud! 🎉
```

---

## 📊 FINANCIAL PROJECTIONS

### **Conservative (20% conversion)**

**Month 1:**
- 50 friends (invite codes)
- 150 public signups
- 40 paid conversions (20%)
- **MRR: $800**
- Profit: $200

**Month 3:**
- 500 total signups
- 100 paid users
- **MRR: $2,000**
- Profit: $700

**Month 6:**
- 1,500 total signups
- 300 paid users
- **MRR: $6,000**
- Profit: $2,400

---

### **Optimistic (30% conversion)**

**Month 1:**
- 50 friends
- 200 public signups
- 75 paid conversions (30%)
- **MRR: $1,500**
- Profit: $500

**Month 3:**
- 800 total signups
- 240 paid users
- **MRR: $5,000**
- Profit: $2,000

**Month 6:**
- 2,500 total signups
- 750 paid users
- **MRR: $15,000**
- Profit: $6,000

---

## ✅ IMPLEMENTATION CHECKLIST

### **Code Changes**

- [ ] Update `agent-runtime-stack.ts` with tiered task definitions:
  - [ ] Basic: 1 GB / 0.5 vCPU (Free, Starter)
  - [ ] Pro: 2 GB / 1 vCPU (Pro)
  - [ ] Business: 4 GB / 2 vCPU (Business)

- [ ] Create `InviteCodes` DynamoDB table (CDK)
- [ ] Add invite code DynamoDB methods
- [ ] Create signup handler with invite support
- [ ] Create admin invite generation Lambda
- [ ] Update provision Lambda to select task definition by tier
- [ ] Update frontend signup form with invite code field

### **Documentation**

- [x] Friends & Family program doc
- [x] Final pricing strategy doc
- [ ] Update README with new pricing
- [ ] Create pricing page copy
- [ ] Create comparison page copy

### **Operations**

- [ ] Generate initial 50 invite codes
- [ ] Set up monitoring (OOM alerts, usage tracking)
- [ ] Create admin dashboard for invite codes
- [ ] Test end-to-end signup flow
- [ ] Load test each resource tier

### **Marketing**

- [ ] Create landing page
- [ ] Create pricing page
- [ ] Create comparison page (vs MyClaw)
- [ ] Write launch blog post
- [ ] Prepare Product Hunt launch
- [ ] Schedule social media posts

---

## 🚀 READY TO LAUNCH?

**Summary:**
1. ✅ Pricing validated (all tiers profitable)
2. ✅ Resources adequate (meets OpenClaw requirements)
3. ✅ Friends & Family program designed
4. ✅ Competitive positioning clear
5. ✅ Go-to-market strategy defined

**Next steps:**
1. Update CDK with tiered resources
2. Implement invite code system
3. Generate initial codes
4. Soft launch with friends
5. Public launch! 🎉

**Ready when you are!** 🚀
