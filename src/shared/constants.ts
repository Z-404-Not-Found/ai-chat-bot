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
    AI_STREAM_CANCEL: 'ai:stream:cancel',

    // Character 角色
    CHARACTER_LIST: 'character:list',
    CHARACTER_GET: 'character:get',
    CHARACTER_CREATE: 'character:create',
    CHARACTER_UPDATE: 'character:update',
    CHARACTER_DELETE: 'character:delete',

    // Conversation 对话
    CONVERSATION_LIST: 'conversation:list',
    CONVERSATION_GET: 'conversation:get',
    CONVERSATION_CREATE: 'conversation:create',
    CONVERSATION_UPDATE: 'conversation:update',
    CONVERSATION_DELETE: 'conversation:delete',

    // Message 消息
    MESSAGE_LIST: 'message:list',
    MESSAGE_CREATE: 'message:create',
    MESSAGE_DELETE: 'message:delete',

    // Sync 同步
    SYNC_AUTH_REGISTER: 'sync:auth:register',
    SYNC_AUTH_LOGIN: 'sync:auth:login',
    SYNC_AUTH_LOGOUT: 'sync:auth:logout',
    SYNC_STATUS_GET: 'sync:status:get',
    SYNC_RUN: 'sync:run',

    // Window 窗口控制
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_CLOSE: 'window:close',
    WINDOW_IS_MAXIMIZED: 'window:is-maximized',
    WINDOW_GET_PLATFORM: 'window:get-platform'
} as const

// IPC Send 通道 (main → renderer 通过 webContents.send)
export const IPC_SEND = {
    STREAM_START: 'ai:stream:start',
    STREAM_CHUNK: 'ai:stream:chunk',
    STREAM_END: 'ai:stream:end'
} as const

// AI 配置数据类型（SET 和 GET 共用）
// SET 时所有字段可选（支持部分更新），GET 时返回完整数据
