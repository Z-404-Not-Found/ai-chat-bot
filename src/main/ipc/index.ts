// IPC Channel definitions - shared across main and preload
export const CHANNELS = {
    // OpenAI / Chat
    OPENAI_SET_KEY: 'openai:setApiKey',
    OPENAI_SET_BASE_URL: 'openai:setBaseURL',
    OPENAI_CHAT: 'openai:chat',
    OPENAI_CHAT_STREAM: 'openai:chatStream',
    OPENAI_CANCEL: 'openai:cancelStream',
    STREAM_CHUNK: 'chat-stream-chunk',
    STREAM_END: 'chat-stream-end'
} as const

import { registerChatIpcHandlers } from './chat'

export function registerIpcHandlers(): void {
    registerChatIpcHandlers()
}
