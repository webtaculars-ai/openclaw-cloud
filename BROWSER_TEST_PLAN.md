# ✅ Story 1.1: Browser Infrastructure - TEST PLAN

**Status:** Ready to test  
**Agent:** Your existing test bot @smarttest1234bot (Task: c7fd4954...)

---

## OPTION 1: Test with Existing Agent (Quickest)

Your test agent is running but on OLD task definition (512 CPU, 1GB RAM).  
Browser might be slow, but should still work.

**Test commands to send to @smarttest1234bot:**

### Test 1: Check Browser Status
**Send:** `Can you open a browser?`  
**Expected:** Agent confirms browser is available (or error if not)

### Test 2: Open Simple Page
**Send:** `Open google.com`  
**Expected:** Agent opens page, confirms success

### Test 3: Take Screenshot
**Send:** `Take a screenshot of the current page`  
**Expected:** Agent returns screenshot image

### Test 4: Navigate and Screenshot
**Send:** `Go to https://example.com and take a screenshot`  
**Expected:** Agent navigates, returns screenshot

---

## OPTION 2: Provision Fresh Agent (Better Resources)

1. **Stop old agent:**
   - Go to dashboard
   - Stop agent 8fb89955-6c31-49a0-84e3-ddd505cfc0ae

2. **Provision new agent:**
   - Same bot token: `8108353665:AAHqBwv8RAZlUG6b-OZv9TFCMny-YBb-w7Y`
   - Will use NEW task definition (1 vCPU, 2GB RAM)
   - Better performance for browser automation

3. **Test same commands**

---

## OPTION 3: I'll Test Via Lambda (If You Give Me Creds)

If you can share:
- Your Cognito ID token (from browser dev tools)
- Or just test yourself and paste results

I can provision via API.

---

## WHAT TO LOOK FOR

### ✅ Success Indicators:
- Agent responds "Opening browser..."
- Agent confirms page loaded
- Agent returns screenshot (actual image)
- No timeout errors

### ❌ Failure Indicators:
- "Browser not available"
- "Chromium not found"
- "Timeout waiting for browser"
- "Cannot open display"

---

## ACCEPTANCE CRITERIA CHECKLIST

- [ ] Send: "Open google.com" → Agent opens page ✅
- [ ] Send: "Take a screenshot" → Agent returns image ✅
- [ ] No errors in response ✅
- [ ] Check CloudWatch logs for errors ✅

---

## YOUR NEXT STEP

**Pick one:**

**A)** Test with existing agent now (just send messages to bot)  
**B)** Stop and reprovision for better performance  
**C)** Wait for me to get API access to provision

**I recommend A** - test immediately with existing agent.

Just send these 3 messages to @smarttest1234bot:
1. "Open google.com"
2. "Take a screenshot"
3. "Go to example.com and take another screenshot"

Then tell me what happens! 🧪
