# United Tribes Fresh - Complete Documentation

## 🎯 Overview
United Tribes Fresh is a comprehensive digital media platform featuring interactive book readers, audio-synchronized transcripts, and multimedia cultural discovery tools. The application combines Patti Smith's "Just Kids" memoir with Merle Haggard's "My House of Memories" audiobook into an integrated reading and listening experience.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh

# Install dependencies
cd client
npm install

# Start development server
npm run dev

# Access the application
http://localhost:3000
```

## 📊 Complete Data Architecture

### Primary Data Locations

#### 1. **Patti Smith "Just Kids" Book Data**
- **Main Book Content**: `/client/src/data/just-kids-cleaned.json`
  - Format: JSON with page-by-page content
  - Pages: 304 total pages
  - Chapters: 19 chapters + Foreword
  - Word Count: 79,435 words
  - Structure: `{ pages: [{ pageNumber, content, chapter, chapterTitle, wordCount }] }`

- **Literary Works & References**: `/client/src/data/literary-works.ts`
  - 44 books from Patti Smith's Goodreads reading list
  - Author detection and highlighting
  - Color-coded by category (poetry, fiction, philosophy)

- **Book Titles Recognition**: `/client/src/data/book-titles-fuzzy.ts`
  - Fuzzy matching for book title detection
  - Handles variations and partial matches
  - 15,510 bytes of title data

- **Author Recognition**: `/client/src/data/author-recognition.ts`
  - 60+ author names for entity detection
  - Includes poets, writers, philosophers
  - 6,511 bytes of author data

#### 2. **Merle Haggard "My House of Memories" Audio Data**

- **Complete Transcript with Timestamps**: `/client/public/transcript-PSN8N2v4oq0.json`
  - Size: 4.8MB (4,840,724 bytes)
  - Word Count: 43,263 words
  - Format: Word-level timestamps for audio sync
  - Structure: `{ words: [{ word, start, end }] }`
  - Audio Duration: 4.6 hours

- **Chapter Definitions**: `/client/public/authentic-chapters-PSN8N2v4oq0.json`
  - 18 chapters with start/end timestamps
  - Chapter titles and navigation data
  - Size: 10,985 bytes
  - Structure: `{ chapters: [{ title, start, end, wordCount }] }`

- **Entity Analysis (124 Entities)**: 
  - Main Analysis: `/client/src/data/authentic-merle-analysis.ts` (162KB)
  - Entity JSON: `/client/public/authentic_merle_entities.json` (75KB)
  - Complete Fresh Air Entities: `/client/public/fresh_air_complete_entities.json` (23KB)
  - Categories: Musicians, Journalists, Places, Music, Organizations
  - Entity Types: person, place, work, event, organization

- **Audio Timestamp Mapping**:
  - Primary: `/client/src/data/audio-timestamp-mapper.ts` (31KB)
  - Enhanced: `/client/src/data/audio-timestamp-mapper-new.ts` (22KB)
  - Handles word-level synchronization with YouTube audio

#### 3. **Supporting Data Files**

- **Partner Media Integration**: `/client/src/data/partner-media.ts`
  - Cross-media connections
  - Related content links
  - Size: 15,722 bytes

- **Data Sources Registry**: `/client/src/data/data-sources.ts`
  - Central registry of all data sources
  - API endpoints and data locations
  - Size: 9,424 bytes

- **Book Content Parser**: `/client/src/data/book-content-parser.ts`
  - Utilities for parsing book content
  - Entity extraction helpers
  - Size: 5,121 bytes

### Data Statistics Summary

| Data Source | Files | Total Size | Content Volume |
|------------|-------|------------|----------------|
| Patti Smith Book | 4 files | ~100KB | 304 pages, 79,435 words, 60+ entities |
| Merle Haggard Audio | 6 files | ~5.1MB | 43,263 words, 124 entities, 4.6 hours |
| Supporting Data | 5 files | ~68KB | Parsers, utilities, cross-references |

## 📁 Complete Project Structure

```
united-tribes-fresh/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── paginated-book-viewer.tsx      # Patti Smith reader (main component)
│   │   │   ├── synchronized-transcript.tsx    # Merle Haggard audio sync display
│   │   │   ├── youtube-player-simple.tsx      # YouTube player integration
│   │   │   ├── book-search.tsx               # Full-text search modal
│   │   │   ├── text-selection-modal.tsx      # Text selection & discovery
│   │   │   ├── discovery-card.tsx            # Cultural connection cards
│   │   │   ├── video-modal.tsx               # Video player modal
│   │   │   ├── entity-browser.tsx            # Entity exploration
│   │   │   └── results-dashboard.tsx         # Merle Haggard entity dashboard
│   │   │
│   │   ├── pages/
│   │   │   ├── home.tsx                      # Media hub selection page
│   │   │   ├── paginated.tsx                 # Patti Smith book reader route
│   │   │   ├── auto-sync-chapters.tsx        # Merle Haggard viewer route
│   │   │   ├── analyze.tsx                   # Text analysis tools
│   │   │   └── discover.tsx                  # Entity discovery browser
│   │   │
│   │   ├── data/                             # [PRIMARY DATA LOCATION]
│   │   │   ├── just-kids-cleaned.json        # Patti Smith book (304 pages)
│   │   │   ├── authentic-merle-analysis.ts   # Merle analysis (124 entities)
│   │   │   ├── audio-timestamp-mapper.ts     # Audio sync mappings
│   │   │   ├── literary-works.ts             # 44 books from reading list
│   │   │   ├── book-titles-fuzzy.ts          # Book title recognition
│   │   │   ├── author-recognition.ts         # 60+ author entities
│   │   │   ├── partner-media.ts              # Cross-media connections
│   │   │   └── data-sources.ts               # Data registry
│   │   │
│   │   └── styles/
│   │       ├── video-link.css                # Video link styling
│   │       ├── animations.css                # Visual effects & feedback
│   │       ├── entity-highlighting.css       # Entity color system
│   │       ├── literary-highlighting.css     # Book/author highlights
│   │       └── entity-spacing-fix.css        # Layout adjustments
│   │
│   └── public/                               # [STATIC DATA LOCATION]
│       ├── transcript-PSN8N2v4oq0.json       # Merle transcript (4.8MB)
│       ├── authentic-chapters-PSN8N2v4oq0.json # Chapter definitions
│       ├── authentic_merle_entities.json     # 124 entities extracted
│       └── fresh_air_complete_entities.json  # Complete entity analysis
│
├── server/
│   ├── routes/
│   │   ├── api.js                           # Main API routes
│   │   └── media.js                          # Media-specific endpoints
│   └── services/
│       ├── entity-service.js                 # Entity extraction logic
│       └── search-service.js                 # Search functionality
│
├── docs/
│   ├── unified-data-lake-architecture.md    # Data lake design docs
│   └── CLAUDE.md                             # Claude integration docs
│
└── README.md                                 # This file
```

## 🎨 Key Features & Components

### 1. Patti Smith "Just Kids" Reader
- **Component**: `paginated-book-viewer.tsx`
- **Data**: `just-kids-cleaned.json` (304 pages)
- **Features**:
  - Page-by-page navigation with smooth transitions
  - Entity highlighting (60+ cultural references)
  - Book title detection (44 books)
  - Author recognition and color coding
  - Full-text search across entire book
  - Text selection for cultural discovery
  - Video modal integration for music references

### 2. Merle Haggard Audio-Synchronized Viewer
- **Component**: `auto-sync-chapters.tsx`
- **Data**: `transcript-PSN8N2v4oq0.json` (43,263 words)
- **Features**:
  - Word-level synchronization with YouTube audio
  - Real-time highlighting (yellow glow effect)
  - Click-to-seek any word
  - 18 chapter navigation
  - 124 entity extraction and display
  - Visual feedback system:
    - Hover: Blue background
    - Click: Green pulse animation
    - Current: Yellow glow
  - Auto-recovery from player errors

### 3. Entity Recognition System
- **Total Entities**: 184+ unique entities
  - Patti Smith: 60+ entities
  - Merle Haggard: 124 entities
- **Categories**:
  - People (musicians, writers, artists)
  - Places (venues, cities, neighborhoods)
  - Works (books, albums, songs)
  - Organizations (labels, institutions)
  - Events (concerts, festivals)

## 🔌 API Endpoints

### Core Routes
- `GET /` - Home page with media hub selection
- `GET /paginated` - Patti Smith book reader
- `GET /chapters` - Merle Haggard audio viewer
- `GET /analyze` - Text analysis tools
- `GET /discover` - Entity browser

### Data APIs
- `GET /api/book/:bookId` - Get book content
- `GET /api/transcript/:id` - Get transcript data
- `GET /api/entities/:mediaType` - Get entity list
- `POST /api/search` - Full-text search
- `GET /api/chapters/:id` - Get chapter data

## 🛠 Technical Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Custom CSS modules
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Build Tool**: Vite
- **Audio/Video**: YouTube IFrame API
- **Data Format**: JSON
- **Testing**: Browser console commands (see Testing section)

## 🧪 Testing & Verification

### Audio Sync Testing (Merle Haggard)
```javascript
// In browser console at http://localhost:3000/chapters

// 1. Verify player is ready
window.audioSync

// 2. Test seek functionality
window.audioSync.seekTo(30)  // Jump to 30 seconds

// 3. Play and verify highlighting
window.audioSync.playVideo()
// Yellow highlight should follow words being spoken

// 4. Test word click
// Click any word in transcript - should see green pulse and audio jump

// 5. Test chapter navigation
// Use chapter buttons - should jump to chapter start
```

### Search Testing (Patti Smith)
```javascript
// At http://localhost:3000/paginated

// 1. Open search (Ctrl/Cmd + F)
// 2. Search for "Robert Mapplethorpe"
// 3. Verify highlighting and navigation
// 4. Test entity highlighting colors
```

## 📈 Performance Metrics

### Data Loading
- Patti Smith book: <100ms load time
- Merle transcript: ~200ms load time (4.8MB)
- Entity processing: <50ms

### Audio Sync Performance
- Update frequency: 100ms (10 updates/second)
- Word matching tolerance: 200ms
- Click response: <50ms
- Recovery timeout: 10 seconds

### Search Performance
- Full-text search: <100ms for 79,435 words
- Entity highlighting: Real-time
- Page navigation: Instant

## 🐛 Known Issues & Limitations

1. Multi-line book titles may not highlight completely
2. Entity overlap can cause display issues
3. Mobile responsiveness not fully optimized
4. YouTube API required for audio features
5. Large transcript file (4.8MB) may load slowly on slow connections

## 🚀 Deployment

### Local Development
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

### Production Build
```bash
cd client
npm run build
npm run preview
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
VITE_YOUTUBE_API_KEY=your_api_key_here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Content Sources**:
  - "Just Kids" by Patti Smith (Ecco, 2010)
  - "My House of Memories" by Merle Haggard with Tom Carter
  - Fresh Air NPR Interview (1995, re-aired 2025)

- **Data Processing**:
  - Manual entity curation for 1960s-1970s NYC cultural scene
  - YouTube API for audio synchronization
  - Goodreads for Patti Smith's reading list

- **Technical Contributions**:
  - React community for component patterns
  - YouTube IFrame API documentation
  - Tailwind CSS for styling system

## 📞 Contact & Support

- **GitHub Issues**: https://github.com/jdagogo/united-by-replit/issues
- **Documentation**: See `/docs` folder for detailed guides
- **Live Demo**: http://localhost:3000 (local only)

---

**Version**: 2.1.0  
**Last Updated**: September 2025  
**Data Last Verified**: September 2025  
**Total Project Size**: ~6MB (including all data)  
**Active Development Status**: Production-Ready with ongoing enhancements