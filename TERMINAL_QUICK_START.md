# United Tribes Fresh v4.0 - Terminal Quick Start

## 🚨 IMPORTANT: Issues We Just Solved

### The Problem
- Multiple competing npm processes were failing to start v4.0
- Port 3004 wasn't responding despite appearing to run
- `npm run dev` was creating conflicting background processes
- `tsx` dependency issues with corrupted node_modules

### The Solution
```bash
# Kill all competing processes
killall -9 node npm tsx 2>/dev/null || true

# Clean reinstall dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install esbuild
npm install

# Start v4.0 using npx directly (NOT npm run dev)
NODE_ENV=development PORT=3004 npx tsx server/index.ts
```

## ✅ Current Status
- **v4.0 is running on port 3004**
- **v3.0 remains untouched on port 3000**
- **Process ID: Check with `lsof -i :3004`**

## 🏗 Architecture Overview

### Version Separation
```
/Users/j.d.heilprin/Desktop/my-claude/
├── united-tribes-fresh/        # v3.0 STABLE (DO NOT MODIFY)
│   ├── Port: 3000
│   ├── Branch: main
│   └── Status: Production Ready
│
└── united-tribes-fresh-v4/     # v4.0 DEVELOPMENT (ALL CHANGES HERE)
    ├── Port: 3004
    ├── Branch: v4-development
    ├── Status: Active Development
    └── Isolation: Complete separation from v3.0
```

### Key Differences
| Aspect | v3.0 (Stable) | v4.0 (Development) |
|--------|---------------|-------------------|
| **Directory** | `/united-tribes-fresh` | `/united-tribes-fresh-v4` |
| **Port** | 3000 | 3004 |
| **URL** | http://localhost:3000 | http://localhost:3004 |
| **Modifications** | ❌ NEVER | ✅ ALL CHANGES |

## 🚀 Starting v4.0 in New Terminal

### Method 1: Direct Start (Recommended)
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4
NODE_ENV=development PORT=3004 npx tsx server/index.ts
```

### Method 2: npm script (if no conflicts)
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4
npm run dev
```

### If Port 3004 Issues Occur
```bash
# Check what's running
lsof -i :3004

# Kill competing processes
killall -9 node npm tsx 2>/dev/null || true

# Wait 3 seconds, then restart
sleep 3
NODE_ENV=development PORT=3004 npx tsx server/index.ts
```

## 🔍 Verification Steps

1. **Check Server is Running:**
   ```bash
   lsof -i :3004
   # Should show node process listening on port 3004
   ```

2. **Test URLs:**
   - http://localhost:3004 (home)
   - http://localhost:3004/paginated (Patti Smith reader)
   - http://localhost:3004/chapters (Merle Haggard audio)

3. **Check v3.0 Untouched:**
   ```bash
   cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh
   git status
   # Should show "nothing to commit, working tree clean"
   ```

## ⚠️ Critical Rules

### DO:
- ✅ Make ALL changes in `/united-tribes-fresh-v4`
- ✅ Use port 3004 for v4.0
- ✅ Commit to `v4-development` branch
- ✅ Use `npx tsx` if npm conflicts occur

### DON'T:
- ❌ NEVER modify `/united-tribes-fresh` (v3.0)
- ❌ Don't use port 3000 for v4.0
- ❌ Don't run multiple npm processes simultaneously
- ❌ Don't commit v4.0 changes to main branch

## 🆘 Emergency Rollback

If v4.0 has issues, v3.0 is always available:
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh
npm run dev
# Access at: http://localhost:3000
```

## 📝 Development Workflow

1. **Start Development:**
   ```bash
   cd united-tribes-fresh-v4
   NODE_ENV=development PORT=3004 npx tsx server/index.ts
   ```

2. **Make Changes:**
   - Edit files in `/united-tribes-fresh-v4` only
   - Test at http://localhost:3004

3. **Commit Changes:**
   ```bash
   git add .
   git commit -m "v4.0: Your change description"
   ```

## 🎯 Key Success Factors

- **Single Process:** Only run one server process per port
- **Clean Dependencies:** Fresh npm install solved tsx issues
- **Directory Isolation:** v3.0 and v4.0 never interfere
- **Port Separation:** 3000 vs 3004 allows both to run simultaneously

---

**Last Updated:** September 2025
**Status:** v4.0 Successfully Running on Port 3004
**Next Steps:** Begin v4.0 feature development with confidence