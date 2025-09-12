// Search and Indexing Service for Unified Data Lake
// Provides fast full-text search, entity matching, and cross-media discovery

import { 
  UnifiedEntity, 
  UnifiedMediaSource, 
  SearchQuery,
  SearchResult,
  Mention,
  DataLakeIndex 
} from '../types/unified-data-lake';

export class SearchIndexService {
  private index: DataLakeIndex;
  private invertedIndex: Map<string, Set<string>>; // word -> entity IDs
  private entityScores: Map<string, number>; // pre-computed importance scores
  private crossMediaGraph: Map<string, Map<string, number>>; // entity -> related entities with weights

  constructor() {
    this.index = {
      entityIndex: new Map(),
      nameToEntityIndex: new Map(),
      sourceIndex: new Map(),
      textIndex: new Map(),
      themeIndex: new Map(),
      entityToSourcesIndex: new Map(),
      sourceToEntitiesIndex: new Map(),
      relationshipGraph: new Map()
    };
    this.invertedIndex = new Map();
    this.entityScores = new Map();
    this.crossMediaGraph = new Map();
  }

  // Build comprehensive search indices
  async buildIndices(entities: UnifiedEntity[], sources: UnifiedMediaSource[]) {
    console.log('Building unified search indices...');
    
    // 1. Build entity indices
    this.buildEntityIndices(entities);
    
    // 2. Build source indices
    this.buildSourceIndices(sources);
    
    // 3. Build inverted text index for fast search
    this.buildInvertedIndex(entities);
    
    // 4. Build cross-media relationship graph
    this.buildCrossMediaGraph(entities);
    
    // 5. Pre-compute entity importance scores
    this.computeEntityScores(entities);
    
    console.log(`Indices built: ${entities.length} entities, ${sources.length} sources`);
  }

  private buildEntityIndices(entities: UnifiedEntity[]) {
    entities.forEach(entity => {
      // Main entity index
      this.index.entityIndex.set(entity.id, entity);
      
      // Name/alias to entity mapping
      const names = [entity.name, ...entity.aliases];
      names.forEach(name => {
        const normalized = this.normalizeText(name);
        if (!this.index.nameToEntityIndex.has(normalized)) {
          this.index.nameToEntityIndex.set(normalized, []);
        }
        this.index.nameToEntityIndex.get(normalized)!.push(entity.id);
      });
      
      // Theme index
      entity.themes?.forEach(theme => {
        if (!this.index.themeIndex.has(theme)) {
          this.index.themeIndex.set(theme, []);
        }
        this.index.themeIndex.get(theme)!.push(entity.id);
      });
      
      // Entity to sources mapping
      const sourceIds = entity.sources.map(s => s.sourceId);
      this.index.entityToSourcesIndex.set(entity.id, sourceIds);
      
      // Source to entities mapping
      sourceIds.forEach(sourceId => {
        if (!this.index.sourceToEntitiesIndex.has(sourceId)) {
          this.index.sourceToEntitiesIndex.set(sourceId, []);
        }
        this.index.sourceToEntitiesIndex.get(sourceId)!.push(entity.id);
      });
      
      // Relationship graph
      const relatedIds = entity.relationships.map(r => r.entityId);
      this.index.relationshipGraph.set(entity.id, relatedIds);
    });
  }

  private buildSourceIndices(sources: UnifiedMediaSource[]) {
    sources.forEach(source => {
      this.index.sourceIndex.set(source.id, source);
    });
  }

  private buildInvertedIndex(entities: UnifiedEntity[]) {
    entities.forEach(entity => {
      // Index entity name and aliases
      const terms = [
        entity.name,
        ...entity.aliases,
        entity.description,
        entity.category,
        ...(entity.themes || [])
      ];

      // Index mention text
      entity.sources.forEach(source => {
        source.mentions.forEach(mention => {
          terms.push(mention.text, mention.context);
        });
      });

      // Tokenize and add to inverted index
      const tokens = this.tokenizeText(terms.join(' '));
      tokens.forEach(token => {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Set());
        }
        this.invertedIndex.get(token)!.add(entity.id);
      });
    });
  }

  private buildCrossMediaGraph(entities: UnifiedEntity[]) {
    entities.forEach(entity => {
      const connections = new Map<string, number>();
      
      // Calculate connection strength based on:
      // 1. Direct relationships
      // 2. Shared sources
      // 3. Common themes
      // 4. Temporal proximity
      
      entity.relationships.forEach(rel => {
        connections.set(rel.entityId, rel.strength / 100);
      });
      
      // Find entities that appear in the same sources
      entity.sources.forEach(source => {
        const otherEntitiesInSource = this.index.sourceToEntitiesIndex.get(source.sourceId) || [];
        otherEntitiesInSource.forEach(otherId => {
          if (otherId !== entity.id) {
            const current = connections.get(otherId) || 0;
            connections.set(otherId, current + 0.3); // Shared source weight
          }
        });
      });
      
      // Find entities with shared themes
      entity.themes?.forEach(theme => {
        const entitiesWithTheme = this.index.themeIndex.get(theme) || [];
        entitiesWithTheme.forEach(otherId => {
          if (otherId !== entity.id) {
            const current = connections.get(otherId) || 0;
            connections.set(otherId, current + 0.2); // Shared theme weight
          }
        });
      });
      
      this.crossMediaGraph.set(entity.id, connections);
    });
  }

  private computeEntityScores(entities: UnifiedEntity[]) {
    entities.forEach(entity => {
      let score = entity.importance;
      
      // Boost based on number of sources
      score += entity.sources.length * 5;
      
      // Boost based on number of mentions
      const totalMentions = entity.sources.reduce((sum, source) => 
        sum + source.mentions.length, 0);
      score += Math.min(totalMentions * 2, 20);
      
      // Boost based on cross-media presence
      const mediaTypes = new Set(entity.sources.map(s => s.sourceType));
      score += mediaTypes.size * 10;
      
      // Boost based on relationships
      score += entity.relationships.length * 3;
      
      this.entityScores.set(entity.id, Math.min(score, 100));
    });
  }

  // Main search function
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const searchTerms = this.tokenizeText(query.query);
    const candidateEntities = new Set<string>();
    
    // 1. Find entities matching search terms
    searchTerms.forEach(term => {
      const matchingEntities = this.invertedIndex.get(term);
      if (matchingEntities) {
        matchingEntities.forEach(entityId => candidateEntities.add(entityId));
      }
    });
    
    // 2. Find entities by name/alias matching
    const normalizedQuery = this.normalizeText(query.query);
    this.index.nameToEntityIndex.forEach((entityIds, name) => {
      if (name.includes(normalizedQuery) || normalizedQuery.includes(name)) {
        entityIds.forEach(id => candidateEntities.add(id));
      }
    });
    
    // 3. Score and rank results
    const results: SearchResult[] = [];
    
    for (const entityId of candidateEntities) {
      const entity = this.index.entityIndex.get(entityId);
      if (!entity) continue;
      
      // Apply filters
      if (!this.passesFilters(entity, query.filters)) continue;
      
      const relevanceScore = this.calculateRelevanceScore(entity, query.query);
      const matchedMentions = this.findMatchedMentions(entity, query.query);
      const crossMediaConnections = this.getCrossMediaConnections(entity);
      
      results.push({
        entity,
        relevanceScore,
        matchedMentions,
        crossMediaConnections
      });
    }
    
    // 4. Sort results
    results.sort((a, b) => {
      if (query.sort?.field === 'importance') {
        const aScore = this.entityScores.get(a.entity.id) || 0;
        const bScore = this.entityScores.get(b.entity.id) || 0;
        return query.sort.direction === 'desc' ? bScore - aScore : aScore - bScore;
      }
      // Default: sort by relevance
      return b.relevanceScore - a.relevanceScore;
    });
    
    // 5. Apply pagination
    const start = query.offset || 0;
    const limit = query.limit || 20;
    return results.slice(start, start + limit);
  }

  private passesFilters(entity: UnifiedEntity, filters?: SearchQuery['filters']): boolean {
    if (!filters) return true;
    
    // Media type filter
    if (filters.mediaTypes?.length) {
      const entityMediaTypes = new Set(entity.sources.map(s => s.sourceType));
      if (!filters.mediaTypes.some(type => entityMediaTypes.has(type))) {
        return false;
      }
    }
    
    // Entity type filter
    if (filters.entityTypes?.length && !filters.entityTypes.includes(entity.type)) {
      return false;
    }
    
    // Importance filter
    if (filters.importance) {
      const score = this.entityScores.get(entity.id) || entity.importance;
      if (filters.importance.min && score < filters.importance.min) return false;
      if (filters.importance.max && score > filters.importance.max) return false;
    }
    
    // Sentiment filter
    if (filters.sentiment?.length && !filters.sentiment.includes(entity.sentiment)) {
      return false;
    }
    
    // Theme filter
    if (filters.themes?.length) {
      const entityThemes = entity.themes || [];
      if (!filters.themes.some(theme => entityThemes.includes(theme))) {
        return false;
      }
    }
    
    return true;
  }

  private calculateRelevanceScore(entity: UnifiedEntity, query: string): number {
    let score = 0;
    const queryTerms = this.tokenizeText(query);
    const entityText = [
      entity.name,
      ...entity.aliases,
      entity.description,
      entity.category
    ].join(' ').toLowerCase();
    
    // Exact name match
    if (entityText.includes(query.toLowerCase())) {
      score += 50;
    }
    
    // Term frequency scoring
    queryTerms.forEach(term => {
      const termCount = (entityText.match(new RegExp(term, 'gi')) || []).length;
      score += termCount * 10;
    });
    
    // Boost by entity importance
    score += (this.entityScores.get(entity.id) || entity.importance) * 0.3;
    
    // Boost by cross-media presence
    const mediaTypes = new Set(entity.sources.map(s => s.sourceType));
    score += mediaTypes.size * 5;
    
    return score;
  }

  private findMatchedMentions(entity: UnifiedEntity, query: string): Mention[] {
    const queryLower = query.toLowerCase();
    const matchedMentions: Mention[] = [];
    
    entity.sources.forEach(source => {
      source.mentions.forEach(mention => {
        if (mention.text.toLowerCase().includes(queryLower) ||
            mention.context.toLowerCase().includes(queryLower)) {
          matchedMentions.push(mention);
        }
      });
    });
    
    return matchedMentions.slice(0, 5); // Limit to top 5 matches
  }

  private getCrossMediaConnections(entity: UnifiedEntity) {
    const connections: any[] = [];
    const sourceGroups = new Map<string, any>();
    
    entity.sources.forEach(source => {
      const sourceInfo = this.index.sourceIndex.get(source.sourceId);
      if (!sourceInfo) return;
      
      if (!sourceGroups.has(sourceInfo.type)) {
        sourceGroups.set(sourceInfo.type, {
          sourceType: sourceInfo.type,
          sourceTitle: sourceInfo.title,
          mentionCount: 0,
          topMentions: []
        });
      }
      
      const group = sourceGroups.get(sourceInfo.type)!;
      group.mentionCount += source.mentions.length;
      group.topMentions.push(...source.mentions.slice(0, 2));
    });
    
    return Array.from(sourceGroups.values());
  }

  // Utility methods
  private normalizeText(text: string): string {
    return text.toLowerCase()
               .replace(/[^\w\s]/g, '')
               .trim();
  }

  private tokenizeText(text: string): string[] {
    return text.toLowerCase()
               .replace(/[^\w\s]/g, ' ')
               .split(/\s+/)
               .filter(token => token.length > 2)
               .filter(token => !this.isStopWord(token));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'is', 'was', 'are', 'were', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);
    return stopWords.has(word);
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const queryTerms = this.tokenizeText(query);
    const suggestions = new Set<string>();
    
    // Find entities that partially match
    this.index.entityIndex.forEach(entity => {
      const entityTerms = this.tokenizeText(entity.name);
      const hasPartialMatch = queryTerms.some(qTerm => 
        entityTerms.some(eTerm => eTerm.startsWith(qTerm))
      );
      
      if (hasPartialMatch) {
        suggestions.add(entity.name);
      }
    });
    
    // Find related themes
    queryTerms.forEach(term => {
      this.index.themeIndex.forEach((entityIds, theme) => {
        if (theme.includes(term)) {
          suggestions.add(theme);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  }
}