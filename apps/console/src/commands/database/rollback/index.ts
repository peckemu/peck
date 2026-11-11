import { createDatabase } from '@peck/database'
import { Command, type Options, type PluginHost } from '@peck/plugins'

import { CORE, migrationSets } from '#console/migrations'

/**
 * Reverts migrations
 * @class
 */
export class RollbackCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'database:rollback'

  /**
   * The command description
   */
  public readonly description = "Reverts peck's or a plugin's migrations"

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    plugin: { description: 'The plugin to roll back', fallback: CORE },
    step: { description: 'How many migrations', fallback: '1' },
  }

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
   * Reverts the migrations
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const step = Number(options['step'])
    if (!Number.isSafeInteger(step) || step < 1) {
      throw new Error('Step is not a whole number')
    }

    const database = createDatabase(String(options['database']), 1)
    try {
      const name = String(options['plugin'])
      const set = migrationSets(database, this.plugins).find(
        (each) => each.name === name,
      )
      if (!set) throw new Error(`${name} has no migrations`)
      const reverted = await set.migrator.down({ step })
      console.log(`${name}: ${String(reverted.length)} reverted`)
    } finally {
      await database.end()
    }
  }
}
