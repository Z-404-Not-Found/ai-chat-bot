import { ElectronAPI } from '@electron-toolkit/preload'
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

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            // AI 配置
            setConfig: (data: AIConfig) => Promise<void>
            getConfig: () => Promise<AIConfig>

            // AI 聊天
            sendMessageStream: (conversationId: string, content: string) => void
            cancelStream: (requestId: string) => void
            onStreamChunk: (callback: (chunk: string) => void) => () => void
            onStreamEnd: (callback: (error?: string) => void) => () => void

            // Character 角色
            getCharacters: () => Promise<Character[]>
            getCharacter: (id: string) => Promise<Character | null>
            createCharacter: (input: CreateCharacterInput) => Promise<Character>
            updateCharacter: (id: string, input: UpdateCharacterInput) => Promise<Character | null>
            deleteCharacter: (id: string) => Promise<{ success: boolean }>

            // Conversation 对话
            getConversations: (characterId: string) => Promise<Conversation[]>
            getConversation: (id: string) => Promise<Conversation | null>
            createConversation: (input: CreateConversationInput) => Promise<Conversation>
            updateConversation: (
                id: string,
                input: UpdateConversationInput
            ) => Promise<Conversation | null>
            deleteConversation: (id: string) => Promise<{ success: boolean }>

            // Message 消息
            getMessages: (conversationId: string) => Promise<Message[]>
            createMessage: (input: CreateMessageInput) => Promise<Message>
            deleteMessage: (id: string) => Promise<{ success: boolean }>
        }
    }
}
