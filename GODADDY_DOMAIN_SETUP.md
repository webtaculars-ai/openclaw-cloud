# GoDaddy Domain Setup for OpenPaw (openpaw.co)

## Prerequisites

✅ Frontend deployed (Amplify, Vercel, or CloudFront)  
✅ Domain registered: openpaw.co on GoDaddy  

## Setup Steps

### Step 1: Get Your Frontend URL

**If using Amplify:**
- Default: `https://master.d2spow5okg20j4.amplifyapp.com`
- CloudFront domain for custom domain: Will be provided by Amplify

**If using Vercel:**
- Domain: `https://openpaw.vercel.app`
- Or use Vercel's custom domain feature

**If using CloudFront:**
- Domain: `https://dXXXXXXXXXX.cloudfront.net`

---

### Step 2: Request SSL Certificate (For Amplify/CloudFront)

**Amplify Custom Domain (Automated):**

1. Go to Amplify Console:  
   https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4

2. Click "Domain management" → "Add domain"

3. Enter: `openpaw.co`

4. Amplify will automatically:
   - Request ACM certificate
   - Provide DNS records to add
   - Verify domain ownership
   - Enable HTTPS

5. Amplify will show records like:
   ```
   Type: CNAME
   Name: _xxxxxxxxxxxxx.openpaw.co
   Value: _yyyyyyyyyyy.acm-validations.aws
   ```

6. Add this CNAME record in GoDaddy (see Step 3)

7. Wait for verification (~5-10 minutes)

8. Amplify will provide final DNS records:
   ```
   Type: CNAME
   Name: openpaw.co
   Value: master.d2spow5okg20j4.amplifyapp.com
   
   Type: CNAME
   Name: www.openpaw.co
   Value: master.d2spow5okg20j4.amplifyapp.com
   ```

---

### Step 3: Update GoDaddy DNS Records

**Manual Steps (GoDaddy Dashboard):**

1. Go to GoDaddy DNS Management:  
   https://dcc.godaddy.com/control/portfolio/openpaw.co/settings?tab=dns

2. Click "DNS" → "Manage DNS"

3. Delete default records (if any):
   - Delete default A records
   - Delete default CNAME www record

4. Add verification CNAME (from Step 2):
   ```
   Type: CNAME
   Name: _xxxxxxxxxxxxx
   Value: _yyyyyyyyyyy.acm-validations.aws
   TTL: 600 seconds (10 min)
   ```

5. Wait for SSL verification (~5-10 minutes)

6. Once verified, add final records:

   **Root domain (openpaw.co):**
   ```
   Type: CNAME
   Name: @
   Value: master.d2spow5okg20j4.amplifyapp.com
   TTL: 600 seconds
   ```

   **WWW subdomain (www.openpaw.co):**
   ```
   Type: CNAME
   Name: www
   Value: master.d2spow5okg20j4.amplifyapp.com
   TTL: 600 seconds
   ```

7. Save changes

---

### Step 4: Verify Domain

**Wait for DNS propagation** (5-30 minutes):

```bash
# Check if DNS is updated
dig openpaw.co
dig www.openpaw.co

# Expected output should show Amplify CloudFront domain
```

**Test in browser:**
1. Go to `https://openpaw.co`
2. Should redirect to HTTPS automatically
3. Should show OpenPaw frontend

---

## Alternative: Browser Automation for GoDaddy

If you want to automate the DNS record updates, I can use browser automation:

```bash
# Use OpenClaw devops agent with browser automation
# to log into GoDaddy and update DNS records automatically
```

**Would you like me to:**
1. Use browser to log into GoDaddy?
2. Automatically add DNS records?
3. Verify the updates?

---

## Troubleshooting

### Issue: "Domain not found"
- **Solution:** Check DNS propagation with `dig openpaw.co`
- **Wait:** DNS can take up to 48 hours (usually 5-30 min)

### Issue: "Certificate not verified"
- **Solution:** Verify CNAME record was added correctly in GoDaddy
- **Check:** Amplify console should show "Certificate status: Issued"

### Issue: "Redirect loop"
- **Solution:** Make sure you're using CNAME, not A record
- **Check:** GoDaddy "Forwarding" should be disabled

### Issue: "Mixed content warning"
- **Solution:** Make sure API URL uses HTTPS: `https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/`
- **Check:** Frontend env vars in Amplify

---

## DNS Record Summary (Final State)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | master.d2spow5okg20j4.amplifyapp.com | 600 |
| CNAME | www | master.d2spow5okg20j4.amplifyapp.com | 600 |

**Optional (after verification is complete):**
- Delete: `_xxxxxxxxxxxxx` CNAME (ACM validation record)

---

## Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Frontend deployment | 5 min | 🟡 Pending |
| Add custom domain in Amplify | 1 min | 🟡 Pending |
| Add verification CNAME | 2 min | 🟡 Pending |
| SSL verification | 5-10 min | 🟡 Pending |
| Add final DNS records | 2 min | 🟡 Pending |
| DNS propagation | 5-30 min | 🟡 Pending |
| **Total** | **20-50 min** | 🟡 Pending |

---

## After Domain is Live

✅ https://openpaw.co → Your frontend  
✅ https://www.openpaw.co → Your frontend  
✅ HTTPS enabled automatically  
✅ SSL certificate auto-renewed by AWS  

---

## Quick Start Commands

**Check DNS:**
```bash
dig openpaw.co
nslookup openpaw.co
```

**Check SSL:**
```bash
curl -I https://openpaw.co
```

**Test frontend:**
```bash
open https://openpaw.co
```

---

## Notes

- GoDaddy's default "@" record should point to Amplify CloudFront distribution
- WWW is optional but recommended for better UX
- SSL certificate is free and auto-renewed by AWS
- DNS changes can take 5-30 minutes (sometimes up to 48 hours)

---

**Ready to proceed?** Let's:
1. ✅ Deploy frontend to Amplify (Option 1)
2. ✅ Add custom domain in Amplify console
3. ✅ Update GoDaddy DNS records
4. ✅ Wait for propagation
5. ✅ Test https://openpaw.co

**Time estimate:** 45 minutes total
