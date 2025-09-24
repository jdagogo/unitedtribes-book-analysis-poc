# United Tribes Audio Interface - Claude Code Documentation

## 🔄 STATUS: Version 4.1.5 - September 23, 2025

### Project Overview
Blue Note Records interactive book application integrating YouTube Analysis v3.1 (port 3003) with United Tribes Fresh book reader (port 3004). Features 18 interactive pages with YouTube video search, playlist management, and synchronized audio playback.

## What's Actually Working (September 23, 2025)

### ✅ Features That Work
1. **YouTube Search Integration** - Search for videos on page 18 and page 7
2. **Playlist Modal** - Shows playlists and works from analyzed videos
3. **Video Player** - Embeds and plays YouTube videos correctly
4. **Page Navigation** - All 18 pages load and navigate properly
5. **Blue Note Book Structure** - Properly loads content for all pages

### ❌ Current Issues

#### 1. YouTube API Quota Exhausted
- **Problem**: All 3 API keys have exceeded daily quota (10,000 units each)
- **Impact**: Playlist tracks show "✗ No video" instead of finding YouTube videos
- **Solution**: Need to wait for quota reset at midnight PT or create new Google Cloud project
- **Files affected**: `/app/api/youtube/search-track/route.ts`

#### 2. Playlist Track Search Not Working
- **Problem**: Cannot search for YouTube videos for individual tracks in playlists
- **Cause**: API quota exceeded, preventing track searches
- **User Experience**: Tracks display but cannot be played

#### 3. Page 7 Search Results
- **Problem**: Search was not returning results properly earlier
- **Status**: Partially working but hampered by API quota issues

## What Actually Happened Today (September 23, 2025)

### Morning Session
1. **Fixed Playlist Modal Typography** - Increased font sizes from 14px to 18px for tracks, 24px for headers
2. **Fixed Gray Text Issue** - Changed gray (#888) to green (#10b981) in playlist modal
3. **Added YouTube Search to Page 7** - Integrated search functionality for John Coltrane Blue Train page
4. **Fixed Search Input Styling** - Removed gray placeholder, increased to 24px font, dark blue color

### Afternoon Session
5. **Debugged Search API** - Discovered all 3 YouTube API keys exceeded quota
6. **Switched API Keys** - Rotated through YOUTUBE_API_KEY, YOUTUBE_API_KEY_2, YOUTUBE_API_KEY_3
7. **Identified Core Issue** - Playlist tracks can't find videos due to API quota exhaustion

### Version History Corrections
- **Version 4.1.4** (September 23, 2025 4:58 PM ET) - Added search to page 7, fixed typography issues
- **Version 4.1.5** (September 23, 2025 Evening) - Documented API quota issues, accurate status update

## File Structure
```
/client
  /src
    /components
      youtube-player-simple.tsx    ✅ Fixed recovery + 100ms updates
      synchronized-transcript.tsx  ✅ Added enhanced visual feedback
    /pages
      auto-sync-chapters.tsx       ✅ Fixed handlers + word matching
    /styles
      animations.css               ✅ NEW - Custom visual effects
  /public
    transcript-PSN8N2v4oq0.json    (43,263 words with timestamps)
    authentic-chapters-PSN8N2v4oq0.json (18 book chapters)
```

## Visual Feedback Guide

| State | Visual Effect | Duration |
|-------|--------------|----------|
| **Hover** | Blue background + underline + scale 1.05 + shadow | Instant |
| **Click** | Green pulse + scale 1.25 + ripple effect | 400ms |
| **Current** | Yellow background + bold + glow ring animation | Continuous |
| **Loading** | Pulsing opacity animation | 1.5s loop |
| **Recovery** | Orange text + spinning icon | Until recovered |

## Console Commands
```javascript
// Status check
window.testPlayer.status()

// Manual seeks (all should work)
window.audioSync.seekTo(30)   // Jump to 30 seconds
window.audioSync.seekTo(300)  // Jump to 5 minutes  
window.audioSync.seekTo(600)  // Jump to 10 minutes

// Player control
window.audioSync.playVideo()
window.audioSync.pauseVideo()
window.audioSync.getCurrentTime()
window.audioSync.getDuration()

// Test recovery
window.testPlayer.recoverPlayer()
```

## Performance Improvements
- **Update Frequency**: 250ms → 100ms (10 updates/second)
- **Word Matching**: Added 200ms tolerance for gaps
- **Handler Persistence**: Using refs to prevent re-binding
- **Memoization**: Chapter data cached to prevent re-renders
- **Visual Smoothness**: CSS transitions and animations

## Success Metrics Achieved ✅
1. ✅ Word highlighting works continuously for entire audiobook (4.6 hours)
2. ✅ 100+ word clicks in sequence all work correctly
3. ✅ Player recovers automatically from any error state
4. ✅ Visual feedback on every user interaction
5. ✅ Handlers persist after unlimited chapter changes
6. ✅ Zero console errors during normal operation
7. ✅ Works after page refresh 100% of the time

## URL
Access the working interface at: http://localhost:3000/chapters

## Repository
https://github.com/jdagogo/united-by-replit

## Technical Details

### Word Highlighting Logic
```javascript
// Tolerance-based matching in auto-sync-chapters.tsx
const tolerance = 0.2; // 200ms tolerance
for (let i = 0; i < wordTimestamps.length; i++) {
  const word = wordTimestamps[i];
  if (currentTime >= (word.start - tolerance) && 
      currentTime <= (word.end + tolerance)) {
    currentWord = i;
    break;
  }
}
```

### Handler Persistence Pattern
```javascript
// Using refs to maintain handler across re-renders
const wordClickHandlerRef = useRef<(wordIndex: number, timestamp: number) => void>();

useEffect(() => {
  wordClickHandlerRef.current = (wordIndex, timestamp) => {
    // Handler logic here
  };
}, []);

const handleWordClick = useCallback((wordIndex, timestamp) => {
  if (wordClickHandlerRef.current) {
    wordClickHandlerRef.current(wordIndex, timestamp);
  }
}, []);
```

### Recovery Mechanism
```javascript
// Complete player recreation in youtube-player-simple.tsx
const recoverPlayer = () => {
  // 1. Destroy existing player
  if (globalPlayer?.destroy) globalPlayer.destroy();
  
  // 2. Clear all state
  globalPlayer = null;
  window.audioSync = null;
  
  // 3. Recreate with API verification
  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    // Reload YouTube API if needed
  }
};
```

## Critical Issues to Fix (High Priority)

### 1. YouTube API Quota Management ⚠️
- **Issue**: All 3 API keys exhausted their 10,000 unit daily quotas
- **Impact**: Playlist tracks cannot find YouTube videos, show "✗ No video"
- **Solutions**:
  1. Create new Google Cloud project with fresh quota
  2. Implement API key rotation logic
  3. Add caching layer to reduce API calls
  4. Store found video IDs in database
- **Priority**: CRITICAL - Core functionality broken

### 2. Playlist Track Video Search 🔴
- **Issue**: Tracks in playlists don't have YouTube video IDs
- **Impact**: Users can see track names but can't play them
- **Current Behavior**: Shows "✗ No video" for all tracks when API quota exceeded
- **Priority**: HIGH - Major feature unusable

### 3. API Key Rotation Not Automatic
- **Issue**: System doesn't automatically switch to next API key when quota exceeded
- **Impact**: Manual intervention required to change keys
- **Solution**: Implement automatic failover to next available key
- **Priority**: HIGH - Affects reliability

## YouTube Integration & API Key Management

### How the Integration Works
1. **United Tribes Fresh (Port 3004)** - The Blue Note book application
2. **YouTube Analysis App (Port 3003)** - Provides video search and YouTube API access
3. **Dependency**: United Tribes Fresh requires the YouTube Analysis app to be running on port 3003

### API Endpoints Used
- **Video Search**: `http://localhost:3003/api/videos/search` - Search for analyzed videos
- **Track Search**: `http://localhost:3003/api/youtube-search` - Find YouTube videos for playlist tracks
  - Parameters: `song` (track title) and `artist` (artist name)
  - Returns: `url`, `title`, `channel` for the found video
- **Playlist Data**: `http://localhost:3003/api/videos/{videoId}/playlist-data` - Get playlist metadata

### API Key Rotation
- The YouTube Analysis app manages 3 API keys (YOUTUBE_API_KEY, YOUTUBE_API_KEY_2, YOUTUBE_API_KEY_3)
- Each key has 10,000 units daily quota (resets at midnight PT)
- **Automatic Rotation**: The `/api/youtube-search` endpoint should automatically switch to the next API key when quota is exceeded
- **Transparency**: United Tribes Fresh doesn't need to handle key rotation - the YouTube Analysis app manages it internally

### Troubleshooting API Issues

#### CORS Errors
If you see "CORS policy" errors in the console:
- The YouTube Analysis app needs to add CORS headers to allow requests from port 3004
- Headers needed: `Access-Control-Allow-Origin: http://localhost:3004` or `*` for development

#### API Quota Exceeded
If all tracks show "✗ No video":
1. Check quota status: `node /Users/j.d.heilprin/youtube-transcript-analysis-v2/check-api-quota.js`
2. Verify API key rotation is working in the YouTube Analysis app
3. If all keys exhausted, wait until midnight PT for quota reset

#### Endpoint Changes
If the YouTube Analysis app updates its endpoints:
- Update the URLs in `/client/src/components/paginated-book-viewer.tsx`
- Check parameter names match what the API expects

## Last Updated
September 24, 2025 - Fixed playlist track search integration, updated API endpoint from `/api/youtube/search-track` to `/api/youtube-search`, added CORS support, documented API key rotation.