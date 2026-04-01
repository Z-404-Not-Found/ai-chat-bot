import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'

// 获取主窗口
function getMainWindow(): BrowserWindow | null {
    const windows = BrowserWindow.getAllWindows()
    return windows.length > 0 ? windows[0] : null
}

export function registerWindowIpcHandlers(): void {
    // 最小化窗口
    ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
        const win = getMainWindow()
        if (win && !win.isDestroyed()) {
            win.minimize()
            return { success: true }
        }
        return { success: false, error: '窗口不存在' }
    })

    // 最大化/还原窗口
    ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
        const win = getMainWindow()
        if (win && !win.isDestroyed()) {
            if (win.isMaximized()) {
                win.unmaximize()
            } else {
                win.maximize()
            }
            return { success: true, isMaximized: win.isMaximized() }
        }
        return { success: false, error: '窗口不存在' }
    })

    // 关闭窗口
    ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
        const win = getMainWindow()
        if (win && !win.isDestroyed()) {
            win.close()
            return { success: true }
        }
        return { success: false, error: '窗口不存在' }
    })

    // 检查窗口是否最大化
    ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
        const win = getMainWindow()
        if (win && !win.isDestroyed()) {
            return { isMaximized: win.isMaximized() }
        }
        return { isMaximized: false, error: '窗口不存在' }
    })

    // 获取当前平台
    ipcMain.handle(IPC_CHANNELS.WINDOW_GET_PLATFORM, () => {
        return { platform: process.platform as 'darwin' | 'win32' | 'linux' }
    })
}
