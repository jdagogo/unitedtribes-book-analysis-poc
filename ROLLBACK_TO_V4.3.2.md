# How to Rollback to v4.3.2 Stable Version

## Quick Rollback (Recommended)

If you need to get back to the stable v4.3.2 version:

```bash
# Navigate to project
cd ~/Desktop/my-claude/united-tribes-fresh-v4

# Checkout the stable tag
git checkout v4.3.2-STABLE-ROLLBACK

# Verify you're on the right version
git log --oneline -1
# Should show: 483adad Add comprehensive documentation for v4.3.2 stable rollback point
```

## Alternative Rollback (If tag doesn't work)

```bash
# Checkout by commit hash
git checkout 483adad

# Verify
git log --oneline -1
```

## Verify You're on Stable v4.3.2

After rollback, confirm with these commands:

```bash
# Check current commit
git log --oneline -1
# Expected: 483adad

# Check if you're in detached HEAD state
git branch --show-current
# If empty, you're in detached HEAD (this is normal for tag checkout)

# Check what tag you're on
git describe --tags
# Expected: v4.3.2-STABLE-ROLLBACK
```

## Restart the Application from v4.3.2

```bash
# Start the development server
PORT=3004 npm run dev

# Application should start on port 3004
```

## What Should Be Working in v4.3.2

✅ Expected features in this stable version:
- **Discovery modals on pages 4-12** (all working)
- **5-tab consistent structure** across all modals (Featured, Read, Watch, Music, United AI Explorer)
- **Page 4**: Blue Note Chiefs with 2 featured videos
- **Page 5**: Personnel page with clickable entities (Thelonious Monk, Herbie Hancock)
- **Page 6**: Cover Story modal
- **Page 7**: John Coltrane Blue Train modal
- **Page 8**: Thelonious Monk modal
- **Page 9**: Dexter Gordon with 2 featured videos
- **Pages 10, 11, 12**: Empty templates ready for content
- Optimized spacing and layouts
- Zero breaking changes from base

## Return to v4.4 Development

When you want to go back to development work:

```bash
git checkout v4.4-development

# Verify
git log --oneline -1
# Expected: 471d5b8 Update Media Hub version marker to v4.3.2 | Commit: 483adad
```

## Important Notes

- **v4.3.2-STABLE-ROLLBACK** is your safety point - it's tagged and will never move
- **v4.4-development** is your active development branch - it will continue to get new commits
- Always commit your work on v4.4-development before switching branches
- You can always return to v4.3.2 using the commands above

## Emergency Recovery

If something goes wrong on v4.4-development:

1. Checkout stable: `git checkout v4.3.2-STABLE-ROLLBACK`
2. Create new development branch: `git checkout -b v4.4-recovery`
3. Start fresh from the stable point

---
**Stable Commit**: 483adad  
**Tag**: v4.3.2-STABLE-ROLLBACK  
**Date**: October 6, 2025  
**GitHub**: https://github.com/jdagogo/unitedtribes-book-analysis-poc
