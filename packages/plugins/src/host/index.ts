import { type Seed } from '@peck/database'

import { type Command } from '#plugins/command'
import { type HandlerType } from '#plugins/handler'
import { type Middleware } from '#plugins/middleware'
import { type Plugin, type PluginContext } from '#plugins/plugin'

/**
 * A plugin's migrations
 */
export type PluginMigrations = {
  /**
   * The plugin's name
   */
  readonly plugin: string

  /**
   * The migrations folder
   */
  readonly path: string
}

/**
 * The plugin host
 * @class
 */
export class PluginHost implements Iterable<Plugin> {
  /**
   * The sorted plugins
   */
  private readonly plugins: readonly Plugin[]

  /**
   * The started plugin contexts
   */
  private readonly started = new Map<Plugin, PluginContext>()

  /**
   * Creates the host
   * @param plugins The plugins
   */
  public constructor(plugins: readonly Plugin[] = []) {
    this.plugins = PluginHost.order(plugins)
  }

  /**
   * The number of plugins
   */
  public get size(): number {
    return this.plugins.length
  }

  /**
   * Every plugin's handlers
   */
  public get handlers(): HandlerType[] {
    return this.plugins.flatMap((plugin) => plugin.handlers)
  }

  /**
   * Every plugin's middleware
   */
  public get middleware(): Middleware[] {
    return this.plugins.flatMap((plugin) => plugin.middleware)
  }

  /**
   * Every plugin's seeds
   */
  public get seeds(): Seed[] {
    return this.plugins.flatMap((plugin) => plugin.seeds)
  }

  /**
   * Every plugin's console commands
   */
  public get commands(): Command[] {
    return this.plugins.flatMap((plugin) => plugin.commands)
  }

  /**
   * Every plugin's migrations
   */
  public get migrations(): PluginMigrations[] {
    return this.plugins.flatMap((plugin) =>
      plugin.migrations === null
        ? []
        : [{ plugin: plugin.name, path: plugin.migrations }],
    )
  }

  /**
   * Sets up every plugin
   * @param context The context builder
   */
  public async start(
    context: (plugin: Plugin) => PluginContext,
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const built = context(plugin)
      await plugin.setup(built)
      this.started.set(plugin, built)
    }
  }

  /**
   * Stops every plugin
   */
  public async stop(): Promise<void> {
    for (const plugin of [...this.plugins].reverse()) {
      const context = this.started.get(plugin)
      if (!context) continue
      await plugin.stop(context)
      this.started.delete(plugin)
    }
  }

  /**
   * Iterates over the plugins
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<Plugin> {
    return this.plugins.values()
  }

  /**
   * Sorts plugins by dependency
   * @param plugins The plugins
   * @returns The plugins in order
   */
  private static order(plugins: readonly Plugin[]): Plugin[] {
    const byName = new Map<string, Plugin>()
    for (const plugin of plugins) {
      if (byName.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is loaded twice`)
      }
      byName.set(plugin.name, plugin)
    }

    const ordered: Plugin[] = []
    const visiting = new Set<string>()
    const visit = (plugin: Plugin): void => {
      if (ordered.includes(plugin)) return
      if (visiting.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} depends on itself`)
      }
      visiting.add(plugin.name)
      for (const name of plugin.dependencies) {
        const dependency = byName.get(name)
        if (!dependency) {
          throw new Error(
            `Plugin ${plugin.name} needs ${name}, which is not loaded`,
          )
        }
        visit(dependency)
      }
      visiting.delete(plugin.name)
      ordered.push(plugin)
    }
    for (const plugin of plugins) visit(plugin)
    return ordered
  }
}
