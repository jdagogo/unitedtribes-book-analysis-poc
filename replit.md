# UnitedTribes

## Overview
UnitedTribes is an authorized AI platform designed to bridge the global media industry and the AI world, focusing on cross-media discovery and consumption. It processes audio content (from Apple Podcasts URLs), direct transcript text, and PDF transcript uploads. The platform transcribes content using OpenAI's Whisper API and performs advanced entity recognition and contextual analysis to generate comprehensive insights. Key capabilities include detailed transcriptions, entity mentions, relationship networks, sentiment analysis, and exportable reports. The project demonstrates "cultural navigation pathways" connecting podcasts, books, and audiobooks around shared subjects like Merle Haggard, using authentic content with complete text analysis and full searchability.

## Recent Changes (August 2025)
- ✅ Restored authentic Merle Haggard Fresh Air NPR episode audio ("Merle Haggard On Hopping Trains And Doing Time")
- ✅ Native HTML5 audio player with browser controls working perfectly
- ✅ Real NPR RSS feed integration extracting correct episode audio URLs
- ✅ Merle Haggard "My House of Memories" audiobook content (43,229 words) successfully cached and accessible
- ✅ Cross-media discovery system connecting podcast interviews to autobiography content
- ✅ **Video Integration Complete**: Country Music Hall of Fame interview "Merle Haggard and the Strangers Interview • The Bakersfield Sound" embedded in both Bakersfield Sound and The Strangers entity modals
- ✅ Ken Burns Country Music documentary content integrated with PBS and museum resources
- ✅ Cross-entity video sharing system allowing same authentic video content to appear in related entities
- ✅ **Video Playback Management**: Implemented single-video playback system preventing multiple simultaneous videos with YouTube-style play button overlays

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints
- **File Processing**: Command-line tools (yt-dlp)
- **Storage Pattern**: Interface-based storage abstraction

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (Neon Database)
- **Object Storage**: Replit object storage for PDF uploads with presigned URLs
- **Transcript Caching**: Reuses processed transcripts for efficiency
- **Schema Design**: Relational model for podcasts, transcriptions, entities, and mentions

### AI and Processing Pipeline
- **Audio Transcription**: OpenAI Whisper API
- **Advanced Entity Recognition**: OpenAI GPT-4o for entity recognition and sentiment analysis
- **Relationship Mapping**: Entity network analysis with strength scoring
- **Context Analysis**: Enhanced entity importance and emotional analysis
- **Processing Flow**: Asynchronous background processing with status tracking
- **AI Knowledge Expansion**: Claude 4.0 Sonnet for automatic knowledge base growth and Wikipedia integration
- **Smart Entity Linking**: Automatic cross-referencing and navigation across text descriptions and content.

### Component Architecture
- **Shared Schema**: Common TypeScript types and Zod schemas including Book, BookChapter, and CrossMediaMention types
- **UI Organization**: Modular and reusable components
- **File Upload**: Uppy dashboard integration for PDF uploads
- **Multi-Input Interface**: Tabbed interface for URL, text, and PDF input
- **Book Reader**: Interactive chapter-based reading with entity highlighting and cross-references
- **Cross-Media Discovery**: Visual navigation between different media types sharing entities
- **Video Integration**: Entity modals display authentic documentary content with Country Music Hall of Fame interviews, Ken Burns documentaries, and PBS resources
- **Cross-Entity Video Sharing**: Same video content intelligently appears across related entities for comprehensive multimedia discovery
- **Video Playback Control**: Global video management system ensures only one video plays at a time with overlay play buttons and automatic cleanup

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL)
- **Build System**: Vite
- **Deployment**: Replit hosting environment

### AI Services
- **OpenAI API**: Whisper (transcription), GPT-4o (entity analysis)
- **Anthropic Claude**: For superior contextual understanding and knowledge expansion
- **Audio Processing**: yt-dlp

### UI and Styling
- **Component Library**: Radix UI
- **CSS Framework**: Tailwind CSS
- **Icons**: Lucide React

### Development Tools
- **TypeScript**
- **ESBuild**
- **PostCSS**

### Runtime Dependencies
- **Session Storage**: connect-pg-simple
- **Date Handling**: date-fns
- **File Processing**: Node.js child_process