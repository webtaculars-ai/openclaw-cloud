#!/bin/bash

# Push commits to GitHub
# This needs to be run on a machine with GitHub credentials

echo "🚀 Pushing OpenClaw Cloud fixes to GitHub..."
echo ""

cd "$(dirname "$0")"

# Check if we have unpushed commits
UNPUSHED=$(git log origin/master..HEAD --oneline)

if [ -z "$UNPUSHED" ]; then
    echo "✅ No unpushed commits. Everything is up to date!"
    exit 0
fi

echo "📝 Unpushed commits:"
echo "$UNPUSHED"
echo ""

# Try to push
echo "Pushing to GitHub..."
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 https://github.com/webtaculars-ai/openclaw-cloud"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "  1. Configure GitHub credentials"
    echo "  2. Use SSH instead of HTTPS"
    echo "  3. Generate a personal access token"
    echo ""
    echo "Quick fix - use SSH:"
    echo "  git remote set-url origin git@github.com:webtaculars-ai/openclaw-cloud.git"
    echo "  git push"
fi
