import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  showName: text("show_name").notNull(),
  appleUrl: text("apple_url").notNull(),
  audioUrl: text("audio_url"), // URL to stored audio file in object storage
  duration: integer("duration"), // in seconds
  publishedDate: timestamp("published_date"),
  artworkUrl: text("artwork_url"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transcriptions = pgTable("transcriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podcastId: varchar("podcast_id").references(() => podcasts.id).notNull(),
  fullText: text("full_text").notNull(),
  segments: jsonb("segments").notNull(), // timestamped segments
  accuracy: integer("accuracy"), // percentage
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const entities = pgTable("entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // person, place, organization, entertainment, etc.
  description: text("description"),
  category: text("category").notNull(),
  aliases: jsonb("aliases").default([]), // Alternative names/variations
  wikiDataId: text("wikidata_id"), // External knowledge linking
  sentiment: text("sentiment"), // positive, negative, neutral
  importance: integer("importance").default(50), // 1-100 relevance score
});

export const entityMentions = pgTable("entity_mentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podcastId: varchar("podcast_id").references(() => podcasts.id).notNull(),
  entityId: varchar("entity_id").references(() => entities.id).notNull(),
  timestamp: integer("timestamp").notNull(), // in seconds
  context: text("context").notNull(),
  confidence: integer("confidence"), // percentage
  sentiment: text("sentiment"), // sentiment of this specific mention
  emotions: jsonb("emotions").default([]), // detected emotions in context
  relationshipType: text("relationship_type"), // how entity relates to others
});

export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  createdAt: true,
});

export const insertTranscriptSchema = z.object({
  title: z.string().min(1),
  showName: z.string().min(1),
  transcript: z.string().min(10),
  duration: z.number().optional().default(0),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).omit({
  id: true,
  createdAt: true,
});

export const insertEntitySchema = createInsertSchema(entities).omit({
  id: true,
});

// Books and multimedia content table
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  publisher: text("publisher"),
  publishedYear: integer("published_year"),
  pageCount: integer("page_count"),
  genre: text("genre"),
  description: text("description"),
  textContent: text("text_content"), // Full text for analysis
  audioUrl: text("audio_url"), // For audiobook version
  audioDuration: integer("audio_duration"), // in seconds
  coverImageUrl: text("cover_image_url"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const bookChapters = pgTable("book_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
  audioTimestamp: integer("audio_timestamp"), // start time for audiobook
  audioDuration: integer("audio_duration"), // chapter duration in seconds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Cross-media entity mentions (supports podcasts, books, audiobooks)
export const crossMediaMentions = pgTable("cross_media_mentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: varchar("entity_id").references(() => entities.id).notNull(),
  mediaType: text("media_type").notNull(), // podcast, book, audiobook
  mediaId: varchar("media_id").notNull(), // references podcasts.id or books.id
  chapterId: varchar("chapter_id").references(() => bookChapters.id), // for books
  timestamp: integer("timestamp"), // for audio content (seconds)
  pageNumber: integer("page_number"), // for books
  context: text("context").notNull(),
  confidence: integer("confidence").default(85),
  sentiment: text("sentiment"),
  emotions: jsonb("emotions").default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// New table for entity relationships and mappings
export const entityRelationships = pgTable("entity_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceEntityId: varchar("source_entity_id").references(() => entities.id).notNull(),
  targetEntityId: varchar("target_entity_id").references(() => entities.id).notNull(),
  relationshipType: text("relationship_type").notNull(), // "mentions_with", "works_for", "located_in", etc.
  strength: integer("strength").notNull().default(1), // How often they co-occur
  context: text("context"), // How they're related
});

// Advanced analytics table
export const podcastInsights = pgTable("podcast_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podcastId: varchar("podcast_id").references(() => podcasts.id).notNull(),
  overallSentiment: text("overall_sentiment"),
  keyTopics: jsonb("key_topics").notNull().default([]),
  emotionalJourney: jsonb("emotional_journey").notNull().default([]), // sentiment over time
  entityNetwork: jsonb("entity_network").notNull().default({}), // relationship graph
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertEntityMentionSchema = createInsertSchema(entityMentions).omit({
  id: true,
});

export const insertEntityRelationshipSchema = createInsertSchema(entityRelationships).omit({
  id: true,
});

export const insertPodcastInsightsSchema = createInsertSchema(podcastInsights).omit({
  id: true,
  createdAt: true,
});

export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Transcription = typeof transcriptions.$inferSelect;
export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type EntityMention = typeof entityMentions.$inferSelect;
export type InsertEntityMention = z.infer<typeof insertEntityMentionSchema>;
export type EntityRelationship = typeof entityRelationships.$inferSelect;
export type InsertEntityRelationship = z.infer<typeof insertEntityRelationshipSchema>;
export type PodcastInsights = typeof podcastInsights.$inferSelect;
export type InsertPodcastInsights = z.infer<typeof insertPodcastInsightsSchema>;

// Book-related schema exports
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export const insertBookChapterSchema = createInsertSchema(bookChapters).omit({
  id: true,
  createdAt: true,
});

export const insertCrossMediaMentionSchema = createInsertSchema(crossMediaMentions).omit({
  id: true,
  createdAt: true,
});

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BookChapter = typeof bookChapters.$inferSelect;
export type InsertBookChapter = z.infer<typeof insertBookChapterSchema>;
export type CrossMediaMention = typeof crossMediaMentions.$inferSelect;
export type InsertCrossMediaMention = z.infer<typeof insertCrossMediaMentionSchema>;

// Enhanced analysis result types
export type EntityAnalysis = {
  entity: Entity;
  mentionCount: number;
  mentions: EntityMention[];
  topics: string[];
  summary: string;
  sentiment: string;
  importance: number;
  relationships: EntityRelationship[];
  emotions: string[];
};

export type PodcastAnalysis = {
  podcast: Podcast;
  transcription: Transcription;
  entityAnalysis: EntityAnalysis[];
  insights: PodcastInsights;
  stats: {
    totalEntities: number;
    peopleCount: number;
    placesCount: number;
    entertainmentCount: number;
    accuracy: number;
    overallSentiment: string;
    emotionalVariance: number;
    networkDensity: number;
  };
};

// Book analysis types
export type BookAnalysis = {
  book: Book;
  chapters: BookChapter[];
  entityAnalysis: EntityAnalysis[];
  crossMediaConnections: {
    podcastConnections: number;
    sharedEntities: string[];
    narrativeOverlaps: string[];
  };
  stats: {
    totalEntities: number;
    chaptersCount: number;
    averageEntitiesPerChapter: number;
    overallSentiment: string;
    keyThemes: string[];
  };
};

// Cross-media discovery types
export type CrossMediaDiscovery = {
  sourceMedia: {
    type: 'podcast' | 'book' | 'audiobook';
    id: string;
    title: string;
  };
  relatedMedia: Array<{
    type: 'podcast' | 'book' | 'audiobook';
    id: string;
    title: string;
    connectionStrength: number;
    sharedEntities: string[];
    contexts: string[];
  }>;
  discoveryPaths: Array<{
    entity: string;
    path: Array<{
      mediaType: string;
      title: string;
      context: string;
    }>;
  }>;
};
