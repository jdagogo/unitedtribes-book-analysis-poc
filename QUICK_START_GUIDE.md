# Quick Start Guide - United Tribes Fresh

## 🚀 Getting Started in 30 Seconds

```bash
# 1. Clone and enter directory
git clone https://github.com/jdagogo/unitedtribes-book-analysis-poc.git
cd united-tribes-fresh

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

## 🎯 What You'll See

### Home Page (/)
- Media hub with navigation to both experiences

### Patti Smith Reader (/paginated)
- Full text of "Just Kids" memoir
- **Try this**: Go to page 207 and highlight "Robert's collages that centered on freaks"
- A discovery modal will appear with Instagram, YouTube, and article content

### Merle Haggard Audio Sync (/chapters)
- Audiobook with perfect word-level synchronization
- Click any word to jump to that point in the audio
- Yellow highlighting follows the narration

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Book Viewer  │  │ Audio Sync   │  │ Discovery    │ │
│  │  Component   │  │  Component   │  │   Modals     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                           │                              │
├─────────────────────────────────────────────────────────┤
│                     Backend (Express)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           /api/smart-analysis                     │  │
│  │   Pattern matching for discovery passages         │  │
│  │   Returns multimedia content & micropayments      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                      Data Layer                          │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐                │
│  │ just-kids.json │  │ transcript.json│                │
│  │   (79k words)  │  │   (43k words)  │                │
│  └────────────────┘  └────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## 📁 Key Files to Know

### Frontend Components
```
/client/src/components/
├── discovery-card.tsx           # Renders multimedia in modals
├── text-selection-modal.tsx     # Handles text highlighting
├── article-screenshot-modal.tsx # Shows article previews
├── paginated-book-viewer.tsx    # Patti Smith reader
└── synchronized-transcript.tsx  # Merle Haggard audio sync
```

### Backend API
```
/server/routes/
├── smart-analysis.ts  # Discovery content engine (THE MAIN FILE!)
├── discovery.ts       # Entity discovery
└── routes.ts         # Route registration
```

### Data Files
```
/client/
├── src/data/just-kids-cleaned.json     # Book text
├── public/transcript-PSN8N2v4oq0.json  # Audio transcript
└── public/article-screenshots/         # Article images
```

## 🎨 How Discovery Modals Work

1. **User highlights text** in the Patti Smith reader
2. **Frontend sends text** to `/api/smart-analysis`
3. **Backend pattern matches** against 6 configured passages
4. **Returns multimedia content** (YouTube, Instagram, articles, etc.)
5. **Modal displays** with tabs for Overview, Media, Connections
6. **Micropayment buttons** demonstrate monetization ($0.25-$250)

## 📝 Adding New Discovery Content

### Step 1: Edit `/server/routes/smart-analysis.ts`

```typescript
// Add a new conditional block around line 400-500
if (lowerText.includes('your trigger phrase')) {
  specialMedia.push({
    type: 'youtube',  // or 'instagram', 'article', 'artwork'
    videoId: 'VIDEO_ID',
    title: '**Bold Title Here**',
    creator: 'Creator Name',
    year: '2024'
  });
}
```

### Step 2: Add Article Screenshots (if needed)
1. Save screenshot to `/client/public/article-screenshots/`
2. Reference in the media object:
```typescript
{
  type: 'article',
  title: '**Article Title**',
  screenshot: '/article-screenshots/your-image.png',
  price: 0.25
}
```

### Step 3: Restart Dev Server
```bash
# Kill existing server (Ctrl+C)
# Restart
npm run dev
```

## 🔧 Common Tasks

### Test a Discovery Modal
1. Navigate to `/paginated`
2. Go to one of these pages: 207, 209, 210, 211
3. Highlight the trigger text
4. Modal should appear with media

### Check What's Running
```bash
# See all running npm processes
ps aux | grep "npm run dev"

# Kill all dev servers
pkill -f "npm run dev"
```

### Debug Discovery Content
```javascript
// In browser console
fetch('/api/smart-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Test text here",
    context: "Testing"
  })
}).then(r => r.json()).then(console.log)
```

## 🎯 Current Discovery Passages

| Page | Trigger Text | Media Types |
|------|-------------|-------------|
| 207 | "Robert's collages that centered on freaks" | Instagram, YouTube, Substack |
| 209 | "The lady's dead" (Edie Sedgwick) | Image, Vogue article |
| 210 | "Jann Wenner at Rolling Stone" | Album art, Rolling Stone, YouTube |
| 210 | "Why don't you do a reading?" | YouTube, TikTok, Pitchfork |
| 211 | "I had watched Robert create" | HBO Max documentary |
| 211 | "The Age of Rock II" | Book purchase link |

## 💡 Pro Tips

1. **Yellow highlighting** = Discovery content available
2. **Purple/pink cards** = Article previews
3. **Modal size** = 960px wide (20% larger than default)
4. **Micropayments** = Demo only, no real transactions
5. **Server restarts** = Often needed after changes to smart-analysis.ts

## 🐛 Troubleshooting

### Modal not appearing?
- Check browser console for errors
- Verify you're highlighting exact trigger text
- Restart dev server

### Media not loading?
- Instagram/TikTok embeds may be blocked by CORS
- Articles use screenshots as fallback
- Check network tab for failed requests

### Changes not showing?
```bash
# Always restart after backend changes
pkill -f "npm run dev" && npm run dev
```

## 📚 Resources

- **GitHub**: https://github.com/jdagogo/unitedtribes-book-analysis-poc
- **Main README**: Comprehensive feature documentation
- **Discovery Inventory**: Complete media listing

## 🚀 Next Steps

1. Explore the 6 existing discovery passages
2. Try adding your own discovery content
3. Experiment with different media types
4. Test the micropayment demonstrations
5. Check out the audio synchronization on /chapters

---

**Version**: 3.0.0 | **Updated**: December 2024 | **Status**: Production Ready