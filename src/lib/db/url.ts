/**
 * Connection-string handling, kept in its own module because `drizzle.config.ts`
 * and the migration scripts need it and must not import the client — importing
 * the client opens a pool.
 *
 * The whole point of this file is that there is one variable to set.
 * `DATABASE_URL` is whatever Supabase hands you; everything else is worked out
 * from it.
 */

/** The application's connection string, with a message worth reading if unset. */
export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set.\n\n' +
        'Copy .env.example to .env and paste the connection string from your Supabase project\n' +
        '(Project settings → Database → Connection string). That is the only value you need.',
    );
  }
  return url;
}

/**
 * The connection to run DDL over.
 *
 * Supabase's pooler answers on one host with one set of credentials and two
 * ports: 6543 is transaction mode, 5432 is session mode. DDL and advisory locks
 * are session state, which transaction mode cannot carry, so migrations get the
 * port swapped. Anything already pointing elsewhere — session mode, a direct
 * connection, a local Postgres — is left exactly as it is.
 */
export function toDirectUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.port === '6543') parsed.port = '5432';
    parsed.searchParams.delete('pgbouncer');
    return parsed.toString();
  } catch {
    // An unparseable string is the user's to fix. Throwing here would bury the
    // real connection error under a URL error.
    return url;
  }
}

/** True when the string points at a transaction-mode pooler. */
export function isTransactionPooler(url: string): boolean {
  return url.includes(':6543') || url.includes('pgbouncer=true');
}

/**
 * TLS is required for a hosted database and pointless for a local one, and the
 * host name is enough to tell them apart.
 */
export function sslMode(url: string): 'require' | false {
  return /supabase\.|\.neon\.tech|\.render\.com|amazonaws\.com/.test(url) ? 'require' : false;
}

/** A form of the string that is safe to print in an error or a prompt. */
export function redact(url: string): string {
  return url.replace(/:\/\/[^@]*@/, '://***@');
}
