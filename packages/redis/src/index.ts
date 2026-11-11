import { RedisClient } from 'bun'

/**
 * Creates a Redis client
 * @param url The Redis connection URL
 * @returns The Redis client
 */
export const createRedis = (url: string): RedisClient => new RedisClient(url)

/**
 * @sxip todo: add some service functions for Redis operations, i think it would be useful to have functions for common tasks like setting, getting, and deleting keys, as well as handling expiration and transactions.
 * but for now, we are only providing a basic client creation function.
 * i will come back to this later with more functionality.
 */

export type { RedisClient }
