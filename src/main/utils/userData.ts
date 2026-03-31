import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

const USER_DIR = join(app.getPath('userData'), 'user')
const USER_DATA_FILE = join(USER_DIR, 'userData.json')

function ensureUserDir(): void {
    if (!existsSync(USER_DIR)) {
        mkdirSync(USER_DIR, { recursive: true })
    }
}

function readData(): Record<string, unknown> {
    ensureUserDir()
    if (!existsSync(USER_DATA_FILE)) {
        return {}
    }
    try {
        const content = readFileSync(USER_DATA_FILE, 'utf-8')
        return JSON.parse(content)
    } catch {
        return {}
    }
}

function writeData(data: Record<string, unknown>): void {
    ensureUserDir()
    writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function setItem<T>(key: string, value: T): void {
    const data = readData()
    data[key] = value
    writeData(data)
}

export function getItem<T>(key: string, defaultValue?: T): T | undefined {
    const data = readData()
    if (Object.prototype.hasOwnProperty.call(data, key)) {
        return data[key] as T
    }
    return defaultValue
}

export function removeItem(key: string): void {
    const data = readData()
    delete data[key]
    writeData(data)
}

export function clear(): void {
    writeData({})
}

export function initUserData(): void {
    ensureUserDir()
    if (!existsSync(USER_DATA_FILE)) {
        writeData({})
    }
}

// 嵌套对象操作：使用点号链式操作，如 'ai.model'
export function getObject<T>(key: string, defaultValue?: T): T | undefined {
    const data = readData()
    const keys = key.split('.')
    let current: unknown = data

    for (const k of keys) {
        if (
            current &&
            typeof current === 'object' &&
            Object.prototype.hasOwnProperty.call(current, k)
        ) {
            current = (current as Record<string, unknown>)[k]
        } else {
            return defaultValue
        }
    }
    return current as T
}

// 嵌套对象操作：使用点号链式操作，如 'ai.model'
export function setObject<T>(key: string, value: T): void {
    const data = readData()
    const keys = key.split('.')
    let current: Record<string, unknown> = data

    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]
        if (!Object.prototype.hasOwnProperty.call(current, k) || typeof current[k] !== 'object') {
            current[k] = {}
        }
        current = current[k] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
    writeData(data)
}

// 嵌套对象操作：使用点号链式操作，如 'ai.model'
export function removeObject(key: string): void {
    const data = readData()
    const keys = key.split('.')
    let current: Record<string, unknown> = data

    for (let i = 0; i < keys.length - 1; i++) {
        if (!Object.prototype.hasOwnProperty.call(current, keys[i])) {
            return
        }
        current = current[keys[i]] as Record<string, unknown>
    }

    delete current[keys[keys.length - 1]]
    writeData(data)
}
