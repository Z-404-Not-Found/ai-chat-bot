import { getDatabase, generateId } from './index'

export interface Message {
    id: string
    conversation_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    model?: string
    thinking?: string
    created_at: number
    updated_at: number
    deleted: number
    sync_status: number
}

export interface CreateMessageInput {
    conversation_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    model?: string
    thinking?: string
}

export interface UpdateMessageInput {
    content?: string
    thinking?: string
}

export function createMessage(input: CreateMessageInput): Message {
    const db = getDatabase()
    const now = Date.now()
    const id = generateId()

    const stmt = db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, model, thinking, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `)
    stmt.run(
        id,
        input.conversation_id,
        input.role,
        input.content,
        input.model ?? null,
        input.thinking ?? null,
        now,
        now
    )

    return {
        id,
        conversation_id: input.conversation_id,
        role: input.role,
        content: input.content,
        model: input.model,
        thinking: input.thinking,
        created_at: now,
        updated_at: now,
        deleted: 0,
        sync_status: 0
    }
}

export function getMessageById(id: string): Message | undefined {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ? AND deleted = 0')
    return stmt.get(id) as Message | undefined
}

export function getMessagesByConversationId(conversationId: string): Message[] {
    const db = getDatabase()
    const stmt = db.prepare(
        'SELECT * FROM messages WHERE conversation_id = ? AND deleted = 0 ORDER BY created_at ASC'
    )
    return stmt.all(conversationId) as Message[]
}

export function updateMessage(id: string, input: UpdateMessageInput): Message | undefined {
    const db = getDatabase()
    const existing = getMessageById(id)
    if (!existing) return undefined

    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE messages SET content = ?, thinking = ?, updated_at = ?, sync_status = 0 WHERE id = ? AND deleted = 0
    `)
    stmt.run(input.content ?? existing.content, input.thinking ?? existing.thinking, now, id)

    return getMessageById(id)
}

export function deleteMessage(id: string): boolean {
    const db = getDatabase()
    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE messages SET deleted = 1, updated_at = ?, sync_status = 0 WHERE id = ? AND deleted = 0
    `)
    const result = stmt.run(now, id)
    return result.changes > 0
}

export function deleteMessagesByConversationId(conversationId: string): number {
    const db = getDatabase()
    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE messages SET deleted = 1, updated_at = ?, sync_status = 0 WHERE conversation_id = ? AND deleted = 0
    `)
    const result = stmt.run(now, conversationId)
    return result.changes
}

export function getUnsyncedMessages(): Message[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM messages WHERE sync_status = 0')
    return stmt.all() as Message[]
}

export function markMessageSynced(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE messages SET sync_status = 1 WHERE id = ?')
    stmt.run(id)
}
