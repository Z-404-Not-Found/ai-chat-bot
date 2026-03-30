import OpenAI from 'openai'
import { getItem } from '../utils/userData'

let openAIClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
    if (!openAIClient) {
        const apiKey = getItem<string>('openaiApiKey')
        const baseURL = getItem<string>('openaiBaseURL')

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

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}
