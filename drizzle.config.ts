import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';
import { requireDatabaseUrl, toDirectUrl } from './src/lib/db/url';

config({ path: '.env' });

/**
 * Migrations run in session mode, not transaction mode: DDL and advisory locks
 * are session state that transaction pooling cannot carry. That connection is
 * derived from `DATABASE_URL`, so there is still only one variable to set.
 */
export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: { url: toDirectUrl(requireDatabaseUrl()) },
} satisfies Config;
