import { registerConfigIpcHandlers } from './aiConfig'
import { registerChatIpcHandlers } from './chat'
import { registerCharacterIpcHandlers } from './character'
import { registerConversationIpcHandlers } from './conversation'
import { registerMessageIpcHandlers } from './message'
import { registerSyncIpcHandlers } from './sync'
import { registerWindowIpcHandlers } from './window'

export function registerIpcHandlers(): void {
    registerConfigIpcHandlers()
    registerChatIpcHandlers()
    registerCharacterIpcHandlers()
    registerConversationIpcHandlers()
    registerMessageIpcHandlers()
    registerSyncIpcHandlers()
    registerWindowIpcHandlers()
}
