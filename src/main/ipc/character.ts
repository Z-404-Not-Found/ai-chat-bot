import { ipcMain } from 'electron'
import {
    createCharacter,
    getCharacterById,
    getAllCharacters,
    updateCharacter,
    deleteCharacter
} from '../database/characters'
import { IPC_CHANNELS } from '../../shared/constants'
import type { CreateCharacterInput, UpdateCharacterInput } from '../../shared/types'

export function registerCharacterIpcHandlers(): void {
    // 获取角色列表
    ipcMain.handle(IPC_CHANNELS.CHARACTER_LIST, async () => {
        return getAllCharacters()
    })

    // 获取单个角色
    ipcMain.handle(IPC_CHANNELS.CHARACTER_GET, async (_, id: string) => {
        return getCharacterById(id) ?? null
    })

    // 创建角色
    ipcMain.handle(IPC_CHANNELS.CHARACTER_CREATE, async (_, input: CreateCharacterInput) => {
        return createCharacter(input)
    })

    // 更新角色
    ipcMain.handle(
        IPC_CHANNELS.CHARACTER_UPDATE,
        async (_, id: string, input: UpdateCharacterInput) => {
            return updateCharacter(id, input) ?? null
        }
    )

    // 删除角色
    ipcMain.handle(IPC_CHANNELS.CHARACTER_DELETE, async (_, id: string) => {
        const success = deleteCharacter(id)
        return { success }
    })
}
