# Unified Data Lake Architecture
## Cultural Media Analysis Platform - Technical Specification

### Overview
This document outlines the architecture for a unified data lake that integrates:
- **Patti Smith book content** (Just Kids memoir)
- **Merle Haggard podcast analysis** (124 entities from Fresh Air interview)
- **YouTube video transcripts** (189 videos with entity extraction)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (Port 3002)                 │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend │ Search UI │ Entity Browser │ Cross-Media      │
│  Components     │           │                │ Discovery        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                               HTTP/REST API
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  Unified Data Lake API │ Search API │ Entity API │ Discovery API │
│  /api/data-lake/*      │            │            │               │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                        Service Layer                            │
├─────────────────────────────────────────────────────────────────┤
│ Search Index Service │ Migration Service │ Cache Service        │
│                     │                   │ (Redis)              │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Unified Data Lake  │  Search Index   │  Graph Database        │
│  (PostgreSQL)       │  (Elasticsearch)│  (Neo4j/Optional)     │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    Source Data Integration                       │
├─────────────────────────────────────────────────────────────────┤
│ Port 3000          │ Port 3001          │ Existing Data Files   │
│ Merle Analysis     │ YouTube Analysis   │ Patti Smith Book     │
│ (124 entities)     │ (189 videos)       │ (Literary Analysis)   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack Recommendations

### Core Database Layer
**Primary Choice: PostgreSQL + JSONB**
- **Rationale**: Excellent support for both relational and document data
- **Benefits**: ACID compliance, powerful indexing, full-text search, JSON operations
- **Schema**: Use unified schema with JSONB columns for flexible entity metadata
- **Scaling**: Built-in replication, partitioning support

```sql
-- Example table structure
CREATE TABLE unified_entities (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type entity_type NOT NULL,
    category TEXT,
    metadata JSONB,
    sources JSONB,
    relationships JSONB,
    search_vector tsvector,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entity_search ON unified_entities USING GIN(search_vector);
CREATE INDEX idx_entity_metadata ON unified_entities USING GIN(metadata);
```

### Search and Indexing
**Primary Choice: Built-in PostgreSQL Full-Text Search**
- **Rationale**: Keep it simple initially, excellent performance for medium datasets
- **Benefits**: No additional infrastructure, strong text search, easy maintenance
- **Upgrade Path**: Can migrate to Elasticsearch when dataset grows beyond 1M entities

**Future Choice: Elasticsearch**
- **When to upgrade**: >100k entities or need for complex faceted search
- **Benefits**: Advanced search features, analytics, real-time indexing
- **Integration**: Use as search layer while keeping PostgreSQL as source of truth

### Caching Strategy
**Redis for Application Cache**
- **Use Cases**: API response caching, session storage, frequently accessed entities
- **Cache Keys**: Entity details, search results, cross-media connections
- **TTL Strategy**: 1 hour for entity details, 15 minutes for search results

### API Architecture
**Express.js with TypeScript**
- **Benefits**: Existing codebase compatibility, strong typing, middleware ecosystem
- **Structure**: Service-oriented architecture with clear separation of concerns
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **Authentication**: JWT-based auth for administrative functions

### Data Processing Pipeline
**Node.js Batch Processing**
- **Migration Service**: Convert existing data formats to unified schema
- **ETL Pipeline**: Extract from sources → Transform to unified format → Load to database
- **Incremental Updates**: Track changes and update entities incrementally
- **Error Handling**: Robust error recovery and data validation

## API Endpoint Design

### Core Search API
```typescript
// Main search across all media types
POST /api/data-lake/search
{
  "query": "robert mapplethorpe photography",
  "filters": {
    "mediaTypes": ["book", "podcast", "youtube_video"],
    "entityTypes": ["person", "work"],
    "timeframe": { "start": "1970", "end": "1980" },
    "importance": { "min": 70 }
  },
  "sort": { "field": "relevance", "direction": "desc" },
  "limit": 20,
  "offset": 0
}
```

### Cross-Media Discovery
```typescript
// Discover connections between entities across media types
GET /api/data-lake/entity/{id}/connections
{
  "primaryEntity": { /* entity details */ },
  "relatedEntities": [
    {
      "entity": { /* related entity */ },
      "connectionStrength": 0.85,
      "sharedSources": ["just-kids-book", "mapplethorpe-documentary"],
      "relationshipPaths": [ /* relationship chain */ ]
    }
  ],
  "thematicConnections": [
    {
      "theme": "1970s photography",
      "entities": ["mapplethorpe", "arbus", "sherman"],
      "sources": ["book", "youtube_video"],
      "strength": 0.72
    }
  ]
}
```

### Faceted Search Results
```typescript
GET /api/data-lake/search/advanced
{
  "results": [ /* search results */ ],
  "facets": {
    "mediaTypes": { "book": 45, "podcast": 23, "youtube_video": 67 },
    "entityTypes": { "person": 89, "place": 34, "work": 12 },
    "themes": { "music": 78, "art": 56, "1970s": 45 },
    "timeframes": { "1960s": 12, "1970s": 89, "1980s": 34 }
  },
  "analytics": {
    "crossMediaStats": {
      "entitiesInMultipleSources": 34,
      "averageSourcesPerEntity": 2.1,
      "mostConnectedEntity": "patti-smith"
    }
  }
}
```

## Performance Optimization

### Database Optimization
1. **Indexing Strategy**
   ```sql
   -- Full-text search index
   CREATE INDEX idx_entity_fulltext ON unified_entities USING GIN(search_vector);
   
   -- JSONB field indexes
   CREATE INDEX idx_entity_themes ON unified_entities USING GIN((metadata->'themes'));
   CREATE INDEX idx_entity_importance ON unified_entities ((metadata->>'importance')::int);
   
   -- Composite indexes for common queries
   CREATE INDEX idx_entity_type_importance ON unified_entities (type, ((metadata->>'importance')::int));
   ```

2. **Query Optimization**
   - Use prepared statements for repeated queries
   - Implement connection pooling (pg-pool)
   - Use EXPLAIN ANALYZE to optimize slow queries

3. **Data Partitioning**
   - Partition by entity type for large datasets
   - Consider time-based partitioning for historical data

### Caching Strategy
```typescript
// Multi-level caching
class CacheService {
  // L1: In-memory cache (Node.js Map)
  private memoryCache = new Map();
  
  // L2: Redis cache
  private redisCache = redis.createClient();
  
  // L3: Database with smart caching
  async getEntity(id: string): Promise<Entity> {
    // Check memory cache first
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id);
    }
    
    // Check Redis cache
    const cached = await this.redisCache.get(`entity:${id}`);
    if (cached) {
      const entity = JSON.parse(cached);
      this.memoryCache.set(id, entity);
      return entity;
    }
    
    // Fetch from database
    const entity = await this.database.getEntity(id);
    
    // Cache at all levels
    this.memoryCache.set(id, entity);
    await this.redisCache.setex(`entity:${id}`, 3600, JSON.stringify(entity));
    
    return entity;
  }
}
```

## Scaling Considerations

### Horizontal Scaling Strategy

1. **Database Scaling**
   - **Read Replicas**: Separate read/write workloads
   - **Connection Pooling**: PgBouncer for connection management
   - **Query Optimization**: Monitor slow queries with pg_stat_statements

2. **Application Scaling**
   - **Load Balancer**: NGINX for API request distribution
   - **Microservices**: Split by domain (search, entities, media)
   - **Docker Containers**: Consistent deployment environments

3. **Caching Scaling**
   - **Redis Cluster**: For distributed caching
   - **CDN**: CloudFlare for static assets and API response caching

### Data Growth Projections
```
Current State:
- Patti Smith: ~50 entities
- Merle Haggard: 124 entities  
- YouTube: ~500 entities (189 videos × ~3 entities/video)
- Total: ~674 entities

6-Month Projection:
- Additional books: 5 books × 50 entities = 250
- Additional podcasts: 10 podcasts × 100 entities = 1,000
- Additional videos: 500 videos × 3 entities = 1,500
- Total: ~3,424 entities

12-Month Projection:
- Total estimated entities: ~10,000
- Database size: ~500MB (with full text content)
- Query performance: <100ms with proper indexing
```

### Bottleneck Analysis and Mitigation

1. **Search Performance**
   - **Problem**: Full-text search on large datasets
   - **Solution**: Implement Elasticsearch after 10k entities
   - **Monitoring**: Track query response times, implement alerting

2. **Cross-Media Join Queries**
   - **Problem**: Complex relationship queries across entity types
   - **Solution**: Denormalize frequently accessed relationships
   - **Alternative**: Consider Neo4j for complex graph traversals

3. **API Rate Limiting**
   - **Problem**: Expensive search queries
   - **Solution**: Implement tiered rate limiting
   ```typescript
   const rateLimiter = {
     search: '100 requests per hour per IP',
     entity: '1000 requests per hour per IP',
     discovery: '50 requests per hour per IP'
   };
   ```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Set up PostgreSQL database with unified schema
2. Implement basic API endpoints
3. Create data migration service
4. Migrate Patti Smith data (simplest structure)

### Phase 2: Complex Data Integration (Week 3-4)
1. Migrate Merle Haggard podcast data with timestamps
2. Integrate YouTube video data with transcript positioning
3. Implement basic search functionality
4. Build entity relationship detection

### Phase 3: Advanced Features (Week 5-6)
1. Implement cross-media discovery algorithms
2. Add faceted search capabilities
3. Build caching layer
4. Performance optimization and indexing

### Phase 4: Production Readiness (Week 7-8)
1. Load testing and performance tuning
2. Error handling and monitoring
3. Documentation and API versioning
4. Deployment automation

## Monitoring and Observability

### Key Metrics to Track
```typescript
interface SystemMetrics {
  // Performance metrics
  apiResponseTime: number;      // Target: <200ms
  searchQueryTime: number;      // Target: <100ms
  databaseConnections: number;  // Monitor pool usage
  cacheHitRate: number;        // Target: >80%
  
  // Business metrics
  entitiesIndexed: number;
  crossMediaConnections: number;
  searchQueriesPerHour: number;
  uniqueUsersPerDay: number;
  
  // Error metrics
  apiErrorRate: number;         // Target: <1%
  databaseErrors: number;
  searchFailures: number;
}
```

### Alerting Strategy
- **Critical**: Database connection failures, API completely down
- **Warning**: High response times (>500ms), low cache hit rates (<60%)
- **Info**: New entity additions, unusual search patterns

This architecture provides a solid foundation for your unified data lake while maintaining simplicity and clear upgrade paths as your data grows.