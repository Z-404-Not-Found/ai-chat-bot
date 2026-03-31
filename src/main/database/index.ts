import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { getItem, setItem } from '../utils/userData'
import {
    CREATE_CHARACTERS_TABLE,
    CREATE_CONVERSATIONS_TABLE,
    CREATE_MESSAGES_TABLE,
    CREATE_INDEXES
} from './schema'

const USER_DIR = join(app.getPath('userData'), 'user')
const DB_PATH = join(USER_DIR, 'chat.db')

let db: Database.Database | null = null

function ensureUserDir(): void {
    if (!existsSync(USER_DIR)) {
        mkdirSync(USER_DIR, { recursive: true })
    }
}

export function getDatabase(): Database.Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.')
    }
    return db
}

export function initDatabase(): void {
    ensureUserDir()

    // Initialize device_id
    let deviceId = getItem<string>('device_id')
    if (!deviceId) {
        deviceId = uuidv4()
        setItem('device_id', deviceId)
    }

    // Open database
    db = new Database(DB_PATH)

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Create tables
    db.exec(CREATE_CHARACTERS_TABLE)
    db.exec(CREATE_CONVERSATIONS_TABLE)
    db.exec(CREATE_MESSAGES_TABLE)
    db.exec(CREATE_INDEXES)
}

export function closeDatabase(): void {
    if (db) {
        db.close()
        db = null
    }
}

export { uuidv4 as generateId }
