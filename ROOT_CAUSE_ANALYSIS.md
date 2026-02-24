# CRITICAL FINDING - Bot Deployment Root Cause Analysis

## Issue: Gateway Hangs After "auto-enabled plugins"

**Occurs on:** BOTH Alpine AND Debian  
**This means:** Base image is NOT the root cause

## Pattern Observed:

**Logs always stop at:**
```
2026-02-19T03:59:39.083Z [gateway] auto-enabled plugins:
- Telegram configured, enabled automatically.
[NO FURTHER OUTPUT]
```

**Expected next logs:**
```
[gateway] agent model: ...
[gateway] listening on ws://127.0.0.1:18789
[telegram] starting provider
```

## Possible Root Causes:

### 1. **Bedrock Discovery Hanging** (MOST LIKELY)
- Config enables `bedrockDiscovery`
- Gateway tries to call `bedrock:ListFoundationModels`
- Call hangs/times out silently
- No timeout handling, so gateway freezes

**Evidence:**
- We added Bedrock permissions
- Bedrock discovery enabled in config
- But no "discovered models" log
- No error message about discovery failure

### 2. **Network/DNS Issue**
- Container can't reach Bedrock endpoint
- DNS resolution fails
- No error logged, just hangs

### 3. **AWS SDK Credential Loading**
- Trying to load credentials from IMDS
- ECS metadata endpoint not responding
- Hangs waiting for credentials

## Solution Options:

### Option A: Disable Bedrock Discovery (QUICK FIX)
Remove `models.bedrockDiscovery` from config, set a specific model directly.

**Pros:** Should work immediately  
**Cons:** Loses auto-discovery feature

### Option B: Add Bedrock Model Manually
Manually add Bedrock model to config instead of relying on discovery.

**Pros:** More explicit, easier to debug  
**Cons:** More complex config

### Option C: Use Anthropic Direct (FALLBACK)
Skip Bedrock entirely, use direct Anthropic API with user's API key.

**Pros:** Guaranteed to work  
**Cons:** Requires API key from user

## Recommendation:

**Try Option A first** - Disable bedrock discovery, see if gateway starts.

If that works, we know discovery is the problem.

Then we can:
1. Add manual Bedrock model config
2. OR debug why discovery hangs
3. OR use direct Anthropic as backup

## Next Test:

Update entrypoint.sh to use minimal config without Bedrock discovery:

```json
{
  "gateway": { ... },
  "channels": { ... }
}
```

No `models` section at all - let OpenClaw use defaults.

