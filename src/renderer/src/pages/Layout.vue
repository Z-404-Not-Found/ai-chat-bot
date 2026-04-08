<template>
    <div
        class="layout-shell h-full w-full overflow-hidden p-3 transition-motion"
        :style="layoutVars"
    >
        <div class="flex h-full w-full gap-3">
            <aside
                class="layout-panel hidden h-full p-3 lg:flex lg:flex-col transition-motion"
                :class="isSidebarCollapsed ? 'w-18' : 'w-48'"
            >
                <div class="mb-3 flex h-8 items-center justify-center gap-3 rounded-xl px-2">
                    <div
                        class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 transition-motion"
                    >
                        <i class="pi pi-microchip-ai text-sm"></i>
                    </div>
                    <div
                        v-if="!isSidebarCollapsed"
                        class="truncate whitespace-nowrap text-l font-semibold transition-motion"
                    >
                        AI 聊天助手
                    </div>
                </div>
                <div class="layout-divider my-1 h-px transition-motion"></div>
                <nav class="mt-3 flex flex-1 flex-col gap-2">
                    <button
                        v-for="item in primaryNavItems"
                        :key="item.path"
                        type="button"
                        class="layout-nav-shape group flex items-center justify-center overflow-hidden text-sm transition-motion"
                        :class="[
                            isSidebarCollapsed
                                ? 'mx-auto h-11 w-11 justify-center px-0'
                                : 'h-11 w-full px-3',
                            isActive(item.path) ? 'layout-nav-active' : 'layout-nav-idle'
                        ]"
                        @click="goTo(item.path)"
                    >
                        <span class="grid h-5 w-5 place-items-center">
                            <i :class="`pi ${item.icon}`"></i>
                        </span>
                        <span v-if="!isSidebarCollapsed" class="ml-2 truncate whitespace-nowrap">
                            {{ item.label }}
                        </span>
                    </button>
                </nav>
                <button
                    type="button"
                    class="layout-nav-shape group mt-2 flex items-center justify-center overflow-hidden text-sm transition-motion"
                    :class="[
                        isSidebarCollapsed
                            ? 'mx-auto h-11 w-11 justify-center px-0'
                            : 'h-11 w-full px-3',
                        isActive(settingNavItem.path) ? 'layout-nav-active' : 'layout-nav-idle'
                    ]"
                    @click="goTo(settingNavItem.path)"
                >
                    <span class="grid h-5 w-5 place-items-center">
                        <i :class="`pi ${settingNavItem.icon}`"></i>
                    </span>
                    <span v-if="!isSidebarCollapsed" class="ml-2 truncate whitespace-nowrap">
                        {{ settingNavItem.label }}
                    </span>
                </button>
                <button
                    type="button"
                    class="layout-nav-shape layout-nav-idle mt-2 flex items-center px-3 text-sm transition-motion"
                    :class="
                        isSidebarCollapsed
                            ? 'mx-auto h-11 w-11 justify-center px-0'
                            : 'h-11 w-full px-3'
                    "
                    @click="toggleDesktopSidebar"
                >
                    <span class="flex h-5 w-full justify-center items-center">
                        <i
                            :class="`pi ${isSidebarCollapsed ? 'pi-angle-right' : 'pi-angle-left'}`"
                        ></i>
                    </span>
                </button>
            </aside>

            <div class="min-w-0 flex-1 flex flex-col gap-2">
                <div
                    class="layout-panel layout-nav-shape flex h-14 items-center px-3 transition-motion"
                >
                    <Button
                        icon="pi pi-bars"
                        class="layout-icon-btn h-9! w-9! p-0! lg:hidden!"
                        severity="contrast"
                        variant="text"
                        @click="isMobileSidebarOpen = true"
                    />
                    <div class="ml-2 text-l font-semibold transition-motion">
                        {{ currentTitle }}
                    </div>
                    <div class="mx-2 h-full flex-1 block" :class="isMac ? '' : 'drag-region'"></div>

                    <div class="no-drag-region mr-2 flex items-center gap-1">
                        <Button
                            :icon="themeIcon"
                            class="layout-icon-btn h-8! w-8! p-0!"
                            severity="contrast"
                            variant="text"
                            :aria-label="`主题: ${themeLabel}`"
                            @click="cycleTheme"
                        />
                        <template v-if="!isMac">
                            <Button
                                icon="pi pi-minus"
                                class="layout-icon-btn h-8! w-8! p-0!"
                                severity="contrast"
                                variant="text"
                                @click="minimizeWindow"
                            />
                            <Button
                                :icon="
                                    isMaximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize'
                                "
                                class="layout-icon-btn h-8! w-8! p-0!"
                                severity="contrast"
                                variant="text"
                                @click="toggleMaximizeWindow"
                            />
                            <Button
                                icon="pi pi-times"
                                class="layout-icon-btn layout-icon-btn-danger h-8! w-8! p-0!"
                                severity="contrast"
                                variant="text"
                                @click="closeWindow"
                            />
                        </template>
                    </div>
                </div>

                <main class="min-h-0 flex-1">
                    <section class="layout-panel h-full overflow-hidden p-3 transition-motion">
                        <div class="h-full overflow-y-auto">
                            <RouterView />
                        </div>
                    </section>
                </main>
            </div>
        </div>

        <transition name="mobile-drawer-fade">
            <div
                v-if="isMobileSidebarOpen"
                class="fixed inset-0 z-40 bg-black/45 lg:hidden"
                @click="isMobileSidebarOpen = false"
            ></div>
        </transition>
        <transition name="mobile-drawer-slide">
            <aside
                v-if="isMobileSidebarOpen"
                class="layout-panel fixed left-0 top-0 z-50 flex h-full w-64 flex-col p-3 lg:hidden"
            >
                <div class="mb-3 flex h-12 items-center justify-between rounded-xl px-2">
                    <div class="flex items-center gap-3">
                        <div
                            class="grid h-9 w-9 place-items-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                        >
                            <i class="pi pi-microchip-ai text-sm"></i>
                        </div>
                        <div class="text-sm font-semibold">AI Chat Bot</div>
                    </div>
                    <Button
                        icon="pi pi-times"
                        class="layout-icon-btn h-8! w-8! p-0!"
                        severity="contrast"
                        variant="text"
                        @click="isMobileSidebarOpen = false"
                    />
                </div>
                <div class="layout-divider my-1 h-px"></div>
                <nav class="mt-3 flex flex-1 flex-col gap-2">
                    <button
                        v-for="item in navItems"
                        :key="item.path"
                        type="button"
                        class="layout-nav-shape flex h-11 w-full items-center px-3 text-sm"
                        :class="isActive(item.path) ? 'layout-nav-active' : 'layout-nav-idle'"
                        @click="goTo(item.path, true)"
                    >
                        <i :class="`pi ${item.icon}`"></i>
                        <span class="ml-3">{{ item.label }}</span>
                    </button>
                </nav>
            </aside>
        </transition>
        <Toast position="top-right" />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { $dt } from '@primeuix/themes'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/toast'
import { useTheme } from '@renderer/composables/useTheme'
import type { ThemeMode } from '@renderer/themes/myPreset'
import { LAYOUT_TOAST_KEY, type LayoutToastApi } from '@renderer/composables/useLayoutToast'

const { currentThemeMode, modeOptions, setThemeMode } = useTheme()

// 主题切换
const themeIcon = computed(() => {
    const option = modeOptions.find((o) => o.value === currentThemeMode.value)
    return option?.icon ?? 'pi pi-desktop'
})

const themeLabel = computed(() => {
    const option = modeOptions.find((o) => o.value === currentThemeMode.value)
    return option?.label ?? '系统'
})

const cycleTheme = (): void => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(currentThemeMode.value as ThemeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
}

type NavItem = {
    path: '/chat' | '/role' | '/setting'
    label: string
    icon: string
}

const navItems: NavItem[] = [
    { path: '/chat', label: '聊天', icon: 'pi-comment' },
    { path: '/role', label: '角色', icon: 'pi-user' },
    { path: '/setting', label: '设置', icon: 'pi-cog' }
]
const primaryNavItems: NavItem[] = navItems.filter((item) => item.path !== '/setting')
const settingNavItem: NavItem = navItems.find((item) => item.path === '/setting')!

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isMobileSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isMaximized = ref(false)
const platform = ref<'darwin' | 'win32' | 'linux'>('win32')

const isMac = computed(() => platform.value === 'darwin')

const layoutVars = computed<Record<string, string>>(() => ({
    '--layout-shell-bg': $dt('content.background').variable,
    '--layout-panel-bg': $dt('content.background').variable,
    '--layout-panel-border': $dt('content.border.color').variable,
    '--layout-panel-radius': $dt('content.border.radius').variable,
    '--layout-text': $dt('text.color').variable,
    '--layout-text-muted': $dt('text.muted.color').variable,
    '--layout-hover-bg': $dt('content.hover.background').variable,
    '--layout-primary': $dt('primary.color').variable,
    '--layout-primary-contrast': $dt('primary.contrast.color').variable
}))

const titleMap: Record<string, string> = {
    '/chat': '聊天',
    '/role': '角色',
    '/setting': '设置'
}

const currentTitle = computed(() => titleMap[route.path] ?? 'AI Chat Bot')

const isActive = (path: string): boolean => route.path === path

const goTo = (path: NavItem['path'], closeMobileSidebar = false): void => {
    if (route.path !== path) {
        router.push(path)
    }
    if (closeMobileSidebar) {
        isMobileSidebarOpen.value = false
    }
}

const toggleDesktopSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const minimizeWindow = async (): Promise<void> => {
    await window.api.minimize()
}

const toggleMaximizeWindow = async (): Promise<void> => {
    const result = await window.api.maximize()
    if (result.success) {
        isMaximized.value = Boolean(result.isMaximized)
        return
    }
    const maximizedState = await window.api.isMaximized()
    isMaximized.value = maximizedState.isMaximized
}

const closeWindow = async (): Promise<void> => {
    await window.api.close()
}

const syncWindowState = async (): Promise<void> => {
    const [platformResult, maximizedResult] = await Promise.all([
        window.api.getPlatform(),
        window.api.isMaximized()
    ])
    platform.value = platformResult.platform
    isMaximized.value = maximizedResult.isMaximized
}

const handleResize = (): void => {
    if (window.innerWidth >= 1024) {
        isMobileSidebarOpen.value = false
    }
}

const layoutToast: LayoutToastApi = {
    notify: (message: ToastMessageOptions): void => {
        toast.add(message)
    },
    success: (detail: string, summary = '成功', life = 2500): void => {
        toast.add({ severity: 'success', summary, detail, life })
    },
    info: (detail: string, summary = '提示', life = 2500): void => {
        toast.add({ severity: 'info', summary, detail, life })
    },
    warn: (detail: string, summary = '警告', life = 3000): void => {
        toast.add({ severity: 'warn', summary, detail, life })
    },
    error: (detail: string, summary = '错误', life = 3500): void => {
        toast.add({ severity: 'error', summary, detail, life })
    }
}

provide(LAYOUT_TOAST_KEY, layoutToast)

onMounted(async () => {
    await syncWindowState()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.layout-shell {
    background: var(--layout-shell-bg);
    color: var(--layout-text);
}

.layout-panel {
    background: var(--layout-panel-bg);
    border: 1px solid var(--layout-panel-border);
    border-radius: calc(var(--layout-panel-radius) * 2);
}

.layout-nav-shape {
    border-radius: calc(var(--layout-panel-radius) * 1.75);
}

.layout-divider {
    background: var(--layout-panel-border);
}

.layout-nav-active {
    background: var(--layout-primary);
    color: var(--layout-primary-contrast);
}

.layout-nav-idle {
    color: var(--layout-text-muted);
}

.layout-nav-idle:hover {
    background: var(--layout-hover-bg);
    color: var(--layout-text);
}

.layout-icon-btn {
    border-radius: calc(var(--layout-panel-radius) * 1.2) !important;
}

.layout-icon-btn:hover {
    background: var(--layout-hover-bg) !important;
}

.layout-icon-btn-danger:hover {
    background: #ef4444 !important;
    color: #fff !important;
}

.drag-region {
    -webkit-app-region: drag;
}

.no-drag-region {
    -webkit-app-region: no-drag;
}

.mobile-drawer-fade-enter-active,
.mobile-drawer-fade-leave-active {
    transition: opacity var(--motion-duration) var(--motion-ease);
}

.mobile-drawer-fade-enter-from,
.mobile-drawer-fade-leave-to {
    opacity: 0;
}

.mobile-drawer-slide-enter-active,
.mobile-drawer-slide-leave-active {
    transition: transform var(--motion-duration) var(--motion-ease);
}

.mobile-drawer-slide-enter-from,
.mobile-drawer-slide-leave-to {
    transform: translateX(-100%);
}
</style>
