# Just Kids Digital Reader

A web application for reading Patti Smith's "Just Kids" with integrated search and discovery features.

## Current Features

### Book Reader (`/paginated`)
- 304-page digital version of "Just Kids"
- Chapter navigation sidebar (19 chapters)
- Previous/Next page navigation
- Direct page jump functionality
- Keyboard navigation (arrow keys for page turning, Ctrl/Cmd+F for search)
- Responsive text sizing (22px for comfortable reading)

### Search & Discover System
- Full-text search across entire book (79,435 words)
- Search modal with contextual results (shows 150 characters around matches)
- Quick discovery buttons for common entities (Robert, Dylan, Warhol, Chelsea Hotel, Rimbaud)
- Search term highlighting on pages after navigation
- Unified "Search & Discover" interface in navigation bar

### Text Selection & Analysis
- Text selection triggers discovery modal (10+ character minimum)
- User can provide context for selected passages
- Cultural entity database with ~60 key figures/locations from the book
- Entity highlighting in book text with color coding by type (musicians, artists, authors, venues)

### Audio Features (`/chapters`)
- Separate audiobook player for Merle Haggard content
- Word-level synchronization with YouTube audio
- Not integrated with Just Kids reader

## Technical Implementation

### Frontend
- React with TypeScript
- Vite build system
- Tailwind CSS for styling
- Responsive design with media queries

### Backend  
- Express server with TypeScript
- Smart analysis endpoint with cultural database
- Routes for discovery and search functionality

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, Node.js  
- **Database**: SQLite (local development)
- **Styling**: Tailwind CSS, inline styles

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Main Routes

- `/` - Home page
- `/paginated` - "Just Kids" reader with entity discovery
- `/chapters` - Audio-synchronized transcript viewer (Merle Haggard)
- `/analyze` - Text analysis tools (in development)
- `/discover` - Entity browser
- `/cross-media-discovery` - Cross-media connections (experimental)

## Project Structure

```
/client
  /src
    /components       # React components
    /pages           # Page components  
    /lib            # Utilities
    /styles         # CSS files
  /public
    /transcripts    # Book text files
    
/server
  /routes          # API endpoints
  /services        # Business logic
  
/data             # Entity data and mappings
/entity-extraction # Python scripts for entity extraction attempts
```

## Recent Work (December 2024 Session)

### Attempted Improvements with Mixed Results

#### Book Title Recognition (C- Grade)
- Implemented fuzzy matching for 44 book titles from Goodreads list
- **Major Failure**: "Love and Mr. Lewisham" consistently fails to highlight as complete title
- Partial matches work for some titles
- Multi-line book titles break the matching logic
- Regex patterns became overly complex and fragile
- Multiple attempts to fix resulted in HTML corruption issues

#### Author Recognition (Passable)
- Added recognition for 44 authors with name variations
- Last names generally work (e.g., "Rimbaud" → Arthur Rimbaud)
- Blue highlighting distinguishes authors from book titles
- No smart context awareness implemented
- Basic functionality without sophistication

#### Bug Fixes (Eventually Successful After Multiple Attempts)
- Fixed extra spaces around entity highlighting (took 4+ attempts)
- Resolved HTML attributes appearing as visible text
- Fixed context highlighting selecting wrong paragraphs (partially)
- Addressed search term truncation issues

### Known Unresolved Issues
- "Love and Mr. Lewisham" book title recognition completely broken
- Context highlighting unreliable for multi-line text
- Search navigation sometimes highlights wrong content
- Fuzzy matching patterns fail with line breaks
- No comprehensive testing framework

## Recent Work (Previous Sessions)

### Entity System for "Just Kids"
- Manually curated 60+ cultural entities from 1960s-70s NYC scene
- Added cultural context, time periods, and related works for each entity
- Implemented alias system to handle name variations
- Created entity search with quick discovery buttons
- Fixed HTML rendering issues with overlapping entity matches

### Previous Iterations
- Attempted HarperCollins audiobook integration (unsuccessful)
- Built working YouTube-based audio sync for different book
- Explored various NLP approaches for entity extraction
- Created D3.js network visualizations (performance issues)

## What We've Learned

This POC has explored multiple approaches with mixed results:
- Manual curation works better than our automated extraction attempts
- Audio synchronization is highly dependent on source material quality
- Entity overlap and alias management is more complex than anticipated
- Performance optimization is critical for text highlighting at scale

## Future Exploration

Potential directions (not promises):
- Better NLP models for entity extraction
- Improved performance for large-scale entity highlighting
- Mobile-first redesign
- Integration of different book systems
- External API connections (Wikipedia, MusicBrainz)

## Contributing

This is an experimental project in active development. Feedback and suggestions welcome, though many features are still exploratory.

## License

MIT