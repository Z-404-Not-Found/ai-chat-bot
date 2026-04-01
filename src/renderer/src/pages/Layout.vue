<template>
    <div v-if="!isMac" class="p-4 flex gap-2">
        <Button
            icon="pi pi-minus"
            severity="secondary"
            size="small"
            aria-label="最小化"
            @click="handleMinimize"
        />
        <Button
            :icon="maximizeIcon"
            severity="secondary"
            size="small"
            aria-label="最大化"
            @click="handleMaximize"
        />
        <Button
            icon="pi pi-times"
            severity="danger"
            size="small"
            aria-label="关闭"
            @click="handleClose"
        />
        <Button
            label="isMaximized"
            icon="pi pi-question-circle"
            severity="secondary"
            size="small"
            @click="handleIsMaximized"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'

const isMac = computed(() => platform.value === 'darwin')

const platform = ref<'darwin' | 'win32' | 'linux'>('linux')

onMounted(async () => {
    const result = await window.api.getPlatform()
    platform.value = result.platform
})

const isWindowMaximized = ref(false)

const maximizeIcon = computed(() =>
    isWindowMaximized.value ? 'pi pi-window-minimize' : 'pi pi-window-maximize'
)

async function handleMinimize(): Promise<void> {
    await window.api.minimize()
}

async function handleMaximize(): Promise<void> {
    const result = await window.api.maximize()
    if (result.success && result.isMaximized !== undefined) {
        isWindowMaximized.value = result.isMaximized
    }
}

async function handleClose(): Promise<void> {
    await window.api.close()
}

async function handleIsMaximized(): Promise<void> {
    const result = await window.api.isMaximized()
    isWindowMaximized.value = result.isMaximized
    console.log('isMaximized:', result.isMaximized)
}
</script>

<style scoped></style>
