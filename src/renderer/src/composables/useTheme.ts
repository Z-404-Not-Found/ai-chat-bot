/**
 * 主题管理 Store
 * 支持 Aura, Material, Lara, Nora 四种内置主题切换
 * 支持 Light / Dark / System 三种颜色模式
 * 统一使用 Slate 配色方案
 */

import { ref, onMounted } from 'vue'
import { usePreset } from '@primeuix/themes'
import type { ThemePreset, ThemeMode } from '@renderer/themes/myPreset'
import { createSlatePreset } from '@renderer/themes/myPreset'

// 动态导入各主题
import Aura from '@primeuix/themes/aura'
import Material from '@primeuix/themes/material'
import Lara from '@primeuix/themes/lara'
import Nora from '@primeuix/themes/nora'

// 主题映射
const PRESETS: Record<ThemePreset, unknown> = {
    aura: Aura,
    material: Material,
    lara: Lara,
    nora: Nora
}

// 主题配置
interface ThemeConfig {
    preset: ThemePreset
    mode: ThemeMode
}

interface UseThemeReturn {
    currentPreset: ReturnType<typeof ref<ThemePreset>>
    currentThemeMode: ReturnType<typeof ref<ThemeMode>>
    presetOptions: { label: string; value: ThemePreset }[]
    modeOptions: { label: string; value: ThemeMode; icon: string }[]
    setPreset: (preset: ThemePreset) => void
    setThemeMode: (mode: ThemeMode) => void
}

export function useTheme(): UseThemeReturn {
    const currentPreset = ref<ThemePreset>('aura')
    const currentThemeMode = ref<ThemeMode>('light')
    const isDark = ref(false)

    // 媒体查询引用
    let mediaQuery: MediaQueryList | null = null

    const presetOptions = [
        { label: 'Aura', value: 'aura' as ThemePreset },
        { label: 'Material', value: 'material' as ThemePreset },
        { label: 'Lara', value: 'lara' as ThemePreset },
        { label: 'Nora', value: 'nora' as ThemePreset }
    ]

    const modeOptions = [
        { label: '白天', value: 'light' as ThemeMode, icon: 'pi pi-sun' },
        { label: '黑暗', value: 'dark' as ThemeMode, icon: 'pi pi-moon' },
        { label: '系统', value: 'system' as ThemeMode, icon: 'pi pi-desktop' }
    ]

    // 获取系统是否黑暗
    function getSystemIsDark(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 应用主题到 DOM
    function applyTheme(): void {
        const root = document.documentElement
        if (isDark.value) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }

    // 根据 mode 更新 isDark
    function updateIsDark(): void {
        if (currentThemeMode.value === 'system') {
            isDark.value = getSystemIsDark()
        } else {
            isDark.value = currentThemeMode.value === 'dark'
        }
        applyTheme()
    }

    // 应用 preset 到 PrimeVue
    function applyPreset(): void {
        const preset = createSlatePreset(PRESETS[currentPreset.value])
        usePreset(preset)
    }

    // 设置主题 preset
    function setPreset(preset: ThemePreset): void {
        currentPreset.value = preset
        savePreference()
        applyPreset()
    }

    // 设置颜色模式
    function setThemeMode(mode: ThemeMode): void {
        currentThemeMode.value = mode
        savePreference()
        updateIsDark()
    }

    // 保存偏好到 localStorage
    function savePreference(): void {
        const config: ThemeConfig = {
            preset: currentPreset.value,
            mode: currentThemeMode.value
        }
        localStorage.setItem('themeConfig', JSON.stringify(config))
    }

    // 恢复偏好
    function loadPreference(): void {
        const saved = localStorage.getItem('themeConfig')
        if (saved) {
            try {
                const config: ThemeConfig = JSON.parse(saved)
                if (config.preset && PRESETS[config.preset]) {
                    currentPreset.value = config.preset
                }
                if (config.mode) {
                    currentThemeMode.value = config.mode
                }
            } catch {
                // ignore
            }
        }
        updateIsDark()
        applyPreset()
    }

    // 监听系统主题变化
    function setupSystemThemeListener(): void {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
            if (currentThemeMode.value === 'system') {
                updateIsDark()
            }
        })
    }

    // 初始化
    onMounted(() => {
        loadPreference()
        setupSystemThemeListener()
    })

    return {
        currentPreset,
        currentThemeMode,
        presetOptions,
        modeOptions,
        setPreset,
        setThemeMode
    }
}
