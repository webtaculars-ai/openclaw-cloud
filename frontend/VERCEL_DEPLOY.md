# 🚀 Deploy OpenClaw Cloud Frontend to Vercel

## ✨ Free Deployment - No Credit Card Required

This frontend is configured to run in **demo mode** with mock data, perfect for showcasing the UI without deploying the backend.

---

## 🎯 Option 1: Deploy via Vercel Dashboard (Recommended - 2 minutes)

### Step 1: Push to GitHub
```bash
cd /path/to/openclaw-cloud
git init
git add .
git commit -m "OpenClaw Cloud frontend"
git remote add origin https://github.com/YOUR_USERNAME/openclaw-cloud.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `openclaw-cloud` repository
4. Configure project:
   - **Project Name:** `openclaw-cloud`
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
5. Click **"Deploy"**

**Done!** Your site will be live at `https://openclaw-cloud.vercel.app` in ~2 minutes.

---

## 🎯 Option 2: Deploy via CLI

### Prerequisites
```bash
npm install -g vercel
```

### Deploy
```bash
cd openclaw-cloud/frontend
vercel login    # Opens browser to authenticate
vercel          # Follow prompts, accept defaults
```

**Live URL:** You'll receive a URL like `https://openclaw-cloud-abc123.vercel.app`

---

## 🎨 What You'll Get

### Demo Mode Features
- ✅ **Fully functional UI** - All pages and components working
- ✅ **Mock data** - Pre-populated agent, credits, transactions
- ✅ **No backend required** - Works standalone
- ✅ **Demo banner** - Shows visitors it's a preview

### Pages Included
1. **Landing Page** (`/`)
   - Hero section with pricing
   - How it works (3 steps)
   - Pricing tiers
   
2. **Dashboard** (`/dashboard`)
   - Agent status card
   - Credit meter
   - Mock balance: $10.00
   
3. **Agent Setup** (`/setup`)
   - Telegram bot wizard
   - Token input (mock validation)
   
4. **Billing** (`/billing`)
   - Credit balance
   - Recharge tiers
   - Transaction history

---

## ⚙️ Configuration

### Enable Real Backend (Optional)

When you deploy the backend, update environment variables in Vercel:

```bash
# Via CLI
vercel env add REACT_APP_API_URL
# Enter: https://your-api-gateway-url

vercel env add REACT_APP_USER_POOL_ID
# Enter: your-cognito-pool-id

vercel env add REACT_APP_USER_POOL_CLIENT_ID
# Enter: your-cognito-client-id

vercel env add REACT_APP_AWS_REGION
# Enter: us-east-1

vercel env rm REACT_APP_MOCK_MODE  # Remove mock mode

# Redeploy
vercel --prod
```

**Or via Vercel Dashboard:**
1. Go to your project settings
2. Click **"Environment Variables"**
3. Add the variables above
4. Redeploy

---

## 🎭 Mock Mode vs Real Mode

### Mock Mode (Current)
- ✅ No backend needed
- ✅ Works immediately
- ✅ Great for demos
- ❌ No real authentication
- ❌ No real billing
- ❌ No agent provisioning

### Real Mode (After Backend Deploy)
- ✅ Full authentication (Cognito)
- ✅ Real Stripe payments
- ✅ Agent provisioning
- ✅ Credit tracking
- ✅ Transaction history

---

## 🔧 Troubleshooting

### Build Fails on Vercel
**Issue:** TypeScript errors
**Fix:** Already configured with relaxed TypeScript (`strict: false`)

### Blank Page After Deploy
**Issue:** Incorrect root directory
**Fix:** Ensure **Root Directory** is set to `frontend` in Vercel settings

### API Errors Showing
**Issue:** Mock mode not enabled
**Fix:** Check `REACT_APP_MOCK_MODE=true` is set in environment variables

---

## 📊 Vercel Free Tier Limits

- ✅ **Bandwidth:** 100GB/month
- ✅ **Build time:** 100 hours/month
- ✅ **Deployments:** Unlimited
- ✅ **Custom domain:** 1 free (optional)
- ✅ **SSL:** Automatic & free

**Your site will stay free forever** as long as you stay within these limits (which is easy for a demo/portfolio project).

---

## 🎉 What's Next?

1. ✅ **Deploy frontend to Vercel** (you are here)
2. **Share your demo:** `https://openclaw-cloud.vercel.app`
3. **Optional:** Deploy backend to AWS (uses free tier)
4. **Optional:** Connect real backend to frontend

---

## 📞 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **This Project Docs:** See main README.md

---

**🚀 Ready to deploy? Just push to GitHub and import to Vercel!**
