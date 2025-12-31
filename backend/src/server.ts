import 'dotenv/config';

import app from './app.js';
import { pool } from './config/database.js';
import { ensureSchema } from './db/schema.js';
import { runMigrations } from './db/migrate.js';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await pool.query('SELECT 1');
    console.log('✔ Database connection successful');

    await runMigrations();
    await ensureSchema();
    console.log('✔ Database schema ready');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Startup failed');
    console.error(error);
    process.exit(1);
  }
}

main();
