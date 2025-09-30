# United Tribes Fresh - Version 4.2.0 (STABLE)

## Quick Start
```bash
cd ~/Desktop/my-claude/united-tribes-fresh-v4
npm run dev
```
Application runs on: http://localhost:3004

## YouTube API Configuration

### API Keys (Required in .env file)
```
YOUTUBE_API_KEY=your_first_key_here
YOUTUBE_API_KEY_2=your_second_key_here
YOUTUBE_API_KEY_3=your_third_key_here
```

### Check API Quota Status
```bash
# Check exact usage and remaining quota
node check-quota-exact.cjs

# Alternative basic check
node check-api-quota.cjs
```

## Current Status (September 30, 2025)
- **Version:** 4.2.0
- **Status:** Stable Rollback Point
- **API Usage Today:** 1,600 units (5.33%)
- **Remaining Quota:** 28,400 units (~284 searches)

## Working Features
- ✅ YouTube search with 3 API keys
- ✅ Automatic API key rotation
- ✅ VEVO/Official channel prioritization
- ✅ Playlists and works display from analyzed videos
- ✅ Independent operation (no dependency on port 3003)
- ✅ API quota tracking and monitoring
- ✅ 18 Blue Note interactive pages

## Technical Details

### Data Source
Reads video analysis from:
```
/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos
```

### API Endpoints
- `/api/youtube/search` - Search videos
- `/api/youtube/search-track` - Search specific tracks
- `/api/youtube/quota-status` - Check quota status
- `/api/videos/:videoname` - Get video data
- `/api/videos/:videoname/embed-html` - Get embed HTML

### Quota Information
- **Daily Limit:** 10,000 units per key (30,000 total)
- **Search Cost:** 100 units per search
- **Reset Time:** Midnight Pacific Time
- **Tracking File:** `data/youtube-api-cache.json`

## File Structure
```
/server
  /routes
    youtube.ts          # YouTube API integration
    youtube-embed.ts    # Embed generation
  /utils
    extractWorks.ts     # Parse works from analysis
    extractDiscoveryPlaylist.ts  # Parse playlists
/data
  youtube-api-cache.json  # API call tracking
/client
  /src/components
    paginated-book-viewer.tsx  # Main viewer component
check-quota-exact.cjs   # Quota checking script
```

## Rollback Instructions
If issues arise, to rollback to this stable version:
```bash
git checkout v4.2.0
npm install
npm run dev
```

## Monitoring Commands
```bash
# Check exact API usage
node check-quota-exact.cjs

# View recent API calls in server logs
# Look for "Selected video:" and VEVO/Official indicators

# Check cache file directly
cat data/youtube-api-cache.json | python3 -m json.tool
```

## Notes
- API quota resets at midnight Pacific Time
- Each search consumes 100 units
- System automatically rotates between 3 API keys
- VEVO and official channels are prioritized in search results
- All API calls are tracked in the cache file

## Version History
- **4.2.0** (Sept 30, 2025) - Current stable with full YouTube integration
- **4.1.5** (Sept 27, 2025) - Previous stable (required port 3003)
- **4.1.4** (Sept 23, 2025) - Added search functionality
- **4.1.3** - Initial YouTube integration