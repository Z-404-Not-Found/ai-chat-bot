import { ipcMain } from 'electron'
import {
    createConversation,
    getConversationById,
    getConversationsByCharacterId,
    updateConversation,
    deleteConversation
} from '../database/conversations'
import { IPC_CHANNELS } from '../../shared/constants'
import type { CreateConversationInput, UpdateConversationInput } from '../../shared/types'

export function registerConversationIpcHandlers(): void {
    // 获取某角色的所有对话
    ipcMain.handle(IPC_CHANNELS.CONVERSATION_LIST, async (_, characterId: string) => {
        return getConversationsByCharacterId(characterId)
    })

    // 获取单个对话
    ipcMain.handle(IPC_CHANNELS.CONVERSATION_GET, async (_, id: string) => {
        return getConversationById(id) ?? null
    })

    // 创建对话
    ipcMain.handle(IPC_CHANNELS.CONVERSATION_CREATE, async (_, input: CreateConversationInput) => {
        return createConversation(input)
    })

    // 更新对话
    ipcMain.handle(
        IPC_CHANNELS.CONVERSATION_UPDATE,
        async (_, id: string, input: UpdateConversationInput) => {
            return updateConversation(id, input) ?? null
        }
    )

    // 删除对话
    ipcMain.handle(IPC_CHANNELS.CONVERSATION_DELETE, async (_, id: string) => {
        const success = deleteConversation(id)
        return { success }
    })
}
