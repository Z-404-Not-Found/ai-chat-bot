import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
    setApiKey: (key: string): Promise<void> => {
        return ipcRenderer.invoke('openai:setApiKey', key) as Promise<void>
    },

    setBaseURL: (url: string): Promise<void> => {
        return ipcRenderer.invoke('openai:setBaseURL', url) as Promise<void>
    },

    sendMessageStream: (content: string): void => {
        ipcRenderer.invoke('openai:chatStream', [{ role: 'user', content }])
    },

    cancelStream: (requestId: string): void => {
        ipcRenderer.invoke('openai:cancelStream', requestId)
    },

    onStreamChunk: (callback: (chunk: string) => void): (() => void) => {
        const handler = (_: Electron.IpcRendererEvent, data: { content: string }): void => {
            callback(data.content)
        }
        ipcRenderer.on('chat-stream-chunk', handler)
        return (): void => {
            ipcRenderer.removeListener('chat-stream-chunk', handler)
        }
    },

    onStreamEnd: (callback: (error?: string) => void): (() => void) => {
        const handler = (_: Electron.IpcRendererEvent, data: { error?: string }): void => {
            callback(data.error)
        }
        ipcRenderer.on('chat-stream-end', handler)
        return (): void => {
            ipcRenderer.removeListener('chat-stream-end', handler)
        }
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
