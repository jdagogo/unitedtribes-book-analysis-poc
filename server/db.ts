import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Allow running without database for development
let pool: Pool | null = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
  console.log(
    "📦 DATABASE_URL not set. Using local SQLite database.",
    "\n   Perfect for local development!"
  );
  // Use SQLite for local development
  const sqliteModule = await import('./db-sqlite.js');
  db = sqliteModule.db;
} else {
  console.log("🌐 Using PostgreSQL database from DATABASE_URL");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };