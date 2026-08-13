import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'; // Crockford-ish: no i, l, o, u

/**
 * Sortable, prefixed identifiers: `usr_01j8v2…`. The leading timestamp keeps
 * primary-key inserts append-friendly, and the prefix makes ids
 * self-describing in logs and audit trails.
 */
export function newId(prefix: string): string {
  const time = Date.now();
  let ts = '';
  let remaining = time;
  for (let i = 0; i < 8; i++) {
    ts = ALPHABET[remaining % 32] + ts;
    remaining = Math.floor(remaining / 32);
  }
  const random = randomBytes(8);
  let suffix = '';
  for (const byte of random) suffix += ALPHABET[byte % 32];
  return `${prefix}_${ts}${suffix}`;
}

/** Deterministic ids for seeded content, so re-seeding is idempotent. */
export function contentId(prefix: string, slug: string): string {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let encoded = '';
  let remaining = hash;
  for (let i = 0; i < 7; i++) {
    encoded = ALPHABET[remaining % 32] + encoded;
    remaining = Math.floor(remaining / 32);
  }
  return `${prefix}_${encoded}${slug.replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase()}`;
}
