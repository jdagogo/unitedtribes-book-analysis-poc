# United Tribes Fresh v4.0 - Next Generation Literary Platform

## 🚀 Version 4.0 - Development Branch

**⚠️ IMPORTANT: This is v4.0 development. v3.0 remains stable and untouched.**

### Version Status
- **v3.0 (Stable)**: Running on port 3000 at `/united-tribes-fresh`
- **v4.0 (Development)**: Running on port 3004 at `/united-tribes-fresh-v4`

## 🎯 What's New in v4.0

### Planned Features
- [ ] Enhanced yellow highlighting for discovery passages
- [ ] Improved modal loading performance
- [ ] Extended discovery content
- [ ] Mobile-responsive design
- [ ] User annotation system
- [ ] Social sharing features

### Development Goals
1. **Complete isolation from v3.0** - No shared dependencies or processes
2. **Port 3004** - Separate from v3.0's port 3000
3. **Independent git branch** - `v4-development` branch
4. **Backward compatibility** - Can switch to v3.0 instantly

## 📁 Project Structure

```
/united-tribes-fresh-v4/        # v4.0 Development
├── client/                     # React 18 frontend
├── server/                     # Express backend
├── README-v4.md               # This file
├── QUICK_START_v4.md          # v4.0 Quick start
└── package.json               # Configured for port 3004

/united-tribes-fresh/           # v3.0 Stable (UNTOUCHED)
└── [All v3.0 files remain unchanged]
```

## 🚀 Quick Start v4.0

```bash
# Navigate to v4.0 directory
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4

# Install dependencies (if not done)
npm install

# Start v4.0 on port 3004
npm run dev

# Access v4.0
http://localhost:3004
```

## 🔄 Version Management

### Running Both Versions Simultaneously
```bash
# Terminal 1: Run v3.0 (stable)
cd united-tribes-fresh
npm run dev  # Runs on port 3000

# Terminal 2: Run v4.0 (development)
cd united-tribes-fresh-v4
npm run dev  # Runs on port 3004
```

### Switching Between Versions
- **v3.0**: http://localhost:3000
- **v4.0**: http://localhost:3004

### Emergency Rollback to v3.0
```bash
# Simply navigate back to v3.0
cd /Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh
npm run dev
# v3.0 remains completely untouched and ready
```

## 🛠 Development Workflow

### Git Strategy
```bash
# v4.0 uses a separate branch
cd united-tribes-fresh-v4
git init
git checkout -b v4-development

# v3.0 remains on main branch
cd ../united-tribes-fresh
git checkout main  # Stable v3.0
```

### Making Changes in v4.0
1. All changes happen in `/united-tribes-fresh-v4`
2. v3.0 directory is never modified
3. Commits go to `v4-development` branch
4. Can merge to main when v4.0 is stable

## 📊 Feature Comparison

| Feature | v3.0 (Stable) | v4.0 (Development) |
|---------|---------------|-------------------|
| **Port** | 3000 | 3004 |
| **Directory** | /united-tribes-fresh | /united-tribes-fresh-v4 |
| **Branch** | main | v4-development |
| **Discovery Passages** | 6 working | 6+ enhanced |
| **Yellow Highlighting** | Not implemented | In development |
| **Mobile Support** | Limited | Enhanced (planned) |
| **Status** | Production Ready | Active Development |

## 🔌 API Endpoints (v4.0)

All endpoints available on port 3004:
- `http://localhost:3004/` - Home page
- `http://localhost:3004/paginated` - Patti Smith reader
- `http://localhost:3004/chapters` - Merle Haggard audio
- `http://localhost:3004/api/smart-analysis` - Discovery API

## 🐛 Known Issues (v4.0)

1. **In Development** - Features being added
2. **Not for production** - Use v3.0 for stable access

## 📝 Version Control

### v4.0 Version Card
- **Version**: 4.0.0
- **Status**: Development
- **Branch**: v4-development
- **Port**: 3004
- **Started**: September 2025

### Access Version Control
```
file:///Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4/version-control.html
```

## 🚨 Important Notes

1. **v3.0 is untouched** - Always available at port 3000
2. **v4.0 is experimental** - May have breaking changes
3. **Independent processes** - Can run both simultaneously
4. **Separate commits** - v4.0 changes don't affect v3.0

## 📞 Support

- **v3.0 Issues**: Use stable version at port 3000
- **v4.0 Testing**: Report issues for v4.0 development
- **GitHub**: Separate branches for each version

---

## 🎭 Cultural Discovery System Features

### Interactive Discovery Modals
The platform features sophisticated cultural discovery modals that appear when users highlight specific passages in "Just Kids". These modals provide rich, contextual information with embedded media.

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

---

## 📋 Development Session Report - Monday, September 23, 2024

### Session Overview
Attempted to implement yellow/blue highlighting for discovery passages in the Patti Smith "Just Kids" reader. Despite the highlighting system working elsewhere in the application, encountered persistent issues with highlighting specific passages.

### Primary Objective
Add visual highlighting to 6 discovery passages that trigger cultural context modals when clicked (listed above).

### Target Passage (Page 207)
**Text to highlight**: "The show consisted of Robert's collages that centered on freaks, but he prepared one fairly large altarpiece for the event."

### Issues Encountered

#### 1. **Text Source Mismatch**
- The book content is loaded from `/transcripts/just-kids-patti-smith/transcript.txt`
- However, the actual text displayed on page 207 doesn't exist in that file
- Discovery passage definitions exist in `/server/routes/smart-analysis.ts` but with different formatting

#### 2. **Character Encoding Issues**
- Discovered apostrophe mismatch: straight apostrophe (') vs curly apostrophe (')
- The displayed text uses curly quotes but our regex patterns used straight quotes
- Updated regex to match both: `/Robert['']s collages/`

#### 3. **Highlighting System Architecture**
- Blue highlighting exists and works elsewhere (confirmed by user)
- The `music-video` type only applies purple text, not blue background
- Highlighting is applied via the `highlightEntitiesInText` function in `paginated-book-viewer.tsx`
- Discovery passages need to be processed BEFORE entity highlighting to prevent text fragmentation

#### 4. **Data Flow Confusion**
- Book content appears to come from multiple sources:
  - `/client/public/transcripts/just-kids-patti-smith/transcript.txt` (doesn't contain our target text)
  - `/server/routes/smart-analysis.ts` (contains passage definitions)
  - `/server/routes/discovery.ts` (contains quotes with the text)
  - Actual rendered content source remains unclear

### Attempted Solutions

#### Attempt 1: Basic Regex Pattern
```javascript
const discoveryPassage1 = /The show consisted of Robert's collages that centered on freaks, but he prepared one fairly large altarpiece for the event\./gi;
```
**Result**: No match found

#### Attempt 2: Remove Period
```javascript
const discoveryPassage1 = /The show consisted of Robert's collages that centered on freaks, but he prepared one fairly large altarpiece for the event/gi;
```
**Result**: No match found

#### Attempt 3: Handle Apostrophe Variations
```javascript
const discoveryPassage1 = /The show consisted of Robert['']s collages that centered on freaks, but he prepared one fairly large altarpiece for the event/gi;
```
**Result**: Still no match

#### Attempt 4: Process Order Change
- Moved discovery passage highlighting BEFORE entity highlighting
- This prevents "Robert" and "freaks" entity highlights from breaking up the sentence
**Result**: Logic improved but pattern still not matching

#### Attempt 5: Debug Logging
Added console logging to identify what text is actually being processed:
```javascript
if (normalizedText.includes("collages")) {
  console.log('🎯 Found "collages" in text!');
  console.log('📄 Full text around it:', normalizedText.substring(normalizedText.indexOf("collages") - 50, normalizedText.indexOf("collages") + 150));
}
```
**Result**: Debug messages never appeared, confirming text isn't in the processed content

### Key Discoveries

1. **Working Highlighting System**: User confirmed blue highlighting works elsewhere in the application
2. **Text Definitely Exists**: User can see and copy the exact text from page 207
3. **Multiple Data Sources**: The application appears to have multiple, potentially conflicting data sources for book content
4. **Character Encoding**: Subtle differences in apostrophes and quotes are causing regex mismatches

### Remaining Questions

1. Where is the actual book content for page 207 being loaded from?
2. Why doesn't the text appear in the transcript file that's supposedly being loaded?
3. Is there a build process or transformation happening to the text between load and display?
4. Are there hidden characters or formatting in the displayed text preventing matches?

### Next Steps Needed

1. **Inspect Actual DOM**: Need to copy the exact HTML from the rendered page to see actual characters
2. **Trace Data Flow**: Follow the complete data path from source file to rendered output
3. **Verify Text Processing**: Check if any text transformations occur during pagination
4. **Test Simple Pattern**: Try a much simpler pattern like just "collages" to verify the highlighting system works

### Configuration Status

- **v3 Server**: Running on port 3002 (for comparison)
- **v4 Server**: Running on port 3004 (development)
- **Both servers confirmed operational and isolated**

### Technical Environment
- v4 codebase at: `/Users/j.d.heilprin/Desktop/my-claude/united-tribes-fresh-v4`
- Using React 18 with TypeScript
- Vite build system
- SQLite database for local development

### Conclusion
Despite having a working highlighting system and visible text on the page, we were unable to successfully match and highlight the discovery passages. The core issue appears to be a disconnect between what text is displayed and what text our JavaScript code is processing. This suggests either a data source issue or a text transformation happening somewhere in the rendering pipeline that we haven't identified yet.

---

**Version**: 4.0.0-dev
**Last Updated**: Monday, September 23, 2024
**Status**: Active Development
**Isolation**: Complete separation from v3.0