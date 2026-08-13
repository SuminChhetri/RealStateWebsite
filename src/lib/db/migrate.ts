/**
 * Schema push for local development.
 *
 * Drizzle Kit generates the DDL from `schema.ts`, so the database can never
 * drift from the models. In production this would be replaced by versioned
 * migration files; for a local-first product the push is the right trade.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const bin = path.join(process.cwd(), 'node_modules', '.bin', 'drizzle-kit');

try {
  execFileSync(bin, ['push', '--force'], { stdio: 'inherit' });
  console.log('Schema pushed to data/meridian.db');
} catch (error) {
  console.error('Schema push failed.', error);
  process.exit(1);
}
