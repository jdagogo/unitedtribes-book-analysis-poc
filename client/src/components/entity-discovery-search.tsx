import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Music, User, MapPin, Book, Disc, Building, Sparkles, ChevronRight } from 'lucide-react';

interface DiscoverableEntity {
  id: string;
  name: string;
  type: 'musician' | 'artist' | 'author' | 'venue' | 'work' | 'album' | 'movement' | 'publisher';
  pages: number[];
  chapters: string[];
  contexts: Array<{
    page: number;
    chapter: string;
    text: string;
    discoveryValue?: string;
  }>;
  totalMentions: number;
  significance: 'high' | 'medium' | 'low';
  relatedWorks?: string[];
  period?: string;
}

interface EntityDiscoverySearchProps {
  transcriptId: string;
  onNavigateToPage?: (pageNumber: number) => void;
}

// Simulated Claude analysis results for "Just Kids" entities
// In production, this would come from actual Claude API analysis
const DISCOVERED_ENTITIES: DiscoverableEntity[] = [
  {
    id: 'bob-dylan',
    name: 'Bob Dylan',
    type: 'musician',
    pages: [45, 67, 89, 112, 145, 178, 203, 234],
    chapters: ['Just Kids', 'Hotel Chelsea', 'Separate Ways Together'],
    contexts: [
      {
        page: 45,
        chapter: 'Just Kids',
        text: '...listening to Bob Dylan\'s Highway 61 Revisited while Robert worked on his collages...',
        discoveryValue: 'Album: Highway 61 Revisited (1965) - Revolutionary electric folk-rock album'
      },
      {
        page: 89,
        chapter: 'Hotel Chelsea',
        text: 'Dylan had stayed here, writing songs in the same rooms where Thomas Wolfe had written...',
        discoveryValue: 'Historic connection between Dylan and Chelsea Hotel\'s literary legacy'
      }
    ],
    totalMentions: 17,
    significance: 'high',
    relatedWorks: ['Highway 61 Revisited', 'Blonde on Blonde', 'Blood on the Tracks'],
    period: '1960s-1970s'
  },
  {
    id: 'jimi-hendrix',
    name: 'Jimi Hendrix',
    type: 'musician',
    pages: [56, 78, 92, 134, 189, 212],
    chapters: ['Just Kids', 'Hotel Chelsea'],
    contexts: [
      {
        page: 56,
        chapter: 'Just Kids',
        text: 'The summer Jimi Hendrix died, we were devastated. His Electric Ladyland had been our soundtrack...',
        discoveryValue: 'Album: Electric Ladyland (1968) - Psychedelic rock masterpiece'
      },
      {
        page: 134,
        chapter: 'Hotel Chelsea',
        text: 'I thought of Hendrix, how he had transformed the national anthem into something transcendent...',
        discoveryValue: 'Reference to Woodstock performance of "Star Spangled Banner"'
      }
    ],
    totalMentions: 12,
    significance: 'high',
    relatedWorks: ['Electric Ladyland', 'Are You Experienced', 'Axis: Bold as Love'],
    period: '1960s-1970'
  },
  {
    id: 'andy-warhol',
    name: 'Andy Warhol',
    type: 'artist',
    pages: [67, 89, 102, 145, 167, 198, 224],
    chapters: ['Hotel Chelsea', 'Separate Ways Together'],
    contexts: [
      {
        page: 102,
        chapter: 'Hotel Chelsea',
        text: 'We went to the Factory, Andy\'s silver-lined workspace where art and commerce collided...',
        discoveryValue: 'The Factory - Warhol\'s famous studio and cultural hub'
      },
      {
        page: 167,
        chapter: 'Separate Ways Together',
        text: 'Andy had photographed us, turning our faces into icons of a moment...',
        discoveryValue: 'Warhol\'s portrait photography and pop art techniques'
      }
    ],
    totalMentions: 23,
    significance: 'high',
    relatedWorks: ['Campbell\'s Soup Cans', 'Marilyn Diptych', 'Chelsea Girls film'],
    period: '1960s-1970s'
  },
  {
    id: 'arthur-rimbaud',
    name: 'Arthur Rimbaud',
    type: 'author',
    pages: [12, 34, 67, 89, 123, 156, 189, 234, 267],
    chapters: ['Monday\'s Children', 'Just Kids', 'Hotel Chelsea', 'Holding Hands with God'],
    contexts: [
      {
        page: 12,
        chapter: 'Monday\'s Children',
        text: 'I discovered Rimbaud\'s Illuminations and it changed everything. Here was a poet who lived...',
        discoveryValue: 'Book: Illuminations - Prose poems that revolutionized modern poetry'
      },
      {
        page: 234,
        chapter: 'Holding Hands with God',
        text: 'Like Rimbaud, we believed in the derangement of the senses, in art as transformation...',
        discoveryValue: 'Rimbaud\'s philosophy of poetic vision through sensory disruption'
      }
    ],
    totalMentions: 31,
    significance: 'high',
    relatedWorks: ['Illuminations', 'A Season in Hell', 'The Drunken Boat'],
    period: '19th century symbolist'
  },
  {
    id: 'chelsea-hotel',
    name: 'Chelsea Hotel',
    type: 'venue',
    pages: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100],
    chapters: ['Hotel Chelsea'],
    contexts: [
      {
        page: 89,
        chapter: 'Hotel Chelsea',
        text: 'The Chelsea Hotel was our haven, where artists lived and created in beautiful squalor...',
        discoveryValue: 'Historic NYC hotel - home to artists, writers, musicians since 1884'
      },
      {
        page: 95,
        chapter: 'Hotel Chelsea',
        text: 'Dylan Thomas drank himself to death here, Sid killed Nancy in room 100...',
        discoveryValue: 'Notorious cultural history of the Chelsea Hotel'
      }
    ],
    totalMentions: 67,
    significance: 'high',
    period: 'Historic landmark'
  },
  {
    id: 'maxs-kansas-city',
    name: 'Max\'s Kansas City',
    type: 'venue',
    pages: [112, 134, 156, 178, 201, 223],
    chapters: ['Hotel Chelsea', 'Separate Ways Together'],
    contexts: [
      {
        page: 112,
        chapter: 'Hotel Chelsea',
        text: 'Max\'s Kansas City was where everyone went - Warhol\'s crowd, the Velvet Underground...',
        discoveryValue: 'Legendary nightclub and gathering place for NYC artists (1965-1981)'
      }
    ],
    totalMentions: 28,
    significance: 'high',
    period: '1960s-1970s NYC scene'
  },
  {
    id: 'allen-ginsberg',
    name: 'Allen Ginsberg',
    type: 'author',
    pages: [123, 145, 167, 189, 212],
    chapters: ['Hotel Chelsea', 'Separate Ways Together'],
    contexts: [
      {
        page: 123,
        chapter: 'Hotel Chelsea',
        text: 'Allen Ginsberg came to our reading, his presence like a benediction from the Beat gods...',
        discoveryValue: 'Beat Generation poet - author of "Howl" and cultural icon'
      }
    ],
    totalMentions: 14,
    significance: 'high',
    relatedWorks: ['Howl', 'Kaddish', 'America'],
    period: 'Beat Generation'
  },
  {
    id: 'william-blake',
    name: 'William Blake',
    type: 'author',
    pages: [23, 45, 67, 89, 156, 234],
    chapters: ['Monday\'s Children', 'Just Kids', 'Holding Hands with God'],
    contexts: [
      {
        page: 23,
        chapter: 'Monday\'s Children',
        text: 'Blake\'s Songs of Innocence and Experience showed me that poetry could be visionary...',
        discoveryValue: 'Visionary poet and artist - influenced Romanticism and counterculture'
      }
    ],
    totalMentions: 19,
    significance: 'high',
    relatedWorks: ['Songs of Innocence and Experience', 'The Marriage of Heaven and Hell'],
    period: 'Romantic era'
  },
  {
    id: 'john-coltrane',
    name: 'John Coltrane',
    type: 'musician',
    pages: [78, 101, 134, 178],
    chapters: ['Just Kids', 'Hotel Chelsea'],
    contexts: [
      {
        page: 78,
        chapter: 'Just Kids',
        text: 'We played Coltrane\'s A Love Supreme over and over, its spiritual intensity matching our hunger...',
        discoveryValue: 'Album: A Love Supreme (1965) - Spiritual jazz masterpiece'
      }
    ],
    totalMentions: 11,
    significance: 'high',
    relatedWorks: ['A Love Supreme', 'Giant Steps', 'My Favorite Things'],
    period: 'Jazz legend'
  },
  {
    id: 'velvet-underground',
    name: 'The Velvet Underground',
    type: 'musician',
    pages: [90, 112, 134, 156, 178, 201],
    chapters: ['Hotel Chelsea', 'Separate Ways Together'],
    contexts: [
      {
        page: 90,
        chapter: 'Hotel Chelsea',
        text: 'The Velvet Underground played downstairs, Lou Reed\'s voice cutting through the smoke...',
        discoveryValue: 'Influential proto-punk band managed by Andy Warhol'
      }
    ],
    totalMentions: 21,
    significance: 'high',
    relatedWorks: ['The Velvet Underground & Nico', 'White Light/White Heat'],
    period: '1960s NYC underground'
  }
];

export const EntityDiscoverySearch: React.FC<EntityDiscoverySearchProps> = ({ 
  transcriptId, 
  onNavigateToPage 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<DiscoverableEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'musician': return <Music size={18} />;
      case 'artist': return <User size={18} />;
      case 'author': return <Book size={18} />;
      case 'venue': return <MapPin size={18} />;
      case 'album':
      case 'work': return <Disc size={18} />;
      case 'movement': return <Sparkles size={18} />;
      case 'publisher': return <Building size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'musician': return '#3b82f6';
      case 'artist': return '#10b981';
      case 'author': return '#f59e0b';
      case 'venue': return '#ef4444';
      case 'work':
      case 'album': return '#8b5cf6';
      case 'movement': return '#ec4899';
      case 'publisher': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Search entities
  const performSearch = useCallback(() => {
    setIsSearching(true);
    
    setTimeout(() => {
      let results = DISCOVERED_ENTITIES;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(entity => 
          entity.name.toLowerCase().includes(query) ||
          entity.contexts.some(ctx => ctx.text.toLowerCase().includes(query)) ||
          entity.relatedWorks?.some(work => work.toLowerCase().includes(query))
        );
      }
      
      // Filter by type
      if (selectedType !== 'all') {
        results = results.filter(entity => entity.type === selectedType);
      }
      
      // Sort by significance and mentions
      results.sort((a, b) => {
        if (a.significance !== b.significance) {
          const sigOrder = { high: 3, medium: 2, low: 1 };
          return sigOrder[b.significance] - sigOrder[a.significance];
        }
        return b.totalMentions - a.totalMentions;
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [searchQuery, selectedType]);

  // Perform search on query/type change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <div className="entity-discovery-search">
      <style>{`
        .entity-discovery-search {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .discovery-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .discovery-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .discovery-subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
        }

        .search-controls {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .search-input-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          font-size: 1.1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .type-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .type-filter {
          padding: 0.6rem 1.2rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .type-filter:hover {
          border-color: #667eea;
          background: #f9fafb;
        }

        .type-filter.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .search-results {
          display: grid;
          gap: 1.5rem;
        }

        .entity-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
          cursor: pointer;
        }

        .entity-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .entity-info {
          flex: 1;
        }

        .entity-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .entity-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .entity-type {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.8rem;
          background: #f3f4f6;
          border-radius: 6px;
          font-weight: 500;
        }

        .entity-mentions {
          font-weight: 600;
        }

        .entity-significance {
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .significance-high {
          background: #fef3c7;
          color: #92400e;
        }

        .significance-medium {
          background: #dbeafe;
          color: #1e40af;
        }

        .significance-low {
          background: #f3f4f6;
          color: #6b7280;
        }

        .entity-contexts {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .context-item {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.8rem;
        }

        .context-location {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .context-page {
          font-weight: 600;
          color: #4b5563;
          font-size: 0.9rem;
        }

        .context-chapter {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .context-text {
          color: #374151;
          line-height: 1.6;
          font-style: italic;
          margin-bottom: 0.5rem;
        }

        .discovery-value {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
          font-size: 0.9rem;
          color: #78350f;
          margin-top: 0.5rem;
        }

        .related-works {
          margin-top: 1rem;
          padding: 0.8rem;
          background: #f0f9ff;
          border-radius: 8px;
        }

        .related-works-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 0.5rem;
        }

        .related-works-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .related-work {
          padding: 0.3rem 0.6rem;
          background: white;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          font-size: 0.85rem;
          color: #1e3a8a;
        }

        .go-to-page-btn {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .go-to-page-btn:hover {
          background: #5a67d8;
          transform: translateX(2px);
        }

        .expand-toggle {
          color: #667eea;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.5rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }
      `}</style>

      <div className="discovery-header">
        <h2 className="discovery-title">🔍 Cultural Discovery Search</h2>
        <p className="discovery-subtitle">
          Explore musicians, artists, venues, and cultural references from "Just Kids"
        </p>
      </div>

      <div className="search-controls">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search for artists, musicians, venues, works..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="type-filters">
          <button
            className={`type-filter ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            <Sparkles size={16} />
            All
          </button>
          <button
            className={`type-filter ${selectedType === 'musician' ? 'active' : ''}`}
            onClick={() => setSelectedType('musician')}
          >
            <Music size={16} />
            Musicians
          </button>
          <button
            className={`type-filter ${selectedType === 'artist' ? 'active' : ''}`}
            onClick={() => setSelectedType('artist')}
          >
            <User size={16} />
            Artists
          </button>
          <button
            className={`type-filter ${selectedType === 'author' ? 'active' : ''}`}
            onClick={() => setSelectedType('author')}
          >
            <Book size={16} />
            Authors
          </button>
          <button
            className={`type-filter ${selectedType === 'venue' ? 'active' : ''}`}
            onClick={() => setSelectedType('venue')}
          >
            <MapPin size={16} />
            Venues
          </button>
        </div>
      </div>

      <div className="search-results">
        {isSearching ? (
          <div className="loading-spinner">
            Discovering entities...
          </div>
        ) : searchResults.length === 0 ? (
          <div className="no-results">
            No entities found. Try a different search term or filter.
          </div>
        ) : (
          searchResults.map(entity => (
            <div key={entity.id} className="entity-card">
              <div className="entity-header">
                <div className="entity-info">
                  <div className="entity-name">
                    {getEntityIcon(entity.type)}
                    {entity.name}
                  </div>
                  <div className="entity-meta">
                    <span 
                      className="entity-type" 
                      style={{ borderLeft: `3px solid ${getTypeColor(entity.type)}` }}
                    >
                      {entity.type}
                    </span>
                    <span className="entity-mentions">
                      {entity.totalMentions} mentions
                    </span>
                    {entity.period && (
                      <span>{entity.period}</span>
                    )}
                    <span className={`entity-significance significance-${entity.significance}`}>
                      {entity.significance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Show first context always */}
              <div className="entity-contexts">
                {entity.contexts.slice(0, expandedEntity === entity.id ? undefined : 1).map((context, idx) => (
                  <div key={idx} className="context-item">
                    <div className="context-location">
                      <span className="context-page">Page {context.page}</span>
                      <span className="context-chapter">{context.chapter}</span>
                      {onNavigateToPage && (
                        <button 
                          className="go-to-page-btn"
                          onClick={() => onNavigateToPage(context.page)}
                        >
                          Go to Page
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    <div className="context-text">
                      "{context.text}"
                    </div>
                    {context.discoveryValue && (
                      <div className="discovery-value">
                        💡 {context.discoveryValue}
                      </div>
                    )}
                  </div>
                ))}
                
                {entity.contexts.length > 1 && (
                  <button
                    className="expand-toggle"
                    onClick={() => setExpandedEntity(expandedEntity === entity.id ? null : entity.id)}
                  >
                    {expandedEntity === entity.id ? 'Show less' : `Show ${entity.contexts.length - 1} more contexts`}
                    <ChevronRight size={16} style={{ 
                      transform: expandedEntity === entity.id ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s'
                    }} />
                  </button>
                )}
              </div>

              {/* Related works */}
              {entity.relatedWorks && entity.relatedWorks.length > 0 && (
                <div className="related-works">
                  <div className="related-works-title">Related Works & References:</div>
                  <div className="related-works-list">
                    {entity.relatedWorks.map((work, idx) => (
                      <span key={idx} className="related-work">{work}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};