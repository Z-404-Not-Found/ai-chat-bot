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
