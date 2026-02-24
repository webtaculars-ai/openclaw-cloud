# WhatsApp QR Code Implementation Plan

## Problem
WhatsApp QR code needs to be accessible to users in the frontend, but currently only appears in container logs.

## Solution Architecture

### Approach: API-Triggered QR Generation + S3 Storage

**Flow:**
1. User provisions agent with WhatsApp enabled
2. Agent starts running (Telegram works immediately)
3. User clicks "Link WhatsApp" in Dashboard
4. Frontend calls: `POST /agents/{agentId}/whatsapp/link`
5. Backend triggers QR generation in container
6. Container generates QR, saves to S3
7. Backend returns S3 URL to frontend
8. Frontend displays QR with auto-refresh
9. User scans, WhatsApp links
10. Status updates to "linked"

---

## Implementation Steps

### Step 1: S3 Bucket for QR Codes
```bash
aws s3 mb s3://openpaw-whatsapp-qr --region ap-south-1
```

**Bucket Policy:**
- Private (no public access)
- Pre-signed URLs for temporary access (5 min expiry)
- Objects expire after 10 minutes (lifecycle policy)

---

### Step 2: Update Container Entrypoint

Add QR generation script:

```bash
#!/bin/bash
# /app/generate-whatsapp-qr.sh

if [ "$WHATSAPP_ENABLED" != "true" ]; then
  echo "WhatsApp not enabled"
  exit 1
fi

# Generate QR code
echo "📱 Generating WhatsApp QR code..."
openclaw channels login --channel whatsapp > /tmp/qr-output.txt 2>&1 &
QR_PID=$!

# Wait for QR to appear (max 30 seconds)
for i in {1..30}; do
  if grep -q "████" /tmp/qr-output.txt; then
    echo "✅ QR code generated"
    
    # Extract QR (ASCII art)
    grep -A 20 "████" /tmp/qr-output.txt > /tmp/qr.txt
    
    # Upload to S3
    aws s3 cp /tmp/qr.txt \
      s3://openpaw-whatsapp-qr/${AGENT_ID}/qr.txt \
      --region ap-south-1 \
      --expires $(date -u -d '+10 minutes' '+%Y-%m-%dT%H:%M:%SZ')
    
    # Create a marker file
    echo "$(date -u +%s)" > /tmp/qr-timestamp.txt
    aws s3 cp /tmp/qr-timestamp.txt \
      s3://openpaw-whatsapp-qr/${AGENT_ID}/timestamp.txt \
      --region ap-south-1
    
    echo "✅ QR uploaded to S3"
    exit 0
  fi
  sleep 1
done

echo "❌ QR generation timeout"
exit 1
```

---

### Step 3: Lambda - Trigger QR Generation

**Endpoint:** `POST /agents/{agentId}/whatsapp/link`

```javascript
const { ECSClient, ExecuteCommandCommand } = require('@aws-sdk/client-ecs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.handler = async (event) => {
  const agentId = event.pathParameters.agentId;
  
  // Get agent from DynamoDB
  const agent = await getAgent(userId, agentId);
  
  if (!agent.whatsappEnabled) {
    return error(400, 'WhatsApp not enabled');
  }
  
  if (agent.status !== 'running') {
    return error(400, 'Agent must be running');
  }
  
  // Execute QR generation script in container
  const command = {
    cluster: 'openclaw-cluster',
    task: agent.taskArn,
    container: 'openclaw-agent',
    command: '/app/generate-whatsapp-qr.sh',
    interactive: false
  };
  
  await ecsClient.send(new ExecuteCommandCommand(command));
  
  // Wait a bit for QR to be generated
  await sleep(5000);
  
  // Check if QR exists in S3
  const qrExists = await checkS3Object(`openpaw-whatsapp-qr/${agentId}/qr.txt`);
  
  if (!qrExists) {
    return error(500, 'QR generation failed');
  }
  
  // Generate pre-signed URL (5 min expiry)
  const qrUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: 'openpaw-whatsapp-qr',
      Key: `${agentId}/qr.txt`
    }),
    { expiresIn: 300 }
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      qrUrl,
      expiresIn: 300,
      instruction: 'Scan this QR code with WhatsApp'
    })
  };
};
```

---

### Step 4: Lambda - Check QR Status

**Endpoint:** `GET /agents/{agentId}/whatsapp/status`

```javascript
exports.handler = async (event) => {
  const agentId = event.pathParameters.agentId;
  
  // Check if QR exists
  const qrExists = await checkS3(`openpaw-whatsapp-qr/${agentId}/qr.txt`);
  
  // Check if WhatsApp is linked (check credentials file in container)
  const linked = await checkWhatsAppLinked(agent.taskArn);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      qrGenerated: qrExists,
      whatsappLinked: linked,
      status: linked ? 'linked' : (qrExists ? 'qr_available' : 'not_started')
    })
  };
};
```

---

### Step 5: Frontend - QR Modal Component

```tsx
// WhatsAppQRModal.tsx
import React, { useState, useEffect } from 'react';

export const WhatsAppQRModal = ({ agentId, onClose, onLinked }) => {
  const [qrUrl, setQrUrl] = useState(null);
  const [status, setStatus] = useState('generating');
  const [countdown, setCountdown] = useState(300); // 5 min
  
  useEffect(() => {
    // Trigger QR generation
    fetch(`/api/agents/${agentId}/whatsapp/link`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setQrUrl(data.qrUrl);
        setStatus('ready');
      })
      .catch(err => setStatus('error'));
    
    // Poll status every 3 seconds
    const statusInterval = setInterval(async () => {
      const res = await fetch(`/api/agents/${agentId}/whatsapp/status`);
      const data = await res.json();
      
      if (data.whatsappLinked) {
        setStatus('linked');
        onLinked();
      }
    }, 3000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(countdownInterval);
    };
  }, [agentId]);
  
  return (
    <Modal>
      {status === 'generating' && <Spinner>Generating QR code...</Spinner>}
      
      {status === 'ready' && (
        <>
          <h2>Scan to Link WhatsApp</h2>
          <img src={qrUrl} alt="WhatsApp QR Code" />
          <p>Expires in: {Math.floor(countdown / 60)}:{countdown % 60}</p>
          <Steps>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices</li>
            <li>Tap "Link a Device"</li>
            <li>Scan this QR code</li>
          </Steps>
        </>
      )}
      
      {status === 'linked' && (
        <Success>
          ✅ WhatsApp Linked Successfully!
          <Button onClick={onClose}>Done</Button>
        </Success>
      )}
      
      {status === 'error' && (
        <Error>
          Failed to generate QR code. Please try again.
          <Button onClick={retry}>Retry</Button>
        </Error>
      )}
    </Modal>
  );
};
```

---

### Step 6: Agent Status Card Updates

```tsx
// AgentStatusCard.tsx additions

{agent.whatsappEnabled && (
  <div className="whatsapp-status">
    {agent.whatsappLinked ? (
      <Badge color="green">✅ WhatsApp Linked</Badge>
    ) : (
      <Button onClick={() => setShowQRModal(true)}>
        Link WhatsApp
      </Button>
    )}
  </div>
)}

{showQRModal && (
  <WhatsAppQRModal
    agentId={agent.agentId}
    onClose={() => setShowQRModal(false)}
    onLinked={() => {
      setShowQRModal(false);
      refreshAgent();
    }}
  />
)}
```

---

## Advantages of This Approach

1. **User-Friendly:**
   - No log digging required
   - QR displayed in UI
   - Clear instructions
   - Auto-detection when linked

2. **Reliable:**
   - QR generated on-demand
   - Stored in S3 (retrievable)
   - Expiry handling
   - Retry mechanism

3. **Scalable:**
   - Works for all users
   - No AWS console access needed
   - Can add QR regeneration
   - Status polling

4. **Secure:**
   - Pre-signed URLs (temporary)
   - Private S3 bucket
   - QR expires after 10 min
   - No public exposure

---

## Implementation Time

**Backend:**
- S3 bucket setup: 15 min
- QR generation script: 30 min
- Lambda - trigger: 45 min
- Lambda - status: 30 min
- ECS Exec permissions: 30 min
**Total: 2.5 hours**

**Frontend:**
- QR Modal component: 1 hour
- Status polling: 30 min
- Agent card integration: 30 min
**Total: 2 hours**

**Testing:**
- End-to-end flow: 30 min
- Error scenarios: 30 min
**Total: 1 hour**

**Grand Total: 5.5 hours**

---

## Alternative: Simpler Approach (3 hours)

If 5.5 hours is too much, we can do a simpler version:

**Simplified Flow:**
1. Agent generates QR on startup (if WhatsApp enabled)
2. QR saved to S3 immediately
3. Dashboard shows "View QR" button
4. Button fetches pre-signed URL
5. Displays QR in modal
6. Manual refresh to check status

**Pros:** Faster (3 hours)
**Cons:** QR might expire, less polish

---

## Recommendation

**Go with full implementation (5.5 hours).**

**Why:**
- Proper UX worth the time
- Sets standard for quality
- Reduces support burden
- Makes WhatsApp actually usable

**Start now?** I can begin with S3 setup and backend Lambdas.
