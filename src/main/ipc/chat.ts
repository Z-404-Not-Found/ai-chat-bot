import { ipcMain, BrowserWindow } from 'electron'
import { getObject } from '../utils/userData'
import { getOpenAIClient, ChatMessage } from '../services/openai'
import logger from '../utils/logger'
import { IPC_CHANNELS, IPC_SEND } from '../../shared/constants'
import { AI_KEYS, DEFAULT_MODEL, DEFAULT_THINKING } from './aiConfig'

// 存储活动中的流，用于取消请求
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeStreams = new Map<string, any>()

export function registerChatIpcHandlers(): void {
    // 非流式聊天
    ipcMain.handle(IPC_CHANNELS.AI_CHAT_CREATE, async (_, messages: ChatMessage[]) => {
        try {
            const client = getOpenAIClient()
            const model = getObject<string>(AI_KEYS.MODEL) || DEFAULT_MODEL
            const thinkingMode = getObject<boolean>(AI_KEYS.THINKING_MODE) ?? DEFAULT_THINKING

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = { model, messages }

            // 思考模式参数由各厂商自行处理
            if (thinkingMode !== undefined) {
                params.thinking = thinkingMode ? { type: 'enabled' } : { type: 'disabled' }
            }

            const response = await client.chat.completions.create(params)
            const content = response.choices[0]?.message?.content || ''
            return { success: true, content }
        } catch (error) {
            logger.error('聊天补全失败', error)
            return { success: false, error: String(error) }
        }
    })

    // 流式聊天
    ipcMain.handle(IPC_CHANNELS.AI_CHAT_STREAM_START, async (event, messages: ChatMessage[]) => {
        const requestId = `stream_${Date.now()}`

        try {
            const client = getOpenAIClient()
            const model = getObject<string>(AI_KEYS.MODEL) || DEFAULT_MODEL
            const thinkingMode = getObject<boolean>(AI_KEYS.THINKING_MODE) ?? DEFAULT_THINKING

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = { model, messages, stream: true }

            // 思考模式参数由各厂商自行处理
            if (thinkingMode !== undefined) {
                params.thinking = thinkingMode ? { type: 'enabled' } : { type: 'disabled' }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stream = (await client.chat.completions.create(params)) as any

            // 存储流以便后续取消
            activeStreams.set(requestId, stream)

            for await (const chunk of stream) {
                // 检查流是否已被取消
                if (!activeStreams.has(requestId)) break

                const winRef = BrowserWindow.fromWebContents(event.sender)
                if (!winRef || winRef.isDestroyed()) break

                // 发送内容块
                const content = chunk.choices[0]?.delta?.content
                if (content) {
                    winRef.webContents.send(IPC_SEND.STREAM_CHUNK, { content, requestId })
                }

                // 如果存在推理内容则发送
                const reasoningContent = chunk.choices[0]?.delta?.reasoning_content
                if (reasoningContent) {
                    winRef.webContents.send(IPC_SEND.STREAM_CHUNK, {
                        content: reasoningContent,
                        requestId
                    })
                }
            }

            const finalWin = BrowserWindow.fromWebContents(event.sender)
            if (finalWin && !finalWin.isDestroyed()) {
                finalWin.webContents.send(IPC_SEND.STREAM_END, { requestId })
            }
        } catch (error) {
            // 忽略已取消流的中止错误
            if (error instanceof Error && error.name === 'AbortError') {
                logger.info('流被用户中止:', requestId)
            } else {
                logger.error('流式聊天失败', error)
                const win = BrowserWindow.fromWebContents(event.sender)
                if (win && !win.isDestroyed()) {
                    win.webContents.send(IPC_SEND.STREAM_END, {
                        requestId,
                        error: String(error)
                    })
                }
            }
        } finally {
            activeStreams.delete(requestId)
        }

        return { started: true, requestId }
    })

    // 取消流
    ipcMain.handle(IPC_CHANNELS.AI_STREAM_CANCEL, async (_, requestId: string) => {
        const stream = activeStreams.get(requestId)
        if (stream) {
            stream.controller.abort()
            activeStreams.delete(requestId)
            logger.info('流已取消:', requestId)
        }
        return { cancelled: true }
    })
}
