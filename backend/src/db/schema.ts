import { pool } from '../config/database.js';

export async function ensureSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_enum') THEN
        CREATE TYPE sender_enum AS ENUM ('user', 'ai');
      END IF;
    END$$;

    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,
      sender sender_enum NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON messages(conversation_id);
  `);
}
