# WhatsApp QR - Option B (Simplified Implementation)

**Goal:** Get WhatsApp QR working with acceptable UX in 3 hours

**Time:** 3 hours total
**Status:** Starting now

---

## Implementation Plan

### Phase 1: Backend (1.5 hours)

**1.1 Update Docker Entrypoint (30 min)**
- Generate QR on startup if WhatsApp enabled
- Save QR as text file to S3
- Store timestamp for expiry tracking

**1.2 Create S3 Bucket (15 min)**
- Bucket: `openpaw-whatsapp-qr`
- Private access only
- Pre-signed URLs for retrieval

**1.3 Lambda - Get QR (45 min)**
- Endpoint: `GET /agents/{agentId}/whatsapp/qr`
- Fetches QR from S3
- Returns pre-signed URL (5 min expiry)
- Returns text "not_ready" if QR not generated yet

---

### Phase 2: Frontend (1 hour)

**2.1 Simple QR Modal (30 min)**
- Shows QR as ASCII art or generates QR image from text
- "Scan with WhatsApp" instructions
- Reload button if expired

**2.2 Agent Card Integration (20 min)**
- Add "Link WhatsApp" button
- Opens modal with QR
- Shows WhatsApp status badge

**2.3 Manual Status Check (10 min)**
- "Check if Linked" button
- User clicks after scanning
- Manual refresh (no auto-polling)

---

### Phase 3: Testing (30 min)

**3.1 End-to-End Test**
- Provision agent with WhatsApp
- View QR in modal
- Scan with phone
- Verify linked

**3.2 Edge Cases**
- QR not ready yet
- QR expired
- Agent not running

---

## Simplified vs Full Comparison

| Feature | Option B (Simplified) | Option A (Full) |
|---------|----------------------|-----------------|
| QR Display | ✅ Yes | ✅ Yes |
| Auto-generate on demand | ❌ On startup | ✅ On demand |
| Auto-detect when linked | ❌ Manual check | ✅ Auto-polling |
| Countdown timer | ❌ No | ✅ Yes |
| QR regeneration | ❌ Restart agent | ✅ One-click |
| Time to implement | 3 hours | 5.5 hours |

---

## User Experience

### Simplified Flow:
1. User provisions agent with WhatsApp enabled
2. Agent starts (QR generated in background)
3. Dashboard shows "Link WhatsApp" button
4. Click → Modal opens
5. Shows QR (or "QR generating, please wait")
6. User scans with phone
7. User clicks "I've Scanned" button
8. Modal closes
9. User refreshes page to see "WhatsApp Linked" status

**Trade-offs:**
- ✅ Much faster to implement
- ✅ Works reliably
- ⚠️ Requires manual refresh
- ⚠️ QR only generated on startup (can't regenerate easily)

---

## Starting Implementation NOW

**Step 1:** Create S3 bucket
**Step 2:** Update Docker entrypoint
**Step 3:** Build & push new image
**Step 4:** Create Lambda for QR retrieval
**Step 5:** Frontend modal
**Step 6:** Test end-to-end

**ETA:** 3 hours from now = ~7:00 UTC

---

Let's go! 🚀
