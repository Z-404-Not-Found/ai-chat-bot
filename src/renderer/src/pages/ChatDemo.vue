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
            <div v-if="configMessage" class="message" :class="configMessage.type">
                {{ configMessage.text }}
            </div>
        </div>

        <div class="chat-area">
            <div ref="messagesRef" class="messages">
                <div v-if="messages.length === 0 && !streamingContent" class="placeholder">
                    Start a conversation...
                </div>
                <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.role">
                    <div class="message-role">{{ msg.role === 'user' ? 'You' : 'AI' }}</div>
                    <div class="message-content">{{ msg.content }}</div>
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
}

const apiKey = ref('')
const baseURL = ref('')
const inputText = ref('')
const messages = ref<Message[]>([])
const streamingContent = ref('')
const streaming = ref(false)
const error = ref('')
const saving = ref(false)
const configMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const currentRequestId = ref<string | null>(null)
const messagesRef = ref<HTMLElement | null>(null)

let removeChunkListener: (() => void) | null = null
let removeEndListener: (() => void) | null = null

onMounted(() => {
    removeChunkListener = window.api.onStreamChunk((chunk) => {
        streamingContent.value += chunk
        scrollToBottom()
    })

    removeEndListener = window.api.onStreamEnd((err) => {
        if (err) {
            error.value = err
        } else if (streamingContent.value) {
            messages.value.push({
                role: 'assistant',
                content: streamingContent.value
            })
        }
        streaming.value = false
        streamingContent.value = ''
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
        await window.api.setApiKey(apiKey.value.trim())
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
        await window.api.setBaseURL(baseURL.value.trim())
        configMessage.value = { type: 'success', text: 'Base URL saved' }
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

    window.api.sendMessageStream(content)
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
</style>
