<template>
    <div
        class="h-full w-full overflow-hidden bg-surface-50 p-3 text-surface-900 dark:bg-surface-950 dark:text-surface-50"
    >
        <div class="flex h-full w-full gap-3">
            <aside
                class="hidden h-full rounded-2xl border border-surface-200 bg-surface-0 p-3 transition-all duration-300 lg:flex lg:flex-col dark:border-surface-800 dark:bg-surface-900"
                :class="isSidebarCollapsed ? 'w-18' : 'w-48'"
            >
                <div class="mb-3 flex h-8 items-center gap-3 rounded-xl px-2">
                    <div
                        class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    >
                        <i class="pi pi-microchip-ai text-sm"></i>
                    </div>
                    <div
                        v-if="!isSidebarCollapsed"
                        class="truncate whitespace-nowrap text-l font-semibold"
                    >
                        AI 聊天助手
                    </div>
                </div>
                <div class="my-1 h-px bg-surface-200 dark:bg-surface-800"></div>
                <nav class="mt-3 flex flex-1 flex-col gap-2">
                    <button
                        v-for="item in primaryNavItems"
                        :key="item.path"
                        type="button"
                        class="group flex items-center justify-center overflow-hidden rounded-xl text-sm transition-colors"
                        :class="[
                            isSidebarCollapsed
                                ? 'mx-auto h-11 w-11 justify-center px-0'
                                : 'h-11 w-full px-3',
                            isActive(item.path)
                                ? 'bg-primary text-primary-contrast'
                                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
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
                    class="group mt-2 flex items-center justify-center overflow-hidden rounded-xl text-sm transition-colors"
                    :class="[
                        isSidebarCollapsed
                            ? 'mx-auto h-11 w-11 justify-center px-0'
                            : 'h-11 w-full px-3',
                        isActive(settingNavItem.path)
                            ? 'bg-primary text-primary-contrast'
                            : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
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
                    class="mt-2 flex items-center rounded-xl px-3 text-sm text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
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
                    class="flex h-14 items-center rounded-xl border border-surface-200 bg-surface-0 px-3 dark:border-surface-800 dark:bg-surface-900"
                >
                    <Button
                        icon="pi pi-bars"
                        class="h-9! w-9! rounded-lg! p-0! lg:hidden!"
                        severity="contrast"
                        variant="text"
                        @click="isMobileSidebarOpen = true"
                    />
                    <div class="ml-2 text-l font-semibold">
                        {{ currentTitle }}
                    </div>
                    <div
                        class="mx-2 hidden h-full flex-1 sm:block"
                        :class="isMac ? '' : 'drag-region'"
                    ></div>
                    <div v-if="!isMac" class="no-drag-region ml-auto flex items-center gap-1">
                        <Button
                            icon="pi pi-minus"
                            class="h-8! w-8! rounded-lg! p-0! hover:bg-surface-100! dark:hover:bg-surface-800!"
                            severity="contrast"
                            variant="text"
                            @click="minimizeWindow"
                        />
                        <Button
                            :icon="isMaximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
                            class="h-8! w-8! rounded-lg! p-0! hover:bg-surface-100! dark:hover:bg-surface-800!"
                            severity="contrast"
                            variant="text"
                            @click="toggleMaximizeWindow"
                        />
                        <Button
                            icon="pi pi-times"
                            class="h-8! w-8! rounded-lg! p-0! hover:bg-red-500! hover:text-white!"
                            severity="contrast"
                            variant="text"
                            @click="closeWindow"
                        />
                    </div>
                </div>

                <main class="min-h-0 flex-1">
                    <section
                        class="h-full overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 p-3 dark:border-surface-800 dark:bg-surface-900"
                    >
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
                class="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-surface-200 bg-surface-0 p-3 lg:hidden dark:border-surface-800 dark:bg-surface-900"
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
                        class="h-8! w-8! rounded-lg! p-0!"
                        severity="contrast"
                        variant="text"
                        @click="isMobileSidebarOpen = false"
                    />
                </div>
                <div class="my-1 h-px bg-surface-200 dark:bg-surface-800"></div>
                <nav class="mt-3 flex flex-1 flex-col gap-2">
                    <button
                        v-for="item in navItems"
                        :key="item.path"
                        type="button"
                        class="flex h-11 w-full items-center rounded-xl px-3 text-sm transition-colors"
                        :class="
                            isActive(item.path)
                                ? 'bg-primary text-primary-contrast'
                                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
                        "
                        @click="goTo(item.path, true)"
                    >
                        <i :class="`pi ${item.icon}`"></i>
                        <span class="ml-3">{{ item.label }}</span>
                    </button>
                </nav>
            </aside>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

const isMobileSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isMaximized = ref(false)
const platform = ref<'darwin' | 'win32' | 'linux'>('win32')

const isMac = computed(() => platform.value === 'darwin')

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

onMounted(async () => {
    await syncWindowState()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.mobile-drawer-fade-enter-active,
.mobile-drawer-fade-leave-active {
    transition: opacity 0.2s ease;
}

.mobile-drawer-fade-enter-from,
.mobile-drawer-fade-leave-to {
    opacity: 0;
}

.mobile-drawer-slide-enter-active,
.mobile-drawer-slide-leave-active {
    transition: transform 0.2s ease;
}

.mobile-drawer-slide-enter-from,
.mobile-drawer-slide-leave-to {
    transform: translateX(-100%);
}

.drag-region {
    -webkit-app-region: drag;
}

.no-drag-region {
    -webkit-app-region: no-drag;
}
</style>
