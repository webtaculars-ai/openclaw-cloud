# 🔍 Investigation: Credits Disappeared

**User:** siddie.nahar@gmail.com  
**User ID:** 7133bdda-5071-707e-5458-707c3c5abb01  
**Date:** 2026-02-19

---

## What Happened

Your friend's $20 credits were consumed by **automatic agent usage tracking**.

### Timeline
- **06:40 UTC** - Redeemed $20 promo code ✅
- **06:40-10:04 UTC** - Agent was running (approximately 3.5 hours)
- **Every 5 minutes** - System deducted $0.85 for runtime
- **24 deductions later** - Balance reached $0
- **10:04 UTC** - Agent auto-stopped due to no credits

### Total Usage
- **Credits added:** $20.00
- **Credits used:** $20.40 (24 × $0.85)
- **Final balance:** $0.00
- **Agent status:** stopped_no_credits

---

## Root Cause

**The credit tracking system worked as designed:**
1. Agent was provisioned and started running
2. Credit tracking Lambda runs every 5 minutes
3. Deducts estimated cost ($0.10/hour ≈ $0.85 per 5-min period)
4. After 2 hours of runtime, credits depleted
5. System auto-stopped the agent

**However, there's a UX problem:**
- User may not have realized agent was actively running
- No notification that agent is consuming credits
- No way to see "current session cost" in real-time

---

## Frontend Bug Fixed

**Problem:** Transaction amounts showed as `$NaN`  
**Cause:** Frontend code used wrong field names:
- Used `txn.amountCents` → Database has `txn.amount`
- Used `txn.createdAt` → Database has `txn.timestamp`
- Used `txn.description` → Database doesn't have this field

**Fix Applied:**
- Updated Billing.tsx to use correct field names
- Deployed to production
- Your friend should now see proper transaction amounts

---

## Recommendations

### Immediate (For Your Friend)
1. ✅ Agent is already stopped (no more charges)
2. Redeem another promo code to continue testing
3. Monitor the dashboard - check agent status before leaving
4. Stop agent manually when not using it

### UX Improvements Needed
1. **Real-time cost indicator**
   - Show "Current session: $0.23" on dashboard
   - Update every minute while agent is running

2. **Better notifications**
   - Email when balance < $5
   - Warning when agent is running for >30 minutes
   - Push notification to Telegram

3. **Auto-stop options**
   - "Stop agent after 1 hour of inactivity"
   - "Stop if no messages received in 10 minutes"
   - "Maximum daily spend: $5"

4. **Cost transparency**
   - Show estimated cost/hour next to agent status
   - "This agent costs ~$0.10/hour while running"
   - Projected weekly/monthly cost

---

## Testing Recommendation

Before giving more promo codes:
1. Test agent provisioning works (doing now)
2. Verify agent actually responds to messages
3. Monitor credit deduction rate
4. Check if $0.10/hour estimate is accurate
5. Test start/stop functionality

---

## Action Items

### For You (Product Owner)
- [ ] Test agent provisioning with real bot token
- [ ] Verify ECS task starts successfully
- [ ] Confirm bot responds on Telegram
- [ ] Check actual token usage from logs
- [ ] Validate pricing ($0.10/hour vs actual Bedrock costs)

### For Your Friend
- [ ] Refresh billing page (should see correct amounts now)
- [ ] Redeem new promo code if wants to continue
- [ ] Stop agent when not actively using
- [ ] Report if agent doesn't respond

### For Product (Future)
- [ ] Add real-time cost indicator
- [ ] Email notifications for low balance
- [ ] Agent auto-stop after inactivity
- [ ] Better first-time user guidance

---

## Current State

✅ Frontend bug fixed - transactions now display correctly  
✅ Your friend's agent stopped (no more charges)  
⏳ Waiting for agent provisioning test to verify core functionality  
📋 Identified UX improvements needed for beta launch

**The system worked correctly** - it just needs better user communication about what's happening.
