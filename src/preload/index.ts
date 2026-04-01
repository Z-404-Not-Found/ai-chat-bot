import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, IPC_SEND } from '../shared/constants'
import type {
    AIConfig,
    Character,
    Conversation,
    Message,
    CreateCharacterInput,
    UpdateCharacterInput,
    CreateConversationInput,
    UpdateConversationInput,
    CreateMessageInput
} from '../shared/types'

// 允许调用的 IPC 通道白名单
const ALLOWED_INVOKE_CHANNELS = [
    IPC_CHANNELS.AI_CONFIG_SET,
    IPC_CHANNELS.AI_CONFIG_GET,
    IPC_CHANNELS.AI_CHAT_CREATE,
    IPC_CHANNELS.AI_CHAT_STREAM_START,
    IPC_CHANNELS.AI_STREAM_CANCEL,
    IPC_CHANNELS.CHARACTER_LIST,
    IPC_CHANNELS.CHARACTER_GET,
    IPC_CHANNELS.CHARACTER_CREATE,
    IPC_CHANNELS.CHARACTER_UPDATE,
    IPC_CHANNELS.CHARACTER_DELETE,
    IPC_CHANNELS.CONVERSATION_LIST,
    IPC_CHANNELS.CONVERSATION_GET,
    IPC_CHANNELS.CONVERSATION_CREATE,
    IPC_CHANNELS.CONVERSATION_UPDATE,
    IPC_CHANNELS.CONVERSATION_DELETE,
    IPC_CHANNELS.MESSAGE_LIST,
    IPC_CHANNELS.MESSAGE_CREATE,
    IPC_CHANNELS.MESSAGE_DELETE
] as const

// 允许接收的 IPC 通道白名单 (用于订阅)
const ALLOWED_RECEIVE_CHANNELS = [
    IPC_SEND.STREAM_START,
    IPC_SEND.STREAM_CHUNK,
    IPC_SEND.STREAM_END
] as const

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

    sendMessageStream: (conversationId: string, content: string): Promise<void> => {
        return ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT_STREAM_START, {
            conversationId,
            content
        }) as Promise<void>
    },

    cancelStream: (requestId: string): void => {
        if (!validateInvokeChannel(IPC_CHANNELS.AI_STREAM_CANCEL)) {
            return
        }
        ipcRenderer.invoke(IPC_CHANNELS.AI_STREAM_CANCEL, requestId)
    },

    onStreamStart: (callback: (requestId: string) => void): (() => void) => {
        const handler = (_: Electron.IpcRendererEvent, data: { requestId: string }): void => {
            callback(data.requestId)
        }
        if (validateReceiveChannel(IPC_SEND.STREAM_START)) {
            ipcRenderer.on(IPC_SEND.STREAM_START, handler)
        }
        return (): void => {
            if (validateReceiveChannel(IPC_SEND.STREAM_START)) {
                ipcRenderer.removeListener(IPC_SEND.STREAM_START, handler)
            }
        }
    },

    onStreamChunk: (
        callback: (chunk: string, type?: 'content' | 'reasoning') => void
    ): (() => void) => {
        const handler = (
            _: Electron.IpcRendererEvent,
            data: { content: string; type?: 'content' | 'reasoning' }
        ): void => {
            callback(data.content, data.type)
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
    },

    // Character 角色
    getCharacters: (): Promise<Character[]> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTER_LIST) as Promise<Character[]>
    },

    getCharacter: (id: string): Promise<Character | null> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTER_GET, id) as Promise<Character | null>
    },

    createCharacter: (input: CreateCharacterInput): Promise<Character> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTER_CREATE, input) as Promise<Character>
    },

    updateCharacter: (id: string, input: UpdateCharacterInput): Promise<Character | null> => {
        return ipcRenderer.invoke(
            IPC_CHANNELS.CHARACTER_UPDATE,
            id,
            input
        ) as Promise<Character | null>
    },

    deleteCharacter: (id: string): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTER_DELETE, id) as Promise<{
            success: boolean
        }>
    },

    // Conversation 对话
    getConversations: (characterId: string): Promise<Conversation[]> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION_LIST, characterId) as Promise<
            Conversation[]
        >
    },

    getConversation: (id: string): Promise<Conversation | null> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION_GET, id) as Promise<Conversation | null>
    },

    createConversation: (input: CreateConversationInput): Promise<Conversation> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION_CREATE, input) as Promise<Conversation>
    },

    updateConversation: (
        id: string,
        input: UpdateConversationInput
    ): Promise<Conversation | null> => {
        return ipcRenderer.invoke(
            IPC_CHANNELS.CONVERSATION_UPDATE,
            id,
            input
        ) as Promise<Conversation | null>
    },

    deleteConversation: (id: string): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION_DELETE, id) as Promise<{
            success: boolean
        }>
    },

    // Message 消息
    getMessages: (conversationId: string): Promise<Message[]> => {
        return ipcRenderer.invoke(IPC_CHANNELS.MESSAGE_LIST, conversationId) as Promise<Message[]>
    },

    createMessage: (input: CreateMessageInput): Promise<Message> => {
        return ipcRenderer.invoke(IPC_CHANNELS.MESSAGE_CREATE, input) as Promise<Message>
    },

    deleteMessage: (id: string): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke(IPC_CHANNELS.MESSAGE_DELETE, id) as Promise<{ success: boolean }>
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
