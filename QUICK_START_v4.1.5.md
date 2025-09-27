# 🚀 QUICK START GUIDE - United Tribes v4.1.5

## ⏱️ 5-Minute Setup

Get United Tribes v4.1.5 running in under 5 minutes with this step-by-step guide.

---

## 🎯 INSTANT START (Copy & Paste)

```bash
# Quick setup - Copy and paste these commands:
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh-v4
git checkout v4.1.5-stable
npm install
npm run dev
```

**Then open**: http://localhost:3004

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting, verify you have:

✅ **Node.js installed** (v18+)
```bash
node --version  # Should show v18.0.0 or higher
```

✅ **NPM installed** (v8+)
```bash
npm --version   # Should show v8.0.0 or higher
```

✅ **Port 3004 available**
```bash
lsof -i :3004   # Should show nothing (port free)
```

✅ **Git installed**
```bash
git --version   # Any recent version
```

---

## 🔧 DETAILED SETUP STEPS

### Step 1: Get the Code

```bash
# Option A: Clone fresh (recommended)
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh-v4

# Option B: If you already have it
cd united-tribes-fresh-v4
git fetch origin
```

### Step 2: Switch to Stable Version

```bash
# IMPORTANT: Use the stable v4.1.5 branch
git checkout v4.1.5-stable

# Verify you're on the right branch
git branch
# Should show: * v4.1.5-stable
```

### Step 3: Install Dependencies

```bash
# Clean install (recommended)
npm ci

# Or if that doesn't work
npm install
```

### Step 4: Start the Application

```bash
# Start in development mode
npm run dev

# You should see:
# ➜ serving on port 3004
# ➜ VITE ready in XXXms
```

### Step 5: Open in Browser

Open your browser and go to:
- **Main App**: http://localhost:3004
- **Blue Note Book**: http://localhost:3004/paginated
- **Audio Sync**: http://localhost:3004/chapters

---

## 🎮 FEATURES WALKTHROUGH

### 1. Blue Note Book (Main Feature)

**URL**: http://localhost:3004/paginated

**What You'll See**:
- Two-panel layout with images and text
- Navigation arrows on sides
- Chapter index on left
- 17 beautifully designed pages

**How to Navigate**:
- **Click arrows** to go forward/backward
- **Use arrow keys** on keyboard
- **Click chapter titles** in index
- **Swipe on mobile** devices

### 2. Audio-Text Synchronization

**URL**: http://localhost:3004/chapters

**What You'll See**:
- YouTube video player at top
- Synchronized transcript below
- Yellow highlighting following audio
- Chapter navigation

**How to Use**:
- **Click any word** to jump to that time
- **Watch highlighting** follow the audio
- **Use chapter buttons** to navigate
- **Control playback** with video controls

### 3. Search Feature

**Available on main pages**

**How to Search**:
1. Look for search icon 🔍
2. Type your query
3. See instant results
4. Click to navigate

---

## 🛠️ COMMON COMMANDS

### Development

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run check

# Build for production
npm run build

# Start production server
npm start
```

### Git Operations

```bash
# Check current branch
git branch

# See what's changed
git status

# Save your work
git add .
git commit -m "Your message"

# Return to v4.1.5 if needed
git checkout v4.1.5-stable
```

### Troubleshooting

```bash
# Port in use? Find and kill
lsof -i :3004
kill -9 [PID]

# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

---

## 🔍 VERIFICATION TESTS

After setup, verify everything works:

### Test 1: Main Page Loads
1. Go to http://localhost:3004
2. ✅ Page should load without errors
3. ✅ No console errors (check DevTools)

### Test 2: Blue Note Book Works
1. Go to http://localhost:3004/paginated
2. ✅ Images should load
3. ✅ Navigation should work
4. ✅ All 17 pages accessible

### Test 3: Audio Sync Functions
1. Go to http://localhost:3004/chapters
2. ✅ Video player loads
3. ✅ Transcript visible
4. ✅ Click words to seek
5. ✅ Highlighting follows audio

### Test 4: Search Works
1. Use search feature
2. ✅ Results appear
3. ✅ Clicking results navigates

---

## 💡 QUICK TIPS

### Performance Tips

1. **Use Chrome** for best performance
2. **Close other tabs** to free memory
3. **Hard refresh** if things look wrong: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)

### Developer Tips

1. **Open DevTools**: F12 or right-click → Inspect
2. **Check Console** for any errors
3. **Network tab** to see API calls
4. **Application tab** to check storage

### Keyboard Shortcuts

- **Arrow Keys**: Navigate pages
- **Spacebar**: Play/pause video
- **Escape**: Close modals
- **Enter**: Confirm actions

---

## 🚨 TROUBLESHOOTING

### Problem: "Port 3004 already in use"

```bash
# Solution 1: Kill the process
lsof -i :3004
kill -9 [PID_NUMBER]

# Solution 2: Use different port
PORT=3005 npm run dev
```

### Problem: "Module not found"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### Problem: "YouTube API not working"

**Check**:
1. Browser console for CORS errors
2. Network tab for failed requests
3. Make sure you're on http://localhost:3004

### Problem: "Page not loading"

```bash
# Solution: Full restart
# 1. Stop server (Ctrl+C)
# 2. Clear everything
rm -rf node_modules .vite dist
npm install
npm run dev
```

### Problem: "Git merge conflicts"

```bash
# Solution: Reset to stable
git reset --hard
git checkout v4.1.5-stable
git pull origin v4.1.5-stable
```

---

## 📱 MOBILE TESTING

To test on mobile devices on same network:

1. Find your computer's IP:
```bash
# Mac
ipconfig getifaddr en0

# Windows
ipconfig

# Linux
ip addr show
```

2. On mobile, go to:
```
http://[YOUR-IP]:3004
```

Example: http://192.168.1.100:3004

---

## 🔄 UPDATING & REVERTING

### Get Latest Updates

```bash
git fetch origin
git pull origin v4.1.5-stable
npm install
```

### Revert to Clean State

```bash
# Save any changes
git stash

# Reset to v4.1.5
git checkout v4.1.5-stable
git reset --hard origin/v4.1.5-stable

# Reinstall
npm ci
```

### Create Backup

```bash
# Before making changes
git checkout -b my-backup-$(date +%Y%m%d)
git add .
git commit -m "Backup before changes"
```

---

## 📊 SYSTEM STATUS CHECK

Run this to check if everything is working:

```bash
# Create a status check script
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "🔍 Checking United Tribes v4.1.5 Status..."
echo ""

# Check Node
echo "✓ Node Version: $(node --version)"

# Check NPM
echo "✓ NPM Version: $(npm --version)"

# Check Git Branch
echo "✓ Git Branch: $(git branch --show-current)"

# Check Port
if lsof -i :3004 > /dev/null; then
    echo "✓ Port 3004: IN USE (Server Running)"
else
    echo "⚠ Port 3004: FREE (Server Not Running)"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✓ Dependencies: INSTALLED"
else
    echo "⚠ Dependencies: NOT INSTALLED (run npm install)"
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✓ Git Status: CLEAN"
else
    echo "⚠ Git Status: UNCOMMITTED CHANGES"
fi

echo ""
echo "📊 Status check complete!"
EOF

chmod +x check-status.sh
./check-status.sh
```

---

## 🎯 SUCCESS INDICATORS

You know setup is successful when:

✅ **Terminal shows**:
```
serving on port 3004
VITE v5.4.19 ready in XXX ms
```

✅ **Browser loads** without errors

✅ **Console is clean** (no red errors)

✅ **All features work**:
- Pages navigate
- Images load
- Videos play
- Search returns results

---

## 🆘 EMERGENCY RECOVERY

If everything breaks, here's your recovery plan:

```bash
# 1. Stop everything
pkill -f node
pkill -f npm

# 2. Clean slate
cd ..
rm -rf united-tribes-fresh-v4
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh-v4

# 3. Get stable version
git checkout v4.1.5-stable

# 4. Fresh install
npm ci

# 5. Start fresh
npm run dev
```

---

## 📞 GETTING HELP

### Self-Help Resources

1. **Check this guide** first
2. **Read main README**: `/README-v4.1.5.md`
3. **Check CLAUDE.md**: `/CLAUDE.md`
4. **Browser DevTools**: F12 → Console

### Debug Information to Collect

If you need help, gather this info:

```bash
# System info
node --version
npm --version
git branch --show-current

# Error messages
# Copy any red text from terminal
# Copy any red text from browser console

# What you were doing when error occurred
```

---

## ✅ FINAL CHECKLIST

Before considering setup complete:

- [ ] Application starts without errors
- [ ] Can access http://localhost:3004
- [ ] Blue Note Book loads (17 pages)
- [ ] Audio sync works
- [ ] Search returns results
- [ ] No console errors in browser
- [ ] Git is on v4.1.5-stable branch

---

## 🎉 READY TO GO!

**Congratulations!** You now have United Tribes v4.1.5 running.

### Quick Links:
- **Main**: http://localhost:3004
- **Book**: http://localhost:3004/paginated
- **Audio**: http://localhost:3004/chapters

### Remember:
- This is version **4.1.5 STABLE**
- This is your **SAFE CHECKPOINT**
- You can always return here with `git checkout v4.1.5-stable`

---

## 📝 QUICK REFERENCE CARD

```bash
# === ESSENTIAL COMMANDS ===

# Start app
npm run dev

# Stop app
Ctrl + C

# Check status
git status

# View branch
git branch

# Switch to v4.1.5
git checkout v4.1.5-stable

# Find port usage
lsof -i :3004

# Kill process
kill -9 [PID]

# === URLS ===
Main:     http://localhost:3004
Book:     http://localhost:3004/paginated
Audio:    http://localhost:3004/chapters

# === HELP ===
README:   /README-v4.1.5.md
Guide:    /QUICK_START_v4.1.5.md
Claude:   /CLAUDE.md
```

---

*Quick Start Guide v4.1.5 - December 2024*
*If this guide helped you, you're ready to explore United Tribes!*