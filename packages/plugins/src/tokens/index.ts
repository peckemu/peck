import { InjectionToken } from '@needle-di/core'
import { type Database } from '@peck/database'
import { type RedisClient } from '@peck/redis'
import { type Logger } from '@peck/logger'

/**
 * The database
 */
export const DatabaseToken = new InjectionToken<Database>('Database')

/**
 * The Redis client
 */
export const RedisToken = new InjectionToken<RedisClient>('Redis')

/**
 * Where to log
 */
export const LoggerToken = new InjectionToken<Logger>('Logger')
