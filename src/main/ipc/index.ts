import { registerConfigIpcHandlers } from './aiConfig'
import { registerChatIpcHandlers } from './chat'

export function registerIpcHandlers(): void {
    registerConfigIpcHandlers()
    registerChatIpcHandlers()
}
