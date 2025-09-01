import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface SimpleTranscriptViewerProps {
  transcriptId: string;
}

export const SimpleTranscriptViewer: React.FC<SimpleTranscriptViewerProps> = ({ transcriptId }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalTranscript, setOriginalTranscript] = useState<string>('');

  // Load transcript data
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Loading transcript: ${transcriptId}`);
        const response = await fetch(`/api/transcripts/${transcriptId}/simple`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to load transcript: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('Loaded data:', { 
          hasTranscript: !!data.transcript, 
          transcriptLength: data.transcript?.length,
          metadata: data.metadata 
        });
        
        setTranscript(data.transcript || '');
        setOriginalTranscript(data.transcript || '');
        setMetadata(data.metadata || {});
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
  }, [transcriptId]);

  // Simple search function
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setTranscript(originalTranscript);
      return;
    }

    // Create regex for case-insensitive search
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    
    // Highlight search terms
    const highlighted = originalTranscript.replace(regex, '<mark style="background: yellow; padding: 2px;">$1</mark>');
    setTranscript(highlighted);
  }, [searchQuery, originalTranscript]);

  // Handle search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // Handle entity click
  const handleTranscriptClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked element is an entity
    if (target.classList.contains('entity')) {
      const entityText = target.textContent || '';
      setSearchQuery(entityText);
      
      // Perform search immediately
      const regex = new RegExp(`(${entityText})`, 'gi');
      const highlighted = originalTranscript.replace(regex, '<mark style="background: yellow; padding: 2px;">$1</mark>');
      setTranscript(highlighted);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setTranscript(originalTranscript);
  };

  if (isLoading) {
    return (
      <div className="simple-transcript-page">
        <div className="loading-message">
          <p>Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-transcript-page">
        <div className="error-message">
          <p>{error}</p>
          <Link href="/pdf-analyze">
            <button className="simple-btn">Back to PDF Analysis</button>
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = metadata?.wordCount || 0;
  const entityCount = metadata?.entityCount || 0;
  const title = metadata?.title || 'Transcript';

  return (
    <div className="simple-transcript-page">
      {/* Header */}
      <header className="page-header">
        <Link href="/pdf-analyze">
          <button className="back-btn">
            <ArrowLeft size={20} />
            Back to PDF Analysis
          </button>
        </Link>
        
        <h1>{title}</h1>
        <p className="metadata">
          {wordCount.toLocaleString()} words • {entityCount} entities found
        </p>
      </header>

      {/* Simple Controls */}
      <div className="simple-controls">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          placeholder="Search for any word or entity..."
          className="simple-search"
        />
        <button 
          onClick={performSearch}
          className="simple-search-btn"
        >
          Search
        </button>
        {searchQuery && (
          <button 
            onClick={clearSearch}
            className="simple-clear-btn"
          >
            Clear
          </button>
        )}
      </div>

      {/* Transcript Display */}
      <div 
        className="simple-transcript"
        onClick={handleTranscriptClick}
        dangerouslySetInnerHTML={{ __html: transcript }}
      />

      {/* Simple Styles */}
      <style jsx>{`
        .simple-transcript-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: Georgia, 'Times New Roman', serif;
          background: white;
          min-height: 100vh;
        }

        .loading-message,
        .error-message {
          text-align: center;
          padding: 4rem 2rem;
          font-size: 1.2rem;
          color: #666;
        }

        .error-message p {
          margin-bottom: 2rem;
          color: #dc2626;
        }

        .page-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e5e5e5;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          background: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .page-header .metadata {
          font-size: 1.2rem;
          color: #666;
          margin: 0;
        }

        .simple-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .simple-search {
          flex: 1;
          font-size: 1.1rem;
          padding: 0.8rem 1rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          transition: border-color 0.2s;
        }

        .simple-search:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .simple-search-btn,
        .simple-clear-btn,
        .simple-btn {
          font-size: 1.1rem;
          padding: 0.8rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
          font-weight: 600;
        }

        .simple-clear-btn {
          background: #6b7280;
        }

        .simple-search-btn:hover,
        .simple-btn:hover {
          background: #2563eb;
        }

        .simple-clear-btn:hover {
          background: #4b5563;
        }

        .simple-transcript {
          font-size: 1.15rem;
          line-height: 1.8;
          color: #2a2a2a;
          text-align: justify;
        }

        /* Entity highlighting styles */
        .simple-transcript :global(.entity) {
          padding: 2px 4px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }

        .simple-transcript :global(.entity-creative-person),
        .simple-transcript :global(.entity-person) {
          background: #dcfce7;
          color: #166534;
        }

        .simple-transcript :global(.entity-place) {
          background: #fef3c7;
          color: #92400e;
        }

        .simple-transcript :global(.entity-creative-work),
        .simple-transcript :global(.entity-work) {
          background: #dbeafe;
          color: #1e40af;
        }

        .simple-transcript :global(.entity-creative-organization),
        .simple-transcript :global(.entity-organization) {
          background: #fed7aa;
          color: #9a3412;
        }

        .simple-transcript :global(.entity-creative-event),
        .simple-transcript :global(.entity-event) {
          background: #e9d5ff;
          color: #6b21a8;
        }

        .simple-transcript :global(.entity:hover) {
          opacity: 0.8;
          transform: scale(1.05);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .simple-transcript-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .simple-controls {
            flex-direction: column;
          }

          .simple-search,
          .simple-search-btn,
          .simple-clear-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleTranscriptViewer;