# 🌐 Connect openpaw.co to AWS Amplify

## Overview
Connect your GoDaddy domain `openpaw.co` to AWS Amplify app `d2spow5okg20j4`

---

## Step 1: Add Custom Domain in AWS Amplify (5 minutes)

### Via AWS Console:

1. Go to: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
2. Click **"Domain management"** in the left sidebar
3. Click **"Add domain"**
4. Enter domain: `openpaw.co`
5. Click **"Configure domain"**
6. Amplify will show you DNS records to add

### Via AWS CLI:

```bash
aws amplify create-domain-association \
  --app-id d2spow5okg20j4 \
  --region ap-south-1 \
  --domain-name openpaw.co \
  --sub-domain-settings prefix=www,branchName=master \
  --sub-domain-settings prefix="",branchName=master
```

Amplify will generate SSL certificate and provide DNS records.

---

## Step 2: Get DNS Records from Amplify

After adding the domain, Amplify will provide records like:

**For CNAME verification:**
```
Type: CNAME
Name: _abc123def456
Value: _xyz789.acm-validations.aws.
```

**For the domain:**
```
Type: CNAME
Name: openpaw.co (or @)
Value: d2spow5okg20j4.amplifyapp.com
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: d2spow5okg20j4.amplifyapp.com
```

---

## Step 3: Configure DNS in GoDaddy (10 minutes)

### Manual Method:

1. Go to: https://dcc.godaddy.com/
2. Login with your GoDaddy credentials
3. Find domain: **openpaw.co**
4. Click **"DNS"** or **"Manage DNS"**
5. Add the CNAME records from Amplify:

   **Record 1: SSL Verification**
   - Type: `CNAME`
   - Name: `_abc123def456` (from Amplify)
   - Value: `_xyz789.acm-validations.aws.` (from Amplify)
   - TTL: `600` seconds

   **Record 2: Root Domain**
   - Type: `CNAME`
   - Name: `@`
   - Value: `d2spow5okg20j4.amplifyapp.com`
   - TTL: `600` seconds

   **Record 3: WWW Subdomain**
   - Type: `CNAME`
   - Name: `www`
   - Value: `d2spow5okg20j4.amplifyapp.com`
   - TTL: `600` seconds

6. Click **"Save"**

### Using Browser Automation (Advanced):

If you have the devops agent skill with browser automation:

```bash
# Use OpenClaw to automate GoDaddy DNS configuration
openclaw agents spawn devops --task "
Log into GoDaddy at https://dcc.godaddy.com/
Navigate to domain openpaw.co DNS settings
Add CNAME records for Amplify:
- _abc123def456 -> _xyz789.acm-validations.aws.
- @ -> d2spow5okg20j4.amplifyapp.com
- www -> d2spow5okg20j4.amplifyapp.com
Save changes
"
```

---

## Step 4: Wait for SSL Certificate (15-30 minutes)

1. Go back to Amplify console
2. Check domain status: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4/settings/domains
3. Status will show:
   - **"Creating"** → Amplify is requesting SSL certificate
   - **"Pending Verification"** → Waiting for DNS propagation
   - **"Available"** → ✅ Ready!

Monitor with:
```bash
aws amplify get-domain-association \
  --app-id d2spow5okg20j4 \
  --domain-name openpaw.co \
  --region ap-south-1 \
  --query 'domainAssociation.domainStatus'
```

---

## Step 5: Deploy Frontend to Amplify

Before the domain works, you need to deploy the frontend:

```bash
# Connect GitHub to Amplify
cd /path/to/openclaw-cloud

# Push latest code if needed
git push

# In AWS Amplify Console:
# 1. Go to: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
# 2. Click "Connect branch"
# 3. Select GitHub → webtaculars-ai/openclaw-cloud
# 4. Branch: master
# 5. Build settings:
#    - Base directory: frontend
#    - Build command: npm run build
#    - Output directory: build
# 6. Deploy
```

Or use Amplify CLI:
```bash
npm install -g @aws-amplify/cli

amplify init \
  --appId d2spow5okg20j4 \
  --region ap-south-1

amplify publish
```

---

## Step 6: Verify Everything Works

### Check DNS Propagation:
```bash
# Check if DNS is propagated
dig openpaw.co CNAME
dig www.openpaw.co CNAME

# Or use online tool
# https://dnschecker.org/#CNAME/openpaw.co
```

### Test the Site:
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://openpaw.co

# Test HTTPS
curl -I https://openpaw.co

# Should return 200 OK
```

### Browser Test:
1. Go to: https://openpaw.co
2. Should show your OpenClaw Cloud frontend
3. SSL certificate should be valid (green lock)
4. www.openpaw.co should also work

---

## Troubleshooting

### "DNS not propagating"
- Wait up to 48 hours (usually 15-30 minutes)
- Check: https://dnschecker.org/#CNAME/openpaw.co
- GoDaddy TTL is 600 seconds (10 minutes minimum)

### "SSL certificate not issued"
- Verify CNAME verification record is correct
- Check Amplify console for errors
- May need to delete and re-add domain

### "Site not loading"
- Ensure frontend is deployed to Amplify
- Check Amplify build logs
- Verify environment variables are set

### "CNAME not allowed for root domain"
**GoDaddy Issue:** Root domain (@) cannot be CNAME

**Solution - Use ALIAS/ANAME:**
- GoDaddy doesn't support ALIAS records
- Options:
  1. Use A record with Amplify IP (changes occasionally)
  2. Use subdomain only (www.openpaw.co)
  3. Use Cloudflare DNS (supports CNAME flattening)

**Recommended:** Switch to Cloudflare DNS:
1. Add site to Cloudflare (free)
2. Update GoDaddy nameservers to Cloudflare
3. Add CNAME records in Cloudflare
4. Cloudflare automatically flattens CNAMEs for root domain

---

## Alternative: Use Route 53 (Better Solution)

AWS Route 53 supports ALIAS records for root domains:

```bash
# 1. Create hosted zone
aws route53 create-hosted-zone \
  --name openpaw.co \
  --caller-reference $(date +%s)

# 2. Get nameservers
aws route53 get-hosted-zone \
  --id YOUR_ZONE_ID \
  --query 'DelegationSet.NameServers'

# 3. Update GoDaddy nameservers to Route 53 nameservers

# 4. Create ALIAS record pointing to Amplify
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://alias-record.json
```

**alias-record.json:**
```json
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "openpaw.co",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d2spow5okg20j4.amplifyapp.com",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

---

## Quick Start Commands

```bash
# 1. Add domain to Amplify
aws amplify create-domain-association \
  --app-id d2spow5okg20j4 \
  --region ap-south-1 \
  --domain-name openpaw.co \
  --sub-domain-settings prefix=www,branchName=master \
  --sub-domain-settings prefix="",branchName=master

# 2. Get DNS records to add to GoDaddy
aws amplify get-domain-association \
  --app-id d2spow5okg20j4 \
  --domain-name openpaw.co \
  --region ap-south-1

# 3. Check status
watch -n 30 'aws amplify get-domain-association \
  --app-id d2spow5okg20j4 \
  --domain-name openpaw.co \
  --region ap-south-1 \
  --query "domainAssociation.domainStatus"'
```

---

## Expected Timeline

| Step | Time |
|------|------|
| Add domain to Amplify | 2 min |
| Configure GoDaddy DNS | 10 min |
| DNS propagation | 15-30 min |
| SSL certificate issued | 10-20 min |
| **Total** | **~45 minutes** |

---

## Summary

**Your setup:**
- Domain: `openpaw.co` (GoDaddy)
- Amplify App: `d2spow5okg20j4`
- Target: `https://openpaw.co` → OpenClaw Cloud frontend

**Status:**
- [ ] Domain added to Amplify
- [ ] DNS records configured in GoDaddy
- [ ] SSL certificate issued
- [ ] Frontend deployed
- [ ] Domain accessible

**Next:** Follow Step 1 to add the domain in Amplify Console!
