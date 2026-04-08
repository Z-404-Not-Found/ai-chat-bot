<template>
    <div class="h-full w-full flex p-panel gap-2">
        <aside
            class="w-56 h-full hidden lg:block border-r border-surface-200 dark:border-surface-700 pr-2"
        >
            <div class="w-full h-full flex flex-col py-1 px-2">
                <div
                    class="w-full h-12 flex justify-between items-center text-xl mb-2 mx-1 font-semibold"
                >
                    角色
                    <Button
                        icon="pi pi-plus"
                        class="w-10"
                        severity="contrast"
                        variant="text"
                        @click="showAddRole"
                    />
                </div>

                <div class="mb-3 mx-1">
                    <InputGroup>
                        <InputText
                            v-model="searchRoleName"
                            placeholder="搜索角色"
                            @update:model-value="onSearchRole"
                        />
                        <InputGroupAddon>
                            <Button
                                icon="pi pi-search"
                                severity="secondary"
                                @click="onSearchRole"
                            />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div class="flex-1 overflow-y-auto scroll-transparent flex flex-col gap-2 pr-1">
                    <div
                        v-if="loadingRoles"
                        class="rounded-border border border-surface-200 dark:border-surface-700 p-3 text-sm text-muted-color"
                    >
                        正在加载角色...
                    </div>

                    <div
                        v-else-if="filteredRoleList.length === 0"
                        class="rounded-border border border-surface-200 dark:border-surface-700 p-3 text-sm text-muted-color"
                    >
                        {{ searchRoleName ? '未找到匹配角色' : '暂无角色，点击右上角添加' }}
                    </div>

                    <div
                        v-for="item in filteredRoleList"
                        :key="item.id"
                        :class="[
                            'w-full flex flex-col cursor-pointer rounded-border p-2 transition-motion border',
                            activeRole?.id === item.id
                                ? 'bg-emphasis border-emphasis'
                                : 'border-surface-200 dark:border-surface-700'
                        ]"
                        @click="changeRole(item.id)"
                    >
                        <div class="flex justify-between gap-2">
                            <div class="flex-1 min-w-0 single-line font-semibold">
                                {{ item.name }}
                            </div>
                            <div class="text-xs shrink-0 text-muted-color">
                                {{ formatTime(item.updated_at) }}
                            </div>
                        </div>
                        <div class="single-line text-sm mt-1 text-muted-color">
                            {{ item.description || '暂无描述' }}
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <section class="flex-1 min-w-0 h-full flex flex-col">
            <div
                class="w-full p-3 border-b border-surface-200 dark:border-surface-700 flex justify-between"
            >
                <div class="flex flex-col w-full gap-2">
                    <div class="flex justify-between items-center text-xl font-semibold">
                        <span>{{ activeRole?.name || '请选择角色' }}</span>
                        <div class="flex items-center gap-2">
                            <Button
                                icon="pi pi-user-edit"
                                severity="contrast"
                                variant="text"
                                :disabled="!activeRole"
                                @click="showEditRole(activeRole?.id || '')"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                variant="text"
                                :disabled="!activeRole"
                                @click="showDeleteRole(activeRole?.id || '')"
                            />
                        </div>
                    </div>
                    <div class="text-sm text-muted-color">
                        {{ activeRole?.description || '请先创建或选择一个角色开始聊天' }}
                    </div>
                </div>
            </div>

            <div
                ref="chatContentRef"
                class="flex-1 w-full overflow-y-auto flex flex-col gap-3 p-3 scroll-transparent"
            >
                <div
                    v-if="activeRole?.system_prompt"
                    class="w-full flex justify-center items-center my-1"
                >
                    <div
                        class="bg-emphasis mx-2 py-1 px-2 max-h-40 overflow-auto rounded-border text-sm text-center text-muted-color"
                    >
                        角色定义：{{ activeRole.system_prompt }}
                    </div>
                </div>

                <div
                    v-if="!activeConversation && !loadingConversations"
                    class="rounded-border border border-surface-200 dark:border-surface-700 p-4 text-sm text-muted-color"
                >
                    当前角色暂无对话，点击右侧“新建对话”或直接发送消息自动创建。
                </div>

                <div
                    v-if="activeConversation && displayMessages.length === 0 && !loadingMessages"
                    class="rounded-border border border-surface-200 dark:border-surface-700 p-4 text-sm text-muted-color"
                >
                    暂无消息，开始你的第一条提问吧。
                </div>

                <div v-for="item in displayMessages" :key="item.id" class="w-full">
                    <div
                        class="flex"
                        :class="item.role === 'user' ? 'justify-end' : 'justify-start'"
                    >
                        <div
                            :class="[
                                'max-w-[90%] lg:max-w-[78%] rounded-border border p-3 transition-motion',
                                item.role === 'user'
                                    ? 'bg-primary text-primary-contrast border-primary'
                                    : 'bg-surface-0 dark:bg-[#0c1117] border-surface-200 dark:border-surface-700'
                            ]"
                        >
                            <div
                                class="mb-2 flex items-center justify-between gap-3 text-xs opacity-80"
                            >
                                <span class="text-sm">{{ getMessageSenderLabel(item) }}</span>
                                <span>{{ formatTime(item.created_at) }}</span>
                            </div>

                            <div
                                v-if="item.role === 'assistant' && item.thinking"
                                class="mb-3 rounded-border border border-surface-200 dark:border-surface-700 bg-emphasis p-2 transition-motion"
                            >
                                <div class="mb-1 text-xs font-semibold text-muted-color">
                                    思考过程
                                </div>
                                <div
                                    class="text-sm whitespace-pre-wrap wrap-break-word text-wrap-anywhere"
                                >
                                    {{ item.thinking }}
                                </div>
                            </div>

                            <div
                                v-if="item.role === 'assistant'"
                                class="text-sm leading-6 text-wrap-anywhere"
                            >
                                <MarkdownRenderer
                                    :content="item.content"
                                    :is-streaming="isStreaming && item.id === streamingMessageId"
                                    :is-dark="isDark"
                                />
                            </div>
                            <div
                                v-else
                                class="text-sm leading-6 whitespace-pre-wrap wrap-break-word text-wrap-anywhere"
                            >
                                {{ item.content }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="p-3 flex flex-col h-44 gap-2 border-t border-surface-200 dark:border-surface-700"
            >
                <Textarea
                    v-model="message"
                    class="flex-1 overflow-y-auto! resize-none"
                    placeholder="输入聊天内容，Enter 发送，Shift+Enter 换行"
                    auto-resize
                    @keydown="handleKeyDown"
                />

                <div class="flex items-center gap-2 whitespace-nowrap">
                    <div class="min-w-0 flex-1 flex items-center gap-3 text-xs text-muted-color">
                        <div class="min-w-0 flex-1 truncate" :title="currentModel">
                            当前模型：{{ currentModel }}
                        </div>
                        <div class="inline-flex shrink-0 items-center gap-2">
                            <label for="thinking-mode-switch">思考模式</label>
                            <ToggleSwitch
                                input-id="thinking-mode-switch"
                                :model-value="thinkingMode"
                                :disabled="updatingThinkingMode || isStreaming"
                                @update:model-value="onThinkingModeChange"
                            />
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                        <Button
                            v-if="isStreaming"
                            icon="pi pi-stop"
                            severity="contrast"
                            label="停止"
                            size="small"
                            @click="stopChatStream"
                        />
                        <Button
                            icon="pi pi-send"
                            severity="contrast"
                            label="发送"
                            size="small"
                            :loading="sending"
                            :disabled="!canSend"
                            @click="sendMessage"
                        />
                    </div>
                </div>
            </div>
        </section>

        <aside
            class="w-56 h-full hidden sm:block border-l border-surface-200 dark:border-surface-700 py-1 pl-2"
        >
            <div class="w-full h-full px-2 flex flex-col">
                <div
                    class="w-full h-12 flex justify-between items-center text-xl mb-2 mx-1 font-semibold"
                >
                    历史对话
                    <Button
                        icon="pi pi-plus"
                        class="w-10"
                        severity="contrast"
                        variant="text"
                        :disabled="!activeRole"
                        @click="addConversation"
                    />
                </div>

                <div class="flex-1 overflow-y-auto scroll-transparent flex flex-col gap-2 pr-1">
                    <div
                        v-if="loadingConversations"
                        class="rounded-border border border-surface-200 dark:border-surface-700 p-3 text-sm text-muted-color"
                    >
                        正在加载对话...
                    </div>

                    <div
                        v-else-if="conversationList.length === 0"
                        class="rounded-border border border-surface-200 dark:border-surface-700 p-3 text-sm text-muted-color"
                    >
                        {{ activeRole ? '暂无历史对话' : '请先选择角色' }}
                    </div>

                    <div
                        v-for="item in conversationList"
                        :key="item.id"
                        :class="[
                            'w-full flex flex-col cursor-pointer rounded-border p-2 transition-motion border',
                            activeConversation?.id === item.id
                                ? 'bg-emphasis border-emphasis'
                                : 'border-surface-200 dark:border-surface-700'
                        ]"
                        @click="changeConversation(item.id)"
                    >
                        <div class="flex justify-between gap-2">
                            <div class="flex-1 min-w-0 single-line font-semibold">
                                {{ item.title }}
                            </div>
                            <div class="text-xs shrink-0 text-muted-color">
                                {{ formatTime(item.updated_at) }}
                            </div>
                        </div>
                        <div class="single-line text-sm mt-1 text-muted-color">
                            {{ getConversationPreview(item.id) }}
                        </div>
                        <div class="mt-2 flex justify-end gap-1">
                            <Button
                                icon="pi pi-pencil"
                                severity="contrast"
                                variant="text"
                                size="small"
                                @click.stop="showEditConversationTitle(item.id)"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                variant="text"
                                size="small"
                                @click.stop="showDeleteConversation(item.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <Dialog v-model:visible="addRoleShow" modal header="添加角色" :style="{ width: '32rem' }">
            <div class="flex flex-col gap-4 mt-1 mb-2">
                <div class="flex items-center gap-4">
                    <label for="add-role-name" class="font-semibold w-14 shrink-0">角色名</label>
                    <InputText
                        id="add-role-name"
                        v-model="addRoleName"
                        class="flex-auto"
                        autocomplete="off"
                        placeholder="角色名，如：全能助手"
                    />
                </div>
                <div class="flex items-start gap-4">
                    <label for="add-role-description" class="font-semibold w-14 shrink-0 mt-2"
                        >描述</label
                    >
                    <Textarea
                        id="add-role-description"
                        v-model="addRoleDescription"
                        class="flex-auto"
                        rows="3"
                        placeholder="描述（给自己看），可选"
                    />
                </div>
                <div class="flex items-start gap-4 mb-2">
                    <label for="add-role-definition" class="font-semibold w-14 shrink-0 mt-2"
                        >定义</label
                    >
                    <Textarea
                        id="add-role-definition"
                        v-model="addRoleDefinition"
                        class="flex-auto"
                        rows="6"
                        placeholder="定义（给 AI 看）"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="hideAddRole" />
                <Button
                    type="button"
                    label="添加"
                    :disabled="!addRoleName.trim() || !addRoleDefinition.trim()"
                    @click="addRole"
                />
            </div>
        </Dialog>

        <Dialog v-model:visible="editRoleShow" modal header="修改角色" :style="{ width: '32rem' }">
            <div class="flex flex-col gap-4 mt-1 mb-2">
                <div class="flex items-center gap-4">
                    <label for="edit-role-name" class="font-semibold w-14 shrink-0">角色名</label>
                    <InputText id="edit-role-name" v-model="editRoleName" class="flex-auto" />
                </div>
                <div class="flex items-start gap-4">
                    <label for="edit-role-description" class="font-semibold w-14 shrink-0 mt-2"
                        >描述</label
                    >
                    <Textarea
                        id="edit-role-description"
                        v-model="editRoleDescription"
                        class="flex-auto"
                        rows="3"
                    />
                </div>
                <div class="flex items-start gap-4 mb-2">
                    <label for="edit-role-definition" class="font-semibold w-14 shrink-0 mt-2"
                        >定义</label
                    >
                    <Textarea
                        id="edit-role-definition"
                        v-model="editRoleDefinition"
                        class="flex-auto"
                        rows="6"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="hideEditRole" />
                <Button
                    type="button"
                    label="修改"
                    :disabled="!editRoleName.trim() || !editRoleDefinition.trim()"
                    @click="editRole"
                />
            </div>
        </Dialog>

        <Dialog
            v-model:visible="deleteRoleShow"
            modal
            header="删除角色"
            :style="{ width: '26rem' }"
        >
            <p class="text-sm text-color">
                确认删除角色 <span class="font-semibold">{{ deleteRoleName || '该角色' }}</span>
                吗？此操作不可撤销。
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="取消"
                        severity="secondary"
                        @click="deleteRoleShow = false"
                    />
                    <Button type="button" label="删除" severity="danger" @click="deleteRole" />
                </div>
            </template>
        </Dialog>

        <Dialog
            v-model:visible="editConversationShow"
            modal
            header="修改标题"
            :style="{ width: '26rem' }"
        >
            <div class="flex flex-col mt-1 mb-4">
                <div class="flex items-center gap-4">
                    <label for="conversation-title" class="font-semibold w-12">标题</label>
                    <InputText
                        id="conversation-title"
                        v-model="editingConversationTitle"
                        class="flex-auto"
                        autocomplete="off"
                        placeholder="请输入该对话的自定义标题"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button
                    type="button"
                    label="取消"
                    severity="secondary"
                    @click="hideEditConversationTitle"
                />
                <Button
                    type="button"
                    label="修改"
                    :disabled="!editingConversationTitle.trim()"
                    @click="editConversationTitle"
                />
            </div>
        </Dialog>

        <Dialog
            v-model:visible="deleteConversationShow"
            modal
            header="删除对话"
            :style="{ width: '26rem' }"
        >
            <p class="text-sm text-color">
                确认删除对话
                <span class="font-semibold">{{ deleteConversationName || '该对话' }}</span>
                吗？此操作不可撤销。
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="取消"
                        severity="secondary"
                        @click="deleteConversationShow = false"
                    />
                    <Button
                        type="button"
                        label="删除"
                        severity="danger"
                        @click="deleteConversation"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import type {
    Character,
    Conversation,
    CreateCharacterInput,
    CreateMessageInput,
    CreateConversationInput,
    Message,
    UpdateCharacterInput,
    UpdateConversationInput
} from '@shared/types'
import { useLayoutToast } from '@renderer/composables/useLayoutToast'

interface DisplayMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    thinking?: string
    model?: string
    created_at: number
}

const toast = useLayoutToast()
const isDark = ref(false)
let themeObserver: MutationObserver | null = null

const loadingRoles = ref(false)
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)

const roleList = ref<Character[]>([])
const searchRoleName = ref('')
const activeRoleId = ref('')

const conversationList = ref<Conversation[]>([])
const activeConversationId = ref('')

const messageList = ref<Message[]>([])
const message = ref('')
const currentModel = ref('')
const thinkingMode = ref(true)
const updatingThinkingMode = ref(false)
const apiKeyConfigured = ref(false)
const baseURLConfigured = ref(false)
const conversationPreviewMap = ref<Record<string, string>>({})

const chatContentRef = ref<HTMLElement | null>(null)

const activeStreamRequestId = ref('')
const pendingStreamConversationId = ref('')
const streamingMessageId = ref('')
const streamContent = ref('')
const streamThinking = ref('')
const streamExpectThinking = ref(false)
const streamHasReasoning = ref(false)

const addRoleShow = ref(false)
const editRoleShow = ref(false)
const deleteRoleShow = ref(false)

const addRoleName = ref('')
const addRoleDescription = ref('')
const addRoleDefinition = ref('')

const editRoleId = ref('')
const editRoleName = ref('')
const editRoleDescription = ref('')
const editRoleDefinition = ref('')

const deleteRoleId = ref('')

const editConversationShow = ref(false)
const editingConversationId = ref('')
const editingConversationTitle = ref('')

const deleteConversationShow = ref(false)
const deleteConversationId = ref('')

let unsubscribeStreamStart: (() => void) | null = null
let unsubscribeStreamChunk: (() => void) | null = null
let unsubscribeStreamEnd: (() => void) | null = null

const activeRole = computed(
    () => roleList.value.find((item) => item.id === activeRoleId.value) ?? null
)

const filteredRoleList = computed(() => {
    const keyword = searchRoleName.value.trim().toLowerCase()
    if (!keyword) return roleList.value
    return roleList.value.filter((item) => item.name.toLowerCase().includes(keyword))
})

const activeConversation = computed(() => {
    return conversationList.value.find((item) => item.id === activeConversationId.value) ?? null
})

const deleteRoleName = computed(() => {
    return roleList.value.find((item) => item.id === deleteRoleId.value)?.name ?? ''
})

const deleteConversationName = computed(() => {
    return (
        conversationList.value.find((item) => item.id === deleteConversationId.value)?.title ?? ''
    )
})

const isStreaming = computed(() => sending.value)

const canSend = computed(() => {
    return Boolean(message.value.trim()) && Boolean(activeRole.value) && !sending.value
})

const displayMessages = computed<DisplayMessage[]>(() => {
    const persisted: DisplayMessage[] = messageList.value.map((item) => ({
        id: item.id,
        role: item.role,
        content: item.content,
        thinking: item.thinking,
        model: item.model,
        created_at: item.created_at
    }))

    if (
        streamingMessageId.value &&
        pendingStreamConversationId.value === activeConversationId.value
    ) {
        persisted.push({
            id: streamingMessageId.value,
            role: 'assistant',
            content: streamContent.value,
            thinking: streamThinking.value || undefined,
            model: currentModel.value || undefined,
            created_at: Date.now()
        })
    }

    return persisted
})

function pad2(value: number): string {
    return String(value).padStart(2, '0')
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(
        date.getMinutes()
    )}`
}

function onSearchRole(): void {
    // 使用 filteredRoleList 过滤
}

function getConversationPreview(conversationId: string): string {
    return conversationPreviewMap.value[conversationId] || '暂无消息'
}

function getMessageSenderLabel(item: DisplayMessage): string {
    if (item.role === 'user') return '我'
    if (item.role === 'assistant') {
        const roleName = activeRole.value?.name || '助手'
        const modelName = item.model || currentModel.value || 'unknown'
        return `${roleName}（${modelName}）`
    }
    return '系统'
}

function getDefaultConversationTitle(content: string): string {
    const firstLine = content
        .split('\n')
        .map((line) => line.trim())
        .find((line) => Boolean(line))
    return firstLine || '新对话'
}

async function refreshConversationPreviews(conversations: Conversation[]): Promise<void> {
    const entries = await Promise.all(
        conversations.map(async (conversation) => {
            try {
                const messages = await window.api.getMessages(conversation.id)
                const lastMessage = messages[messages.length - 1]
                return [conversation.id, lastMessage?.content || '暂无消息'] as const
            } catch {
                return [conversation.id, '暂无消息'] as const
            }
        })
    )

    conversationPreviewMap.value = Object.fromEntries(entries)
}

async function scrollToBottom(): Promise<void> {
    await nextTick()
    const el = chatContentRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
}

async function refreshRoles(): Promise<void> {
    loadingRoles.value = true
    try {
        const list = await window.api.getCharacters()
        roleList.value = list

        if (activeRoleId.value && !list.some((item) => item.id === activeRoleId.value)) {
            activeRoleId.value = ''
        }

        if (!activeRoleId.value && list.length > 0) {
            activeRoleId.value = list[0].id
        }
    } catch (error) {
        console.error(error)
        toast.error('加载角色失败，请稍后重试')
    } finally {
        loadingRoles.value = false
    }
}

async function refreshConversations(characterId: string): Promise<void> {
    if (!characterId) {
        conversationList.value = []
        activeConversationId.value = ''
        messageList.value = []
        conversationPreviewMap.value = {}
        return
    }

    loadingConversations.value = true
    try {
        const list = await window.api.getConversations(characterId)
        conversationList.value = list
        await refreshConversationPreviews(list)

        if (
            activeConversationId.value &&
            !list.some((item) => item.id === activeConversationId.value)
        ) {
            activeConversationId.value = ''
        }

        if (!activeConversationId.value && list.length > 0) {
            activeConversationId.value = list[0].id
        }
    } catch (error) {
        console.error(error)
        toast.error('加载对话失败，请稍后重试')
    } finally {
        loadingConversations.value = false
    }
}

async function refreshMessages(conversationId: string): Promise<void> {
    if (!conversationId) {
        messageList.value = []
        return
    }

    loadingMessages.value = true
    try {
        messageList.value = await window.api.getMessages(conversationId)
        const lastMessage = messageList.value[messageList.value.length - 1]
        conversationPreviewMap.value = {
            ...conversationPreviewMap.value,
            [conversationId]: lastMessage?.content || '暂无消息'
        }
        await scrollToBottom()
    } catch (error) {
        console.error(error)
        toast.error('加载消息失败，请稍后重试')
    } finally {
        loadingMessages.value = false
    }
}

async function touchConversation(id: string): Promise<void> {
    const current = conversationList.value.find((item) => item.id === id)
    if (!current) return

    const input: UpdateConversationInput = {
        title: current.title
    }

    await window.api.updateConversation(id, input)
}

async function ensureConversation(): Promise<Conversation | null> {
    if (activeConversation.value) {
        return activeConversation.value
    }

    if (!activeRole.value) return null

    const input: CreateConversationInput = {
        character_id: activeRole.value.id,
        title: '新对话'
    }

    const created = await window.api.createConversation(input)
    await refreshConversations(activeRole.value.id)
    activeConversationId.value = created.id
    return created
}

async function changeRole(id: string): Promise<void> {
    if (!id || id === activeRoleId.value) return

    activeRoleId.value = id
    activeConversationId.value = ''
    messageList.value = []

    await refreshConversations(id)
}

async function changeConversation(id: string): Promise<void> {
    if (!id || id === activeConversationId.value) return

    activeConversationId.value = id
    await refreshMessages(id)
}

function resetAddRoleForm(): void {
    addRoleName.value = ''
    addRoleDescription.value = ''
    addRoleDefinition.value = ''
}

function showAddRole(): void {
    resetAddRoleForm()
    addRoleShow.value = true
}

function hideAddRole(): void {
    addRoleShow.value = false
}

async function addRole(): Promise<void> {
    const name = addRoleName.value.trim()
    const description = addRoleDescription.value.trim()
    const definition = addRoleDefinition.value.trim()

    if (!name || !definition) {
        toast.warn('角色名和定义不能为空')
        return
    }

    const input: CreateCharacterInput = {
        name,
        system_prompt: definition
    }

    if (description) {
        input.description = description
    }

    try {
        const created = await window.api.createCharacter(input)
        hideAddRole()
        await refreshRoles()
        activeRoleId.value = created.id
        await refreshConversations(created.id)
        toast.success('角色添加成功')
    } catch (error) {
        console.error(error)
        toast.error('添加角色失败，请稍后重试')
    }
}

function showEditRole(id: string): void {
    if (!id) return

    const role = roleList.value.find((item) => item.id === id)
    if (!role) {
        toast.warn('未找到角色信息')
        return
    }

    editRoleId.value = role.id
    editRoleName.value = role.name
    editRoleDescription.value = role.description ?? ''
    editRoleDefinition.value = role.system_prompt
    editRoleShow.value = true
}

function hideEditRole(): void {
    editRoleShow.value = false
}

async function editRole(): Promise<void> {
    const id = editRoleId.value
    if (!id) return

    const name = editRoleName.value.trim()
    const description = editRoleDescription.value.trim()
    const definition = editRoleDefinition.value.trim()

    if (!name || !definition) {
        toast.warn('角色名和定义不能为空')
        return
    }

    const input: UpdateCharacterInput = {
        name,
        description,
        system_prompt: definition
    }

    try {
        const updated = await window.api.updateCharacter(id, input)
        if (!updated) {
            toast.warn('角色不存在或已被删除')
            return
        }

        hideEditRole()
        await refreshRoles()
        activeRoleId.value = updated.id
        toast.success('角色修改成功')
    } catch (error) {
        console.error(error)
        toast.error('修改角色失败，请稍后重试')
    }
}

function showDeleteRole(id: string): void {
    if (!id) return
    deleteRoleId.value = id
    deleteRoleShow.value = true
}

async function deleteRole(): Promise<void> {
    const id = deleteRoleId.value
    if (!id) return

    try {
        const result = await window.api.deleteCharacter(id)
        if (!result.success) {
            toast.warn('删除失败，角色可能已不存在')
            return
        }

        deleteRoleShow.value = false
        deleteRoleId.value = ''

        if (activeRoleId.value === id) {
            activeRoleId.value = ''
            activeConversationId.value = ''
            messageList.value = []
        }

        await refreshRoles()

        if (activeRoleId.value) {
            await refreshConversations(activeRoleId.value)
        }

        toast.success('角色删除成功')
    } catch (error) {
        console.error(error)
        toast.error('删除角色失败，请稍后重试')
    }
}

async function addConversation(): Promise<void> {
    if (!activeRole.value) {
        toast.warn('请先选择角色')
        return
    }

    try {
        const input: CreateConversationInput = {
            character_id: activeRole.value.id,
            title: `新对话 ${new Date().toLocaleString('zh-CN', { hour12: false })}`
        }

        const created = await window.api.createConversation(input)
        await refreshConversations(activeRole.value.id)
        activeConversationId.value = created.id
        await refreshMessages(created.id)
        toast.success('对话创建成功')
    } catch (error) {
        console.error(error)
        toast.error('创建对话失败，请稍后重试')
    }
}

function showEditConversationTitle(id: string): void {
    const conversation = conversationList.value.find((item) => item.id === id)
    if (!conversation) {
        toast.warn('未找到对话')
        return
    }

    editingConversationId.value = id
    editingConversationTitle.value = conversation.title
    editConversationShow.value = true
}

function hideEditConversationTitle(): void {
    editConversationShow.value = false
}

async function editConversationTitle(): Promise<void> {
    const id = editingConversationId.value
    const title = editingConversationTitle.value.trim()

    if (!id || !title) return

    try {
        const updated = await window.api.updateConversation(id, { title })
        if (!updated) {
            toast.warn('对话不存在或已被删除')
            return
        }

        hideEditConversationTitle()
        if (activeRole.value) {
            await refreshConversations(activeRole.value.id)
        }
        activeConversationId.value = id
        toast.success('标题修改成功')
    } catch (error) {
        console.error(error)
        toast.error('修改标题失败，请稍后重试')
    }
}

function showDeleteConversation(id: string): void {
    if (!id) return
    deleteConversationId.value = id
    deleteConversationShow.value = true
}

async function deleteConversation(): Promise<void> {
    const id = deleteConversationId.value
    if (!id) return

    try {
        const result = await window.api.deleteConversation(id)
        if (!result.success) {
            toast.warn('删除失败，对话可能已不存在')
            return
        }

        deleteConversationShow.value = false
        deleteConversationId.value = ''

        const wasActive = activeConversationId.value === id

        if (activeRole.value) {
            await refreshConversations(activeRole.value.id)
        }

        if (wasActive) {
            if (conversationList.value.length > 0) {
                activeConversationId.value = conversationList.value[0].id
                await refreshMessages(activeConversationId.value)
            } else {
                activeConversationId.value = ''
                messageList.value = []
            }
        }

        toast.success('对话删除成功')
    } catch (error) {
        console.error(error)
        toast.error('删除对话失败，请稍后重试')
    }
}

function handleKeyDown(event: KeyboardEvent): void {
    const nativeEvent = event as KeyboardEvent & { isComposing?: boolean; keyCode?: number }
    if (nativeEvent.isComposing || nativeEvent.keyCode === 229) return

    if (event.key !== 'Enter') return
    if (event.shiftKey) return

    event.preventDefault()
    if (canSend.value) {
        void sendMessage()
    }
}

function resetStreamingState(): void {
    activeStreamRequestId.value = ''
    pendingStreamConversationId.value = ''
    streamingMessageId.value = ''
    streamContent.value = ''
    streamThinking.value = ''
    streamExpectThinking.value = false
    streamHasReasoning.value = false
    sending.value = false
}

function setupStreamListeners(): void {
    unsubscribeStreamStart = window.api.onStreamStart((requestId) => {
        activeStreamRequestId.value = requestId
    })

    unsubscribeStreamChunk = window.api.onStreamChunk((chunk, type, requestId) => {
        if (requestId && activeStreamRequestId.value && requestId !== activeStreamRequestId.value) {
            return
        }

        if (!activeStreamRequestId.value && requestId) {
            activeStreamRequestId.value = requestId
        }

        if (type === 'reasoning') {
            streamHasReasoning.value = true
            streamThinking.value += chunk
        } else {
            streamContent.value += chunk
        }

        void scrollToBottom()
    })

    unsubscribeStreamEnd = window.api.onStreamEnd(async (error, requestId) => {
        if (requestId && activeStreamRequestId.value && requestId !== activeStreamRequestId.value) {
            return
        }

        const conversationId = pendingStreamConversationId.value
        const assistantContent = streamContent.value
        const assistantThinking = streamThinking.value

        if (error) {
            toast.error(error, '流式聊天失败')
        }

        if (conversationId && (assistantContent || assistantThinking)) {
            try {
                const input: CreateMessageInput = {
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: assistantContent || '(空响应)',
                    model: currentModel.value || undefined
                }

                if (assistantThinking) {
                    input.thinking = assistantThinking
                }

                await window.api.createMessage(input)
                await touchConversation(conversationId)

                if (activeRole.value) {
                    await refreshConversations(activeRole.value.id)
                }

                if (conversationId === activeConversationId.value) {
                    await refreshMessages(conversationId)
                }
            } catch (persistError) {
                console.error(persistError)
                toast.error('保存助手消息失败')
            }
        }

        if (!error && streamExpectThinking.value && !streamHasReasoning.value) {
            await disableThinkingModeWhenUnsupported()
        }

        resetStreamingState()
    })
}

async function sendMessage(): Promise<void> {
    const content = message.value.trim()
    if (!content) return

    try {
        const config = await window.api.getConfig()
        apiKeyConfigured.value = Boolean(config.apiKeyConfigured)
        baseURLConfigured.value = Boolean(config.baseURL?.trim())
        currentModel.value = config.model || currentModel.value
        thinkingMode.value = Boolean(config.thinkingMode)
    } catch (error) {
        toast.error(String(error), '读取配置失败')
        return
    }

    if (!apiKeyConfigured.value || !baseURLConfigured.value || !currentModel.value?.trim()) {
        toast.warn('请先在设置页完整配置 API Key、Base URL 和模型后再发送')
        return
    }

    if (!activeRole.value) {
        toast.warn('请先选择角色')
        return
    }

    if (sending.value) return

    try {
        sending.value = true

        const ensuredConversation = await ensureConversation()
        if (!ensuredConversation) {
            toast.warn('创建对话失败，请重试')
            sending.value = false
            return
        }

        const conversationId = ensuredConversation.id
        activeConversationId.value = conversationId
        const isFirstUserMessage = messageList.value.length === 0

        const userInput: CreateMessageInput = {
            conversation_id: conversationId,
            role: 'user',
            content
        }

        await window.api.createMessage(userInput)

        if (isFirstUserMessage) {
            const title = getDefaultConversationTitle(content)
            await window.api.updateConversation(conversationId, { title })
        }

        await touchConversation(conversationId)

        if (activeRole.value) {
            await refreshConversations(activeRole.value.id)
        }

        await refreshMessages(conversationId)

        message.value = ''

        pendingStreamConversationId.value = conversationId
        streamingMessageId.value = `stream_${Date.now()}`
        streamContent.value = ''
        streamThinking.value = ''
        streamExpectThinking.value = thinkingMode.value
        streamHasReasoning.value = false

        void window.api.sendMessageStream(conversationId, content).catch((error: unknown) => {
            console.error(error)
            toast.error(String(error), '发送请求失败')
            resetStreamingState()
        })

        await scrollToBottom()
    } catch (error) {
        console.error(error)
        toast.error(String(error), '发送消息失败')
        resetStreamingState()
    }
}

function stopChatStream(): void {
    if (!sending.value) return

    if (activeStreamRequestId.value) {
        window.api.cancelStream(activeStreamRequestId.value)
    } else {
        toast.info('正在建立连接，请稍候停止')
    }
}

async function setThinkingMode(nextValue: boolean): Promise<void> {
    if (updatingThinkingMode.value) return

    updatingThinkingMode.value = true
    const previous = thinkingMode.value
    thinkingMode.value = nextValue

    try {
        const result = await window.api.setConfig({
            thinkingMode: nextValue
        })
        if (!result.success) {
            throw new Error(result.error || '保存失败')
        }
    } catch (error) {
        thinkingMode.value = previous
        toast.error(String(error), '更新思考模式失败')
    } finally {
        updatingThinkingMode.value = false
    }
}

function onThinkingModeChange(nextValue: boolean): void {
    if (typeof nextValue !== 'boolean') return
    if (nextValue === thinkingMode.value) return
    void setThinkingMode(nextValue)
}

async function disableThinkingModeWhenUnsupported(): Promise<void> {
    if (!thinkingMode.value) return
    toast.warn(`当前模型（${currentModel.value || 'unknown'}）不支持思考模式，已自动关闭`)
    await setThinkingMode(false)
}

watch(activeRoleId, async (id) => {
    if (!id) {
        conversationList.value = []
        activeConversationId.value = ''
        messageList.value = []
        return
    }

    await refreshConversations(id)
})

watch(activeConversationId, async (id) => {
    if (!id) {
        messageList.value = []
        return
    }

    await refreshMessages(id)
})

watch(displayMessages, () => {
    void scrollToBottom()
})

onMounted(async () => {
    const root = document.documentElement
    isDark.value = root.classList.contains('dark')
    themeObserver = new MutationObserver(() => {
        isDark.value = root.classList.contains('dark')
    })
    themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ['class']
    })

    setupStreamListeners()

    const config = await window.api.getConfig()
    currentModel.value = config.model || '请配置模型'
    thinkingMode.value = Boolean(config.thinkingMode)
    apiKeyConfigured.value = Boolean(config.apiKeyConfigured)
    baseURLConfigured.value = Boolean(config.baseURL?.trim())

    await refreshRoles()

    if (activeRoleId.value) {
        await refreshConversations(activeRoleId.value)

        if (activeConversationId.value) {
            await refreshMessages(activeConversationId.value)
        }
    }
})

onBeforeUnmount(() => {
    unsubscribeStreamStart?.()
    unsubscribeStreamChunk?.()
    unsubscribeStreamEnd?.()
    themeObserver?.disconnect()
})
</script>

<style scoped>
.scroll-transparent {
    scrollbar-width: thin;
}

.scroll-transparent::-webkit-scrollbar {
    width: 8px;
}

.scroll-transparent::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background-color: color-mix(in srgb, var(--p-surface-400) 35%, transparent);
}

.single-line {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.text-wrap-anywhere {
    overflow-wrap: anywhere;
    word-break: break-word;
}
</style>
