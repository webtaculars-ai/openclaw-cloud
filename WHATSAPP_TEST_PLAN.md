# WhatsApp Integration - Complete Test Plan

**Status:** Ready for End-to-End Testing  
**Date:** 2026-02-24  
**Tester:** Abhishek Gupta (ag251994@gmail.com)

---

## ✅ What's Been Implemented

### Backend:
1. ✅ S3 bucket for QR storage (`openpaw-whatsapp-qr`)
2. ✅ Docker generates QR on startup (entrypoint.sh)
3. ✅ Lambda: `openpaw-get-whatsapp-qr` (retrieves QR)
4. ✅ Lambda: `openpaw-get-whatsapp-status` (checks link status) **NEW**
5. ✅ API Gateway routes configured and deployed
6. ✅ CORS fixed for all endpoints

### Frontend:
1. ✅ Enhanced WhatsApp QR Modal with:
   - Auto-detection of link status (polls every 5 sec)
   - QR expiry timer (2 minutes)
   - "Generate New QR" button when expired
   - Real-time link detection
   - Success animation when linked
2. ✅ WhatsApp status badge on agent card
3. ✅ Dashboard auto-checks WhatsApp status
4. ✅ "Link WhatsApp" button (only when not linked)

---

## 🧪 Test Scenarios

### Test 1: Fresh Agent Provisioning with WhatsApp

**Steps:**
1. Log into https://www.openpaw.co
2. Go to Agent Setup page
3. Enter Telegram bot token (use test bot: @smarttest1234bot)
4. Check "Enable WhatsApp Support" ☑️
5. Optionally enter agent name: "WhatsApp Test Agent"
6. Click "Launch Agent"

**Expected:**
- Agent status shows "STARTING"
- After ~60 seconds: Agent shows "ONLINE"
- Telegram works immediately (can message bot)
- WhatsApp section appears with "Link WhatsApp" button

**Actual:** [FILL AFTER TEST]

---

### Test 2: WhatsApp QR Generation

**Steps:**
1. On Dashboard, with agent running
2. Click "Link WhatsApp" button in WhatsApp section
3. Modal opens

**Expected:**
- Modal shows "Loading QR code..." briefly
- May show "QR code is being generated..." for 10-30 seconds
- Auto-retries every 5 seconds (shows retry count)
- After 15-30 seconds: ASCII QR code appears
- Timer shows "Expires in 2:00" and counts down

**Actual:** [FILL AFTER TEST]

---

### Test 3: WhatsApp QR Scanning

**Steps:**
1. With QR code visible in modal
2. Open WhatsApp on phone
3. Go to Settings → Linked Devices
4. Tap "Link a Device"
5. Scan QR code from computer screen

**Expected:**
- Phone vibrates/confirms link
- WhatsApp shows "OpenPaw Agent" as linked device
- Modal shows "Checking if WhatsApp is linked..." message
- Within 5-10 seconds: Modal shows "✅ WhatsApp Linked!" success screen
- Modal auto-closes after 2 seconds
- Agent card updates to show "✅ Connected! You can message this agent on WhatsApp"

**Actual:** [FILL AFTER TEST]

---

### Test 4: Messaging on WhatsApp

**Steps:**
1. After linking, open WhatsApp on phone
2. Search for your phone number in contacts
3. Send message to yourself (this goes to linked device)
4. Send: "Hello agent!"

**Expected:**
- Agent responds on WhatsApp
- Conversation works like Telegram

**Actual:** [FILL AFTER TEST]

---

### Test 5: QR Expiry Handling

**Steps:**
1. Open "Link WhatsApp" modal
2. Wait for QR to appear
3. Do NOT scan immediately
4. Watch timer count down from 2:00
5. When timer reaches 0:00

**Expected:**
- Timer turns red when reaching 0:00
- QR code area replaced with "⏰ This QR code has expired"
- "Generate New QR" button appears
- Click button → New QR generated
- Timer resets to 2:00

**Actual:** [FILL AFTER TEST]

---

### Test 6: Already Linked Status

**Steps:**
1. After successfully linking WhatsApp (Test 3)
2. Refresh dashboard page
3. Look at agent card

**Expected:**
- WhatsApp section shows "✅ WhatsApp ✅"
- Text says "✅ Connected! You can message this agent on WhatsApp"
- "Link WhatsApp" button is HIDDEN (or replaced with "✅ Linked")
- Green background indicating success

**Actual:** [FILL AFTER TEST]

---

### Test 7: Error Handling - Agent Not Running

**Steps:**
1. Stop agent
2. Try to click "Link WhatsApp" button

**Expected:**
- Button should not be visible when agent is stopped
- WhatsApp section only shows when agent status is "running"

**Actual:** [FILL AFTER TEST]

---

### Test 8: Multiple Page Refreshes

**Steps:**
1. Link WhatsApp successfully
2. Refresh dashboard 3-4 times
3. Check WhatsApp status persists

**Expected:**
- WhatsApp "✅ Connected" status persists across refreshes
- No need to re-scan QR code
- Status check happens automatically on load

**Actual:** [FILL AFTER TEST]

---

## 🔍 API Endpoints to Verify

### 1. Get WhatsApp QR:
```
GET https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{agentId}/whatsapp/qr
```

**Test in browser DevTools (Network tab):**
- Should return 200 status
- Response should include `qrUrl` and `status: "qr_available"`
- Pre-signed URL should be accessible

### 2. Get WhatsApp Status:
```
GET https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{agentId}/whatsapp/status
```

**Test in browser DevTools:**
- Before linking: `{ linked: false, status: "not_linked" }`
- After linking: `{ linked: true, status: "linked" }`

---

## 🐛 Known Issues / Limitations

### Acceptable (MVP):
1. **Credentials Detection:** Currently checks S3 for credentials file (may not exist yet)
   - Future: Check actual OpenClaw credentials directory in container
2. **Manual Docker Restart:** If QR expires and agent is running, must restart agent
   - Future: Add "Regenerate QR" that works without restart
3. **Link Time Delay:** May take 5-10 seconds to detect link (polling interval)
   - Acceptable for MVP

### Should Work:
1. ✅ QR generation in background (non-blocking)
2. ✅ Auto-retry if QR not ready
3. ✅ Expiry timer with regeneration
4. ✅ Auto-detection of link status
5. ✅ Persistent link status across page loads

---

## 📊 Success Criteria

**Minimum Success (MVP):**
- [ ] Agent provisions with WhatsApp enabled
- [ ] QR code appears within 30 seconds
- [ ] User can scan QR and link WhatsApp
- [ ] Agent responds to WhatsApp messages
- [ ] Status persists across refreshes

**Full Success (Polished):**
- [ ] All of above +
- [ ] Auto-detection works (no manual refresh)
- [ ] Timer and expiry handling works
- [ ] "✅ Linked" badge shows after linking
- [ ] Smooth UX with loading states

---

## 🚨 What to Check If Something Fails

### QR Not Appearing:
1. Check CloudWatch logs for Docker container
2. Look for "📱 Generating WhatsApp QR" message
3. Check S3 bucket for `{agentId}/qr.txt` file
4. Try waiting 60 seconds and clicking "Try Again"

### Link Not Detected:
1. Open browser DevTools → Network tab
2. Check if `/whatsapp/status` endpoint is being called
3. Look at response - does it show `linked: true`?
4. Check S3 for credentials file (may not exist if detection fails)

### WhatsApp Messages Not Working:
1. Check agent is still running (ECS task)
2. Check CloudWatch logs for agent
3. Look for WhatsApp channel errors
4. Verify credentials were saved properly

---

## 📝 Test Results Form

**Tester:** _________________________  
**Date:** _________________________  
**Time Started:** _________________________  
**Time Completed:** _________________________  

**Test 1 (Provisioning):** ☐ Pass ☐ Fail  
**Test 2 (QR Generation):** ☐ Pass ☐ Fail  
**Test 3 (QR Scanning):** ☐ Pass ☐ Fail  
**Test 4 (Messaging):** ☐ Pass ☐ Fail  
**Test 5 (Expiry):** ☐ Pass ☐ Fail  
**Test 6 (Status):** ☐ Pass ☐ Fail  
**Test 7 (Error Handling):** ☐ Pass ☐ Fail  
**Test 8 (Persistence):** ☐ Pass ☐ Fail  

**Overall Result:** ☐ PASS ☐ NEEDS FIXES  

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## 🎯 Next Steps After Testing

### If All Tests Pass:
1. ✅ Mark WhatsApp integration as COMPLETE
2. 🎉 Celebrate - multi-channel working!
3. 📝 Update documentation
4. 🚀 Move to LemonSqueezy / Launch prep

### If Some Tests Fail:
1. 🐛 Document exact failures
2. 🔍 Check logs and debug
3. 🔧 Fix issues
4. 🔄 Re-test

---

**Ready to test! Follow the steps above and fill in the "Actual" sections.** 🚀
