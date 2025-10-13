# United Tribes Media Hub - Quickstart Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

## Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/jdagogo/unitedtribes-book-analysis-poc.git
cd unitedtribes-book-analysis-poc

# Switch to development branch
git checkout v4.5-development

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
# Run on port 3004 (recommended)
PORT=3004 npm run dev

# Or default port 3000
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3004/
```

## What You'll See

### Homepage
- **Media Hub** - Main landing page showing current development branch
- **Commit Reference** - Shows latest commit (currently `933c73e`)
- **Navigation** - Access to podcast player and entity explorer

### Key Features

1. **Entity Discovery**
   - Click on entities like "Farm Aid 1985"
   - Explore artist catalogs and related content

2. **Video Search** (Farm Aid 1985 entity)
   - Search UnitedTribes analyzed videos
   - 2-column grid results with thumbnails
   - Click videos to open player modal

3. **Video Player Modal**
   - Full video playback with embedded controls
   - Works & Discovery button (playlist integration pending)
   - Video Analysis button (analysis panel pending)

4. **Podcast Player**
   - Play Fresh Air podcast episode
   - Interactive transcript with entity highlighting
   - Click entities to open detail modals

## Project Structure

```
/client
  /src
    /components
      entity-detail-modal.tsx      # Main entity modal with video search
      video-player-modal.tsx        # Video player modal component
    /pages
      home.tsx                      # Homepage
    /data
      timestamped-transcript.ts     # Transcript with entity mappings

/server
  /routes
    youtube.ts                      # UnitedTribes video API endpoints
```

## Current Development Status

**Branch:** `v4.5-development`
**Latest Commit:** `111bf53`

### What's Working ✅
- Video search integration in Farm Aid 1985 modal
- Video player modal with clean interface
- UnitedTribes API integration (`/api/youtube/search?q=`)
- Search results display (2-column grid)
- Video playback with embedded buttons

### In Progress ⚠️
- Playlist modal integration (message handlers needed)
- Video analysis panel (handler implementation pending)
- Playlist track playback functionality

## Common Commands

```bash
# Start development server
PORT=3004 npm run dev

# Build for production
npm run build

# Check git status
git status

# View recent commits
git log --oneline -5

# Switch branches
git checkout v4.5-development      # Development branch
git checkout v4.4-STABLE-CHECKPOINT  # Stable rollback point
```

## Troubleshooting

### Port Already in Use
If port 3004 is already in use, you'll see an error. Kill existing processes:
```bash
# Find process on port 3004
lsof -ti:3004 | xargs kill

# Or use a different port
PORT=3005 npm run dev
```

### Multiple Background Servers
If you have many dev servers running from previous sessions:
```bash
# Kill all node processes (caution: kills ALL node processes)
pkill -f "node"

# Or kill specific npm processes
pkill -f "npm run dev"
```

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Changes Not Appearing
```bash
# Hard refresh in browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Or restart dev server:
# Stop server (Ctrl+C) then restart:
PORT=3004 npm run dev
```

## Documentation

- **Session Challenges:** [README-october-13-2025-video-integration-challenges.md](./README-october-13-2025-video-integration-challenges.md)
- **Project History:** [CLAUDE.md](./CLAUDE.md)
- **Version 4.5 Details:** [README-v4.5-development.md](./README-v4.5-development.md)

## API Endpoints

### UnitedTribes Video API

```bash
# Search videos
GET /api/youtube/search?q=<query>

# Get video embed HTML
GET /api/videos/:videoname/embed-html

# Example:
curl "http://localhost:3004/api/youtube/search?q=farm+aid+willie+nelson"
```

## Testing Video Integration

1. Navigate to homepage: `http://localhost:3004/`
2. Click "Explore Entities" or similar navigation
3. Find and click "Farm Aid 1985" entity
4. In the modal, locate "Search Farm Aid 1985 Videos" section
5. Type a search query (e.g., "Willie Nelson")
6. Click a video thumbnail in results
7. Video player modal should open with playback

## Need Help?

- Check the detailed [challenges documentation](./README-october-13-2025-video-integration-challenges.md) for known issues
- Review [CLAUDE.md](./CLAUDE.md) for full project history
- Current status: Video playback working, playlist integration pending

## Next Steps

After getting familiar with the app:

1. **Explore Entity Modals** - Click different entities to see content
2. **Test Video Search** - Try different search queries
3. **Review Documentation** - Read the challenges README for context
4. **Check Pending Features** - See what's planned for playlist integration

---

**Last Updated:** October 13, 2025
**Branch:** v4.5-development
**Status:** Active Development
