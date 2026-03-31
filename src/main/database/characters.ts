import { getDatabase, generateId } from './index'

export interface Character {
    id: string
    name: string
    description?: string
    system_prompt: string
    created_at: number
    updated_at: number
    deleted: number
    sync_status: number
}

export interface CreateCharacterInput {
    name: string
    description?: string
    system_prompt: string
}

export interface UpdateCharacterInput {
    name?: string
    description?: string
    system_prompt?: string
}

export function createCharacter(input: CreateCharacterInput): Character {
    const db = getDatabase()
    const now = Date.now()
    const id = generateId()

    const stmt = db.prepare(`
        INSERT INTO characters (id, name, description, system_prompt, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0)
    `)
    stmt.run(id, input.name, input.description ?? null, input.system_prompt, now, now)

    return {
        id,
        name: input.name,
        description: input.description,
        system_prompt: input.system_prompt,
        created_at: now,
        updated_at: now,
        deleted: 0,
        sync_status: 0
    }
}

export function getCharacterById(id: string): Character | undefined {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM characters WHERE id = ? AND deleted = 0')
    return stmt.get(id) as Character | undefined
}

export function getAllCharacters(): Character[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM characters WHERE deleted = 0 ORDER BY updated_at DESC')
    return stmt.all() as Character[]
}

export function updateCharacter(id: string, input: UpdateCharacterInput): Character | undefined {
    const db = getDatabase()
    const existing = getCharacterById(id)
    if (!existing) return undefined

    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE characters
        SET name = ?, description = ?, system_prompt = ?, updated_at = ?, sync_status = 0
        WHERE id = ? AND deleted = 0
    `)
    stmt.run(
        input.name ?? existing.name,
        input.description ?? existing.description,
        input.system_prompt ?? existing.system_prompt,
        now,
        id
    )

    return getCharacterById(id)
}

export function deleteCharacter(id: string): boolean {
    const db = getDatabase()
    const now = Date.now()
    const stmt = db.prepare(`
        UPDATE characters SET deleted = 1, updated_at = ?, sync_status = 0 WHERE id = ? AND deleted = 0
    `)
    const result = stmt.run(now, id)
    return result.changes > 0
}

export function getUnsyncedCharacters(): Character[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM characters WHERE sync_status = 0')
    return stmt.all() as Character[]
}

export function markCharacterSynced(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE characters SET sync_status = 1 WHERE id = ?')
    stmt.run(id)
}
