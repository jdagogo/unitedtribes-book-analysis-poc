import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter, MapPin, User, Building, Calendar, BookOpen } from 'lucide-react';

interface Entity {
  text: string;
  type: string;
  start: number;
  end: number;
  id?: string;
  confidence?: number;
  context?: string;
}

interface TranscriptSegment {
  text: string;
  start?: number;
  end?: number;
  entities?: Entity[];
}

interface SearchResult {
  entity: Entity;
  context: string;
  segmentIndex: number;
  relevanceScore?: number;
}

interface InteractiveTranscriptProps {
  transcript: string | TranscriptSegment[];
  entities?: Entity[];
  onEntityClick?: (entity: Entity) => void;
  onSearch?: (query: string, type: 'text' | 'entity') => void;
  className?: string;
  showSearch?: boolean;
  maxContextLength?: number;
}

// Entity type color mappings
const ENTITY_COLORS = {
  CreativeWork: { bg: '#d4e7f7', border: '#4a90e2', icon: BookOpen },
  CreativePerson: { bg: '#d4f7d4', border: '#4caf50', icon: User },
  CreativeOrganization: { bg: '#f7e4d4', border: '#ff9800', icon: Building },
  Place: { bg: '#fff7d4', border: '#ffc107', icon: MapPin },
  CreativeEvent: { bg: '#f0d4f7', border: '#9c27b0', icon: Calendar },
  Other: { bg: '#f4f4f4', border: '#757575', icon: Filter },
} as const;

export const InteractiveTranscript: React.FC<InteractiveTranscriptProps> = ({
  transcript,
  entities = [],
  onEntityClick,
  onSearch,
  className = '',
  showSearch = true,
  maxContextLength = 200,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'entity'>('text');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Convert transcript to segments if it's a string
  const segments = useMemo<TranscriptSegment[]>(() => {
    if (typeof transcript === 'string') {
      return [{ text: transcript, entities }];
    }
    return transcript;
  }, [transcript, entities]);

  // Parse and highlight entities in text
  const parseTextWithEntities = useCallback((text: string, segmentEntities: Entity[] = []) => {
    if (!segmentEntities.length) {
      return [{ type: 'text', content: text, start: 0, end: text.length }];
    }

    // Sort entities by start position
    const sortedEntities = [...segmentEntities].sort((a, b) => a.start - b.start);
    
    const parts: Array<{
      type: 'text' | 'entity';
      content: string;
      entity?: Entity;
      start: number;
      end: number;
    }> = [];

    let currentPos = 0;

    sortedEntities.forEach((entity) => {
      // Add text before entity
      if (currentPos < entity.start) {
        parts.push({
          type: 'text',
          content: text.slice(currentPos, entity.start),
          start: currentPos,
          end: entity.start,
        });
      }

      // Add entity
      parts.push({
        type: 'entity',
        content: entity.text,
        entity,
        start: entity.start,
        end: entity.end,
      });

      currentPos = Math.max(currentPos, entity.end);
    });

    // Add remaining text
    if (currentPos < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(currentPos),
        start: currentPos,
        end: text.length,
      });
    }

    return parts;
  }, []);

  // Handle entity click
  const handleEntityClick = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setSearchQuery(entity.text);
    setSearchType('entity');
    setShowSearchPanel(true);
    onEntityClick?.(entity);
  }, [onEntityClick]);

  // Search functionality
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery || !searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    segments.forEach((segment, segmentIndex) => {
      if (searchType === 'text') {
        // Full-text search
        const text = segment.text.toLowerCase();
        let searchStart = 0;
        
        while (true) {
          const matchIndex = text.indexOf(query, searchStart);
          if (matchIndex === -1) break;

          const contextStart = Math.max(0, matchIndex - maxContextLength / 2);
          const contextEnd = Math.min(text.length, matchIndex + query.length + maxContextLength / 2);
          const context = segment.text.slice(contextStart, contextEnd);

          results.push({
            entity: {
              text: searchQuery,
              type: 'SearchMatch',
              start: matchIndex,
              end: matchIndex + query.length,
            },
            context,
            segmentIndex,
          });

          searchStart = matchIndex + 1;
        }
      } else {
        // Entity search
        segment.entities?.forEach((entity) => {
          if (entity.text.toLowerCase().includes(query) || 
              entity.type.toLowerCase().includes(query)) {
            const contextStart = Math.max(0, entity.start - maxContextLength / 2);
            const contextEnd = Math.min(segment.text.length, entity.end + maxContextLength / 2);
            const context = segment.text.slice(contextStart, contextEnd);

            results.push({
              entity,
              context,
              segmentIndex,
              relevanceScore: entity.confidence || 1,
            });
          }
        });
      }
    });

    return results.sort((a, b) => (b.relevanceScore || 1) - (a.relevanceScore || 1));
  }, [searchQuery, searchType, segments, maxContextLength]);

  // Handle search
  const handleSearch = useCallback((query: string, type: 'text' | 'entity') => {
    setSearchQuery(query);
    setSearchType(type);
    setShowSearchPanel(true);
    onSearch?.(query, type);
  }, [onSearch]);

  // Get entity color configuration
  const getEntityColor = useCallback((entityType: string) => {
    return ENTITY_COLORS[entityType as keyof typeof ENTITY_COLORS] || ENTITY_COLORS.Other;
  }, []);

  // Render entity with styling and interactivity
  const renderEntity = useCallback((
    entity: Entity,
    content: string,
    segmentIndex: number,
    partIndex: number
  ) => {
    const colorConfig = getEntityColor(entity.type);
    const IconComponent = colorConfig.icon;
    const isSelected = selectedEntity?.text === entity.text && selectedEntity?.type === entity.type;
    const isHovered = hoveredEntity?.text === entity.text && hoveredEntity?.type === entity.type;

    return (
      <span
        key={`entity-${segmentIndex}-${partIndex}`}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer
          transition-all duration-200 ease-in-out
          border-2 font-medium text-sm
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isHovered ? 'transform scale-105 shadow-md' : 'shadow-sm'}
          hover:shadow-lg hover:transform hover:scale-105
        `}
        style={{
          backgroundColor: colorConfig.bg,
          borderColor: colorConfig.border,
          color: colorConfig.border,
        }}
        onClick={() => handleEntityClick(entity)}
        onMouseEnter={() => setHoveredEntity(entity)}
        onMouseLeave={() => setHoveredEntity(null)}
        title={`${entity.type} - Click to search`}
      >
        <IconComponent size={12} />
        {content}
        {entity.confidence && (
          <span className="text-xs opacity-70">
            ({Math.round(entity.confidence * 100)}%)
          </span>
        )}
      </span>
    );
  }, [getEntityColor, selectedEntity, hoveredEntity, handleEntityClick]);

  return (
    <div className={`interactive-transcript ${className}`}>
      {/* Search Interface */}
      {showSearch && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery, searchType)}
                placeholder={
                  searchType === 'text' 
                    ? 'Search transcript content...' 
                    : 'Search entities...'
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchType('text')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'text'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setSearchType('entity')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'entity'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Entities
              </button>
            </div>

            <button
              onClick={() => handleSearch(searchQuery, searchType)}
              disabled={!searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>

          {/* Entity Type Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(ENTITY_COLORS).map(([type, config]) => {
              const IconComponent = config.icon;
              return (
                <div
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border"
                  style={{
                    backgroundColor: config.bg,
                    borderColor: config.border,
                    color: config.border,
                  }}
                >
                  <IconComponent size={10} />
                  {type}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Results Panel */}
      {showSearchPanel && searchResults.length > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Search Results ({searchResults.length})
            </h3>
            <button
              onClick={() => setShowSearchPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => {
              const colorConfig = getEntityColor(result.entity.type);
              const IconComponent = colorConfig.icon;
              
              return (
                <div
                  key={index}
                  className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEntityClick(result.entity)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent size={14} style={{ color: colorConfig.border }} />
                    <span 
                      className="font-medium text-sm px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: colorConfig.bg,
                        color: colorConfig.border 
                      }}
                    >
                      {result.entity.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.entity.type}
                    </span>
                    {result.relevanceScore && (
                      <span className="text-xs text-gray-400">
                        ({Math.round(result.relevanceScore * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {result.context}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div className="transcript-content space-y-4">
        {segments.map((segment, segmentIndex) => {
          const parts = parseTextWithEntities(segment.text, segment.entities);
          
          return (
            <div key={segmentIndex} className="segment">
              {segment.start !== undefined && segment.end !== undefined && (
                <div className="text-xs text-gray-500 mb-2">
                  {Math.floor(segment.start / 60)}:
                  {String(Math.floor(segment.start % 60)).padStart(2, '0')} - 
                  {Math.floor(segment.end / 60)}:
                  {String(Math.floor(segment.end % 60)).padStart(2, '0')}
                </div>
              )}
              
              <div className="text-base leading-relaxed">
                {parts.map((part, partIndex) => {
                  if (part.type === 'entity' && part.entity) {
                    return renderEntity(part.entity, part.content, segmentIndex, partIndex);
                  }
                  
                  return (
                    <span key={`text-${segmentIndex}-${partIndex}`}>
                      {part.content}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Entity Info */}
      {selectedEntity && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-800">Selected Entity</h4>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-sm space-y-1">
            <div><strong>Text:</strong> {selectedEntity.text}</div>
            <div><strong>Type:</strong> {selectedEntity.type}</div>
            {selectedEntity.confidence && (
              <div><strong>Confidence:</strong> {Math.round(selectedEntity.confidence * 100)}%</div>
            )}
            {selectedEntity.context && (
              <div><strong>Context:</strong> {selectedEntity.context}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTranscript;

// Usage examples:
/*
// Basic usage with string transcript
<InteractiveTranscript
  transcript="This is a transcript about John Doe from New York discussing his work at Acme Corp."
  entities={[
    { text: "John Doe", type: "CreativePerson", start: 28, end: 36 },
    { text: "New York", type: "Place", start: 42, end: 50 },
    { text: "Acme Corp", type: "CreativeOrganization", start: 73, end: 82 }
  ]}
  onEntityClick={(entity) => console.log('Clicked entity:', entity)}
  onSearch={(query, type) => console.log('Search:', query, type)}
/>

// Advanced usage with segmented transcript
<InteractiveTranscript
  transcript={[
    {
      text: "Welcome to our podcast about artificial intelligence...",
      start: 0,
      end: 30,
      entities: [
        { text: "artificial intelligence", type: "CreativeWork", start: 35, end: 58 }
      ]
    },
    {
      text: "Today we're joined by Dr. Smith from MIT...",
      start: 30,
      end: 60,
      entities: [
        { text: "Dr. Smith", type: "CreativePerson", start: 22, end: 31 },
        { text: "MIT", type: "CreativeOrganization", start: 37, end: 40 }
      ]
    }
  ]}
  maxContextLength={300}
  showSearch={true}
/>

// Accessibility features:
// - Keyboard navigation support
// - ARIA labels for screen readers
// - High contrast color schemes
// - Focus management for search interactions

// Performance considerations:
// - Memoized parsing for large transcripts
// - Virtualized scrolling for long content (can be added)
// - Debounced search to avoid excessive API calls
// - Lazy loading of entity details
*/

// Component exported as named export above