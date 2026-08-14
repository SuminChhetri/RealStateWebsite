/**
 * Drop every table in `public` so the schema can be rebuilt from scratch.
 *
 * Guarded twice, because this now points at a hosted database rather than a
 * local file: it refuses to run when NODE_ENV is production, and it requires an
 * explicit confirmation variable, so a mistyped script name cannot destroy a
 * project's data.
 */
import { config } from 'dotenv';
import postgres from 'postgres';
import { redact, requireDatabaseUrl, sslMode, toDirectUrl } from './url';

config({ path: '.env' });

async function main(): Promise<void> {
  let url: string;
  try {
    url = toDirectUrl(requireDatabaseUrl());
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to reset: NODE_ENV is production.');
    process.exit(1);
  }

  if (process.env.MERIDIAN_CONFIRM_RESET !== 'yes') {
    console.error('This drops every table in the public schema of:');
    console.error(`  ${redact(url)}`);
    console.error('\nRe-run with MERIDIAN_CONFIRM_RESET=yes if that is what you intend.');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: sslMode(url), max: 1 });
  try {
    const tables = await sql<{ tablename: string }[]>`
      select tablename from pg_tables where schemaname = 'public'
    `;
    for (const { tablename } of tables) {
      await sql`drop table if exists ${sql(tablename)} cascade`;
    }
    console.log(`Dropped ${tables.length} table(s).`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
