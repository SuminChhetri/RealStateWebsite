// Intentionally not marked `server-only`: the migration and seed scripts run
// this module outside Next. Server-only enforcement lives one layer up, in the
// auth guards that every feature module must pass through.
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Next loads `.env` itself, but the migration, seed and maintenance scripts run
// outside it. Loading here covers both; dotenv never overwrites a variable that
// is already set, so a real deployment's environment always wins.
config({ path: '.env' });

/**
 * PostgreSQL connection, configured for Supabase.
 *
 * Supabase gives a project two connection strings and they are not
 * interchangeable:
 *
 *  - the **pooler** (port 6543, transaction mode) is what the application
 *    should use. Transaction-mode pooling multiplexes many short-lived
 *    connections onto few server connections, which is what makes this safe to
 *    run behind serverless request handlers that would otherwise exhaust the
 *    connection limit.
 *  - the **direct** connection (port 5432) is what migrations must use.
 *    Transaction-mode pooling cannot carry session-level state, so DDL and
 *    advisory locks belong on the direct connection.
 *
 * The two are read from `DATABASE_URL` and `DIRECT_URL` respectively.
 *
 * `prepare: false` is required against the transaction pooler: prepared
 * statements are session state, and a pooled connection is not guaranteed to
 * be the same backend on the next statement.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and paste your Supabase connection string ' +
      '(Project settings → Database → Connection string → Transaction pooler).',
  );
}

const usingPooler =
  connectionString.includes(':6543') || connectionString.includes('pgbouncer=true');

function connect() {
  const sql = postgres(connectionString!, {
    // Supabase terminates TLS at the pooler with a certificate chain Node does
    // not carry, so verification is relaxed for that host only. The connection
    // is still encrypted.
    ssl: connectionString!.includes('supabase.') ? 'require' : false,
    prepare: !usingPooler,
    max: usingPooler ? 10 : 5,
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
  const direct = process.env.DIRECT_URL ?? connectionString!;
  if (direct.includes(':6543') || direct.includes('pgbouncer=true')) {
    console.warn(
      'Warning: running DDL through the transaction pooler. Set DIRECT_URL to the direct ' +
        'connection (port 5432) if migrations fail.',
    );
  }
  return direct;
}
