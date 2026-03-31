<template>
    <div class="container">
        <div class="config-panel">
            <div class="config-row">
                <label>API Key:</label>
                <input v-model="apiKey" type="password" placeholder="sk-..." class="input" />
                <button :disabled="saving" @click="saveApiKey">
                    {{ saving ? 'Saving...' : 'Save' }}
                </button>
            </div>
            <div class="config-row">
                <label>Base URL (optional):</label>
                <input
                    v-model="baseURL"
                    type="text"
                    placeholder="https://api.openai.com/v1"
                    class="input"
                />
                <button :disabled="saving" @click="saveBaseURL">
                    {{ saving ? 'Saving...' : 'Save' }}
                </button>
            </div>
            <div class="config-row">
                <label>Model:</label>
                <input
                    v-model="selectedModel"
                    type="text"
                    placeholder="e.g. gpt-4o-mini, o1"
                    class="input"
                />
                <button :disabled="saving" @click="saveModel">
                    {{ saving ? 'Saving...' : 'Save' }}
                </button>
            </div>
            <div class="config-row">
                <label>Thinking Mode:</label>
                <label class="checkbox-label">
                    <input v-model="thinkingMode" type="checkbox" class="checkbox" />
                    <span>Enable reasoning (for o1/o3 models)</span>
                </label>
            </div>
            <div v-if="configMessage" class="message" :class="configMessage.type">
                {{ configMessage.text }}
            </div>
        </div>

        <div class="chat-area">
            <div ref="messagesRef" class="messages">
                <div
                    v-if="messages.length === 0 && !streamingContent && !streamingReasoning"
                    class="placeholder"
                >
                    Start a conversation...
                </div>
                <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.role">
                    <div class="message-role">{{ msg.role === 'user' ? 'You' : 'AI' }}</div>
                    <!-- 有思考内容时分开显示 -->
                    <template v-if="msg.reasoning">
                        <div class="reasoning-section">
                            <div class="reasoning-header" @click="toggleReasoning(i)">
                                <span class="reasoning-icon">{{
                                    expandedReasoning === i ? '▼' : '▶'
                                }}</span>
                                <span>Thinking ({{ msg.reasoning.length }} chars)</span>
                            </div>
                            <div v-if="expandedReasoning === i" class="reasoning-content">
                                {{ msg.reasoning }}
                            </div>
                        </div>
                        <div class="message-content">{{ msg.content }}</div>
                    </template>
                    <template v-else>
                        <div class="message-content">{{ msg.content }}</div>
                    </template>
                </div>
                <!-- 流式输出显示 -->
                <div v-if="streamingReasoning" class="message-row assistant">
                    <div class="message-role">AI · Thinking</div>
                    <div class="reasoning-content">
                        {{ streamingReasoning }}<span class="streaming-dot">...</span>
                    </div>
                </div>
                <div v-if="streamingContent" class="message-row assistant">
                    <div class="message-role">AI</div>
                    <div class="message-content">
                        {{ streamingContent }}{{ streaming ? '...' : '' }}
                    </div>
                </div>
            </div>

            <div class="input-area">
                <textarea
                    v-model="inputText"
                    placeholder="Type a message..."
                    class="textarea"
                    :disabled="streaming"
                    @keydown.enter.exact.prevent="sendMessage"
                ></textarea>
                <button
                    :disabled="streaming ? false : !apiKey || !inputText.trim()"
                    class="send-btn"
                    @click="streaming ? stopStream() : sendMessage()"
                >
                    {{ streaming ? 'Stop' : 'Send' }}
                </button>
            </div>

            <div v-if="error" class="error">{{ error }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Message {
    role: 'user' | 'assistant'
    content: string
    reasoning?: string // 思考过程（o1/o3等模型）
}

const apiKey = ref('')
const baseURL = ref('')
const selectedModel = ref('gpt-4o-mini')
const thinkingMode = ref(false)
const inputText = ref('')
const messages = ref<Message[]>([])
const streamingContent = ref('')
const streamingReasoning = ref('') // 思考内容（流式）
const streaming = ref(false)
const expandedReasoning = ref<number | null>(null) // 当前展开的思考内容索引

function toggleReasoning(index: number): void {
    expandedReasoning.value = expandedReasoning.value === index ? null : index
}
const error = ref('')
const saving = ref(false)
const configMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const currentRequestId = ref<string | null>(null)
const messagesRef = ref<HTMLElement | null>(null)

let removeChunkListener: (() => void) | null = null
let removeEndListener: (() => void) | null = null

onMounted(async () => {
    // Load saved settings from userData
    try {
        const settings = await window.api.getConfig()
        baseURL.value = settings.baseURL ?? ''
        selectedModel.value = settings.model ?? 'gpt-4o-mini'
        thinkingMode.value = settings.thinkingMode ?? false
        // apiKey is not loaded back for security reasons - user must re-enter
    } catch (e) {
        console.error('Failed to load settings:', e)
    }

    removeChunkListener = window.api.onStreamChunk((chunk) => {
        if (thinkingMode.value) {
            // 思考模式：内容作为思考过程
            streamingReasoning.value += chunk
        } else {
            // 普通模式：内容直接作为回答
            streamingContent.value += chunk
        }
        scrollToBottom()
    })

    removeEndListener = window.api.onStreamEnd((err) => {
        if (err) {
            error.value = err
        } else {
            const finalContent = streamingContent.value
            const finalReasoning = streamingReasoning.value

            if (finalContent || finalReasoning) {
                messages.value.push({
                    role: 'assistant',
                    content: finalContent || finalReasoning,
                    reasoning: thinkingMode.value ? finalReasoning : undefined
                })
            }
        }
        streaming.value = false
        streamingContent.value = ''
        streamingReasoning.value = ''
        currentRequestId.value = null
        scrollToBottom()
    })
})

onUnmounted(() => {
    removeChunkListener?.()
    removeEndListener?.()
})

function scrollToBottom(): void {
    nextTick(() => {
        if (messagesRef.value) {
            messagesRef.value.scrollTop = messagesRef.value.scrollHeight
        }
    })
}

async function saveApiKey(): Promise<void> {
    if (!apiKey.value.trim()) return
    saving.value = true
    configMessage.value = null
    error.value = ''
    try {
        await window.api.setConfig({ apiKey: apiKey.value.trim() })
        configMessage.value = { type: 'success', text: 'API key saved' }
    } catch (e) {
        configMessage.value = { type: 'error', text: String(e) }
    } finally {
        saving.value = false
    }
}

async function saveBaseURL(): Promise<void> {
    saving.value = true
    configMessage.value = null
    error.value = ''
    try {
        await window.api.setConfig({ baseURL: baseURL.value.trim() })
        configMessage.value = { type: 'success', text: 'Base URL saved' }
    } catch (e) {
        configMessage.value = { type: 'error', text: String(e) }
    } finally {
        saving.value = false
    }
}

async function saveModel(): Promise<void> {
    saving.value = true
    configMessage.value = null
    error.value = ''
    try {
        await window.api.setConfig({ model: selectedModel.value, thinkingMode: thinkingMode.value })
        configMessage.value = { type: 'success', text: 'Model settings saved' }
    } catch (e) {
        configMessage.value = { type: 'error', text: String(e) }
    } finally {
        saving.value = false
    }
}

function sendMessage(): void {
    if (!inputText.value.trim() || streaming.value || !apiKey.value) return
    error.value = ''

    const content = inputText.value.trim()
    messages.value.push({ role: 'user', content })
    inputText.value = ''
    streaming.value = true
    streamingContent.value = ''
    currentRequestId.value = `stream_${Date.now()}`

    // window.api.sendMessageStream(content)
}

function stopStream(): void {
    if (currentRequestId.value) {
        window.api.cancelStream(currentRequestId.value)
    }
}
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    gap: 16px;
    box-sizing: border-box;
}

.config-panel {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.config-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.config-row:last-child {
    margin-bottom: 0;
}

.config-row label {
    width: 140px;
    font-size: 14px;
    color: #333;
}

.input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.select {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    background: white;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex: 1;
}

.checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.textarea {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    resize: none;
    min-height: 60px;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    font-size: 14px;
    cursor: pointer;
}

button:hover:not(:disabled) {
    background: #0056b3;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.send-btn {
    padding: 8px 24px;
}

.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #fafafa;
}

.placeholder {
    color: #999;
    text-align: center;
    padding: 32px;
}

.message-row {
    margin-bottom: 16px;
}

.message-role {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #666;
}

.user .message-role {
    color: #007bff;
}

.assistant .message-role {
    color: #28a745;
}

.message-content {
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.5;
}

.input-area {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #ddd;
    background: white;
}

.error {
    padding: 8px 12px;
    color: #dc3545;
    font-size: 14px;
    background: #f8d7da;
}

.message {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    margin-top: 8px;
}

.message.success {
    background: #d4edda;
    color: #155724;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
}

.reasoning-section {
    margin-bottom: 8px;
}

.reasoning-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #888;
    cursor: pointer;
    padding: 4px 0;
}

.reasoning-header:hover {
    color: #666;
}

.reasoning-icon {
    font-size: 10px;
}

.reasoning-content {
    background: #f0f0f0;
    border-left: 3px solid #888;
    padding: 8px 12px;
    margin: 4px 0;
    font-size: 13px;
    color: #555;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.5;
    max-height: 300px;
    overflow-y: auto;
}

.streaming-dot {
    animation: blink 1s infinite;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}
</style>
