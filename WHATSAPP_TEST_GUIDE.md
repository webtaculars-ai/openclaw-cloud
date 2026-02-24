# WhatsApp QR Integration - Complete Test Guide

## ✅ What's Been Implemented

### 1. Complete Backend
- ✅ S3 bucket for QR storage (`openpaw-whatsapp-qr`)
- ✅ Docker generates QR on agent startup
- ✅ Lambda: `openpaw-get-whatsapp-qr` (retrieves QR)
- ✅ Lambda: `openpaw-get-whatsapp-status` (checks if linked) - **NEW**
- ✅ API Gateway routes configured with CORS
- ✅ All CORS issues fixed

### 2. Improved Frontend
- ✅ WhatsAppQRModal with auto-detection
- ✅ 2-minute QR expiry timer
- ✅ Auto-refresh when linked detected
- ✅ Link status badge on agent card
- ✅ Hide button when already linked

### 3. New Features
- ✅ **Auto-link detection** - Polls every 3 seconds
- ✅ **QR expiry timer** - Shows countdown, warns at <30 sec
- ✅ **Linked status** - Green badge when connected
- ✅ **Better error handling** - "Generate New QR" button
- ✅ **Improved UX** - No manual refresh needed

---

## 🧪 Test Plan

### Test 1: Fresh Agent Provisioning with WhatsApp

**Steps:**
1. Go to https://www.openpaw.co
2. Sign in (ag251994@gmail.com)
3. Dashboard → No agents shown
4. Click "Create Agent" or go to Setup
5. Enter agent name: "WhatsApp Test Agent"
6. ✅ Check "Enable WhatsApp Support"
7. Click "Launch Agent"
8. Wait 60-90 seconds for agent to start

**Expected:**
- Agent card appears with status "STARTING"
- After ~60 sec: Status changes to "ONLINE"
- Green "Ready to chat!" message appears
- WhatsApp section shows: "💬 WhatsApp" with "Link WhatsApp" button

---

### Test 2: WhatsApp QR Modal (First Time)

**Steps:**
1. Agent is running and showing WhatsApp section
2. Click green "Link WhatsApp" button
3. Modal opens

**Expected - Loading Phase (15-30 seconds):**
- Shows spinning loader
- Text: "Loading QR code..."
- OR shows: "⏳ QR code is being generated... Retrying automatically (1/6)"

**Expected - QR Ready:**
- QR code appears as ASCII art
- Timer shows: "Time remaining: 2:00" (counting down)
- Instructions: 5-step guide
- Blue banner: "💡 Auto-detection enabled"

---

### Test 3: Scanning QR Code

**Steps:**
1. QR code visible in modal
2. Open WhatsApp on phone
3. Go to: Settings → Linked Devices
4. Tap "Link a Device"
5. Scan the QR code on screen
6. WhatsApp shows "Linking..." then "Linked!"

**Expected in Modal:**
- (Within 3 seconds) Status changes automatically
- Shows: "✅ WhatsApp Linked!" with green checkmark
- Text: "Your WhatsApp is now connected. Closing..."
- Modal auto-closes after 2 seconds

**Expected on Dashboard:**
- Agent card refreshes automatically
- WhatsApp section turns green
- Shows: "💬 WhatsApp ✅"
- Text: "✅ Connected! You can message this agent on WhatsApp"
- "Link WhatsApp" button is HIDDEN

---

### Test 4: QR Expiry Timer

**Steps:**
1. Open WhatsApp QR modal
2. Wait for QR to load
3. **DO NOT SCAN**
4. Watch timer count down

**Expected:**
- Timer starts at 2:00 (2 minutes)
- Counts down every second
- When < 30 seconds: Timer turns red with ⚠️ warning
- At 0:00: Status changes to error
- Shows: "❌ QR code expired"
- Button appears: "Generate New QR Code"

---

### Test 5: QR Regeneration

**Steps:**
1. Let QR expire (wait 2 minutes)
2. Click "Generate New QR Code" button

**Expected:**
- Loading spinner appears
- New QR code generated
- Timer resets to 2:00
- Can scan new QR code

---

### Test 6: WhatsApp Messaging

**Steps:**
1. WhatsApp is linked (green badge visible)
2. Open WhatsApp on phone
3. Find bot in Linked Devices
4. Send message: "Hello from WhatsApp!"

**Expected:**
- Agent receives message
- Agent responds on WhatsApp
- Conversation works normally

---

### Test 7: Already Linked (Hide Button)

**Steps:**
1. Agent is already linked (from Test 3)
2. Refresh browser page
3. Look at agent card

**Expected:**
- WhatsApp section shows with green background
- Text: "💬 WhatsApp ✅"
- Text: "✅ Connected! You can message this agent on WhatsApp"
- **"Link WhatsApp" button is NOT shown**

---

### Test 8: Agent Restart with WhatsApp

**Steps:**
1. Agent is linked to WhatsApp
2. Stop agent (click "Stop Agent" button)
3. Wait 10 seconds
4. Start agent again (click "Start Agent")
5. Wait 60 seconds for agent to come online

**Expected:**
- Agent starts successfully
- Telegram works immediately
- WhatsApp reconnects automatically
- No need to re-scan QR
- Green badge persists: "💬 WhatsApp ✅"

---

### Test 9: CORS Verification

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform any WhatsApp action (open modal, check status)

**Expected:**
- NO CORS errors in console
- All API calls succeed
- No "Access-Control-Allow-Origin" errors

---

### Test 10: Error Handling

**Test 10a: Agent Not Running**
1. Stop agent
2. Try to click "Link WhatsApp" button

**Expected:**
- Button is not shown when agent is stopped
- Only shows when status = "running"

**Test 10b: QR Generation Timeout**
1. Start agent with WhatsApp
2. Open modal immediately (within 5 seconds)

**Expected:**
- Shows: "⏳ QR code is being generated..."
- Auto-retries every 5 seconds
- Eventually QR appears (after 15-30 sec)

---

## 📊 API Endpoints to Verify

### 1. Get WhatsApp QR
```
GET https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{agentId}/whatsapp/qr
Authorization: Bearer {cognito-jwt-token}
```

**Expected Response:**
```json
{
  "status": "qr_available",
  "qrUrl": "https://openpaw-whatsapp-qr.s3.amazonaws.com/...",
  "qrFormat": "text",
  "expiresIn": 300,
  "generatedAt": 1708747200,
  "instructions": [...]
}
```

### 2. Get WhatsApp Status (NEW)
```
GET https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod/agents/{agentId}/whatsapp/status
Authorization: Bearer {cognito-jwt-token}
```

**Expected Response (Not Linked):**
```json
{
  "linked": false,
  "status": "not_linked",
  "message": "WhatsApp not linked yet"
}
```

**Expected Response (Linked):**
```json
{
  "linked": true,
  "status": "linked",
  "message": "WhatsApp is linked and ready",
  "linkedAt": "2026-02-24T04:20:00Z"
}
```

---

## 🐛 Known Issues / Limitations

### Current Limitations:
1. **Link detection is S3-based** - Relies on credentials file presence (not 100% reliable)
2. **No real-time status** - Polls every 3 seconds (slight delay)
3. **QR is ASCII** - Not as pretty as image, but functional

### These are acceptable for MVP. Can improve later.

---

## ✅ Success Criteria

**Must Work:**
- ✅ QR generation within 30 seconds
- ✅ QR displays correctly (scannable)
- ✅ WhatsApp linking works (scan → link)
- ✅ Auto-detection works (closes modal)
- ✅ Linked badge shows after linking
- ✅ Button hides when already linked
- ✅ Messaging works on WhatsApp
- ✅ No CORS errors

**Nice to Have (already implemented):**
- ✅ Timer countdown
- ✅ Auto-retry logic
- ✅ QR regeneration
- ✅ Error handling

---

## 📱 Testing Checklist

Use this checklist while testing:

- [ ] Fresh agent with WhatsApp enabled provisions successfully
- [ ] QR modal opens and loads QR within 30 seconds
- [ ] QR code is scannable with phone
- [ ] Scanning QR links WhatsApp successfully
- [ ] Modal auto-closes after linking
- [ ] Green "✅" badge appears on agent card
- [ ] "Link WhatsApp" button disappears after linking
- [ ] Can send/receive messages on WhatsApp
- [ ] Timer counts down correctly
- [ ] Red warning appears at <30 seconds
- [ ] QR expires at 0:00
- [ ] "Generate New QR" button works
- [ ] No CORS errors in console
- [ ] Agent restart maintains WhatsApp connection

---

## 🚨 If Something Fails

### QR Not Generating:
1. Check ECS task logs: CloudWatch → Log Groups → `/ecs/openclaw-agent`
2. Look for: "📱 Generating WhatsApp QR code"
3. Check for errors in QR generation

### Modal Shows "Loading" Forever:
1. Check S3 bucket: `openpaw-whatsapp-qr/{agentId}/`
2. Verify `qr.txt` file exists
3. Check Lambda logs: CloudWatch → `/aws/lambda/openpaw-get-whatsapp-qr`

### Auto-Detection Not Working:
1. Check Lambda logs: `/aws/lambda/openpaw-get-whatsapp-status`
2. Verify S3 credentials file path
3. Check browser console for polling errors

### CORS Errors:
1. Verify API Gateway has OPTIONS method
2. Check response headers in Network tab
3. Ensure deployment was triggered

---

## 📊 Monitoring After Test

**Check these metrics:**
1. S3 bucket size: Should have 1-2 files per agent
2. Lambda invocations: Should see calls to both Lambdas
3. CloudWatch logs: Check for errors
4. Agent status: Should remain "running" throughout

---

**Ready to test!** Follow the test plan step by step and report any issues.

**Expected Time:** 15-20 minutes for full test suite
