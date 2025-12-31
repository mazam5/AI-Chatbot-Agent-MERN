import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function hasMigrationRun(name: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM schema_migrations WHERE name = $1`,
    [name]
  );
  return rowCount === 1;
}

async function recordMigration(name: string) {
  await pool.query(`INSERT INTO schema_migrations (name) VALUES ($1)`, [name]);
}

export async function runMigrations() {
  await ensureMigrationsTable();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (await hasMigrationRun(file)) {
      console.log(`↩️  Skipping migration: ${file}`);
      continue;
    }

    console.log(`🚀 Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    await pool.query(sql);
    await recordMigration(file);

    console.log(`✅ Applied migration: ${file}`);
  }

  console.log('📦 All migrations up to date');
}
