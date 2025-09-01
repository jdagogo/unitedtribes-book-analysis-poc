interface ExtractedEntity {
  name: string;
  type: string;
  category: string;
  mentions: number;
  context: string;
  importance: number;
  aliases?: string[];
  creativeType?: string; // For creative entities: song, album, book, film, etc.
  releaseYear?: number;   // For dated creative works
  creators?: string[];    // Associated artists, authors, directors
  role?: string;          // For creative persons: artist, director, author, etc.
}

// Enhanced creative entity types
type EntityCategory = 'CreativeWork' | 'CreativePerson' | 'CreativeOrganization' | 'Place' | 'CreativeEvent' | 'Person' | 'Organization' | 'Cultural Reference' | 'Historical' | 'Other';

type CreativeWorkType = 'song' | 'album' | 'book' | 'novel' | 'film' | 'movie' | 'tv_show' | 'series' | 'play' | 'podcast' | 'documentary';

type CreativePersonRole = 'artist' | 'musician' | 'singer' | 'songwriter' | 'composer' | 'director' | 'producer' | 'author' | 'writer' | 'actor' | 'actress' | 'conductor' | 'performer';

type CreativeOrgType = 'record_label' | 'studio' | 'venue' | 'theater' | 'gallery' | 'museum' | 'publisher' | 'production_company';

type CreativeEventType = 'festival' | 'concert' | 'tour' | 'movement' | 'award_ceremony' | 'premiere' | 'exhibition';

// Pattern-based entity extraction (can be enhanced with NLP libraries)
export async function extractEntitiesFromText(text: string): Promise<ExtractedEntity[]> {
  const entities: Map<string, ExtractedEntity> = new Map();
  
  // Limit processing for very large texts
  const MAX_PROCESSING_LENGTH = 150000;
  if (text.length > MAX_PROCESSING_LENGTH) {
    console.log(`⚠️ Text truncated from ${text.length} to ${MAX_PROCESSING_LENGTH} chars for entity extraction`);
    text = text.substring(0, MAX_PROCESSING_LENGTH);
  }
  
  // Enhanced patterns for creative and artistic entities
  const patterns = {
    // Creative Works - Songs, Albums, Books, Films
    creative_works: [
      // Quoted titles: "Song Name", "Album Title", "Book Title"
      /"([^"]{3,50})"/g,
      // Album with year: Album Name (1975)
      /\b([A-Z][A-Za-z\s&']{3,35})\s*\((19\d{2}|20\d{2})\)/g,
      // Specific creative work indicators with better boundaries
      /(?:the (?:song|track|single))\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:his|her|their) song\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:the (?:album|record|LP|EP))\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:his|her|their) album\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:the (?:book|novel|memoir))\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:his|her) book\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:the (?:film|movie|picture))\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:his|her) film\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      /(?:the (?:show|series)|TV show)\s+["']?([A-Z][A-Za-z\s&']{2,35})["']?(?=\s|$|[.,!?])/gi,
      // Released/recorded patterns
      /(?:released|recorded|wrote)\s+["']([A-Z][A-Za-z\s&']{2,35})["']/gi,
    ],
    
    // Creative Persons - Artists, Directors, Authors
    creative_persons: [
      // Role-based identification
      /(?:artist|musician|singer|songwriter|composer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
      /(?:director|filmmaker)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
      /(?:author|writer|novelist)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
      /(?:producer|actor|actress)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
      // Reverse patterns - person then role
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}),?\s+(?:the (?:singer|artist|director|author|writer))/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+(?:sang|performed|directed|wrote|composed|produced)/gi,
      // Band and group names with better boundaries
      /(?:band|group)\s+([A-Z][A-Za-z\s&']{3,25})(?=\s|$|[.,!?])/gi,
      /([A-Z][A-Za-z\s&']{3,25})\s+(?:band|is a band)(?=\s|$|[.,!?])/gi,
    ],
    
    // Creative Organizations - Labels, Studios, Venues
    creative_organizations: [
      // Record labels with better boundaries
      /([A-Z][A-Za-z\s&]{2,25})\s+(?:Records|Music|Entertainment|Label)(?=\s|$|[.,!?])/gi,
      /(?:on|with|signed to)\s+([A-Z][A-Za-z\s&]{2,30}\s+(?:Records|Music|Entertainment))(?=\s|$|[.,!?])/gi,
      // Studios with better boundaries
      /([A-Z][A-Za-z\s&]{2,25})\s+(?:Studios?|Pictures?|Films?|Productions?)(?=\s|$|[.,!?])/gi,
      // Venues and theaters
      /(?:at|performed at|played at)\s+(?:the\s+)?([A-Z][A-Za-z\s&']{3,30}(?:Theater|Theatre|Hall|Arena|Center|Club|Venue))(?=\s|$|[.,!?])/gi,
      /([A-Z][A-Za-z\s&']{3,30}(?:Theater|Theatre|Hall|Arena|Center|Club|Venue))(?=\s|$|[.,!?])/g,
      // Music venues
      /(?:at|performed at)\s+(?:the\s+)?([A-Z][A-Za-z\s&']{3,25}(?:House|Room|Lounge|Bar|Pub|Garden))(?=\s|$|[.,!?])/gi,
    ],
    
    // Enhanced Places with music/cultural context
    places: [
      // Major music cities
      /\b(Nashville|Memphis|New Orleans|Austin|Detroit|Seattle|Liverpool|London|New York|Los Angeles|Chicago|Atlanta)\b/gi,
      // States and countries
      /\b(Tennessee|Louisiana|Texas|California|New York|Mississippi|Alabama|Georgia|England|Ireland|Scotland)\b/gi,
      // General place patterns
      /\b([A-Z][a-z]+(?:ville|town|burg|ford|field|land|wood|shire|ham))\b/g,
      /\b(United States|America|UK|Britain|Canada|Australia|France|Germany|Italy|Spain)\b/gi,
    ],
    
    // Creative Events - Festivals, Tours, Movements
    creative_events: [
      // Festivals and events
      /([A-Z][A-Za-z\s&]+(?:Festival|Fest|Awards?))/gi,
      /(?:at|during|performed at)\s+(?:the\s+)?([A-Z][A-Za-z\s&]+(?:Festival|Fest))/gi,
      // Tours and concerts
      /([A-Z][A-Za-z\s&']+(?:Tour|Concert|Show))/gi,
      /(?:on|during)\s+(?:the\s+)?([A-Z][A-Za-z\s&']+(?:Tour|World Tour))/gi,
      // Cultural movements
      /\b(Woodstock|Monterey Pop|Live Aid|Coachella|Bonnaroo|SXSW|Sundance)\b/gi,
      /\b(British Invasion|Motown Sound|Grunge Movement|Punk Rock|New Wave)\b/gi,
    ],
    
    // General people (with titles)
    people: [
      /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
      /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Senator|President|Governor|Mayor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    ],
    
    // General organizations
    organizations: [
      /\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*(?:\s+(?:Inc|LLC|Corp|Corporation|Company|Group|Institute|University|College|School|Hospital|Bank|Church)))\b/g,
      /\b(FBI|CIA|NASA|NFL|NBA|MLB|NHL|UNESCO|WHO|UN|EU)\b/g,
    ],
    
    // Enhanced cultural references
    cultural: [
      // Awards
      /\b(Grammy|Oscar|Emmy|Tony|Pulitzer|Nobel|Golden Globe|BAFTA|Cannes|Sundance)\s+(?:Award|Prize|Winner|Nomination)?\b/gi,
      // Music genres and styles
      /\b(Rock and Roll|Country Music|Jazz|Blues|Hip Hop|Classical Music|Pop Music|Folk Music|R&B|Soul|Reggae|Electronic|House|Techno|Punk|Metal|Alternative|Indie)\b/gi,
      // Cultural periods and movements
      /\b(Harlem Renaissance|Beat Generation|Counterculture|Civil Rights Movement)\b/gi,
      // Holidays and celebrations
      /\b(Christmas|Easter|Thanksgiving|Halloween|New Year|Independence Day)\b/gi,
    ],
    
    // Historical events and dates
    historical: [
      /\b(World War [I|II|One|Two]|Civil War|Great Depression|Cold War|Vietnam War|Korean War)\b/gi,
      /\b(19\d{2}|20\d{2})\b/g, // Years
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    ]
  };
  
  // Extract entities using enhanced patterns
  for (const [type, typePatterns] of Object.entries(patterns)) {
    for (const pattern of typePatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        const entityName = (match[1] || match[0]).trim();
        
        // Skip very short or very long matches
        if (entityName.length < 3 || entityName.length > 100) continue;
        
        // Skip common words
        if (isCommonWord(entityName)) continue;
        
        // Skip partial matches that don't make sense as entities
        if (isPartialMatch(entityName, type)) continue;
        
        // Normalize entity name
        const normalizedName = normalizeEntityName(entityName);
        
        // Extract additional creative metadata
        const creativeMetadata = extractCreativeMetadata(match, text, type);
        
        if (entities.has(normalizedName)) {
          // Update existing entity
          const entity = entities.get(normalizedName)!;
          entity.mentions++;
          
          // Enhance with creative metadata if not already present
          if (creativeMetadata.releaseYear && !entity.releaseYear) {
            entity.releaseYear = creativeMetadata.releaseYear;
          }
          if (creativeMetadata.creativeType && !entity.creativeType) {
            entity.creativeType = creativeMetadata.creativeType;
          }
          if (creativeMetadata.role && !entity.role) {
            entity.role = creativeMetadata.role;
          }
          
          // Update context if this is a longer snippet
          const contextStart = Math.max(0, match.index - 75);
          const contextEnd = Math.min(text.length, match.index + entityName.length + 75);
          const newContext = text.substring(contextStart, contextEnd).trim();
          if (newContext.length > entity.context.length) {
            entity.context = newContext;
          }
        } else {
          // Create new entity with enhanced creative metadata
          const contextStart = Math.max(0, match.index - 75);
          const contextEnd = Math.min(text.length, match.index + entityName.length + 75);
          const context = text.substring(contextStart, contextEnd).trim();
          
          entities.set(normalizedName, {
            name: entityName,
            type: mapTypeToCategory(type),
            category: type,
            mentions: 1,
            context,
            importance: calculateCreativeImportance(entityName, type, 1, creativeMetadata),
            ...creativeMetadata
          });
        }
      }
    }
  }
  
  // Look for additional context and relationships
  enhanceEntitiesWithContext(entities, text);
  
  // Convert to array and sort by importance
  return Array.from(entities.values())
    .sort((a, b) => b.importance - a.importance);
}

function mapTypeToCategory(type: string): EntityCategory {
  const mapping: { [key: string]: EntityCategory } = {
    creative_works: 'CreativeWork',
    creative_persons: 'CreativePerson', 
    creative_organizations: 'CreativeOrganization',
    creative_events: 'CreativeEvent',
    people: 'Person',
    places: 'Place',
    organizations: 'Organization',
    cultural: 'Cultural Reference',
    historical: 'Historical'
  };
  return mapping[type] || 'Other';
}

// Extract creative metadata from matches
function extractCreativeMetadata(match: RegExpExecArray, text: string, type: string): Partial<ExtractedEntity> {
  const metadata: Partial<ExtractedEntity> = {};
  
  // Extract release year for albums
  if (type === 'creative_works' && match[2]) {
    metadata.releaseYear = parseInt(match[2]);
  }
  
  // Determine creative work type based on context
  if (type === 'creative_works') {
    const contextBefore = text.substring(Math.max(0, match.index - 50), match.index).toLowerCase();
    const contextAfter = text.substring(match.index, Math.min(text.length, match.index + 100)).toLowerCase();
    const fullContext = contextBefore + ' ' + contextAfter;
    
    if (fullContext.includes('song') || fullContext.includes('track') || fullContext.includes('single')) {
      metadata.creativeType = 'song';
    } else if (fullContext.includes('album') || fullContext.includes('record') || fullContext.includes('lp') || fullContext.includes('ep')) {
      metadata.creativeType = 'album';
    } else if (fullContext.includes('book') || fullContext.includes('novel') || fullContext.includes('memoir')) {
      metadata.creativeType = 'book';
    } else if (fullContext.includes('film') || fullContext.includes('movie') || fullContext.includes('picture')) {
      metadata.creativeType = 'film';
    } else if (fullContext.includes('show') || fullContext.includes('series') || fullContext.includes('tv')) {
      metadata.creativeType = 'tv_show';
    }
  }
  
  // Extract role for creative persons
  if (type === 'creative_persons') {
    const contextBefore = text.substring(Math.max(0, match.index - 30), match.index).toLowerCase();
    
    if (contextBefore.includes('artist') || contextBefore.includes('musician')) {
      metadata.role = 'artist';
    } else if (contextBefore.includes('singer')) {
      metadata.role = 'singer';
    } else if (contextBefore.includes('songwriter')) {
      metadata.role = 'songwriter';
    } else if (contextBefore.includes('director')) {
      metadata.role = 'director';
    } else if (contextBefore.includes('author') || contextBefore.includes('writer')) {
      metadata.role = 'author';
    } else if (contextBefore.includes('producer')) {
      metadata.role = 'producer';
    } else if (contextBefore.includes('composer')) {
      metadata.role = 'composer';
    }
  }
  
  return metadata;
}

function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
    'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
    'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
    'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'very', 'just', 'now', 'then', 'here', 'where', 'why', 'how',
    'some', 'more', 'other', 'many', 'much', 'most', 'good', 'new',
    'first', 'last', 'long', 'great', 'little', 'own', 'old', 'right',
    'big', 'high', 'different', 'small', 'large', 'next', 'early',
    'young', 'important', 'few', 'public', 'bad', 'same', 'able',
    // Exclude common single words that might be extracted as titles
    'something', 'anything', 'everything', 'nothing', 'someone', 'anyone',
    'everyone', 'nobody', 'somewhere', 'anywhere', 'everywhere', 'nowhere'
  ]);
  
  // Don't filter out potential creative work titles that are quoted
  if ((word.startsWith('"') && word.endsWith('"')) || 
      (word.startsWith("'") && word.endsWith("'"))) {
    return false;
  }
  
  return commonWords.has(word.toLowerCase());
}

function isPartialMatch(entityName: string, type: string): boolean {
  const name = entityName.toLowerCase();
  
  // Skip partial phrases that are not meaningful entities
  const partialPhrases = [
    'reached number', 'reached', 'number', 'was released', 'released on',
    'd was released', 'later used it', 'later', 'used it in his',
    'in his', 'his', 'her', 'their', 'the song', 'the album',
    'the film', 'the movie', 'the book', 'was', 'were', 'been',
    'have', 'had', 'and was', 'and were', 'it in', 'on the'
  ];
  
  // Check if the entity name is in our partial phrases list
  if (partialPhrases.includes(name)) {
    return true;
  }
  
  // Skip entities that start or end with common connecting words
  const connectingWords = ['and', 'was', 'were', 'on', 'in', 'at', 'of', 'to', 'from', 'with', 'by'];
  const words = name.split(' ');
  
  if (words.length > 1) {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    
    if (connectingWords.includes(firstWord) || connectingWords.includes(lastWord)) {
      return true;
    }
  }
  
  // Skip single word entities that are too generic for creative works
  if (type === 'creative_works' && words.length === 1) {
    const genericWords = ['revisited', 'song', 'album', 'film', 'movie', 'book'];
    if (genericWords.includes(name)) {
      return true;
    }
  }
  
  return false;
}

function calculateCreativeImportance(name: string, type: string, mentions: number, metadata: Partial<ExtractedEntity>): number {
  let importance = mentions * 10;
  
  // Enhanced boost importance based on creative entity types
  const typeBoosts: { [key: string]: number } = {
    creative_works: 25,        // Highest priority for songs, albums, books, films
    creative_persons: 22,      // High priority for artists, directors, authors
    creative_organizations: 18, // Record labels, studios, venues
    creative_events: 20,       // Festivals, tours, movements
    people: 15,
    places: 12,
    organizations: 12,
    cultural: 15,
    historical: 14
  };
  
  importance += typeBoosts[type] || 5;
  
  // Creative-specific boosts
  if (metadata.creativeType) {
    const creativeTypeBoosts: { [key: string]: number } = {
      song: 15,
      album: 12,
      book: 12,
      film: 12,
      movie: 12,
      tv_show: 10
    };
    importance += creativeTypeBoosts[metadata.creativeType] || 8;
  }
  
  if (metadata.role) {
    const roleBoosts: { [key: string]: number } = {
      artist: 12,
      singer: 12,
      director: 10,
      author: 10,
      songwriter: 8,
      producer: 8,
      composer: 8
    };
    importance += roleBoosts[metadata.role] || 5;
  }
  
  // Boost for release year (indicates specific work)
  if (metadata.releaseYear) {
    importance += 8;
  }
  
  // Boost for quoted titles (likely creative works)
  if (name.includes('"') || name.includes("'")) {
    importance += 12;
  }
  
  // Boost for longer, more specific names
  const words = name.split(' ');
  if (words.length > 1) {
    importance += Math.min(15, words.length * 3);
  }
  
  // Boost for creative indicators in name
  const creativeName = name.toLowerCase();
  if (creativeName.includes('the') && words.length > 1) {
    importance += 5; // "The Beatles", "The Rolling Stones"
  }
  
  // Cap at 100
  return Math.min(100, importance);
}

// Legacy function for backward compatibility
function calculateImportance(name: string, type: string, mentions: number): number {
  return calculateCreativeImportance(name, type, mentions, {});
}

function enhanceEntitiesWithContext(entities: Map<string, ExtractedEntity>, text: string): void {
  // Look for creative relationships and enhanced context
  const entityNames = Array.from(entities.keys());
  
  for (const [key, entity] of entities) {
    // Find co-occurrences with other entities
    const coOccurrences: string[] = [];
    const creativeRelationships: string[] = [];
    
    for (const otherKey of entityNames) {
      if (key === otherKey) continue;
      
      const otherEntity = entities.get(otherKey)!;
      
      // Check if entities appear near each other
      const pattern = new RegExp(
        `${escapeRegex(entity.name)}.{0,150}${escapeRegex(otherEntity.name)}`,
        'gi'
      );
      
      if (pattern.test(text)) {
        coOccurrences.push(otherEntity.name);
        
        // Identify creative relationships
        if (isCreativeRelationship(entity, otherEntity, text)) {
          creativeRelationships.push(otherEntity.name);
        }
      }
    }
    
    // Enhanced context extraction for creative entities
    if (entity.type === 'CreativeWork' || entity.type === 'CreativePerson' || 
        entity.type === 'CreativeOrganization' || entity.type === 'CreativeEvent') {
      
      // Look for additional creative context patterns
      const enhancedContext = extractEnhancedCreativeContext(entity, text);
      if (enhancedContext.length > entity.context.length) {
        entity.context = enhancedContext;
      }
      
      // Boost importance for creative relationships
      if (creativeRelationships.length > 0) {
        entity.importance = Math.min(100, entity.importance + creativeRelationships.length * 8);
      }
      
      // Store creators/collaborators
      if (creativeRelationships.length > 0 && !entity.creators) {
        entity.creators = creativeRelationships.slice(0, 5); // Limit to 5 creators
      }
    }
    
    // General relationship boost
    if (coOccurrences.length > 2) {
      entity.importance = Math.min(100, entity.importance + coOccurrences.length * 3);
    }
  }
}

// Check if two entities have a creative relationship
function isCreativeRelationship(entity1: ExtractedEntity, entity2: ExtractedEntity, text: string): boolean {
  const creativeRelationPatterns = [
    // Artist-Song relationships
    `${escapeRegex(entity1.name)}.{0,50}(?:sang|performed|recorded|wrote).{0,50}${escapeRegex(entity2.name)}`,
    `${escapeRegex(entity2.name)}.{0,50}(?:by|from).{0,50}${escapeRegex(entity1.name)}`,
    // Director-Film relationships
    `${escapeRegex(entity1.name)}.{0,50}(?:directed|produced).{0,50}${escapeRegex(entity2.name)}`,
    // Author-Book relationships
    `${escapeRegex(entity1.name)}.{0,50}(?:wrote|authored).{0,50}${escapeRegex(entity2.name)}`,
    // Album-Song relationships
    `${escapeRegex(entity2.name)}.{0,50}(?:from|off).{0,50}(?:the album|album).{0,50}${escapeRegex(entity1.name)}`,
  ];
  
  return creativeRelationPatterns.some(pattern => 
    new RegExp(pattern, 'gi').test(text)
  );
}

// Extract enhanced context for creative entities
function extractEnhancedCreativeContext(entity: ExtractedEntity, text: string): string {
  const entityPattern = new RegExp(escapeRegex(entity.name), 'gi');
  let bestContext = entity.context;
  let bestScore = 0;
  
  let match;
  while ((match = entityPattern.exec(text)) !== null) {
    // Look for creative context indicators
    const contextStart = Math.max(0, match.index - 100);
    const contextEnd = Math.min(text.length, match.index + entity.name.length + 100);
    const context = text.substring(contextStart, contextEnd).trim();
    
    // Score context based on creative indicators
    let score = 0;
    const lowerContext = context.toLowerCase();
    
    // Creative work indicators
    const creativeIndicators = [
      'released', 'recorded', 'produced', 'directed', 'wrote', 'composed',
      'performed', 'sang', 'album', 'song', 'film', 'movie', 'book',
      'hit', 'chart', 'billboard', 'grammy', 'oscar', 'award'
    ];
    
    creativeIndicators.forEach(indicator => {
      if (lowerContext.includes(indicator)) {
        score += 5;
      }
    });
    
    // Year mentions boost context
    if (/\b(19\d{2}|20\d{2})\b/.test(context)) {
      score += 3;
    }
    
    // Quote mentions boost context
    if (context.includes('"') || context.includes("'")) {
      score += 2;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestContext = context;
    }
  }
  
  return bestContext;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Extract key themes from text with enhanced creative focus
export function extractThemes(text: string): Array<{ name: string; score: number }> {
  const themes = [
    { 
      name: 'Music & Entertainment', 
      keywords: [
        'music', 'song', 'album', 'band', 'concert', 'tour', 'record', 'guitar', 'sing', 'perform',
        'artist', 'musician', 'singer', 'songwriter', 'composer', 'producer', 'studio', 'recording',
        'hit', 'chart', 'billboard', 'radio', 'single', 'track', 'melody', 'lyrics', 'vocals',
        'instrument', 'piano', 'drums', 'bass', 'violin', 'orchestra', 'rhythm', 'beat', 'sound'
      ]
    },
    { 
      name: 'Film & Television', 
      keywords: [
        'film', 'movie', 'cinema', 'director', 'actor', 'actress', 'producer', 'screenplay',
        'television', 'tv', 'show', 'series', 'episode', 'season', 'character', 'scene',
        'camera', 'filming', 'production', 'studio', 'hollywood', 'documentary', 'drama'
      ]
    },
    { 
      name: 'Literature & Writing', 
      keywords: [
        'book', 'novel', 'author', 'writer', 'writing', 'story', 'chapter', 'publish', 'publisher',
        'literature', 'poem', 'poetry', 'memoir', 'biography', 'fiction', 'nonfiction',
        'manuscript', 'editor', 'narrative', 'character', 'plot', 'theme', 'prose'
      ]
    },
    {
      name: 'Visual Arts & Design',
      keywords: [
        'art', 'artist', 'painting', 'painter', 'sculpture', 'sculptor', 'gallery', 'museum',
        'exhibition', 'canvas', 'brush', 'color', 'design', 'designer', 'creative', 'visual',
        'photography', 'photographer', 'image', 'portrait', 'landscape', 'abstract'
      ]
    },
    {
      name: 'Performance & Theater',
      keywords: [
        'theater', 'theatre', 'stage', 'performance', 'actor', 'acting', 'play', 'drama',
        'musical', 'opera', 'ballet', 'dance', 'dancer', 'choreographer', 'audience',
        'rehearsal', 'audition', 'costume', 'makeup', 'lighting', 'set', 'venue'
      ]
    },
    { 
      name: 'Family & Relationships', 
      keywords: [
        'family', 'mother', 'father', 'brother', 'sister', 'wife', 'husband', 'child', 'love', 'marriage',
        'parent', 'son', 'daughter', 'grandmother', 'grandfather', 'relationship', 'friendship',
        'partner', 'spouse', 'children', 'home', 'together', 'support', 'care'
      ]
    },
    { 
      name: 'Career & Success', 
      keywords: [
        'career', 'success', 'work', 'job', 'business', 'professional', 'achieve', 'goal', 'award', 'recognition',
        'accomplishment', 'achievement', 'opportunity', 'promotion', 'leadership', 'management',
        'industry', 'company', 'organization', 'talent', 'skill', 'expertise', 'experience'
      ]
    },
    { 
      name: 'Personal Journey', 
      keywords: [
        'life', 'journey', 'experience', 'story', 'memory', 'past', 'childhood', 'grow', 'learn', 'change',
        'development', 'growth', 'evolution', 'transformation', 'discovery', 'realization',
        'reflection', 'insight', 'wisdom', 'understanding', 'perspective', 'identity'
      ]
    },
    { 
      name: 'Culture & Society', 
      keywords: [
        'culture', 'society', 'community', 'tradition', 'value', 'belief', 'social', 'people', 'nation', 'heritage',
        'custom', 'ritual', 'celebration', 'festival', 'ceremony', 'cultural', 'ethnic',
        'diversity', 'identity', 'belonging', 'generation', 'legacy', 'influence'
      ]
    },
    { 
      name: 'Challenges & Struggles', 
      keywords: [
        'struggle', 'challenge', 'difficult', 'hard', 'problem', 'overcome', 'fight', 'battle', 'adversity', 'tough',
        'obstacle', 'barrier', 'hardship', 'conflict', 'crisis', 'pressure', 'stress',
        'perseverance', 'determination', 'resilience', 'courage', 'strength', 'survival'
      ]
    },
    { 
      name: 'Awards & Recognition', 
      keywords: [
        'award', 'prize', 'recognition', 'honor', 'achievement', 'acclaim', 'nomination',
        'grammy', 'oscar', 'emmy', 'tony', 'golden globe', 'pulitzer', 'nobel',
        'winner', 'champion', 'success', 'celebration', 'ceremony', 'tribute'
      ]
    },
    { 
      name: 'Politics & History', 
      keywords: [
        'politics', 'political', 'government', 'president', 'war', 'history', 'historical', 'revolution', 'democracy', 'freedom',
        'election', 'vote', 'leader', 'congress', 'senate', 'policy', 'law', 'rights',
        'movement', 'protest', 'activism', 'change', 'reform', 'justice'
      ]
    }
  ];
  
  const lowerText = text.toLowerCase();
  const themeScores: Array<{ name: string; score: number }> = [];
  
  for (const theme of themes) {
    let score = 0;
    for (const keyword of theme.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    if (score > 0) {
      themeScores.push({ name: theme.name, score });
    }
  }
  
  return themeScores.sort((a, b) => b.score - a.score);
}