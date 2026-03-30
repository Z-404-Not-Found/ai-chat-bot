import log from 'electron-log/main'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const LOG_DIR = join(app.getPath('userData'), 'user', 'logs')

function ensureLogDir(): void {
    if (!existsSync(LOG_DIR)) {
        mkdirSync(LOG_DIR, { recursive: true })
    }
}

function initLogger(): void {
    ensureLogDir()
    log.initialize()
    log.transports.file.resolvePathFn = () => join(LOG_DIR, 'main.log')
    log.transports.file.maxSize = 10 * 1024 * 1024
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
    log.transports.file.level = 'info'
    log.transports.console.level = 'debug'
    log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}'
}

initLogger()

export const logger = {
    info: (message: string, ...args: unknown[]): void => {
        log.info(message, ...args)
    },
    warn: (message: string, ...args: unknown[]): void => {
        log.warn(message, ...args)
    },
    error: (message: string, ...args: unknown[]): void => {
        log.error(message, ...args)
    },
    debug: (message: string, ...args: unknown[]): void => {
        log.debug(message, ...args)
    }
}

export default logger
