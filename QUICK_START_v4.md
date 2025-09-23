# Quick Start Guide - United Tribes Fresh v4.0

## ⚡ Start v4.0 in 30 Seconds

```bash
# 1. Go to v4.0 directory
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4

# 2. Install dependencies (first time only)
npm install

# 3. Start v4.0 development server on port 3004
npm run dev

# 4. Open in browser
http://localhost:3004
```

## ✅ v3.0 Remains Available

```bash
# v3.0 is always ready at:
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh
npm run dev
# Access at: http://localhost:3000
```

## 🎯 Version Separation

| Aspect | v3.0 (Stable) | v4.0 (Development) |
|--------|---------------|--------------------|
| **Directory** | `/united-tribes-fresh` | `/united-tribes-fresh-v4` |
| **Port** | 3000 | 3004 |
| **URL** | http://localhost:3000 | http://localhost:3004 |
| **Branch** | main | v4-development |
| **Status** | Production Ready | In Development |

## 🔧 Running Both Versions

### Terminal 1 - v3.0 Stable
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh
npm run dev
# Running on http://localhost:3000
```

### Terminal 2 - v4.0 Development
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4
npm run dev
# Running on http://localhost:3004
```

## 📝 Testing v4.0 Features

### 1. Discovery System (Port 3004)
```bash
# Navigate to Patti Smith reader
http://localhost:3004/paginated

# Test discovery passages:
- Page 207: "Robert's collages that centered on freaks"
- Page 208: "emotional experience"
- Page 209: "The lady's dead"
```

### 2. Audio Sync (Port 3004)
```bash
# Navigate to Merle Haggard audio
http://localhost:3004/chapters

# Test features:
- Click any word to jump
- Chapter navigation
- Continuous highlighting
```

## 🛠 Common Commands

### For v4.0 Development
```bash
# Check v4.0 status
cd united-tribes-fresh-v4
git status

# Make changes (only in v4.0)
# Edit files in /united-tribes-fresh-v4

# Commit to v4.0 branch
git add .
git commit -m "v4.0: Your message"

# Kill v4.0 server
pkill -f "PORT=3004"
```

### For v3.0 Stable
```bash
# v3.0 directory remains untouched
cd united-tribes-fresh
# No changes made here!
```

## 🐛 Troubleshooting

### Port 3004 already in use?
```bash
# Kill any process on port 3004
lsof -i :3004 | grep LISTEN
kill -9 [PID]

# Or kill all v4.0 processes
pkill -f "PORT=3004"
```

### Need to rollback to v3.0?
```bash
# Just switch directories - v3.0 is untouched!
cd ../united-tribes-fresh
npm run dev
# v3.0 runs perfectly on port 3000
```

### Dependencies issue in v4.0?
```bash
cd united-tribes-fresh-v4
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Development Workflow

### 1. Start your day
```bash
# Check v3.0 is still working
cd united-tribes-fresh && npm run dev
# Verify at http://localhost:3000

# Start v4.0 development
cd ../united-tribes-fresh-v4 && npm run dev
# Work at http://localhost:3004
```

### 2. Make v4.0 changes
- Edit files ONLY in `/united-tribes-fresh-v4`
- Test at http://localhost:3004
- v3.0 remains stable at http://localhost:3000

### 3. End of day
```bash
# Commit v4.0 changes
cd united-tribes-fresh-v4
git add .
git commit -m "v4.0: Today's changes"

# v3.0 remains untouched and ready
```

## 📊 Version Control Interface

Access the version control dashboard:
```
file:///Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4/version-control.html
```

## 🎯 Key Points

1. **v3.0 is NEVER modified** - Always safe at port 3000
2. **v4.0 is isolated** - Runs independently on port 3004
3. **Can run both** - Different ports allow simultaneous operation
4. **Easy rollback** - Just use v3.0 directory
5. **Separate git** - v4.0 has its own branch

## ⚠️ Important Reminders

- ✅ v3.0 directory: `/united-tribes-fresh` (DO NOT MODIFY)
- ✅ v4.0 directory: `/united-tribes-fresh-v4` (ALL CHANGES HERE)
- ✅ v3.0 port: 3000 (stable)
- ✅ v4.0 port: 3004 (development)
- ✅ Both can run simultaneously
- ✅ v3.0 always available as backup

---

**Quick Links:**
- v3.0 Stable: http://localhost:3000
- v4.0 Development: http://localhost:3004
- Version Control: file:///Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4/version-control.html