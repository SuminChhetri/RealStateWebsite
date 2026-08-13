// Intentionally not marked `server-only`: the seed and maintenance scripts run
// this module outside Next. Server-only enforcement lives one layer up, in the
// auth guards that every feature module must pass through.
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

/**
 * Single process-wide connection. SQLite in WAL mode handles the concurrency a
 * single-node deployment needs; the module boundary here is the seam where a
 * Postgres pool would be swapped in without touching call sites.
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'meridian.db');

function connect() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  return drizzle(sqlite, { schema });
}

declare global {
  // eslint-disable-next-line no-var
  var __meridianDb: ReturnType<typeof connect> | undefined;
}

export const db = globalThis.__meridianDb ?? connect();
if (process.env.NODE_ENV !== 'production') globalThis.__meridianDb = db;

export { schema };
export type Db = typeof db;
