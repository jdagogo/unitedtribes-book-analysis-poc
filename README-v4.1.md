# United Tribes Fresh v4.1 - Blue Note Two-Panel Layout

## Version 4.1 Release Notes
**Released:** Tuesday, September 23, 2025 at 12:51 PM EDT
**Git Tag:** `v4.1`
**Branch:** `v4-development`
**Commit:** `6ca0b39`

## What's New in v4.1

### 🔵 Blue Note Integration
- Added Blue Note as a third toggle option on the home page
- Alongside existing Merle Haggard and Patti Smith options
- Displays Blue Note Records book cover image

### 📐 Two-Panel Layout System
- **Experimental two-panel layout** specifically for Blue Note content
- **60% left panel**: Book content and text
- **40% right panel**: Media discovery and album showcases
- Single-panel layout preserved for Just Kids and other books

### 🔗 URL Parameter Handling
- Fixed `transcriptId` parameter reading from URL
- Dynamic content loading based on URL parameters
- Support for multiple book types:
  - `bluenote`: Blue Note Records collection
  - `justkids`: Patti Smith's Just Kids
  - Default: Just Kids if no parameter provided

### 📚 Content Separation
- Blue Note displays its own content (not Just Kids)
- Created `blue-note-cover-art.json` data structure
- Album showcase pages with metadata:
  - Album title, artist, year
  - Catalog number
  - Cover designer (Reid Miles)

## Files Changed

### New Files
- `client/src/data/blue-note-cover-art.json` - Blue Note book data
- `client/src/pages/home.tsx` - Home page with toggle system
- `client/src/pages/paginated-reader.tsx` - URL parameter handler

### Modified Files
- `client/src/components/paginated-book-viewer.tsx` - Two-panel layout logic

## Quick Start

### Running v4.1
```bash
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4
npm run dev
# Server runs on http://localhost:3004
```

### Testing Blue Note
1. Navigate to: `http://localhost:3004/paginated?transcriptId=bluenote`
2. Verify two-panel layout appears
3. Left panel shows Blue Note content
4. Right panel ready for media discovery

### Testing Just Kids (Unchanged)
1. Navigate to: `http://localhost:3004/paginated?transcriptId=justkids`
2. Verify single-panel layout
3. All existing functionality preserved

## Rollback Instructions

If you need to rollback to v4.1:
```bash
# Checkout the v4.1 tag
git checkout v4.1

# Or reset to the specific commit
git reset --hard e442c92

# Restart the server
npm run dev
```

## Technical Details

### Toggle State Management
```typescript
const [activeHub, setActiveHub] = useState<"merle" | "patti" | "bluenote">("merle");
```

### URL Parameter Reading
```typescript
const transcriptId = useMemo(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('transcriptId');

  if (id === 'justkids') return 'just-kids-patti-smith';
  if (id === 'bluenote') return 'bluenote';

  return id || 'just-kids-patti-smith';
}, []);
```

### Two-Panel Layout Detection
```typescript
if (transcriptId === 'bluenote') {
  setIsBlueNote(true);
  // Load Blue Note specific data
  const blueNotePages = blueNoteData.pages.map(/* ... */);
  setPages(blueNotePages);
  return; // Exit early for Blue Note
}
```

## Known Issues
- Media discovery panel (right side) not yet populated with content
- Two-panel layout is experimental and may need adjustments

## Next Steps (v4.2)
- Populate media discovery panel with album information
- Add interactivity to album showcases
- Implement smooth transitions between panels
- Add more Blue Note content pages

## Testing Checklist
- [x] Blue Note toggle appears on home page
- [x] Blue Note shows its own content (not Just Kids)
- [x] Two-panel layout renders for Blue Note
- [x] Just Kids remains fully functional
- [x] URL parameters work correctly
- [x] Server runs without errors
- [x] Console logging provides debugging info

## Console Commands for Testing
```javascript
// Check which book is loaded
console.log('🔵 Loading transcript with ID:', transcriptId);

// Verify Blue Note detection
console.log('🎵 Loading Blue Note book data');

// Check page creation
console.log('🎵 Blue Note pages created:', blueNotePages.length);
```

## Support Files
- Version control page updated with v4.1 card
- Git repository synced with tag v4.1
- All changes committed and pushed to GitHub

## Repository
- **GitHub:** https://github.com/jdagogo/unitedtribes-book-analysis-poc
- **Branch:** v4-development
- **Tag:** v4.1

---

*Generated: Monday, September 22, 2025 at 11:05 PM EDT*