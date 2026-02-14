# 🚀 Quick Deploy Guide

## Deploy in 3 Commands

### 1. Get the Code
```bash
# If you haven't already, get the project
cd openclaw-cloud
```

### 2. Configure AWS
```bash
aws configure
# Enter your AWS credentials when prompted
```

### 3. Deploy Everything
```bash
./deploy.sh
```

**That's it!** ☕ Grab coffee - deployment takes ~30 minutes.

---

## What Gets Deployed

✅ **6 CloudFormation Stacks:**
1. OpenClawCloudNetwork (VPC, security groups)
2. OpenClawCloudAuth (Cognito user pool)
3. OpenClawCloudDatabase (4 DynamoDB tables)
4. OpenClawCloudAgentRuntime (ECS cluster, ECR)
5. OpenClawCloudApi (8 Lambda functions, API Gateway)
6. OpenClawCloudFrontend (Amplify hosting)

---

## After Deployment

### Get Your API URL
```bash
cd infra
npx cdk output OpenClawCloudApi/ApiUrl
```

### Get ECR Repository URI
```bash
npx cdk output OpenClawCloudAgentRuntime/RepositoryUri
```

### Get Cognito Pool IDs
```bash
npx cdk output OpenClawCloudAuth/UserPoolId
npx cdk output OpenClawCloudAuth/UserPoolClientId
```

---

## Next Steps

See **DEPLOYMENT.md** for:
- Building & pushing Docker image
- Updating Lambda secrets (Stripe)
- Configuring Stripe webhook
- Connecting Amplify to Git

---

## Cost Monitoring

```bash
# View current costs
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-28 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Set up billing alert
aws cloudwatch put-metric-alarm \
  --alarm-name openclaw-cost-alert \
  --alarm-description "Alert when OpenClaw costs exceed $20" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 20 \
  --comparison-operator GreaterThanThreshold
```

---

## Cleanup (When Done Testing)

```bash
cd infra
npx cdk destroy --all
```

**Costs stop immediately** after destroying stacks.

---

## Troubleshooting

### "AWS credentials not configured"
```bash
aws configure
```

### "CDK bootstrap required"
```bash
cd infra
npx cdk bootstrap
```

### "Stack already exists"
```bash
# Update existing deployment
npx cdk deploy --all
```

---

**Questions?** See DEPLOYMENT.md for detailed guide.
