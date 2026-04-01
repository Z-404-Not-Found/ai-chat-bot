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

    // 初始化设备 ID
    let deviceId = getItem<string>('device_id')
    if (!deviceId) {
        deviceId = uuidv4()
        setItem('device_id', deviceId)
    }

    // 打开数据库
    db = new Database(DB_PATH)

    // 启用外键约束
    db.pragma('foreign_keys = ON')

    // 创建数据表
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
