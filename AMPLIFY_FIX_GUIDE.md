# Quick Fix Guide - Connect Amplify to GitHub

## Problem
The Amplify app was created without a Git repository connection, making manual deployments unreliable. The site is currently returning 404.

## Solution: Connect to GitHub

### Step 1: Get GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (full control)
   - `admin:repo_hook` (for webhooks)
4. Copy the token

### Step 2: Connect Amplify to GitHub (AWS Console)
1. Go to: https://console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4
2. Click "App settings" → "General"
3. Under "Repository", click "Connect repository"
4. Select "GitHub"
5. Paste your token
6. Select repository: `webtaculars-ai/openclaw-cloud`
7. Select branch: `master`
8. Configure build settings (use existing amplify.yml or the buildSpec in the app)

### Step 3: Trigger Build
Once connected, Amplify will automatically:
- Pull code from GitHub
- Run `npm ci` and `npm run build` in the frontend directory
- Deploy to CloudFront
- The environment variables are already configured!

## Alternative: Manual Fix via CLI

```bash
# Install Amplify CLI if needed
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Link app
amplify pull --appId d2spow5okg20j4 --envName master

# Connect to Git (this updates the app configuration)
# Then push changes and Amplify will auto-deploy
```

## Why This Fixes It

1. ✅ Proper build process (not manual deployment)
2. ✅ Environment variables already configured in Amplify
3. ✅ CloudFront and certificates already set up
4. ✅ DNS already pointing to the right place
5. ✅ Auto-deploys on future Git pushes

## Expected Timeline
- Connect repository: 2 minutes
- First build: 3-5 minutes
- Site live: ~5-7 minutes total

The `.env.example` file I created documents the correct values, and Amplify already has them configured in environment variables.
