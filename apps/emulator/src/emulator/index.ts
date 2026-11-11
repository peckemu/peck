import { type Container } from '@needle-di/core'
import { type ClusterStore } from '@peck/cluster'
import { createDatabase, type Database } from '@peck/database'
import {
  type Plugin,
  type PluginContext,
  PluginEvents,
  PluginHost,
} from '@peck/plugins'
import { createRedis, type RedisClient } from '@peck/redis'
import { type Logger } from '@peck/logger'

import { BuddyService } from '#emulator/cluster/buddies'
import { ClusterNode } from '#emulator/cluster/node'
import { JamagramMail } from '#emulator/handlers/jamagram/mail'
import { MasterpieceFrames } from '#emulator/handlers/masterpiece/frames'
import { ModerationTools } from '#emulator/handlers/moderation/tools'
import { PartyClock } from '#emulator/handlers/party/clock'
import { type Config } from '#emulator/config'
import { createContainer } from '#emulator/container'
import { Dispatcher } from '#emulator/dispatch/dispatcher'
import { type Loader, LOADERS } from '#emulator/loaders'
import { Server } from '#emulator/network/server'
import { SessionManager } from '#emulator/sessions/manager'
import { ClusterStoreToken, LoggerToken } from '#emulator/tokens'

/**
 * The emulator
 * @class
 */
export class Emulator {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Redis
   */
  private readonly redis: RedisClient

  /**
   * The plugins
   */
  private readonly plugins: PluginHost

  /**
   * The container
   */
  public readonly container: Container

  /**
   * Creates the emulator
   * @param config The emulator config
   * @param plugins The plugins to run
   */
  public constructor(config: Config, plugins: readonly Plugin[] = []) {
    this.database = createDatabase(config.databaseUrl)
    this.redis = createRedis(config.redisUrl)
    this.plugins = new PluginHost(plugins)
    this.container = createContainer({
      config,
      database: this.database,
      redis: this.redis,
      plugins: this.plugins,
    })
  }

  /**
   * Starts the emulator
   */
  public async start(): Promise<void> {
    await this.database.all`select 1`
    await this.redis.connect()
    for (const loader of LOADERS) {
      await this.container.get<Loader>(loader).load()
    }

    const dispatcher = this.container.get<Dispatcher>(Dispatcher)
    for (const middleware of this.plugins.middleware) dispatcher.use(middleware)
    await this.plugins.start((plugin) => this.context(plugin))
    this.log.info(
      { plugins: [...this.plugins].map(({ name }) => name) },
      'plugins loaded',
    )

    this.container.get<Server>(Server).start()
    const node = this.container.get<ClusterNode>(ClusterNode)
    await node.join()
    await this.container.get<BuddyService>(BuddyService).start(node.id)
    this.container.get<PartyClock>(PartyClock).start()
    await this.container.get<MasterpieceFrames>(MasterpieceFrames).start()
    await this.container.get<JamagramMail>(JamagramMail).start()
    await this.container.get<ModerationTools>(ModerationTools).start()

    await this.events.emit('start')
  }

  /**
   * Stops the emulator
   */
  public async stop(): Promise<void> {
    this.container.get<BuddyService>(BuddyService).stop()
    this.container.get<PartyClock>(PartyClock).stop()
    await this.container.get<ClusterNode>(ClusterNode).leave()
    this.container.get<Server>(Server).stop()

    await this.events.emit('stop')
    await this.plugins.stop()
    this.container.get<ClusterStore>(ClusterStoreToken).close?.()
    this.redis.close()
    await this.database.end()
  }

  /**
   * The emulator's logger
   */
  private get log(): Logger {
    return this.container.get<Logger>(LoggerToken)
  }

  /**
   * The plugin events
   */
  private get events(): PluginEvents {
    return this.container.get<PluginEvents>(PluginEvents)
  }

  /**
   * Builds a plugin's context
   * @param plugin The plugin
   * @returns The plugin context
   */
  private context(plugin: Plugin): PluginContext {
    return {
      log: this.log.child({ plugin: plugin.name }),
      events: this.events,
      sessions: this.container.get<SessionManager>(SessionManager),
      database: this.database,
      get: (token) => this.container.get(token),
    }
  }
}
