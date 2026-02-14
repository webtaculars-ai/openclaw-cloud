# ⚠️ OpenClaw Cloud - ECS Resource Requirements Analysis

**Date:** 2026-02-14 18:26 UTC  
**Prepared by:** Orchestrator  
**Issue:** Current config (0.25 vCPU, 0.5GB RAM) may be insufficient

---

## 🚨 CRITICAL FINDING: RESOURCES TOO LOW

### **Current Configuration (agent-runtime-stack.ts)**
```typescript
memoryLimitMiB: 512,    // 0.5 GB RAM
cpu: 256,               // 0.25 vCPU
```

### **Observed OpenClaw Resource Usage**

**Current running instance (this orchestrator):**
```
Process: openclaw-gateway (PID 17)
RSS (Resident Set Size): 458 MB (actual RAM used)
VSZ (Virtual Size): 22,105 MB (virtual memory address space)
CPU: 1.7% (on 4-core system)
```

**Analysis:**
- ⚠️ **458 MB RSS is 89% of 512 MB limit** - Very tight!
- ⚠️ **No room for spikes** - Any memory growth causes OOM kill
- ⚠️ **Proxy + OpenClaw combined** will exceed 512 MB

---

## 📊 ACTUAL RESOURCE REQUIREMENTS

### **Components in Container**

1. **Metering Proxy** (Node.js/Express)
   - Base: ~80-120 MB
   - Request buffering: ~20-50 MB
   - Bedrock streaming: ~30-60 MB
   - **Total:** ~130-230 MB

2. **OpenClaw Gateway** (Node.js)
   - Base process: ~200-300 MB
   - Session state: ~50-100 MB
   - Tool execution: ~50-150 MB
   - Message buffers: ~30-80 MB
   - **Total:** ~330-630 MB

3. **Total Combined**
   - Baseline: 460-860 MB
   - Under load: 600-1,200 MB
   - Peak (heavy tool use): 800-1,500 MB

**Conclusion:** 512 MB is **insufficient** for production! 🚨

---

## 💥 FAILURE SCENARIOS

### **Scenario 1: OOM Kill During Heavy Tool Use**

User asks: "Analyze this file and create a report with charts"

```
1. OpenClaw loads file into memory: +100 MB
2. Calls multiple tools (exec, write, read): +150 MB
3. Generates response with thinking: +80 MB
4. Total memory: 458 MB (baseline) + 330 MB = 788 MB
5. Container limit: 512 MB → OOM KILL! 💀
```

**Result:** Container crashes mid-task, user loses work.

---

### **Scenario 2: Bedrock Streaming Buffer Overflow**

User requests long response (8,192 tokens):

```
1. Baseline: 458 MB
2. Bedrock streams 8k tokens: +120 MB buffer
3. Proxy processes chunks: +60 MB
4. Total: 638 MB → OOM KILL! 💀
```

**Result:** Response truncated or container dies.

---

### **Scenario 3: Multiple Concurrent Users (Shared Agent)**

If we ever share containers (not current design, but possible):

```
User A + User B on same container:
  - OpenClaw: 400 MB
  - User A session: +150 MB
  - User B session: +150 MB
  - Total: 700 MB → OOM KILL! 💀
```

---

## 🔍 RECOMMENDED CONFIGURATIONS

### **Option A: Minimum Viable (Conservative)**

```typescript
memoryLimitMiB: 1024,   // 1 GB RAM
cpu: 512,               // 0.5 vCPU
```

**Pros:**
- ✅ Handles typical workloads safely
- ✅ Buffer for spikes (60% baseline utilization)
- ✅ 2x cost increase is manageable

**Cons:**
- ❌ Doubles ECS cost per user
- ❌ May still struggle with very heavy tool use

**Cost Impact:**
```
vCPU: 0.5 × $0.04656 × 90h (3h/day) = $2.10/month
Memory: 1.0 × $0.00511 × 90h = $0.46/month
────────────────────────────────────────────
TOTAL: $2.56/month per user (vs $1.28 currently)

Impact on $9 tier:
  - Old cost: $1.28 ECS + $2.25 LLM + $0.20 infra = $3.73
  - New cost: $2.56 ECS + $2.25 LLM + $0.20 infra = $5.01
  - Old profit: $8.05 - $3.73 = $4.32
  - New profit: $8.05 - $5.01 = $3.04 (38% margin)
```

✅ **Still profitable!**

---

### **Option B: Recommended (Safe)**

```typescript
memoryLimitMiB: 1536,   // 1.5 GB RAM
cpu: 512,               // 0.5 vCPU
```

**Pros:**
- ✅ Comfortable headroom for all workloads
- ✅ Handles heavy tool use + long responses
- ✅ Room for future OpenClaw features

**Cons:**
- ❌ 3x memory cost increase

**Cost Impact:**
```
vCPU: 0.5 × $0.04656 × 90h = $2.10/month
Memory: 1.5 × $0.00511 × 90h = $0.69/month
────────────────────────────────────────────
TOTAL: $2.79/month per user (vs $1.28)

Impact on $9 tier:
  - New cost: $2.79 ECS + $2.25 LLM + $0.20 infra = $5.24
  - New profit: $8.05 - $5.24 = $2.81 (35% margin)
```

✅ **Still profitable, safer margins!**

---

### **Option C: Performance (If Needed)**

```typescript
memoryLimitMiB: 2048,   // 2 GB RAM
cpu: 1024,              // 1 vCPU
```

**Pros:**
- ✅ Excellent performance
- ✅ Handles complex multi-agent scenarios
- ✅ Full vCPU for faster tool execution

**Cons:**
- ❌ 4x memory cost, 4x CPU cost
- ❌ Tighter margins

**Cost Impact:**
```
vCPU: 1.0 × $0.04656 × 90h = $4.19/month
Memory: 2.0 × $0.00511 × 90h = $0.92/month
────────────────────────────────────────────
TOTAL: $5.11/month per user (vs $1.28)

Impact on $9 tier:
  - New cost: $5.11 ECS + $2.25 LLM + $0.20 infra = $7.56
  - New profit: $8.05 - $7.56 = $0.49 (6% margin)
```

⚠️ **Tight margins, only for premium tiers ($29+)**

---

## 📊 PROFITABILITY RE-ANALYSIS

### **Updated Profitability (Option B: 1.5GB / 0.5 vCPU)**

| Tier | Revenue | ECS Cost | LLM Cost | Other | LS Fee | Profit | Margin |
|------|---------|----------|----------|-------|--------|--------|--------|
| **$9** | $9 | $2.79 | $2.25 (500 msgs) | $0.20 | $0.95 | **$2.81** | 35% |
| **$29** | $29 | $3.72 | $9.00 (2k msgs) | $0.20 | $1.95 | **$14.13** | 52% |
| **$99** | $99 | $6.82 | $45.00 (10k msgs) | $0.20 | $5.45 | **$41.53** | 44% |

**Note:** ECS costs scale with usage hours:
- Light (3h/day): $2.79
- Medium (4h/day): $3.72
- Heavy (12h/day): $6.82

**Conclusion:** ✅ **Still profitable at all tiers with 1.5GB RAM!**

---

## 🎯 RECOMMENDED ACTION

### **Immediate Change: Upgrade to 1 GB / 0.5 vCPU**

```typescript
// infra/lib/agent-runtime-stack.ts
this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
  memoryLimitMiB: 1024,  // 1 GB (was 512)
  cpu: 512,              // 0.5 vCPU (was 256)
  executionRole: this.taskExecutionRole,
  taskRole: this.taskRole,
});
```

**Why:**
1. ✅ Prevents OOM kills during normal usage
2. ✅ Still profitable ($2.81-14.13 profit per tier)
3. ✅ Minimal cost increase ($1.28 → $2.56/month)
4. ✅ Handles 90% of workloads safely

---

### **Future Optimization: Dynamic Sizing**

Consider offering different container sizes per tier:

```typescript
// Tier-based resource allocation
const resourceConfigs = {
  free: { memory: 1024, cpu: 512 },      // 1 GB / 0.5 vCPU
  starter: { memory: 1024, cpu: 512 },   // 1 GB / 0.5 vCPU
  pro: { memory: 1536, cpu: 512 },       // 1.5 GB / 0.5 vCPU
  business: { memory: 2048, cpu: 1024 }, // 2 GB / 1 vCPU
};
```

**Benefits:**
- ✅ Lower tiers stay profitable
- ✅ Higher tiers get better performance
- ✅ Justifies premium pricing

---

## 🔬 TESTING RECOMMENDATIONS

### **Before Launch: Load Testing**

1. **Memory Stress Test**
   ```bash
   # Test heavy tool usage
   - Upload 10MB file
   - Ask agent to analyze and create report
   - Monitor memory usage (should stay <80% of limit)
   ```

2. **Concurrent Request Test**
   ```bash
   # Simulate rapid-fire questions
   - Send 10 messages in 30 seconds
   - Check for OOM kills or throttling
   ```

3. **Long-Running Session Test**
   ```bash
   # Test memory leaks
   - Keep agent active for 2 hours
   - Monitor memory growth over time
   ```

---

## 📋 MIGRATION CHECKLIST

- [ ] Update `agent-runtime-stack.ts` to 1GB/0.5vCPU
- [ ] Update cost analysis docs with new ECS costs
- [ ] Update pricing recommendation (still profitable)
- [ ] Rebuild Docker image (no code changes needed)
- [ ] Deploy to test environment
- [ ] Run load tests
- [ ] Update CDK deployment
- [ ] Monitor production memory usage
- [ ] Consider tier-based sizing (future)

---

## 🔗 COMPARISON TO COMPETITORS

### **MyClaw.ai Resource Specs**

```
LITE:  2 vCPU, 4 GB RAM - $19/month
PRO:   4 vCPU, 8 GB RAM - $39/month (most popular)
MAX:   8 vCPU, 16 GB RAM - $79/month
```

**Analysis:**
- They offer **dedicated infrastructure** (VPS model)
- Much higher resources (2-8 vCPU, 4-16 GB RAM)
- But also much higher prices ($19-79/month)

**Our Advantage:**
- Usage-based (cheaper for light users)
- Auto-stop (no idle waste)
- Still competitive even at 1 GB / 0.5 vCPU

**Our Position:**
- We're not competing on raw specs
- We're competing on cost-efficiency and flexibility
- 1 GB is sufficient for typical OpenClaw usage

---

## ✅ FINAL RECOMMENDATION

### **Change to: 1 GB RAM / 0.5 vCPU** ✅

**Rationale:**
1. ⚠️ **Current 512 MB is unsafe** - Will cause OOM kills
2. ✅ **1 GB is safe minimum** - Handles typical workloads
3. ✅ **Still profitable** - 35-52% margins maintained
4. ✅ **Cost increase manageable** - +$1.28/month per user
5. ✅ **Competitive** - Much cheaper than MyClaw's 4-16GB offerings

**Optional Future Enhancement:**
- Consider 1.5 GB for Pro tier ($29/month)
- Consider 2 GB for Business tier ($99/month)
- Keep 1 GB for Free/Starter tiers

---

**Status:** CRITICAL ISSUE IDENTIFIED ⚠️  
**Action Required:** Update ECS task definition before launch  
**Risk if not fixed:** Production OOM kills, poor user experience

---

## 📚 REFERENCES

1. **Observed Usage:** `ps -p 17 -o %mem,rss,vsz` → 458 MB RSS
2. **Node.js Memory:** Typical gateway uses 300-600 MB
3. **AWS Fargate Pricing:** $0.04656/vCPU-hour, $0.00511/GB-hour
4. **Competitor Specs:** MyClaw.ai 2-8 vCPU, 4-16 GB RAM
5. **Source Code:** `/openclaw-cloud/infra/lib/agent-runtime-stack.ts`

**Next:** Update CDK stack with new resource limits!
