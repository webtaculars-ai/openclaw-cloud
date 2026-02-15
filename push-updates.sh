#!/bin/bash

# Push recent updates to GitHub
# This includes the OpenPaw rebrand and website copy updates

echo "🚀 Pushing 3 commits to GitHub..."
echo ""
echo "Commits to be pushed:"
echo "  1. docs: Add executive summary for OpenPaw launch"
echo "  2. rebrand: Complete OpenPaw rebrand with friendly, approachable copy"
echo "  3. feat: Complete pricing strategy, resource specs, and friends & family program"
echo ""

cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if we have unpushed commits
if [ "$(git log origin/master..HEAD --oneline | wc -l)" -eq 0 ]; then
    echo "✅ Already up to date with origin/master"
    exit 0
fi

# Push to GitHub
echo "Pushing to origin/master..."
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 View at: https://github.com/webtaculars-ai/openclaw-cloud"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "   1. Set up GitHub authentication (SSH key or Personal Access Token)"
    echo "   2. Or run: gh auth login"
    echo "   3. Or configure Git credential helper"
fi
