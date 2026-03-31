// IPC 通道定义 - main、preload 和 renderer 共享
// 遵循 Electron 最佳实践: domain:resource:action 模式

// IPC Invoke 通道 (renderer → main)
export const IPC_CHANNELS = {
    // AI 配置
    AI_CONFIG_SET: 'ai:config:set',
    AI_CONFIG_GET: 'ai:config:get',

    // AI 聊天
    AI_CHAT_CREATE: 'ai:chat:create',
    AI_CHAT_STREAM_START: 'ai:chat:stream-start',
    AI_STREAM_CANCEL: 'ai:stream:cancel'
} as const

// IPC Send 通道 (main → renderer 通过 webContents.send)
export const IPC_SEND = {
    STREAM_CHUNK: 'ai:stream:chunk',
    STREAM_END: 'ai:stream:end'
} as const

// AI 配置数据类型（SET 和 GET 共用）
// SET 时所有字段可选（支持部分更新），GET 时返回完整数据
export interface AIConfig {
    apiKey?: string
    baseURL?: string
    model?: string
    thinkingMode?: boolean
}
