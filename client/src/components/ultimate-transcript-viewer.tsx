import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, BookOpen, Search, X, ChevronRight, Hash, User, MapPin, Building, Calendar, FileText, Book } from 'lucide-react';
import { Link } from 'wouter';

interface Chapter {
  id: string;
  title: string;
  pageNumber: string | number;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface Entity {
  name: string;
  type: string;
  count?: number;
}

interface UltimateTranscriptViewerProps {
  transcriptId: string;
}

// Complete chapter markers for "Just Kids" by Patti Smith
const COMPLETE_CHAPTER_MARKERS = [
  {
    title: "Foreword",
    page: "XI",
    firstSentence: "I WAS ASLEEP WHEN HE DIED. I HAD CALLED THE HOSPITAL to say one more good night"
  },
  {
    title: "Monday's Children", 
    page: 1,
    firstSentence: "WHEN I WAS VERY YOUNG, MY MOTHER TOOK ME FOR walks in Humboldt Park"
  },
  {
    title: "Just Kids",
    page: 33, 
    firstSentence: "IT WAS HOT IN THE CITY, BUT I STILL WORE MY RAINCOAT. It gave me confidence as I hit the streets looking for work"
  },
  {
    title: "Hotel Chelsea",
    page: 89,
    firstSentence: "I'm in Mike Hammer mode, puffing on Kools reading cheap detective novels sitting in the lobby waiting for William Burroughs"
  },
  {
    title: "Separate Ways Together",
    page: 211,
    firstSentence: "WE WENT OUR SEPARATE WAYS, BUT WITHIN WALKING distance of one another. The loft that Sam bought Robert"
  },
  {
    title: "Holding Hands with God", 
    page: 261,
    firstSentence: "In the spring of 1979, I left New York City to begin a new life with Fred Sonic Smith"
  },
  {
    title: "A Note to the Reader",
    page: 285,
    firstSentence: "ON MARCH 8, 1989, ROBERT AND I HAD OUR LAST CON- versation. The last, that is, in the human form"
  }
];

export const UltimateTranscriptViewer: React.FC<UltimateTranscriptViewerProps> = ({ transcriptId }) => {
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [originalTranscript, setOriginalTranscript] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'entity'>('text');
  const [activeChapter, setActiveChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{count: number, query: string, type: string} | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [topEntities, setTopEntities] = useState<Entity[]>([]);
  const chaptersRef = useRef<HTMLDivElement>(null);

  // Parse and count entities from the transcript
  const parseEntities = useCallback((htmlText: string) => {
    const entityMap = new Map<string, { type: string, count: number }>();
    
    // Find all entity spans in the HTML
    const entityRegex = /<span class="entity[^"]*entity-([^"]+)"[^>]*>([^<]+)<\/span>/gi;
    let match;
    
    while ((match = entityRegex.exec(htmlText)) !== null) {
      const entityType = match[1];
      const entityName = match[2];
      
      const key = `${entityName}|${entityType}`;
      if (entityMap.has(key)) {
        const existing = entityMap.get(key)!;
        existing.count++;
      } else {
        entityMap.set(key, { type: entityType, count: 1 });
      }
    }
    
    // Convert to array and sort by count
    const entitiesArray: Entity[] = [];
    entityMap.forEach((value, key) => {
      const [name] = key.split('|');
      entitiesArray.push({
        name,
        type: value.type,
        count: value.count
      });
    });
    
    entitiesArray.sort((a, b) => (b.count || 0) - (a.count || 0));
    return entitiesArray;
  }, []);

  // Parse chapters from full text with improved matching for all 7 chapters
  const parseChaptersFromText = useCallback((fullText: string) => {
    const parsedChapters: Chapter[] = [];
    console.log('🔍 Parsing chapters from text of length:', fullText.length);
    
    // Strip HTML tags for better text matching
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
    const cleanText = stripHtml(fullText);
    
    COMPLETE_CHAPTER_MARKERS.forEach((marker, index) => {
      let startIndex = -1;
      let searchText = marker.firstSentence;
      
      // Try different search strategies
      
      // Strategy 1: Look for exact match in cleaned text
      startIndex = cleanText.indexOf(searchText);
      
      // Strategy 2: Try with partial match (first 30 characters)
      if (startIndex === -1) {
        const partialSearch = searchText.substring(0, 30);
        startIndex = cleanText.indexOf(partialSearch);
      }
      
      // Strategy 3: Try with normalized spaces and punctuation
      if (startIndex === -1) {
        const normalizedSearch = searchText
          .replace(/\s+/g, ' ')
          .replace(/['']/g, "'")
          .replace(/[""]/g, '"')
          .substring(0, 40);
        const normalizedText = cleanText
          .replace(/\s+/g, ' ')
          .replace(/['']/g, "'")
          .replace(/[""]/g, '"');
        startIndex = normalizedText.indexOf(normalizedSearch);
      }
      
      // Strategy 4: For specific problematic chapters, use unique identifiers
      if (startIndex === -1) {
        // Special handling for known chapters
        if (marker.title === "Foreword") {
          // Look for unique phrases from the Foreword
          const forewordPhrases = [
            "I WAS ASLEEP WHEN HE DIED",
            "I had called the hospital",
            "asleep when he died"
          ];
          for (const phrase of forewordPhrases) {
            startIndex = cleanText.toLowerCase().indexOf(phrase.toLowerCase());
            if (startIndex !== -1) break;
          }
        } else if (marker.title === "Hotel Chelsea") {
          // Look for unique phrases from Hotel Chelsea chapter
          const hotelPhrases = [
            "Mike Hammer mode",
            "puffing on Kools",
            "reading cheap detective novels",
            "waiting for William Burroughs"
          ];
          for (const phrase of hotelPhrases) {
            startIndex = cleanText.toLowerCase().indexOf(phrase.toLowerCase());
            if (startIndex !== -1) break;
          }
        } else if (marker.title === "A Note to the Reader") {
          // Look for unique phrases from the closing note
          const notePhrases = [
            "MARCH 8, 1989",
            "ROBERT AND I HAD OUR LAST",
            "last conversation",
            "human form"
          ];
          for (const phrase of notePhrases) {
            startIndex = cleanText.toLowerCase().indexOf(phrase.toLowerCase());
            if (startIndex !== -1) break;
          }
        }
      }
      
      // Strategy 5: Try searching without case sensitivity
      if (startIndex === -1) {
        const searchLower = searchText.substring(0, 40).toLowerCase();
        startIndex = cleanText.toLowerCase().indexOf(searchLower);
      }
      
      if (startIndex !== -1) {
        // Find the corresponding position in the original HTML text
        let htmlStartIndex = 0;
        let cleanPos = 0;
        
        // Map the clean text position back to HTML position
        for (let i = 0; i < fullText.length && cleanPos < startIndex; i++) {
          if (fullText[i] === '<') {
            // Skip HTML tag
            while (i < fullText.length && fullText[i] !== '>') i++;
          } else {
            cleanPos++;
          }
          htmlStartIndex = i;
        }
        
        // Find the end of this chapter
        let endIndex = fullText.length;
        
        // Look for the start of the next chapter
        if (index < COMPLETE_CHAPTER_MARKERS.length - 1) {
          for (let nextIdx = index + 1; nextIdx < COMPLETE_CHAPTER_MARKERS.length; nextIdx++) {
            const nextMarker = COMPLETE_CHAPTER_MARKERS[nextIdx];
            
            // Try to find next chapter start
            let nextStartInClean = -1;
            
            // Try exact match first
            nextStartInClean = cleanText.indexOf(nextMarker.firstSentence, startIndex + 100);
            
            // Try partial match
            if (nextStartInClean === -1) {
              nextStartInClean = cleanText.indexOf(nextMarker.firstSentence.substring(0, 30), startIndex + 100);
            }
            
            // Try normalized match
            if (nextStartInClean === -1) {
              const normalizedNext = nextMarker.firstSentence
                .replace(/\s+/g, ' ')
                .substring(0, 40);
              const normalizedText = cleanText
                .replace(/\s+/g, ' ');
              nextStartInClean = normalizedText.indexOf(normalizedNext, startIndex + 100);
            }
            
            if (nextStartInClean !== -1) {
              // Map back to HTML position
              let htmlEndIndex = 0;
              let cleanPos = 0;
              
              for (let i = 0; i < fullText.length && cleanPos < nextStartInClean; i++) {
                if (fullText[i] === '<') {
                  while (i < fullText.length && fullText[i] !== '>') i++;
                } else {
                  cleanPos++;
                }
                htmlEndIndex = i;
              }
              
              endIndex = htmlEndIndex;
              break;
            }
          }
        }
        
        parsedChapters.push({
          id: `chapter-${index + 1}`,
          title: marker.title,
          pageNumber: marker.page,
          content: fullText.substring(htmlStartIndex, endIndex).trim(),
          startIndex: htmlStartIndex,
          endIndex
        });
        
        console.log(`✅ Found chapter: ${marker.title} at position ${startIndex}`);
      } else {
        console.log(`❌ Could not find chapter: ${marker.title}`);
      }
    });
    
    console.log(`📚 Parsed ${parsedChapters.length} out of ${COMPLETE_CHAPTER_MARKERS.length} chapters`);
    
    // If we couldn't parse all chapters but got some, use what we have
    if (parsedChapters.length === 0) {
      console.log('⚠️ No chapters found, using full text as single chapter');
      parsedChapters.push({
        id: 'chapter-1',
        title: 'Full Transcript',
        pageNumber: 1,
        content: fullText,
        startIndex: 0,
        endIndex: fullText.length
      });
    }
    
    return parsedChapters;
  }, []);

  // Load transcript data
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/transcripts/${transcriptId}/simple`);
        if (!response.ok) {
          throw new Error('Failed to load transcript');
        }
        
        const data = await response.json();
        setFullTranscript(data.transcript || '');
        setOriginalTranscript(data.transcript || '');
        setMetadata(data.metadata || {});
        
        // Parse entities from the HTML
        const parsedEntities = parseEntities(data.transcript || '');
        setEntities(parsedEntities);
        setTopEntities(parsedEntities.slice(0, 20)); // Top 20 entities
        
        // Parse chapters from the transcript
        const parsedChapters = parseChaptersFromText(data.transcript || '');
        setChapters(parsedChapters);
        
        // Set first chapter as active
        if (parsedChapters.length > 0) {
          setActiveChapter(parsedChapters[0].id);
        }
      } catch (err) {
        console.error('Error loading transcript:', err);
        setError('Failed to load transcript. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (transcriptId) {
      loadTranscript();
    }
  }, [transcriptId, parseChaptersFromText, parseEntities]);

  // Perform intelligent search
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setFullTranscript(originalTranscript);
      return;
    }

    let totalMatches = 0;
    let highlightedText = originalTranscript;
    
    if (searchType === 'entity') {
      // Entity search - highlight all occurrences of the entity
      const entityRegex = new RegExp(`(<span[^>]*>)(${searchQuery.trim()})(<\/span>)`, 'gi');
      const matches = originalTranscript.match(entityRegex) || [];
      totalMatches = matches.length;
      
      if (totalMatches > 0) {
        highlightedText = originalTranscript.replace(
          entityRegex,
          '$1<mark style="background: #fef08a; padding: 2px; font-weight: 700; box-shadow: 0 0 3px rgba(251, 191, 36, 0.5);">$2</mark>$3'
        );
      }
    } else {
      // Text search - highlight all text occurrences
      const searchRegex = new RegExp(`(${searchQuery.trim()})`, 'gi');
      const matches = originalTranscript.match(searchRegex) || [];
      totalMatches = matches.length;
      
      if (totalMatches > 0) {
        highlightedText = originalTranscript.replace(
          searchRegex,
          '<mark style="background: #fef08a; padding: 2px; font-weight: 700; box-shadow: 0 0 3px rgba(251, 191, 36, 0.5);">$1</mark>'
        );
      }
    }
    
    setFullTranscript(highlightedText);
    setSearchResults({ count: totalMatches, query: searchQuery, type: searchType });
    
    // Re-parse chapters with highlighted text
    const parsedChapters = parseChaptersFromText(highlightedText);
    setChapters(parsedChapters);
  }, [searchQuery, searchType, originalTranscript, parseChaptersFromText]);

  // Handle chapter navigation
  const navigateToChapter = useCallback((chapterId: string) => {
    setActiveChapter(chapterId);
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle entity click
  const handleTranscriptClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('entity')) {
      const entityText = target.textContent || '';
      setSearchQuery(entityText);
      setSearchType('entity');
      
      // Trigger search immediately
      setTimeout(() => {
        const searchBtn = document.querySelector('.ultimate-search-btn') as HTMLButtonElement;
        if (searchBtn) searchBtn.click();
      }, 0);
    }
  }, []);

  // Handle entity button click
  const handleEntityButtonClick = useCallback((entityName: string) => {
    setSearchQuery(entityName);
    setSearchType('entity');
    
    // Trigger search immediately
    setTimeout(() => {
      const searchBtn = document.querySelector('.ultimate-search-btn') as HTMLButtonElement;
      if (searchBtn) searchBtn.click();
    }, 0);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setFullTranscript(originalTranscript);
    
    // Re-parse chapters with original text
    const parsedChapters = parseChaptersFromText(originalTranscript);
    setChapters(parsedChapters);
  }, [originalTranscript, parseChaptersFromText]);

  // Get entity icon
  const getEntityIcon = (type: string) => {
    if (type.includes('person')) return <User size={16} />;
    if (type.includes('place')) return <MapPin size={16} />;
    if (type.includes('organization')) return <Building size={16} />;
    if (type.includes('event')) return <Calendar size={16} />;
    if (type.includes('work')) return <FileText size={16} />;
    return <Hash size={16} />;
  };

  if (isLoading) {
    return (
      <div className="ultimate-transcript-page">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ultimate-transcript-page">
        <div className="error-message">
          <p>{error}</p>
          <Link href="/pdf-analyze">
            <button className="back-btn-ultimate">Back to PDF Analysis</button>
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = metadata?.wordCount || 0;
  const entityCount = metadata?.entityCount || 0;
  const title = metadata?.title || 'Transcript';

  return (
    <div className="ultimate-transcript-page">
      {/* Header */}
      <header className="page-header-ultimate">
        <Link href="/pdf-analyze">
          <button className="back-btn-ultimate">
            <ArrowLeft size={26} />
            Back to PDF Analysis
          </button>
        </Link>
        
        <h1>{title}</h1>
        <p className="metadata-ultimate">
          {wordCount.toLocaleString()} words • {entityCount} entities • {chapters.length} chapters
        </p>
      </header>

      {/* Main Content with Sidebar */}
      <div className="transcript-layout-ultimate">
        {/* Chapter & Entity Sidebar */}
        <nav className="sidebar-ultimate">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <h2 className="sidebar-title">Just Kids</h2>
            <p className="sidebar-subtitle">by Patti Smith</p>
          </div>
          
          {/* Navigation Buttons */}
          <button 
            className="back-to-top-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveChapter('');
            }}
          >
            <ArrowLeft size={18} />
            Back to Overview
          </button>
          
          <Link href="/paginated">
            <button className="paginated-view-btn">
              <Book size={18} />
              Paginated Reading
            </button>
          </Link>
          
          {/* Chapter Navigation */}
          <div className="sidebar-section">
            <h3>
              <BookOpen size={22} />
              Chapters
            </h3>
            <ul className="chapter-list-ultimate">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    className={`chapter-link-ultimate ${activeChapter === chapter.id ? 'active' : ''}`}
                    onClick={() => navigateToChapter(chapter.id)}
                  >
                    <span className="chapter-page-ultimate">p.{chapter.pageNumber}</span>
                    <span className="chapter-name-ultimate">{chapter.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Entities */}
          <div className="sidebar-section">
            <h3>
              <Hash size={26} />
              Top Entities
            </h3>
            <div className="entity-list-ultimate">
              {topEntities.slice(0, 10).map((entity, idx) => (
                <button
                  key={idx}
                  className={`entity-button-ultimate entity-${entity.type}`}
                  onClick={() => handleEntityButtonClick(entity.name)}
                  title={`${entity.count} occurrences`}
                >
                  {getEntityIcon(entity.type)}
                  <span className="entity-name">{entity.name}</span>
                  <span className="entity-count">{entity.count}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Transcript Content */}
        <main className="content-ultimate">
          {/* Enhanced Search Controls */}
          <div className="search-panel-ultimate">
            <div className="search-controls-ultimate">
              <div className="search-input-wrapper">
                <Search size={28} className="search-icon-ultimate" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  placeholder="Search for any word or click an entity..."
                  className="search-input-ultimate"
                />
              </div>
              
              <div className="search-type-toggle">
                <button
                  className={`type-btn ${searchType === 'text' ? 'active' : ''}`}
                  onClick={() => setSearchType('text')}
                >
                  Text
                </button>
                <button
                  className={`type-btn ${searchType === 'entity' ? 'active' : ''}`}
                  onClick={() => setSearchType('entity')}
                >
                  Entity
                </button>
              </div>
              
              <button 
                onClick={performSearch}
                className="search-btn-ultimate ultimate-search-btn"
              >
                Search
              </button>
              
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="clear-btn-ultimate"
                >
                  <X size={22} />
                  Clear
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="search-results-ultimate">
                Found <strong>{searchResults.count}</strong> {searchResults.type} matches for 
                "<strong>{searchResults.query}</strong>"
              </div>
            )}
          </div>

          {/* Chapters */}
          <div ref={chaptersRef} className="chapters-container-ultimate" onClick={handleTranscriptClick}>
            {chapters.map((chapter) => (
              <div key={chapter.id} id={chapter.id} className="chapter-section-ultimate">
                <h2 className="chapter-title-ultimate">
                  {chapter.title}
                  <span className="chapter-page-label-ultimate">Page {chapter.pageNumber}</span>
                </h2>
                <div 
                  className="chapter-text-ultimate"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Ultimate Styles */}
      <style jsx>{`
        .ultimate-transcript-page {
          min-height: 100vh;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .loading-message,
        .error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.6rem;
          color: #666;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f4f6;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message p {
          margin-bottom: 2rem;
          color: #dc2626;
        }

        .page-header-ultimate {
          margin-left: 320px;
          padding: 3rem;
          border-bottom: 3px solid #e5e7eb;
          background: white;
          position: relative;
          z-index: 50;
        }

        .back-btn-ultimate {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 1.8rem;
          margin-bottom: 2rem;
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          border-radius: 10px;
          font-size: 1.3rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn-ultimate:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .page-header-ultimate h1 {
          font-size: 3.8rem;
          color: #111827;
          margin: 0 0 1rem 0;
          font-weight: 800;
          text-transform: capitalize;
          letter-spacing: -0.5px;
        }

        .metadata-ultimate {
          font-size: 1.6rem;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }

        .transcript-layout-ultimate {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0;
          position: relative;
          min-height: calc(100vh - 200px);
        }

        .sidebar-ultimate {
          width: 320px;
          background: #1e3a8a;
          padding: 2rem;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }

        .sidebar-ultimate::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-ultimate::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-ultimate::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .sidebar-ultimate::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .sidebar-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
        }

        .sidebar-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.3rem;
          letter-spacing: 0.5px;
        }

        .sidebar-subtitle {
          font-size: 0.95rem;
          color: #ffffff;
          font-style: italic;
          opacity: 0.9;
        }

        .back-to-top-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-to-top-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }
        
        .paginated-view-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          background: rgba(96, 165, 250, 0.2);
          border: 1px solid rgba(96, 165, 250, 0.4);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .paginated-view-btn:hover {
          background: rgba(96, 165, 250, 0.3);
          border-color: rgba(96, 165, 250, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
        }

        .sidebar-section {
          margin-bottom: 3rem;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .sidebar-ultimate h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.2rem;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .chapter-list-ultimate {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .chapter-list-ultimate li {
          margin-bottom: 0.5rem;
        }

        .chapter-link-ultimate {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          padding: 1rem 1.2rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 1.1rem;
          color: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .chapter-link-ultimate::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: transparent;
          transition: all 0.2s;
        }

        .chapter-link-ultimate:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
          transform: translateX(3px);
        }

        .chapter-link-ultimate:hover::before {
          background: #60a5fa;
        }

        .chapter-link-ultimate.active {
          background: rgba(96, 165, 250, 0.25);
          color: #ffffff;
          border-color: #60a5fa;
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
        }

        .chapter-link-ultimate.active::before {
          background: #60a5fa;
          width: 3px;
        }

        .chapter-link-ultimate.active .chapter-page-ultimate {
          color: rgba(196, 181, 253, 0.9);
        }

        .chapter-link-ultimate.active .chapter-name-ultimate {
          font-weight: 600;
          color: #ffffff;
        }

        .chapter-page-ultimate {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-bottom: 0.2rem;
          font-weight: 500;
        }

        .chapter-name-ultimate {
          font-size: 1.15rem;
          font-weight: 500;
          line-height: 1.3;
        }

        .entity-list-ultimate {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .entity-button-ultimate {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          color: #ffffff;
        }

        .entity-button-ultimate:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
          transform: translateX(2px);
        }

        .entity-button-ultimate .entity-name {
          flex: 1;
          font-weight: 500;
        }

        .entity-button-ultimate .entity-count {
          font-size: 0.8rem;
          opacity: 0.9;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .entity-button-ultimate.entity-musician {
          border-left: 3px solid #60a5fa;
        }

        .entity-button-ultimate.entity-artist {
          border-left: 3px solid #34d399;
        }

        .entity-button-ultimate.entity-author {
          border-left: 3px solid #fbbf24;
        }

        .entity-button-ultimate.entity-venue {
          border-left: 3px solid #f87171;
        }

        .entity-button-ultimate.entity-work {
          border-left: 3px solid #a78bfa;
        }

        .content-ultimate {
          flex: 1;
          min-width: 0;
          margin-left: 320px;
          padding: 3rem;
          padding-top: 1rem;
        }

        .search-panel-ultimate {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 3rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .search-controls-ultimate {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon-ultimate {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        .search-input-ultimate {
          width: 100%;
          font-size: 1.5rem;
          padding: 1.3rem 1.5rem 1.3rem 4rem;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .search-input-ultimate:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .search-type-toggle {
          display: flex;
          background: white;
          border-radius: 10px;
          padding: 0.3rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .type-btn {
          padding: 0.8rem 1.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .type-btn.active {
          background: #3b82f6;
          color: white;
        }

        .search-btn-ultimate,
        .clear-btn-ultimate {
          font-size: 1.4rem;
          padding: 1.3rem 2.2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .clear-btn-ultimate {
          background: #6b7280;
          padding: 1.3rem 1.8rem;
        }

        .search-btn-ultimate:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .clear-btn-ultimate:hover {
          background: #4b5563;
        }

        .search-results-ultimate {
          margin-top: 1.5rem;
          padding: 1.2rem 1.8rem;
          background: white;
          border-left: 4px solid #fbbf24;
          border-radius: 8px;
          font-size: 1.3rem;
          color: #92400e;
        }

        .chapters-container-ultimate {
          background: white;
        }

        .chapter-section-ultimate {
          margin-bottom: 5rem;
          scroll-margin-top: 3rem;
        }

        .chapter-title-ultimate {
          font-size: 2.8rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2.5rem;
          padding-bottom: 1.2rem;
          border-bottom: 3px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .chapter-page-label-ultimate {
          font-size: 1.4rem;
          color: #6b7280;
          font-weight: 500;
        }

        .chapter-text-ultimate {
          font-size: 1.45rem;
          line-height: 2;
          color: #1f2937;
          font-family: Georgia, 'Times New Roman', serif;
          text-align: justify;
        }

        /* Enhanced Entity Highlighting in Text */
        .chapter-text-ultimate :global(.entity) {
          padding: 4px 8px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-block;
          border: 1px solid;
        }

        .chapter-text-ultimate :global(.entity-creative-person),
        .chapter-text-ultimate :global(.entity-person) {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .chapter-text-ultimate :global(.entity-place) {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;
        }

        .chapter-text-ultimate :global(.entity-creative-work),
        .chapter-text-ultimate :global(.entity-work) {
          background: #dbeafe;
          color: #1e40af;
          border-color: #93c5fd;
        }

        .chapter-text-ultimate :global(.entity-creative-organization),
        .chapter-text-ultimate :global(.entity-organization) {
          background: #fed7aa;
          color: #9a3412;
          border-color: #fdba74;
        }

        .chapter-text-ultimate :global(.entity-creative-event),
        .chapter-text-ultimate :global(.entity-event) {
          background: #e9d5ff;
          color: #6b21a8;
          border-color: #c084fc;
        }

        .chapter-text-ultimate :global(.entity:hover) {
          opacity: 0.85;
          transform: scale(1.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .sidebar-ultimate {
            width: 280px;
            padding: 2rem;
          }

          .page-header-ultimate {
            margin-left: 280px;
            padding: 2rem;
          }

          .content-ultimate {
            margin-left: 280px;
            padding: 2rem;
          }

          .page-header-ultimate h1 {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .sidebar-ultimate {
            width: 240px;
            padding: 1.5rem;
          }

          .page-header-ultimate {
            margin-left: 240px;
            padding: 1.5rem;
          }

          .content-ultimate {
            margin-left: 240px;
            padding: 1.5rem;
          }

          .search-controls-ultimate {
            flex-wrap: wrap;
          }

          .search-input-wrapper {
            width: 100%;
          }

          .search-type-toggle,
          .search-btn-ultimate,
          .clear-btn-ultimate {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default UltimateTranscriptViewer;