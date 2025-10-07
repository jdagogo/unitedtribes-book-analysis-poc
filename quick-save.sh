#!/bin/bash
# Quick save script for v4.4 development

echo "🔄 Quick Save Starting..."

# Add all changes
git add .

# Ask for commit message
echo ""
read -p "Describe what you just did: " message

if [ -z "$message" ]; then
  echo "❌ No message provided. Aborting."
  exit 1
fi

# Commit with timestamp
git commit -m "Checkpoint: $message"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin v4.4-development

# Verify
echo ""
echo "✅ Save complete! Last commit:"
git log --oneline -1

echo ""
echo "🔍 Verify on GitHub:"
git log origin/v4.4-development --oneline -1
