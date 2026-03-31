import { getDatabase, generateId } from './index'

export interface Conversation {
    id: string
    character_id: string
    title: string
    created_at: number
    updated_at: number
    deleted: number
    sync_status: number
}

export interface CreateConversationInput {
    character_id: string
    title: string
}

export interface UpdateConversationInput {
    title?: string
}

export function createConversation(input: CreateConversationInput): Conversation {
    const db = getDatabase()
    const now = Date.now()
    const id = generateId()

    const stmt = db.prepare(`
        INSERT INTO conversations (id, character_id, title, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, 0, 0)
    `)
    stmt.run(id, input.character_id, input.title, now, now)

    return {
        id,
        character_id: input.character_id,
        title: input.title,
        created_at: now,
        updated_at: now,
        deleted: 0,
        sync_status: 0
    }
}

export function getConversationById(id: string): Conversation | undefined {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ? AND deleted = 0')
    return stmt.get(id) as Conversation | undefined
}

export function getConversationsByCharacterId(characterId: string): Conversation[] {
    const db = getDatabase()
    const stmt = db.prepare(
        'SELECT * FROM conversations WHERE character_id = ? AND deleted = 0 ORDER BY updated_at DESC'
    )
    return stmt.all(characterId) as Conversation[]
}

export function updateConversation(
    id: string,
    input: UpdateConversationInput
): Conversation | undefined {
    const db = getDatabase()
    const existing = getConversationById(id)
    if (!existing) return undefined

    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE conversations SET title = ?, updated_at = ?, sync_status = 0 WHERE id = ? AND deleted = 0
    `)
    stmt.run(input.title ?? existing.title, now, id)

    return getConversationById(id)
}

export function deleteConversation(id: string): boolean {
    const db = getDatabase()
    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE conversations SET deleted = 1, updated_at = ?, sync_status = 0 WHERE id = ? AND deleted = 0
    `)
    const result = stmt.run(now, id)
    return result.changes > 0
}

export function getUnsyncedConversations(): Conversation[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM conversations WHERE sync_status = 0')
    return stmt.all() as Conversation[]
}

export function markConversationSynced(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE conversations SET sync_status = 1 WHERE id = ?')
    stmt.run(id)
}
