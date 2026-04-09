<template>
    <div class="h-full w-full overflow-y-auto pr-1">
        <div class="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <Fieldset legend="主题">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div class="flex-1">
                            <div class="font-semibold">主题预设</div>
                            <div class="text-sm text-surface-500 dark:text-surface-400">
                                切换 PrimeVue 主题预设。
                            </div>
                        </div>
                        <SelectButton
                            v-model="currentPreset"
                            :options="presetOptions"
                            option-label="label"
                            option-value="value"
                            :allow-empty="false"
                            @update:model-value="onPresetChange"
                        />
                    </div>
                </div>
            </Fieldset>

            <Fieldset legend="AI">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <div class="font-semibold">API Key</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            出于安全原因不会回显，留空表示不更新。
                        </div>
                        <InputText
                            v-model="apiKey"
                            type="password"
                            placeholder="sk-xxxxxxxxxxxxxxxx"
                            fluid
                        />
                    </div>

                    <Divider />

                    <div class="flex flex-col gap-2">
                        <div class="font-semibold">Base URL</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            例如：`https://api.openai.com/v1`
                        </div>
                        <InputText
                            v-model="baseURL"
                            placeholder="https://api.openai.com/v1"
                            fluid
                        />
                    </div>

                    <Divider />

                    <div class="flex flex-col gap-2">
                        <div class="font-semibold">模型</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            例如：`gpt-4o-mini`
                        </div>
                        <InputText v-model="model" placeholder="gpt-4o-mini" fluid />
                    </div>
                </div>
            </Fieldset>

            <Fieldset legend="对话参数">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div class="flex-1">
                        <div class="font-semibold">上下文条数</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            每次请求携带的历史消息条数，范围 1~32。
                        </div>
                    </div>
                    <div class="w-full md:w-56">
                        <InputNumber
                            v-model="contextCount"
                            :min="1"
                            :max="32"
                            :use-grouping="false"
                            show-buttons
                            fluid
                        />
                    </div>
                </div>
            </Fieldset>

            <Fieldset legend="同步">
                <div class="flex flex-col gap-4">
                    <div class="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            同步服务地址
                        </div>
                        <div class="font-medium">http://154.8.198.192:3002</div>
                    </div>

                    <div
                        v-if="!isLoggedIn"
                        class="flex flex-col gap-3 rounded-lg border border-surface-200 p-3 dark:border-surface-700"
                    >
                        <div class="font-semibold">账号登录/注册</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            不登录也可以正常使用本地聊天，登录后可手动同步到云端。
                        </div>
                        <InputText v-model="syncUsername" placeholder="用户名" fluid />
                        <InputText
                            v-model="syncPassword"
                            type="password"
                            placeholder="密码"
                            fluid
                        />
                        <div class="flex flex-wrap gap-2">
                            <Button
                                label="登录"
                                icon="pi pi-sign-in"
                                :loading="isAuthSubmitting"
                                @click="handleLogin"
                            />
                            <Button
                                label="注册"
                                icon="pi pi-user-plus"
                                severity="secondary"
                                :loading="isAuthSubmitting"
                                @click="handleRegister"
                            />
                        </div>
                    </div>

                    <div
                        v-else
                        class="flex flex-col gap-3 rounded-lg border border-surface-200 p-3 dark:border-surface-700"
                    >
                        <div class="font-semibold">同步账号</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            当前已登录：{{ syncStatus?.username }}
                        </div>
                        <div class="flex">
                            <Button
                                label="退出登录"
                                icon="pi pi-sign-out"
                                severity="secondary"
                                :loading="isAuthSubmitting"
                                @click="handleLogout"
                            />
                        </div>
                    </div>

                    <div class="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
                        <div class="font-semibold">同步状态</div>
                        <div
                            class="mt-2 flex flex-col gap-1 text-sm text-surface-500 dark:text-surface-400"
                        >
                            <div>设备 ID：{{ syncStatus?.deviceId ?? '-' }}</div>
                            <div>上次同步时间：{{ formatSyncTime(syncStatus?.lastSyncAt) }}</div>
                            <div>同步游标（since）：{{ syncStatus?.lastSince ?? 0 }}</div>
                        </div>
                        <div
                            v-if="syncSummary"
                            class="mt-2 rounded-md bg-surface-100 px-2 py-1 text-sm dark:bg-surface-800"
                        >
                            {{ syncSummary }}
                        </div>
                    </div>

                    <div class="flex">
                        <Button
                            label="立即同步"
                            icon="pi pi-refresh"
                            :loading="isSyncing"
                            :disabled="!isLoggedIn"
                            @click="handleRunSync"
                        />
                    </div>
                </div>
            </Fieldset>

            <div
                class="sticky bottom-0 z-10 -mx-1 mt-1 border-t border-surface-200 bg-surface-0/90 px-1 py-2 backdrop-blur-md dark:border-surface-700 dark:bg-surface-900/90"
            >
                <div class="flex justify-end">
                    <Button
                        label="保存配置"
                        icon="pi pi-save"
                        :loading="isSaving"
                        @click="saveConfig"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AIConfig, SyncAuthInput, SyncStatus } from '@shared/types'
import { useTheme } from '@renderer/composables/useTheme'
import type { ThemePreset } from '@renderer/themes/myPreset'
import { useLayoutToast } from '@renderer/composables/useLayoutToast'

const { currentPreset, presetOptions, setPreset } = useTheme()
const toast = useLayoutToast()

const apiKey = ref('')
const baseURL = ref('')
const model = ref('')
const contextCount = ref<number>(10)
const isSaving = ref(false)
const syncUsername = ref('')
const syncPassword = ref('')
const syncStatus = ref<SyncStatus | null>(null)
const isAuthSubmitting = ref(false)
const isSyncing = ref(false)
const syncSummary = ref('')

const isLoggedIn = computed<boolean>(() => Boolean(syncStatus.value?.loggedIn))

function normalizeContextCount(value: number | null | undefined): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return 10
    return Math.min(32, Math.max(1, Math.round(value)))
}

function formatSyncTime(timestamp?: number): string {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
}

const onPresetChange = (preset: ThemePreset): void => {
    setPreset(preset)
    toast.success(`主题预设已切换到 ${preset}`)
}

const loadConfig = async (): Promise<void> => {
    try {
        const config = await window.api.getConfig()
        baseURL.value = config.baseURL ?? ''
        model.value = config.model ?? ''
        contextCount.value = normalizeContextCount(config.contextCount)
    } catch (error) {
        toast.error(String(error), '读取配置失败')
    }
}

const saveConfig = async (): Promise<void> => {
    if (isSaving.value) return

    isSaving.value = true
    try {
        contextCount.value = normalizeContextCount(contextCount.value)

        const payload: AIConfig = {
            baseURL: baseURL.value.trim(),
            model: model.value.trim(),
            contextCount: contextCount.value
        }

        const nextApiKey = apiKey.value.trim()
        if (nextApiKey) {
            payload.apiKey = nextApiKey
        }

        const result = await window.api.setConfig(payload)
        if (!result.success) {
            throw new Error(result.error || '保存失败')
        }

        if (nextApiKey) {
            apiKey.value = ''
        }
        toast.success('设置已保存')
    } catch (error) {
        toast.error(String(error), '保存配置失败')
    } finally {
        isSaving.value = false
    }
}

const toAuthInput = (): SyncAuthInput => ({
    username: syncUsername.value.trim(),
    password: syncPassword.value
})

const validateAuthInput = (): boolean => {
    const username = syncUsername.value.trim()
    const password = syncPassword.value
    if (!username) {
        toast.warn('请输入用户名')
        return false
    }
    if (!password) {
        toast.warn('请输入密码')
        return false
    }
    return true
}

const refreshSyncStatus = async (): Promise<void> => {
    try {
        syncStatus.value = await window.api.getSyncStatus()
    } catch (error) {
        toast.error(String(error), '读取同步状态失败')
    }
}

const handleRegister = async (): Promise<void> => {
    if (isAuthSubmitting.value || !validateAuthInput()) return
    isAuthSubmitting.value = true
    try {
        const result = await window.api.syncRegister(toAuthInput())
        if (!result.success) {
            throw new Error(result.error ?? '注册失败')
        }
        syncPassword.value = ''
        await refreshSyncStatus()
        toast.success('注册成功，已登录')
    } catch (error) {
        toast.error(String(error), '注册失败')
    } finally {
        isAuthSubmitting.value = false
    }
}

const handleLogin = async (): Promise<void> => {
    if (isAuthSubmitting.value || !validateAuthInput()) return
    isAuthSubmitting.value = true
    try {
        const result = await window.api.syncLogin(toAuthInput())
        if (!result.success) {
            throw new Error(result.error ?? '登录失败')
        }
        syncPassword.value = ''
        await refreshSyncStatus()
        toast.success('登录成功')
    } catch (error) {
        toast.error(String(error), '登录失败')
    } finally {
        isAuthSubmitting.value = false
    }
}

const handleLogout = async (): Promise<void> => {
    if (isAuthSubmitting.value) return
    isAuthSubmitting.value = true
    try {
        const result = await window.api.syncLogout()
        if (!result.success) {
            throw new Error('退出登录失败')
        }
        syncSummary.value = ''
        syncPassword.value = ''
        await refreshSyncStatus()
        toast.success('已退出登录')
    } catch (error) {
        toast.error(String(error), '退出登录失败')
    } finally {
        isAuthSubmitting.value = false
    }
}

const handleRunSync = async (): Promise<void> => {
    if (isSyncing.value || !isLoggedIn.value) return
    isSyncing.value = true
    try {
        const result = await window.api.runSync()
        if (!result.success) {
            throw new Error(result.error ?? '同步失败')
        }
        syncSummary.value = `上传: ${result.upload?.applied.characters ?? 0}/${result.upload?.received.characters ?? 0} 角色, ${result.upload?.applied.conversations ?? 0}/${result.upload?.received.conversations ?? 0} 对话, ${result.upload?.applied.messages ?? 0}/${result.upload?.received.messages ?? 0} 消息；拉取: ${result.pull?.characters ?? 0} 角色, ${result.pull?.conversations ?? 0} 对话, ${result.pull?.messages ?? 0} 消息。`
        await refreshSyncStatus()
        toast.success('同步完成')
    } catch (error) {
        toast.error(String(error), '同步失败')
    } finally {
        isSyncing.value = false
    }
}

onMounted(async () => {
    await Promise.all([loadConfig(), refreshSyncStatus()])
})
</script>
