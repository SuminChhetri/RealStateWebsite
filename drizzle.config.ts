import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({ path: '.env' });

/**
 * Migrations run over the direct connection, not the pooler: transaction-mode
 * pooling cannot carry the session state DDL and advisory locks depend on.
 */
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error('Set DATABASE_URL (and ideally DIRECT_URL) in .env before running migrations.');
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: { url },
} satisfies Config;
