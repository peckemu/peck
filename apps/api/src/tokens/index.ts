import { InjectionToken } from '@needle-di/core'
import { type Database } from '@peck/database'
import { type Logger } from '@peck/logger'

import { type Config } from '#api/config'

/**
 * The database
 */
export const DatabaseToken = new InjectionToken<Database>('Database')

/**
 * Where to log
 */
export const LoggerToken = new InjectionToken<Logger>('Logger')

/**
 * The API config
 */
export const ConfigToken = new InjectionToken<Config>('Config')
