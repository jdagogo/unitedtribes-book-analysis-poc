# United Tribes Fresh - Interactive Literary Experience Platform

## 🎯 Overview
United Tribes Fresh is an innovative digital reading platform that transforms classic literature into immersive, multimedia experiences. The platform features Patti Smith's memoir "Just Kids" enhanced with cultural discovery modals, and Merle Haggard's "My House of Memories" with perfect audio-text synchronization.

### ✨ Latest Features (December 15, 2024)
- **6 Cultural Discovery Passages**: Full multimedia integration for key moments in "Just Kids"
- **11 Unique Media Items**: Instagram, YouTube, TikTok, articles, books, and streaming content
- **Micropayment Demonstrations**: $0.25 to $250 pricing models for various content types
- **Enhanced Visual Design**: Purple/pink gradients for articles, yellow highlighting for discovery passages
- **Screenshot Article System**: Local article previews bypassing CORS restrictions

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/jdagogo/united-by-replit.git
cd united-tribes-fresh

# Install dependencies
npm install

# Start development server
npm run dev

# Access the application
http://localhost:3000
```

## 🎭 Cultural Discovery System (NEW)

### Interactive Discovery Modals
The platform now features sophisticated cultural discovery modals that appear when users highlight specific passages in "Just Kids". These modals provide rich, contextual information with embedded media.

#### Currently Enhanced Passages (Complete List)

1. **Robert Mapplethorpe's Freaks Exhibition** (Page 207)
   - Trigger: "The show consisted of Robert's collages that centered on freaks..."
   - Content:
     - Instagram embed: Mapplethorpe's actual altarpiece from Art Gallery NSW
     - YouTube: Tod Browning's "Freaks" (1932) - "One of Us" scene
     - Patti Smith's Substack: "Taking Pictures" reflection
     - Direct link to Art Gallery NSW exhibition

2. **Edie Sedgwick's Death** (Page 209)
   - Trigger: "The lady's dead. Bobby called from California..."
   - Content:
     - Edie pirouetting photograph by Enzo Sellerio (1965)
     - **Edie Sedgwick Is the Poster Girl for the No-Pants Look** (Vogue 2023)
     - Screenshot-based article preview with $0.25 micropayment demo

3. **Jann Wenner & Rolling Stone** (Page 210)
   - Trigger: "I called Jann Wenner at Rolling Stone..."
   - Content:
     - Bob Dylan "Bringing It All Back Home" album cover
     - **Truck Driving Man** (Rolling Stone 1967) - Tom Wolfe article
     - YouTube: Bob Dylan - "Gates of Eden" performance
     - Context about Lotte Lenya album reference

4. **Poetry Reading at St. Mark's** (Page 210)
   - Trigger: "You need to show people what you can do. Why don't you do a reading?"
   - Content:
     - YouTube: Patti Smith performing at St. Mark's Poetry Project (1971)
     - TikTok: "Poet. Prophet. Punk." - Horses performance (1976)
     - **Patti Smith Announces 50th Anniversary Horses Tour** (Pitchfork)
     - Tour tickets: $125-$250 purchase demonstrations

5. **HBO Documentary** (Page 211)
   - Trigger: "I had watched Robert create..."
   - Content:
     - HBO Max: "Mapplethorpe: Look at the Pictures" documentary
     - Time-stamped preview (starts at 1:14)
     - $1.00 streaming demo
     - Larger modal size (20% increase)

6. **The Age of Rock II** (Page 211)
   - Trigger: "The Age of Rock II" or "Jonathan Eisen"
   - Content:
     - Book cover image
     - Purchase link via Biblio.com
     - $15.00 book purchase demo
     - Context on rock criticism's emergence

## 📊 Discovery Content Inventory (December 15, 2024)

### Media Integration Summary
- **Total Discovery Passages**: 6 unique text triggers
- **Total Media Items**: 11+ pieces of embedded/linked content
- **Platform Integrations**: Instagram, YouTube, TikTok, HBO Max, Substack
- **Article Screenshots**: 5 (Rolling Stone, Vogue, Pitchfork, etc.)
- **Price Points**: $0.25, $0.50, $1.00, $15.00, $125.00, $250.00

### Complete Media Inventory by Type:

#### Instagram Embeds (1)
- Mapplethorpe's altarpiece from Art Gallery NSW

#### YouTube Videos (3)
- Tod Browning's "Freaks" (1932) - "One of Us" scene
- Bob Dylan - "Gates of Eden" live performance
- Patti Smith at St. Mark's Poetry Project (1971)

#### TikTok Embeds (1)
- "Poet. Prophet. Punk." - Patti Smith performing Horses (1976)

#### Article Screenshots (5)
- **Rolling Stone**: "Truck Driving Man" by Tom Wolfe (1967)
- **Vogue**: "Edie Sedgwick Is the Poster Girl for the No-Pants Look" (2023)
- **Pitchfork**: "Patti Smith Announces 50th Anniversary Horses Tour"
- **Substack**: Patti Smith's "Taking Pictures"
- **Book Cover**: "The Age of Rock II" by Jonathan Eisen

#### Streaming Demos (1)
- HBO Max: "Mapplethorpe: Look at the Pictures"

#### Museum/Gallery Links (1)
- Art Gallery of New South Wales - Mapplethorpe Exhibition

### Visual Enhancements
- **Yellow Highlighting**: All discovery passages highlighted for easy identification
- **Purple/Pink Gradients**: Article preview cards with enhanced typography
- **Modal Size**: 20% larger (960px width) for better readability
- **Font Hierarchy**: Bold headlines (text-xl font-extrabold) for articles

### Technical Implementation

#### Backend Architecture
- **Route**: `/server/routes/smart-analysis.ts`
- **Pattern Matching**: Multiple trigger phrases per passage
- **Media Handling**: Screenshot fallback for CORS-restricted content
- **Price Integration**: Micropayment demonstrations from $0.25 to $250

#### Frontend Components
- **Modal Component**: `/client/src/components/text-selection-modal.tsx`
- **Discovery Card**: `/client/src/components/discovery-card.tsx`
- **Features**:
  - Markdown parsing for bold text (**headlines**)
  - Multi-line text support with proper formatting
  - Responsive media embeds
  - Tab navigation (Overview, Media, Connections)
  - Error handling for failed media loads

## 📊 Complete Data Architecture

### Primary Data Sources

#### 1. **Patti Smith "Just Kids"**
- **Main Content**: `/client/src/data/just-kids-cleaned.json`
  - 304 pages, 79,435 words
  - 19 chapters + Foreword
  - Enhanced with cultural discovery triggers

#### 2. **Merle Haggard "My House of Memories"**
- **Transcript**: `/client/public/transcript-PSN8N2v4oq0.json`
  - 43,263 words with timestamps
  - 4.6 hours of audio
  - Word-level synchronization

#### 3. **Cultural Discovery Data**
- **Smart Analysis**: `/server/routes/smart-analysis.ts`
  - AI-powered content analysis
  - Rich media associations
  - Historical context generation
  - Connection mapping

## 🎨 Key Features

### 1. Enhanced Patti Smith Reader
- **Text Selection**: Highlight any text to discover cultural connections
- **Discovery Modals**: Rich multimedia popups with context
- **Entity Highlighting**: 60+ cultural references auto-highlighted
- **Smart Search**: Full-text search with entity detection

### 2. Audio-Synchronized Merle Haggard Viewer
- **Perfect Sync**: Word-level timing with YouTube audio
- **Visual Feedback**:
  - Yellow glow for current word
  - Green pulse on click
  - Blue hover effects
- **Chapter Navigation**: 18 chapters with instant seek

### 3. Cultural Discovery Features (NEW)
- **Embedded Media**: Instagram, YouTube, artwork galleries
- **Article Integration**: Professional formatting with bold headlines
- **Context Generation**: AI-powered historical and cultural context
- **Connection Mapping**: Related people, works, and events

## 📁 Project Structure

```
united-tribes-fresh/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── text-selection-modal.tsx    # Discovery modal system
│   │   │   ├── discovery-card.tsx          # Rich media cards
│   │   │   ├── paginated-book-viewer.tsx   # Patti Smith reader
│   │   │   └── synchronized-transcript.tsx # Merle audio sync
│   │   ├── pages/
│   │   │   ├── home.tsx                   # Media hub
│   │   │   ├── paginated.tsx              # Book reader route
│   │   │   └── auto-sync-chapters.tsx     # Audio viewer route
│   │   └── data/
│   │       └── just-kids-cleaned.json     # Book content
│   └── public/
│       └── transcript-PSN8N2v4oq0.json    # Audio transcript
│
├── server/
│   ├── routes/
│   │   ├── smart-analysis.ts              # Cultural discovery API
│   │   ├── discovery.ts                   # Entity discovery
│   │   └── routes.ts                      # Route registration
│   └── index.ts                           # Server entry
│
└── README.md                              # This file
```

## 🔌 API Endpoints

### Discovery APIs (NEW)
- `POST /api/smart-analysis` - AI-powered text analysis
- `POST /api/discovery/discover` - Cultural entity discovery
- `GET /api/discovery/entities` - Available entities list
- `GET /api/discovery/entity/:id` - Specific entity details

### Core Routes
- `GET /paginated` - Patti Smith book reader
- `GET /chapters` - Merle Haggard audio viewer
- `GET /analyze` - Text analysis tools

## 🛠 Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Custom modules
- **Backend**: Express.js with TypeScript
- **Build**: Vite
- **Media**: YouTube IFrame API, Instagram embeds
- **AI**: OpenAI GPT-4 for content analysis

## 🧪 Testing Discovery Features

### Test Cultural Discovery Modals
1. Navigate to http://localhost:3000/paginated
2. Go to page 207
3. Highlight "Robert's collages that centered on freaks"
4. Verify modal appears with:
   - Instagram embeds loading
   - Artwork displaying
   - YouTube video playing
   - Bold article headlines

### Console Testing
```javascript
// Test discovery API
fetch('/api/smart-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Edie Sedgwick",
    context: "Testing discovery"
  })
}).then(r => r.json()).then(console.log)
```

## 📈 Performance Metrics

### Discovery System
- Modal load time: <200ms
- Media embed time: <500ms
- Context generation: <1s
- Pattern matching: Real-time

### Overall Performance
- Book load: <100ms
- Audio sync accuracy: ±50ms
- Search speed: <100ms for 79k words

## 🚀 Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=optional_postgres_url
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🐛 Known Issues

1. Some Instagram embeds may not load due to CORS
2. Mobile responsiveness needs optimization
3. Large media files may load slowly
4. YouTube API required for audio features

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

### Content Sources
- "Just Kids" by Patti Smith (Ecco, 2010)
- "My House of Memories" by Merle Haggard
- Vogue Magazine articles
- Ultimate Classic Rock archives
- Art Gallery of New South Wales

### Media Partners
- Instagram (@thisispattismith)
- YouTube content creators
- Substack writers

### Technical Stack
- React community
- YouTube IFrame API
- OpenAI GPT-4
- Tailwind CSS

## 📞 Contact & Support

- **GitHub**: https://github.com/jdagogo/united-by-replit
- **Issues**: https://github.com/jdagogo/united-by-replit/issues
- **Demo**: http://localhost:3000

---

**Version**: 3.0.0
**Last Updated**: December 2024
**New Features**: Cultural Discovery System with Rich Media Integration
**Status**: Production-Ready with Active Development

## 🚧 Recent Updates (December 2024)

### Added Cultural Discovery Content
- Robert Mapplethorpe's collage artwork and references
- Edie Sedgwick multimedia collection with Vogue integration
- Jann Wenner/Rolling Stone passage with Dylan album materials
- Professional article formatting with bold headlines
- Embedded Instagram, YouTube, and gallery content

### Technical Improvements
- Enhanced markdown parsing for bold text in descriptions
- Improved media embed error handling
- Responsive modal layouts
- Hot module replacement for faster development

### Coming Soon
- Additional passages from "Just Kids" with discovery content
- Mobile-optimized modal layouts
- Social sharing features
- User annotation system