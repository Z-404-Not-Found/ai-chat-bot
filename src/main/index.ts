import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initUserData } from './utils/userData'
import { initDatabase } from './database'
import { registerIpcHandlers } from './ipc'

function createWindow(): void {
    // 创建浏览器窗口。
    const mainWindow = new BrowserWindow({
        width: 1080,
        height: 670,
        minWidth: 540,
        minHeight: 600,
        show: false,
        ...(process.platform === 'darwin'
            ? {
                  titleBarStyle: 'hiddenInset'
              }
            : {
                  frame: false
              }),
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // 基于 electron-vite cli 的 HMR（热模块替换）。
    // 开发时加载远程 URL，生产环境加载本地 html 文件。
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// 当 Electron 完成初始化并准备好创建浏览器窗口时，会调用此方法。
// 某些 API 只能在此事件发生后才能使用。
app.whenReady().then(() => {
    // 为 Windows 设置应用用户模型 ID
    electronApp.setAppUserModelId('com.electron')

    // 初始化用户目录和数据
    initUserData()
    // 初始化数据库
    initDatabase()

    // 注册 IPC handlers
    registerIpcHandlers()

    // 开发环境下默认按 F12 打开或关闭 DevTools，
    // 生产环境下忽略 CommandOrControl + R 快捷键。
    // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
        // 在 macOS 上，当点击 Dock 图标且没有其他窗口打开时，
        // 应用程序通常会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 当所有窗口关闭时退出应用程序，但在 macOS 上除外。
// 在 macOS 上，应用程序及其菜单栏通常会保持活跃状态，
// 直到用户主动使用 Cmd + Q 退出应用。
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 在此文件中可以包含应用特定的其他主进程代码。
// 也可以将它们放在单独的文件中，然后在此处引入。
