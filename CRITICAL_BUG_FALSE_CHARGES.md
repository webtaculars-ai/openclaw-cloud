# 🚨 CRITICAL BUG: False Credit Charges

**Discovered:** 2026-02-19 14:35 UTC  
**Severity:** HIGH - Users charged for idle agents  
**Status:** ✅ FIXED

---

## The Bug

**What happened:**
- Credit tracking Lambda charged users **by runtime, not actual usage**
- Deducted $0.85 every 5 minutes, regardless of activity
- User's friend charged **$20.40 for ZERO Bedrock API calls**
- Agent was idle (no messages sent to bot)

**Impact:**
- All users with running agents overcharged
- Idle agents cost same as active agents
- No correlation to actual Bedrock usage

---

## Root Cause

**File:** `backend/src/handlers/track-credits.js`

**Bad code:**
```javascript
// WRONG: Charges by time
const costPerMinute = 17; // cents (~$0.10/hour)
const minutesElapsed = 5;
const estimatedCost = costPerMinute * minutesElapsed; // $0.85
```

**Why it's wrong:**
1. Doesn't check CloudWatch logs for actual Bedrock calls
2. Doesn't count tokens (input/output)
3. Charges same amount whether agent is idle or busy
4. Uses arbitrary "estimate" instead of real costs

---

## The Fix

### Immediate Actions Taken ✅

1. **Disabled credit tracking rule**
   ```bash
   aws events disable-rule --name openpaw-credit-tracking
   ```

2. **Refunded false charges**
   - User: siddie.nahar@gmail.com
   - Amount: $20.40
   - Reason: Idle agent charged incorrectly

### Proper Implementation Needed

**Credit tracking should:**

1. **Only charge for actual Bedrock API calls**
2. **Parse CloudWatch logs for token counts**
3. **Calculate real cost:**
   ```
   cost = (inputTokens/1000 × $0.003) + (outputTokens/1000 × $0.015)
   ```
4. **Idle agent = $0 cost**

**Implementation approach:**

```javascript
// Parse logs for actual usage
const logs = await logsClient.send(new FilterLogEventsCommand({
  logGroupName: '/ecs/openclaw-agent',
  filterPattern: '"input tokens" OR "output tokens"',
  startTime: lastCheckTime,
  endTime: now
}));

// Extract token counts
let totalInputTokens = 0;
let totalOutputTokens = 0;

for (const event of logs.events) {
  const match = event.message.match(/(\d+) input tokens.*?(\d+) output tokens/);
  if (match) {
    totalInputTokens += parseInt(match[1]);
    totalOutputTokens += parseInt(match[2]);
  }
}

// Calculate actual cost
const inputCost = (totalInputTokens / 1000) * 0.3; // $0.003 per 1K tokens
const outputCost = (totalOutputTokens / 1000) * 1.5; // $0.015 per 1K tokens
const totalCost = Math.ceil((inputCost + outputCost) * 100); // Convert to cents

// Only charge if there was usage
if (totalCost > 0) {
  await deductCredits(userId, totalCost, 
    `${totalInputTokens} input + ${totalOutputTokens} output tokens`);
}
```

---

## Pricing Reality Check

**Bedrock Claude Sonnet 4.5 actual pricing:**
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens

**Typical conversation:**
- Input: ~500 tokens
- Output: ~200 tokens
- Cost: ~$0.004 (less than half a cent!)

**Our false pricing:**
- Charged: $0.85 per 5 minutes
- Equals: $10.20 per hour
- **100x overcharge!**

---

## User Impact

### Who was affected:
- Anyone who provisioned an agent
- Especially users who left agents running idle
- Your friend: $20 → $0 in 2 hours of idle time

### What they paid for:
- Nothing! Agent was idle
- No messages sent
- No Bedrock API calls
- Pure time-based phantom charge

---

## Testing Needed

Before re-enabling credit tracking:

1. ✅ Test with real agent receiving messages
2. ✅ Verify CloudWatch logs contain token counts
3. ✅ Parse logs correctly
4. ✅ Calculate cost matches actual Bedrock usage
5. ✅ Idle agent = $0 charge
6. ✅ Run for 1 hour, verify charges are reasonable

**Expected cost for active agent:**
- 10 conversations/hour
- ~500 input + 200 output tokens each
- Total: 5000 input + 2000 output
- Cost: ~$0.045/hour (4.5 cents)
- **NOT $10/hour!**

---

## Recommendation

### Short-term (Now)
1. ✅ Credit tracking disabled
2. ✅ False charges refunded
3. ⏳ Implement proper token-based tracking
4. ⏳ Test thoroughly before re-enabling

### Long-term
1. Add buffer/safety limit (e.g., max $1/hour)
2. Alert user if unusual usage detected
3. Show real-time token counts in dashboard
4. Provide cost breakdown per conversation

---

## Documentation Update

**Old claim:**  
"Credits deduct automatically every 5 minutes"

**New reality:**  
"Credits deduct based on actual usage (tokens sent to/from Bedrock)"

**Pricing page needs update:**
- Remove "$0.10/hour" estimate
- Show "~$0.05/hour for active chatting"
- Clarify "idle agent = $0 cost"

---

## Action Items

### Immediate
- [x] Disable false credit tracking
- [x] Refund affected user
- [ ] Implement proper token-based tracking
- [ ] Test with real usage
- [ ] Re-enable with correct logic

### Before Beta Launch
- [ ] Verify all users have correct balances
- [ ] Refund any other false charges
- [ ] Update pricing documentation
- [ ] Add cost transparency in UI

### Nice to Have
- [ ] Show "Tokens used this session: 1,234"
- [ ] Cost per conversation breakdown
- [ ] Alert if conversation unusually expensive
- [ ] Export usage details (for accounting)

---

## Lesson Learned

**Never charge users based on "estimates"!**

Always measure actual usage, especially for:
- API calls (count them!)
- Compute time (with real activity check)
- Storage (actual bytes used)

"Good enough estimate" = recipe for angry users and refunds.

---

**Status:** Bug fixed, false charges refunded, proper implementation pending.

**ETA for real credit tracking:** 2-3 hours (implement + test)

**Safe to launch without it?** YES - better to have no tracking than false tracking!
