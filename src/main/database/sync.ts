import { getDatabase } from './index'
import type {
    Character,
    Conversation,
    Message,
    SyncPullData,
    SyncUploadSummary
} from '../../shared/types'

export interface UnsyncedBundle {
    characters: Character[]
    conversations: Conversation[]
    messages: Message[]
}

export function getUnsyncedBundle(): UnsyncedBundle {
    const db = getDatabase()
    const characters = db
        .prepare('SELECT * FROM characters WHERE sync_status = 0')
        .all() as Character[]
    const conversations = db
        .prepare('SELECT * FROM conversations WHERE sync_status = 0')
        .all() as Conversation[]
    const messages = db.prepare('SELECT * FROM messages WHERE sync_status = 0').all() as Message[]

    return {
        characters,
        conversations,
        messages
    }
}

function buildInClause(ids: string[]): string {
    return ids.map(() => '?').join(', ')
}

export function markUploadedAsSynced(bundle: UnsyncedBundle): void {
    const db = getDatabase()
    const markTx = db.transaction((payload: UnsyncedBundle) => {
        const characterIds = payload.characters.map((item) => item.id)
        const conversationIds = payload.conversations.map((item) => item.id)
        const messageIds = payload.messages.map((item) => item.id)

        if (characterIds.length > 0) {
            db.prepare(
                `UPDATE characters SET sync_status = 1 WHERE id IN (${buildInClause(characterIds)})`
            ).run(...characterIds)
        }
        if (conversationIds.length > 0) {
            db.prepare(
                `UPDATE conversations SET sync_status = 1 WHERE id IN (${buildInClause(conversationIds)})`
            ).run(...conversationIds)
        }
        if (messageIds.length > 0) {
            db.prepare(
                `UPDATE messages SET sync_status = 1 WHERE id IN (${buildInClause(messageIds)})`
            ).run(...messageIds)
        }
    })

    markTx(bundle)
}

export function applyPullData(data: SyncPullData): void {
    const db = getDatabase()

    const upsertCharacterStmt = db.prepare(`
        INSERT INTO characters (id, name, description, system_prompt, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            system_prompt = excluded.system_prompt,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            deleted = excluded.deleted,
            sync_status = 1
        WHERE excluded.updated_at > characters.updated_at
    `)

    const upsertConversationStmt = db.prepare(`
        INSERT INTO conversations (id, character_id, title, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
            character_id = excluded.character_id,
            title = excluded.title,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            deleted = excluded.deleted,
            sync_status = 1
        WHERE excluded.updated_at > conversations.updated_at
    `)

    const upsertMessageStmt = db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, model, thinking, created_at, updated_at, deleted, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
            conversation_id = excluded.conversation_id,
            role = excluded.role,
            content = excluded.content,
            model = excluded.model,
            thinking = excluded.thinking,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            deleted = excluded.deleted,
            sync_status = 1
        WHERE excluded.updated_at > messages.updated_at
    `)

    const tx = db.transaction((payload: SyncPullData) => {
        for (const item of payload.characters) {
            upsertCharacterStmt.run(
                item.id,
                item.name,
                item.description ?? null,
                item.system_prompt,
                item.created_at,
                item.updated_at,
                item.deleted
            )
        }

        for (const item of payload.conversations) {
            upsertConversationStmt.run(
                item.id,
                item.character_id,
                item.title,
                item.created_at,
                item.updated_at,
                item.deleted
            )
        }

        for (const item of payload.messages) {
            upsertMessageStmt.run(
                item.id,
                item.conversation_id,
                item.role,
                item.content,
                item.model ?? null,
                item.thinking ?? null,
                item.created_at,
                item.updated_at,
                item.deleted
            )
        }
    })

    tx(data)
}

export function toUploadSummary(bundle: UnsyncedBundle): SyncUploadSummary['received'] {
    return {
        characters: bundle.characters.length,
        conversations: bundle.conversations.length,
        messages: bundle.messages.length
    }
}
