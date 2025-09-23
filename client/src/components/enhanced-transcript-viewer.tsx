import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, BookOpen, Search, X } from 'lucide-react';
import { Link } from 'wouter';

interface Chapter {
  id: string;
  title: string;
  pageNumber: string | number;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface EnhancedTranscriptViewerProps {
  transcriptId: string;
}

// Chapter markers for "Just Kids" by Patti Smith
const CHAPTER_MARKERS = [
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
    firstSentence: "In early spring of 1973"
  },
  {
    title: "Holding Hands with God", 
    page: 261,
    firstSentence: "On a snowy morning"
  },
  {
    title: "A Note to the Reader",
    page: 285,
    firstSentence: "Robert took the photographs"
  }
];

export const EnhancedTranscriptViewer: React.FC<EnhancedTranscriptViewerProps> = ({ transcriptId }) => {
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChapter, setActiveChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{count: number, query: string} | null>(null);

  // Parse chapters from full text
  const parseChaptersFromText = useCallback((fullText: string) => {
    const parsedChapters: Chapter[] = [];
    
    CHAPTER_MARKERS.forEach((marker, index) => {
      // Create a search pattern from the first sentence
      const searchText = marker.firstSentence.substring(0, 50); // Use first 50 chars for searching
      const startIndex = fullText.indexOf(searchText);
      
      if (startIndex !== -1) {
        // Find the end of this chapter (start of next chapter or end of text)
        let endIndex = fullText.length;
        if (index < CHAPTER_MARKERS.length - 1) {
          const nextMarker = CHAPTER_MARKERS[index + 1];
          const nextSearchText = nextMarker.firstSentence.substring(0, 50);
          const nextStartIndex = fullText.indexOf(nextSearchText, startIndex + 100);
          if (nextStartIndex !== -1) {
            endIndex = nextStartIndex;
          }
        }
        
        parsedChapters.push({
          id: `chapter-${index + 1}`,
          title: marker.title,
          pageNumber: marker.page,
          content: fullText.substring(startIndex, endIndex).trim(),
          startIndex,
          endIndex
        });
      }
    });
    
    // If no chapters found, treat entire text as one chapter
    if (parsedChapters.length === 0) {
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
        setMetadata(data.metadata || {});
        
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
  }, [transcriptId, parseChaptersFromText]);

  // Perform search across all chapters
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      // Clear all search highlights
      chapters.forEach(chapter => {
        const element = document.getElementById(chapter.id);
        if (element) {
          const textElement = element.querySelector('.chapter-text');
          if (textElement) {
            const originalText = textElement.getAttribute('data-original-text') || textElement.innerHTML;
            textElement.innerHTML = originalText;
          }
        }
      });
      return;
    }

    let totalMatches = 0;
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    
    chapters.forEach(chapter => {
      const element = document.getElementById(chapter.id);
      if (element) {
        const textElement = element.querySelector('.chapter-text');
        if (textElement) {
          const originalText = textElement.getAttribute('data-original-text') || textElement.innerHTML;
          textElement.setAttribute('data-original-text', originalText);
          
          const matches = originalText.match(regex);
          if (matches) {
            totalMatches += matches.length;
            const highlightedText = originalText.replace(regex, '<mark style="background: yellow; padding: 2px; font-weight: 600;">$1</mark>');
            textElement.innerHTML = highlightedText;
          } else {
            textElement.innerHTML = originalText;
          }
        }
      }
    });
    
    setSearchResults({ count: totalMatches, query: searchQuery });
  }, [searchQuery, chapters]);

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
      
      // Trigger search immediately
      setTimeout(() => {
        const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement;
        if (searchBtn) searchBtn.click();
      }, 0);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    
    // Clear all highlights
    chapters.forEach(chapter => {
      const element = document.getElementById(chapter.id);
      if (element) {
        const textElement = element.querySelector('.chapter-text');
        if (textElement) {
          const originalText = textElement.getAttribute('data-original-text') || textElement.innerHTML;
          textElement.innerHTML = originalText;
        }
      }
    });
  }, [chapters]);

  if (isLoading) {
    return (
      <div className="enhanced-transcript-page">
        <div className="loading-message">
          <p>Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-transcript-page">
        <div className="error-message">
          <p>{error}</p>
          <Link href="/pdf-analyze">
            <button className="back-btn-large">Back to PDF Analysis</button>
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = metadata?.wordCount || 0;
  const entityCount = metadata?.entityCount || 0;
  const title = metadata?.title || 'Transcript';

  return (
    <div className="enhanced-transcript-page">
      {/* Header */}
      <header className="page-header-enhanced">
        <Link href="/pdf-analyze">
          <button className="back-btn-enhanced">
            <ArrowLeft size={24} />
            Back to PDF Analysis
          </button>
        </Link>
        
        <h1>{title}</h1>
        <p className="metadata-enhanced">
          {wordCount.toLocaleString()} words • {entityCount} entities • {chapters.length} chapters
        </p>
      </header>

      {/* Main Content with Sidebar */}
      <div className="transcript-with-chapters">
        {/* Chapter Sidebar */}
        <nav className="chapter-sidebar">
          <h3>
            <BookOpen size={24} />
            Chapters
          </h3>
          <ul className="chapter-list">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  className={`chapter-link ${activeChapter === chapter.id ? 'active' : ''}`}
                  onClick={() => navigateToChapter(chapter.id)}
                >
                  <span className="chapter-page">p.{chapter.pageNumber}</span>
                  <span className="chapter-name">{chapter.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Transcript Content */}
        <main className="transcript-content-enhanced">
          {/* Search Controls */}
          <div className="search-controls-enhanced">
            <div className="search-input-group">
              <Search size={24} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                placeholder="Search for any word or entity..."
                className="search-input-enhanced"
              />
            </div>
            <button 
              onClick={performSearch}
              className="search-btn-enhanced search-btn"
            >
              Search
            </button>
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="clear-btn-enhanced"
              >
                <X size={20} />
                Clear
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {searchResults && (
            <div className="search-results-bar">
              Found <strong>{searchResults.count}</strong> matches for "<strong>{searchResults.query}</strong>"
            </div>
          )}

          {/* Chapters */}
          <div className="chapters-container" onClick={handleTranscriptClick}>
            {chapters.map((chapter) => (
              <div key={chapter.id} id={chapter.id} className="chapter-section">
                <h2 className="chapter-title-enhanced">
                  {chapter.title}
                  <span className="chapter-page-label">Page {chapter.pageNumber}</span>
                </h2>
                <div 
                  className="chapter-text"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .enhanced-transcript-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .loading-message,
        .error-message {
          text-align: center;
          padding: 6rem 2rem;
          font-size: 1.4rem;
          color: #666;
        }

        .error-message p {
          margin-bottom: 2rem;
          color: #dc2626;
        }

        .page-header-enhanced {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem;
          border-bottom: 2px solid #e5e5e5;
        }

        .back-btn-enhanced,
        .back-btn-large {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1.4rem;
          margin-bottom: 1.5rem;
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          font-size: 1.15rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn-enhanced:hover,
        .back-btn-large:hover {
          background: #3b82f6;
          color: white;
        }

        .page-header-enhanced h1 {
          font-size: 3.2rem;
          color: #1a1a1a;
          margin: 0 0 0.8rem 0;
          font-weight: 700;
          text-transform: capitalize;
        }

        .metadata-enhanced {
          font-size: 1.4rem;
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        .transcript-with-chapters {
          display: flex;
          gap: 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem;
        }

        .chapter-sidebar {
          width: 280px;
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          height: fit-content;
          position: sticky;
          top: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .chapter-sidebar h3 {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }

        .chapter-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .chapter-list li {
          margin-bottom: 0.6rem;
        }

        .chapter-link {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          padding: 1rem 1.2rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1.1rem;
          color: #64748b;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chapter-link:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateX(4px);
        }

        .chapter-link.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .chapter-page {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.2rem;
        }

        .chapter-name {
          font-size: 1.15rem;
          font-weight: 600;
        }

        .transcript-content-enhanced {
          flex: 1;
          min-width: 0;
        }

        .search-controls-enhanced {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 3rem;
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .search-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1.2rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input-enhanced {
          flex: 1;
          font-size: 1.3rem;
          padding: 1rem 1.2rem 1rem 3.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .search-input-enhanced:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-btn-enhanced,
        .clear-btn-enhanced {
          font-size: 1.3rem;
          padding: 1rem 2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clear-btn-enhanced {
          background: #6b7280;
          padding: 1rem 1.5rem;
        }

        .search-btn-enhanced:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .clear-btn-enhanced:hover {
          background: #4b5563;
        }

        .search-results-bar {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          color: #92400e;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-size: 1.2rem;
        }

        .chapters-container {
          background: white;
        }

        .chapter-section {
          margin-bottom: 4rem;
          scroll-margin-top: 2rem;
        }

        .chapter-title-enhanced {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 3px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .chapter-page-label {
          font-size: 1.2rem;
          color: #64748b;
          font-weight: 500;
        }

        .chapter-text {
          font-size: 1.25rem;
          line-height: 1.9;
          color: #2a2a2a;
          font-family: Georgia, 'Times New Roman', serif;
          text-align: justify;
        }

        /* Enhanced Entity Highlighting */
        .chapter-text :global(.entity) {
          padding: 3px 6px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-block;
        }

        .chapter-text :global(.entity-creative-person),
        .chapter-text :global(.entity-person) {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .chapter-text :global(.entity-place) {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .chapter-text :global(.entity-creative-work),
        .chapter-text :global(.entity-work) {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .chapter-text :global(.entity-creative-organization),
        .chapter-text :global(.entity-organization) {
          background: #fed7aa;
          color: #9a3412;
          border: 1px solid #fdba74;
        }

        .chapter-text :global(.entity-creative-event),
        .chapter-text :global(.entity-event) {
          background: #e9d5ff;
          color: #6b21a8;
          border: 1px solid #d8b4fe;
        }

        .chapter-text :global(.entity:hover) {
          opacity: 0.85;
          transform: scale(1.05);
        }

        /* Mobile responsive */
        @media (max-width: 968px) {
          .transcript-with-chapters {
            flex-direction: column;
          }

          .chapter-sidebar {
            width: 100%;
            position: static;
            margin-bottom: 2rem;
          }

          .page-header-enhanced h1 {
            font-size: 2.5rem;
          }

          .search-controls-enhanced {
            flex-direction: column;
          }

          .search-btn-enhanced,
          .clear-btn-enhanced {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedTranscriptViewer;