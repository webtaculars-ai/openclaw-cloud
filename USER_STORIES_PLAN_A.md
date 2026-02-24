# 📋 USER STORIES: Plan A Execution

**Epic:** Browser + Cron + Discord in 1 Week  
**Goal:** Transform OpenPaw from "friendly chatbot" to "AI that acts"

---

## WEEK 1: CORE FEATURES

### 🌐 Epic 1: Browser Automation (Days 1-2)

#### Story 1.1: Verify Browser Infrastructure
**As a** developer  
**I want to** confirm browser automation works in production  
**So that** we can confidently demo it to users

**Acceptance Criteria:**
- [ ] Provision fresh test agent with new task definition (1 vCPU, 2GB RAM)
- [ ] Send message: "Open google.com"
- [ ] Agent successfully opens page
- [ ] Send message: "Take a screenshot"
- [ ] Agent returns screenshot image
- [ ] No errors in CloudWatch logs

**Estimate:** 1 hour  
**Priority:** P0 (Blocker)

---

#### Story 1.2: Flight Search Demo
**As a** user  
**I want to** ask my agent to find flights  
**So that** I can book travel without manually searching

**Acceptance Criteria:**
- [ ] User sends: "Find flights from SFO to NYC next Friday under $300"
- [ ] Agent opens Google Flights
- [ ] Agent fills search form (origin, destination, date, price)
- [ ] Agent takes screenshot of results
- [ ] Agent returns: "Found 3 options: [details with screenshot]"
- [ ] Works reliably (3/3 test attempts)

**Estimate:** 4 hours  
**Priority:** P0 (Killer demo)

---

#### Story 1.3: Package Tracking Demo
**As a** user  
**I want to** track my packages via agent  
**So that** I don't have to open multiple tracking sites

**Acceptance Criteria:**
- [ ] User sends: "Track my Amazon order #ABC123"
- [ ] Agent opens Amazon (or tracking site)
- [ ] Agent searches for order number
- [ ] Agent extracts delivery status
- [ ] Agent returns: "Arriving tomorrow by 8pm" (with screenshot)
- [ ] Works for Amazon tracking numbers

**Estimate:** 3 hours  
**Priority:** P1 (Strong demo)

---

#### Story 1.4: Form Filling Demo
**As a** user  
**I want to** auto-fill web forms  
**So that** I save time on repetitive data entry

**Acceptance Criteria:**
- [ ] User sends: "Fill out this contact form: [URL]"
- [ ] Agent opens URL
- [ ] Agent identifies form fields (name, email, message)
- [ ] Agent fills fields from user profile/context
- [ ] Agent takes screenshot for review
- [ ] Agent asks: "Ready to submit?"
- [ ] User confirms, agent submits

**Estimate:** 4 hours  
**Priority:** P1 (Practical demo)

---

#### Story 1.5: Browser Demo Videos
**As a** marketer  
**I want to** show browser automation in action  
**So that** users understand the value immediately

**Acceptance Criteria:**
- [ ] Record 3 demo videos (30-60 seconds each):
  - Flight search demo
  - Package tracking demo
  - Form filling demo
- [ ] Add to `/openclaw-cloud/frontend/public/demos/`
- [ ] Format: MP4, < 5MB each
- [ ] Show user message + agent response + browser action

**Estimate:** 2 hours  
**Priority:** P1 (Marketing)

---

#### Story 1.6: Browser Documentation
**As a** user  
**I want to** understand what browser automation can do  
**So that** I know how to use it

**Acceptance Criteria:**
- [ ] Create `/openclaw-cloud/docs/browser-automation.md`
- [ ] Include:
  - What browser automation is
  - 5 example use cases
  - How to trigger it ("Open...", "Search...", "Fill...")
  - Limitations (headless, rate limits)
- [ ] Add to website FAQ section

**Estimate:** 1 hour  
**Priority:** P2

---

### ⏰ Epic 2: Cron Jobs UI (Day 3)

#### Story 2.1: Cron Jobs Page
**As a** user  
**I want to** see all my scheduled tasks  
**So that** I can manage my automations

**Acceptance Criteria:**
- [ ] Create `/frontend/src/pages/CronJobs.tsx`
- [ ] Show list of scheduled tasks (empty state if none)
- [ ] Each task shows: name, schedule, status, last run
- [ ] Add to navigation menu with icon
- [ ] Route: `/dashboard/cron`

**Estimate:** 3 hours  
**Priority:** P0

---

#### Story 2.2: Create Task Form
**As a** user  
**I want to** schedule a new task  
**So that** my agent does things automatically

**Acceptance Criteria:**
- [ ] "New Task" button opens modal/form
- [ ] Fields:
  - Task name (e.g., "Daily Standup")
  - Schedule type: Daily / Weekly / Custom
  - Time picker (e.g., 9:00 AM)
  - Message/prompt for agent
  - Timezone selector
- [ ] Preview: "Will run: Every day at 9:00 AM PST"
- [ ] Save button creates task
- [ ] Task appears in list

**Estimate:** 4 hours  
**Priority:** P0

---

#### Story 2.3: Task Templates
**As a** user  
**I want to** use pre-made templates  
**So that** I don't have to figure out scheduling syntax

**Acceptance Criteria:**
- [ ] "Use Template" button shows 3 templates:
  1. **Daily Standup** - "Summarize my calendar and messages" at 9am
  2. **Stock Alert** - "Check if Bitcoin > $100k" every hour
  3. **Weekly Report** - "Summarize my week" Friday 5pm
- [ ] Clicking template pre-fills form
- [ ] User can edit before saving
- [ ] Templates stored in `/frontend/src/constants/cronTemplates.ts`

**Estimate:** 2 hours  
**Priority:** P0 (Ease of use)

---

#### Story 2.4: Task Management
**As a** user  
**I want to** control my scheduled tasks  
**So that** I can pause, edit, or delete them

**Acceptance Criteria:**
- [ ] Each task has actions:
  - Toggle: Enable/Disable (pause without deleting)
  - Run Now: Trigger immediately
  - Edit: Update schedule/message
  - Delete: Remove task
- [ ] Confirmation dialog for destructive actions
- [ ] Status updates in real-time

**Estimate:** 3 hours  
**Priority:** P1

---

#### Story 2.5: Task History
**As a** user  
**I want to** see when tasks ran  
**So that** I can verify they're working

**Acceptance Criteria:**
- [ ] Clicking task shows history panel
- [ ] Shows last 10 runs:
  - Timestamp
  - Status (success/failed)
  - Duration
  - Output preview (first 100 chars)
- [ ] "View Full Output" button shows complete response
- [ ] Clear history option

**Estimate:** 3 hours  
**Priority:** P2

---

#### Story 2.6: Backend - Cron Management Lambda
**As a** backend  
**I need** Lambda functions for cron operations  
**So that** frontend can manage tasks

**Acceptance Criteria:**
- [ ] Create `list-cron-tasks.js` - GET /agents/{id}/cron
- [ ] Create `create-cron-task.js` - POST /agents/{id}/cron
- [ ] Create `update-cron-task.js` - PUT /agents/{id}/cron/{taskId}
- [ ] Create `delete-cron-task.js` - DELETE /agents/{id}/cron/{taskId}
- [ ] Create `run-cron-task.js` - POST /agents/{id}/cron/{taskId}/run
- [ ] Store in DynamoDB table: openclaw-cron-tasks
- [ ] Schema: agentId, taskId, name, schedule, message, enabled, lastRun
- [ ] Deploy all Lambdas
- [ ] Add API Gateway routes

**Estimate:** 6 hours  
**Priority:** P0

---

#### Story 2.7: OpenClaw Integration
**As a** system  
**I need to** sync cron tasks to OpenClaw gateway  
**So that** tasks actually execute

**Acceptance Criteria:**
- [ ] When task created, call OpenClaw cron API
- [ ] Use `openclaw cron add` equivalent
- [ ] Store OpenClaw job ID in DynamoDB
- [ ] When task updated, update OpenClaw job
- [ ] When task deleted, remove OpenClaw job
- [ ] Handle agent restarts (re-sync tasks)

**Estimate:** 4 hours  
**Priority:** P0 (Critical for functionality)

---

### 💬 Epic 3: Discord Support (Days 4-5)

#### Story 3.1: Discord Bot Setup Research
**As a** developer  
**I want to** understand Discord bot requirements  
**So that** I can implement it correctly

**Acceptance Criteria:**
- [ ] Research Discord bot creation process
- [ ] Document required permissions
- [ ] Identify OpenClaw Discord plugin config
- [ ] Create setup guide: `/openclaw-cloud/docs/discord-setup.md`
- [ ] Compare to Telegram setup

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 3.2: Discord Token in Agent Provisioning
**As a** user  
**I want to** add my Discord bot token during setup  
**So that** my agent works on Discord

**Acceptance Criteria:**
- [ ] Add Discord option to AgentSetup.tsx
- [ ] Radio buttons: Telegram / Discord / Both
- [ ] If Discord selected, show token input field
- [ ] Add "How to get Discord token" link
- [ ] Store discordBotToken in DynamoDB agents table
- [ ] Update schema to include discordBotToken (nullable)

**Estimate:** 3 hours  
**Priority:** P0

---

#### Story 3.3: Discord Configuration in Docker
**As a** system  
**I need to** configure Discord in OpenClaw  
**So that** agents can connect to Discord

**Acceptance Criteria:**
- [ ] Update entrypoint.sh to support DISCORD_BOT_TOKEN env var
- [ ] Add Discord channel config to config.json:
  ```json
  "channels": {
    "discord": {
      "enabled": true,
      "token": "$DISCORD_BOT_TOKEN",
      "dmPolicy": "open"
    }
  }
  ```
- [ ] Support both Telegram + Discord simultaneously
- [ ] Test with Discord bot token

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 3.4: Discord Bot Provisioning Lambda
**As a** backend  
**I need to** provision agents with Discord support  
**So that** users can use Discord

**Acceptance Criteria:**
- [ ] Update `provision-agent-standalone.js`
- [ ] Accept discordBotToken parameter
- [ ] Pass to ECS task as environment variable
- [ ] Update ECS task definition to include DISCORD_BOT_TOKEN
- [ ] Test provisioning Discord-only agent
- [ ] Test provisioning Telegram + Discord agent

**Estimate:** 3 hours  
**Priority:** P0

---

#### Story 3.5: Discord Bot Testing
**As a** QA  
**I want to** verify Discord bot works  
**So that** users can trust the feature

**Acceptance Criteria:**
- [ ] Create test Discord server
- [ ] Create test Discord bot
- [ ] Provision agent with Discord token
- [ ] Send message on Discord
- [ ] Agent responds on Discord
- [ ] Test cross-channel context:
  - Message on Discord
  - Check if context available on Telegram
  - Vice versa
- [ ] Document any limitations

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 3.6: Discord Setup Guide
**As a** user  
**I want** step-by-step Discord setup instructions  
**So that** I can connect my bot

**Acceptance Criteria:**
- [ ] Create `/frontend/src/components/DiscordSetupGuide.tsx`
- [ ] Step-by-step with screenshots:
  1. Go to Discord Developer Portal
  2. Create New Application
  3. Add Bot
  4. Copy Bot Token
  5. Enable Message Content Intent
  6. Get Bot Invite URL
  7. Invite to server
- [ ] Similar to TelegramSetupGuide.tsx
- [ ] Add to AgentSetup page

**Estimate:** 2 hours  
**Priority:** P1

---

#### Story 3.7: Multi-Channel Messaging
**As a** user  
**I want** my agent to remember context across channels  
**So that** I can switch between Telegram and Discord seamlessly

**Acceptance Criteria:**
- [ ] User asks on Telegram: "My favorite color is blue"
- [ ] User asks on Discord: "What's my favorite color?"
- [ ] Agent responds: "Blue" (remembers from Telegram)
- [ ] Context shared across both channels
- [ ] Session persistence works

**Estimate:** 1 hour (should work by default)  
**Priority:** P1 (Validation)

---

## WEEK 2: POLISH & LAUNCH

### 🎨 Epic 4: Homepage Redesign (Days 1-2)

#### Story 4.1: New Hero Section
**As a** marketer  
**I want** compelling homepage copy  
**So that** visitors understand our value immediately

**Acceptance Criteria:**
- [ ] New headline: "Your Personal AI Infrastructure 🐾"
- [ ] Subheadline: "Privacy-first, multi-channel, fully managed OpenClaw. Get the power of self-hosted AI without the setup."
- [ ] Hero image/video showing browser automation
- [ ] CTA: "Start Your Agent" button
- [ ] Update Landing.tsx

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 4.2: Feature Showcase Section
**As a** visitor  
**I want to** see what makes OpenPaw different  
**So that** I can decide if it's worth trying

**Acceptance Criteria:**
- [ ] 4 feature cards:
  1. **Browser Automation** - "AI that books flights, not just talks about them"
  2. **Scheduled Tasks** - "Daily briefings, alerts, automation"
  3. **Multi-Channel** - "One AI, everywhere you chat"
  4. **Privacy First** - "Your data, your control"
- [ ] Each card has icon, title, description, demo link
- [ ] GIFs/videos showing each feature

**Estimate:** 3 hours  
**Priority:** P0

---

#### Story 4.3: Comparison Table
**As a** visitor  
**I want to** compare OpenPaw vs alternatives  
**So that** I can make informed decision

**Acceptance Criteria:**
- [ ] Comparison table: OpenPaw vs ChatGPT vs Self-Hosted
- [ ] Rows:
  - Privacy
  - Multi-channel
  - Browser automation
  - Scheduled tasks
  - Easy setup
  - Own your data
  - Model choice
  - Pricing
- [ ] Visual: ✅ / ❌ / ⚠️
- [ ] Links to feature docs

**Estimate:** 2 hours  
**Priority:** P1

---

#### Story 4.4: Use Case Examples
**As a** visitor  
**I want to** see real-world examples  
**So that** I can imagine how I'd use it

**Acceptance Criteria:**
- [ ] 6 use case cards (already have content):
  1. Personal assistant
  2. Research & analysis
  3. Home automation
  4. Team collaboration
  5. Travel planning
  6. Package tracking
- [ ] Each card: scenario, solution, outcome
- [ ] "Try This" button links to setup

**Estimate:** 2 hours  
**Priority:** P1

---

#### Story 4.5: Updated Pricing Section
**As a** visitor  
**I want to** understand pricing  
**So that** I know what it costs

**Acceptance Criteria:**
- [ ] 3 tiers:
  - **Starter:** $10 for $20 credits (2x bonus) - "Try automation"
  - **Builder:** $25 for $25 credits - "Regular use"
  - **Pro:** $75 for $75 credits - "Power users"
- [ ] Show what credits buy: "~500 conversations"
- [ ] Highlight: "No subscriptions, credits never expire"
- [ ] Compare to ChatGPT: "$20/month subscription vs pay-per-use"

**Estimate:** 2 hours  
**Priority:** P0

---

### 🧪 Epic 5: Beta Testing (Days 3-4)

#### Story 5.1: Beta User Recruitment
**As a** product manager  
**I want** 30 beta testers  
**So that** we get real feedback

**Acceptance Criteria:**
- [ ] Post on:
  - Twitter/X
  - Reddit (r/selfhosted, r/OpenClaw)
  - Discord communities
  - Personal network
- [ ] Message: "Testing AI that automates tasks. Free $20 credit. DM for access."
- [ ] Collect emails in spreadsheet
- [ ] Send promo codes within 24h

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 5.2: Beta Promo Codes
**As a** system  
**I need** 30 promo codes  
**So that** beta users get free credits

**Acceptance Criteria:**
- [ ] Generate 30 promo codes via existing script
- [ ] Each code: $20 value
- [ ] Store in openclaw-promo-codes table
- [ ] Track usage per code
- [ ] Create beta-codes.txt file

**Estimate:** 30 minutes  
**Priority:** P0

---

#### Story 5.3: Beta Onboarding Email
**As a** beta user  
**I want** clear setup instructions  
**So that** I can start using OpenPaw

**Acceptance Criteria:**
- [ ] Email template:
  - Welcome + thank you
  - Promo code: BETA-XXXXX
  - Setup link: openpaw.co/setup
  - What to try: Browser automation, cron jobs
  - Feedback form link
  - Discord community link
- [ ] Send via (manual for now, automate later)

**Estimate:** 1 hour  
**Priority:** P0

---

#### Story 5.4: Beta Feedback Collection
**As a** product manager  
**I want** structured feedback  
**So that** we know what to improve

**Acceptance Criteria:**
- [ ] Create Google Form / Typeform:
  - What did you try?
  - What worked well?
  - What was confusing?
  - What features do you want?
  - NPS score (1-10)
  - Can we quote you?
- [ ] Link in onboarding email
- [ ] Link in app footer
- [ ] Review responses daily

**Estimate:** 1 hour  
**Priority:** P0

---

#### Story 5.5: Beta Support Channel
**As a** beta user  
**I want** help when stuck  
**So that** I can successfully use OpenPaw

**Acceptance Criteria:**
- [ ] Create Discord server or Telegram group
- [ ] Invite all beta users
- [ ] Respond to questions within 1 hour
- [ ] Document common issues
- [ ] Update docs based on questions

**Estimate:** Ongoing (1 hour setup)  
**Priority:** P0

---

#### Story 5.6: Beta Metrics Dashboard
**As a** product manager  
**I want** usage analytics  
**So that** I track beta success

**Acceptance Criteria:**
- [ ] Track:
  - Signups
  - Agents provisioned
  - Messages sent
  - Browser automations used
  - Cron jobs created
  - Credits spent
  - Daily active users
- [ ] CloudWatch dashboard or custom page
- [ ] Review daily

**Estimate:** 3 hours  
**Priority:** P1

---

### 🚀 Epic 6: Soft Launch (Day 5)

#### Story 6.1: Launch Announcement
**As a** founder  
**I want** to announce the beta  
**So that** we get initial users

**Acceptance Criteria:**
- [ ] Post on:
  - Twitter/X
  - Reddit (r/selfhosted, r/OpenClaw, r/SideProject)
  - Hacker News Show HN
  - Product Hunt (teaser)
- [ ] Message highlights:
  - AI that automates (not just chats)
  - Browser control + scheduled tasks
  - Privacy-first
  - Free beta credits
- [ ] Link to openpaw.co
- [ ] Monitor comments, respond quickly

**Estimate:** 2 hours  
**Priority:** P0

---

#### Story 6.2: Monitoring & Alerts
**As a** ops team  
**I want** alerts for critical issues  
**So that** we fix problems immediately

**Acceptance Criteria:**
- [ ] CloudWatch alarms:
  - Lambda errors > 5%
  - ECS task failures
  - API 5xx errors > 10/min
  - Credit balance < $5
- [ ] Send alerts to email/Telegram
- [ ] Runbook for common issues

**Estimate:** 2 hours  
**Priority:** P1

---

#### Story 6.3: First User Success
**As a** founder  
**I want** the first user to succeed  
**So that** we validate product-market fit

**Acceptance Criteria:**
- [ ] First non-beta user signs up
- [ ] User provisions agent successfully
- [ ] User tries browser automation
- [ ] User schedules cron job
- [ ] User sends positive feedback
- [ ] Document their journey

**Estimate:** N/A (outcome)  
**Priority:** P0

---

## STORY SUMMARY

### By Epic
- **Epic 1 (Browser):** 6 stories, ~15 hours
- **Epic 2 (Cron):** 7 stories, ~25 hours
- **Epic 3 (Discord):** 7 stories, ~15 hours
- **Epic 4 (Homepage):** 5 stories, ~11 hours
- **Epic 5 (Beta):** 6 stories, ~8 hours
- **Epic 6 (Launch):** 3 stories, ~4 hours

### Total
**34 user stories, ~78 hours of work**

### Priority Breakdown
- **P0 (Must Have):** 24 stories
- **P1 (Should Have):** 8 stories
- **P2 (Nice to Have):** 2 stories

### Resource Allocation
- **Backend:** ~30 hours
- **Frontend:** ~25 hours
- **DevOps:** ~10 hours
- **Product/Marketing:** ~13 hours

---

## AGILE CEREMONIES

### Daily Standup (15 min)
- What shipped yesterday?
- What's shipping today?
- Any blockers?

### Sprint Review (Week 1 & 2 end)
- Demo working features
- Collect feedback
- Adjust plan

### Retrospective (Week 2 end)
- What went well?
- What went wrong?
- What to improve?

---

## DEFINITION OF DONE

A story is complete when:
- [ ] Code written and tested
- [ ] Deployed to production
- [ ] Verified working end-to-end
- [ ] Documentation updated
- [ ] Reviewed by at least one other person
- [ ] No critical bugs

---

**Ready to start sprinting! 🚀**

Which stories should we tackle first?
