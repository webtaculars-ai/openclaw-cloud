# 🍋 Lemon Squeezy Integration Guide

## Why Lemon Squeezy?

✅ **Easier setup** - No complex webhooks, simpler API  
✅ **Better for SaaS** - Built specifically for software subscriptions  
✅ **Lower fees** - 5% + payment processing (vs Stripe's complex pricing)  
✅ **Tax handling** - Automatic VAT/GST calculation and filing  
✅ **EU-friendly** - Great for global sales  

---

## Step 1: Create Lemon Squeezy Account (5 minutes)

1. Go to: https://www.lemonsqueezy.com/
2. Click **"Get Started"**
3. Complete signup
4. Create your store

---

## Step 2: Get API Key (2 minutes)

1. Go to: https://app.lemonsqueezy.com/settings/api
2. Click **"Create API Key"**
3. Give it a name: "OpenClaw Cloud Production"
4. Copy the key (starts with `lemon_api_...`)
5. Save it:
   ```bash
   export LEMONSQUEEZY_API_KEY='your_api_key_here'
   ```

---

## Step 3: Get Store ID (1 minute)

1. Go to: https://app.lemonsqueezy.com/settings/stores
2. Copy your Store ID (usually visible in the URL or settings)
3. Save it:
   ```bash
   export LEMONSQUEEZY_STORE_ID='12345'
   ```

---

## Step 4: Create Products & Variants (10 minutes)

### Create 3 Products:

#### 1. **Starter Tier - $5**
1. Go to: https://app.lemonsqueezy.com/products/new
2. **Product name:** "OpenClaw Credits - Starter"
3. **Description:** "Get $10 in credits for your first purchase (2x bonus!)"
4. **Price:** $5.00
5. **Type:** Single payment
6. Click **"Create Product"**
7. **Copy the Variant ID** from the URL or product page
8. Save it:
   ```bash
   export LEMONSQUEEZY_VARIANT_STARTER='123456'
   ```

#### 2. **Pro Tier - $20**
1. Create new product
2. **Product name:** "OpenClaw Credits - Pro"
3. **Description:** "Get $20 in credits"
4. **Price:** $20.00
5. **Type:** Single payment
6. Copy Variant ID:
   ```bash
   export LEMONSQUEEZY_VARIANT_PRO='123457'
   ```

#### 3. **Enterprise Tier - $100**
1. Create new product
2. **Product name:** "OpenClaw Credits - Enterprise"
3. **Description:** "Get $100 in credits"
4. **Price:** $100.00
5. **Type:** Single payment
6. Copy Variant ID:
   ```bash
   export LEMONSQUEEZY_VARIANT_ENTERPRISE='123458'
   ```

---

## Step 5: Configure Webhook (5 minutes)

1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click **"Add endpoint"**
3. **URL:** `https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/webhooks/lemonsqueezy`
4. **Events to send:**
   - ✅ `order_created` (this is the main one we need)
   - Optional: `subscription_created`, `subscription_updated` (for future subscriptions)
5. Click **"Create webhook"**
6. **Copy the Signing Secret**
7. Save it:
   ```bash
   export LEMONSQUEEZY_WEBHOOK_SECRET='your_webhook_secret_here'
   ```

---

## Step 6: Configure Lambda Functions (2 minutes)

Run the configuration script:

```bash
cd /path/to/openclaw-cloud

# Make sure all variables are set
echo $LEMONSQUEEZY_API_KEY
echo $LEMONSQUEEZY_WEBHOOK_SECRET
echo $LEMONSQUEEZY_STORE_ID
echo $LEMONSQUEEZY_VARIANT_STARTER
echo $LEMONSQUEEZY_VARIANT_PRO
echo $LEMONSQUEEZY_VARIANT_ENTERPRISE

# Run configuration
./configure-lemonsqueezy.sh
```

---

## Step 7: Test the Integration (10 minutes)

### Test Webhook Endpoint:

```bash
# Get API Gateway URL
aws cloudformation describe-stacks \
  --region ap-south-1 \
  --stack-name OpenClawCloudApi \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

Your webhook URL should be: `https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod/webhooks/lemonsqueezy`

### Test Purchase Flow:

1. Go to your frontend: `https://d2spow5okg20j4.amplifyapp.com`
2. Sign up for an account
3. Go to **Billing** page
4. Click **"Starter - $5"**
5. You'll be redirected to Lemon Squeezy checkout
6. Use test card: `4242 4242 4242 4242`
7. Complete purchase
8. Check DynamoDB - you should have $10 credits (2x bonus!)

### Monitor Logs:

```bash
# Watch webhook handler
aws logs tail /aws/lambda/OpenClawCloudApi-LemonSqueezyWebhook... \
  --region ap-south-1 --follow

# Watch general logs
aws logs tail /aws/lambda/OpenClawCloudApi-ProvisionAgentFn... \
  --region ap-south-1 --follow
```

---

## Pricing Comparison: Lemon Squeezy vs Stripe

| Feature | Lemon Squeezy | Stripe |
|---------|---------------|--------|
| **Transaction Fee** | 5% + processor fees | 2.9% + $0.30 |
| **Setup Complexity** | Easy | Moderate |
| **Tax Handling** | Automatic | Manual (extra $$$) |
| **Best For** | SaaS, Digital Products | Everything |
| **Dashboard** | Simple & Clean | Powerful but complex |

**For OpenClaw Cloud:** Lemon Squeezy is perfect because:
- Simple integration
- Automatic tax handling
- Built for digital products
- Great developer experience

---

## Webhook Event Structure

When a customer completes a purchase, Lemon Squeezy sends:

```json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "user_id": "cognito-user-id",
      "tier": "starter"
    }
  },
  "data": {
    "id": "order-id",
    "attributes": {
      "total": 5.00,
      "user_email": "customer@example.com",
      "status": "paid"
    }
  }
}
```

Our webhook handler:
1. Verifies signature
2. Extracts user_id and tier
3. Checks if first purchase → applies 2x bonus
4. Adds credits to DynamoDB
5. Records transaction

---

## Troubleshooting

### "Invalid signature" error
- Verify webhook secret is correct
- Check that raw body is being passed (not parsed JSON)
- Test with Lemon Squeezy's webhook tester

### "Credits not added" error
- Check webhook was triggered: https://app.lemonsqueezy.com/settings/webhooks
- View webhook delivery logs in Lemon Squeezy dashboard
- Check Lambda logs: `aws logs tail /aws/lambda/... --follow`

### "No variant ID found" error
- Make sure you exported all variant IDs
- Run `./configure-lemonsqueezy.sh` again
- Verify Lambda environment variables in AWS Console

---

## Development vs Production

### Test Mode:
- Use test mode in Lemon Squeezy dashboard
- Webhooks still fire (to test endpoint)
- No real money charged

### Production Mode:
- Switch to production mode in Lemon Squeezy
- Update webhook URL if needed
- Test with small real purchase

---

## Quick Setup Summary

```bash
# 1. Set all environment variables
export LEMONSQUEEZY_API_KEY='your_api_key'
export LEMONSQUEEZY_WEBHOOK_SECRET='your_webhook_secret'
export LEMONSQUEEZY_STORE_ID='12345'
export LEMONSQUEEZY_VARIANT_STARTER='variant_id_1'
export LEMONSQUEEZY_VARIANT_PRO='variant_id_2'
export LEMONSQUEEZY_VARIANT_ENTERPRISE='variant_id_3'

# 2. Configure Lambda functions
./configure-lemonsqueezy.sh

# 3. Test!
# Go to your frontend → Billing → Purchase → Done!
```

---

## Resources

- **Lemon Squeezy Docs:** https://docs.lemonsqueezy.com/
- **API Reference:** https://docs.lemonsqueezy.com/api
- **Webhook Guide:** https://docs.lemonsqueezy.com/help/webhooks
- **Test Cards:** https://docs.lemonsqueezy.com/help/getting-started/test-mode

---

**🎉 You're all set! Lemon Squeezy integration is complete!**
