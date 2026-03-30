import { ipcMain, BrowserWindow } from 'electron'
import { setItem } from '../utils/userData'
import { getOpenAIClient, resetOpenAIClient, ChatMessage } from '../services/openai'
import logger from '../utils/logger'
import { CHANNELS } from './index'

// Store active streams by requestId for cancellation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeStreams = new Map<string, any>()

export function registerChatIpcHandlers(): void {
    ipcMain.handle(CHANNELS.OPENAI_SET_KEY, async (_, apiKey: string) => {
        try {
            setItem('openaiApiKey', apiKey)
            resetOpenAIClient()
            logger.info('OpenAI API key saved')
            return { success: true }
        } catch (error) {
            logger.error('Failed to save API key', error)
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle(CHANNELS.OPENAI_SET_BASE_URL, async (_, baseURL: string) => {
        try {
            setItem('openaiBaseURL', baseURL)
            resetOpenAIClient()
            logger.info('OpenAI base URL saved:', baseURL)
            return { success: true }
        } catch (error) {
            logger.error('Failed to save base URL', error)
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle(CHANNELS.OPENAI_CHAT, async (_, messages: ChatMessage[]) => {
        try {
            const client = getOpenAIClient()
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages
            })
            const content = response.choices[0]?.message?.content || ''
            return { success: true, content }
        } catch (error) {
            logger.error('Chat completion failed', error)
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle(CHANNELS.OPENAI_CHAT_STREAM, async (event, messages: ChatMessage[]) => {
        const requestId = `stream_${Date.now()}`

        try {
            const client = getOpenAIClient()
            const stream = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                stream: true
            })

            const win = BrowserWindow.fromWebContents(event.sender)

            // Store stream for potential cancellation
            activeStreams.set(requestId, stream)

            for await (const chunk of stream) {
                // Check if stream was cancelled
                if (!activeStreams.has(requestId)) break

                const content = chunk.choices[0]?.delta?.content
                if (content && win && !win.isDestroyed()) {
                    win.webContents.send(CHANNELS.STREAM_CHUNK, { content, requestId })
                }
            }

            if (win && !win.isDestroyed()) {
                win.webContents.send(CHANNELS.STREAM_END, { requestId })
            }
        } catch (error) {
            // Ignore abort errors from cancelled streams
            if (error instanceof Error && error.name === 'AbortError') {
                logger.info('Stream aborted by user:', requestId)
            } else {
                logger.error('Streaming chat failed', error)
                const win = BrowserWindow.fromWebContents(event.sender)
                if (win && !win.isDestroyed()) {
                    win.webContents.send(CHANNELS.STREAM_END, {
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

    ipcMain.handle(CHANNELS.OPENAI_CANCEL, async (_, requestId: string) => {
        const stream = activeStreams.get(requestId)
        if (stream) {
            stream.controller.abort()
            activeStreams.delete(requestId)
            logger.info('Stream cancelled:', requestId)
        }
        return { cancelled: true }
    })
}
