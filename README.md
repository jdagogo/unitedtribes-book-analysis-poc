# UnitedTribes Book Analysis POC

A proof-of-concept application for analyzing and exploring cultural references in literature, currently focused on Patti Smith's "Just Kids" memoir.

## Current Status

This is an experimental POC exploring different approaches to text analysis and cultural entity discovery. The project has evolved through multiple iterations with varying degrees of success.

## What's Working

### Paginated Book Reader (`/paginated`)
- Basic pagination system for reading "Just Kids"
- Chapter navigation sidebar  
- Entity highlighting for cultural references (musicians, artists, authors, venues)
- Entity information popups with cultural context
- Basic search functionality for discovering entities
- Consolidated entity aliases (e.g., "Robert" and "Mapplethorpe" map to "Robert Mapplethorpe")

### Audio Synchronization (`/chapters`) 
- YouTube audio player integration for Merle Haggard audiobook
- Word-level timestamp synchronization
- Chapter-based navigation
- Real-time word highlighting during playback

*Note: Audio sync features were developed for a different book and are not integrated with the "Just Kids" reader*

## Known Issues & Ongoing Challenges

### Entity Detection
- Currently using a manually curated list of ~60 entities
- Attempted automated extraction has had limited success
- Entity highlighting sometimes creates display issues with overlapping matches
- Many cultural references still missing from the curated list

### Technical Issues
- Performance degrades with large numbers of entities
- Text display occasionally shows HTML artifacts
- Mobile experience needs significant improvement
- Integration between different book systems is incomplete

### Unresolved Goals
- Automated entity extraction using NLP (multiple attempts, limited success)
- Cross-media discovery connections (partially implemented)
- Reliable audio-text synchronization for commercial audiobooks
- Comprehensive cultural reference mapping

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

## Recent Work

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