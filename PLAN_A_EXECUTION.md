# 🚀 PLAN A EXECUTION: Browser + Cron + Discord

**Decision Made:** 2026-02-19 15:20 UTC  
**Timeline:** 1 week to beta launch

---

## WEEK 1 ROADMAP

### Days 1-2: Browser Automation (HIGH PRIORITY)
**Owner:** Backend + DevOps  
**Status:** 🟡 STARTING NOW

**Tasks:**
1. ✅ Check if Docker image has Chrome/Chromium
2. ⏳ Update Dockerfile to install Chromium (Debian slim)
3. ⏳ Enable browser config in entrypoint.sh
4. ⏳ Increase ECS task resources (1 vCPU, 2GB RAM)
5. ⏳ Deploy new image to ECR
6. ⏳ Test browser: open page, screenshot
7. ⏳ Create 3 demo examples

**Demo Examples:**
- Flight search (open Google Flights, fill form, screenshot)
- Package tracking (open Amazon, check status)
- Form filling (auto-fill contact form)

---

### Day 3: Cron Jobs Polish
**Owner:** Frontend + Backend  
**Status:** 🔴 NOT STARTED

**Tasks:**
1. ⏳ Create CronJobs.tsx page
2. ⏳ Build task list + schedule picker UI
3. ⏳ Add example templates (daily standup, alerts, reports)
4. ⏳ Create backend Lambda for cron management
5. ⏳ Test task creation + execution
6. ⏳ Add to navigation menu

**API Endpoints:**
- GET /agents/{id}/cron
- POST /agents/{id}/cron
- PUT /agents/{id}/cron/{taskId}
- DELETE /agents/{id}/cron/{taskId}
- POST /agents/{id}/cron/{taskId}/run

---

### Days 4-5: Discord Support
**Owner:** Backend + DevOps  
**Status:** 🔴 NOT STARTED

**Tasks:**
1. ⏳ Research OpenClaw Discord plugin config
2. ⏳ Update entrypoint.sh to support Discord bot token
3. ⏳ Add Discord token field to agent provisioning
4. ⏳ Update DynamoDB schema (add discordToken)
5. ⏳ Test Discord bot provisioning
6. ⏳ Verify cross-channel context works
7. ⏳ Update homepage: "Works on Telegram + Discord"

---

## WEEK 2 ROADMAP

### Days 1-2: Homepage Redesign
**Owner:** Copywriter + Frontend  
**Status:** 🔴 NOT STARTED

**New Positioning:**
- Headline: "Your Personal AI Infrastructure 🐾"
- Subheadline: "Privacy-first, multi-channel, fully managed OpenClaw"
- Hero: Show browser automation in action
- Comparison table: vs ChatGPT
- Use cases: Real automation examples

**Sections:**
1. Hero (new messaging)
2. Browser automation demos (videos/GIFs)
3. Cron job examples
4. Multi-channel showcase
5. Comparison table
6. Pricing (updated)
7. CTA

---

### Days 3-4: Beta Testing
**Owner:** QA + Product Manager  
**Status:** 🔴 NOT STARTED

**Tasks:**
1. ⏳ Recruit 30 beta users
2. ⏳ Send promo codes ($20 each)
3. ⏳ Guide users through setup
4. ⏳ Collect feedback on automation
5. ⏳ Monitor usage patterns
6. ⏳ Fix critical bugs

**Success Metrics:**
- 30 users onboarded
- At least 10 use browser automation
- At least 15 schedule cron jobs
- NPS feedback collected

---

### Day 5: Soft Launch
**Owner:** All  
**Status:** 🔴 NOT STARTED

**Tasks:**
1. ⏳ Announce to waitlist
2. ⏳ Product Hunt prep (assets ready)
3. ⏳ Start onboarding flow
4. ⏳ Monitor for issues
5. ⏳ Respond to feedback

---

## IMMEDIATE NEXT STEPS (RIGHT NOW)

### 1. Browser Automation Setup (PRIORITY 1)

**Check Chromium in Docker:**
```bash
cd /home/node/.openclaw/workspace-orchestrator/openclaw-cloud/docker
cat Dockerfile | grep -i chrome
```

**Update Dockerfile if needed:**
```dockerfile
FROM node:22-slim

# Install Chromium for browser automation
RUN apt-get update && \
    apt-get install -y chromium chromium-sandbox && \
    rm -rf /var/lib/apt/lists/*

# Rest of existing Dockerfile...
```

**Update entrypoint.sh config:**
```json
{
  "browser": {
    "enabled": true,
    "headless": true,
    "defaultProfile": "openclaw",
    "noSandbox": true,
    "executablePath": "/usr/bin/chromium"
  }
}
```

**Update ECS task definition:**
- CPU: 1024 (1 vCPU) - up from 512
- Memory: 2048 (2GB) - up from 1024

---

### 2. Create Implementation Tracker

**File:** `/openclaw-cloud/implementation-tracker.json`
```json
{
  "week1": {
    "browser": {
      "status": "in_progress",
      "tasks": [
        {"id": "check-chromium", "status": "pending"},
        {"id": "update-dockerfile", "status": "pending"},
        {"id": "enable-config", "status": "pending"},
        {"id": "increase-resources", "status": "pending"},
        {"id": "deploy-image", "status": "pending"},
        {"id": "test-browser", "status": "pending"},
        {"id": "create-demos", "status": "pending"}
      ]
    },
    "cron": {"status": "not_started"},
    "discord": {"status": "not_started"}
  },
  "week2": {
    "homepage": {"status": "not_started"},
    "beta": {"status": "not_started"},
    "launch": {"status": "not_started"}
  }
}
```

---

## DELEGATION STRATEGY

Since agents timed out, doing direct implementation:

**Phase 1 (Now):** Browser automation
- I'll update Dockerfile
- I'll update entrypoint.sh
- I'll update ECS stack
- I'll deploy and test

**Phase 2 (After browser works):** Cron UI
- Frontend page creation
- Backend Lambda for cron management
- Testing

**Phase 3 (After cron works):** Discord
- Config updates
- Testing cross-channel

---

## SUCCESS CRITERIA

**By End of Week 1:**
- [ ] Browser automation working (can screenshot a webpage)
- [ ] Cron jobs visible in UI (can schedule daily task)
- [ ] Discord bot can be provisioned (same flow as Telegram)

**By End of Week 2:**
- [ ] Homepage shows browser demos
- [ ] 30 beta users testing
- [ ] Positive feedback on automation
- [ ] Ready for Product Hunt

---

## RISKS & MITIGATION

**Risk 1:** Browser automation too slow in ECS
- **Mitigation:** Use headless mode, optimize page load

**Risk 2:** Chromium too heavy for 2GB RAM
- **Mitigation:** Can increase to 4GB if needed (cost: +$0.02/hour)

**Risk 3:** Users don't understand cron jobs
- **Mitigation:** Create dead-simple templates ("Daily briefing at 9am")

**Risk 4:** Discord bot approval takes time
- **Mitigation:** Start with Telegram, add Discord as "coming soon"

---

## COST IMPLICATIONS

**ECS Task Increase:**
- Old: 0.5 vCPU, 1GB RAM = $0.04/hour
- New: 1 vCPU, 2GB RAM = $0.08/hour
- Impact: +$0.04/hour per agent = $2.88/month per agent
- **Decision:** Worth it for browser automation capability

**Chromium Image Size:**
- Base: ~200MB
- With Chromium: ~400MB
- Impact: Slower pulls, but one-time cost
- **Decision:** Acceptable for the feature

---

## CURRENT STATUS

**Started:** 2026-02-19 15:20 UTC  
**Next Checkpoint:** 2026-02-19 18:00 UTC (browser automation test)

**Active Work:**
1. Checking current Docker setup
2. Planning Chromium installation
3. Preparing config updates

**Blocked:** None  
**At Risk:** None yet

---

Let's ship this! 🚀
