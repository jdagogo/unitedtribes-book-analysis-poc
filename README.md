# United Tribes Book Analysis POC

A digital reader for "Just Kids" by Patti Smith with interactive entity recognition, cultural discovery features, and multimedia integration.

## Features

### Core Reading Experience
- **Paginated Book Viewer**: Clean, distraction-free reading interface with smooth page navigation
- **Chapter Navigation**: Quick jump to any of 19 chapters with visual chapter cards
- **Page Controls**: Navigate by page or chapter with enhanced navigation buttons
- **Reading Progress**: Visual indicators showing current page (1-304) and chapter
- **Keyboard Navigation**: Arrow keys for page turning, Ctrl/Cmd+F for search

### Entity Recognition & Highlighting
- **Smart Entity Detection**: Automatically identifies and highlights people, places, books, and cultural references
- **Color-Coded System**:
  - People: Blue highlighting
  - Places: Green highlighting  
  - Books/Authors: Orange highlighting
  - Music/Video: Purple text (subtle styling)

### Search & Discovery
- **Full-Text Search**: Search across the entire book (79,435 words)
- **Context Discovery**: Select any text passage to explore deeper cultural connections
- **Dual Functionality**: Text selection offers both search and cultural discovery options
- **Smart Suggestions**: Pre-populated search suggestions for key themes and topics
- **Highlighted Results**: Search terms highlighted in context with surrounding text

### Multimedia Integration
- **Video Modal**: Embedded YouTube videos for musical references
- **Interactive Links**: Click on highlighted music references to view related videos
- **Test Implementation**: John Coltrane reference opens video modal with "A Love Supreme"

## Recent UI Improvements (December 2024)

### Typography & Readability
- Increased all navigation text and buttons by 25% for better visibility
- Enhanced modal text sizes by 20-30% across all components
- Replaced all gray text with high-contrast indigo colors throughout
- Improved search input field with larger, more readable text

### Navigation Enhancements
- Repositioned and aligned navigation elements for better usability
- Optimized Search & Discover button size and placement
- Added visual feedback on all interactive elements
- Streamlined navigation bar layout

### Modal Improvements
- **Search & Discover Modal**: Larger fonts, clear button for search input, better contrast
- **Text Selection Modal**: Added dual Search/Discover functionality with split buttons
- **Discovery Card**: Simplified header, increased text sizes, improved readability
- **Video Modal**: Elegant design with gradient header and seamless YouTube integration

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS modules
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Build System**: Vite for fast development and hot module replacement
- **Data**: JSON-based book content and entity definitions

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── paginated-book-viewer.tsx    # Main book reader
│   │   ├── book-search.tsx              # Search & Discover modal
│   │   ├── text-selection-modal.tsx     # Text selection handler
│   │   ├── discovery-card.tsx           # Cultural discovery
│   │   └── video-modal.tsx              # YouTube video player
│   ├── styles/
│   │   └── video-link.css              # Video link styling
│   └── data/
│       ├── just-kids-cleaned.json      # Book content
│       └── entities/                   # Entity definitions
server/
├── routes/                              # API endpoints
└── services/                            # Business logic
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/united-tribes-fresh.git

# Navigate to project directory
cd united-tribes-fresh

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000/paginated
```

## Main Routes

- `/` - Home page
- `/paginated` - "Just Kids" reader with full feature set
- `/chapters` - Audio-synchronized transcript viewer (Merle Haggard content)
- `/analyze` - Text analysis tools
- `/discover` - Entity browser
- `/cross-media-discovery` - Cross-media connections (experimental)

## Key Components

### PaginatedBookViewer
The main reading interface handling:
- Page rendering and navigation
- Entity highlighting and detection
- Integration with search and discovery features
- Video modal triggers for multimedia content

### BookSearch
Comprehensive search functionality with:
- Real-time search results with context
- Entity filtering and quick discovery buttons
- Clear button for search input
- High-contrast, readable text throughout

### TextSelectionModal
Enhanced text selection with:
- Dual Search/Discover functionality
- User context input for deeper exploration
- Quick suggestion pills for common queries
- Character and word count display

### VideoModal
Clean video playback featuring:
- YouTube embedding with full controls
- Gradient header design
- Optional context display
- Responsive sizing

## Entity System

### Cultural Database
- 60+ manually curated entities from 1960s-70s NYC scene
- Includes musicians, artists, authors, and venues
- Each entity includes cultural context and time periods
- Alias system handles name variations

### Book & Author Recognition
- 44 books from "Just Kids" Goodreads reading list
- Author detection with name variations
- Color-coded highlighting system
- Fuzzy matching for partial references

## Known Issues & Limitations

- Multi-line book titles may not highlight completely
- Context highlighting can be inconsistent for complex selections
- Entity overlap handling needs refinement
- Mobile responsiveness not fully optimized

## Audio Features (`/chapters` route)

Separate implementation for audiobook synchronization:
- Word-level sync with YouTube audio
- Merle Haggard's "My House of Memories" content
- 43,263 words with timestamps
- Not integrated with main Just Kids reader

## Future Enhancements

Potential areas for exploration:
- Additional book titles beyond "Just Kids"
- More multimedia content types (audio, images)
- User annotations and bookmarks
- Reading statistics and progress tracking
- Social sharing features
- Mobile-responsive design
- External API integrations (Wikipedia, MusicBrainz)

## Contributing

This is an experimental POC in active development. Feedback and suggestions are welcome.

## License

MIT

## Acknowledgments

- Book content: "Just Kids" by Patti Smith
- Entity data curated for 1960s-1970s NYC cultural scene
- YouTube API for video embedding
- Community feedback for UI improvements