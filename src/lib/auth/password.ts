import 'server-only';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem?: number },
) => Promise<Buffer>;

/**
 * scrypt with parameters chosen for interactive login on commodity hardware
 * (~100ms). Node's own primitive is used rather than a native dependency so
 * the project installs and runs anywhere without a build toolchain.
 */
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 96 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  try {
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MAXMEM,
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * A hash to verify against when no account exists, so a sign-in attempt on an
 * unknown address costs the same time as one on a real address.
 *
 * It is derived at runtime from random bytes rather than written as a literal.
 * A hardcoded placeholder is easy to get subtly wrong — one with a shorter
 * digest than `KEYLEN` makes the decoy verification cheaper than a real one and
 * reintroduces exactly the timing signal it exists to remove. Deriving it here
 * keeps the parameters identical to real hashes by construction, including if
 * they are tuned later.
 *
 * Computed once, lazily, so it costs nothing until the first sign-in attempt.
 */
let decoy: Promise<string> | null = null;

export function decoyHash(): Promise<string> {
  decoy ??= hashPassword(randomBytes(32).toString('base64url'));
  return decoy;
}

/** Minimum policy enforced at the API boundary, not in the browser. */
export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 10) problems.push('Use at least 10 characters.');
  if (password.length > 200) problems.push('Use fewer than 200 characters.');
  if (!/[a-zA-Z]/.test(password)) problems.push('Include at least one letter.');
  if (!/[0-9\W]/.test(password)) problems.push('Include at least one number or symbol.');
  const common = ['password', '12345678', 'qwertyuiop', 'letmein123', 'celpip1234'];
  if (common.some((c) => password.toLowerCase().includes(c))) {
    problems.push('This password is too easy to guess.');
  }
  return problems;
}
