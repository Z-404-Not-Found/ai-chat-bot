import { v4 as uuidv4 } from 'uuid'
import type {
    SyncAuthInput,
    SyncAuthResult,
    SyncPullData,
    SyncRunResult,
    SyncStatus,
    SyncUploadSummary
} from '../../shared/types'
import { getItem, getObject, removeObject, setItem, setObject } from '../utils/userData'
import logger from '../utils/logger'
import {
    applyPullData,
    getUnsyncedBundle,
    markUploadedAsSynced,
    toUploadSummary
} from '../database/sync'

const SYNC_BASE_URL = 'http://154.8.198.192:3002'

const SYNC_KEYS = {
    TOKEN: 'sync.token',
    USER_ID: 'sync.userId',
    USERNAME: 'sync.username',
    LAST_SINCE: 'sync.lastSince',
    LAST_SYNC_AT: 'sync.lastSyncAt'
} as const

interface BackendError {
    error?: {
        code?: string
        message?: string
    }
}

interface AuthSuccessResponse {
    token: string
    user: {
        id: string
        username: string
    }
}

function ensureDeviceId(): string {
    const exists = getItem<string>('device_id')
    if (exists) return exists
    const created = uuidv4()
    setItem('device_id', created)
    return created
}

function normalizeErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

async function readResponseJson<T>(response: Response): Promise<T> {
    try {
        return (await response.json()) as T
    } catch {
        return {} as T
    }
}

async function requestJson<T>(
    path: string,
    options: RequestInit & { token?: string }
): Promise<{ ok: true; data: T } | { ok: false; code?: string; message: string }> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined)
    }
    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`
    }

    try {
        const response = await fetch(`${SYNC_BASE_URL}${path}`, {
            method: options.method,
            headers,
            body: options.body
        })

        if (!response.ok) {
            const data = await readResponseJson<BackendError>(response)
            return {
                ok: false,
                code: data.error?.code,
                message: data.error?.message ?? `HTTP ${response.status}`
            }
        }

        return { ok: true, data: (await response.json()) as T }
    } catch (error) {
        logger.error('同步服务请求失败', error)
        return {
            ok: false,
            code: 'SYNC_SERVICE_UNAVAILABLE',
            message: `同步服务不可用（${SYNC_BASE_URL}）`
        }
    }
}

function saveAuth(token: string, userId: string, username: string): void {
    setObject(SYNC_KEYS.TOKEN, token)
    setObject(SYNC_KEYS.USER_ID, userId)
    setObject(SYNC_KEYS.USERNAME, username)
    setObject(SYNC_KEYS.LAST_SINCE, 0)
}

export async function syncRegister(input: SyncAuthInput): Promise<SyncAuthResult> {
    const result = await requestJson<AuthSuccessResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input)
    })
    if (!result.ok) {
        return {
            success: false,
            error: result.message,
            code: result.code
        }
    }

    saveAuth(result.data.token, result.data.user.id, result.data.user.username)
    return {
        success: true,
        user: result.data.user
    }
}

export async function syncLogin(input: SyncAuthInput): Promise<SyncAuthResult> {
    const result = await requestJson<AuthSuccessResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input)
    })
    if (!result.ok) {
        return {
            success: false,
            error: result.message,
            code: result.code
        }
    }

    saveAuth(result.data.token, result.data.user.id, result.data.user.username)
    return {
        success: true,
        user: result.data.user
    }
}

export function syncLogout(): { success: boolean } {
    removeObject(SYNC_KEYS.TOKEN)
    removeObject(SYNC_KEYS.USER_ID)
    removeObject(SYNC_KEYS.USERNAME)
    removeObject(SYNC_KEYS.LAST_SINCE)
    removeObject(SYNC_KEYS.LAST_SYNC_AT)
    return { success: true }
}

export function getSyncStatus(): SyncStatus {
    const token = getObject<string>(SYNC_KEYS.TOKEN)
    const username = getObject<string>(SYNC_KEYS.USERNAME)
    const lastSince = getObject<number>(SYNC_KEYS.LAST_SINCE) ?? 0
    const lastSyncAt = getObject<number>(SYNC_KEYS.LAST_SYNC_AT)

    return {
        loggedIn: Boolean(token && username),
        username: username ?? undefined,
        deviceId: ensureDeviceId(),
        lastSince,
        lastSyncAt: lastSyncAt ?? undefined
    }
}

interface UploadResponse extends SyncUploadSummary {}

export async function runSync(): Promise<SyncRunResult> {
    const token = getObject<string>(SYNC_KEYS.TOKEN)
    if (!token) {
        return {
            success: false,
            code: 'UNAUTHORIZED',
            error: '未登录，无法同步'
        }
    }

    const deviceId = ensureDeviceId()
    const since = getObject<number>(SYNC_KEYS.LAST_SINCE) ?? 0
    const unsynced = getUnsyncedBundle()
    const uploadReceived = toUploadSummary(unsynced)

    const uploadPayload = {
        device_id: deviceId,
        characters: unsynced.characters.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description ?? null,
            system_prompt: item.system_prompt,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted: item.deleted
        })),
        conversations: unsynced.conversations.map((item) => ({
            id: item.id,
            character_id: item.character_id,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted: item.deleted
        })),
        messages: unsynced.messages.map((item) => ({
            id: item.id,
            conversation_id: item.conversation_id,
            role: item.role,
            content: item.content,
            model: item.model ?? null,
            thinking: item.thinking ?? null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted: item.deleted
        }))
    }

    try {
        const uploadRes = await requestJson<UploadResponse>('/api/sync/upload', {
            method: 'POST',
            token,
            body: JSON.stringify(uploadPayload)
        })
        if (!uploadRes.ok) {
            return {
                success: false,
                code: uploadRes.code,
                error: uploadRes.message
            }
        }

        markUploadedAsSynced(unsynced)

        const pullRes = await requestJson<SyncPullData>(
            `/api/sync/pull?since=${since}&device_id=${encodeURIComponent(deviceId)}`,
            {
                method: 'GET',
                token
            }
        )

        if (!pullRes.ok) {
            return {
                success: false,
                code: pullRes.code,
                error: pullRes.message
            }
        }

        applyPullData(pullRes.data)
        setObject(SYNC_KEYS.LAST_SINCE, pullRes.data.next_since)
        setObject(SYNC_KEYS.LAST_SYNC_AT, Date.now())

        return {
            success: true,
            upload: {
                received: uploadReceived,
                applied: uploadRes.data.applied
            },
            pull: {
                characters: pullRes.data.characters.length,
                conversations: pullRes.data.conversations.length,
                messages: pullRes.data.messages.length
            },
            nextSince: pullRes.data.next_since,
            serverTime: pullRes.data.server_time
        }
    } catch (error) {
        logger.error('执行同步失败', error)
        return {
            success: false,
            code: 'SYNC_FAILED',
            error: normalizeErrorMessage(error)
        }
    }
}
