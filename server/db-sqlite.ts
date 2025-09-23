import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SQLite database file in project root
const dbPath = path.join(__dirname, '..', 'local.db');
console.log('📁 SQLite database path:', dbPath);

const sqlite = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { sqlite };

// Initialize database tables
export function initializeDatabase() {
  console.log('🔧 Initializing SQLite database...');
  
  // Create podcasts table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      show_name TEXT,
      description TEXT,
      apple_url TEXT UNIQUE,
      audio_url TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transcriptions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS transcriptions (
      id TEXT PRIMARY KEY,
      podcast_id TEXT NOT NULL,
      text TEXT NOT NULL,
      accuracy REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
    )
  `);

  // Create entities table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      type TEXT,
      category TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create entity_mentions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS entity_mentions (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      podcast_id TEXT NOT NULL,
      mention_count INTEGER DEFAULT 1,
      sentiment TEXT,
      importance REAL,
      context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
    )
  `);

  // Create entity_relationships table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS entity_relationships (
      id TEXT PRIMARY KEY,
      from_entity_id TEXT NOT NULL,
      to_entity_id TEXT NOT NULL,
      podcast_id TEXT NOT NULL,
      relationship_type TEXT,
      strength REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (to_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
    )
  `);

  // Create podcast_insights table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS podcast_insights (
      id TEXT PRIMARY KEY,
      podcast_id TEXT NOT NULL UNIQUE,
      overall_sentiment TEXT,
      key_topics TEXT,
      emotional_journey TEXT,
      narrative_structure TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_podcasts_apple_url ON podcasts(apple_url);
    CREATE INDEX IF NOT EXISTS idx_transcriptions_podcast_id ON transcriptions(podcast_id);
    CREATE INDEX IF NOT EXISTS idx_entity_mentions_entity_id ON entity_mentions(entity_id);
    CREATE INDEX IF NOT EXISTS idx_entity_mentions_podcast_id ON entity_mentions(podcast_id);
    CREATE INDEX IF NOT EXISTS idx_entity_relationships_from ON entity_relationships(from_entity_id);
    CREATE INDEX IF NOT EXISTS idx_entity_relationships_to ON entity_relationships(to_entity_id);
    CREATE INDEX IF NOT EXISTS idx_entity_relationships_podcast ON entity_relationships(podcast_id);
  `);

  console.log('✅ SQLite database initialized successfully');
}

// Initialize on import
initializeDatabase();