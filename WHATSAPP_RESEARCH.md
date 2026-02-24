# 🔍 WHATSAPP IMPLEMENTATION RESEARCH

**Date:** 2026-02-20  
**Status:** Research Complete  

---

## 📋 KEY FINDINGS

### WhatsApp Setup Method
OpenClaw uses **WhatsApp Web (Baileys)** - QR code login, NOT Business API

**This is MUCH simpler than expected!**

### Setup Process
1. User runs: `openclaw channels login --channel whatsapp`
2. OpenClaw shows QR code
3. User scans with WhatsApp mobile app
4. Session linked & stored in `~/.openclaw/credentials/whatsapp/`

**No API keys, no phone numbers, no Meta Business setup needed!**

---

## 🎯 SIMPLIFIED IMPLEMENTATION

### What We Need (Much Simpler!)

**Option 1: QR Code Flow (Recommended)**
- User clicks "Setup WhatsApp" in frontend
- Frontend calls API to start QR session
- Display QR code in browser
- User scans with phone
- Session stored, agent connects

**Option 2: Pre-Linked Session (Advanced)**
- User runs `openclaw channels login` locally
- Uploads credentials file to OpenPaw
- We mount credentials in ECS container

---

## 🔧 IMPLEMENTATION APPROACH

### Phase 1: QR Code Flow (Easiest)

**Frontend Changes:**
1. Add "Setup WhatsApp" button in AgentSetup
2. New component: `WhatsAppQRSetup.tsx`
   - Calls backend to generate QR
   - Displays QR code
   - Polls for connection status
   - Shows success when linked

**Backend Changes:**
1. New Lambda: `generate-whatsapp-qr`
   - Starts temp OpenClaw session
   - Returns QR code (base64 image)
   - Stores credentials when linked
   
2. Update `provision-agent` Lambda
   - Check if WhatsApp credentials exist
   - Mount credentials volume in ECS
   - Enable WhatsApp in config

**Docker Changes:**
1. Update entrypoint.sh
   - Mount credentials from S3/EFS
   - Enable WhatsApp channel in config
   - Multi-channel support (Telegram + WhatsApp)

---

## 📦 CONFIGURATION

### OpenClaw Config for WhatsApp

```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "open",
      "sendReadReceipts": true,
      "textChunkLimit": 4000,
      "chunkMode": "newline"
    }
  }
}
```

### Multi-Channel Config (Telegram + WhatsApp)

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "$TELEGRAM_BOT_TOKEN"
    },
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "open"
    }
  }
}
```

---

## 🚀 TECHNICAL ARCHITECTURE

### Credentials Storage

**Option A: S3 (Simple)**
```
s3://openclaw-credentials/{userId}/{agentId}/whatsapp/creds.json
```

**Option B: EFS (Better for multi-agent)**
```
/mnt/efs/credentials/{userId}/{agentId}/whatsapp/creds.json
```

**Recommendation:** Use S3, mount to ECS volume on startup

### ECS Task Definition Changes

```json
{
  "containerDefinitions": [{
    "environment": [
      {"name": "WHATSAPP_ENABLED", "value": "true"}
    ],
    "mountPoints": [{
      "sourceVolume": "whatsapp-creds",
      "containerPath": "/home/node/.openclaw/credentials/whatsapp"
    }]
  }],
  "volumes": [{
    "name": "whatsapp-creds",
    "host": {
      "sourcePath": "/tmp/whatsapp-creds"
    }
  }]
}
```

---

## 🔄 USER FLOW

### Setup Flow (QR Code Method)

1. **User visits agent setup**
   - Sees "Add WhatsApp" option
   - Clicks "Connect WhatsApp"

2. **Frontend requests QR**
   - POST /agents/{agentId}/whatsapp/qr
   - Backend starts temp OpenClaw session
   - Returns QR code image

3. **User scans QR**
   - Opens WhatsApp on phone
   - Scans QR code
   - WhatsApp links

4. **Backend detects connection**
   - Credentials saved to S3
   - Agent provisioned with WhatsApp
   - Frontend shows success

5. **Agent ready**
   - User can message on WhatsApp
   - Agent responds on WhatsApp

---

## ⚡ QUICK WIN: SIMPLIFIED APPROACH

**Instead of QR in browser, we can:**

1. Provision agent with WhatsApp enabled (empty creds)
2. User runs one-time setup command
3. Agent logs QR code to CloudWatch
4. User scans QR from logs
5. Session persists

**This avoids building QR infrastructure!**

### Modified Flow

**Frontend:**
- Toggle: "Enable WhatsApp" ✓
- Show instructions: "After provisioning, run this command to link..."

**Backend:**
- Provision agent with WhatsApp enabled
- On first start, OpenClaw shows QR in logs
- User scans QR
- Session saved, agent works

**Setup Script for User:**
```bash
# Get agent logs
aws ecs describe-tasks --cluster openclaw-cluster --tasks {taskArn}

# OR: We provide a custom endpoint
curl https://api.openpaw.co/agents/{id}/whatsapp/qr
# Returns: "Scan this QR code: [ascii art or link to image]"
```

---

## 🎯 RECOMMENDED IMPLEMENTATION

### Phase 1: Basic WhatsApp Support (4 hours)

**Story 1: Enable WhatsApp in Docker**
- Update entrypoint.sh to enable WhatsApp
- Add config for WhatsApp channel
- Test locally

**Story 2: Agent Provisioning**
- Add `whatsappEnabled` flag to DynamoDB
- Update provision Lambda
- Enable WhatsApp in ECS config

**Story 3: QR Code Helper**
- Create Lambda that fetches CloudWatch logs
- Extract QR code from logs
- Return to frontend

**Story 4: Frontend Toggle**
- Add "Enable WhatsApp" checkbox
- Show setup instructions
- Link to QR helper

---

### Phase 2: Advanced QR Flow (Optional, +6 hours)

**If we want browser-based QR:**
- Lambda that starts temp OpenClaw session
- WebSocket for real-time QR updates
- Frontend displays QR in modal
- Polls for connection status

---

## 📊 EFFORT COMPARISON

**Simplified Approach (Recommended):**
- 4 hours total
- No WebSocket infrastructure
- Users run one command to link
- Still fully functional

**Full QR in Browser:**
- 10 hours total
- WebSocket or long-polling
- Better UX, more complex
- Slight edge in polish

---

## ✅ DECISION

**Let's start with Simplified Approach:**

1. ✅ Enable WhatsApp in Docker config
2. ✅ Add toggle in agent setup
3. ✅ Provision agents with WhatsApp enabled
4. ✅ Show instructions for QR linking
5. ✅ Helper endpoint to show QR from logs

**Benefits:**
- Fast implementation (4 hours)
- Works immediately
- Can upgrade to browser QR later
- Users don't mind one setup step

---

## 🚀 STARTING IMPLEMENTATION

**Story 3.1: Enable WhatsApp in Docker** (1 hour)  
**Status:** Starting now...

Let's build this! 🏗️
