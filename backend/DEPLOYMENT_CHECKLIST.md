# 🚀 OPTION 2 DEPLOYMENT CHECKLIST

**Start Date:** 2026-02-18  
**Target Completion:** 2026-02-22 (4 days)  
**Status:** IN PROGRESS

---

## DAY 1-2: BACKEND INFRASTRUCTURE

### Phase 1A: Lambda Functions ⏳
- [ ] Create all 8 Lambda handler files
- [ ] Compile TypeScript → JavaScript
- [ ] Package for Lambda deployment
- [ ] Deploy functions to AWS
- [ ] Configure environment variables
- [ ] Set up IAM permissions
- [ ] Test each endpoint

**Lambda Functions:**
1. [ ] provision-agent
2. [ ] list-agents
3. [ ] get-agent
4. [ ] start-agent
5. [ ] stop-agent
6. [ ] get-credits
7. [ ] recharge-credits
8. [ ] lemonsqueezy-webhook

### Phase 1B: API Gateway ⏳
- [ ] Create full API Gateway stack (CDK)
- [ ] Configure all endpoints
- [ ] Set up Cognito authorizer
- [ ] Configure CORS for openpaw.co
- [ ] Deploy API Gateway
- [ ] Test all endpoints
- [ ] Document API URL

---

## DAY 3-4: ECS INFRASTRUCTURE

### Phase 2A: Docker Image
- [ ] Create Dockerfile for OpenClaw agent
- [ ] Create entrypoint.sh script
- [ ] Build Docker image locally
- [ ] Test image runs correctly
- [ ] Create ECR repository
- [ ] Push image to ECR

### Phase 2B: ECS Cluster & Task Definition
- [ ] Configure VPC and subnets
- [ ] Create security group
- [ ] Create ECS cluster
- [ ] Create IAM roles (task execution + task)
- [ ] Register ECS task definition
- [ ] Test manual task launch
- [ ] Verify logs in CloudWatch

### Phase 2C: Lambda → ECS Integration
- [ ] Update Lambda env vars (ECS cluster, task def, VPC)
- [ ] Test provision-agent starts ECS task
- [ ] Test stop-agent stops ECS task
- [ ] Verify task ARN stored in DynamoDB
- [ ] Test error handling

---

## DAY 5: CREDIT TRACKING & MONITORING

### Phase 3A: Credit Deduction
- [ ] Configure OpenClaw to log token usage
- [ ] Create CloudWatch Logs subscription filter
- [ ] Create process-agent-logs Lambda
- [ ] Test credit deduction end-to-end
- [ ] Implement auto-stop on zero credits

### Phase 3B: LemonSqueezy Integration
- [ ] Create LemonSqueezy store
- [ ] Create 3 products ($15, $50, enterprise)
- [ ] Get variant IDs
- [ ] Configure webhook
- [ ] Update Lambda env vars
- [ ] Test payment flow (sandbox)
- [ ] Test payment flow (production)

### Phase 3C: Monitoring & Alarms
- [ ] Create CloudWatch dashboard
- [ ] Set up alarms (API errors, ECS failures)
- [ ] Configure SNS notifications
- [ ] Test alarms trigger

---

## DAY 6: FRONTEND & TESTING

### Phase 4A: Frontend Updates
- [ ] Update .env with API Gateway URL
- [ ] Remove all mock mode code
- [ ] Test all API integrations
- [ ] Rebuild frontend
- [ ] Deploy to S3
- [ ] Invalidate CloudFront cache

### Phase 4B: End-to-End Testing
- [ ] Test: Sign up
- [ ] Test: Redeem promo code
- [ ] Test: Provision agent
- [ ] Test: Telegram bot connection
- [ ] Test: AI chat via Telegram
- [ ] Test: Credits deduction
- [ ] Test: Buy credits
- [ ] Test: Agent stops at $0 balance

### Phase 4C: Bug Fixes & Polish
- [ ] Fix any bugs found
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Test on mobile

---

## DAY 7: LAUNCH PREP

### Phase 5A: Demo Assets
- [ ] Record demo video (90 seconds)
- [ ] Take 6 screenshots
- [ ] Edit and optimize

### Phase 5B: Launch Materials
- [ ] Finalize Product Hunt copy
- [ ] Secure hunter
- [ ] Coordinate supporters
- [ ] Prepare social posts

### Phase 5C: Final Checks
- [ ] Security audit
- [ ] Performance testing
- [ ] Backup plan
- [ ] Launch!

---

## CURRENT STATUS

**Working on:** Phase 1A - Lambda Functions  
**Blocked by:** Nothing  
**Next:** Deploy first Lambda function
