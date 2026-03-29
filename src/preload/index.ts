import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 渲染进程的自定义 API
const api = {}

// 如果启用了上下文隔离，则使用 `contextBridge` API 向
// 渲染进程暴露 Electron API，否则直接添加到 DOM 全局对象。
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
