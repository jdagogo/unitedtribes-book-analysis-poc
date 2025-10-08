# United Tribes Fresh v4.5 - Development Branch

**Version**: 4.5-development
**Status**: 🚧 ACTIVE DEVELOPMENT
**Based On**: v4.4-STABLE-CHECKPOINT (commit 59ee77d)
**Last Updated**: October 8, 2025

---

## 🎯 Purpose

This branch is for active development of new features and fixes while keeping v4.4 completely protected as a stable rollback point.

---

## 🛡️ Safe Rollback Points

### Latest Stable: v4.4-STABLE-CHECKPOINT
```bash
git checkout v4.4-STABLE-CHECKPOINT
PORT=3004 npm run dev
```
- **Commit**: 59ee77d
- **Features**: Video thumbnail standardization, book grid optimization, styling documentation
- **Status**: ✅ PRODUCTION READY
- **Documentation**: [ROLLBACK-CARD-v4.4.md](./ROLLBACK-CARD-v4.4.md)

### Previous Stable: v4.3.2-STABLE-ROLLBACK
```bash
git checkout v4.3.2-STABLE-ROLLBACK
PORT=3004 npm run dev
```
- **Commit**: 483adad
- **Features**: Discovery modals complete (pages 4-12)
- **Status**: ✅ PRODUCTION READY
- **Documentation**: [ROLLBACK-CARD-v4.3.2.md](./ROLLBACK-CARD-v4.3.2.md)

---

## 🚀 Quick Start (Development)

```bash
# Make sure you're on the development branch
git checkout v4.5-development

# Install dependencies (if needed)
npm install

# Start development server
PORT=3004 npm run dev

# Access at http://localhost:3004
```

---

## 📦 What's Inherited from v4.4

### Styling Standards
- ✅ Video thumbnails: 18px/700 titles, 16px metadata, responsive images
- ✅ Book grid: 270px minmax for optimal readability
- ✅ Complete styling guide: [DISCOVERY-MODAL-STYLING-STANDARDS.md](./DISCOVERY-MODAL-STYLING-STANDARDS.md)

### Fixed Issues
- ✅ Index page thumbnail images (pages 8, 9, 11, 12)
- ✅ Discovery modal video thumbnails standardized
- ✅ Book card layouts consistent

### Core Features (from v4.3.2)
- ✅ Discovery modals on pages 4-12 with 5-tab structure
- ✅ YouTube video integration
- ✅ HarperCollins book integration
- ✅ Entity highlighting system
- ✅ Cross-media discovery

---

## 🎯 Development Guidelines

### Before Making Changes

1. **Verify current state works**
   ```bash
   PORT=3004 npm run dev
   # Test all features
   ```

2. **Create frequent checkpoints**
   ```bash
   git add .
   git commit -m "Checkpoint: [what you just did]"
   git push origin v4.5-development
   ```

3. **Follow styling standards**
   - Reference: [DISCOVERY-MODAL-STYLING-STANDARDS.md](./DISCOVERY-MODAL-STYLING-STANDARDS.md)
   - Use page 4 (lines 7982-8021) as video thumbnail reference
   - Use page 9 (lines 4498-4650) as book grid reference

4. **Test incrementally**
   - Small changes, frequent testing
   - Watch dev server console for errors
   - Test in browser after each change

---

## 📝 Commit Message Format

Use this format for consistency:

```bash
git commit -m "Brief description of change

Detailed explanation if needed:
- What was changed
- Why it was changed
- What to test

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🔄 Continuous Save Workflow

### Every 30-60 Minutes
```bash
git add .
git commit -m "Checkpoint: [brief description]"
git push origin v4.5-development
```

### End of Day
```bash
git add .
git commit -m "EOD $(date +%Y-%m-%d): [summary of work]"
git tag -a "v4.5-$(date +%Y%m%d)" -m "Development snapshot: $(date +%Y-%m-%d)"
git push origin v4.5-development
git push origin "v4.5-$(date +%Y%m%d)"
```

---

## 🛠 Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Custom modules
- **Backend**: Express.js with TypeScript
- **Build**: Vite
- **Database**: SQLite (local development)
- **Port**: 3004

---

## 📁 Key Files

### Components
- `client/src/components/paginated-book-viewer.tsx` - Main book viewer
- `client/src/components/text-selection-modal.tsx` - Discovery modals
- `client/src/components/discovery-card.tsx` - Media cards

### Pages
- `client/src/pages/home.tsx` - Homepage with version display
- `client/src/pages/auto-sync-chapters.tsx` - Audio sync viewer

### Documentation
- `DISCOVERY-MODAL-STYLING-STANDARDS.md` - **READ THIS** before adding content
- `ROLLBACK-CARD-v4.4.md` - Your safety net
- `SAVE_WORK_WORKFLOW.md` - Git workflow guide

---

## ⚠️ Critical Reminders

1. **Push to GitHub frequently** - Every commit should be pushed
2. **Follow styling standards** - Consistency is key
3. **Test before committing** - Make sure it works
4. **Keep v4.4 as fallback** - Don't hesitate to rollback if needed
5. **Document major changes** - Update this file as you go

---

## 🐛 Known Issues (Inherited)

- Index page (page 2) has display issues after page 7
- Arrow navigation works as workaround
- Priority: Low - can fix in this branch

---

## 📊 Version History Display

The home page now shows:
- **Latest Stable**: v4.4-STABLE-CHECKPOINT (59ee77d) - Green badge
- **Previous Stable**: v4.3.2 (483adad) - Orange badge

This provides clear visibility of rollback points.

---

## 🔗 Important Links

- **GitHub Repo**: https://github.com/jdagogo/unitedtribes-book-analysis-poc
- **Branch**: v4.5-development
- **Stable Rollback**: v4.4-STABLE-CHECKPOINT
- **Previous Stable**: v4.3.2-STABLE-ROLLBACK

---

## 📞 Quick Help

### If Something Breaks
```bash
# Rollback to v4.4
git checkout v4.4-STABLE-CHECKPOINT
PORT=3004 npm run dev
```

### Check Current State
```bash
git status                    # See uncommitted changes
git log --oneline -5         # See recent commits
git branch -a                # See all branches
git tag -l "v4.*"           # See all tags
```

### Verify GitHub Sync
```bash
git log origin/v4.5-development --oneline -1  # Remote
git log --oneline -1                          # Local
# Should match after push
```

---

## 🎯 Next Steps

When this branch is stable and ready for production:

1. **Tag it as stable**
   ```bash
   git tag -a "v4.5-STABLE-CHECKPOINT" -m "Description"
   git push origin v4.5-STABLE-CHECKPOINT
   ```

2. **Create v4.6 development branch**
   ```bash
   git checkout -b v4.6-development
   git push -u origin v4.6-development
   ```

3. **Update documentation**
   - Create ROLLBACK-CARD-v4.5.md
   - Update CLAUDE.md with v4.5 status

---

**Last Updated**: October 8, 2025
**Branch Status**: 🚧 ACTIVE DEVELOPMENT
**Stability**: Protected by v4.4-STABLE-CHECKPOINT
**Safe to Experiment**: YES - v4.4 is fully protected
