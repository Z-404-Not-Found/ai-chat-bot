import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, IPC_SEND, AIConfig } from '../shared/constants'

// 允许调用的 IPC 通道白名单
const ALLOWED_INVOKE_CHANNELS = [
    IPC_CHANNELS.AI_CONFIG_SET,
    IPC_CHANNELS.AI_CONFIG_GET,
    IPC_CHANNELS.AI_CHAT_CREATE,
    IPC_CHANNELS.AI_CHAT_STREAM_START,
    IPC_CHANNELS.AI_STREAM_CANCEL
] as const

// 允许接收的 IPC 通道白名单 (用于订阅)
const ALLOWED_RECEIVE_CHANNELS = [IPC_SEND.STREAM_CHUNK, IPC_SEND.STREAM_END] as const

type AllowedInvokeChannel = (typeof ALLOWED_INVOKE_CHANNELS)[number]
type AllowedReceiveChannel = (typeof ALLOWED_RECEIVE_CHANNELS)[number]

// 使用前验证通道
function validateInvokeChannel(channel: string): channel is AllowedInvokeChannel {
    return ALLOWED_INVOKE_CHANNELS.includes(channel as AllowedInvokeChannel)
}

function validateReceiveChannel(channel: string): channel is AllowedReceiveChannel {
    return ALLOWED_RECEIVE_CHANNELS.includes(channel as AllowedReceiveChannel)
}

const api = {
    setConfig: (data: AIConfig): Promise<void> => {
        if (!validateInvokeChannel(IPC_CHANNELS.AI_CONFIG_SET)) {
            return Promise.reject(new Error('无效的通道'))
        }
        return ipcRenderer.invoke(IPC_CHANNELS.AI_CONFIG_SET, data) as Promise<void>
    },

    getConfig: (): Promise<AIConfig> => {
        if (!validateInvokeChannel(IPC_CHANNELS.AI_CONFIG_GET)) {
            return Promise.reject(new Error('无效的通道'))
        }
        return ipcRenderer.invoke(IPC_CHANNELS.AI_CONFIG_GET) as Promise<AIConfig>
    },

    sendMessageStream: (content: string): void => {
        ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT_STREAM_START, [{ role: 'user', content }])
    },

    cancelStream: (requestId: string): void => {
        if (!validateInvokeChannel(IPC_CHANNELS.AI_STREAM_CANCEL)) {
            return
        }
        ipcRenderer.invoke(IPC_CHANNELS.AI_STREAM_CANCEL, requestId)
    },

    onStreamChunk: (callback: (chunk: string) => void): (() => void) => {
        const handler = (_: Electron.IpcRendererEvent, data: { content: string }): void => {
            callback(data.content)
        }
        if (validateReceiveChannel(IPC_SEND.STREAM_CHUNK)) {
            ipcRenderer.on(IPC_SEND.STREAM_CHUNK, handler)
        }
        return (): void => {
            if (validateReceiveChannel(IPC_SEND.STREAM_CHUNK)) {
                ipcRenderer.removeListener(IPC_SEND.STREAM_CHUNK, handler)
            }
        }
    },

    onStreamEnd: (callback: (error?: string) => void): (() => void) => {
        const handler = (_: Electron.IpcRendererEvent, data: { error?: string }): void => {
            callback(data.error)
        }
        if (validateReceiveChannel(IPC_SEND.STREAM_END)) {
            ipcRenderer.on(IPC_SEND.STREAM_END, handler)
        }
        return (): void => {
            if (validateReceiveChannel(IPC_SEND.STREAM_END)) {
                ipcRenderer.removeListener(IPC_SEND.STREAM_END, handler)
            }
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
    // @ts-ignore (在 dts 中定义)
    window.electron = electronAPI
    // @ts-ignore (在 dts 中定义)
    window.api = api
}
