# 🚀 CURRENT DEVELOPMENT BRANCH

**Branch:** `v4.3.1-development`
**Base:** v4.3.0 (Stable Rollback Point)
**Created:** October 3, 2025
**Port:** 3004

## Quick Check Commands

```bash
# Always check what branch you're on:
git branch --show-current

# Should output:
# v4.3.1-development
```

## Visual Confirmation

When running `npm run dev`, your terminal shows:
- Local: http://localhost:3004

The app is running on port **3004** on branch **v4.3.1-development**

## To Verify You're on the Right Branch

```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4
git branch --show-current
# Output should be: v4.3.1-development
```

## Safe Rollback Point

If you need to go back to stable v4.3.0:
```bash
git checkout v4.3-development
# or
git checkout v4.3.0
```

## Branch Hierarchy

```
v4.3.0 (STABLE TAG) ← Safe rollback point
    ↓
v4.3-development (STABLE BRANCH) ← Base for new work
    ↓
v4.3.1-development (CURRENT) ← You are here 👈
```

---

**Last Updated:** October 3, 2025
**Status:** ✅ Active Development Branch
