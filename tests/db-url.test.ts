import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isTransactionPooler, redact, sslMode, toDirectUrl } from '../src/lib/db/url';

/**
 * Setup is one connection string, so the derivation of everything else from it
 * is load-bearing: get it wrong and migrations fail against a pooler with an
 * error that does not name the cause.
 */

const POOLER = 'postgresql://postgres.abc:pw@aws-0-ca-central-1.pooler.supabase.com:6543/postgres';

test('the migration connection is the pooler string in session mode', () => {
  assert.equal(
    toDirectUrl(POOLER),
    'postgresql://postgres.abc:pw@aws-0-ca-central-1.pooler.supabase.com:5432/postgres',
  );
});

test('the pgbouncer hint is dropped, since session mode is not pgbouncer', () => {
  assert.equal(
    toDirectUrl(`${POOLER}?pgbouncer=true`),
    'postgresql://postgres.abc:pw@aws-0-ca-central-1.pooler.supabase.com:5432/postgres',
  );
});

test('a string that is already session mode or direct is left alone', () => {
  for (const url of [
    'postgresql://postgres.abc:pw@aws-0-ca-central-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:pw@db.abc.supabase.co:5432/postgres',
    'postgresql://postgres@127.0.0.1:5433/meridian',
  ]) {
    assert.equal(toDirectUrl(url), url);
  }
});

test('only the transaction pooler disables prepared statements', () => {
  assert.equal(isTransactionPooler(POOLER), true);
  assert.equal(isTransactionPooler(`${POOLER}?pgbouncer=true`), true);
  assert.equal(isTransactionPooler('postgresql://postgres@127.0.0.1:5432/meridian'), false);
});

test('TLS is required for hosted databases and off for local ones', () => {
  assert.equal(sslMode(POOLER), 'require');
  assert.equal(sslMode('postgresql://postgres:pw@db.abc.supabase.co:5432/postgres'), 'require');
  assert.equal(sslMode('postgresql://postgres@127.0.0.1:5432/meridian'), false);
});

test('redaction removes the password before anything is printed', () => {
  const redacted = redact(POOLER);
  assert.ok(!redacted.includes('pw'), 'password survived redaction');
  assert.ok(redacted.includes('pooler.supabase.com'), 'host should still be identifiable');
});

test('an unparseable string is returned rather than throwing', () => {
  assert.equal(toDirectUrl('not a url'), 'not a url');
});
