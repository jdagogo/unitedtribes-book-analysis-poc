# Continuous Save Workflow for v4.4 Development

This workflow ensures you never lose work while developing v4.4.

## Every 30-60 Minutes: Quick Checkpoint

After making any meaningful change (adding a feature, fixing a bug, etc.):

```bash
# Save everything
git add .

# Create a checkpoint commit
git commit -m "Checkpoint: [brief description]"

# Push to GitHub immediately
git push origin v4.4-development
```

**Examples:**
- `git commit -m "Checkpoint: added Blue Note gallery component"`
- `git commit -m "Checkpoint: fixed audio player sync issue"`
- `git commit -m "Checkpoint: updated entity highlighting colors"`

## End of Day: Meaningful Save

At the end of each work session:

```bash
# Save everything
git add .

# Create a descriptive end-of-day commit
git commit -m "EOD [date]: [summary of what you accomplished]"

# Push to GitHub
git push origin v4.4-development

# Create a dated tag for easy recovery
git tag -a "v4.4-$(date +%Y%m%d)" -m "Development snapshot: $(date +%Y-%m-%d)"
git push origin "v4.4-$(date +%Y%m%d)"
```

**Example:**
```bash
git commit -m "EOD 2025-10-07: Completed Blue Note integration, started audio sync refactor"
git tag -a "v4.4-20251007" -m "Development snapshot: 2025-10-07"
git push origin "v4.4-20251007"
```

## Before Starting New Feature: Create Feature Branch

When starting something experimental or risky:

```bash
# Make sure v4.4-development is clean
git add .
git commit -m "Checkpoint: before starting [feature-name]"
git push origin v4.4-development

# Create a feature branch
git checkout -b feature/[feature-name]

# Work on your feature...
# Commit regularly on the feature branch

# When done and tested, merge back:
git checkout v4.4-development
git merge feature/[feature-name]
git push origin v4.4-development
```

## Verify Your Work is on GitHub

After any push, verify it worked:

```bash
# Check the last commit on GitHub's version of v4.4-development
git log origin/v4.4-development --oneline -1

# Make sure it matches your local version
git log --oneline -1
```

If they match, your work is safely backed up! ✅

## Quick Recovery Commands

If you need to see your recent saves:

```bash
# See last 10 commits
git log --oneline -10

# See all your dated tags
git tag -l "v4.4-*"

# Go back to yesterday's snapshot
git checkout v4.4-20251006  # (use actual date)
```

## Emergency: Lost Work Recovery

If something goes wrong:

1. **Check if your changes are committed locally:**
   ```bash
   git log --oneline -5
   ```

2. **If committed but not pushed, push now:**
   ```bash
   git push origin v4.4-development
   ```

3. **If not committed, check for uncommitted changes:**
   ```bash
   git status
   ```

4. **Save uncommitted work immediately:**
   ```bash
   git add .
   git commit -m "Emergency save: recovering work"
   git push origin v4.4-development
   ```

## Rules to Never Lose Work

✅ **DO:**
- Commit every 30-60 minutes minimum
- Push to GitHub immediately after committing
- Create end-of-day tags
- Test your changes before committing

❌ **DON'T:**
- Go more than an hour without committing
- Forget to push to GitHub
- Work on the main branch for risky experiments
- Delete branches without checking they're merged

---
**Current Development Branch**: v4.4-development  
**Stable Rollback**: v4.3.2-STABLE-ROLLBACK (commit 483adad)  
**Repository**: https://github.com/jdagogo/unitedtribes-book-analysis-poc
