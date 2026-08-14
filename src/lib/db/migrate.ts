/**
 * Apply the schema, then lock it down for Supabase.
 *
 * The second step is not optional on Supabase and is easy to miss. A Supabase
 * project publishes every table in the `public` schema through PostgREST, and
 * the anon key that authorises those requests is designed to be shipped to
 * browsers. Row-level security is the only thing standing between that public
 * endpoint and this data.
 *
 * Meridian does not use PostgREST or Supabase Auth — it connects as a Postgres
 * role and enforces tenancy in `lib/auth/guard.ts`. So the correct posture is
 * to enable RLS on every table and define no policy at all: the owning role
 * bypasses RLS and the application is unaffected, while `anon` and
 * `authenticated` reach nothing even if the key is public.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env' });

async function main(): Promise<void> {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL (and ideally DIRECT_URL) in .env. See .env.example.');
    process.exit(1);
  }

  const bin = path.join(process.cwd(), 'node_modules', '.bin', 'drizzle-kit');
  try {
    execFileSync(bin, ['push', '--force'], { stdio: 'inherit' });
  } catch {
    console.error('\nSchema push failed. If the error mentions prepared statements or advisory');
    console.error('locks, point DIRECT_URL at the direct connection (port 5432), not the pooler.');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: url.includes('supabase.') ? 'require' : false, max: 1 });

  try {
    const tables = await sql<{ tablename: string }[]>`
      select tablename from pg_tables where schemaname = 'public'
    `;

    let revoked = true;
    for (const { tablename } of tables) {
      // ENABLE, deliberately not FORCE.
      //
      // FORCE subjects the table owner to RLS as well. With no policies
      // defined, a non-superuser owner — which is what the application role is
      // on a hosted Postgres — is then locked out of its own tables: reads
      // silently return zero rows and writes fail. Verified against a
      // non-superuser owner locally. ENABLE alone denies every other role,
      // which is the entire goal here.
      await sql`alter table ${sql(tablename)} enable row level security`;
      try {
        // Belt and braces: RLS alone already denies every row, but removing the
        // grant means the API roles cannot even see the relation.
        await sql`revoke all on ${sql(tablename)} from anon, authenticated`;
      } catch (error) {
        // A plain Postgres server has no Supabase API roles. That is expected
        // locally and must not fail the migration.
        if (!/role "(anon|authenticated)" does not exist/.test(String(error))) throw error;
        revoked = false;
      }
    }

    const [policies] = await sql<{ count: number }[]>`
      select count(*)::int as count from pg_policies where schemaname = 'public'
    `;

    console.log(`\nRow-level security enabled on ${tables.length} table(s).`);
    console.log(`Policies defined: ${policies.count}. Zero is correct — the application connects as the`);
    console.log('owning role, which bypasses RLS, and no other role should reach these rows.');
    if (!revoked) {
      console.log('Supabase API roles are absent (local Postgres), so the revoke step was skipped.');
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
