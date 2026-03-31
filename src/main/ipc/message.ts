import { ipcMain } from 'electron'
import { createMessage, getMessagesByConversationId, deleteMessage } from '../database/messages'
import { IPC_CHANNELS } from '../../shared/constants'
import type { CreateMessageInput } from '../../shared/types'

export function registerMessageIpcHandlers(): void {
    // 获取某对话的所有消息
    ipcMain.handle(IPC_CHANNELS.MESSAGE_LIST, async (_, conversationId: string) => {
        return getMessagesByConversationId(conversationId)
    })

    // 创建消息
    ipcMain.handle(IPC_CHANNELS.MESSAGE_CREATE, async (_, input: CreateMessageInput) => {
        return createMessage(input)
    })

    // 删除消息
    ipcMain.handle(IPC_CHANNELS.MESSAGE_DELETE, async (_, id: string) => {
        const success = deleteMessage(id)
        return { success }
    })
}
