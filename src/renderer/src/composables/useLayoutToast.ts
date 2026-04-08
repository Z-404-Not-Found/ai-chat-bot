import { inject, type InjectionKey } from 'vue'
import type { ToastMessageOptions } from 'primevue/toast'

export interface LayoutToastApi {
    notify: (message: ToastMessageOptions) => void
    success: (detail: string, summary?: string, life?: number) => void
    info: (detail: string, summary?: string, life?: number) => void
    warn: (detail: string, summary?: string, life?: number) => void
    error: (detail: string, summary?: string, life?: number) => void
}

export const LAYOUT_TOAST_KEY: InjectionKey<LayoutToastApi> = Symbol('layout-toast')

export function useLayoutToast(): LayoutToastApi {
    const toast = inject(LAYOUT_TOAST_KEY)
    if (!toast) {
        throw new Error('Layout toast is not provided')
    }
    return toast
}
