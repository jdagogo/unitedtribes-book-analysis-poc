// Unified Data Lake Schema for Cross-Media Cultural Analysis
// Supports: Patti Smith book content, Merle Haggard podcast, YouTube video transcripts

export interface UnifiedMediaSource {
  id: string;
  type: 'book' | 'podcast' | 'youtube_video' | 'audiobook';
  title: string;
  creator: string;
  publishedDate: string;
  duration?: number; // in seconds, null for books
  url?: string;
  description: string;
  metadata: {
    // Book-specific
    isbn?: string;
    publisher?: string;
    pages?: number;
    // Podcast-specific
    showName?: string;
    host?: string;
    episode?: string;
    // YouTube-specific
    videoId?: string;
    channel?: string;
    viewCount?: number;
    // Common
    language: string;
    genre?: string[];
    tags?: string[];
  };
}

export interface UnifiedEntity {
  id: string;
  name: string;
  type: 'person' | 'place' | 'organization' | 'work' | 'concept' | 'event' | 'song' | 'album' | 'venue';
  category: string; // More specific categorization within type
  description: string;
  aliases: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'bittersweet' | 'nostalgic' | 'transformative';
  importance: number; // 0-100 scale
  
  // Cross-media references
  sources: MediaReference[];
  
  // Rich content
  videoResources?: VideoResource[];
  imageResources?: ImageResource[];
  audioResources?: AudioResource[];
  
  // Relationships to other entities
  relationships: EntityRelationship[];
  
  // Cultural context
  culturalContext?: string;
  historicalPeriod?: string;
  themes?: string[];
  emotions?: string[];
}

export interface MediaReference {
  sourceId: string; // References UnifiedMediaSource.id
  sourceType: 'book' | 'podcast' | 'youtube_video' | 'audiobook';
  
  // Mentions within the source
  mentions: Mention[];
  
  // Source-specific metadata
  sourceMetadata: {
    // Book references
    chapters?: string[];
    pageNumbers?: number[];
    
    // Podcast/Audio references
    timestamps?: TimestampRange[];
    speakers?: string[];
    
    // Video references
    videoTimestamps?: TimestampRange[];
    transcriptPositions?: number[];
  };
}

export interface Mention {
  id: string;
  text: string; // The actual text that mentioned the entity
  context: string; // Surrounding context
  
  // Position in source
  position: {
    // Book position
    chapter?: string;
    page?: number;
    paragraph?: number;
    
    // Audio/Video position
    timestamp?: number; // seconds from start
    timestampRange?: TimestampRange;
    
    // Text position (for transcripts)
    startOffset?: number;
    endOffset?: number;
    wordIndex?: number;
  };
  
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: number; // 0-100
  themes?: string[];
}

export interface TimestampRange {
  start: number; // seconds
  end: number;   // seconds
  duration: number;
}

export interface VideoResource {
  title: string;
  source: 'YouTube' | 'Vimeo' | 'Other';
  url: string;
  description: string;
  thumbnail: string;
  duration: string;
  embedCode?: string;
}

export interface ImageResource {
  url: string;
  description: string;
  source: string;
  caption?: string;
}

export interface AudioResource {
  url: string;
  description: string;
  duration: string;
  format: string;
}

export interface EntityRelationship {
  entityId: string;
  relationshipType: 'collaborated_with' | 'influenced' | 'friend_of' | 'performed_at' | 'wrote_about' | 'contemporary_of' | 'mentor_of' | 'part_of';
  description: string;
  strength: number; // 0-100, how strong the relationship is
  timeframe?: string; // "1960s-1970s", "lifelong", etc.
  evidence: MediaReference[]; // Sources that support this relationship
}

// Search and Discovery Types
export interface SearchQuery {
  query: string;
  filters?: {
    mediaTypes?: ('book' | 'podcast' | 'youtube_video' | 'audiobook')[];
    entityTypes?: ('person' | 'place' | 'organization' | 'work' | 'concept' | 'event')[];
    timeframe?: {
      start?: string;
      end?: string;
    };
    sentiment?: ('positive' | 'negative' | 'neutral' | 'bittersweet')[];
    importance?: {
      min?: number;
      max?: number;
    };
    themes?: string[];
  };
  sort?: {
    field: 'relevance' | 'importance' | 'date' | 'mentions';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entity: UnifiedEntity;
  relevanceScore: number;
  matchedMentions: Mention[];
  crossMediaConnections: {
    sourceType: string;
    sourceTitle: string;
    mentionCount: number;
    topMentions: Mention[];
  }[];
}

export interface CrossMediaDiscovery {
  primaryEntity: UnifiedEntity;
  relatedEntities: {
    entity: UnifiedEntity;
    connectionStrength: number;
    sharedSources: string[];
    relationshipPaths: EntityRelationship[];
  }[];
  thematicConnections: {
    theme: string;
    entities: string[]; // entity IDs
    sources: string[]; // source IDs
    strength: number;
  }[];
}

// Data Lake Storage Structure
export interface DataLakeIndex {
  // Entity indices for fast lookup
  entityIndex: Map<string, UnifiedEntity>;
  nameToEntityIndex: Map<string, string[]>; // name/alias to entity IDs
  
  // Source indices
  sourceIndex: Map<string, UnifiedMediaSource>;
  
  // Search indices
  textIndex: Map<string, string[]>; // word to entity IDs
  themeIndex: Map<string, string[]>; // theme to entity IDs
  
  // Cross-reference indices
  entityToSourcesIndex: Map<string, string[]>; // entity ID to source IDs
  sourceToEntitiesIndex: Map<string, string[]>; // source ID to entity IDs
  
  // Relationship graph
  relationshipGraph: Map<string, string[]>; // entity ID to related entity IDs
}

// API Response Types
export interface UnifiedSearchResponse {
  query: SearchQuery;
  totalResults: number;
  results: SearchResult[];
  facets: {
    mediaTypes: { [key: string]: number };
    entityTypes: { [key: string]: number };
    themes: { [key: string]: number };
    timeframes: { [key: string]: number };
  };
  suggestions?: string[];
  processingTime: number;
}

export interface EntityDetailsResponse {
  entity: UnifiedEntity;
  relatedEntities: UnifiedEntity[];
  crossMediaPresence: {
    [sourceType: string]: {
      sourceCount: number;
      mentionCount: number;
      topMentions: Mention[];
    };
  };
  timeline?: {
    date: string;
    event: string;
    source: string;
  }[];
}