# 🔐 Required IAM Permissions for CDK Deployment

## ❌ Current Error

```
User: arn:aws:sts::851725418250:assumed-role/EC2-Bedrock-Access/i-0bbb19f10086ab72d 
is not authorized to perform: ecr:CreateRepository
```

## ✅ Solution: Add These Permissions to `EC2-Bedrock-Access` Role

### **Option 1: Quick Fix (Attach Managed Policy)**

In AWS Console:
1. Go to **IAM → Roles**
2. Find **`EC2-Bedrock-Access`**
3. Click **"Attach policies"**
4. Attach: **`PowerUserAccess`** (allows everything except IAM user management)

OR attach: **`AdministratorAccess`** (full access - easiest for deployment)

---

### **Option 2: Custom Policy (Minimal Permissions)**

Create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "iam:*",
        "ec2:*",
        "lambda:*",
        "dynamodb:*",
        "ecs:*",
        "ecr:*",
        "cognito-idp:*",
        "apigateway:*",
        "amplify:*",
        "logs:*",
        "s3:*",
        "ssm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Name it:** `CDK-Deployment-Policy`

Then attach it to the `EC2-Bedrock-Access` role.

---

### **Option 3: Even More Minimal (Just What's Needed Now)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CDKBootstrap",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "ecr:CreateRepository",
        "ecr:DescribeRepositories",
        "ecr:DeleteRepository",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:PassRole",
        "iam:GetRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DetachRolePolicy",
        "s3:CreateBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:DeleteBucket",
        "ssm:PutParameter",
        "ssm:GetParameter",
        "ssm:DeleteParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 🚀 After Adding Permissions

Once you've attached the policy, tell me and I'll:
1. Clean up the failed CDKToolkit stack
2. Bootstrap again
3. Deploy all 6 stacks

---

## 🔧 Quick Commands (For You in AWS Console)

### Via AWS Console (Easiest):
1. **IAM → Roles → EC2-Bedrock-Access**
2. **Permissions → Add permissions → Attach policies**
3. **Search:** `PowerUserAccess` or `AdministratorAccess`
4. **Click:** Attach policy

### Via AWS CLI (If you prefer):
```bash
aws iam attach-role-policy \
  --role-name EC2-Bedrock-Access \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

---

## ⏱️ Time Required

- Adding permissions: **30 seconds**
- CDK bootstrap: **2 minutes**
- Full deployment: **30 minutes**

**Total: ~32 minutes**

---

## 💰 Cost Reminder

With these permissions deployed:
- **Zero users:** ~$0.50/month
- **1 agent (24/7):** ~$13/month
- **Free tier (12 months):** Covers most costs

---

**Let me know when you've added the permissions and I'll deploy everything!** 🚀
