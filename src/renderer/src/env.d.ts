/// <reference types="vite/client" />

interface ChatAPI {
    setApiKey(key: string): Promise<void>
    setBaseURL(url: string): Promise<void>
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
