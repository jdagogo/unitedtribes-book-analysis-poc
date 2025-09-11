# United Tribes Media Hub

A comprehensive digital reading and media platform featuring interactive book readers, audio-synchronized transcripts, and multimedia cultural discovery tools.

## Current Media Hubs

### 1. Patti Smith - "Just Kids" Media Hub
Interactive digital reader with entity recognition, cultural discovery, and multimedia integration for Patti Smith's memoir.

### 2. Merle Haggard - "My House of Memories" Media Hub  
Audio-synchronized transcript viewer with word-level highlighting and chapter navigation for Merle Haggard's audiobook.

## Features

### Core Reading Experience
- **Paginated Book Viewer**: Clean, distraction-free reading interface with smooth navigation
- **Dual Media Hub Toggle**: Switch between Patti Smith and Merle Haggard content
- **Chapter Navigation**: Quick jump to any chapter with visual chapter cards
- **Page Controls**: Navigate by page or chapter with enhanced navigation buttons
- **Return to Media Hub**: Easy navigation back to hub selection
- **Reading Progress**: Visual indicators showing current page and chapter
- **Keyboard Navigation**: Arrow keys for page turning, Ctrl/Cmd+F for search

### Entity Recognition & Highlighting
- **Smart Entity Detection**: Automatically identifies people, places, books, and cultural references
- **Color-Coded System**:
  - People: Blue highlighting
  - Places: Green highlighting  
  - Books/Authors: Orange highlighting
  - Music/Video: Purple text (subtle styling)
- **60+ Cultural Entities**: Manually curated from 1960s-70s NYC scene
- **44 Books**: From "Just Kids" Goodreads reading list with author detection

### Audio Synchronization (Merle Haggard Hub)
- **Word-Level Sync**: Perfect synchronization with YouTube audio
- **Real-Time Highlighting**: Yellow glow follows current word being spoken
- **Click-to-Seek**: Click any word to jump to that moment in audio
- **Visual Feedback**:
  - Hover: Blue background with underline
  - Click: Green pulse animation with ripple effect
  - Current: Yellow background with glow animation
- **43,263 Words**: Complete transcript with timestamps
- **18 Chapters**: Full audiobook navigation

### Search & Discovery
- **Full-Text Search**: Search across entire books
- **Context Discovery**: Select any text passage to explore cultural connections
- **Dual Functionality**: Text selection offers both search and discovery options
- **Smart Suggestions**: Pre-populated search suggestions for key themes
- **Highlighted Results**: Search terms highlighted in context

### Multimedia Integration
- **Video Modal**: Embedded YouTube videos for musical references
- **Interactive Links**: Click highlighted music references to view videos
- **Test Implementation**: John Coltrane reference opens "A Love Supreme" video

## Recent Updates (September 2025)

### Navigation Improvements
- ✅ **Media Hub Toggle**: 25% larger buttons for switching between Patti Smith and Merle Haggard
- ✅ **Return Button**: Fixed positioning at top: 50px, left: 35px for easy hub navigation
- ✅ **Enhanced Typography**: All navigation text increased by 25% for better visibility
- ✅ **High Contrast**: Replaced gray text with indigo throughout interface

### Audio Sync Enhancements (Merle Haggard)
- ✅ **Continuous Highlighting**: Works for entire 4.6-hour audiobook
- ✅ **Word Click Reliability**: 100+ sequential clicks work perfectly
- ✅ **Player Recovery**: Automatic recovery from any error state
- ✅ **Visual Feedback**: Every interaction has visual confirmation
- ✅ **Handler Persistence**: Survives unlimited chapter changes

## Installation

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with YouTube API support

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**
```
http://localhost:3000
```

## Main Routes

- `/` - Home page with Media Hub selection
- `/paginated` - Patti Smith "Just Kids" reader
- `/chapters` - Merle Haggard audio-synchronized viewer
- `/analyze` - Text analysis tools
- `/discover` - Entity browser
- `/cross-media-discovery` - Cross-media connections (experimental)

## Project Structure

```
united-tribes-fresh/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── paginated-book-viewer.tsx    # Patti Smith reader
│   │   │   ├── synchronized-transcript.tsx  # Audio sync display
│   │   │   ├── youtube-player-simple.tsx    # YouTube player
│   │   │   ├── book-search.tsx             # Search modal
│   │   │   ├── text-selection-modal.tsx    # Text selection
│   │   │   ├── discovery-card.tsx          # Cultural discovery
│   │   │   └── video-modal.tsx             # Video player modal
│   │   ├── pages/
│   │   │   ├── home.tsx                    # Media hub selection
│   │   │   └── auto-sync-chapters.tsx      # Merle Haggard viewer
│   │   ├── styles/
│   │   │   ├── video-link.css             # Video link styling
│   │   │   └── animations.css             # Visual effects
│   │   └── data/
│   │       ├── just-kids-cleaned.json     # Patti Smith book
│   │       ├── transcript-PSN8N2v4oq0.json # Merle transcript
│   │       └── entities/                  # Entity definitions
│   └── public/
│       └── authentic-chapters-PSN8N2v4oq0.json # Chapter data
└── server/
    ├── routes/                             # API endpoints
    └── services/                           # Business logic
```

## Key Components

### PaginatedBookViewer (Patti Smith)
- Page rendering with entity highlighting
- Search and discovery integration
- Video modal triggers for multimedia
- Return to Media Hub navigation

### Auto-Sync Chapters (Merle Haggard)
- Word-level audio synchronization
- Real-time highlighting with visual feedback
- Click-to-seek functionality
- Chapter navigation with persistence

### Media Hub Toggle
- Large, accessible toggle buttons
- Visual distinction between hubs
- Smooth transitions between content
- Persistent state management

## Testing Audio Sync

### Quick Verification
```javascript
// In browser console on /chapters route

// 1. Check player ready
window.audioSync

// 2. Test basic seek
window.audioSync.seekTo(30)

// 3. Play and watch highlighting
window.audioSync.playVideo()
// Yellow highlight should follow words

// 4. Click any word
// Should see green pulse + seek to that word
```

### Visual Feedback Guide

| State | Visual Effect | Duration |
|-------|--------------|----------|
| **Hover** | Blue background + underline | Instant |
| **Click** | Green pulse + ripple | 400ms |
| **Current** | Yellow glow + bold | Continuous |
| **Loading** | Pulsing opacity | 1.5s loop |

## Technologies Used

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS + Custom CSS modules
- **State Management**: React Hooks
- **Build System**: Vite
- **Video**: YouTube IFrame API
- **Data**: JSON-based content storage

## Performance Metrics

### Patti Smith Reader
- 79,435 words with instant search
- 304 pages with smooth navigation
- 60+ entities with smart detection

### Merle Haggard Audio Sync
- 43,263 words with timestamps
- 100ms update frequency for highlighting
- 200ms tolerance for word matching
- 10-second recovery timeout

## Known Issues & Limitations

- Multi-line book titles may not highlight completely
- Entity overlap handling needs refinement
- Mobile responsiveness not fully optimized
- YouTube API required for audio features

## Future Enhancements

- Additional book titles and audiobooks
- More multimedia content types
- User annotations and bookmarks
- Reading statistics and progress tracking
- Social sharing features
- Mobile-responsive design
- External API integrations (Wikipedia, MusicBrainz)

## Contributing

This is an experimental POC in active development. Feedback and suggestions welcome via GitHub issues.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- "Just Kids" by Patti Smith
- "My House of Memories" by Merle Haggard
- Entity data curated for 1960s-1970s cultural scene
- YouTube API for video and audio embedding
- Community feedback for UI improvements

---

**Version**: 2.0.0  
**Last Updated**: September 2025  
**Port**: 3000 (default)  
**Status**: Active Development  
**GitHub**: https://github.com/jdagogo/united-by-replit