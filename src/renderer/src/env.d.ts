/// <reference types="vite/client" />

import type { AIConfig } from '@shared/constants'

// Chat API 接口 - 暴露给渲染进程
interface ChatAPI {
    setConfig(data: AIConfig): Promise<void>
    getConfig(): Promise<AIConfig>
    sendMessageStream(content: string): void
    cancelStream(requestId: string): void
    onStreamChunk(callback: (chunk: string) => void): () => void
    onStreamEnd(callback: (error?: string) => void): () => void
}

declare global {
    interface Window {
        api: ChatAPI
    }
}

export {}
