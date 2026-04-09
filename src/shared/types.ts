// Character 角色
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

// Conversation 对话
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

// Message 消息
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

// AI 消息格式（用于 IPC 通信）
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

// AI 配置数据类型（SET 和 GET 共用）
// SET 时所有字段可选（支持部分更新），GET 时返回完整数据
export interface AIConfig {
    apiKey?: string
    apiKeyConfigured?: boolean
    baseURL?: string
    model?: string
    thinkingMode?: boolean
    contextCount?: number
}

// 聊天请求类型（带上下文记忆）
export interface ChatRequest {
    conversationId: string
    content: string
}

// IPC 流式事件数据
export interface StreamChunkData {
    content: string
    type?: 'content' | 'reasoning'
    requestId?: string
}

export interface StreamEndData {
    requestId?: string
    error?: string
}

export interface SyncAuthInput {
    username: string
    password: string
}

export interface SyncAuthUser {
    id: string
    username: string
}

export interface SyncAuthResult {
    success: boolean
    user?: SyncAuthUser
    error?: string
    code?: string
}

export interface SyncStatus {
    loggedIn: boolean
    username?: string
    deviceId: string
    lastSince: number
    lastSyncAt?: number
}

export interface SyncUploadSummary {
    received: {
        characters: number
        conversations: number
        messages: number
    }
    applied: {
        characters: number
        conversations: number
        messages: number
    }
}

export interface SyncPullData {
    server_time: number
    next_since: number
    characters: Omit<Character, 'sync_status'>[]
    conversations: Omit<Conversation, 'sync_status'>[]
    messages: Omit<Message, 'sync_status'>[]
}

export interface SyncRunResult {
    success: boolean
    upload?: SyncUploadSummary
    pull?: {
        characters: number
        conversations: number
        messages: number
    }
    nextSince?: number
    serverTime?: number
    error?: string
    code?: string
}
