# 🎁 OpenClaw Cloud - Friends & Family Program

**Date:** 2026-02-14 18:35 UTC  
**Purpose:** Free starter pack for friends & family without payment

---

## 🎯 PROGRAM OVERVIEW

**Goal:** Allow you to invite friends & family with **$10 free credits** (no payment required)

**How it works:**
1. You generate **invite codes** (manually or via admin tool)
2. Friends sign up with invite code
3. They get **$10 credits instantly** (no Lemon Squeezy payment)
4. All other users must pay via Lemon Squeezy

---

## 🔑 INVITE CODE SYSTEM

### **Code Format**
```
FRIEND-XXXXXX  (e.g., FRIEND-A3F9B2)
```

**Properties:**
- 6-character random code (alphanumeric)
- Single-use (can't be reused)
- Tracked in DynamoDB
- No expiration (can be created in advance)

---

## 🗄️ DATABASE SCHEMA

### **New Table: InviteCodes**

```typescript
{
  TableName: "InviteCodes",
  PartitionKey: "code" (String),          // e.g., "FRIEND-A3F9B2"
  Attributes: {
    code: String,                         // Partition key
    creditsCents: Number,                 // 1000 ($10)
    used: Boolean,                        // false initially, true after redemption
    usedBy: String,                       // userId who redeemed (null if not used)
    usedAt: String,                       // ISO timestamp (null if not used)
    createdAt: String,                    // ISO timestamp
    createdBy: String,                    // "admin" or userId who generated
    note: String,                         // Optional note (e.g., "For John")
  }
}
```

---

## 💻 IMPLEMENTATION

### **1. Create InviteCodes Table (CDK)**

```typescript
// infra/lib/database-stack.ts

export class DatabaseStack extends cdk.Stack {
  public readonly inviteCodesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // ... existing tables ...

    // Invite Codes Table
    this.inviteCodesTable = new dynamodb.Table(this, 'InviteCodes', {
      tableName: 'openclaw-invite-codes',
      partitionKey: { name: 'code', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // Global Secondary Index for querying by status
    this.inviteCodesTable.addGlobalSecondaryIndex({
      indexName: 'UsedIndex',
      partitionKey: { name: 'used', type: dynamodb.AttributeType.BOOLEAN },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    new cdk.CfnOutput(this, 'InviteCodesTableName', {
      value: this.inviteCodesTable.tableName,
      exportName: 'InviteCodesTableName',
    });
  }
}
```

---

### **2. DynamoDB Service Methods**

```typescript
// backend/src/services/dynamo.ts

export interface InviteCode {
  code: string;
  creditsCents: number;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
  createdBy: string;
  note?: string;
}

const INVITE_CODES_TABLE = process.env.INVITE_CODES_TABLE!;

export async function getInviteCode(code: string): Promise<InviteCode | null> {
  const result = await ddbClient.send(new GetItemCommand({
    TableName: INVITE_CODES_TABLE,
    Key: { code: { S: code } },
  }));

  if (!result.Item) return null;

  return {
    code: result.Item.code.S!,
    creditsCents: Number(result.Item.creditsCents.N!),
    used: result.Item.used.BOOL!,
    usedBy: result.Item.usedBy?.S,
    usedAt: result.Item.usedAt?.S,
    createdAt: result.Item.createdAt.S!,
    createdBy: result.Item.createdBy.S!,
    note: result.Item.note?.S,
  };
}

export async function createInviteCode(inviteCode: InviteCode): Promise<void> {
  await ddbClient.send(new PutItemCommand({
    TableName: INVITE_CODES_TABLE,
    Item: {
      code: { S: inviteCode.code },
      creditsCents: { N: String(inviteCode.creditsCents) },
      used: { BOOL: false },
      createdAt: { S: inviteCode.createdAt },
      createdBy: { S: inviteCode.createdBy },
      ...(inviteCode.note && { note: { S: inviteCode.note } }),
    },
    ConditionExpression: 'attribute_not_exists(code)', // Prevent duplicates
  }));
}

export async function redeemInviteCode(code: string, userId: string): Promise<number> {
  const inviteCode = await getInviteCode(code);

  if (!inviteCode) {
    throw new Error('Invalid invite code');
  }

  if (inviteCode.used) {
    throw new Error('Invite code already used');
  }

  // Mark as used (atomic update)
  await ddbClient.send(new UpdateItemCommand({
    TableName: INVITE_CODES_TABLE,
    Key: { code: { S: code } },
    UpdateExpression: 'SET used = :true, usedBy = :userId, usedAt = :now',
    ConditionExpression: 'used = :false', // Prevent race condition
    ExpressionAttributeValues: {
      ':true': { BOOL: true },
      ':false': { BOOL: false },
      ':userId': { S: userId },
      ':now': { S: new Date().toISOString() },
    },
  }));

  return inviteCode.creditsCents;
}

export async function listInviteCodes(usedFilter?: boolean): Promise<InviteCode[]> {
  const result = await ddbClient.send(new ScanCommand({
    TableName: INVITE_CODES_TABLE,
    ...(usedFilter !== undefined && {
      FilterExpression: 'used = :used',
      ExpressionAttributeValues: {
        ':used': { BOOL: usedFilter },
      },
    }),
  }));

  return (result.Items || []).map(item => ({
    code: item.code.S!,
    creditsCents: Number(item.creditsCents.N!),
    used: item.used.BOOL!,
    usedBy: item.usedBy?.S,
    usedAt: item.usedAt?.S,
    createdAt: item.createdAt.S!,
    createdBy: item.createdBy.S!,
    note: item.note?.S,
  }));
}
```

---

### **3. Signup Handler (with Invite Code Support)**

```typescript
// backend/src/handlers/signup.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ulid } from 'ulid';
import * as dynamo from '../services/dynamo';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, email, inviteCode } = body;

    if (!userId || !email) {
      return response(400, { error: 'Missing userId or email' });
    }

    // Check if user already exists
    const existingUser = await dynamo.getUser(userId);
    if (existingUser) {
      return response(400, { error: 'User already exists' });
    }

    // Create user
    await dynamo.createUser({
      userId,
      email,
      signupDate: new Date().toISOString(),
    });

    // Initialize credits
    await dynamo.initializeCredits(userId, 0);

    // Handle invite code if provided
    if (inviteCode) {
      try {
        const creditsCents = await dynamo.redeemInviteCode(inviteCode, userId);

        // Add credits
        await dynamo.addCredits(userId, creditsCents);

        // Record transaction
        await dynamo.createTransaction({
          userId,
          txnId: ulid(),
          type: 'signup_bonus',
          amountCents: creditsCents,
          description: `Friends & Family invite code: ${inviteCode}`,
          createdAt: new Date().toISOString(),
        });

        return response(200, {
          message: 'Account created successfully',
          creditsCents,
          inviteCodeRedeemed: true,
        });
      } catch (error: any) {
        console.error('Invite code redemption failed:', error);
        // Continue without invite code (user can still sign up)
        return response(200, {
          message: 'Account created successfully',
          creditsCents: 0,
          inviteCodeError: error.message,
        });
      }
    }

    return response(200, {
      message: 'Account created successfully',
      creditsCents: 0,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
```

---

### **4. Admin Tool to Generate Invite Codes**

```typescript
// backend/src/handlers/admin-generate-invite.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomBytes } from 'crypto';
import * as dynamo from '../services/dynamo';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

function generateCode(): string {
  return 'FRIEND-' + randomBytes(3).toString('hex').toUpperCase();
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // TODO: Add authentication (check admin user)
    const adminUserId = event.requestContext.authorizer?.claims?.sub;
    
    if (!adminUserId) {
      return response(401, { error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { count = 1, creditsCents = 1000, note } = body;

    if (count < 1 || count > 100) {
      return response(400, { error: 'Count must be between 1 and 100' });
    }

    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = generateCode();
      
      await dynamo.createInviteCode({
        code,
        creditsCents,
        used: false,
        createdAt: new Date().toISOString(),
        createdBy: adminUserId,
        note: note ? `${note} (${i + 1}/${count})` : undefined,
      });

      codes.push(code);
    }

    return response(200, {
      message: `Generated ${count} invite code(s)`,
      codes,
      creditsCents,
    });
  } catch (error: any) {
    console.error('Generate invite error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
```

---

### **5. CLI Tool for Manual Generation**

```bash
#!/bin/bash
# scripts/generate-invite-codes.sh

# Generate 10 invite codes for friends & family

INVITE_CODES_TABLE="openclaw-invite-codes"
CREDITS_CENTS=1000  # $10
NOTE="${1:-Friends & Family}"

for i in {1..10}; do
  CODE="FRIEND-$(openssl rand -hex 3 | tr '[:lower:]' '[:upper:]')"
  
  aws dynamodb put-item \
    --table-name $INVITE_CODES_TABLE \
    --item "{
      \"code\": {\"S\": \"$CODE\"},
      \"creditsCents\": {\"N\": \"$CREDITS_CENTS\"},
      \"used\": {\"BOOL\": false},
      \"createdAt\": {\"S\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"},
      \"createdBy\": {\"S\": \"admin\"},
      \"note\": {\"S\": \"$NOTE\"}
    }" \
    --condition-expression "attribute_not_exists(code)"
  
  echo "Generated: $CODE"
done

echo ""
echo "✅ Generated 10 invite codes with $10 credits each"
echo "Share these codes with friends & family!"
```

---

## 🎨 FRONTEND INTEGRATION

### **Signup Form (React)**

```tsx
// frontend/src/components/SignupForm.tsx

import { useState } from 'react';
import { Auth } from 'aws-amplify';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Step 1: Cognito signup
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: { email },
      });

      // Step 2: Call backend to create user record + redeem invite code
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.getUsername(),
          email,
          inviteCode: inviteCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.inviteCodeRedeemed) {
          setSuccess(`Account created! You received $${data.creditsCents / 100} free credits!`);
        } else {
          setSuccess('Account created! Check your email to verify.');
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <h2 className="text-2xl font-bold">Sign Up for OpenClaw Cloud</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded">{success}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Invite Code (optional)"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        className="w-full p-2 border rounded"
      />
      <p className="text-sm text-gray-600">
        Have an invite code? Get $10 free credits! 🎁
      </p>

      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
        Sign Up
      </button>

      <p className="text-sm text-gray-600">
        No invite code? No problem! You can purchase credits after signup.
      </p>
    </form>
  );
}
```

---

## 📋 UPDATED PRICING (With Friends & Family)

### **Public Pricing (Lemon Squeezy)**

```
FREE TIER:
  - $0 upfront
  - No credits (must use invite code or purchase)
  - Can provision agent but needs credits to run

STARTER: $9/month
  - $18 credits (2,000 messages)
  - 1 GB RAM / 0.5 vCPU
  - 4h/day usage limit
  - Good for personal use

PRO: $29/month (⭐ Recommended)
  - $55 credits (6,111 messages)
  - 2 GB RAM / 1 vCPU (full OpenClaw power)
  - 8h/day usage limit
  - Great for teams & businesses

BUSINESS: $99/month
  - $200 credits (22,222 messages)
  - 4 GB RAM / 2 vCPU (maximum performance)
  - Unlimited usage
  - For power users & agencies
```

---

### **Friends & Family Program (No Payment)**

```
INVITE CODE: FRIEND-XXXXXX
  - $10 free credits (1,111 messages)
  - 1 GB RAM / 0.5 vCPU
  - Same as Starter tier resources
  - No payment required!
  - Perfect for trying out OpenClaw Cloud

After credits used:
  - Can purchase more via Lemon Squeezy
  - Or upgrade to monthly plan
```

---

## 🎁 HOW TO SHARE WITH FRIENDS

### **Message Template**

```
Hey! I'm using OpenClaw Cloud to run my own AI agent. 

Want to try it for free? Use my invite code:

🎁 FRIEND-A3F9B2

This gives you $10 free credits (about 1,000 messages with Claude Sonnet) - no payment required!

Sign up here: https://openclaw.cloud/signup

Enjoy! 🚀
```

---

## 🔐 SECURITY CONSIDERATIONS

### **Abuse Prevention**

1. **One code per user:**
   - Track `usedBy` userId
   - Check if user already redeemed a code before allowing another

2. **Rate limiting:**
   - Limit signup attempts per IP (CloudFront + WAF)
   - Limit invite code checks (API Gateway throttling)

3. **Admin-only generation:**
   - Protect `/admin/generate-invite` endpoint
   - Require Cognito admin group membership
   - Log all code generation attempts

4. **Monitoring:**
   - Alert if >10 codes redeemed in 1 hour
   - Alert if same IP uses multiple codes
   - Weekly report of invite code usage

---

## 📊 ANALYTICS

### **Track Invite Code Performance**

```typescript
// backend/src/handlers/admin-invite-stats.ts

export async function handler(): Promise<APIGatewayProxyResult> {
  const allCodes = await dynamo.listInviteCodes();
  
  const stats = {
    total: allCodes.length,
    used: allCodes.filter(c => c.used).length,
    unused: allCodes.filter(c => !c.used).length,
    totalCreditsIssued: allCodes
      .filter(c => c.used)
      .reduce((sum, c) => sum + c.creditsCents, 0),
  };

  return response(200, stats);
}
```

**Metrics to track:**
- Total codes generated
- Redemption rate (used / total)
- Average time to redemption
- Conversion rate (invite users who upgrade to paid)
- CAC savings (vs regular signups)

---

## 💰 FINANCIAL IMPACT

### **Cost per Invite**

```
Friend signs up with $10 credits:
  - ECS cost (assume 3h/day avg): $2.56/month
  - LLM cost (assume 500 msgs): $2.25
  - Other infra: $0.20
  ────────────────────────────────
  Total cost: $5.01

Our investment: $5.01
Their credits: $10 (value to them)
Net cost to us: $5.01 (pure marketing expense)
```

**If 20% convert to $9/month:**
- 5 friends invited = $25 cost
- 1 converts = $9/month revenue
- Payback in 3 months

**If 30% convert to $29/month:**
- 5 friends invited = $25 cost
- 1.5 converts = $29/month revenue
- Payback in 1 month!

**Conclusion:** Excellent word-of-mouth marketing ROI! ✅

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Create InviteCodes DynamoDB table (CDK)
- [ ] Add DynamoDB service methods
- [ ] Create signup handler with invite code support
- [ ] Create admin invite generation Lambda
- [ ] Update frontend signup form
- [ ] Create CLI script for manual generation
- [ ] Add monitoring & alerts
- [ ] Generate initial batch of codes (10-50)
- [ ] Test end-to-end flow
- [ ] Document how to share codes

---

## 📝 SAMPLE CODES TO GENERATE

**For launch:**
```bash
./scripts/generate-invite-codes.sh "Launch Week"
```

This creates 10 codes like:
```
FRIEND-A3F9B2
FRIEND-D7E1C4
FRIEND-9B2F8A
...
```

**Share these with:**
- Close friends
- Family members
- Beta testers
- Early supporters
- Influencers (for reviews)

---

## ✅ SUMMARY

**What you get:**
1. ✅ Generate unlimited invite codes
2. ✅ Each code = $10 free credits
3. ✅ Friends don't pay Lemon Squeezy
4. ✅ One-time use per code
5. ✅ Tracks who redeemed
6. ✅ All other users must pay
7. ✅ Easy to share via link
8. ✅ Good marketing ROI

**Implementation:**
- 1 new DynamoDB table
- 3 new Lambda functions
- Frontend form update
- CLI tool for generation

**Ready to implement?** Let me know and I'll create all the code files! 🚀
