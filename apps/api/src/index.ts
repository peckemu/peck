import { RedisStore } from '@peck/cluster'
import { createDatabase } from '@peck/database'
import { createLogger } from '@peck/logger'
import { createRedis } from '@peck/redis'

import { createApp } from '#api/app'
import { config } from '#api/config'
import { createContainer } from '#api/container'

const logger = createLogger(config)
const database = createDatabase(config.databaseUrl)
const redis = createRedis(config.redisUrl)

await redis.connect()

const container = createContainer({
  config,
  database,
  logger,
  store: new RedisStore(redis),
})
const app = createApp(container, config.origins)

const server = Bun.serve({ port: config.port, fetch: app.fetch })
logger.info({ port: server.port }, 'listening')

/**
 * Stops the API
 */
const stop = async (): Promise<void> => {
  await server.stop()
  redis.close()
  await database.end()
  process.exit(0)
}

process.on('SIGINT', () => void stop())
process.on('SIGTERM', () => void stop())
