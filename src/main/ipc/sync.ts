import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import type { SyncAuthInput } from '../../shared/types'
import { getSyncStatus, runSync, syncLogin, syncLogout, syncRegister } from '../services/sync'

export function registerSyncIpcHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.SYNC_AUTH_REGISTER, async (_, input: SyncAuthInput) => {
        return syncRegister(input)
    })

    ipcMain.handle(IPC_CHANNELS.SYNC_AUTH_LOGIN, async (_, input: SyncAuthInput) => {
        return syncLogin(input)
    })

    ipcMain.handle(IPC_CHANNELS.SYNC_AUTH_LOGOUT, async () => {
        return syncLogout()
    })

    ipcMain.handle(IPC_CHANNELS.SYNC_STATUS_GET, async () => {
        return getSyncStatus()
    })

    ipcMain.handle(IPC_CHANNELS.SYNC_RUN, async () => {
        return runSync()
    })
}
