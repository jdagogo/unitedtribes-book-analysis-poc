import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Music, 
  User, 
  Building, 
  MapPin, 
  Calendar,
  Filter,
  X,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react';

// Entity types with color schemes
const ENTITY_COLORS = {
  CreativeWork: { 
    bg: '#dbeafe', 
    border: '#3b82f6', 
    text: '#1e40af',
    icon: Music,
    label: 'Works'
  },
  CreativePerson: { 
    bg: '#dcfce7', 
    border: '#22c55e', 
    text: '#166534',
    icon: User,
    label: 'People'
  },
  CreativeOrganization: { 
    bg: '#fed7aa', 
    border: '#fb923c', 
    text: '#9a3412',
    icon: Building,
    label: 'Organizations'
  },
  Place: { 
    bg: '#fef3c7', 
    border: '#fbbf24', 
    text: '#92400e',
    icon: MapPin,
    label: 'Places'
  },
  CreativeEvent: { 
    bg: '#e9d5ff', 
    border: '#a855f7', 
    text: '#7c2d12',
    icon: Calendar,
    label: 'Events'
  },
  Other: { 
    bg: '#f3f4f6', 
    border: '#9ca3af', 
    text: '#4b5563',
    icon: Filter,
    label: 'Other'
  },
} as const;

interface Entity {
  name: string;
  type: string;
  start: number;
  end: number;
  confidence?: number;
  creativeType?: string;
}

interface TranscriptSegment {
  text: string;
  entities?: Entity[];
  timestamp?: number;
  speaker?: string;
}

interface SearchResult {
  segmentIndex: number;
  matchStart: number;
  matchEnd: number;
  entity?: Entity;
  context: string;
}

interface InteractiveTranscriptFixedProps {
  transcript: string | TranscriptSegment[];
  entities?: Entity[];
  onEntityClick?: (entity: Entity) => void;
  onSearch?: (query: string, type: 'text' | 'entity') => void;
  className?: string;
  showSearch?: boolean;
  maxContextLength?: number;
}

export const InteractiveTranscriptFixed: React.FC<InteractiveTranscriptFixedProps> = ({
  transcript,
  entities = [],
  onEntityClick,
  onSearch,
  className = '',
  showSearch = true,
  maxContextLength = 200,
}) => {
  // Initialize all state properly
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'text' | 'entity'>('text');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert transcript to segments if it's a string
  const segments = useMemo<TranscriptSegment[]>(() => {
    if (typeof transcript === 'string') {
      return [{ text: transcript, entities }];
    }
    return transcript;
  }, [transcript, entities]);

  // Group entities by type
  const entityGroups = useMemo(() => {
    const groups: Record<string, Entity[]> = {};
    const allEntities = segments.flatMap(s => s.entities || []);
    
    allEntities.forEach(entity => {
      const type = entity.creativeType || entity.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(entity);
    });
    
    return groups;
  }, [segments]);

  // Filter entities based on active filter
  const filteredEntities = useMemo(() => {
    if (!activeFilter) return segments.flatMap(s => s.entities || []);
    return segments.flatMap(s => 
      (s.entities || []).filter(e => 
        (e.creativeType || e.type) === activeFilter
      )
    );
  }, [segments, activeFilter]);

  // Safe search handler
  const handleSearch = useCallback((query?: string, type?: 'text' | 'entity') => {
    const searchStr = query || searchQuery || '';
    const searchMode = type || searchType || 'text';
    
    if (!searchStr.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setError(null);
    
    if (onSearch) {
      onSearch(searchStr, searchMode);
    }
    
    // Perform local search
    console.log(`Searching for "${searchStr}" in ${searchMode} mode`);
  }, [searchQuery, searchType, onSearch]);

  // Safe entity click handler
  const handleEntityClick = useCallback((entity: Entity) => {
    if (!entity) {
      console.error('Invalid entity clicked');
      return;
    }
    
    try {
      setSelectedEntity(entity);
      setSearchQuery(entity.name || '');
      setSearchType('entity');
      setShowSearchPanel(true);
      
      if (onEntityClick) {
        onEntityClick(entity);
      }
    } catch (err) {
      console.error('Error handling entity click:', err);
      setError('Failed to handle entity click');
    }
  }, [onEntityClick]);

  // Parse text with entities
  const parseTextWithEntities = useCallback((text: string, segmentEntities: Entity[] = []) => {
    if (!segmentEntities.length) {
      return [{ type: 'text', content: text, start: 0, end: text.length }];
    }

    const sortedEntities = [...segmentEntities].sort((a, b) => a.start - b.start);
    const parts: Array<{ type: 'text' | 'entity'; content: string; entity?: Entity; start: number; end: number; }> = [];
    let currentPos = 0;

    sortedEntities.forEach((entity) => {
      if (currentPos < entity.start) {
        parts.push({
          type: 'text',
          content: text.slice(currentPos, entity.start),
          start: currentPos,
          end: entity.start,
        });
      }

      parts.push({
        type: 'entity',
        content: text.slice(entity.start, entity.end),
        entity,
        start: entity.start,
        end: entity.end,
      });

      currentPos = entity.end;
    });

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

  // Get entity style
  const getEntityStyle = (entity: Entity) => {
    const type = entity.creativeType || entity.type || 'Other';
    const config = ENTITY_COLORS[type as keyof typeof ENTITY_COLORS] || ENTITY_COLORS.Other;
    
    return {
      backgroundColor: config.bg,
      borderBottom: `3px solid ${config.border}`,
      color: config.text,
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'inline-block',
      margin: '0.125rem',
      transition: 'all 0.2s',
    };
  };

  return (
    <div className={`interactive-transcript-fixed ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <span className="text-base font-medium">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-xl mb-8 shadow-lg">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Search className="h-6 w-6" />
              Search Transcript
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Search for text or click on any highlighted entity to find all occurrences
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('text')}
                className={`px-4 py-3 rounded-lg font-semibold text-base transition-all ${
                  searchType === 'text' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <FileText className="inline h-5 w-5 mr-2" />
                Text
              </button>
              <button
                onClick={() => setSearchType('entity')}
                className={`px-4 py-3 rounded-lg font-semibold text-base transition-all ${
                  searchType === 'entity' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                }`}
              >
                <Sparkles className="inline h-5 w-5 mr-2" />
                Entities
              </button>
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={!searchQuery || !searchQuery.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-base shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Entity Filters */}
      <div className="mb-6">
        <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Filter by Entity Type
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-2.5 rounded-full font-semibold text-base transition-all ${
              !activeFilter 
                ? 'bg-gray-800 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Entities
          </button>
          {Object.entries(ENTITY_COLORS).map(([type, config]) => {
            const IconComponent = config.icon;
            const count = entityGroups[type]?.length || 0;
            
            if (count === 0) return null;
            
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                className={`px-4 py-2.5 rounded-full font-semibold text-base transition-all flex items-center gap-2 ${
                  activeFilter === type
                    ? 'shadow-lg scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: activeFilter === type ? config.border : config.bg,
                  color: activeFilter === type ? 'white' : config.text,
                  border: `2px solid ${config.border}`,
                }}
              >
                <IconComponent className="h-5 w-5" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Entity Grid */}
      {filteredEntities.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Entity Quick Access ({filteredEntities.length} entities)
          </h4>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            {filteredEntities.map((entity, idx) => {
              const type = entity.creativeType || entity.type || 'Other';
              const config = ENTITY_COLORS[type as keyof typeof ENTITY_COLORS] || ENTITY_COLORS.Other;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={`${entity.name}-${idx}`}
                  onClick={() => handleEntityClick(entity)}
                  className="w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-all hover:scale-110 hover:shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: config.bg,
                    border: `2px solid ${config.border}`,
                    color: config.text,
                  }}
                  title={entity.name}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs font-semibold mt-1 truncate w-full px-1">
                    {entity.name.substring(0, 8)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Entity Info */}
      {selectedEntity && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                Selected Entity: {selectedEntity.name}
              </h4>
              <p className="text-base text-blue-600 dark:text-blue-400">
                Type: {selectedEntity.creativeType || selectedEntity.type}
              </p>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Transcript Text */}
      <div className="prose prose-lg max-w-none">
        {segments.map((segment, segmentIndex) => (
          <div key={segmentIndex} className="mb-6">
            {segment.speaker && (
              <div className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-lg">
                {segment.speaker}:
              </div>
            )}
            <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
              {parseTextWithEntities(segment.text, segment.entities).map((part, partIndex) => {
                if (part.type === 'text') {
                  return <span key={partIndex}>{part.content}</span>;
                }
                
                if (part.type === 'entity' && part.entity) {
                  const isFiltered = !activeFilter || 
                    (part.entity.creativeType || part.entity.type) === activeFilter;
                  
                  if (!isFiltered) {
                    return <span key={partIndex}>{part.content}</span>;
                  }
                  
                  return (
                    <span
                      key={partIndex}
                      onClick={() => handleEntityClick(part.entity!)}
                      onMouseEnter={() => setHoveredEntity(part.entity!)}
                      onMouseLeave={() => setHoveredEntity(null)}
                      style={getEntityStyle(part.entity)}
                      className="entity-highlight hover:opacity-80 hover:scale-105 transition-all"
                    >
                      {part.content}
                    </span>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hovered Entity Tooltip */}
      {hoveredEntity && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-200 z-50">
          <h5 className="font-bold text-lg mb-2">{hoveredEntity.name}</h5>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Type: {hoveredEntity.creativeType || hoveredEntity.type}
          </p>
          {hoveredEntity.confidence && (
            <p className="text-sm text-gray-500">
              Confidence: {(hoveredEntity.confidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};