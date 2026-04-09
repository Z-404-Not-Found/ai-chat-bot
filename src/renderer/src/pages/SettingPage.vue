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
import { onMounted, ref } from 'vue'
import type { AIConfig } from '@shared/types'
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

function normalizeContextCount(value: number | null | undefined): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return 10
    return Math.min(32, Math.max(1, Math.round(value)))
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

onMounted(async () => {
    await loadConfig()
})
</script>
