/**
 * PrimeVue 自定义主题预设 - Slate 配色方案
 *
 * 颜色: 简约黑白灰 (Slate)
 * 可与 Aura, Material, Lara, Nora 四种基础主题配合使用
 */

import { definePreset } from '@primeuix/themes'

export type ThemePreset = 'aura' | 'material' | 'lara' | 'nora'
export type ThemeMode = 'light' | 'dark' | 'system'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PresetLike = any

/**
 * 创建 Slate 配色的自定义预设
 * @param basePreset - 基础主题 preset (Aura, Material, Lara, Nora)
 */
export function createSlatePreset(basePreset: PresetLike): ReturnType<typeof definePreset> {
    return definePreset(basePreset, {
        semantic: {
            colorScheme: {
                light: {
                    primary: {
                        50: '{slate.50}',
                        100: '{slate.100}',
                        200: '{slate.200}',
                        300: '{slate.300}',
                        400: '{slate.400}',
                        500: '{slate.500}',
                        600: '{slate.600}',
                        700: '{slate.700}',
                        800: '{slate.800}',
                        900: '{slate.900}',
                        950: '{slate.950}',
                        color: '{slate.900}',
                        inverseColor: '#ffffff',
                        hoverColor: '{slate.800}',
                        activeColor: '{slate.950}'
                    },
                    highlight: {
                        background: '{slate.900}',
                        focusBackground: '{slate.700}',
                        color: '#ffffff',
                        focusColor: '#ffffff'
                    },
                    surface: {
                        0: '#ffffff',
                        50: '{slate.50}',
                        100: '{slate.100}',
                        200: '{slate.200}',
                        300: '{slate.300}',
                        400: '{slate.400}',
                        500: '{slate.500}',
                        600: '{slate.600}',
                        700: '{slate.700}',
                        800: '{slate.800}',
                        900: '{slate.900}',
                        950: '{slate.950}',
                        color: '{slate.500}',
                        inverseColor: '#ffffff',
                        hoverColor: '{slate.100}',
                        activeColor: '{slate.200}'
                    }
                },
                dark: {
                    primary: {
                        50: '{slate.50}',
                        100: '{slate.100}',
                        200: '{slate.200}',
                        300: '{slate.300}',
                        400: '{slate.400}',
                        500: '{slate.500}',
                        600: '{slate.600}',
                        700: '{slate.700}',
                        800: '{slate.800}',
                        900: '{slate.900}',
                        950: '{slate.950}',
                        color: '{slate.50}',
                        inverseColor: '{slate.950}',
                        hoverColor: '{slate.100}',
                        activeColor: '{slate.200}'
                    },
                    highlight: {
                        background: '{slate.100}',
                        focusBackground: '{slate.200}',
                        color: '{slate.950}',
                        focusColor: '{slate.950}'
                    },
                    surface: {
                        0: '#ffffff',
                        50: '{slate.50}',
                        100: '{slate.100}',
                        200: '{slate.200}',
                        300: '{slate.300}',
                        400: '{slate.400}',
                        500: '{slate.500}',
                        600: '{slate.600}',
                        700: '{slate.700}',
                        800: '{slate.800}',
                        900: '{slate.900}',
                        950: '{slate.950}',
                        color: '{slate.400}',
                        inverseColor: '#ffffff',
                        hoverColor: '{slate.800}',
                        activeColor: '{slate.700}'
                    }
                }
            }
        }
    })
}

// 默认导出 Aura + Slate 配色
import Aura from '@primeuix/themes/aura'
export default createSlatePreset(Aura)
