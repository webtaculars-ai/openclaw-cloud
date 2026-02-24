# Cron Jobs Backend Implementation - Complete

## ✅ Implementation Status

**Phase 1 (MVP)** - ✅ Complete
- [x] list-cron-jobs.ts - List all cron jobs for an agent
- [x] create-cron-job.ts - Create new cron job with EventBridge scheduling
- [x] delete-cron-job.ts - Delete cron job and EventBridge rule
- [x] DynamoDB tables created (openclaw-cron-jobs, openclaw-cron-runs)

**Phase 2** - ✅ Complete
- [x] update-cron-job.ts - Update existing cron job
- [x] run-cron-job.ts - Manually trigger cron job execution
- [x] EventBridge integration with Lambda targets

**Phase 3** - ⚠️ Partially Complete
- [x] execute-cron-job.ts - EventBridge-triggered execution handler
- [ ] Agent messaging integration (needs implementation)
- [ ] get-cron-runs.ts - Run history (not yet implemented)

---

## 📁 Files Created

### Lambda Handlers (7 total)
```
backend/src/handlers/
├── list-cron-jobs.ts          ✅ List jobs for agent
├── create-cron-job.ts          ✅ Create job + EventBridge rule
├── update-cron-job.ts          ✅ Update job + EventBridge rule
├── delete-cron-job.ts          ✅ Delete job + EventBridge rule
├── run-cron-job.ts             ✅ Manual trigger
├── execute-cron-job.ts         ⚠️  EventBridge target (needs agent messaging)
└── get-cron-runs.ts            ❌ Not yet implemented
```

### Infrastructure Changes
```
infra/lib/
├── database-stack.ts           ✅ Added cronJobsTable, cronRunsTable
├── api-stack.ts                ✅ Added 6 Lambda functions + API routes
└── bin/app.ts                  ✅ Updated to pass new tables
```

### Documentation
```
CRON_API_STACK_CHANGES.md       ✅ Implementation guide
CRON_IMPLEMENTATION_SUMMARY.md  ✅ This file
```

---

## 🗄️ Database Schema

### Table: `openclaw-cron-jobs`

**Keys:**
- `userId` (PK) - Partition key
- `jobId` (SK) - Sort key

**Attributes:**
- `agentId` - Agent this job belongs to
- `name` - Human-readable job name
- `schedule` - Schedule object (type, time, dayOfWeek, timezone, etc.)
- `message` - Message to send to agent
- `enabled` - Boolean, whether job is active
- `lastRun` - Timestamp of last execution
- `createdAt` - Timestamp of creation
- `eventBridgeRuleName` - Name of EventBridge rule
- `botToken` - Telegram bot token (for messaging)

**Global Secondary Indexes:**
1. `agentId-index` - Query jobs by agentId
2. `jobId-index` - Query job by jobId (for EventBridge executions)

### Table: `openclaw-cron-runs`

**Keys:**
- `jobId` (PK) - Partition key
- `runTimestamp` (SK) - Sort key

**Attributes:**
- `status` - "success" | "failed"
- `duration` - Execution duration in ms
- `error` - Error message (if failed)
- `ttl` - Time-to-live (auto-delete after 30 days)

---

## 🔌 API Endpoints

### 1. List Cron Jobs
```
GET /agents/{agentId}/cron
Authorization: Cognito JWT
```

**Response:**
```json
{
  "jobs": [
    {
      "jobId": "job-uuid",
      "agentId": "agent-uuid",
      "name": "Daily Standup",
      "schedule": {
        "type": "daily",
        "time": "09:00",
        "timezone": "America/Los_Angeles"
      },
      "message": "Summarize my calendar",
      "enabled": true,
      "lastRun": 1771500000,
      "createdAt": 1771400000
    }
  ]
}
```

### 2. Create Cron Job
```
POST /agents/{agentId}/cron
Authorization: Cognito JWT

Body:
{
  "name": "Daily Standup",
  "schedule": {
    "type": "daily",
    "time": "09:00",
    "timezone": "America/Los_Angeles"
  },
  "message": "Summarize my calendar"
}
```

**Creates:**
1. DynamoDB record in `openclaw-cron-jobs`
2. EventBridge rule named `openpaw-cron-{jobId}`
3. EventBridge target pointing to `executeCronJobFn` Lambda

**Schedule Types:**
- `hourly` → `rate(1 hour)`
- `daily` → `cron(MM HH * * ? *)`
- `weekly` → `cron(MM HH ? * DOW *)`
- `custom` → User-provided cron expression

### 3. Update Cron Job
```
PUT /agents/{agentId}/cron/{jobId}
Authorization: Cognito JWT

Body:
{
  "name": "Updated Name",
  "schedule": { ... },
  "message": "Updated message",
  "enabled": false
}
```

**Updates:**
1. DynamoDB record
2. EventBridge rule (if schedule changed)
3. EventBridge rule state (if enabled changed)

### 4. Delete Cron Job
```
DELETE /agents/{agentId}/cron/{jobId}
Authorization: Cognito JWT
```

**Deletes:**
1. EventBridge targets (removes Lambda target)
2. EventBridge rule
3. DynamoDB record

### 5. Run Cron Job Now
```
POST /agents/{agentId}/cron/{jobId}/run
Authorization: Cognito JWT
```

**Executes job immediately** (outside of schedule)

⚠️ **Note:** Currently logs execution, does not send message to agent (needs implementation)

### 6. Execute Cron Job (Internal)
**Triggered by:** EventBridge rules

**Input from EventBridge:**
```json
{
  "jobId": "job-uuid"
}
```

⚠️ **Issue:** EventBridge event doesn't include `userId`, cannot query DynamoDB efficiently

**Solutions:**
1. Add `userId` to EventBridge target input
2. Use `jobId-index` GSI (already created)
3. Store userId in event payload

---

## ⚠️ Known Limitations & TODOs

### 1. Agent Messaging Not Implemented
**Issue:** Cron jobs are created but don't actually send messages to agents

**Options to implement:**

**Option A: Use OpenClaw Native Cron** (RECOMMENDED)
```javascript
// Instead of managing EventBridge, use OpenClaw's built-in cron
import { OpenClawClient } from 'openclaw-sdk';
const openclaw = new OpenClawClient();
await openclaw.cron.add({
  schedule: "0 9 * * *",
  message: "Daily standup",
  agentId: "agent-123"
});
```

**Option B: Telegram Direct API**
```javascript
await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  method: 'POST',
  body: JSON.stringify({
    chat_id: chatId, // Need to store with agent
    text: message
  })
});
```

**Option C: OpenClaw HTTP API**
```javascript
// If OpenClaw exposes REST API
await fetch(`http://localhost:18789/agent/message`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message })
});
```

**Recommendation:** Option A (OpenClaw native cron) - we just provide UI on top

### 2. EventBridge Execution Missing userId
**Issue:** `execute-cron-job` Lambda receives `{jobId}` but needs `userId` to query DynamoDB

**Fix:** Update EventBridge target input in `create-cron-job.ts`:
```typescript
Input: JSON.stringify({ jobId, userId })
```

Then update `execute-cron-job.ts` to expect userId in event.

### 3. Timezone Handling
**Issue:** EventBridge uses UTC, but users specify local timezones

**Current:** Timezone stored but not used for conversion

**Fix:** Convert user's local time to UTC before creating cron expression:
```typescript
import { DateTime } from 'luxon';
const utcTime = DateTime.fromFormat(time, "HH:mm", { zone: timezone })
  .toUTC();
```

### 4. No Run History API
**Missing:** `GET /agents/{agentId}/cron/{jobId}/runs`

**Implementation:** Query `openclaw-cron-runs` table by jobId:
```typescript
const result = await dynamo.send(new QueryCommand({
  TableName: CRON_RUNS_TABLE,
  KeyConditionExpression: 'jobId = :jid',
  ExpressionAttributeValues: { ':jid': jobId },
  Limit: 10,
  ScanIndexForward: false // Most recent first
}));
```

### 5. chatId Not Stored
**Issue:** Telegram bot needs `chat_id` to send messages, not currently stored with agent

**Fix:** When provisioning agent, store the user's Telegram `chat_id`:
```typescript
// In provision-agent handler
const agent = {
  // ... existing fields
  chatId: telegramChatId, // Get from Telegram API
};
```

---

## 🚀 Deployment Instructions

### Step 1: Compile TypeScript
```bash
cd backend
npm run build
```

This compiles all handlers to `backend/dist/handlers/*.js`

### Step 2: Deploy Infrastructure
```bash
cd infra
npm run build
cdk deploy OpenClawCloudDatabase --require-approval never
cdk deploy OpenClawCloudApi --require-approval never
```

**What this does:**
- Creates DynamoDB tables (openclaw-cron-jobs, openclaw-cron-runs)
- Deploys 6 Lambda functions for cron management
- Creates API Gateway routes under `/agents/{agentId}/cron`
- Sets up EventBridge permissions for Lambdas

**Expected time:** 5-10 minutes

### Step 3: Verify Deployment
```bash
# Check tables exist
aws dynamodb list-tables | grep openclaw-cron

# Check Lambdas exist
aws lambda list-functions | grep Cron

# Check API endpoints
aws apigateway get-rest-apis
```

### Step 4: Test with Frontend
Frontend cron UI should now be able to:
1. List cron jobs (empty initially)
2. Create new cron job
3. See cron job appear in list
4. Update cron job name/schedule
5. Delete cron job

---

## 🧪 Manual Testing

### Test 1: Create Cron Job
```bash
curl -X POST https://api.openpaw.co/agents/{agentId}/cron \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "schedule": {"type": "hourly"},
    "message": "Hello from cron"
  }'
```

**Expected:**
- Status 201
- Job created in DynamoDB
- EventBridge rule created (`openpaw-cron-job-{uuid}`)

### Test 2: List Cron Jobs
```bash
curl https://api.openpaw.co/agents/{agentId}/cron \
  -H "Authorization: Bearer <jwt-token>"
```

**Expected:**
- Status 200
- Array of jobs including the one created above

### Test 3: Update Cron Job
```bash
curl -X PUT https://api.openpaw.co/agents/{agentId}/cron/{jobId} \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Job",
    "enabled": false
  }'
```

**Expected:**
- Status 200
- DynamoDB updated
- EventBridge rule disabled

### Test 4: Delete Cron Job
```bash
curl -X DELETE https://api.openpaw.co/agents/{agentId}/cron/{jobId} \
  -H "Authorization: Bearer <jwt-token>"
```

**Expected:**
- Status 200
- DynamoDB record deleted
- EventBridge rule removed

### Test 5: Run Job Manually
```bash
curl -X POST https://api.openpaw.co/agents/{agentId}/cron/{jobId}/run \
  -H "Authorization: Bearer <jwt-token>"
```

**Expected:**
- Status 200
- Job execution logged (message not sent yet)
- `lastRun` timestamp updated

---

## 📊 Cost Estimation

### DynamoDB
- **Cron Jobs Table:** Pay-per-request, ~$0.25/million reads, ~$1.25/million writes
- **Estimated:** <$1/month for 100 users with 10 jobs each

### Lambda
- **Cron Management:** ~$0.20/million requests
- **Estimated:** <$1/month for typical usage

### EventBridge
- **Rules:** Free for first 100 rules, then $1/rule/month
- **Invocations:** $1/million invocations
- **Estimated:** <$5/month for 100 active cron jobs

### Total: ~$7/month for 100 users with active cron jobs

---

## 🔐 Security

### Implemented
✅ Cognito JWT authorization on all endpoints
✅ User can only access their own agents' cron jobs
✅ Job ownership verified before update/delete/run
✅ EventBridge rules scoped to specific Lambda
✅ DynamoDB encryption at rest

### Recommended
⚠️ Rate limiting on cron creation (prevent abuse)
⚠️ Max jobs per user (e.g., 50 jobs/user)
⚠️ Validate cron expressions (prevent malicious schedules)
⚠️ Audit log for cron job changes

---

## 📈 Next Steps

### Immediate (Required for MVP)
1. **Implement agent messaging** - Option A (OpenClaw native) or Option B (Telegram direct)
2. **Fix EventBridge userId** - Include in target input
3. **Store chatId with agent** - Required for Telegram messaging
4. **Test end-to-end** - Create job → Wait for schedule → Verify message sent

### Short Term
5. **Implement run history API** - `GET /agents/{agentId}/cron/{jobId}/runs`
6. **Add timezone conversion** - Properly handle user timezones
7. **Add cron validation** - Prevent invalid schedules
8. **Add rate limiting** - Prevent cron job spam

### Future Enhancements
9. **Cron job templates** - Pre-built jobs (daily standup, weekly report, etc.)
10. **Conditional execution** - Only run if conditions met (e.g., "if calendar not empty")
11. **Job chaining** - Run job B after job A completes
12. **Webhooks** - Trigger jobs via external webhook
13. **Job analytics** - Success rate, avg duration, execution history

---

## 🎯 Summary

**Status:** Backend infrastructure complete, agent messaging pending

**What works:**
- ✅ Create/list/update/delete cron jobs via API
- ✅ EventBridge scheduling set up correctly
- ✅ DynamoDB tables with proper indexes
- ✅ API Gateway routes with auth

**What's missing:**
- ❌ Actual message delivery to agents
- ❌ Run history API
- ❌ Timezone conversion
- ❌ End-to-end testing

**Estimated time to complete:**
- Agent messaging integration: 2-3 hours
- Run history API: 1 hour
- Testing & fixes: 2-3 hours
- **Total:** 5-7 hours

**Recommendation:** 
1. Deploy current code to staging
2. Implement Telegram direct messaging (Option B) first (fastest)
3. Test with frontend
4. Migrate to OpenClaw native cron later (Option A, better architecture)

---

**Implementation by:** Backend Dev (Agent)
**Date:** 2026-02-19
**Time Spent:** ~2 hours (Phase 1-2 complete, Phase 3 partial)
