import { Command, type PluginHost } from '@peck/plugins'

/**
 * Lists the plugins
 * @class
 */
export class PluginsListCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'plugins:list'

  /**
   * The command description
   */
  public readonly description = 'Lists the plugins and what they add'

  /**
   * The plugins
   */
  private readonly plugins: PluginHost

  /**
   * Creates the command
   * @param plugins The plugins
   */
  public constructor(plugins: PluginHost) {
    super()
    this.plugins = plugins
  }

  /**
   * Prints the plugins
   */
  public run(): Promise<void> {
    if (this.plugins.size === 0) console.log('No plugins')
    for (const plugin of this.plugins) {
      const adds = [
        `${String(plugin.handlers.length)} handlers`,
        `${String(plugin.seeds.length)} seeds`,
        `${String(plugin.commands.length)} commands`,
        plugin.migrations === null ? 'no migrations' : 'migrations',
      ]
      console.log(`${plugin.name} ${plugin.version}  ${adds.join(', ')}`)
    }
    return Promise.resolve()
  }
}
