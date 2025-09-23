import { type Podcast, type InsertPodcast, type Transcription, type InsertTranscription, type Entity, type InsertEntity, type EntityMention, type InsertEntityMention, type EntityRelationship, type InsertEntityRelationship, type PodcastInsights, type InsertPodcastInsights, type PodcastAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  podcasts, transcriptions, entities, entityMentions, entityRelationships
} from "@shared/schema";

export interface IStorage {
  // Podcast operations
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcast(id: string): Promise<Podcast | undefined>;
  updatePodcastStatus(id: string, status: string): Promise<void>;
  updatePodcastAudio(id: string, audioUrl: string): Promise<void>;
  
  // Transcription operations
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getTranscriptionByPodcastId(podcastId: string): Promise<Transcription | undefined>;
  
  // Entity operations
  createEntity(entity: InsertEntity): Promise<Entity>;
  getEntityByName(name: string): Promise<Entity | undefined>;
  
  // Entity mention operations
  createEntityMention(mention: InsertEntityMention): Promise<EntityMention>;
  getEntityMentionsByPodcastId(podcastId: string): Promise<EntityMention[]>;
  
  // Entity relationship operations
  createEntityRelationship(relationship: InsertEntityRelationship): Promise<EntityRelationship>;
  getEntityRelationshipsByPodcastId(podcastId: string): Promise<EntityRelationship[]>;
  
  // Insights operations
  createPodcastInsights(insights: InsertPodcastInsights): Promise<PodcastInsights>;
  getPodcastInsights(podcastId: string): Promise<PodcastInsights | undefined>;
  
  // Analysis operations
  getPodcastAnalysis(podcastId: string): Promise<PodcastAnalysis | undefined>;
  
  // Book operations
  storeBook(book: any): Promise<void>;
  getBook(id: string): Promise<any | undefined>;
  
  // Transcript caching for reuse
  findExistingPodcastByUrl(appleUrl: string): Promise<Podcast | undefined>;
  findSimilarTranscript(title: string, showName: string): Promise<Podcast | undefined>;
}

export class MemStorage implements IStorage {
  private podcasts: Map<string, Podcast>;
  private transcriptions: Map<string, Transcription>;
  private entities: Map<string, Entity>;
  private entityMentions: Map<string, EntityMention>;
  private entityRelationships: Map<string, EntityRelationship>;
  private podcastInsights: Map<string, PodcastInsights>;
  private books: Map<string, any>;

  constructor() {
    this.podcasts = new Map();
    this.transcriptions = new Map();
    this.entities = new Map();
    this.entityMentions = new Map();
    this.entityRelationships = new Map();
    this.podcastInsights = new Map();
    this.books = new Map();
  }

  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const id = randomUUID();
    const podcast: Podcast = {
      ...insertPodcast,
      audioUrl: insertPodcast.audioUrl || null,
      duration: insertPodcast.duration || null,
      publishedDate: insertPodcast.publishedDate || null,
      artworkUrl: insertPodcast.artworkUrl || null,
      status: insertPodcast.status || "pending",
      id,
      createdAt: new Date(),
    };
    this.podcasts.set(id, podcast);
    return podcast;
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    return this.podcasts.get(id);
  }

  async updatePodcastStatus(id: string, status: string): Promise<void> {
    const podcast = this.podcasts.get(id);
    if (podcast) {
      podcast.status = status;
      this.podcasts.set(id, podcast);
    }
  }

  async updatePodcastAudio(id: string, audioUrl: string): Promise<void> {
    const podcast = this.podcasts.get(id);
    if (podcast) {
      podcast.audioUrl = audioUrl;
      this.podcasts.set(id, podcast);
    }
  }

  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const id = randomUUID();
    const transcription: Transcription = {
      ...insertTranscription,
      accuracy: insertTranscription.accuracy || null,
      id,
      createdAt: new Date(),
    };
    this.transcriptions.set(id, transcription);
    return transcription;
  }

  async getTranscriptionByPodcastId(podcastId: string): Promise<Transcription | undefined> {
    return Array.from(this.transcriptions.values()).find(t => t.podcastId === podcastId);
  }

  async createEntity(insertEntity: InsertEntity): Promise<Entity> {
    const id = randomUUID();
    const entity: Entity = { 
      ...insertEntity, 
      description: insertEntity.description || null,
      aliases: insertEntity.aliases || [],
      wikiDataId: insertEntity.wikiDataId || null,
      sentiment: insertEntity.sentiment || null,
      importance: insertEntity.importance || 50,
      id 
    };
    this.entities.set(id, entity);
    return entity;
  }

  async getEntityByName(name: string): Promise<Entity | undefined> {
    return Array.from(this.entities.values()).find(e => e.name.toLowerCase() === name.toLowerCase());
  }

  async createEntityMention(insertMention: InsertEntityMention): Promise<EntityMention> {
    const id = randomUUID();
    const mention: EntityMention = { 
      ...insertMention, 
      confidence: insertMention.confidence || null,
      sentiment: insertMention.sentiment || null,
      emotions: insertMention.emotions || [],
      relationshipType: insertMention.relationshipType || null,
      id 
    };
    this.entityMentions.set(id, mention);
    return mention;
  }

  async getEntityMentionsByPodcastId(podcastId: string): Promise<EntityMention[]> {
    return Array.from(this.entityMentions.values()).filter(m => m.podcastId === podcastId);
  }

  async createEntityRelationship(insertRelationship: InsertEntityRelationship): Promise<EntityRelationship> {
    const id = randomUUID();
    const relationship: EntityRelationship = { 
      ...insertRelationship, 
      strength: insertRelationship.strength || 1,
      context: insertRelationship.context || null,
      id 
    };
    this.entityRelationships.set(id, relationship);
    return relationship;
  }

  async getEntityRelationshipsByPodcastId(podcastId: string): Promise<EntityRelationship[]> {
    // Get all entities for this podcast first
    const mentions = await this.getEntityMentionsByPodcastId(podcastId);
    const entityIds = new Set(mentions.map(m => m.entityId));
    
    return Array.from(this.entityRelationships.values()).filter(r => 
      entityIds.has(r.sourceEntityId) || entityIds.has(r.targetEntityId)
    );
  }

  async createPodcastInsights(insertInsights: InsertPodcastInsights): Promise<PodcastInsights> {
    const id = randomUUID();
    const insights: PodcastInsights = { 
      ...insertInsights, 
      keyTopics: insertInsights.keyTopics || [],
      emotionalJourney: insertInsights.emotionalJourney || [],
      entityNetwork: insertInsights.entityNetwork || {},
      overallSentiment: insertInsights.overallSentiment || null,
      summary: insertInsights.summary || null,
      id,
      createdAt: new Date(),
    };
    this.podcastInsights.set(id, insights);
    return insights;
  }

  async getPodcastInsights(podcastId: string): Promise<PodcastInsights | undefined> {
    return Array.from(this.podcastInsights.values()).find(i => i.podcastId === podcastId);
  }

  async findExistingPodcastByUrl(appleUrl: string): Promise<Podcast | undefined> {
    return Array.from(this.podcasts.values()).find(p => p.appleUrl === appleUrl);
  }

  async findSimilarTranscript(title: string, showName: string): Promise<Podcast | undefined> {
    return Array.from(this.podcasts.values()).find(p => 
      p.title.toLowerCase() === title.toLowerCase() && 
      p.showName.toLowerCase() === showName.toLowerCase()
    );
  }

  async getPodcastAnalysis(podcastId: string): Promise<PodcastAnalysis | undefined> {
    const podcast = await this.getPodcast(podcastId);
    if (!podcast) return undefined;

    const transcription = await this.getTranscriptionByPodcastId(podcastId);
    if (!transcription) return undefined;

    const mentions = await this.getEntityMentionsByPodcastId(podcastId);
    
    // Group mentions by entity
    const entityMentionsMap = new Map<string, EntityMention[]>();
    mentions.forEach(mention => {
      const existing = entityMentionsMap.get(mention.entityId) || [];
      entityMentionsMap.set(mention.entityId, [...existing, mention]);
    });

    const insights = await this.getPodcastInsights(podcastId);
    const relationships = await this.getEntityRelationshipsByPodcastId(podcastId);

    // Build enhanced entity analysis
    const entityAnalysis = await Promise.all(
      Array.from(entityMentionsMap.entries()).map(async ([entityId, entityMentions]) => {
        const entity = this.entities.get(entityId);
        if (!entity) return null;

        const entityRelationships = relationships.filter(r => 
          r.sourceEntityId === entityId || r.targetEntityId === entityId
        );

        return {
          entity,
          mentionCount: entityMentions.length,
          mentions: entityMentions.sort((a, b) => a.timestamp - b.timestamp),
          topics: [], // Would be extracted from context analysis
          summary: `Mentioned ${entityMentions.length} times throughout the episode`,
          sentiment: entity.sentiment || "neutral",
          importance: entity.importance || 50,
          relationships: entityRelationships,
          emotions: Array.from(new Set(entityMentions.flatMap(m => m.emotions || []))),
        };
      })
    );

    const validEntityAnalysis = entityAnalysis.filter(Boolean) as any[];

    // Calculate enhanced stats
    const emotionalVariance = insights?.emotionalJourney && Array.isArray(insights.emotionalJourney) ? 
      Math.round((insights.emotionalJourney as any[]).reduce((acc: number, curr: any) => acc + (curr.intensity || 0), 0) / (insights.emotionalJourney as any[]).length) : 0;
    
    const networkDensity = relationships.length > 0 ? 
      Math.round((relationships.length / (validEntityAnalysis.length * (validEntityAnalysis.length - 1))) * 100) : 0;

    const stats = {
      totalEntities: validEntityAnalysis.length,
      peopleCount: validEntityAnalysis.filter(ea => ea.entity.category === 'person').length,
      placesCount: validEntityAnalysis.filter(ea => ea.entity.category === 'place').length,
      entertainmentCount: validEntityAnalysis.filter(ea => ea.entity.category === 'entertainment').length,
      accuracy: transcription.accuracy || 95,
      overallSentiment: insights?.overallSentiment || "neutral",
      emotionalVariance,
      networkDensity,
    };

    return {
      podcast,
      transcription,
      entityAnalysis: validEntityAnalysis,
      insights: insights || {
        id: randomUUID(),
        podcastId,
        overallSentiment: "neutral",
        keyTopics: [],
        emotionalJourney: [],
        entityNetwork: {},
        summary: null,
        createdAt: new Date(),
      },
      stats,
    };
  }

  async storeBook(book: any): Promise<void> {
    console.log(`📚 Storing book in MemStorage: ${book.title} with ID: ${book.id}`);
    this.books.set(book.id, book);
    // Also store with a standard "merle-haggard" key for easy retrieval
    this.books.set('merle-haggard', book);
  }

  async getBook(id: string): Promise<any | undefined> {
    const book = this.books.get(id);
    if (book) {
      console.log(`📖 Retrieved book: ${book.title}`);
    } else {
      console.log(`❌ No book found with ID: ${id}`);
    }
    return book;
  }

  async getAllBooks(): Promise<any[]> {
    return Array.from(this.books.values());
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async createPodcast(podcast: InsertPodcast): Promise<Podcast> {
    const [result] = await db.insert(podcasts).values(podcast).returning();
    return result;
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    const [result] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return result;
  }

  async updatePodcastStatus(id: string, status: string): Promise<void> {
    await db.update(podcasts).set({ status }).where(eq(podcasts.id, id));
  }

  async updatePodcastAudio(id: string, audioUrl: string): Promise<void> {
    await db.update(podcasts).set({ audioUrl }).where(eq(podcasts.id, id));
  }

  async createTranscription(transcription: InsertTranscription): Promise<Transcription> {
    const [result] = await db.insert(transcriptions).values(transcription).returning();
    return result;
  }

  async getTranscriptionByPodcastId(podcastId: string): Promise<Transcription | undefined> {
    const [result] = await db.select().from(transcriptions).where(eq(transcriptions.podcastId, podcastId));
    return result;
  }

  async createEntity(entity: InsertEntity): Promise<Entity> {
    const [result] = await db.insert(entities).values(entity).returning();
    return result;
  }

  async getEntityByName(name: string): Promise<Entity | undefined> {
    const [result] = await db.select().from(entities).where(eq(entities.name, name));
    return result;
  }

  async createEntityMention(mention: InsertEntityMention): Promise<EntityMention> {
    const [result] = await db.insert(entityMentions).values(mention).returning();
    return result;
  }

  async getEntityMentionsByPodcastId(podcastId: string): Promise<EntityMention[]> {
    return await db.select().from(entityMentions).where(eq(entityMentions.podcastId, podcastId));
  }

  async createEntityRelationship(relationship: InsertEntityRelationship): Promise<EntityRelationship> {
    const [result] = await db.insert(entityRelationships).values(relationship).returning();
    return result;
  }

  async getEntityRelationshipsByPodcastId(podcastId: string): Promise<EntityRelationship[]> {
    const mentions = await this.getEntityMentionsByPodcastId(podcastId);
    const entityIds = mentions.map(m => m.entityId);
    
    if (entityIds.length === 0) return [];
    
    return await db.select().from(entityRelationships)
      .where(
        and(
          eq(entityRelationships.sourceEntityId, entityIds[0])
        )
      );
  }

  async createPodcastInsights(insights: InsertPodcastInsights): Promise<PodcastInsights> {
    // For now, return a mock since insights table isn't implemented yet
    return { ...insights, id: randomUUID(), createdAt: new Date() } as PodcastInsights;
  }

  async getPodcastInsights(podcastId: string): Promise<PodcastInsights | undefined> {
    return undefined; // Not implemented yet
  }

  async findExistingPodcastByUrl(appleUrl: string): Promise<Podcast | undefined> {
    const [result] = await db.select().from(podcasts).where(eq(podcasts.appleUrl, appleUrl));
    return result;
  }

  async findSimilarTranscript(title: string, showName: string): Promise<Podcast | undefined> {
    // Simple similarity check - could be enhanced with fuzzy matching
    const [result] = await db.select().from(podcasts)
      .where(and(
        eq(podcasts.title, title),
        eq(podcasts.showName, showName)
      ));
    return result;
  }

  async getPodcastAnalysis(podcastId: string): Promise<PodcastAnalysis | undefined> {
    const podcast = await this.getPodcast(podcastId);
    if (!podcast) return undefined;

    const transcription = await this.getTranscriptionByPodcastId(podcastId);
    if (!transcription) return undefined;

    const mentions = await this.getEntityMentionsByPodcastId(podcastId);
    
    // Group mentions by entity and fetch entity details
    const entityMentionsMap = new Map<string, EntityMention[]>();
    mentions.forEach(mention => {
      const existing = entityMentionsMap.get(mention.entityId) || [];
      entityMentionsMap.set(mention.entityId, [...existing, mention]);
    });

    const insights = await this.getPodcastInsights(podcastId);
    const relationships = await this.getEntityRelationshipsByPodcastId(podcastId);

    // Build enhanced entity analysis
    const entityAnalysis = await Promise.all(
      Array.from(entityMentionsMap.entries()).map(async ([entityId, entityMentions]) => {
        const [entity] = await db.select().from(entities).where(eq(entities.id, entityId));
        if (!entity) return null;

        const entityRelationships = relationships.filter(r => 
          r.sourceEntityId === entityId || r.targetEntityId === entityId
        );

        return {
          entity,
          mentionCount: entityMentions.length,
          mentions: entityMentions.sort((a, b) => a.timestamp - b.timestamp),
          topics: [],
          summary: `Mentioned ${entityMentions.length} times throughout the episode`,
          sentiment: entity.sentiment || "neutral",
          importance: entity.importance || 50,
          relationships: entityRelationships,
          emotions: Array.from(new Set(entityMentions.flatMap(m => m.emotions || []))),
        };
      })
    );

    const validEntityAnalysis = entityAnalysis.filter(Boolean) as any[];

    const stats = {
      totalEntities: validEntityAnalysis.length,
      peopleCount: validEntityAnalysis.filter(ea => ea.entity.category === 'person').length,
      placesCount: validEntityAnalysis.filter(ea => ea.entity.category === 'place').length,
      entertainmentCount: validEntityAnalysis.filter(ea => ea.entity.category === 'entertainment').length,
      accuracy: transcription.accuracy || 95,
      overallSentiment: insights?.overallSentiment || "neutral",
      emotionalVariance: 0,
      networkDensity: 0,
    };

    return {
      podcast,
      transcription,
      entityAnalysis: validEntityAnalysis,
      insights: insights || {
        id: randomUUID(),
        podcastId,
        overallSentiment: "neutral",
        keyTopics: [],
        emotionalJourney: [],
        entityNetwork: {},
        summary: null,
        createdAt: new Date(),
      },
      stats,
    };
  }

  // Add a private Map to store books in the DatabaseStorage class
  private static booksCache = new Map<string, any>();

  async storeBook(book: any): Promise<void> {
    console.log(`📚 Storing book in DatabaseStorage: ${book.title} with ${book.chapters?.length || 0} chapters`);
    DatabaseStorage.booksCache.set(book.id, book);
    // Also store with a standard "merle-haggard" key for easy retrieval
    DatabaseStorage.booksCache.set('merle-haggard', book);
  }

  async getBook(id: string): Promise<any | undefined> {
    const book = DatabaseStorage.booksCache.get(id);
    if (book) {
      console.log(`📖 Retrieved book from DatabaseStorage: ${book.title}`);
    } else {
      console.log(`❌ No book found in DatabaseStorage with ID: ${id}`);
    }
    return book;
  }

  async getAllBooks(): Promise<any[]> {
    return Array.from(DatabaseStorage.booksCache.values());
  }
}

// Use database storage when available (either PostgreSQL or SQLite)
// SQLite is automatically used when DATABASE_URL is not set
const isDatabaseAvailable = process.env.DATABASE_URL || !process.env.USE_MEMORY_STORAGE;
export const storage = isDatabaseAvailable ? new DatabaseStorage() : new MemStorage();

// Log which storage is being used
if (isDatabaseAvailable) {
  console.log("💾 Using database storage (PostgreSQL or SQLite)");
} else {
  console.log("💭 Using in-memory storage");
}
