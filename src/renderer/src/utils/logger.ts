import log from 'electron-log/renderer'

log.transports.console.level = 'debug'
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [renderer] [{level}] {text}'

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
