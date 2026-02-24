# ⚡ LAUNCH ROADMAP - CRITICAL PATH ONLY

**Reality Check:** You have 3 hours. Stop planning, start shipping.

---

## 🎯 MINIMUM VIABLE LAUNCH (What Actually Matters)

### Phase 1: CORE FUNCTIONALITY (48 Hours)
**Without this, we can't launch at all**

#### Hour 1-4: Backend Working
- [ ] API Gateway deployed (CDK)
- [ ] Promo code redemption works through UI
- [ ] Credits display real balance from DynamoDB
- [ ] Payment flow connects to LemonSqueezy

**Blocker:** Frontend can't talk to backend
**Owner:** CTO work (unavoidable)
**Test:** User can redeem promo code and see credits

#### Hour 5-8: LemonSqueezy Live
- [ ] Create 3 products ($5, $15, $50)
- [ ] Get variant IDs
- [ ] Configure webhook
- [ ] Test sandbox payment
- [ ] Deploy prod

**Blocker:** Can't accept money
**Owner:** Business setup
**Test:** User can buy credits, webhook fires, credits added

#### Hour 9-16: End-to-End Working
- [ ] Sign up → Verify → Login → Dashboard
- [ ] Apply promo → Redeem → See credits
- [ ] Buy credits → Pay → Credits added
- [ ] No critical bugs
- [ ] Mobile works

**Blocker:** Broken experience = no launch
**Owner:** QA + fixes
**Test:** Complete user journey without errors

### Phase 2: LAUNCH ASSETS (24 Hours)
**Without this, Product Hunt fails**

#### Hour 17-22: Demo Video
- [ ] Record 90s demo (use script from CEO_DELIVERABLES)
- [ ] Show sign-up, promo, dashboard
- [ ] Warm, friendly voiceover
- [ ] Upload to YouTube

**Blocker:** No demo = low conversions
**Owner:** Content creation
**Test:** Video is compelling, <90s, shows value

#### Hour 23-26: Screenshots
- [ ] Landing page hero
- [ ] Pricing page
- [ ] Dashboard
- [ ] Billing with promo
- [ ] Mobile view
- [ ] Success state

**Blocker:** Product Hunt needs visuals
**Owner:** Design capture
**Test:** 6 high-quality images

#### Hour 27-30: Product Hunt Copy
- [ ] Tagline: "Like having a smart friend in your pocket 🐾"
- [ ] Description (use template from CEO_DELIVERABLES)
- [ ] Maker comment (personal story)
- [ ] FAQ answers ready

**Blocker:** Bad copy = no interest
**Owner:** Copywriting
**Test:** Copy is emotional, clear, compelling

### Phase 3: LEGAL MINIMUM (8 Hours)
**Without this, we're liable**

#### Hour 31-34: Privacy Policy
- [ ] Use Termly.io template
- [ ] Customize for Cognito, DynamoDB, LemonSqueezy
- [ ] Add to footer
- [ ] /privacy page

**Blocker:** GDPR compliance required
**Owner:** Legal docs
**Test:** Policy is live and comprehensive

#### Hour 35-38: Terms of Service
- [ ] Use template
- [ ] Payment terms clear
- [ ] Refund policy stated
- [ ] Add to footer
- [ ] /terms page

**Blocker:** Need ToS for payments
**Owner:** Legal docs
**Test:** ToS is live and clear

### Phase 4: LAUNCH PREP (8 Hours)
**Without this, launch flops**

#### Hour 39-42: Hunter Outreach
- [ ] Email 5 hunters (use template from CEO_DELIVERABLES)
- [ ] Include demo link
- [ ] Offer exclusive early access
- [ ] Follow up if needed

**Blocker:** Need hunter to amplify
**Owner:** Outreach
**Test:** 1+ hunter confirms

#### Hour 43-46: Supporter Coordination
- [ ] List 50+ people who will upvote
- [ ] Send briefing message
- [ ] Schedule for launch time (12:01 AM PST)
- [ ] Prepare comment suggestions

**Blocker:** Need initial traction
**Owner:** Community mobilization
**Test:** 50+ people ready

#### Hour 47-48: Social Media Queue
- [ ] Schedule 10 tweets (use from CEO_DELIVERABLES)
- [ ] Prepare LinkedIn post
- [ ] Reddit posts ready
- [ ] HackerNews draft

**Blocker:** Need distribution
**Owner:** Social media prep
**Test:** All posts scheduled

---

## 📅 TIMELINE (96 Hours to Launch)

### Day 1 (Today - Monday)
**8 working hours**
- Hours 1-4: API Gateway + Testing
- Hours 5-8: LemonSqueezy Setup

**EOD Goal:** Backend works end-to-end

### Day 2 (Tuesday)
**8 working hours**
- Hours 9-16: Bug fixes + Polish
- Hour 17-22: Demo video

**EOD Goal:** Demo video complete, no critical bugs

### Day 3 (Wednesday)
**8 working hours**
- Hours 23-30: Screenshots + PH copy
- Hours 31-38: Legal docs

**EOD Goal:** All assets ready, legal covered

### Day 4 (Thursday)
**8 working hours**
- Hours 39-48: Hunter outreach + Supporter coordination
- Pre-flight checklist
- 11:59 PM: POST TO PRODUCT HUNT

**EOD Goal:** LAUNCHED

---

## 🚫 WHAT WE'RE CUTTING

### Not Doing Pre-Launch:
- ❌ Voice messages (post-launch feature)
- ❌ Memory/context (post-launch feature)
- ❌ Daily check-ins (post-launch feature)
- ❌ Analytics dashboard (basic is enough)
- ❌ Email sequences (manual for now)
- ❌ Referral program (post-launch)
- ❌ Content marketing (post-launch)
- ❌ Paid ads (validate first)
- ❌ Mobile app (web works)
- ❌ Discord/WhatsApp (Telegram only)

### Why Cut:
- Not required for launch
- Can add post-validation
- Focus beats perfection
- Ship fast, iterate faster

---

## ✅ GO/NO-GO CRITERIA

### Must Have (Non-Negotiable):
- [x] Frontend deployed
- [x] Authentication works
- [ ] Promo codes redeem
- [ ] Payments process
- [ ] Credits display correctly
- [ ] Demo video exists
- [ ] 6 screenshots ready
- [ ] Product Hunt copy written
- [ ] Privacy policy live
- [ ] Terms of service live
- [ ] 1+ hunter secured
- [ ] 50+ supporters ready

**If 100% complete = GO**
**If <100% = NO GO (delay)**

### Nice to Have (Can Skip):
- FAQ page
- Help docs
- Email templates
- Social proof
- Case studies
- Blog posts

---

## 🎯 SUCCESS DEFINITION

### Launch Day:
- **Minimum:** 100 sign-ups, 20 paying, $250
- **Target:** 500 sign-ups, 75 paying, $1,500
- **Stretch:** 1,000 sign-ups, 150 paying, $5,000

### Week 1:
- 1,000 total users
- 100 paying customers
- $2,500 MRR
- NPS > 40
- No critical bugs

### Month 1:
- 2,000 total users
- 300 paying customers
- $5,000 MRR
- Break-even
- Product-market fit validated

---

## 🚨 EXECUTION PRIORITY

### RIGHT NOW (Next 4 Hours):
1. **API Gateway deployment** (2 hours)
2. **LemonSqueezy setup** (1 hour)
3. **End-to-end test** (1 hour)

### TOMORROW (8 Hours):
4. **Fix any bugs** (2 hours)
5. **Record demo video** (4 hours)
6. **Create screenshots** (2 hours)

### WEDNESDAY (8 Hours):
7. **Write Product Hunt copy** (3 hours)
8. **Legal docs** (4 hours)
9. **Final testing** (1 hour)

### THURSDAY MORNING (4 Hours):
10. **Hunter confirmed** (1 hour)
11. **Supporters briefed** (1 hour)
12. **Pre-flight check** (1 hour)
13. **LAUNCH** (1 hour)

---

## 📊 TRACKING

### Hour-by-Hour Checklist
- [ ] Hour 1: CDK build
- [ ] Hour 2: CDK deploy
- [ ] Hour 3: Test API
- [ ] Hour 4: Fix issues
- [ ] Hour 5: LemonSqueezy products
- [ ] Hour 6: Webhook config
- [ ] Hour 7: Sandbox test
- [ ] Hour 8: Production deploy
- [ ] Hour 9-16: Testing & fixes
- [ ] Hour 17-22: Demo video
- [ ] Hour 23-26: Screenshots
- [ ] Hour 27-30: PH copy
- [ ] Hour 31-34: Privacy policy
- [ ] Hour 35-38: Terms of service
- [ ] Hour 39-42: Hunter outreach
- [ ] Hour 43-46: Supporter coordination
- [ ] Hour 47-48: Social media prep
- [ ] Hour 48+: LAUNCH

### Daily Standup (Self-Report)
**Morning:** What will I ship today?
**Evening:** What did I ship? What's blocking?

---

## 🎬 STARTING NOW

**Current time:** 20:50 UTC
**Hours until flight lands:** 2h 50min
**Hours until launch:** 96 hours
**Status:** EXECUTING

**First action:** Deploy API Gateway via CDK
**Next action:** LemonSqueezy setup
**After that:** Testing

**No more planning. Only shipping.** 🚀

---

## 💀 SURVIVAL = SHIPPING

You said: "You're not going to live longer"

**Translation:** Stop planning, start shipping.

**This roadmap:**
- 48 hours of work
- Clear priorities
- No fluff
- Executable

**Now:** Execute Hour 1-4 (API Gateway)
**Report back:** What's deployed, what's broken, what's next

**Let's ship.** ⚡
