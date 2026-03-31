import OpenAI from 'openai'
import { getObject } from '../utils/userData'

// AI 配置键名（使用点号链式），需与 aiConfig.ts 保持一致
const AI_KEYS = {
    API_KEY: 'ai.apiKey',
    BASE_URL: 'ai.baseURL'
} as const

let openAIClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
    if (!openAIClient) {
        const apiKey = getObject<string>(AI_KEYS.API_KEY)
        const baseURL = getObject<string>(AI_KEYS.BASE_URL)

        if (!apiKey) {
            throw new Error('OpenAI API key not configured')
        }

        openAIClient = new OpenAI({
            apiKey,
            baseURL: baseURL || undefined
        })
    }
    return openAIClient
}

export function resetOpenAIClient(): void {
    openAIClient = null
}
