// Data Migration Service to integrate existing data from all three sources
// Converts existing formats to unified data lake schema

import fs from 'fs/promises';
import path from 'path';
import { 
  UnifiedEntity, 
  UnifiedMediaSource, 
  MediaReference, 
  Mention,
  TimestampRange 
} from '../types/unified-data-lake';

export class DataMigrationService {
  
  // Migrate Patti Smith book data (from discovery.ts format)
  async migratePattiSmithData(): Promise<{
    sources: UnifiedMediaSource[],
    entities: UnifiedEntity[]
  }> {
    console.log('Migrating Patti Smith book data...');
    
    const source: UnifiedMediaSource = {
      id: 'just-kids-book',
      type: 'book',
      title: 'Just Kids',
      creator: 'Patti Smith',
      publishedDate: '2010-01-01',
      description: 'Memoir chronicling Smith\'s relationship with Robert Mapplethorpe and their emergence as artists in 1970s New York',
      metadata: {
        isbn: '978-0-06-621131-2',
        publisher: 'Ecco',
        pages: 304,
        language: 'en',
        genre: ['memoir', 'biography', 'art'],
        tags: ['patti smith', 'robert mapplethorpe', 'chelsea hotel', '1970s', 'new york', 'art', 'poetry', 'photography']
      }
    };

    // Convert existing book entities to unified format
    const entities: UnifiedEntity[] = [
      {
        id: 'patti-smith-unified',
        name: 'Patti Smith',
        type: 'person',
        category: 'musician_poet',
        description: 'American singer, songwriter, poet, painter, and author who became an influential component of the New York City punk rock movement',
        aliases: ['Patti', 'The Punk Poet Laureate'],
        sentiment: 'positive',
        importance: 95,
        sources: [{
          sourceId: 'just-kids-book',
          sourceType: 'book',
          mentions: [{
            id: 'm1',
            text: 'Patti Smith',
            context: 'memoir author and narrator',
            position: { chapter: 'throughout', page: 1 },
            sentiment: 'positive',
            importance: 100,
            themes: ['autobiography', 'artistic development', 'new york scene']
          }],
          sourceMetadata: {
            chapters: ['all'],
            pageNumbers: [1, 2, 3] // would be comprehensive
          }
        }],
        relationships: [{
          entityId: 'robert-mapplethorpe-unified',
          relationshipType: 'collaborated_with',
          description: 'Life partner, muse, and artistic collaborator in 1970s New York',
          strength: 100,
          timeframe: '1967-1989',
          evidence: [{
            sourceId: 'just-kids-book',
            sourceType: 'book',
            mentions: [],
            sourceMetadata: { chapters: ['all'] }
          }]
        }],
        themes: ['punk rock', 'poetry', '1970s new york', 'artistic development'],
        culturalContext: 'Key figure in the New York punk and art scenes of the 1970s',
        historicalPeriod: '1970s-present'
      },
      {
        id: 'robert-mapplethorpe-unified',
        name: 'Robert Mapplethorpe',
        type: 'person',
        category: 'photographer',
        description: 'American photographer known for his black-and-white photographs and controversial artistic work',
        aliases: ['Robert'],
        sentiment: 'bittersweet',
        importance: 90,
        sources: [{
          sourceId: 'just-kids-book',
          sourceType: 'book',
          mentions: [{
            id: 'm2',
            text: 'Robert Mapplethorpe',
            context: 'central figure and subject of the memoir',
            position: { chapter: 'throughout', page: 5 },
            sentiment: 'bittersweet',
            importance: 95,
            themes: ['photography', 'artistic development', 'relationship']
          }],
          sourceMetadata: {
            chapters: ['most chapters'],
            pageNumbers: [5, 10, 15] // would be comprehensive
          }
        }],
        relationships: [{
          entityId: 'patti-smith-unified',
          relationshipType: 'collaborated_with',
          description: 'Life partner, muse, and artistic collaborator',
          strength: 100,
          timeframe: '1967-1989',
          evidence: [{
            sourceId: 'just-kids-book',
            sourceType: 'book',
            mentions: [],
            sourceMetadata: { chapters: ['all'] }
          }]
        }],
        themes: ['photography', 'art', '1970s new york', 'gay culture'],
        culturalContext: 'Influential photographer who documented and participated in 1970s New York art scene'
      },
      {
        id: 'chelsea-hotel-unified',
        name: 'The Chelsea Hotel',
        type: 'place',
        category: 'historic_venue',
        description: 'Historic New York City hotel known as a bohemian cultural hub for artists, writers, and musicians',
        aliases: ['Chelsea', 'The Chelsea'],
        sentiment: 'nostalgic',
        importance: 85,
        sources: [{
          sourceId: 'just-kids-book',
          sourceType: 'book',
          mentions: [{
            id: 'm3',
            text: 'Chelsea Hotel',
            context: 'where Patti and Robert lived during their formative years',
            position: { chapter: 'Room 1017', page: 42 },
            sentiment: 'nostalgic',
            importance: 90,
            themes: ['bohemian lifestyle', 'artistic community', 'new york']
          }],
          sourceMetadata: {
            chapters: ['Room 1017', 'The Hotel'],
            pageNumbers: [42, 67, 89]
          }
        }],
        relationships: [],
        themes: ['bohemian culture', 'artistic community', 'new york history'],
        culturalContext: 'Legendary residence for artists in 1960s-1970s New York',
        historicalPeriod: '1960s-1970s'
      }
    ];

    return { sources: [source], entities };
  }

  // Migrate Merle Haggard podcast data
  async migrateMerleHaggardData(): Promise<{
    sources: UnifiedMediaSource[],
    entities: UnifiedEntity[]
  }> {
    console.log('Migrating Merle Haggard podcast data...');
    
    const source: UnifiedMediaSource = {
      id: 'merle-fresh-air-podcast',
      type: 'podcast',
      title: 'Merle Haggard On Hopping Trains And Doing Time',
      creator: 'NPR Fresh Air',
      publishedDate: '2025-04-25',
      duration: 2703, // 45 minutes
      url: 'https://podcasts.apple.com/us/podcast/merle-haggard-on-hopping-trains-and-doing-time/id214089682?i=1000704906155',
      description: 'Terry Gross interviews country music legend Merle Haggard about his experiences with trains, prison, and path to musical stardom',
      metadata: {
        showName: 'Fresh Air',
        host: 'Terry Gross',
        episode: 'Merle Haggard Interview (Re-aired)',
        language: 'en',
        genre: ['interview', 'country music', 'biography'],
        tags: ['merle haggard', 'country music', 'prison', 'trains', 'autobiography', 'bakersfield sound']
      }
    };

    // Convert existing Merle entities - this would read from authentic-merle-analysis.ts
    const entities: UnifiedEntity[] = [
      {
        id: 'merle-haggard-unified',
        name: 'Merle Haggard',
        type: 'person',
        category: 'country_musician',
        description: 'Country music legend known for his authentic storytelling and songs about working-class life, prison experiences, and American identity',
        aliases: ['Hag', 'The Okie from Muskogee'],
        sentiment: 'bittersweet',
        importance: 100,
        sources: [{
          sourceId: 'merle-fresh-air-podcast',
          sourceType: 'podcast',
          mentions: [{
            id: 'merle-m1',
            text: 'Merle Haggard interview',
            context: 'discussing his life experiences hopping trains and time in prison',
            position: { 
              timestamp: 30,
              timestampRange: { start: 30, end: 2703, duration: 2673 }
            },
            sentiment: 'bittersweet',
            importance: 100,
            themes: ['country music', 'prison experience', 'trains', 'redemption']
          }],
          sourceMetadata: {
            timestamps: [{ start: 0, end: 2703, duration: 2703 }],
            speakers: ['Terry Gross', 'Merle Haggard', 'David Bianculli']
          }
        }],
        relationships: [{
          entityId: 'san-quentin-unified',
          relationshipType: 'performed_at',
          description: 'Served time at San Quentin State Prison, transformative experience',
          strength: 95,
          timeframe: '1957-1960',
          evidence: [{
            sourceId: 'merle-fresh-air-podcast',
            sourceType: 'podcast',
            mentions: [],
            sourceMetadata: { timestamps: [{ start: 500, end: 800, duration: 300 }] }
          }]
        }],
        themes: ['country music', 'prison reform', 'working class', 'american identity', 'trains'],
        culturalContext: 'Authentic voice of working-class America and prison reform',
        historicalPeriod: '1960s-2016'
      },
      {
        id: 'san-quentin-unified',
        name: 'San Quentin State Prison',
        type: 'place',
        category: 'correctional_facility',
        description: 'California state prison where Merle Haggard served time and experienced personal transformation',
        aliases: ['San Quentin', 'The Q'],
        sentiment: 'transformative',
        importance: 85,
        sources: [{
          sourceId: 'merle-fresh-air-podcast',
          sourceType: 'podcast',
          mentions: [{
            id: 'sq-m1',
            text: 'San Quentin',
            context: 'where Haggard was incarcerated and found his path to music',
            position: { 
              timestamp: 450,
              timestampRange: { start: 450, end: 900, duration: 450 }
            },
            sentiment: 'transformative',
            importance: 90,
            themes: ['incarceration', 'redemption', 'personal growth']
          }],
          sourceMetadata: {
            timestamps: [{ start: 450, end: 900, duration: 450 }],
            speakers: ['Merle Haggard']
          }
        }],
        relationships: [],
        themes: ['criminal justice', 'redemption', 'second chances'],
        culturalContext: 'Symbol of personal transformation and redemption in American culture'
      },
      {
        id: 'oildale-unified',
        name: 'Oildale',
        type: 'place',
        category: 'hometown',
        description: 'Oil community near Bakersfield where Merle Haggard grew up, next to railroad tracks',
        aliases: ['Oildale, California'],
        sentiment: 'nostalgic',
        importance: 75,
        sources: [{
          sourceId: 'merle-fresh-air-podcast',
          sourceType: 'podcast',
          mentions: [{
            id: 'od-m1',
            text: 'Oildale',
            context: 'oil community where I lived, right next to the railroad tracks',
            position: { 
              timestamp: 200,
              timestampRange: { start: 200, end: 350, duration: 150 }
            },
            sentiment: 'nostalgic',
            importance: 80,
            themes: ['childhood', 'working class', 'trains']
          }],
          sourceMetadata: {
            timestamps: [{ start: 200, end: 350, duration: 150 }],
            speakers: ['Merle Haggard']
          }
        }],
        relationships: [],
        themes: ['working class', 'oil industry', 'railroad culture', 'california'],
        culturalContext: 'Representative of working-class California communities',
        historicalPeriod: '1940s-1950s'
      }
    ];

    return { sources: [source], entities };
  }

  // Migrate YouTube video data
  async migrateYouTubeData(): Promise<{
    sources: UnifiedMediaSource[],
    entities: UnifiedEntity[]
  }> {
    console.log('Migrating YouTube video data...');
    
    // This would read from your existing YouTube analysis
    // For now, creating sample structure
    
    const sources: UnifiedMediaSource[] = [
      {
        id: 'amy-winehouse-back-to-black-video',
        type: 'youtube_video',
        title: 'Amy Winehouse - Back to Black (Official Video)',
        creator: 'Amy Winehouse',
        publishedDate: '2006-10-30',
        duration: 240, // 4 minutes
        url: 'https://youtube.com/watch?v=TJAfLE39ZZ8',
        description: 'Official music video for Amy Winehouse\'s "Back to Black"',
        metadata: {
          videoId: 'TJAfLE39ZZ8',
          channel: 'Amy Winehouse Official',
          viewCount: 150000000,
          language: 'en',
          genre: ['music video', 'soul', 'neo-soul'],
          tags: ['amy winehouse', 'back to black', 'soul music', 'british music']
        }
      }
    ];

    const entities: UnifiedEntity[] = [
      {
        id: 'amy-winehouse-unified',
        name: 'Amy Winehouse',
        type: 'person',
        category: 'soul_musician',
        description: 'British singer and songwriter known for her deep vocals and her eclectic mix of musical genres including soul, rhythm and blues, and jazz',
        aliases: ['Amy', 'Wino'],
        sentiment: 'bittersweet',
        importance: 95,
        sources: [{
          sourceId: 'amy-winehouse-back-to-black-video',
          sourceType: 'youtube_video',
          mentions: [{
            id: 'amy-m1',
            text: 'Amy Winehouse performing Back to Black',
            context: 'Iconic performance showcasing her vocal style and emotional depth',
            position: {
              timestamp: 0,
              timestampRange: { start: 0, end: 240, duration: 240 },
              transcriptPositions: [0]
            },
            sentiment: 'bittersweet',
            importance: 100,
            themes: ['soul music', 'emotional performance', 'british music']
          }],
          sourceMetadata: {
            videoTimestamps: [{ start: 0, end: 240, duration: 240 }],
            transcriptPositions: [0, 50, 100]
          }
        }],
        relationships: [],
        themes: ['soul music', 'jazz', 'addiction', 'british culture'],
        culturalContext: 'Influential British soul singer who brought vintage soul sound to modern audiences',
        historicalPeriod: '2003-2011'
      }
    ];

    return { sources, entities };
  }

  // Main migration orchestrator
  async migrateAllData(): Promise<{
    sources: UnifiedMediaSource[],
    entities: UnifiedEntity[]
  }> {
    console.log('Starting unified data migration...');
    
    const [pattiData, merleData, youtubeData] = await Promise.all([
      this.migratePattiSmithData(),
      this.migrateMerleHaggardData(),
      this.migrateYouTubeData()
    ]);

    const allSources = [
      ...pattiData.sources,
      ...merleData.sources,
      ...youtubeData.sources
    ];

    const allEntities = [
      ...pattiData.entities,
      ...merleData.entities,
      ...youtubeData.entities
    ];

    // Detect cross-media entity relationships
    this.detectCrossMediaRelationships(allEntities);

    console.log(`Migration complete: ${allSources.length} sources, ${allEntities.length} entities`);
    
    return { sources: allSources, entities: allEntities };
  }

  // Detect relationships between entities across different media
  private detectCrossMediaRelationships(entities: UnifiedEntity[]) {
    // Find entities that might be the same across different sources
    const entityGroups = new Map<string, UnifiedEntity[]>();
    
    entities.forEach(entity => {
      const normalizedName = entity.name.toLowerCase().replace(/[^\w\s]/g, '');
      if (!entityGroups.has(normalizedName)) {
        entityGroups.set(normalizedName, []);
      }
      entityGroups.get(normalizedName)!.push(entity);
    });

    // Find thematic connections
    const themeMap = new Map<string, UnifiedEntity[]>();
    entities.forEach(entity => {
      entity.themes?.forEach(theme => {
        if (!themeMap.has(theme)) {
          themeMap.set(theme, []);
        }
        themeMap.get(theme)!.push(entity);
      });
    });

    // Add cross-media relationships based on shared themes
    themeMap.forEach((themeEntities, theme) => {
      if (themeEntities.length > 1) {
        // Create relationships between entities sharing themes
        for (let i = 0; i < themeEntities.length; i++) {
          for (let j = i + 1; j < themeEntities.length; j++) {
            const entity1 = themeEntities[i];
            const entity2 = themeEntities[j];
            
            // Check if they're from different sources
            const sources1 = entity1.sources.map(s => s.sourceType);
            const sources2 = entity2.sources.map(s => s.sourceType);
            const hasSharedSources = sources1.some(s => sources2.includes(s));
            
            if (!hasSharedSources) {
              // Add cross-media relationship
              entity1.relationships.push({
                entityId: entity2.id,
                relationshipType: 'contemporary_of',
                description: `Connected through shared theme: ${theme}`,
                strength: 40,
                evidence: []
              });
            }
          }
        }
      }
    });
  }

  // Export unified data to JSON files for backup/debugging
  async exportUnifiedData(sources: UnifiedMediaSource[], entities: UnifiedEntity[]) {
    const exportDir = path.join(process.cwd(), 'data', 'unified-export');
    
    try {
      await fs.mkdir(exportDir, { recursive: true });
      
      await fs.writeFile(
        path.join(exportDir, 'unified-sources.json'),
        JSON.stringify(sources, null, 2)
      );
      
      await fs.writeFile(
        path.join(exportDir, 'unified-entities.json'),
        JSON.stringify(entities, null, 2)
      );
      
      console.log(`Unified data exported to ${exportDir}`);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
}