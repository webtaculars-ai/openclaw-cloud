# Frontend Deployment Guide

## Current Status

✅ **Frontend built successfully** - Production build in `frontend/build/`  
✅ **S3 bucket created** - `openpaw-frontend-1771074214` in ap-south-1  
✅ **Files uploaded to S3** - All 8 files uploaded  
❌ **Public access blocked** - S3 Block Public Access prevents direct access  
❌ **CloudFront creation blocked** - IAM role lacks CloudFront permissions  

## Options to Complete Deployment

### Option 1: Connect Amplify to GitHub (Recommended - 5 min)

**Manual steps required (browser-based):**

1. Go to AWS Amplify Console:  
   https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4

2. Click "Connect branch"

3. Choose "GitHub" and authorize AWS Amplify

4. Select repository: `webtaculars-ai/openclaw-cloud`

5. Branch: `master`

6. Build settings (already configured):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci --legacy-peer-deps
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/build
       files:
         - '**/*'
   ```

7. Environment variables (already set): ✅
   - `REACT_APP_API_URL`
   - `REACT_APP_AWS_REGION`
   - `REACT_APP_USER_POOL_ID`
   - `REACT_APP_USER_POOL_CLIENT_ID`

8. Click "Save and deploy"

**Result:** Frontend will be live at `https://master.d2spow5okg20j4.amplifyapp.com` in ~5 minutes

---

### Option 2: CloudFront + S3 (Requires IAM permissions)

**If you have admin access:**

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json

# Point to S3 bucket: openpaw-frontend-1771074214
```

**Result:** Frontend will be live at CloudFront domain (e.g., `d1234.cloudfront.net`)

---

### Option 3: Vercel (Alternative - 5 min)

```bash
cd frontend
npm install -g vercel
vercel --prod

# Follow prompts:
# - Project name: openpaw
# - Framework: Create React App
# - Build command: npm run build
# - Output directory: build
```

**Environment variables to set in Vercel dashboard:**
- `REACT_APP_API_URL=https://q8aw4txdoa.execute-api.ap-south-1.amazonaws.com/prod/`
- `REACT_APP_AWS_REGION=ap-south-1`
- `REACT_APP_USER_POOL_ID=ap-south-1_df2Xgk8QR`
- `REACT_APP_USER_POOL_CLIENT_ID=1gcl93s5257olc9kn1rut8uh60`

**Result:** Frontend will be live at `https://openpaw.vercel.app` (or custom domain)

---

## Recommendation

**Use Option 1 (Amplify + GitHub)** because:
- ✅ Amplify app already exists with env vars
- ✅ No IAM permission issues
- ✅ Automatic SSL certificate
- ✅ Automatic builds on git push
- ✅ Easy custom domain setup
- ✅ AWS-native (no external services)

---

## After Deployment

Once frontend is live, you can:

1. **Access the site**: `https://master.d2spow5okg20j4.amplifyapp.com` (or custom domain)
2. **Sign up** for an account
3. **Configure Lemon Squeezy** for payments
4. **Test end-to-end** flow

---

## Custom Domain Setup (openpaw.co)

After frontend is deployed, see: `GODADDY_DOMAIN_SETUP.md`
