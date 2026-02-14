#!/bin/bash

# Push commits to GitHub - requires authentication
# Run this on your local machine or use GitHub token

echo "🚀 Pushing 8 commits to GitHub..."
echo ""

cd "$(dirname "$0")"

# Show what will be pushed
echo "Commits to push:"
git log origin/master..HEAD --oneline
echo ""

# Count commits
COMMIT_COUNT=$(git log origin/master..HEAD --oneline | wc -l)
echo "Total: $COMMIT_COUNT commits"
echo ""

# Push
echo "Pushing to origin/master..."
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed $COMMIT_COUNT commits!"
    echo "🔗 https://github.com/webtaculars-ai/openclaw-cloud"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Try these solutions:"
    echo ""
    echo "1. If using HTTPS (username/password):"
    echo "   - Generate Personal Access Token: https://github.com/settings/tokens"
    echo "   - Use token as password when prompted"
    echo ""
    echo "2. If using SSH:"
    echo "   git remote set-url origin git@github.com:webtaculars-ai/openclaw-cloud.git"
    echo "   git push origin master"
    echo ""
    echo "3. Using GitHub CLI:"
    echo "   gh auth login"
    echo "   git push origin master"
fi
