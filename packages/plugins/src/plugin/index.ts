import { type Token } from '@needle-di/core'
import { type Database, type Seed } from '@peck/database'
import { type Logger } from '@peck/logger'

import { type Command } from '#plugins/command'
import { type PacketSessions } from '#plugins/context'
import { type PluginEvents } from '#plugins/events'
import { type HandlerType } from '#plugins/handler'
import { type Middleware } from '#plugins/middleware'

/**
 * A plugin context
 */
export type PluginContext = {
  /**
   * The plugin's logger
   */
  readonly log: Logger

  /**
   * The plugin events
   */
  readonly events: PluginEvents

  /**
   * Every open session
   */
  readonly sessions: PacketSessions

  /**
   * The database
   */
  readonly database: Database

  /**
   * Gets from the container
   * @param token The token
   */
  get<T>(token: Token<T>): T
}

/**
 * A plugin
 * @class
 */
export abstract class Plugin {
  /**
   * The plugin's name
   */
  public abstract readonly name: string

  /**
   * The plugin's version
   */
  public abstract readonly version: string

  /**
   * The plugins it depends on
   */
  public readonly dependencies: readonly string[] = []

  /**
   * The migrations folder
   */
  public readonly migrations: string | null = null

  /**
   * Its seeds
   */
  public readonly seeds: readonly Seed[] = []

  /**
   * Its packet handlers
   */
  public readonly handlers: readonly HandlerType[] = []

  /**
   * Its middleware
   */
  public readonly middleware: readonly Middleware[] = []

  /**
   * Its console commands
   */
  public readonly commands: readonly Command[] = []

  /**
   * Sets up the plugin
   * @param _context The plugin context
   */
  public setup(_context: PluginContext): void | Promise<void> {
    return
  }

  /**
   * Stops the plugin
   * @param _context The plugin context
   */
  public stop(_context: PluginContext): void | Promise<void> {
    return
  }
}
