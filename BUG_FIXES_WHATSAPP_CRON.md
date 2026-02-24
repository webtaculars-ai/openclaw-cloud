# Bug Fixes - WhatsApp & Cron

## Issue 1: WhatsApp Not Visible on Dashboard

**Problem:** You said "I can't see WhatsApp on the dashboard"

**Explanation:** WhatsApp is NOT on the Dashboard. It's on the **Agent Setup** page.

**Where to find WhatsApp:**
1. Go to: https://www.openpaw.co/setup (or click "Get Started")
2. You'll see two sections:
   - Telegram Setup (required)
   - **WhatsApp Setup** (optional, below Telegram)
3. Check the "Enable WhatsApp Support" checkbox
4. Instructions will expand showing how to link

**Why it's not on Dashboard:**
- Dashboard shows EXISTING agents
- WhatsApp is enabled during AGENT CREATION
- Once an agent is created with WhatsApp, you'd see it in agent details

**To test:**
1. Visit /setup page
2. Scroll down past Telegram section
3. You'll see "💬 WhatsApp (Optional)" section
4. Toggle it on to see setup instructions

---

## Issue 2: Cron Jobs Error

**Error:** `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`

**Root Cause:** CronJobs page was calling `/api/agents` directly instead of using the API Gateway endpoint.

**What was happening:**
```javascript
// WRONG (was doing this):
fetch('/api/agents', ...)  // This returns the HTML index page (404 → index.html)

// RIGHT (fixed to this):
import('../services/api').listAgents()  // Uses proper API Gateway URL
```

**Fix Applied:**
- Changed CronJobs.tsx to import and use the API service
- Now calls proper API Gateway endpoint
- Added better error handling
- Shows "No agents found" message if no agents exist

**Files Modified:**
- `frontend/src/pages/CronJobs.tsx` (lines 71-84)

---

## Deployment Status

**Changes:**
1. ✅ Fixed cron jobs API call
2. ✅ Added better error messages
3. ✅ Removed duplicate code
4. ⏳ Building now
5. ⏳ Will deploy shortly

**ETA:** 3-5 minutes until live

---

## How to Test After Deployment

### Test Cron Fix:
1. Go to https://www.openpaw.co/cron
2. Should load without errors
3. If no agents: Shows "No agents found" message
4. If has agents: Shows your cron jobs list

### Test WhatsApp:
1. Go to https://www.openpaw.co/setup (NOT dashboard)
2. Scroll to WhatsApp section
3. Enable toggle
4. See setup instructions
5. Create agent with WhatsApp enabled

---

## Why the Confusion

**Dashboard vs Setup:**
- **Dashboard** (/dashboard) = View EXISTING agents
- **Setup** (/setup) = CREATE NEW agents (where WhatsApp toggle is)

**WhatsApp is a creation-time choice:**
- Not a toggle on existing agents
- Chosen when provisioning
- Can't add to existing agent (would need re-provision)

---

**Next:** Building and deploying fix now! 🔧
