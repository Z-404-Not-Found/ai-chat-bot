export const CREATE_CHARACTERS_TABLE = `
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0,
    sync_status INTEGER NOT NULL DEFAULT 0
)
`

export const CREATE_CONVERSATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0,
    sync_status INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
)
`

export const CREATE_MESSAGES_TABLE = `
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    model TEXT,
    thinking TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0,
    sync_status INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
)
`

export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_characters_deleted ON characters(deleted);
CREATE INDEX IF NOT EXISTS idx_characters_sync_status ON characters(sync_status);
CREATE INDEX IF NOT EXISTS idx_conversations_character_id ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deleted ON conversations(deleted);
CREATE INDEX IF NOT EXISTS idx_conversations_sync_status ON conversations(sync_status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted);
CREATE INDEX IF NOT EXISTS idx_messages_sync_status ON messages(sync_status);
`
