import { ipcMain } from 'electron'
import { setObject, getObject } from '../utils/userData'
import { resetOpenAIClient } from '../services/openai'
import logger from '../utils/logger'
import { IPC_CHANNELS } from '../../shared/constants'
import type { AIConfig } from '../../shared/types'

// AI 配置键名（使用点号链式）
const AI_KEYS = {
    API_KEY: 'ai.apiKey',
    BASE_URL: 'ai.baseURL',
    MODEL: 'ai.model',
    THINKING_MODE: 'ai.thinkingMode',
    CONTEXT_COUNT: 'ai.contextCount'
} as const

// 默认设置
const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_THINKING = false
const DEFAULT_CONTEXT_COUNT = 10

export function registerConfigIpcHandlers(): void {
    // 设置 AI 配置
    ipcMain.handle(IPC_CHANNELS.AI_CONFIG_SET, async (_, data: AIConfig) => {
        try {
            if (data.apiKey !== undefined) {
                setObject(AI_KEYS.API_KEY, data.apiKey)
                resetOpenAIClient()
                logger.info('AI API 密钥已保存')
            }
            if (data.baseURL !== undefined) {
                setObject(AI_KEYS.BASE_URL, data.baseURL)
                resetOpenAIClient()
                logger.info('AI Base URL 已保存:', data.baseURL)
            }
            if (data.model !== undefined) {
                setObject(AI_KEYS.MODEL, data.model)
                logger.info('AI 模型已保存:', data.model)
            }
            if (data.thinkingMode !== undefined) {
                setObject(AI_KEYS.THINKING_MODE, data.thinkingMode)
                logger.info('AI 思考模式已保存:', data.thinkingMode)
            }
            if (data.contextCount !== undefined) {
                setObject(AI_KEYS.CONTEXT_COUNT, data.contextCount)
                logger.info('AI 上下文消息条数已保存:', data.contextCount)
            }
            return { success: true }
        } catch (error) {
            logger.error('保存 AI 配置失败', error)
            return { success: false, error: String(error) }
        }
    })

    // 获取配置
    ipcMain.handle(IPC_CHANNELS.AI_CONFIG_GET, async () => {
        const config: AIConfig = {
            baseURL: getObject<string>(AI_KEYS.BASE_URL),
            model: getObject<string>(AI_KEYS.MODEL) || DEFAULT_MODEL,
            thinkingMode: getObject<boolean>(AI_KEYS.THINKING_MODE) ?? DEFAULT_THINKING,
            contextCount: getObject<number>(AI_KEYS.CONTEXT_COUNT) ?? DEFAULT_CONTEXT_COUNT
        }
        return config
    })
}

// 导出配置键名和默认值，供其他模块使用
export { AI_KEYS, DEFAULT_MODEL, DEFAULT_THINKING, DEFAULT_CONTEXT_COUNT }
