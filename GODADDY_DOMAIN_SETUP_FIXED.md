# Fixed: GoDaddy Domain Setup for OpenPaw (openpaw.co)

## Problem: GoDaddy doesn't support CNAME for root (@) domain

**GoDaddy limitation:** Cannot use CNAME for apex/root domain (openpaw.co)  
**Solution:** Use Route 53 OR use Amplify's IP addresses with A records

---

## Solution 1: Use AWS Route 53 (RECOMMENDED)

Route 53 supports ALIAS records which work like CNAME for root domains.

### Step 1: Create Route 53 Hosted Zone

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name openpaw.co \
  --caller-reference "openpaw-$(date +%s)" \
  --region ap-south-1
```

This will return:
- **Hosted Zone ID**: Z0123456789ABC
- **Name servers**: ns-1234.awsdns-12.org, etc. (4 name servers)

### Step 2: Update GoDaddy Name Servers

1. **Go to GoDaddy Domain Settings:**  
   https://dcc.godaddy.com/control/portfolio/openpaw.co/settings

2. **Click "Nameservers"** → "Change"

3. **Select "Custom"**

4. **Enter AWS Route 53 name servers** (from Step 1):
   ```
   ns-1234.awsdns-12.org
   ns-5678.awsdns-34.co.uk
   ns-9012.awsdns-56.com
   ns-3456.awsdns-78.net
   ```

5. **Save**

### Step 3: Add DNS Records in Route 53

Once Amplify custom domain is configured, it will provide a CloudFront domain like:
`d111111abcdef8.cloudfront.net`

**In Route 53, create:**

1. **Root domain (openpaw.co):**
   ```
   Type: A (ALIAS)
   Name: openpaw.co
   Alias Target: d111111abcdef8.cloudfront.net
   ```

2. **WWW subdomain:**
   ```
   Type: CNAME
   Name: www.openpaw.co
   Value: d111111abcdef8.cloudfront.net
   ```

**Result:** Both `openpaw.co` and `www.openpaw.co` work! ✅

---

## Solution 2: Subdomain Only (Quick Fix)

If you want to avoid Route 53 setup, use a subdomain instead:

### Option A: Use `app.openpaw.co`

**In GoDaddy DNS:**
```
Type: CNAME
Name: app
Value: master.d2spow5okg20j4.amplifyapp.com
TTL: 600
```

**Result:** `https://app.openpaw.co` works! ✅

**In Amplify:**
- Add custom domain: `app.openpaw.co` (not root)

### Option B: Use `www.openpaw.co` as primary

**In GoDaddy DNS:**
```
Type: CNAME
Name: www
Value: master.d2spow5okg20j4.amplifyapp.com
TTL: 600

Type: URL Redirect (GoDaddy forwarding)
From: openpaw.co
To: https://www.openpaw.co
```

**Result:** `openpaw.co` → redirects to → `www.openpaw.co` ✅

---

## Solution 3: Use Amplify's CloudFront IP (Not Recommended)

Amplify uses CloudFront which has dynamic IPs. This is fragile but possible:

1. **Get CloudFront distribution IPs** (changes occasionally)
2. **Add A records** in GoDaddy pointing to those IPs
3. **Risk:** If AWS changes IPs, your site breaks

**Not recommended** - use Route 53 instead.

---

## Recommended Approach

### For Production: Use Route 53

**Pros:**
- ✅ Works with root domain (openpaw.co)
- ✅ ALIAS records are native to AWS
- ✅ Automatic failover and health checks
- ✅ No IP address changes to worry about
- ✅ Integrates perfectly with Amplify/CloudFront

**Cons:**
- ❌ Costs $0.50/month per hosted zone
- ❌ Small per-query charges (~$0.40 per million queries)

**Total cost:** ~$0.50/month (negligible for a SaaS)

### For Quick Testing: Use Subdomain

**Use:** `app.openpaw.co` with CNAME in GoDaddy  
**Pro:** Free, works immediately  
**Con:** Not as clean as root domain

---

## Step-by-Step: Route 53 Setup

### 1. Create Hosted Zone

```bash
aws route53 create-hosted-zone \
  --name openpaw.co \
  --caller-reference "openpaw-$(date +%s)" \
  --region us-east-1
```

### 2. Get Name Servers

```bash
aws route53 get-hosted-zone \
  --id Z0123456789ABC \
  --query 'DelegationSet.NameServers' \
  --output table
```

### 3. Update GoDaddy

- Go to: https://dcc.godaddy.com/control/portfolio/openpaw.co/settings
- Nameservers → Custom → Enter 4 AWS name servers
- Save

### 4. Wait for DNS Propagation (1-48 hours, usually 1-4 hours)

```bash
dig openpaw.co NS
# Should show AWS name servers
```

### 5. Add Custom Domain in Amplify

- Amplify Console → Domain management → Add domain
- Enter: `openpaw.co`
- Amplify will detect Route 53 and auto-create DNS records! ✅

### 6. Amplify Will Automatically:
- Create SSL certificate
- Add A (ALIAS) record for root
- Add CNAME for www
- Verify and enable HTTPS

**Result:** `https://openpaw.co` works in ~1 hour! 🎉

---

## Quick Comparison

| Method | Cost | Time | Root Domain | Notes |
|--------|------|------|-------------|-------|
| **Route 53** | $0.50/mo | 1-4 hrs | ✅ Yes | Best for production |
| **Subdomain (app)** | Free | 5 min | ❌ No | Quick testing |
| **WWW + redirect** | Free | 10 min | ⚠️ Redirect | Acceptable |

---

## My Recommendation

**Use Route 53** because:
1. ✅ Clean root domain (openpaw.co)
2. ✅ Professional
3. ✅ AWS-native integration
4. ✅ Auto-configured by Amplify
5. ✅ Cost is negligible ($0.50/month)

---

## Implementation Steps

**Choose one:**

### A. Route 53 (Production)
1. Create hosted zone (see above)
2. Update GoDaddy name servers
3. Wait 1-4 hours
4. Add custom domain in Amplify
5. Amplify auto-configures everything

**Time:** 1-4 hours (mostly waiting for DNS)  
**Cost:** $0.50/month

### B. Subdomain (Quick Test)
1. Add CNAME in GoDaddy: `app → master.d2spow5okg20j4.amplifyapp.com`
2. Add custom domain in Amplify: `app.openpaw.co`
3. Wait 5-10 minutes

**Time:** 10 minutes  
**Cost:** Free

---

## What Should We Do?

Would you like me to:

1. **Create Route 53 hosted zone** and give you name servers for GoDaddy?
2. **Use subdomain** (`app.openpaw.co`) for quick testing?
3. **Use WWW** with redirect from root?

Let me know your preference and I'll proceed! 🚀
