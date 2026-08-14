// Intentionally not marked `server-only`: the migration and seed scripts run
// this module outside Next. Server-only enforcement lives one layer up, in the
// auth guards that every feature module must pass through.
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { isTransactionPooler, requireDatabaseUrl, sslMode, toDirectUrl } from './url';

// Next loads `.env` itself, but the migration, seed and maintenance scripts run
// outside it. Loading here covers both; dotenv never overwrites a variable that
// is already set, so a real deployment's environment always wins.
config({ path: '.env' });

/**
 * PostgreSQL connection, configured for Supabase.
 *
 * There is exactly one thing to set: `DATABASE_URL`. Paste the connection
 * string Supabase gives you and nothing else is required — the migration
 * connection, the TLS mode and the pooling behaviour are all derived from it.
 *
 * `prepare: false` against a transaction pooler is not optional: prepared
 * statements are session state, and a pooled connection is not guaranteed to be
 * the same backend on the next statement.
 */
const connectionString = requireDatabaseUrl();
const pooled = isTransactionPooler(connectionString);

function connect() {
  const sql = postgres(connectionString, {
    ssl: sslMode(connectionString),
    prepare: !pooled,
    max: pooled ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {},
  });

  return drizzle(sql, { schema, casing: 'snake_case' });
}

declare global {
  // eslint-disable-next-line no-var
  var __meridianDb: ReturnType<typeof connect> | undefined;
}

/**
 * A single pool per process. Next's development server re-evaluates modules on
 * every edit, so without this the pool would be recreated until Postgres
 * refused new connections.
 */
export const db = globalThis.__meridianDb ?? connect();
if (process.env.NODE_ENV !== 'production') globalThis.__meridianDb = db;

export { schema };
export type Db = typeof db;

/** The connection migrations and maintenance scripts should use. */
export function directConnectionString(): string {
  return toDirectUrl(connectionString);
}
