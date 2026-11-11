import pino, { type Logger as Pino } from 'pino'
import pretty from 'pino-pretty'

/**
 * A structured logger
 */
export type Logger = Pino

/**
 * How the logger writes
 */
export type LoggerOptions = {
  /**
   * The lowest level written
   */
  readonly logLevel: string

  /**
   * Whether to log readable lines
   */
  readonly logPretty: boolean
}

/**
 * Creates the logger
 * @param options How it writes
 * @returns The logger
 */
export const createLogger = (options: LoggerOptions): Logger =>
  options.logPretty
    ? pino(
        { level: options.logLevel },
        pretty({ colorize: true, translateTime: 'HH:MM:ss' }),
      )
    : pino({ level: options.logLevel })
