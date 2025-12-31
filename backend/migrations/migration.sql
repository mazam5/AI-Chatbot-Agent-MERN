CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_enum') THEN
    CREATE TYPE sender_enum AS ENUM ('user', 'ai');
  END IF;
END$$;

-- Conversation table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Message table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender sender_enum NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
ON messages(conversation_id);
