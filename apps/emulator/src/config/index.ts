import { join } from 'node:path'

import { DEFAULT_LIMITS, type Limits } from '#emulator/limits'

/**
 * Reads a required environment variable
 * @param key The name of the variable
 * @returns Its value
 */
const required = (key: string): string => {
  const value = Bun.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

/**
 * Reads a whole number from the environment
 * @param key The name of the variable
 * @param fallback The default
 * @returns The number
 */
const integer = (key: string, fallback: number): number => {
  const value = Number(Bun.env[key] ?? fallback)
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${key} is not a whole number`)
  }
  return value
}

/**
 * The emulator config
 */
export const config = {
  host: Bun.env['HOST'] ?? '0.0.0.0',
  port: integer('PORT', 443),
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  logLevel: Bun.env['LOG_LEVEL'] ?? 'info',
  logPretty:
    (Bun.env['LOG_PRETTY'] ?? String(Bun.env.NODE_ENV !== 'production')) ===
    'true',
  node: {
    id: Bun.env['NODE_ID'] ? integer('NODE_ID', 0) : null,
    name: Bun.env['NODE_NAME'] ?? null,
    host: Bun.env['PUBLIC_HOST'] ?? '127.0.0.1',
    port: integer('PUBLIC_PORT', integer('PORT', 443)),
    capacity: integer('NODE_CAPACITY', DEFAULT_LIMITS.maxConnections),
    version: Bun.env['PECK_VERSION'] ?? 'dev',
  },
  startRoom: Bun.env['START_ROOM'] ?? 'jamaa_township.room_main',
  plugins: {
    directory:
      Bun.env['PLUGINS_DIR'] ?? join(import.meta.dir, '../../../../plugins'),
    enabled: Bun.env['PLUGINS']
      ? Bun.env['PLUGINS'].split(',').map((name) => name.trim())
      : null,
  },
  limits: {
    maxFrameBytes: integer('MAX_FRAME_BYTES', DEFAULT_LIMITS.maxFrameBytes),
    maxConnections: integer('MAX_CONNECTIONS', DEFAULT_LIMITS.maxConnections),
    maxConnectionsPerAddress: integer(
      'MAX_CONNECTIONS_PER_ADDRESS',
      DEFAULT_LIMITS.maxConnectionsPerAddress,
    ),
    packetRate: integer('PACKET_RATE', DEFAULT_LIMITS.packetRate),
    packetBurst: integer('PACKET_BURST', DEFAULT_LIMITS.packetBurst),
    maxQueuedChunks: integer(
      'MAX_QUEUED_CHUNKS',
      DEFAULT_LIMITS.maxQueuedChunks,
    ),
    maxRefused: integer('MAX_REFUSED', DEFAULT_LIMITS.maxRefused),
    loginTimeoutMs: integer('LOGIN_TIMEOUT_MS', DEFAULT_LIMITS.loginTimeoutMs),
  } satisfies Limits,
}

/**
 * The shape of the emulator config
 */
export type Config = typeof config
